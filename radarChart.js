export function drawRadarChart({ data, elementId, size = 500 }) {
  const svg = d3.select(`#${elementId}`);
  svg.selectAll('*').remove();

  const width = size;
  const height = size;
  const radius = Math.min(width, height) / 2 - 60;
  const center = { x: width / 2, y: height / 2 };
  const features = Object.keys(data[0]).filter(k => k !== "name");
  const angleSlice = (2 * Math.PI) / features.length;
  const scale = d3.scaleLinear().domain([-3, 3]).range([0, radius]);

// 3 circles standard deviation
const levelsToDraw = [-1, 0, 1];
const levelColors = { '-1': '#ff9999', '0': '#cccccc', '1': '#99ccff' };
levelsToDraw.forEach(level => {
  svg.append("circle")
    .attr("cx", center.x)
    .attr("cy", center.y)
    .attr("r", scale(level))
    .attr("stroke", levelColors[level])
    .attr("fill", "none")
    .attr("stroke-width", level === 0 ? 2 : 1)
    .attr("stroke-dasharray", level === 0 ? "2,2" : null);
});

  // Axes
  features.forEach((feature, i) => {
    const angle = angleSlice * i - Math.PI / 2;
    const x = center.x + radius * Math.cos(angle);
    const y = center.y + radius * Math.sin(angle);

    svg.append("line")
      .attr("x1", center.x)
      .attr("y1", center.y)
      .attr("x2", x)
      .attr("y2", y)
      .attr("stroke", "#aaa");

    svg.append("text")
      .attr("x", x)
      .attr("y", y)
      .attr("dy", "0.35em")
      .attr("text-anchor", x < center.x ? "end" : "start")
      .style("font-size", "11px")
      .text(feature);
  });

  const color = d3.scaleOrdinal(d3.schemeCategory10);
  const lineGen = d3.lineRadial()
    .angle((d, i) => i * angleSlice)
    .radius(d => scale(d.value))
    .curve(d3.curveCardinalClosed);

  data.forEach((bank, i) => {
    const values = features.map(f => ({ axis: f, value: bank[f] }));
    svg.append("path")
      .attr("transform", `translate(${center.x},${center.y})`)
      .attr("d", lineGen(values))
      .attr("stroke", color(i))
      .attr("fill", color(i))
      .attr("fill-opacity", 0.2)
      .attr("stroke-width", 2);

    svg.append("text")
      .attr("x", width - 150)
      .attr("y", 20 + i * 14)
      .attr("fill", color(i))
      .style("font-size", "12px")
      .text(bank.name);
  });
}
