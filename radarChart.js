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

  // Compute dynamic domain
  const allValues = data.flatMap(d => features.map(f => d[f]));
  const scale = d3.scaleLinear()
    .domain(d3.extent(allValues))
    .range([0, radius]);

  const color = d3.scaleOrdinal(d3.schemeTableau10);

  // Background circle
  g.append("circle")
    .attr("r", radius)
    .attr("fill", "#f9f9f9");

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
      .attr("stroke-width
