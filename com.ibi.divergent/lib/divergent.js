// Copyright 1996-2018 Information Builders, Inc. All rights reserved.
// Diverging Stacked Bar Chart HTML 5 Extension JavaScript
// Written by   : Anthony Alsford
//                Donor Charting Script from D3JS.ORG - http://bl.ocks.org/wpoely86/e285b8e4c7b84710e463
// Date Created : 1st September 2018
// --------------------------------------------------------------------------------
// Modification History
// --------------------------------------------------------------------------------
// Modified by  : Anthony Alsford
//                Added Chart Header as Title and allow legend to be located top or bottom
// Date Created : 10th June 2019 - post US Summit
// --------------------------------------------------------------------------------
// 
// --------------------------------------------------------------------------------

// Create global variables to allow passing of properties to any function.
  var margin = {top: 80, right: 40, bottom: 40, left: 160};

  var win = window
    , doc = document
    , ele = doc.documentElement
    , bdy = doc.getElementsByTagName("body")[0];

function checkData(data,container,width,height,props,buckets,chart) {
    
  d3.select("body.tooltip").remove();
  
  var divTooltip = d3.select(".chart").append("div")
      .style("display", function() { var vDisplay = !props.enableTooltip ? "none" : "block";
                                     return vDisplay; })
      .attr("id", "tooltip");
  
  drawChart(data,container,props,buckets,chart);

}
  
function drawChart(data,svgContainer,props,buckets,chart) {

  width = window.innerWidth - margin.left - margin.right;
  height = window.innerHeight - margin.top - margin.bottom;

  var y = d3.scale.ordinal()
            .rangeRoundBands([0, height], .3);

  var x = d3.scale.linear()
            .rangeRound([0, width]);

  var fontScale = d3.scale.linear()
                          .domain([20,70])
                          .range([10,14]);

  var propcolours = props.useSeriesColours ? [chart.series[1] ? chart.series[1].color : props.colors[0],
                                              chart.series[2] ? chart.series[2].color : props.colors[1],
                                              chart.series[3] ? chart.series[3].color : props.colors[2],
                                              chart.series[4] ? chart.series[4].color : props.colors[3],
                                              chart.series[5] ? chart.series[5].color : props.colors[4]]
                                            : props.colors;
    
  var color = d3.scale.ordinal()
                .range(propcolours);

  var xAxis = d3.svg.axis()
                .scale(x)
                .orient("top");

  var yAxis = d3.svg.axis()
                .scale(y)
                .orient("left");

  svgContainer.attr("width", width + margin.left + margin.right)
              .attr("height", height + margin.top + margin.bottom)
              .attr("id", "d3-plot")
              .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  color.domain(["Reply1", "Reply2", "Reply3", "Reply4", "Reply5"]);
  
  data.forEach(function(d) {
    // calc percentages
    d["N"] = d.replies[0] + d.replies[1] + d.replies[2] + d.replies[3] + d.replies[4];
    d["Reply1"] = +d.replies[0] * 100 / d.N;
    d["Reply2"] = +d.replies[1] * 100 / d.N;
    d["Reply3"] = +d.replies[2] * 100 / d.N;
    d["Reply4"] = +d.replies[3] * 100 / d.N;
    d["Reply5"] = +d.replies[4] * 100 / d.N;
    var x0 = -1*(d["Reply3"]/2+d["Reply2"]+d["Reply1"]);
    var idx = -1;
    d.boxes = color.domain().map(function(name) { idx += 1;
												  /* Code prior to CHART-3411	
                                                  var nFormat = buckets.replies.numberFormat[idx];
												  */
												  //Start CHART-3411 
												  var nFormat = buckets.replies.numberFormat ?        //Handles initial No Data Condition	
																	buckets.replies.numberFormat[idx] : "#";  
												  //End CHART-3411
                                                  var nValue = nFormat.includes("%") ? d.replies[idx] / 100 : d.replies[idx];
												  /* Code prior to CHART-3411	
                                                  return {name: name, x0: x0, x1: x0 += +d[name], N: +d.N, n: + nValue, s:  d._s, g: d._g, title: buckets.replies.title[idx], format: buckets.replies.numberFormat[idx]}; });
                                                  */
												  //Start CHART-3411 
												  return {name: name, x0: x0, x1: x0 += +d[name], N: +d.N, n: + nValue, s:  d._s, g: d._g, title: buckets.replies.title[idx], format: nFormat}; });
												  //End CHART-3411
  });

  var min_val = d3.min(data, function(d) {
            return d.boxes["0"].x0;
          });

  var max_val = d3.max(data, function(d) {
            return d.boxes["4"].x1;
          });

  var max_qwidth = d3.max(data, function(d) {
            return d.Question.length;
          });

  x.domain([min_val, max_val]).nice();
  y.domain(data.map(function(d) { return d.Question; }));

  svgContainer.append("g")
                .attr("class", "x axis")
                .style("font", fontScale(y.rangeBand()) + "px sans-serif")
                .call(xAxis);

  svgContainer.append("g")
                .attr("class", "y axis")
                .call(yAxis);
                
// Depending upon the xAxis properties, "hide" xAxis components
  var xAxisShow = props.showXAxis ? null : d3.selectAll(".x").style("display", "none"); 
  var xticks = props.showXAxisValues ? null : d3.selectAll(".x .tick").style("opacity",0);

// add an ID attribute to y axis label text
  var text4tick = svgContainer.selectAll(".y text")
      .attr("class", "wrap")
      .attr("id", "rectWrap")
      .append(function(d,i) { // The append calls a function from which a text node will be returned.
                              // It will either be the text "Question #" or the question text, truncated and split across a few lines
              var xyz = createTitle(d); // This calls a function that creates a new SVG with a textnode for each y axis label (question)
              
              d = (d.length > 70) ? d.substring(0,69) + "..." : d; // Truncate the string at 70 chars or use the entire string
              var counter = 0;
              var barheight = y.rangeBand(); // Establish the amount of vertical space we have between each y axis value
             // var fontSize = (barheight >= 30) ? 11 : 16; // Could be smarter in determining the font-size here perhaps?
              var fontSize = fontScale(barheight);
              var maxLength = parseInt(margin.left / (fontSize / 2));
              var txtParent = d3.select(this.parentNode).select("text")
                                 .attr("id", "yaxisText"+i)
                                 .attr("style", "font-size:"+fontSize+"px;text-anchor:end;")
                                 .text(function(d) {return (barheight >= 30) ? "" : "Question " + (i + 1)}); // if we have enough vertical space then insert the question text
                                                                                                             // or just show "Question #"
              var words = d.split(" "); // break the question into component words so that we can determine
              var line = "";            // when our line length is full and write them over several lines.
              var spacer = "-1em";
 
              if (parseInt(barheight) >= 22) { // only bother writing multiline y axis labels when there is enough space!
                // if a childNode already exists then it is an unrequired "text" node, so remove it to prevent error
                txtParent[0][0].childNodes[0] ? txtParent[0][0].childNodes[0].remove() : null;
                for (var n=0; n<words.length; n++) {
                  var testLine = line + words[n] + " ";
                  if (testLine.length > maxLength) {
                    var textTSpan = txtParent.append("tspan")
                                               .classed("tspan" ,true)
                                               .attr("x", -margin.left/2)
                                               .attr("dy", spacer)
                                               .text(line);
                    line = words[n] + " ";
                    counter += 1;
                    spacer = "1em";
                  } else {
                    line = testLine;
                  }
                }
                var textTSpan = txtParent.append("tspan")
                                           .classed("tspan" ,true)
                                           .attr("x", -margin.left/2)
                                           .attr("dy", spacer)
                                           .text(line);
                counter += 1;
                txtParent.attr("counter", counter);
                var firstchild = d3.select(txtParent[0][0].childNodes[0])
                                     .attr("dy", function() {var offset = (counter == 1) ? 0.25 : (-0.25 * counter); // the first row of text needs to be offset differently
                                                             return offset + "em";});                                // than the subsequent rows to position the text properly
              }
              return xyz;
           })
  ;

// Now the drawing of the actual bars for the data
  var boxes = svgContainer.selectAll(".Question")
      .data(data)
    .enter().append("g")
      .attr("class", "bar")
      .attr("transform", function(d) { return "translate(0," + y(d.Question) + ")"; });

  var bars = boxes.selectAll("rect")
      .data(function(d) { return d.boxes; })
    .enter().append("g")
//      .attr("class", function(d) { var barclass = tdgchart.buildClassName('riser', d.s, d.g, 'mbar');
//                                   return barclass + " subbar"; })
      .attr("class", "subbar")
      .style("fill", function(d) { return color(d.name); })
      .on("mouseover", mouseover)
      .on("mouseout", mouseout);

  bars.append("rect")
        .attr("height", y.rangeBand())
        .attr("x", function(d) { return x(d.x0); })
        .attr("width", function(d) { return x(d.x1) - x(d.x0); })
        .style("fill", function(d) { return color(d.name); })
        .attr("class", function(d) { var barclass = tdgchart.buildClassName('riser', d.s, d.g, 'mbar');
                                     return barclass; });

  bars.append("text")
        .attr("x", function(d) { return x(d.x0); })
        .attr("y", y.rangeBand()/2)
        .attr("dy", "0.5em")
        .attr("dx", "0.5em")
        .style("font", fontScale(y.rangeBand()) + "px sans-serif")
        .style("text-anchor", "begin")
        .text(function(d) { var text = tdgchart.numberFormatter.formatFromString(d.n,d.format,",");
                            return d.n !== 0 && (d.x1-d.x0)>3 ? text : "" });

  boxes.insert("rect",":first-child")
         .attr("height", y.rangeBand())
         .attr("x", "1")
         .attr("width", width)
         .attr("fill-opacity", "0.3")
         .style("fill", "rgba(255,255,255,0)")
         .attr("class", function(d,index) { return index%2==0 ? "even" : "uneven"; });

  var startp = svgContainer.append("g")
       .attr("class", "legendbox")
       .attr("id", "mylegendbox");
  
  var tabBegin = 0;

// Build the legend, calculating the space need to accomodate the series labels
  var legend = startp.selectAll(".legend")
      .data(color.domain().slice())
    .enter().append("g")
      .attr("class", "legend")
      .attr("transform", function(d, i) { var textElement = svgContainer.append("g")
                                              .classed("temptext", true) // for IE, we need to make the nodes visible, so we add a class name that we can target to delete
                                              .attr("style", "font:" + fontScale(y.rangeBand()) + "px sans-serif; position:absolute;top:-100px;left:-100px;") // position them offscreen
                                              .append("text")
                                                .text(buckets.replies.title[i]);
                                          var bbox = textElement.node().getBBox(); // use Bounding Box to discover the width of the text element which allows us to
                                          var tabpos = tabBegin;                   // judge the space required for each legend label
                                          tabBegin += bbox.width + 32;
                                          return "translate(" + tabpos + ",-45)"; });

  legend.append("rect")
          .attr("x", 0)
          .attr("width", 16)
// Allow the height to fall below 16 to mimic the height of the bars, but do not allow to exceed 16.
          .attr("height", y.rangeBand() >= 16 ? 16 : y.rangeBand())
          .attr("y", y.rangeBand() >= 16 ? 0 : parseInt((16 - y.rangeBand()) / 2))
          .style("fill", color);

  legend.append("text")
          .attr("x", 22)
          .attr("y", 9)
          .attr("dy", ".35em")
          .style("text-anchor", "begin")
          .style("font", fontScale(y.rangeBand()) + "px sans-serif")
          .text(function(d, i) {var titleText = (i < buckets.replies.count) ? buckets.replies.title[i] : "Not set";
                                return titleText;});
      
// Delete the temporary text nodes that were used to obtain bounding box widths
  svgContainer.selectAll(".temptext").remove();

// Axis lines
  d3.selectAll(".axis path")
      .style("fill", "none")
      .style("stroke", "#000")
      .style("shape-rendering", "crispEdges")

// Mark the reference line
  svgContainer.append("g")
      .attr("class", "y axis")
    .append("line")
      .attr("style", function() {var stroke = "blue";
                                 var swidth = "1";
                                 var dasharray = false;
                                 if (chart.referenceLines) {
                                     for (i=0;i<chart.referenceLines.length;i++) {
                                          var refLine = chart.referenceLines[i];
                                          stroke = (refLine.axis == "x") ? refLine.line.color : stroke;
                                          swidth = (refLine.axis == "x") ? refLine.line.width : swidth;
                                          dasharray = (refLine.axis == "x") ? refLine.line.dash : dasharray;
                                         }
                                 }
                                 return "stroke:" + stroke + ";stroke-width:" + swidth + ";stroke-dasharray:" + dasharray;})
      .attr("x1", x(0))
      .attr("x2", x(0))
      .attr("y2", height);

// find all objects with a class of "axis" and apply additional styling.
  d3.selectAll(".axis line")
      .style("fill", "none")
//      .style("stroke", "#000")
      .style("shape-rendering", "crispEdges")

// Calculate where the left side of the legend should be placed so that it lies centrally in the window
  var moveLeft = ((width / 2) - (startp.node().getBBox().width / 2) - (margin.left / 2));

// #############################################################################################################
// Allow the legend to be positioned top or bottom - setting to anything other than top will result in bottom placement
// chart.legend.position.side can be auto, bottom, left, right, top
// might not exist as default seems to be non-hierarchical so - position: right;
// If position is top then leave transform as ,0 else change to the result of svgContainer.height - svgContainer.transformation.height
  var t = d3.transform(svgContainer.attr("transform"));
  var posLegend = svgContainer[0][0].attributes[4].value - t.translate[1];
  var propLegend = chart.legend.position.side;
  var legendTop = propLegend === "top" ? 0 : posLegend;
  d3.selectAll(".legendbox").attr("transform", "translate(" + moveLeft  + "," + legendTop +")");

// Calculate where the top of the chart should be placed depending on whether the chart title is to be displayed and the font size
// IE and Chrome render the title differently :-(
// In IE it is in a seperate DIV whereas in Chrome/Firefox it is rendered as a "foreignObject" which is not precoded in D3 so
// we need to resort to standard JavaScript.
// Further differences between browsers, Firefox objTitle.clientHeight is 0 so we need objTitle.height.animVal.value to obtain height
//                                       Chrome we can use objTitle.clientHeight to obtain height but we can also use the same as Firefox
//                                       MSIE and we need the object with a class of "title" first-childs clientHeight attribute
  var objTitle = d3.selectAll(".title")[0];
// checking the length of the objTitle allows us to determine if a title (heading) has been set
// as that is the only object that is assigned a class of "title".
  var titleHeight = objTitle.length > 0 ? objTitle[0].height ? objTitle[0].height.animVal.value : objTitle[0].clientHeight : 0;
  var legendOffset = legendTop == 0 ? 60 : 30;
  var titleOffset = objTitle.length > 0 ? titleHeight : 0;
  var moveTop = chart.title.visible === true ? legendOffset + titleOffset : legendOffset;
  svgContainer.attr("transform", "translate(" + margin.left + "," + moveTop +")");

// #############################################################################################################

} // end of build_chart function

// This function is used to create text elements containing the questions to allow splitting
function createTitle(text) {
  var svgText = document.createElementNS("http://www.w3.org/2000/svg", "title");
  var textNode = document.createTextNode(text);
      svgText.appendChild(textNode);
  return svgText;
} // end of createTitle function

// Mouseover function.
function mouseover(d) {
  var thisColor = this.style.fill;
  d3.select("#tooltip")
      .html(function() {var list = tdgchart.numberFormatter.formatFromString(d.n,d.format,",");
                        var list = tdgchart.numberFormatter.formatFromString(d.n,d.format,",");
                        var iHtml  = "<span id='title1'>"+d.title+"</span>";
                            iHtml += "<br /><span id='title2'>Value: </span><span id='value'>"+list+"</span>";
                            iHtml += !d.format.includes("%") ? "<br /><span id='title3'>Percent: </span><span id='pcnt'>"+tdgchart.numberFormatter.formatFromString((d.n / d.N),"#.00%",",")+"</span>" : "";
                        return iHtml;
                       })
      .style("top", function() {var objTooltip = d3.select("#tooltip");
                                var objHeight = objTooltip[0][0].offsetHeight;
                                var clientHeight = (win.innerHeight || ele.clientHeight || bdy.clientHeight);
                                var scrollTop = (win.scrollY || ele.scrollY || bdy.scrollTop);
                                var posTop = (clientHeight + scrollTop > (d3.event.pageY + objHeight + 5)) ? d3.event.pageY + 5 : (d3.event.pageY - objHeight - 5);
                                return (posTop) + "px";
                               })
      .style("left", function() {var objTooltip = d3.select("#tooltip");
                                 var objWidth = objTooltip[0][0].offsetWidth;
                                 var clientWidth = (win.innerWidth || ele.clientWidth || bdy.clientWidth);
                                 var scrollLeft = (win.scrollX || ele.scrollX || bdy.scrollLeft);
                                 var posLeft = (clientWidth + scrollLeft > (d3.event.pageX + objWidth + 20)) ? d3.event.pageX + 20 : (d3.event.pageX - objWidth - 20);
                                 return (posLeft) + "px";
                                })
      .style("visibility", "visible")
      .style("background-color", thisColor);
}

// Mouseout function.
function mouseout(d) {
  d3.select("#tooltip")
      .style("visibility", "hidden")
      .html(function() {return "";});
}
