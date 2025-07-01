// Radar.js


export function drawRadarChart({ data, elementId, size = 500 }) {
  if (!data || data.length === 0) return;

  const svg = d3.select(`#${elementId}`);
  svg.selectAll("*").remove(); // Clear existing content

  const width = size;
  const height = size;
  const radius = Math.min(width, height) / 2 - 60;
  const center = { x: width / 2, y: height / 2 };

  const features = Object.keys(data[0]).filter(k => k !== "name");
  const angleSlice = (2 * Math.PI) / features.length;

  const scale = d3.scaleLinear().domain([-3, 3]).range([0, radius]);

  // Create radial grid lines
  const levels = 5;
  const levelFactor = radius / levels;

  for (let level = 1; level <= levels; level++) {
    const r = level * levelFactor;
    svg.append("circle")
      .attr("cx", center.x)
      .attr("cy", center.y)
      .attr("r", r)
      .attr("stroke", "#ddd")
      .attr("fill", "none");
  }

  // Axes & labels
  features.forEach((feature, i) => {
    const angle = angleSlice * i - Math.PI / 2;
    const x = center.x + radius * Math.cos(angle);
    const y = center.y + radius * Math.sin(angle);

    svg.append("line")
      .attr("x1", center.x)
      .attr("y1", center.y)
      .attr("x2", x)
      .attr("y2", y)
      .attr("stroke", "#999");

    svg.append("text")
      .attr("x", x)
      .attr("y", y)
      .attr("dy", "0.35em")
      .attr("text-anchor", x < center.x ? "end" : "start")
      .style("font-size", "11px")
      .text(feature);
  });

  // Line generator
  const radarLine = d3.lineRadial()
    .angle((d, i) => i * angleSlice)
    .radius(d => scale(d.value))
    .curve(d3.curveLinearClosed);

  const color = d3.scaleOrdinal(d3.schemeCategory10);

  data.forEach((bank, idx) => {
    const points = features.map(f => ({ axis: f, value: bank[f] }));

    svg.append("path")
      .attr("transform", `translate(${center.x},${center.y})`)
      .attr("d", radarLine(points))
      .attr("stroke", color(idx))
      .attr("fill", color(idx))
      .attr("fill-opacity", 0.2)
      .attr("stroke-width", 2);

    svg.append("text")
      .attr("x", width - 100)
      .attr("y", 20 + idx * 15)
      .attr("fill", color(idx))
      .style("font-size", "12px")
      .text(bank.name);
  });
}
