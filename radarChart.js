function RadarChart(id, data, options) {
  var cfg = {
    w: 600,
    h: 600,
    margin: { top: 100, right: 100, bottom: 100, left: 100 },
    levels: 5,
    maxValue: 0,
    labelFactor: 1.25,
    wrapWidth: 60,
    opacityArea: 0.35,
    dotRadius: 4,
    strokeWidth: 2,
    roundStrokes: true,
    color: d3.scale.category10()
  };

  // Merge custom options
  if ('undefined' !== typeof options) {
    for (var i in options) {
      if (typeof options[i] !== 'undefined') cfg[i] = options[i];
    }
  }

  var allAxis = data[0].slice(1).map(d => d.axis),
      total = allAxis.length,
      radius = Math.min(cfg.w / 2, cfg.h / 2),
      angleSlice = Math.PI * 2 / total;

  var maxValue = Math.max(cfg.maxValue, d3.max(data, i =>
    d3.max(i.slice(1), o => o.value)
  ));

  // Remove previous chart
  d3.select(id).select("svg").remove();

  var svg = d3.select(id)
    .append("svg")
    .attr("width", cfg.w + cfg.margin.left + cfg.margin.right)
    .attr("height", cfg.h + cfg.margin.top + cfg.margin.bottom)
    .append("g")
    .attr("transform", "translate(" + (cfg.w / 2 + cfg.margin.left) + "," + (cfg.h / 2 + cfg.margin.top) + ")");

  var rScale = d3.scale.linear()
    .range([0, radius])
    .domain([0, maxValue]);

  // Circular grid
  for (var level = 0; level < cfg.levels; level++) {
    var levelFactor = radius * ((level + 1) / cfg.levels);
    svg.selectAll(".levels")
      .data(allAxis)
      .enter()
      .append("line")
      .attr("x1", (d, i) => levelFactor * Math.cos(angleSlice * i - Math.PI / 2))
      .attr("y1", (d, i) => levelFactor * Math.sin(angleSlice * i - Math.PI / 2))
      .attr("x2", (d, i) => levelFactor * Math.cos(angleSlice * (i + 1) - Math.PI / 2))
      .attr("y2", (d, i) => levelFactor * Math.sin(angleSlice * (i + 1) - Math.PI / 2))
      .attr("stroke", "gray")
      .attr("stroke-opacity", 0.75)
      .attr("stroke-width", "0.5px");
  }

  // Axes
  var axis = svg.selectAll(".axis")
    .data(allAxis)
    .enter().append("g")
    .attr("class", "axis");

  axis.append("line")
    .attr("x1", 0)
    .attr("y1", 0)
    .attr("x2", (d, i) => rScale(maxValue * 1.1) * Math.cos(angleSlice * i - Math.PI / 2))
    .attr("y2", (d, i) => rScale(maxValue * 1.1) * Math.sin(angleSlice * i - Math.PI / 2))
    .attr("stroke", "gray")
    .attr("stroke-width", "1px");

  axis.append("text")
    .attr("x", (d, i) => rScale(maxValue * cfg.labelFactor) * Math.cos(angleSlice * i - Math.PI / 2))
    .attr("y", (d, i) => rScale(maxValue * cfg.labelFactor) * Math.sin(angleSlice * i - Math.PI / 2))
    .attr("dy", "0.35em")
    .style("font-size", "11px")
    .attr("text-anchor", "middle")
    .text(d => d);

  // Radar line generator
  var radarLine = d3.svg.line.radial()
    .radius(d => rScale(d.value))
    .angle((d, i) => i * angleSlice)
    .interpolate(cfg.roundStrokes ? "cardinal-closed" : "linear");

  // Blobs
  var blobWrapper = svg.selectAll(".radarWrapper")
    .data(data)
    .enter().append("g")
    .attr("class", "radarWrapper");

  blobWrapper.append("path")
    .attr("class", "radarArea")
    .attr("d", d => radarLine(d.slice(1)))
    .style("fill", (d, i) => cfg.color(i))
    .style("fill-opacity", 0)
    .transition().duration(800)
    .style("fill-opacity", cfg.opacityArea);

  blobWrapper.append("path")
    .attr("class", "radarStroke")
    .attr("d", d => radarLine(d.slice(1)))
    .style("stroke-width", cfg.strokeWidth + "px")
    .style("stroke", (d, i) => cfg.color(i))
    .style("fill", "none")
    .style("stroke-opacity", 0)
    .transition().duration(800)
    .style("stroke-opacity", 1);

  blobWrapper.each(function(d, i) {
    d3.select(this).selectAll(".radarCircle")
      .data(d.slice(1))
      .enter().append("circle")
      .attr("class", "radarCircle")
      .attr("r", 0)
      .attr("cx", 0)
      .attr("cy", 0)
      .style("fill", cfg.color(i))
      .style("fill-opacity", 0.8)
      .transition().duration(800)
      .attr("r", cfg.dotRadius)
      .attr("cx", (d, i) => rScale(d.value) * Math.cos(angleSlice * i - Math.PI / 2))
      .attr("cy", (d, i) => rScale(d.value) * Math.sin(angleSlice * i - Math.PI / 2));
  });
}
