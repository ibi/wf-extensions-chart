// Copyright 1996-2018 Information Builders, Inc. All rights reserved.
// DyGraph Chart HTML 5 Extension JavaScript
// Written by   : Anthony Alsford
// Date Created : 19th February 2018
// --------------------------------------------------------------------------------
// Modification History
// --------------------------------------------------------------------------------
// Anthony Alsford: 19 Feb 2018
//   Initial Version
// --------------------------------------------------------------------------------

function drawChart(data,Container,width,height,arrBuckets,props) {

//  alert("Drawing chart");

  var csvfile = arrBuckets.timeline.title + "," + arrBuckets.value.title + '\n';
  
  var dataValues = d3.map(data, function(d,i) {csvfile += d.timeline+ "," + d.value + '\n';
                                               return d.timeline + "," + d.value;});
  
  var chartDiv = document.getElementById(Container[0][0].id);
  var win = window
    , doc = document
    , ele = doc.documentElement
    , bdy = doc.getElementsByTagName("body")[0]
    , screenWidth = screen.width;

  var main_margin = {top: 15, right: 15, bottom: 15, left: 15};

  chartDiv.style.top = main_margin.top + "px";
  chartDiv.style.left = main_margin.left + "px";
  chartDiv.style.width = width - main_margin.left - main_margin.right + "px";
  chartDiv.style.height = height - main_margin.top - main_margin.bottom + "px";

  mygraph = new Dygraph(
    chartDiv,
    csvfile, // CSV file
    props
  );

}

