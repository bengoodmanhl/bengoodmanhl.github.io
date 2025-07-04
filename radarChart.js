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
        .attr("y1", 0)
        .attr("x2", x)
        .attr("y2", y)
        .attr("stroke", "#aaa");

      g.append("text")
        .attr("x", (radius + 12) * Math.cos(angle))
        .attr("y", (radius + 12) * Math.sin(angle))
        .attr("dy", "0.35em")
        .attr("text-anchor", () => {
          if (Math.abs(Math.cos(angle)) < 0.1) return "middle";
          return Math.cos(angle) < 0 ? "end" : "start";
        })
        .style("font-size", "11px")
        .text(feature);
    });
  }

  const features = Object.keys(data[0]).filter(k => k !== "name");
  const angleSlice = (2 * Math.PI) / features.length;
  const scale = d3.scaleLinear().domain([-3, 3]).range([0, radius]);
  const color = d3.scaleOrdinal(d3.schemeTableau10);

  const lineGen = d3.lineRadial()
    .angle((d, i) => i * angleSlice)
    .radius(d => scale(d.value))
    .curve(d3.curveCardinalClosed);

  const radarGroup = g.selectAll(".radar-area")
    .data(data, d => d.name);

  // Update existing paths
  radarGroup.select("path")
    .filter(d => d.name !== changedBank)
    .attr("d", d => lineGen(features.map(f => ({ axis: f, value: d[f] }))));

  // Add or update changed path
  const changedData = data.find(d => d.name === changedBank);
  if (changedData) {
    const values = features.map(f => ({ axis: f, value: changedData[f] }));
    const existing = radarGroup.filter(d => d.name === changedBank);

    if (!existing.empty()) {
      existing.select("path")
        .transition()
        .duration(800)
        .attr("d", lineGen(values));
    } else {
      const newGroup = g.append("g")
        .datum(changedData)
        .attr("class", "radar-area");

      newGroup.append("path")
        .attr("d", lineGen(values))
        .attr("stroke", color(data.indexOf(changedData)))
        .attr("fill", color(data.indexOf(changedData)))
        .attr("fill-opacity", 0.2)
        .attr("stroke-width", 2)
        .style("opacity", 0)
        .transition()
        .duration(800)
        .style("opacity", 1);
    }
  }

  // Legend
  svg.selectAll("g.legend").remove();
  const legend = svg.append("g")
    .attr("class", "legend")
    .attr("transform", `translate(20, ${viewBoxSize - 20 - data.length * 18})`);

  data.forEach((bank, i) => {
    const legendItem = legend.append("g")
      .attr("transform", `translate(0, ${i * 18})`)
      .style("cursor", "pointer");

    legendItem.append("rect")
      .attr("width", 12)
      .attr("height", 12)
      .attr("fill", color(i));

    legendItem.append("text")
      .attr("x", 18)
      .attr("y", 10)
      .style("font-size", "12px")
      .text(bank.name);
  });
}
