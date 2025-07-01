const url = "https://raw.githubusercontent.com/bengoodmanhl/bengoodmanhl.github.io/refs/heads/main/RadarJSON.json";
const svg = d3.select("svg");
const container = svg.append("g").attr("transform", "translate(350, 350)");
const radius = 250;
const color = d3.scaleOrdinal(d3.schemeCategory10);
let allData, dimensions, extentByDimension;

// Tooltip
const tooltip = d3.select("body").append("div").attr("class", "tooltip");

d3.json(url).then(data => {
  allData = data;
  dimensions = Object.keys(data[0]).filter(k => k !== "name");
  extentByDimension = {};
  dimensions.forEach(dim => {
    extentByDimension[dim] = d3.extent(data, d => d[dim]);
  });
  populateDropdowns(data.map(d => d.name));
  drawChart(getSelectedBanks());
});

function populateDropdowns(names) {
  for (let i = 1; i <= 4; i++) {
    const select = document.getElementById(`bank${i}`);
    select.innerHTML = '<option value="">-- None --</option>';
    names.forEach(name => {
      const opt = document.createElement("option");
      opt.value = name;
      opt.text = name;
      select.appendChild(opt);
    });
    select.addEventListener("change", () => drawChart(getSelectedBanks()));
  }
}

function getSelectedBanks() {
  const names = [];
  for (let i = 1; i <= 4; i++) {
    const val = document.getElementById(`bank${i}`).value;
    if (val && !names.includes(val)) names.push(val);
  }
  return allData.filter(d => names.includes(d.name));
}

function drawChart(data) {
  container.selectAll("*").remove();
  d3.select("#legend").html(""); // Clear legend

  const angleSlice = (2 * Math.PI) / dimensions.length;

  function getScaledRadius(dim, val) {
    return d3.scaleLinear()
      .domain(extentByDimension[dim])
      .range([0, 0.9 * radius])(Math.max(0.1, val));
  }

  // Grid
  for (let level = 0; level <= 5; level++) {
    const r = radius * (level / 5);
    const points = dimensions.map((_, i) => {
      const angle = angleSlice * i - Math.PI / 2;
      return [Math.cos(angle) * r, Math.sin(angle) * r];
    });
    container.append("polygon")
      .attr("points", points.map(p => p.join(",")).join(" "))
      .attr("fill", "none")
      .attr("stroke", "#ccc");
  }

  // Axes
  dimensions.forEach((dim, i) => {
    const angle = angleSlice * i - Math.PI / 2;
    container.append("text")
      .attr("class", "axisLabel")
      .attr("x", Math.cos(angle) * (radius + 20))
      .attr("y", Math.sin(angle) * (radius + 20))
      .text(dim);
  });

  const radarLine = d3.lineRadial()
    .radius(d => d.radius)
    .angle((d, i) => i * angleSlice)
    .curve(d3.curveCardinalClosed.tension(0.4));

  const group = container.selectAll(".series")
    .data(data)
    .enter()
    .append("g")
    .attr("class", "series");

  // Radar path with animation
  // JOIN by name to track entries/updates/removals
const series = container.selectAll(".series")
  .data(data, d => d.name);

// EXIT old elements
series.exit().remove();

// ENTER new groups
const seriesEnter = series.enter()
  .append("g")
  .attr("class", "series");

// ENTER: Animate new radar lines
seriesEnter.append("path")
  .attr("class", "line")
  .attr("fill", d => color(d.name))
  .attr("stroke", d => color(d.name))
  .attr("fill-opacity", 0.1)
  .attr("stroke-width", 2)
  .attr("d", d => {
    const points = dimensions.map(dim => ({ radius: getScaledRadius(dim, d[dim]) }));
    return radarLine(points);
  })
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

// MOUSE EVENTS: Attach to both existing and new paths
series.merge(seriesEnter).select(".line")
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
  })
     .each(function() {Add commentMore actions
      const path = d3.select(this);
      const length = this.getTotalLength();
      path
        .attr("stroke-dasharray", `${length} ${length}`)
        .attr("stroke-dashoffset", length)
        .transition()
        .duration(1000)
        .attr("stroke-dashoffset", 0);
    });
   
  // Pop-in circles
  group.selectAll(".circle")
    .data(d => dimensions.map((dim, i) => {
      const angle = angleSlice * i - Math.PI / 2;
      const r = getScaledRadius(dim, d[dim]);
      return { x: Math.cos(angle) * r, y: Math.sin(angle) * r, color: color(d.name) };
    }))
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

  // Dynamic Legend
  const legendItems = d3.select("#legend")
    .selectAll(".legend-item")
    .data(data)
    .enter()
    .append("div")
    .attr("class", "legend-item")
    .style("display", "flex")
    .style("align-items", "center")
    .style("margin-bottom", "4px");

  legendItems.append("div")
    .style("width", "12px")
    .style("height", "12px")
    .style("margin-right", "6px")
    .style("background-color", d => color(d.name));

  legendItems.append("span")
    .style("font-family", "sans-serif")
    .style("font-size", "14px")
    .text(d => d.name);
}
