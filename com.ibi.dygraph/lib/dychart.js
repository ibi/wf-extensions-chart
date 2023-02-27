// Copyright (C) 2021-2023. Cloud Software Group, Inc. All rights reserved.
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

var com_ibi_dygraph_mygraph = null;
function com_ibi_dygraph_drawChart(data,rootContainer,rootWidth, rootHeight,chartContainer,width,height,arrBuckets,props,chart) {
	// Older versions (8.2.01 for one) do not pass the newer array style of arrBuckets,
	// so we need to test and adjust accordingly
	if (Array.isArray(arrBuckets)) {
		var csvfile = arrBuckets[0].fields[0].title;
		//var titles = [];
		// for this extension, customBars cannot be true without errorBars also being true.
		props.errorBars = props.customBars ? props.customBars : props.errorBars;
		// If the new color bucket is set then the data needs to be rearranged into one row per color bucket value
		// This section writes all the color bucket values into the csv file header 
		if (arrBuckets[1].id === "color") {
			var colorArray = d3.map(data, function(d,i) {return d.color}).keys();
			if (arrBuckets[2].fields.length > 1) {
				for (x = 0; x < colorArray.length; x++) {
					for (y=0 ; y < arrBuckets[2].fields.length; y++) {
						var title = colorArray[x] + " (" + arrBuckets[2].fields[y].title + ")";
						//titles.push(title);
						csvfile += ", " + title;
					}
				}
			} else {
				//titles = colorArray;
				csvfile += ", " + colorArray;
			}
		} else {
			// when errorBars is set to true, the labels passed into the csvfile need to be
			// manipulated to allow for unlabelled error ranges to be arrayed.
			// otherwise errors are returned.
			for (x = 0; x < arrBuckets[1].fields.length; x++) {
				csvfile += ", " + arrBuckets[1].fields[x].title;
				//titles.push(arrBuckets[1].fields[x].title);
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
		}
	} else {
		var csvfile = arrBuckets.timeline.title + "," + arrBuckets.value.title;
		//titles = [arrBuckets.value.title];
	}

	// If the new color bucket is set then the data needs to be rearranged into one row per color bucket value
	// This section wraps the data into the correct orientation when this is true 
	if (arrBuckets[1].id === "color") {
		var dv= {}, seq=[];
		for (var i=0; i<data.length; i++) {
			var d = data[i];
			if(!dv[d.timeline]) {
				dv[d.timeline] = {};
				seq.push(d.timeline);
			}
			dv[d.timeline][d.color] = d.value;
		}
		for(var i=0; i<seq.length; i++) {
			var timeline = seq[i];
			var csvline = timeline;
			for (var c=0; c<colorArray.length; c++) {
				var value = dv[timeline][colorArray[c]];
				if (value == undefined) {
					//fill with correct number of empty columns
					value = new Array(arrBuckets[2].fields.length).join(',');
				}
				csvline += "," + value;
			}
			csvfile += "\n" + csvline;
		}
	} else {
		// If the color bucket isn't used then write out csv file as before
		var dataValues = d3.map(data, function(d,i) {
			csvfile += '\n' + d.timeline + "," + d.value;
			return d.timeline + "," + d.value;
		});
	}

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
	props.colors = [props.colours.color0, props.colours.color1, props.colours.color2, props.colours.color3, props.colours.color4, props.colours.color5, props.colours.color6, props.colours.color7, props.colours.color8, props.colours.color9];

	var main_margin = {top: 15, right: 15, bottom: 15, left: 15};

	var rootDivStyle = rootContainer.node(0).style;
	var chartDiv = chartContainer.node(0);
	rootDivStyle.top = "0";
	rootDivStyle.left = "0";
	rootDivStyle.marginTop = main_margin.top + "px";
	rootDivStyle.marginLeft = main_margin.left + "px";
	rootDivStyle.marginBottom = main_margin.bottom + "px";
	rootDivStyle.marginRight = main_margin.right + "px";
	rootDivStyle.width = rootWidth - main_margin.left - main_margin.right + "px";
	rootDivStyle.height = rootHeight - main_margin.top - main_margin.bottom + "px";
	chartDiv.style.width = width - main_margin.left - main_margin.right + "px";
	chartDiv.style.height = height - main_margin.top - main_margin.bottom + "px";

	//BEGIN VIZ-378
	if(com_ibi_dygraph_mygraph == null)
	{
		com_ibi_dygraph_mygraph = new Dygraph(
			chartDiv,
			csvfile, // CSV file
			props
		);
	}
	else
	{
		com_ibi_dygraph_mygraph.destroy();
		com_ibi_dygraph_mygraph = new Dygraph(
			chartDiv,
			csvfile, // CSV file
			props
		);
	}
	//END VIZ-378
}
