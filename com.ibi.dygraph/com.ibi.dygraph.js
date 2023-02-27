/*global tdgchart: false, pv: false, d3: false */
/* Copyright (C) 1996-2023. Cloud Software Group, Inc. All rights reserved. */

(function() {

	// All extension callback functions are passed a standard 'renderConfig' argument:
	//
	// Properties that are always available:
	//   moonbeamInstance: the chart instance currently being rendered
	//   data: the data set being rendered
	//   properties: the block of your extension's properties, as they've been set by the user
	//   modules: the 'modules' object from your extension's config, along with additional API methods
	//
	// Properties available during render callback:
	//   width: width of the container your extension renders into, in px
	//   height: height of the container your extension renders into, in px
	//   containerIDPrefix:  the ID of the DOM container your extension renders into.  Prepend this to *all* IDs your extension generates, to ensure multiple copies of your extension work on one page.
	//   container: DOM node for your extension to render into;
	//   rootContainer: DOM node containing the specific chart engine instance being rendered.


	// Optional: if defined, is called exactly *once* during chart engine initialization
	// Arguments:
	//  - successCallback: a function that you must call when your extension is fully
	//     initialized - pass in true if init is successful, false otherwise.
	// - initConfig: the standard callback argument object (moonbeamInstance, data, properties, etc)
	function initCallback(successCallback, initConfig) {
		successCallback(true);
	}

	// Optional: if defined, is called once before each draw that does not include any data
	// Arguments:
	//  - preRenderConfig: the standard callback argument object (moonbeamInstance, data, properties, etc)
	function noDataPreRenderCallback(preRenderConfig) {
		var chart = preRenderConfig.moonbeamInstance;
		chart.legend.visible = false;
		chart.dataArrayMap = undefined;
		chart.dataSelection.enabled = false;
	}

	// Optional: if defined, is called whenever this extension must be drawn but doesn't yet have any data.
	// Use this to define the extensions' initial 'grey state' appearance.
	// Arguments:
	//  - renderConfig: the standard callback argument object (moonbeamInstance, data, properties, etc)
	function noDataRenderCallback(renderConfig) {
		var chart = renderConfig.moonbeamInstance;
		var data = [{"timeline":"19960101","value":[1900441,1843626],"_s":0,"_g":0},
			{"timeline":"19960201","value":[1982200,1942231],"_s":0,"_g":1},
			{"timeline":"19960301","value":[2075663,2018588],"_s":0,"_g":2},
			{"timeline":"19960401","value":[1904775,1849614],"_s":0,"_g":3},
			{"timeline":"19960501","value":[1877405,1822285],"_s":0,"_g":4},
			{"timeline":"19960601","value":[1905163,1893727],"_s":0,"_g":5},
			{"timeline":"19960701","value":[1995861,2028306],"_s":0,"_g":6},
			{"timeline":"19960801","value":[2018088,2000008],"_s":0,"_g":7},
			{"timeline":"19960901","value":[1933779,1932576],"_s":0,"_g":8},
			{"timeline":"19961001","value":[1896704,1901828],"_s":0,"_g":9},
			{"timeline":"19961101","value":[1907071,1991235],"_s":0,"_g":10},
			{"timeline":"19961201","value":[1905152,1894204],"_s":0,"_g":11},
			{"timeline":"19970101","value":[1864129,1849988],"_s":0,"_g":12},
			{"timeline":"19970201","value":[1861639,1877134],"_s":0,"_g":13},
			{"timeline":"19970301","value":[1874439,1901347],"_s":0,"_g":14},
			{"timeline":"19970401","value":[1829838,1896457],"_s":0,"_g":15},
			{"timeline":"19970501","value":[1899494,1960738],"_s":0,"_g":16},
			{"timeline":"19970601","value":[1932630,1925690],"_s":0,"_g":17},
			{"timeline":"19970701","value":[2005402,2051937],"_s":0,"_g":18},
			{"timeline":"19970801","value":[1838863,1852010],"_s":0,"_g":19},
			{"timeline":"19970901","value":[1893944,1955644],"_s":0,"_g":20},
			{"timeline":"19971001","value":[1933705,1888870],"_s":0,"_g":21},
			{"timeline":"19971101","value":[1865982,1896118],"_s":0,"_g":22},
			{"timeline":"19971201","value":[2053923,2046617],"_s":0,"_g":23}];

		var props = renderConfig.properties;

		var width = renderConfig.width;
		var height = renderConfig.height;
		var container = d3.select(renderConfig.container).append("div")
			.attr('class', 'com_ibi_dygraph');

		var arrBuckets = [{"id":"timeline","fields":[{"title":"Date"}]},{"id":"value","fields":[{"title":["Sales","Budget"]}]}];

		com_ibi_dygraph_drawChart(data,container,width,height,container,width,height,arrBuckets,props,chart);

		appendCoverScreen(container, width, height);

		//		renderConfig.renderComplete();
	}

	function appendCoverScreen(container, width, height) {
		container.append("span")
			.styles({
				'position': 'absolute',
				'top': '0px',
				'left': '0px',
				'width': width + 'px',
				'height': height + 'px',
				'background-color': 'rgba(80,80,80,0.4)',
				'overflow': 'hidden'
			});

		container.append('span')
			.html('Currently, there are insufficient buckets completed.')
			.styles({
				'position': 'absolute',
				'top': ((height / 2) - 30) + 'px',
				'left': '0px',
				'width': width + 'px',
				'text-align': 'center',
				'font-weight': 'bold',
				'font-size': '14px'
			});
		container.append('text')
			.html('Please add more measures or dimensions')
			.styles({
				'position': 'absolute',
				'top': ((height / 2) + 30) + 'px',
				'left': '0px',
				'width': width + 'px',
				'text-align': 'center',
				'font-weight': 'bold',
				'font-size': '14px'
			});
	}

	// Optional: if defined, is invoked once at the very beginning of each chart engine draw cycle
	// Use this to configure a specific chart engine instance before rendering.
	// Arguments:
	//  - preRenderConfig: the standard callback argument object
	function preRenderCallback(preRenderConfig) {
		var chart = preRenderConfig.moonbeamInstance;

		// Example of manually loading a file in this extension's folder path and using it.
		var info = tdgchart.util.ajax(preRenderConfig.loadPath + 'lib/extra_properties.json', {asJSON: true});

		// Example of using the chart engine's built in title properties
		chart.title.visible = false;
		//		chart.title.text = info.custom_title;
		//		chart.title.text = 'Cool Visualisation!';
		chart.footnote.visible = false;
		chart.footnote.text = 'xxxxxxxx';
		chart.footnote.align = 'right';
	}

	function getLegendMaxWidth(data, arrBuckets, font) {

		var valueBucket = arrBuckets.filter(function(b) { return b.id === "value"; })[0];
		var colorBucket = arrBuckets.filter(function(b) { return b.id === "color"; })[0];
		if(!valueBucket)
			return;
		var labels;
		if(colorBucket) {
			labels = d3.map(data, function(d,i) {return d.color}).keys();
		} else {
			labels = valueBucket.fields.map(function(f) { return f.title; });
		}
		var twodecimals = function(v) { return v >= 0 ? Math.ceil(v)+0.99 : Math.floor(v)-0.99; };
		var markerWidth = tdgchart.util.measureLabelWidth('EM', font);

		var getWidth = function(ldata, title, font) {
			var minMax = tdgchart.util.minMax(ldata);
			var minValueWidth = tdgchart.util.measureLabelWidth(twodecimals(minMax.min), font);
			var maxValueWidth = tdgchart.util.measureLabelWidth(twodecimals(minMax.max), font);
			var titleWidth = tdgchart.util.measureLabelWidth(title + ":\xa0", font);

			var width = tdgchart.util.max([minValueWidth, maxValueWidth, markerWidth]) + titleWidth + 1;
			return width;
		};
		var legendLabelWidths = labels.map(function(title,i) {
			var ldata;
			if (colorBucket) {
				ldata = data.filter(function(d) { return d.color === labels[i]; }).map(function(d) { return d.value; });
			}
			else {
				ldata = data.map(function(d) { return d.value; })
			}

			if (valueBucket.fields.length==1) {
				//ldata is array of values
				return getWidth(ldata, title, font);
			} else {
				var widths = valueBucket.fields.map(function (valueTitle, i) {
					//ldata is array of per-value arrays
					var vdata = ldata.map(function(arr) { return arr[i]; });
					var name = !colorBucket ? valueTitle.title : title + ' (' + valueTitle.title + ')';
					return getWidth(vdata, name, font);
				});
				return tdgchart.util.max(widths);
			}

		});
		return tdgchart.util.max(legendLabelWidths);
	}

	// Required: Invoked during each chart engine draw cycle
	// This is where your extension should be rendered
	// Arguments:
	//  - renderConfig: the standard callback argument object, including additional properties width, height, etc
	// This simple bar extension supports:
	//  - multiple measure entries in a generic 'value' bucket.  Each value will be drawn on its own split-y axis.
	//  - one dimension entry in a generic 'labels' bucket.  This bucket defines the set of labels on the ordinal axis.
	//  - one dimension entry in the built-in 'series_break' bucket.  This will split each value entry into multiple similar colors.
	function renderCallback(renderConfig) {

		var chart = renderConfig.moonbeamInstance;
		var data = renderConfig.data;
		var props = renderConfig.properties;

		if (Array.isArray(renderConfig.dataBuckets.buckets)) {
			var arrBuckets = renderConfig.dataBuckets.buckets;
		} else {
			var arrBuckets = [];
			if (renderConfig.dataBuckets.buckets.timeline) {
				var arrTimeline = []
				arrTimeline.push({
					title: renderConfig.dataBuckets.buckets.timeline.title
				})
				arrBuckets.push({
					id: "timeline",
					fields: arrTimeline
				})
			}
			if (renderConfig.dataBuckets.buckets.color) {
				arrBuckets.push({
					id: "color",
					fields: renderConfig.dataBuckets.buckets.color
				})
			}
			if (renderConfig.dataBuckets.buckets.value) {
				var arrValues = []
				for (x = 0; x < renderConfig.dataBuckets.buckets.value.title.length; x++) {
					arrValues.push({
						title: renderConfig.dataBuckets.buckets.value.title[x]
					})
				}
				arrBuckets.push({
					id: "value",
					fields: arrValues
				})
			}
		}

		var width = renderConfig.width;
		var height = renderConfig.height;

		var masterContainer = d3.select(renderConfig.container);
		var legendWidth = 0;

		if (props.legend === "never" || props.legendPosition != 'left' && props.legendPosition != 'right') {
			//legend overlaid - default (dygraph will put legend in masterContainer if props.labelsDiv not set)
			chartContainer = masterContainer;
		} else {
			masterContainer.style('display', 'flex');

			var chartContainer, legendContainer;
			if (props.legendPosition == 'right') { //order of 'appends' matters
				chartContainer = masterContainer.append("div");
				legendContainer = masterContainer.append("div");
			} else {
				legendContainer = masterContainer.append("div");
				chartContainer = masterContainer.append("div");
			}
			chartContainer.attr('id', masterContainer.attr('id') + '-chart');

			legendContainer.attr('id', masterContainer.attr('id') + '-legend');
			legendContainer.style('flex-grow', '1');

			var font = '700 ' + window.getComputedStyle(renderConfig.container).font; // "700" is for "bold"
			legendWidth = Math.min(width*0.3, getLegendMaxWidth(data, arrBuckets, font)); // limit legend width to 30% of available space
			props.labelsDiv = legendContainer.node(0); //this enables 'external' legend rendering in dygraph engine
		}

		chartContainer.attr('class', 'com_ibi_dygraph');

		com_ibi_dygraph_drawChart(data, masterContainer, width, height, chartContainer,width-legendWidth,height,arrBuckets,props,chart);

		renderConfig.renderComplete();
	}

	// Your extension's configuration
	var config = {
		id: 'com.ibi.dygraph',     // string that uniquely identifies this extension
		containerType: 'html',  // either 'html' or 'svg' (default)
		initCallback: initCallback,
		preRenderCallback: preRenderCallback,  // reference to a function that is called right *before* your extension is rendered.  Will be passed one 'preRenderConfig' object, defined below.  Use this to configure a Moonbeam instance as needed
		renderCallback: renderCallback,  // reference to a function that will draw the actual chart.  Will be passed one 'renderConfig' object, defined below
		noDataPreRenderCallback: noDataPreRenderCallback,
		noDataRenderCallback: noDataRenderCallback,
		resources: {  // Additional external resources (CSS & JS) required by this extension
			script: window.d3 ? ['lib/dygraph.min.js','lib/dychart.js','lib/d3-selection-multi.min.js','lib/d3-time.min.js','lib/d3-time-format.min.js','lib/d3-transition.min.js'] :
			['lib/dygraph.min.js','lib/d3.v5.16.min.js','lib/dychart.js','lib/d3-selection-multi.min.js','lib/d3-time.min.js','lib/d3-time-format.min.js','lib/d3-transition.min.js'],
			css: ['css/dygraph.css']
		},
		modules: {
			dataSelection: {
				supported: true,  // Set this true if your extension wants to enable data selection
				needSVGEventPanel: false, // if you're using an HTML container or altering the SVG container, set this to true and the chart engine will insert the necessary SVG elements to capture user interactions
				svgNode: function() {}  // if you're using an HTML container or altering the SVG container, return a reference to your root SVG node here.
			},
			eventHandler: {
				supported: true
			},
			title: {
				supported: true
			},
			tooltip: {
				supported: false,  // Set this true if your extension wants to enable HTML tooltips
			}
			// Not used in this extension; here for documentation purposes.
			//			colorScale: {
			//				supported: true,
			//				minMax: function(arg){}  // Optional: return a {min, max} object to use for the color scale min & max.
			//			}
			//			sizeScale: {
			//				supported: false,
			//				minMax: function(arg){}  // Optional: return a {min, max} object to use for the size scale min & max.
			//			},
			//			legend: {
			//				colorMode: function(arg){}, // Return either 'data' or 'series'.  If implemented, force the chart engine to use this color mode legend
			//				sizeMode: function(arg){},  // return either 'size' or falsey.  If implemented, force the chart engine to use this size legend
			//			}
		}
	};

	// Required: this call will register your extension with the chart engine
	tdgchart.extensionManager.register(config);

}());
