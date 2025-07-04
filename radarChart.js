export function drawRadarChartIncremental({ data, elementId, size = 500, changedBank }) {
  const svg = d3.select(`#${elementId}`);
  svg.selectAll("text.chart-title").remove(); // Remove old title if redrawing

  const margin = 80;
  const viewBoxSize = size;
  const radius = (viewBoxSize / 2) - margin;
  const center = { x: viewBoxSize / 2, y: viewBoxSize / 2 };

  svg.attr("viewBox", `0 0 ${viewBoxSize} ${viewBoxSize}`);

  if (!data.length) {
    svg.selectAll("*").remove();
    return;
  }

  let g = svg.select("g.chart-group");
  if (g.empty()) {
    g = svg.append("g")
      .attr("class", "chart-group")
      .attr("transform", `translate(${center.x}, ${center.y})`);

    // Chart title
    svg.append("text")
      .attr("class", "chart-title")
      .attr("x", center.x)
      .attr("y", 30)
      .attr("text-anchor", "middle")
      .style("font-size", "16px")
      .style("font-weight", "bold")
      .text("Bank Performance Radar");

    // Axes and rings
    const features = Object.keys(data[0]).filter(k => k !== "name");
    const angleSlice = (2 * Math.PI) / features.length;
    const scale = d3.scaleLinear().domain([-3, 3]).range([0, radius]);
    const levelColors = { '-1': '#ff9999', '0': '#cccccc', '1': '#99ccff' };

    [-1, 0, 1].forEach(level => {
      const circle = g.append("circle")
        .attr("r", scale(level))
        .attr("stroke", levelColors[level])
        .attr("fill", "none")
        .attr("stroke-width", level === 0 ? 2 : 1);
      if (level === 0) circle.attr("stroke-dasharray", "2,2");
    });

    features.forEach((feature, i) => {
      const angle = angleSlice * i - Math.PI / 2;
      const x = radius * Math.cos(angle);
      const y = radius * Math.sin(angle);

      g.append("line")
        .attr("x1", 0)
        .attr("y
