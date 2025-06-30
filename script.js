var w = 500,
	h = 500;

var colorscale = d3.scale.category10();

//Legend titles
var LegendOptions = ['Iphone','Nokia','Samsung'];

//Data
var d = [ [
    { "axis": "Battery Life", "value": 0.22 },
    { "axis": "Brand", "value": 0.28 },
    { "axis": "Contract Cost", "value": 0.29 },
    { "axis": "Design And Quality", "value": 0.17 },
    { "axis": "Have Internet Connectivity", "value": 0.22 },
    { "axis": "Large Screen", "value": 0.02 },
    { "axis": "Price Of Device", "value": 0.21 },
    { "axis": "To Be A Smartphone", "value": 0.50 }
  ],
  [
    { "axis": "Battery Life", "value": 0.27 },
    { "axis": "Brand", "value": 0.16 },
    { "axis": "Contract Cost", "value": 0.35 },
    { "axis": "Design And Quality", "value": 0.13 },
    { "axis": "Have Internet Connectivity", "value": 0.20 },
    { "axis": "Large Screen", "value": 0.13 },
    { "axis": "Price Of Device", "value": 0.35 },
    { "axis": "To Be A Smartphone", "value": 0.38 }
  ],
  [
    { "axis": "Battery Life", "value": 0.26 },
    { "axis": "Brand", "value": 0.10 },
    { "axis": "Contract Cost", "value": 0.30 },
    { "axis": "Design And Quality", "value": 0.14 },
    { "axis": "Have Internet Connectivity", "value": 0.22 },
    { "axis": "Large Screen", "value": 0.04 },
    { "axis": "Price Of Device", "value": 0.41 },
    { "axis": "To Be A Smartphone", "value": 0.30 }
  ]
];

//Options for the Radar chart, other than default
var mycfg = {
  w: w,
  h: h,
  maxValue: 0.6,
  levels: 6,
  ExtraWidthX: 300
}

//Call function to draw the Radar chart
//Will expect that data is in %'s
RadarChart.draw("#chart", d, mycfg);

////////////////////////////////////////////
/////////// Initiate legend ////////////////
////////////////////////////////////////////

var svg = d3.select('#body')
	.selectAll('svg')
	.append('svg')
	.attr("width", w+300)
	.attr("height", h)

//Create the title for the legend
var text = svg.append("text")
	.attr("class", "title")
	.attr('transform', 'translate(90,0)') 
	.attr("x", w - 70)
	.attr("y", 10)
	.attr("font-size", "12px")
	.attr("fill", "#404040")
	.text("What % of owners use a specific service in a week");
		
//Initiate Legend	
var legend = svg.append("g")
	.attr("class", "legend")
	.attr("height", 100)
	.attr("width", 200)
	.attr('transform', 'translate(90,20)') 
	;
	//Create colour squares
	legend.selectAll('rect')
	  .data(LegendOptions)
	  .enter()
	  .append("rect")
	  .attr("x", w - 65)
	  .attr("y", function(d, i){ return i * 20;})
	  .attr("width", 10)
	  .attr("height", 10)
	  .style("fill", function(d, i){ return colorscale(i);})
	  ;
	//Create text next to squares
	legend.selectAll('text')
	  .data(LegendOptions)
	  .enter()
	  .append("text")
	  .attr("x", w - 52)
	  .attr("y", function(d, i){ return i * 20 + 9;})
	  .attr("font-size", "11px")
	  .attr("fill", "#737373")
	  .text(function(d) { return d; })
	  ;	
