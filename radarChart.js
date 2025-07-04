export function drawRadarChart({ data, elementId, size = 500 }) {
  const svg = d3.select(`#${elementId}`);
  svg.selectAll('*').remove();

  const margin = 80;
  const viewBoxSize = size;
  const radius = (viewBoxSize / 2) - margin;
  const center = { x: viewBoxSize / 2, y: viewBoxSize / 2 };

  svg.attr("viewBox", `0 0 ${viewBoxSize} ${viewBoxSize}`);

  if (!data.length) return;

  const g = svg.append("g").attr("transform", `translate(${center.x}, ${center.y})`);

  const features = Object.keys(data[0]).filter(k => k !== "name");
  const angleSlice = (2 * Math.PI) / features.length;
  const scale = d3.scaleLinear().domain([-3, 3]).range([0, radius]); 
    const color = d3.scaleOrdinal(d3.schemeTableau10);



  // Chart title
  svg.append("text")
    .attr("x", center.x)
    .attr("y", 30)
    .attr("text-anchor", "middle")
    .style("font-size", "16px")
    .style("font-weight", "bold")
    .text("Bank Performance Radar");

  // Standard deviation rings (optional: based on fixed values)
  const levelsToDraw = [-1, 0, 1];
  const levelColors = { '-1': '#ff9999', '0': '#cccccc', '1': '#99ccff' };
  levelsToDraw.forEach(level => {
    const circle = g.append("circle")
      .attr("r", scale(level))
      .attr("stroke", levelColors[level])
      .attr("fill", "none")
      .attr("stroke-width", level === 0 ? 2 : 1);
    if (level === 0) circle.attr("stroke-dasharray", "2,2");
  });

  // Axes and labels
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

  // Radar line generator
  const lineGen = d3.lineRadial()
    .angle((d, i) => i * angleSlice)
    .radius(d => scale(d.value))
    .curve(d3.curveLinearClosed);

  // Tooltip
  const tooltip = d3.select("body").append("div")
    .attr("class", "radar-tooltip")
    .style("position", "absolute")
    .style("padding", "6px 10px")
    .style("background", "#333")
    .style("color", "#fff")
    .style("border-radius", "4px")
    .style("font-size", "12px")
    .style("pointer-events", "none")
    .style("opacity", 0);

  // Radar areas
  const radarGroups = g.selectAll(".radar-area")
    .data(data)
    .enter()
    .append("g")
    .attr("class", "radar-area");

  radarGroups.append("path")
    .attr("d", d => {
      const values = features.map(f => ({ axis: f, value: d[f] }));
      return lineGen(values);
    })
    .attr("stroke", (d, i) => color(i))
    .attr("fill", (d, i) => color(i))
    .attr("fill-opacity", 0.2)
    .attr("stroke-width", 2)
    .on("mouseover", function (event, d) {
      d3.select(this).attr("fill-opacity", 0.4);
      tooltip.transition().duration(200).style("opacity", 1);
      tooltip.html(`<strong>${d.name}</strong>`)
        .style("left", `${event.pageX + 10}px`)
        .style("top", `${event.pageY - 20}px`);
    })
    .on("mousemove", function (event) {
      tooltip.style("left", `${event.pageX + 10}px`)
             .style("top", `${event.pageY - 20}px`);
    })
    .on("mouseout", function () {
      d3.select(this).attr("fill-opacity", 0.2);
      tooltip.transition().duration(200).style("opacity", 0);
    });

  // Legend
  const legend = svg.append("g").attr("transform", `translate(20, ${viewBoxSize - 20 - data.length * 18})`);

  data.forEach((bank, i) => {
    const legendItem = legend.append("g")
      .attr("transform", `translate(0, ${i * 18})`)
      .style("cursor", "pointer")
      .on("mouseover", () => {
        radarGroups.selectAll("path")
          .attr("fill-opacity", (d, j) => j === i ? 0.4 : 0.1);
      })
      .on("mouseout", () => {
        radarGroups.selectAll("path").attr("fill-opacity", 0.2);
      });

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
