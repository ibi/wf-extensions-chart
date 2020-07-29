/* globals _*/
// Copyright 1996-2015 Information Builders, Inc. All rights reserved.

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
	//   rootContainer: DOM node containing the overall Moonbeam chart.

	// Required: Is invoked in the middle of each Moonbeam draw cycle
	// This is where your extension should be rendered
	// Arguments:
	//  - renderConfig: the standard callback argument object, including additional properties width, height, etc
	function renderCallback(renderConfig) {
		var chart = renderConfig.moonbeamInstance;
		var props = renderConfig.properties;

		props.width = renderConfig.width;
		props.height = renderConfig.height;
		props.data = [renderConfig.data];
		props.toolTipEnabled = chart.htmlToolTip && chart.htmlToolTip.enabled;

		props.isInteractionDisabled = renderConfig.disableInteraction;
		props.onRenderComplete = chart.processRenderComplete.bind(chart);

		var container = d3.select(renderConfig.container)
			.attr('class', 'com_tdg_chord');
			
		//Start CHART-3146
			// props.renderConfig = renderConfig;  //Propagate renderConfig to com_tdg_chord object creation	causing issue with RangeError VIZ-78
			props.tooltip = renderConfig.modules.tooltip;  
		//End CHART-3146
		
		//Start VIZ-43
		props.tooltipStyle = chart.htmlToolTip.style;	
		//End VIZ-43

		var chordChart = com_tdg_chord(props);

		chordChart(container);

		renderConfig.modules.tooltip.updateToolTips();
	}

	function getInvokeAfter (cb, count) {
			if (!count && typeof cb === 'function' ) cb();

			return function () {
					if (!(--count) && typeof cb === 'function') cb();
			};
	}

	function noDataRenderCallback (renderConfig) {
		var chart = renderConfig.moonbeamInstance;
		var props = renderConfig.properties;

		props.width = renderConfig.width;
		props.height = renderConfig.height;
		props.data = [[{"source":"ENGLAND","target":"INTERCEPTOR III","value":0,"_s":0,"_g":0},{"source":"ENGLAND","target":"TR7","value":0,"_s":0,"_g":1},{"source":"ENGLAND","target":"V12XKE AUTO","value":0,"_s":0,"_g":2},{"source":"ENGLAND","target":"XJ12L AUTO","value":12000,"_s":0,"_g":3},{"source":"FRANCE","target":"504 4 DOOR","value":0,"_s":0,"_g":4},{"source":"ITALY","target":"2000 4 DOOR BERLINA","value":4800,"_s":0,"_g":5},{"source":"ITALY","target":"2000 GT VELOCE","value":12400,"_s":0,"_g":6},{"source":"ITALY","target":"2000 SPIDER VELOCE","value":13000,"_s":0,"_g":7},{"source":"ITALY","target":"DORA 2 DOOR","value":0,"_s":0,"_g":8},{"source":"JAPAN","target":"B210 2 DOOR AUTO","value":43000,"_s":0,"_g":9},{"source":"JAPAN","target":"COROLLA 4 DOOR DIX AUTO","value":35030,"_s":0,"_g":10},{"source":"W GERMANY","target":"100 LS 2 DOOR AUTO","value":7800,"_s":0,"_g":11},{"source":"W GERMANY","target":"2002 2 DOOR","value":8950,"_s":0,"_g":12},{"source":"W GERMANY","target":"2002 2 DOOR AUTO","value":8900,"_s":0,"_g":13},{"source":"W GERMANY","target":"3.0 SI 4 DOOR","value":14000,"_s":0,"_g":14},{"source":"W GERMANY","target":"3.0 SI 4 DOOR AUTO","value":18940,"_s":0,"_g":15},{"source":"W GERMANY","target":"530I 4 DOOR","value":14000,"_s":0,"_g":16},{"source":"W GERMANY","target":"530I 4 DOOR AUTO","value":15600,"_s":0,"_g":17}]];
		props.toolTipEnabled = chart.htmlToolTip && chart.htmlToolTip.enabled;
		//Start VIZ-284 but applied same solution to CHART-3146
			// props.renderConfig = renderConfig;  //Propagate renderConfig to com_tdg_chord object creation	causing issue with RangeError VIZ-78
		props.tooltip = renderConfig.modules.tooltip;  
		//End VIZ-284

		var invokeAfterTwo = getInvokeAfter(chart.processRenderComplete.bind(chart), 2);

		props.isInteractionDisabled = renderConfig.disableInteraction;
		props.onRenderComplete = invokeAfterTwo;

		var container = d3.select(renderConfig.container)
			.attr('class', 'com_tdg_chord');

		var chordChart = com_tdg_chord(props);

		chordChart(container);

		renderConfig.modules.tooltip.updateToolTips();
		appendCoverScreen(container, props.width, props.height);
		invokeAfterTwo();
	}

	function appendCoverScreen (container, width, height) {
		container.append("rect")
			.attrs({
				width: width,
				height: height
			})
			.styles({
				fill: 'white',
				opacity: 0.3
			});

		container.append('text')
			.text('Add more measures or dimensions')
			.attrs({
				'text-anchor': 'middle',
				y: height / 2,
				x: width / 2
			})
			.styles({
				'font-weight' : 'bold',
				'font-size' : '14px',
				dy: '0.35em',
				fill: 'grey'
			});
	}

	// Your extension's configuration
	var config = {
		id: 'com.ibi.chord',  // string that uniquely identifies this extension
		name: 'Chord Diagram',  // colloquial name for your chart - might be used in some extension list UI
		description: 'd3 chord diagram',  // description useful for a UI tooltip or similar
		renderCallback: renderCallback,  // reference to a function that will draw the actual chart.  Will be passed one 'renderConfig' object, defined below
		noDataRenderCallback: noDataRenderCallback,
		resources:  {  // Additional external resources (CSS & JS) required by this extension
			script: window.d3
				? ['lib/chord.js', 'lib/util.js', 'lib/underscore.js','lib/d3-selection-multi.min.js','lib/d3-time.min.js','lib/d3-time-format.min.js','lib/d3-transition.min.js']
				: ['lib/d3.v5.16.min.js', 'lib/chord.js', 'lib/util.js', 'lib/underscore.js','lib/d3-selection-multi.min.js','lib/d3-time.min.js','lib/d3-time-format.min.js','lib/d3-transition.min.js']
		},
		modules: {
			/*dataSelection: {
				supported: true,  // Set this true if your extension wants to enable data selection
				needSVGEventPanel: false, // if you're using an HTML container or altering the SVG container, set this to true and Moonbeam will insert the necessary SVG elements to capture user interactions
				svgNode: function(arg){}  // if you're using an HTML container or altering the SVG container, return a reference to your root SVG node here.
			},*/
			tooltip: {
				supported: true  // Set this true if your extension wants to enable HTML tooltips
			}
		}
	};

	// Required: this call will register your extension with Moonbeam
	tdgchart.extensionManager.register(config);

}());
