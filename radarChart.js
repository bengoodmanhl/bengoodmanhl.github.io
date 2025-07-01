function drawChart(data) {
  const existingData = new Set(container.selectAll(".series").data().map(d => d.name));
  const newData = new Set(data.map(d => d.name));

  const angleSlice = (2 * Math.PI) / dimensions.length;

  function getScaledRadius(dim, val) {
    return d3.scaleLinear()
      .domain(extentByDimension[dim])
      .range([0, 0.9 * radius])(Math.max(0.1, val));
  }

  // Update Axis (clears and redraws once)
  container.selectAll(".axisLabel").remove();
  dimensions.forEach((dim, i) => {
    const angle = angleSlice * i - Math.PI / 2;
    container.append("text")
      .attr("class", "axisLabel")
      .attr("x", Math.cos(angle) * (radius + 20))
      .attr("y", Math.sin(angle) * (radius + 20))
      .text(dim);
  });

  // Update Radar Paths
  const group = container.selectAll(".series")
    .data(data, d => d.name);

  group.exit()
    .transition().duration(500)
    .style("opacity", 0)
    .remove();

  const groupEnter = group.enter()
    .append("g")
    .attr("class", "series")
    .style("opacity", 0)
    .transition()
    .duration(500)
    .style("opacity", 1)
    .selection();

  const radarLine = d3.lineRadial()
    .radius(d => d.radius)
    .angle((d, i) => i * angleSlice)
    .curve(d3.curveCardinalClosed.tension(0.4));

  // Add Paths
  groupEnter.append("path")
    .attr("class", "line")
    .attr("d", d => {
      const points = dimensions.map(dim => ({
        radius: getScaledRadius(dim, d[dim])
      }));
      return radarLine(points);
    })
    .attr("stroke", d => color(d.name))
    .attr("fill", d => color(d.name))
    .attr("fill-opacity", 0.1)
    .attr("stroke-width", 2)
    .attr("stroke-dasharray", function() {
      const length = this.getTotalLength();
      return `${length} ${length}`;
    })
    .attr("stroke-dashoffset", function() {
      return this.getTotalLength();
    })
    .transition()
    .duration(1000)
    .attr("stroke-dashoffset", 0);

  // Add Circles to New Series
  groupEnter.each(function(d) {
    const series = d3.select(this);
    const circles = dimensions.map((dim, i) => {
      const angle = angleSlice * i - Math.PI / 2;
      const r = getScaledRadius(dim, d[dim]);
      return { x: Math.cos(angle) * r, y: Math.sin(angle) * r, color: color(d.name) };
    });

    series.selectAll(".circle")
      .data(circles)
      .enter()
      .append("circle")
      .attr("class", "circle")
      .attr("r", 0)
      .attr("cx", d => d.x)
      .attr("cy", d => d.y)
      .attr("fill", d => d.color)
      .transition()
      .delay((d, i) => i * 100)
      .duration(400)
      .attr("r", 3);
  });

  // Tooltips and Hover Events
  container.selectAll(".line")
    .on("mouseover", function(event, d) {
      container.selectAll(".series").transition().duration(200).style("opacity", 0.1);
      d3.select(this.parentNode).transition().duration(200).style("opacity", 1);
      tooltip.transition().duration(200).style("opacity", 1);
      tooltip.html(`<strong>${d.name}</strong>`)
        .style("left", `${event.pageX + 10}px`)
        .style("top", `${event.pageY - 28}px`);
    })
    .on("mouseout", () => {
      container.selectAll(".series").transition().duration(300).style("opacity", 1);
      tooltip.transition().duration(300).style("opacity", 0);
    });

  // Update Legend
  const legend = d3.select("#legend")
    .selectAll(".legend-item")
    .data(data, d => d.name);

  legend.exit().remove();

  const legendEnter = legend.enter()
    .append("div")
    .attr("class", "legend-item")
    .style("display", "flex")
    .style("align-items", "center")
    .style("margin-bottom", "4px");

  legendEnter.append("div")
    .style("width", "12px")
    .style("height", "12px")
    .style("margin-right", "6px")
    .style("background-color", d => color(d.name));

  legendEnter.append("span")
    .style("font-family", "sans-serif")
    .style("font-size", "14px")
    .text(d => d.name);
}
