/*global tdgchart: false, pv: false, d3: false */
/* Copyright 1996-2015 Information Builders, Inc. All rights reserved. */

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
		var grey = renderConfig.baseColor;
		renderConfig.data = [
			[{value: 3}, {value: 4}, {value: 5}, {value: 6}, {value: 7}],
			[{value: 3}, {value: 4}, {value: 5}, {value: 6}, {value: 7}]
		];
		renderConfig.dataBuckets.depth = 2;
		renderConfig.moonbeamInstance.getSeries(0).color = grey;
		renderConfig.moonbeamInstance.getSeries(1).color = pv.color(grey).lighter(0.18).color;
		renderCallback(renderConfig);
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
		chart.title.visible = true;
		chart.title.text = info.custom_title;
		chart.footnote.visible = true;
		chart.footnote.text = 'footnote';
		chart.footnote.align = 'right';
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
		var w = renderConfig.width;
		var h = renderConfig.height;

		var container = d3.select(renderConfig.container)
			.attr('class', 'com_ibi_chart');

		// If there's nothing in series_break, dataBuckets.depth will be 1 and data will be a flat array of datum objects.
		// Normalize whether we have a series_break or not by forcing internal data to always have two aray dimensions.
		if (renderConfig.dataBuckets.depth === 1) {
			data = [data];
		}

		// If we have only one measure, measure title is a string not array; normalize that too
		if (renderConfig.dataBuckets.buckets.value && !Array.isArray(renderConfig.dataBuckets.buckets.value.title)) {
			renderConfig.dataBuckets.buckets.value.title = [renderConfig.dataBuckets.buckets.value.title];
		}

		// Build list of all unique axis labels found across the entire data set
		var axisLabels = pv.blend(data).map(function(el) {return el.labels;}).filter(function() {
			var seen = {};
			return function(el) {
				return el != null && !(el in seen) && (seen[el] = 1);
			};
		}());

		// If the label bucket is empty, use 'Label X' placeholders
		if (!axisLabels.length) {
			var labelCount = d3.max(data, function(el){return el.length;});
			axisLabels = d3.range(0, labelCount).map(function(el) {return 'Label ' + el;});
		}

		var splitYCount = tdgchart.util.get('dataBuckets.buckets.value.count', renderConfig, 1);
		var splitYData = [];

		// Data arrives in an array of arrays of {value: [a, b, c]} entires.
		// Each entry in 'value' gets drawn on a unique split-y axis.
		// Split that long list into one list of values for each split-y axis.
		data.forEach(function(array) {
			array.forEach(function(el, i) {
				el.value = Array.isArray(el.value) ? el.value : [el.value];
				if (!el.labels) {
					el.labels = 'Label ' + i;
				}
				el.value.forEach(function(v, idx) {
					splitYData[idx] = splitYData[idx] || [];
					var labelIndex = axisLabels.indexOf(el.labels);
					if (labelIndex >= 0) {
						splitYData[idx][labelIndex] = splitYData[idx][labelIndex] || [];
						splitYData[idx][labelIndex].push({
							value: v, yaxis: idx, labels: el.labels
						});
					}
				});
			});
		});

		// Calculate a y value for the start and end positions of each riser in each stack
		splitYData.forEach(function(el) {
			el.forEach(function(stack) {
				var acc = 0;
				stack.forEach(function(d) {
					d.y0 = acc;
					d.y1 = acc + d.value;
					acc += d.value;
				});
			});
		});

		var xLabelHeight = 25;
		var yHeight = (h - xLabelHeight) / splitYCount;
		var x = d3.scale.ordinal().domain(axisLabels).rangeRoundBands([xLabelHeight, w - 25], 0.2);
		var yScaleList = splitYData.map(function(el) {
			var ymax = d3.max(el.map(function(a) {return d3.sum(a, function(d) {return d.value;});}));
			return d3.scale.linear().domain([0, ymax]).range([yHeight, 20]);
		});

		var splitYGroups = container.selectAll('g')
			.data(splitYData)
			.enter().append('g')
			.attr('transform', function(d, i) {
				return 'translate(' + xLabelHeight + ', ' + (h - xLabelHeight - (yHeight * (i + 1))) + ')';
			});

		// Add axis divider line
		splitYGroups.append('path')
			.attr('d', function(d, i) {
				return 'M0,' + yScaleList[i](0) + 'l' + (w - 25) + ',0';
			})
			.attr('stroke', 'grey')
			.attr('stroke-width', 1)
			.attr('shape-rendering', 'crispEdges');

		// Add rotated split y axis label
		splitYGroups.append('text')
			.attr('transform', function() {
				return 'translate(-10,' + (yHeight / 2) + ') rotate(-90)';
			})
			.attr('fill', 'black')
			.attr('font-size', '12px')
			.attr('font-family', 'helvetica')
			.attr('text-anchor', 'middle')
			.text(function(d, i) {return tdgchart.util.get('dataBuckets.buckets.value.title[' + i + ']', renderConfig, '');});

		// Add risers, grouped by stack
		var riserGroups = splitYGroups.selectAll('g')
			.data(function(d) {
				return d;  // d: flat array of riser data
			})
			.enter().append('g');

		// Draw the actual risers themselves
		riserGroups.selectAll('rect')
			.data(function(d) {
				return d;  // d: single {y0, y1, label} datum (finally!)
			})
			.enter().append('rect')
			.attr('shape-rendering', 'crispEdges')
			.attr('x', function(d) {
				return x(d.labels);
			})
			.attr('y', function(d) {
				return yScaleList[d.yaxis](d.y1);
			})
			.attr('width', x.rangeBand())
			.attr('height', function(d) {
				return Math.abs(yScaleList[d.yaxis](d.y1) - yScaleList[d.yaxis](d.y0));
			})
			.attr('class', function(d, s, g) {

				// To support data selection, events and tooltips, each riser must include a class name with the appropriate seriesID and groupID
				// Use chart.buildClassName to create an appropriate class name.
				// 1st argument must be 'riser', 2nd is seriesID, 3rd is groupID, 4th is an optional extra string which can be used to identify the risers in your extension.
				return chart.buildClassName('riser', s, g, 'bar');
			})
			.attr('fill', function(d, s) {

				// getSeriesAndGroupProperty(seriesID, groupID, property) is a handy function
				// to easily look up any series dependent property. 'property' can be in
				// dot notation (eg: 'marker.border.width')
				return chart.getSeriesAndGroupProperty(s, null, 'color');
			})
			.each(function(d, s, g) {

				// addDefaultToolTipContent will add the same tooltip to this riser as the built in chart types would.
				// Assumes that 'this' node includes a fully qualified series & group class string.
				// addDefaultToolTipContent can also accept optional arguments:
				// addDefaultToolTipContent(target, s, g, d, data), useful if this node does not have a class
				// or if you want to override the default series / group / datum lookup logic.
				renderConfig.modules.tooltip.addDefaultToolTipContent(this, s, g, d);
			});

		// Add bottom ordinal x axis labels
		container.append('g')
			.selectAll('text')
			.data(axisLabels)
			.enter().append('text')
			.attr('transform', function(d) {
				return 'translate(' + (x(d) + xLabelHeight + (x.rangeBand() / 2)) + ',' + (h - 5) + ')';
			})
			.attr('fill', 'black')
			.attr('font-size', '12px')
			.attr('font-family', 'helvetica')
			.attr('text-anchor', 'middle')
			.text(function(d, i) {return axisLabels[i];});

		renderConfig.renderComplete();
	}

	// Your extension's configuration
	var config = {
		id: 'com.ibi.simple_bar',     // string that uniquely identifies this extension
		containerType: 'svg',  // either 'html' or 'svg' (default)
		initCallback: initCallback,
		preRenderCallback: preRenderCallback,  // reference to a function that is called right *before* your extension is rendered.  Will be passed one 'preRenderConfig' object, defined below.  Use this to configure a Monbeam instance as needed
		renderCallback: renderCallback,  // reference to a function that will draw the actual chart.  Will be passed one 'renderConfig' object, defined below
		noDataPreRenderCallback: noDataPreRenderCallback,
		noDataRenderCallback: noDataRenderCallback,
		resources: {  // Additional external resources (CSS & JS) required by this extension
			script: [
				// Example of using a function callback to dynamically define an external library to be loaded
				// callbackArg is the standard callback argument object which contains 'properties'.
				// This is called during library load time, so a chart instance is not yet available.
				function(callbackArg) {
					return callbackArg.properties.external_library;
				}
			]
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
			tooltip: {
				supported: true,  // Set this true if your extension wants to enable HTML tooltips
				// This callback is called when no default tooltip content is passed into the chart.
				// Use this to define 'nice' default tooltips for the given target, ids & data.
				// Return value can be a string (including HTML), or HTML nodes, or any Moonbeam tooltip API object.
				autoContent: function(target, s, g, d) {
					if (d.hasOwnProperty('color')) {
						return 'Bar Size: ' + d.value + '<br />Bar Color: ' + d.color;
					}
					return 'Bar Size: ' + d.value;
				}
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

})();
