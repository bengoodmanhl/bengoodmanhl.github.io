//Create a wrapper for the blobs
var blobWrapper = g.selectAll(".radarWrapper")
  .data(data)
  .enter().append("g")
  .attr("class", "radarWrapper");

// Append the backgrounds with transitions
blobWrapper.append("path")
  .attr("class", "radarArea")
  .attr("d", radarLine)
  .style("fill", (d, i) => cfg.color(i))
  .style("fill-opacity", 0)
  .transition()
  .duration(800)
  .style("fill-opacity", cfg.opacityArea);

// Append the outlines with transitions
blobWrapper.append("path")
  .attr("class", "radarStroke")
  .attr("d", radarLine)
  .style("stroke-width", cfg.strokeWidth + "px")
  .style("stroke", (d, i) => cfg.color(i))
  .style("fill", "none")
  .style("stroke-opacity", 0)
  .style("filter", "url(#glow)")
  .transition()
  .duration(800)
  .style("stroke-opacity", 1);

// Animate radar circles
blobWrapper.selectAll(".radarCircle")
  .data(d => d)
  .enter().append("circle")
  .attr("class", "radarCircle")
  .attr("r", 0)
  .attr("cx", 0)
  .attr("cy", 0)
  .style("fill", (d, i, j) => cfg.color(j))
  .style("fill-opacity", 0.8)
  .transition()
  .duration(800)
  .attr("r", cfg.dotRadius)
  .attr("cx", (d, i) => rScale(d.value) * Math.cos(angleSlice * i - Math.PI / 2))
  .attr("cy", (d, i) => rScale(d.value) * Math.sin(angleSlice * i - Math.PI / 2));

window.RadarChart = RadarChart;
