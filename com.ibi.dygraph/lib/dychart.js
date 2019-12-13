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
// Anthony Alsford: 21 Jun 2019
//   API 2.0 required changes to the build of CSV headers.
// --------------------------------------------------------------------------------

function drawChart(data,Container,width,height,arrBuckets,props,chart) {

// Older versions (8.2.01 for one) do not pass the newer array style of arrBuckets,
// so we need to test and adjust accordingly
  if (Array.isArray(arrBuckets)) {
      var csvfile = arrBuckets[0].fields[0].title;
	  // for this extension, customBars cannot be true without errorBars also being true.
	  props.errorBars = props.customBars ? props.customBars : props.errorBars;
	  // when errorBars is set to true, the labels passed into the csvfile need to be
	  // manipulated to allow for unlabelled error ranges to be arrayed.
	  // otherwise errors are returned.
      for (x = 0; x < arrBuckets[1].fields.length; x++) {
		  csvfile += ", " + arrBuckets[1].fields[x].title;
		  if (props.errorBars && props.customBars) {
			  x = x + 2
		  } else {
			  if (props.errorBars) {
				  x = x + 1;
			  } else {
				  if (props.customBars) {
				      x = arrBuckets[1].fields.length + 1;
				  }
			  }
		  };
      }
  } else {
      var csvfile = arrBuckets.timeline.title + "," + arrBuckets.value.title;
  }
  
  var dataValues = d3.map(data, function(d,i) {csvfile += '\n' + d.timeline + "," + d.value;
                                               return d.timeline + "," + d.value;});

  var chartDiv = document.getElementById(Container[0][0].id);
  var win = window
    , doc = document
    , ele = doc.documentElement
    , bdy = doc.getElementsByTagName("body")[0]
    , screenWidth = screen.width;

// Allow the chart title defined within Moonbeam to override that set in the properties
// This will allow multigraph settings to provide a data related value rather than the same throughout.
  props.title = chart.title.text === '' ? props.title : chart.title.text;
  
// Some properties are not aligned with the area of interest such as xLabelHeight and yLabelWidth
// so they have been "realigned" and need to be reassigned here
  props.xLabelHeight = props.axes.x.axisLabelHeight;
  props.xlabel = props.axes.x.axisLabel;
  props.yLabelWidth = props.axes.y.axisLabelHeight;
  props.ylabel = props.axes.y.axisLabel;
// To allow selection of colors, the array is split into separate attributes so we need to
// merge them back into an array.
  props.colors = [props.colors.color0, props.colors.color1, props.colors.color2, props.colors.color3, props.colors.color4, props.colors.color5, props.colors.color6, props.colors.color7, props.colors.color8, props.colors.color9];

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

