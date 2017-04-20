/* Copyright 1996-2015 Information Builders, Inc. All rights reserved. */
/* $Revision: 1.0 $ */

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
//		chart.title.visible = true;
//		chart.title.text = "My Custom Chart Title";  // contrived example
//		chart.footnote.visible = true;
//		chart.footnote.text = "footnote";
//		chart.footnote.align = 'right';
	}
	
	function noDataPreRenderCallback(preRenderConfig) {
		var chart = preRenderConfig.moonbeamInstance;
		chart.legend.visible = false;
		chart.dataArrayMap = undefined;
		chart.dataSelection.enabled = false;
	}

	function getFormatedBuckets ( renderConfig ) {
		if ( !renderConfig.dataBuckets || !renderConfig.dataBuckets.buckets ) {
			return;
		}
		var bkts = renderConfig.dataBuckets.buckets,
			modif_bkts = {};
		for ( var bkt in bkts ) {
			if ( bkts.hasOwnProperty( bkt ) ) {
				modif_bkts[bkt] = Array.isArray( bkts[bkt].title ) ? bkts[bkt].title : [bkts[bkt].title];
			}
		}

		return modif_bkts;
	}

	function getToolTipBuilder (buckets) {
		return function (d) { //d.value, d.seriesID


			var str = '<div style="padding: 5px">';

			if (Array.isArray(buckets.labels)) {
				str += '<b>' + buckets.labels[0] + ': </b>';
				str += d.label;
				str += '<br/>';
			}

			
			if (Array.isArray(buckets.value)) {
				str += '<b>' + buckets.value[d.seriesID] + ': </b>';
				str += d.value;
			}

			str += '</div>';

			return str;
		};
	}

	function hasToolTip (keys, buckets) {
		return keys.some(function (key) {
			return buckets[key];
		});
	}

	// Required: Invoked during each chart engine draw cycle
	// This is where your extension should be rendered
	// Arguments:
	//  - renderConfig: the standard callback argument object, including additional properties width, height, etc
	function renderCallback(renderConfig) {

		var chart = renderConfig.moonbeamInstance;
		var props = renderConfig.properties;

		var buckets = getFormatedBuckets(renderConfig);

		var container = d3.select(renderConfig.container)
			.attr('class', 'com_ibi_chart');
			
		var seriesCount = (Array.isArray(renderConfig.data[0].value)) ? renderConfig.data[0].value.length : 1;
		var groupCount = renderConfig.data.length;
		var seriesLabels = renderConfig.data.map(function(el){return el.labels;});
		var data = [];
		for (var i = 0; i<renderConfig.data.length;i++) {
			var d = renderConfig.data[i];
			if (Array.isArray(d.value)) {				
				for (var j = 0; j<d.value.length;j++) {
					data.push({label: d.labels, value:d.value[j], groupID:i, seriesID: j});
				}
			} else {
				data.push({label: d.labels, value:d.value, groupID:i, seriesID: 0});
			}
		}
		
		var w = renderConfig.width;
		var h = renderConfig.height;
		var x = d3.scale.ordinal().domain(pv.range(groupCount)).rangeRoundBands([0, w], 0.2);
		var ymax = d3.max(data, function(d){return d.value;});
		var y = d3.scale.linear().domain([0, ymax]).range([25, h]);

		var yAxis = d3.svg.axis()
			.scale(y)
			.orient("left");
	  
		var svg = container.selectAll("g")
			.data(data)
			.enter().append('g')

		var buildToolTip;
		if ( Array.isArray(buckets.value) && buckets.value.length === 2 ) {
			buildToolTip = getToolTipBuilder(buckets);
		}

		var group_inset	= 0.7;
		var	bar_width = x.rangeBand();
		svg.append("rect")
//			.data(function(d){return d;})
//			.enter().append('rect')
			.attr('x', function(d){return x(d.groupID) + (d.seriesID? (bar_width - (bar_width*group_inset))/2 : 0) ;})
			.attr("width",
				function(d) {return	bar_width * (d.seriesID? group_inset : 1 );})
			.attr("y", function(d) {return h - y(d.value);})
			.attr("height", function(d){return y(d.value)-y.range()[0];})
			.attr('tdgtitle', function(d, s, g) {
				// To support tooltips, each chart object that should draw a tooltip must 
				// set its 'tdgtitle' attribute to the tooltip's content string.
				if (buildToolTip) {
					return buildToolTip(d);
				}
				
				// Retrieve the chart engine's user-defined tooltip content with getToolTipContent():
				// 's' and 'g' are the series and group IDs for the riser in question.
				// 'd' is this riser's individual datum, and seriesData is the array of data for this riser's series.
				var seriesData = chart.data[0][s];
				var tooltip = renderConfig.modules.tooltip.getToolTipContent(s, g, d, seriesData);
				// getToolTipContent() return values:
				//  - undefined: do not add any content to this riser's tooltip
				//  - the string 'auto': you must define some 'nice' automatic tooltip content for this riser
				//  - anything else: use this directly as the tooltip content
				if (tooltip === 'auto') {
					if (d.hasOwnProperty('color')) {
						return 'Bar Size: ' + d.value + '<br />Bar Color: ' + d.color;
					}
					return 'Bar Size: ' + d.value;
				}
				return tooltip;
			})
			.attr('class', function(d, s, g) {
				// To support data selection and tooltips, each riser must include a class name with the appropriate seriesID and groupID
				// Use chart.buildClassName to create an appropriate class name.
				// 1st argument must be 'riser', 2nd is seriesID, 3rd is groupID, 4th is an optional extra string which can be used to identify the risers in your extension.
				return chart.buildClassName('riser', s, g, 'bar');
			})
			.attr('fill', function(d) {
				// getSeriesAndGroupProperty(seriesID, groupID, property) is a handy function
				// to easily look up any series dependent property.  'property' can be in
				// dot notation (eg: 'marker.border.width').
				return chart.getSeriesAndGroupProperty(d.seriesID, null, 'color');
			});
			
		svg.append('text')
			.attr('display', function(d,i) { return i%seriesCount? 'none':null;})
			.attr('transform', function(d,i) {
				if (i%seriesCount) 
					return '';
				return 'translate('+ (x(i/seriesCount) + (x.rangeBand() / 2)) + ',' + (h - 5) + ')';})
			.text(function(d, i){
				if (i%seriesCount)
					return '';
				return seriesLabels[i/seriesCount];})
			
		renderConfig.modules.tooltip.updateToolTips();  // Tell the chart engine your chart is ready for tooltips to be added
		renderConfig.modules.dataSelection.activateSelection();  // Tell the chart engine your chart is ready for data selection to be enabled
		renderConfig.renderComplete();
	}
	
	function noDataRenderCallback(renderConfig) {
		var grey = renderConfig.baseColor;
		renderConfig.data = [
			{value: [3, 4]}, {value: [4, 2]}, {value: [5, 3]}, {value: [6, 8]}, {value: [7, 7]}
		];
		renderConfig.moonbeamInstance.getSeries(0).color = grey;
		renderConfig.moonbeamInstance.getSeries(1).color = pv.color(grey).lighter(0.18).color;
		renderCallback(renderConfig);
	}

	// Your extension's configuration
	var config = {
		id: 'com.ibi.compare_2_bars',     // string that uniquely identifies this extension
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
				supported: true  // Set this true if your extension wants to enable HTML tooltips
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