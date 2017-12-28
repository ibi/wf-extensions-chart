// Copyright 1996-2018 Information Builders, Inc. All rights reserved.
// Corona Chart HTML 5 Extension JavaScript
// Written by   : Anthony Alsford
// Date Created : 20th November 2017
// --------------------------------------------------------------------------------
// Modification History
// --------------------------------------------------------------------------------
// Anthony Alsford: 27 Dec 2017
//   1. Additional property to allow non-display of the reference ring on mouseover
//   2. Change format of radial labels to 3 significant digits
//   3. Additional attribute to "dots" series to identify Radial value so that it
//      can be added to central labels on mouseover events.
// --------------------------------------------------------------------------------

function checkData(data,container,width,height,arrBuckets,props) {

  drawChart(data,container,width,height,arrBuckets,props);

}
  
function drawChart(data,svgContainer,width,height,arrBuckets,props) {

//  alert("Drawing chart");

// Now we have the width and height of the SVG container, we can set the various positions and sizings accordingly

  var topMargin = 0, bottomMargin = 0, leftMargin = 0, rightMargin = 0;
  
// First calculate the actual plot size.
// This will be width - leftMargin - rightMargin
//          and height - topMargin - bottomMargin

  if ((width - leftMargin - rightMargin) < 250) {
    var plotWidth = 250;
  } else {
    var plotWidth = width - leftMargin - rightMargin;
  }
  if ((height - topMargin - bottomMargin) < 250) {
    var plotHeight = 250;
  } else {
    var plotHeight = height - topMargin - bottomMargin;
  }

// Now centre the SVG element
  if (width > height) {
    var padding = (width - height) / 2;
    d3.selectAll("svg")
        .style("padding-left", padding+"px");
  } else {
    var padding = (height - width) / 2;
    d3.selectAll("svg")
        .attr("style", "padding-top:"+padding+"px");
  }
  
  var strokeType = "cardinal-closed";
//  var strokeType = "linear";
  var centreX = 1000;
  var centreY = 1000;
  var plotX = 1000;
  var plotY = 1000;
  var plotMin = plotX * 0.25;
  var plotMax = plotX * 0.80;
  var range = plotMax - plotMin;
  var interval = range / 5;

// Obtain the maximum and minimum values from all the series
  var x_min = (props.datarange.inc_zero) ? 0 : d3.min(data, function(d) {return d.value});
  var x_max = d3.max(data, function(d) {return d.value});
  
// round off the maximum and minimum values to two most significant numbers - e.g. 146892 max = 150000 min=140000  
  var x_min_len = (parseInt(x_min).toString()).length - 2;
  var x_max_len = (parseInt(x_max).toString()).length - 2;
  
// If the minimum value length is less than that of the maximum, then use 1 significant digit  
      x_min_len = (x_min_len < x_max_len) ? x_min_len + 1 : x_min_len;
  
  var x_min = Math.round((x_min / Math.pow(10, x_min_len)) - 0.5) * Math.pow(10, x_min_len);
  var x_max = Math.round((x_max / Math.pow(10, x_max_len)) + 0.5) * Math.pow(10, x_max_len);

// Set up ranges to automatically convert values into a range that is required to enable
// resizing of the chart to be achieved.
// Resizing is "potentially" better achieved using the SVG "viewBox" attribute
// but WebFOCUS D3 extensions appear to use a change to width and height attributes instead!
  var linearScale = d3.scale.linear()
                            .domain([x_min,x_max])
                            .range([250,plotMax]);
  var linearXScale = d3.scale.linear()
                             .domain([0,2000])
                             .range([leftMargin,plotWidth + leftMargin]);
  var linearYScale = d3.scale.linear()
                             .domain([0,2000])
                             .range([topMargin,plotHeight + topMargin]);
  var fontScale1 = d3.scale.linear()
                           .domain([plotMin,plotMax])
                           .range([6,12]);
  var fontScale2 = d3.scale.linear()
                           .domain([plotMin,plotMax])
                           .range([6,16]);
  var fontScale3 = d3.scale.linear()
                           .domain([plotMin,plotMax])
                           .range([6,14]);

// From the data, obtain the number and values of distinct ordinals (radial) to allow ordinal "axis" plots
  var plotPoints = d3.map(data, function(d) {return d.radial;}).size();
  var lblPoints  = d3.map(data, function(d) {return d.radial;});
  var sizeSeries = d3.map(data, function(d) {return d.series;}).size();
  var lblSeries  = d3.map(data, function(d) {return d.series;});

// As the SVG container is setup for us, we need to ensure that our definitions for our gradients are in the correct location.
  var defs       = d3.select("body").selectAll("defs");
  
  var color1     = props.backcolors.stopcolor1;
  var color2     = props.backcolors.stopcolor2;

  var linearGrad = defs.append("linearGradient").attr("id","svg_fill").attr("x1","0%").attr("y1","0%").attr("x2","100%").attr("y2","0%");
  var stop1      = linearGrad.append("stop").attr("offset","0%").attr("style","stop-color:"+color1+";stop-opacity:1");
  var stop2      = linearGrad.append("stop").attr("offset","50%").attr("style","stop-color:"+color2+";stop-opacity:0.9");
  var stop3      = linearGrad.append("stop").attr("offset","100%").attr("style","stop-color:"+color1+";stop-opacity:1");
/**/
  var rcolor1    = props.radialcolor.stopcolor1;
  var ropacity1  = props.radialcolor.stopopacity1;
  var rcolor2    = props.radialcolor.stopcolor2;
  var ropacity2  = props.radialcolor.stopopacity2;

  var radialGrad = defs.append("radialGradient").attr("id","radial_fill").attr("x1","0%").attr("y1","0%").attr("x2","100%").attr("y2","100%");
  var stop1      = radialGrad.append("stop").attr("offset","0%").attr("style","stop-color:"+rcolor1+";stop-opacity:"+ropacity1);
  var stop2      = radialGrad.append("stop").attr("offset","100%").attr("style","stop-color:"+rcolor2+";stop-opacity:"+ropacity2);

  var MinPlot = (linearXScale(plotX * 2) < linearYScale(plotY * 2)) ? linearXScale(plotX * 2) : linearYScale(plotY * 2);
  var MinCentre = (linearXScale(centreX) < linearYScale(centreY)) ? linearXScale(centreX) : linearYScale(centreY);

  var arrRadials = [];
  var arrSeries = [];
// We need to build an array that just holds the radial and series values that require plotting
// so that it can be utilised later to get the angle and class(es) to which it relates
  lblPoints.forEach(function(d,i) {arrRadials.push(d);});
  lblSeries.forEach(function(d,i) {arrSeries.push(d);});
  
// Add a background rectangle and colour it using the "svg_fill" definition already added
  var rect = svgContainer.append("rect")
                           .attr("width",MinPlot)
                           .attr("height",MinPlot)
                           .attr("fill","url('#svg_fill')");

// Set up a number of circular "grid lines" between the minimum to the maximum plot range
  for (x=plotMin; x<=plotMax; x=x+interval) {
    svgContainer.append("circle")
                  .attr("stroke-width","1")
                  .attr("stroke",rcolor1)
                  .attr("opacity","0.35")
                  .attr("cx",MinCentre)
                  .attr("cy",MinCentre)
                  .attr("r",MinCentre / 1000 * x)
                  .classed("circles",true);
  }

// Label the rings if set within properties.json or WebFOCUS procedure  
  if (props.ringlabels.visible) {
    var incRing = (x_max - x_min) / (range / interval);
    console.log("x_max: "+x_max+" x_min: "+x_min+" Interval: "+incRing);
    var currRing = x_min;
    for (x=plotMin; x<=plotMax; x=x+interval) {
                defs.append("path")
                      .attr("id", "ring" + x)
                      .attr("style", "fill:none;stroke:none;")
                      .attr("d", function() {var angleBeg = (props.ringlabels.angle > 90 && props.ringlabels.angle < 270) ? props.ringlabels.angle + 30 : props.ringlabels.angle - 30;
                                             var angleEnd = (props.ringlabels.angle > 90 && props.ringlabels.angle < 270) ? props.ringlabels.angle - 30 : props.ringlabels.angle + 30;
                                             var rOffset  = (props.ringlabels.angle > 90 && props.ringlabels.angle < 270) ? (MinCentre / 1000 * x) + 12 : (MinCentre / 1000 * x) + 4;
                                             var x1 = MinCentre + (rOffset * Math.cos((angleBeg - 90) * Math.PI / 180));
                                             var x2 = MinCentre + (rOffset * Math.cos((angleEnd - 90) * Math.PI / 180));
                                             var y1 = MinCentre + (rOffset * Math.sin((angleBeg - 90) * Math.PI / 180));
                                             var y2 = MinCentre + (rOffset * Math.sin((angleEnd - 90) * Math.PI / 180));
                                             var r  = rOffset;
                                             var largeArc = (props.ringlabels.angle > 90 && props.ringlabels.angle < 270) ? 0 : 1;
                                             return "M "+x1+" "+y1+" A "+r+" "+r+" 0 0 "+largeArc+" "+x2+" "+y2;}); 
      svgContainer.append("text")
                    .classed("lblAxis",true)
                    .append("textPath")
                      .attr("xlink:href", "#ring" + x)
                      .style("text-anchor", "middle")
                      .attr("style", "font-size:"+parseInt(fontScale1(MinPlot * 0.75))+"pt;opacity:0.4;")
                      .style("fill",props.labels.radial.color)
                      .attr("startOffset", "50%")
                      .text(function() {var parse = d3.format(".3s");
                                        var fmtNumber = (currRing === 0) ? 0 : parse(currRing);
                                        return fmtNumber;
                                       });
      currRing = currRing + incRing;
    }
  }

// During mouseover on a data point, we will set this dashed circle to the radius represented by the value of the point
// We place it here to obtain the correct layering so that it will not cause flickering during mouseover
  svgContainer.append("circle")
                .attr("id","valCircle")
                .attr("cx",MinCentre)
                .attr("cy",MinCentre)
                .attr("r",0)
                .attr("stroke",rcolor1)
                .attr("stroke-width","1")
                .attr("stroke-dasharray",linearYScale(15)+","+linearYScale(15))
                .attr("opacity","0.7")
                .attr("fill","none");

// Declare a function to which we pass a data array of all points within a series
// to provide a closed path "d" attribute.
// Note that this is NOT available in V4 of D3.js  
  var lineFunction = d3.svg.line()
                           .x(function(d,i) {var angle = (360 / plotPoints) * arrRadials.indexOf(d.values[0].values.radial);
                                             var cos = Math.cos((angle - 90) * Math.PI / 180);
                                             var xpos = MinCentre + (linearScale(d.values[0].key) * cos) * MinCentre / centreX;
                                             return xpos;})
                           .y(function(d,i) {var angle = (360 / plotPoints) * arrRadials.indexOf(d.values[0].values.radial);
                                             var sin = Math.sin((angle - 90) * Math.PI / 180);
                                             var ypos = MinCentre + (linearScale(d.values[0].key) * sin) * MinCentre / centreY;
                                             return ypos;})
                           .interpolate(strokeType);

  var plot       = svgContainer.append("g")
                                 .attr("id","plot");

// To be able to plot the closed path for each series, we need the values within each series (retaining the same order)
// By using the following d3.nest process to produce a new array,
// we can access values[0].key for the required value within each series
  var dataBySeries = d3.nest()
                       .key(function(d) {return d.series;})
                       .key(function(d) {return d._g;})
                       .key(function(d) {return d.value;})
                       .rollup(function(v) {return {value: v[0].value, radial: v[0].radial, series: v[0].series};})
                       .entries(data);
  
  var groups     = plot.selectAll("g")
                       .data(dataBySeries)
                       .enter()
                       .append("g")
                         .append("path")
                           .attr("id",function(d,i) {return "series"+i;}) // set a unique id
                           .attr("fill-opacity","0.2")
                           .attr("stroke","rgba(255,255,255,0.2)")
                           .attr("d",function(d,i) {return lineFunction(d.values);})
                           .attr("fill","url('#radial_fill')")
                           .classed("series",true);

  var points     = svgContainer.append("g")
                                 .attr("id","points");

  var lblValue = 0;
  var lblSeries = 0;

// we now add a point for each value within the series to allow mouseover events to highlight the individual series data  
  var dots       = points.selectAll("g")
                         .data(data)
                         .enter()
                         .append("circle")
                           .attr("angle",function(d,i) {return (360 / plotPoints) * arrRadials.indexOf(d.radial);})
                           .attr("radialval",function(d,i) {if (d.radial) {
                                                              return d.radial;
                                                            } else {
                                                              return "undefined";
                                                            }
                                                           })
                           .attr("seriesval",function(d,i) {if (d.series) {
                                                              return d.series;
                                                            } else {
                                                              return "undefined";
                                                            }
                                                           })
                           .attr("value",function(d,i) {return d.value;})
                           .attr("gid",function(d,i) {if (d.series) {
                                                        return "series"+arrSeries.indexOf(d.series);
                                                      } else {
                                                        return "series0";
                                                      }
                                                     })
                           .attr("fill-opacity","0.35")
                           .attr("opacity","0.2")
                           .attr("stroke",props.labels.radial.color)
                           .attr("r",function() {var x_val = linearXScale(12);
                                                 var y_val = linearYScale(12);
                                                 var useVal = (x_val < y_val) ? x_val : y_val;
                                                 return useVal;})
                           .attr("cx",function(d,i) {var angle = (360 / plotPoints) * arrRadials.indexOf(d.radial);
                                                     var cos = Math.cos((angle - 90) * Math.PI / 180);
                                                     var xpos = MinCentre + (linearScale(d.value) * cos * MinCentre / centreX);
                                                     return xpos;})
                           .attr("cy",function(d,i) {var angle = (360 / plotPoints) * arrRadials.indexOf(d.radial);
                                                     var sin = Math.sin((angle - 90) * Math.PI / 180);
                                                     var ypos = MinCentre + (linearScale(d.value) * sin * MinCentre / centreY);
                                                     return ypos;})
                           .attr("class",function() {return "point " + d3.select(this).attr("gid");})

                           .on("mouseover", function(d,i) {
                                                      var thisseries = d3.select(this).attr("gid");
                                                      var thisAngle = d3.select(this).attr("angle");
                                                      var radialVal = d3.select(this).attr("radialval");
                                                      var seriesVal = d3.select(this).attr("seriesval");
                                                      d3.selectAll(".circles")
                                                          .attr("opacity", "0.15");
                                                      d3.selectAll(".series")
                                                          .attr("stroke","rgba(255,255,255,0.1)")
                                                          .attr("fill-opacity", "0.05");
                                                      d3.select("#"+thisseries)
                                                          .attr("fill", "url('#radial_fill')")
                                                          .attr("stroke","rgba(255,255,255,0.5)")
                                                          .attr("fill-opacity", "1");
                                                      d3.select(this)
                                                          .attr("fill-opacity", "1");
                                                      d3.select("#seriesval")
                                                          .text(function() {if (arrBuckets.series) {
                                                                              return arrBuckets.series.title+": "+seriesVal;
                                                                            } else {
                                                                              return "undefined: "+seriesVal;
                                                                            }
                                                                           });
                                                      d3.selectAll("."+thisseries)
                                                          .attr("opacity","1")
                                                          .attr("fill-opacity","1");
                                                      var thisvalue = d3.select(this).attr("value");
                                                      d3.select("#textval")
//                                                          .text(arrBuckets.value.title+": "+thisvalue);
                                                          .text(function() {var parse = d3.format(".3s");
                                                                            var fmtNumber = (thisvalue === 0) ? 0 : parse(thisvalue);
                                                                            return arrBuckets.value.title+": "+thisvalue;
                                       });
                                                      d3.select("#valCircle")
                                                          .attr("r", function() {if (props.ringreference.visible) {
                                                                                   return linearScale(thisvalue) * MinCentre / centreY
                                                                                 } else {
                                                                                   return 0;
                                                                                 }
                                                                     });
//                                                      d3.select("#DataLabel")
//                                                          .text(function() {var lblIndex = thisAngle / 15;
//                                                                            return lblPoints[lblIndex];});
//                                                      d3.select("#lblData")
//                                                          .attr("d", function() {var angleBeg = (thisAngle * 1) - 15;
//                                                                                 var angleEnd = (thisAngle * 1) + 15;
//                                                                                 var rOffset  = 40;
//                                                                                 var x1 = (((linearScale(thisvalue) * MinCentre / centreY) + rOffset) * Math.cos((angleBeg - 90) * Math.PI / 180));
//                                                                                 var x2 = (((linearScale(thisvalue) * MinCentre / centreY) + rOffset) * Math.cos((angleEnd - 90) * Math.PI / 180));
//                                                                                 var y1 = (((linearScale(thisvalue) * MinCentre / centreY) + rOffset) * Math.sin((angleBeg - 90) * Math.PI / 180));
//                                                                                 var y2 = (((linearScale(thisvalue) * MinCentre / centreY) + rOffset) * Math.sin((angleEnd - 90) * Math.PI / 180));
//                                                                                 var r  = ((linearScale(thisvalue) * MinCentre / centreY) + rOffset);
//                                                                                 console.log("d="+thisvalue+" i="+thisAngle+" "+angleBeg+" : "+angleEnd);
//                                                                                 console.log("M "+x1+" "+y1+" A "+r+" "+r+" 0 0 1 "+x2+" "+y2);
//                                                                                 return "M "+x1+" "+y1+" A "+r+" "+r+" 0 0 1 "+x2+" "+y2;})
                                                      ;
                                                 })
                           .on("mouseout", function(d,i) {
                                                      var thisseries = d3.select(this).attr("gid");
                                                      d3.selectAll(".point")
                                                          .attr("fill-opacity", "0.35");
                                                      d3.selectAll(".circles")
                                                          .attr("opacity", "0.35");
                                                      d3.selectAll(".series")
                                                          .attr("stroke", "rgba(255,255,255,0.2)")
                                                          .attr("fill-opacity", "0.2");
                                                      d3.select("#seriesval")
                                                          .text("");
                                                      d3.selectAll("."+thisseries)
                                                          .attr("opacity","0.2")
                                                          .attr("fill-opacity","0.35");
                                                      d3.select("#textval")
                                                          .text("");
                                                      d3.select("#valCircle")
                                                          .attr("r",0);
                                                      d3.select("#DataLabel")
                                                          .text("");
                                                 });

// Now add the "textpath" definitions for the ordinal (radial) "axis"  
  lblPoints.forEach(function(d,i) {
                               defs.append("path")
                                     .attr("id", "text" + arrRadials.indexOf(d))
                                     .attr("style", "fill:none;stroke:none;")
                                     .attr("d", function() {var angleBeg = ((360 / plotPoints) * arrRadials.indexOf(d)) - (360 / plotPoints / 2);
                                                            var angleEnd = ((360 / plotPoints) * arrRadials.indexOf(d)) + (360 / plotPoints / 2);
                                                            var rOffset  = (linearXScale(plotMax + 40) < linearYScale(plotMax + 40)) ? linearXScale(plotMax + 40) : linearYScale(plotMax + 40);
                                                            var x1 = MinCentre + (rOffset * Math.cos((angleBeg - 90) * Math.PI / 180));
                                                            var x2 = MinCentre + (rOffset * Math.cos((angleEnd - 90) * Math.PI / 180));
                                                            var y1 = MinCentre + (rOffset * Math.sin((angleBeg - 90) * Math.PI / 180));
                                                            var y2 = MinCentre + (rOffset * Math.sin((angleEnd - 90) * Math.PI / 180));
                                                            var r  = rOffset;
                                                            return "M "+x1+" "+y1+" A "+r+" "+r+" 0 0 1 "+x2+" "+y2;}); 
  });
  
  lblPoints.forEach(function(d,i) {plot.append("text")
                                         .classed("lblAxis",true)
                                         .append("textPath")
                                           .attr("xlink:href", "#text"+arrRadials.indexOf(d))
                                           .style("text-anchor", "middle")
                                           .attr("style", "font-size:"+parseInt(fontScale1(MinPlot))+"pt;")
                                           .style("fill",props.labels.radial.color)
                                           .attr("startOffset", "50%")
                                           .text(d);
                                  });
/*
*/

// Here we add path definitions along which the radial axis labels will sit
  var lblData = defs.append("path")
                      .attr("id", "lblData")
                      .attr("style", "fill:none;stroke:none;")
                      .attr("d", function() {var angleBeg = -15;
                                             var angleEnd = 15;
                                             var rOffset  = 40;
                                             var x1 = MinCentre + ((plotMax + rOffset) * Math.cos((angleBeg - 90) * Math.PI / 180));
                                             var x2 = MinCentre + ((plotMax + rOffset) * Math.cos((angleEnd - 90) * Math.PI / 180));
                                             var y1 = MinCentre + ((plotMax + rOffset) * Math.sin((angleBeg - 90) * Math.PI / 180));
                                             var y2 = MinCentre + ((plotMax + rOffset) * Math.sin((angleEnd - 90) * Math.PI / 180));
                                             var r  = (plotMax + rOffset);
                                             return "M "+x1+" "+y1+" A "+r+" "+r+" 0 0 1 "+x2+" "+y2;});

// Immediately followed by the actual radial axis labels themselves
  svgContainer.append("text")
                .attr("style","font-size:24pt;stroke:rgba(255,255,255,0.8);")
                .append("textPath")
                  .attr("id","DataLabel")
                  .attr("xlink:href","#lblData")
                  .style("text-anchor", "middle")
                  .attr("startOffset", "50%")
                  .text("");

// Place a circle into the centre so that the hover values display clearly
  svgContainer.append("circle")
                .attr("fill-opacity",0.8)
                .attr("cx",MinCentre)
                .attr("cy",MinCentre)
                .attr("r",MinCentre / 1000 * plotMin)
                .attr("fill","url('#svg_fill')");

  if (props.title.text != "" && props.title.visible != false) {
  svgContainer.append("text")
                  .attr("id","charttitle")
                  .attr("x",function() {
                          switch(props.title.align) {
                            case "left":
                              return linearYScale(10);
                              break;
                            case "right":
                              return (MinCentre * 2) - linearYScale(10);
                              break;
                            default:
                              return MinCentre
                          }
                        })
                  .attr("y",linearYScale(50))
                  .attr("style", "font-size:"+parseInt(fontScale2(MinPlot))+"pt;")
                  .style("fill",props.title.color)
                  .text(props.title.text)
                  .attr("text-anchor",function() {
                          switch(props.title.align) {
                            case "left":
                              return "start";
                              break;
                            case "right":
                              return "end";
                              break;
                            default:
                              return "middle"
                          }
                        });
  }

  svgContainer.append("text")
                .attr("id","seriesval")
                .attr("x",MinCentre)
                .attr("y",MinCentre - linearYScale(50))
                .attr("style", "font-size:"+parseInt(fontScale2(MinPlot))+"pt;")
                .style("fill",props.labels.centre.color)
                .text("")
                .attr("text-anchor","middle");

  svgContainer.append("text")
                .attr("id","textval")
                .attr("x",MinCentre)
                .attr("y",MinCentre + linearYScale(50))
                .attr("style", "font-size:"+parseInt(fontScale3(MinPlot))+"pt;")
                .style("fill",props.labels.centre.color)
                .text("")
                .attr("text-anchor","middle");

}

