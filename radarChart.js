export function drawRadarChart({ data, elementId, size = 400 }) {
  const svg = d3.select(`#${elementId}`);
  svg.selectAll('*').remove();

  const width = size;
  const height = size;
  const radius = Math.min(width, height) / 2 - 60;
  const center = { x: width / 2, y: height / 2 };

  if (!data.length) return;

  const features = Object.keys(data[0]).filter(k => k !== "name");
  const angleSlice = (2 * Math.PI) / features.length;
  const scale = d3.scaleLinear().domain([-3, 3]).range([0, radius]);
  const color = d3.scaleOrdinal(d3.schemeCategory10);

  // Background circle
  svg.append("circle")
    .attr("cx", center.x)
    .attr("cy", center.y)
    .attr("r", radius)
    .attr("fill", "#f9f9f9");

  // Chart title
  svg.append("text")
    .attr("x", center.x)
    .attr("y", 24)
    .attr("text-anchor", "middle")
    .style("font-size", "16px")
    .style("font-weight", "bold")
    .text("Bank Performance Radar");

  // Standard deviation rings
  const levelsToDraw = [-1, 0, 1];
  const levelColors = { '-1': '#ff9999', '0': '#cccccc', '1': '#99ccff' };
  levelsToDraw.forEach(level => {
    const circle = svg.append("circle")
      .attr("cx", center.x)
      .attr("cy", center.y)
      .attr("r", scale(level))
      .attr("stroke", levelColors[level])
      .attr("fill", "none")
      .attr("stroke-width", level === 0 ? 2 : 1);
    if (level === 0) circle.attr("stroke-dasharray", "2,2");
  });

  // Axes and labels
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
      .attr("x", center.x + (radius + 10) * Math.cos(angle))
      .attr("y", center.y + (radius + 10) * Math.sin(angle))
      .attr("dy", "0.35em")
      .attr("text-anchor", Math.cos(angle) < 0 ? "end" : "start")
      .style("font-size", "11px")
      .text(feature);
  });

  // Radar lines
  const lineGen = d3.lineRadial()
    .angle((d, i) => i * angleSlice)
    .radius(d => scale(d.value))
    .curve(d3.curveLinearClosed);

  data.forEach((bank, i) => {
    const values = features.map(f => ({ axis: f, value: bank[f] }));

    svg.append("path")
      .attr("transform", `translate(${center.x},${center.y})`)
      .attr("d", lineGen(values))
      .attr("stroke", color(i))
      .attr("fill", color(i))
      .attr("fill-opacity", 0.2)
      .attr("stroke-width", 2)
      // Optional interactivity:
      // .on("mouseover", () => { /* highlight */ })
      // .on("mouseout", () => { /* reset */ });
  });

  // Legend
  data.forEach((bank, i) => {
    svg.append("text")
      .attr("x", width - 150)
      .attr("y", 40 + i * 16)
      .attr("fill", color(i))
      .style("font-size", "12px")
      .text(bank.name);
  });
}
