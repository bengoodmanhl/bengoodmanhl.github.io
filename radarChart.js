function drawRadarChart(normalizedBank) {
  const svg = d3.select('#radarChart');
  svg.selectAll('*').remove(); // Clear previous chart

  const MIN_BANKS = 3;
  if (!normalizedBank || normalizedBank.length < MIN_BANKS) return;

  const size = 280;
  const radius = size;
  const width = +svg.attr('width');
  const height = +svg.attr('height');
  const center = { x: width / 2, y: height / 2 };

  const axes = Object.keys(normalizedBank [0]).filter(k => k !== 'name');
  const angleSlice = (2 * Math.PI) / axes.length;

  // Scales
  const radialScale = d3.scaleLinear().domain([0, 1]).range([0, radius]);

  // Grid
  const levels = 5;
  for (let level = 1; level <= levels; level++) {
    const r = (radius / levels) * level;
    svg.append('circle')
      .attr('cx', center.x)
      .attr('cy', center.y)
      .attr('r', r)
      .attr('fill', 'none')
      .attr('stroke', '#ccc')
      .attr('stroke-dasharray', '2,2');
  }

  // Axis lines and labels
  axes.forEach((axis, i) => {
    const angle = angleSlice * i - Math.PI / 2;
    const x = center.x + radialScale(1) * Math.cos(angle);
    const y = center.y + radialScale(1) * Math.sin(angle);

    // Line
    svg.append('line')
      .attr('x1', center.x)
      .attr('y1', center.y)
      .attr('x2', x)
      .attr('y2', y)
      .attr('stroke', '#333');

    // Label
    svg.append('text')
      .attr('x', center.x + radialScale(1.1) * Math.cos(angle))
      .attr('y', center.y + radialScale(1.1) * Math.sin(angle))
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'central')
      .attr('font-size', '11px')
      .text(axis);
  });

  // Color helper
  const color = d3.scaleOrdinal(d3.schemeCategory10);

  // Draw lines
  normalizedBank.forEach((bank, idx) => {
    const points = axes.map((axis, i) => {
      const angle = angleSlice * i - Math.PI / 2;
      const r = radialScale(bank[axis]);
      return [
        center.x + r * Math.cos(angle),
        center.y + r * Math.sin(angle)
      ];
    });

    // Closed path
    svg.append('path')
      .datum(points)
      .attr('fill', color(bank.name))
      .attr('fill-opacity', 0.1)
      .attr('stroke', color(bank.name))
      .attr('stroke-width', 2)
      .attr('d', d3.line().curve(d3.curveLinearClosed));

    // Dots
    points.forEach(p => {
      svg.append('circle')
        .attr('cx', p[0])
        .attr('cy', p[1])
        .attr('r', 3)
        .attr('fill', color(bank.name));
    });
  });

  // Legend
  normalizedBank.forEach((bank, i) => {
    svg.append('circle')
      .attr('cx', 10)
      .attr('cy', 20 + i * 20)
      .attr('r', 5)
      .attr('fill', color(bank.name));

    svg.append('text')
      .attr('x', 20)
      .attr('y', 20 + i * 20)
      .attr('alignment-baseline', 'middle')
      .text(bank.name)
      .attr('font-size', '12px');
  });
}

