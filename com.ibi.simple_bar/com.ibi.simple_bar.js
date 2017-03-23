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
	
	// Optional: if defined, is invoked once at the very beginning of each chart engine draw cycle
	// Use this to configure a specific chart engine instance before rendering.
	// Arguments: 
	//  - preRenderConfig: the standard callback argument object
	function preRenderCallback(preRenderConfig) {
		var chart = preRenderConfig.moonbeamInstance;
		chart.title.visible = true;
		chart.title.text = "My Custom Chart Title";  // contrived example
		chart.footnote.visible = true;
		chart.footnote.text = "footnote";
		chart.footnote.align = 'right';
	}
	
	function noDataPreRenderCallback(preRenderConfig) {
		var chart = preRenderConfig.moonbeamInstance;
		chart.legend.visible = false;
		chart.dataArrayMap = undefined;
		chart.dataSelection.enabled = false;
	}

	// Required: Invoked during each chart engine draw cycle
	// This is where your extension should be rendered
	// Arguments:
	//  - renderConfig: the standard callback argument object, including additional properties width, height, etc
	function renderCallback(renderConfig) {

		var chart = renderConfig.moonbeamInstance;
		var props = renderConfig.properties;

		var container = d3.select(renderConfig.container)
			.attr('class', 'com_ibi_chart');

		var data = renderConfig.data;
		if (renderConfig.dataBuckets.depth === 1) {
			data = [data];
		}
			
		var seriesCount = data[0].length;
		var seriesLabels = data[0].map(function(el){return el.labels;});
		data = d3.transpose(data).map(function(el, idx) {
			el = el[0];
			var v = Array.isArray(el.value) ? el.value : [el.value];
			var y0 = 0;
			return v.map(function(d, s) {
				return chart.mergeObjects(el, {y0: y0, y1: y0 += d, seriesID: s, value: d, labels: seriesLabels[idx]});
			});
		});
		
		var w = renderConfig.width;
		var h = renderConfig.height;
		var x = d3.scale.ordinal().domain(pv.range(seriesCount)).rangeRoundBands([0, w], 0.2);
		var ymax = d3.max([].concat.apply([], data), function(d){return d.y1;});
		var y = d3.scale.linear().domain([0, ymax]).range([25, h]);

		var svg = container.selectAll("g")
			.data(data)
			.enter().append('g')
			.attr('transform', function(d, i){return 'translate(' + x(i) + ', 0)';});
			
		svg.selectAll("rect")
			.data(function(d){return d;})
			.enter().append('rect')
			.attr("width", x.rangeBand())
			.attr("y", function(d) {return h - y(d.y1);})
			.attr("height", function(d){return y(d.y1) - y(d.y0);})
			.attr('class', function(d, s, g) {
				
				// To support data selection, events and tooltips, each riser must include a class name with the appropriate seriesID and groupID
				// Use chart.buildClassName to create an appropriate class name.
				// 1st argument must be 'riser', 2nd is seriesID, 3rd is groupID, 4th is an optional extra string which can be used to identify the risers in your extension.
				
				return chart.buildClassName('riser', s, g, 'bar');
			})
			.attr('fill', function(d) {
				
				// getSeriesAndGroupProperty(seriesID, groupID, property) is a handy function
				// to easily look up any series dependent property.  'property' can be in
				// dot notation (eg: 'marker.border.width').
				
				return chart.getSeriesAndGroupProperty(d.seriesID, null, 'color');
			})
			.each(function(d, s, g) {
				
				// addDefaultToolTipContent will add the same tooltip to this riser as the built in chart types would.
				// Assumes that 'this' node includes a fully qualified series & group class string.
				// addDefaultToolTipContent can also accept optional arguments:
				// addDefaultToolTipContent(target, s, g, d, data), useful if this node does not have a class
				// or if you want to override the default series / group / datum lookup logic.
				
				renderConfig.modules.tooltip.addDefaultToolTipContent(this);
			});
			
		svg.append('text')
			.attr('transform', function(d) {return 'translate(' + (x.rangeBand() / 2) + ',' + (h - 5) + ')';})
			.text(function(d, i){return seriesLabels[i];});

		renderConfig.renderComplete();
	}
	
	function noDataRenderCallback(renderConfig) {
		var grey = renderConfig.baseColor;
		renderConfig.data = [{value: [3, 3]}, {value: [4, 4]}, {value: [5, 5]}, {value: [6, 6]}, {value: [7, 7]}];
		renderConfig.moonbeamInstance.getSeries(0).color = grey;
		renderConfig.moonbeamInstance.getSeries(1).color = pv.color(grey).lighter(0.18).color;
		renderCallback(renderConfig);
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
		resources:  {  // Additional external resources (CSS & JS) required by this extension
			script: ['lib/d3.min.js'],
			css: ['css/extension.css']
		},
		modules: {
			dataSelection: {
				supported: true,  // Set this true if your extension wants to enable data selection
				needSVGEventPanel: false, // if you're using an HTML container or altering the SVG container, set this to true and the chart engine will insert the necessary SVG elements to capture user interactions
				svgNode: function(arg){}  // if you're using an HTML container or altering the SVG container, return a reference to your root SVG node here.
			},
			eventHandler: {
				supported: true
			},
			tooltip: {
				supported: true,  // Set this true if your extension wants to enable HTML tooltips
				// This callback is called when no default tooltip content is passed into the chart.
				// Use this to define 'nice' default tooltips for the given target, ids & data.
				// Return value can be a string (including HTML), or HTML nodes, or any Moonbeam tooltip API object.
				autoContent: function(target, s, g, d, data) {
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
  
}());