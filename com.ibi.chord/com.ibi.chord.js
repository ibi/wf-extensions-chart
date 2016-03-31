/* globals _*/

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
		
		var container = d3.select(renderConfig.container)
			.attr('class', 'com_tdg_chord');

		var chordChart = com_tdg_chord(props);
		
		chordChart(container);

		renderConfig.modules.tooltip.updateToolTips();
	}

	function noDataRenderCallback (renderConfig) {
		var chart = renderConfig.moonbeamInstance;
		var props = renderConfig.properties;
		
		props.width = renderConfig.width;
		props.height = renderConfig.height;
		props.data = [[{"source":"Group_1","target":"Group_1","value":11975,"_s":0,"_g":0},{"source":"Group_1","target":"Group_2","value":5871,"_s":0,"_g":1},{"source":"Group_1","target":"Group_3","value":8916,"_s":0,"_g":2},{"source":"Group_1","target":"Group_4","value":2868,"_s":0,"_g":3},{"source":"Group_1","target":"Group_5","value":7651,"_s":0,"_g":4},{"source":"Group_1","target":"Group_6","value":1235,"_s":0,"_g":5},{"source":"Group_2","target":"Group_1","value":1951,"_s":0,"_g":6},{"source":"Group_2","target":"Group_2","value":10048,"_s":0,"_g":7},{"source":"Group_2","target":"Group_3","value":2060,"_s":0,"_g":8},{"source":"Group_2","target":"Group_4","value":6176,"_s":0,"_g":9},{"source":"Group_2","target":"Group_5","value":7651,"_s":0,"_g":10},{"source":"Group_3","target":"Group_1","value":8010,"_s":0,"_g":11},{"source":"Group_3","target":"Group_2","value":16145,"_s":0,"_g":12},{"source":"Group_3","target":"Group_3","value":8090,"_s":0,"_g":13},{"source":"Group_3","target":"Group_4","value":8045,"_s":0,"_g":14},{"source":"Group_3","target":"Group_5","value":7651,"_s":0,"_g":15},{"source":"Group_4","target":"Group_1","value":1013,"_s":0,"_g":16},{"source":"Group_4","target":"Group_2","value":990,"_s":0,"_g":17},{"source":"Group_4","target":"Group_3","value":940,"_s":0,"_g":18},{"source":"Group_4","target":"Group_4","value":6907,"_s":0,"_g":19},{"source":"Group_4","target":"Group_5","value":7651,"_s":0,"_g":20},{"source":"Group_5","target":"Group_1","value":1013,"_s":0,"_g":21},{"source":"Group_5","target":"Group_2","value":990,"_s":0,"_g":22},{"source":"Group_5","target":"Group_3","value":940,"_s":0,"_g":23},{"source":"Group_5","target":"Group_4","value":6907,"_s":0,"_g":24},{"source":"Group_5","target":"Group_5","value":7651,"_s":0,"_g":25}]];
		props.toolTipEnabled = chart.htmlToolTip && chart.htmlToolTip.enabled;
		
		var container = d3.select(renderConfig.container)
			.attr('class', 'com_tdg_chord');

		var chordChart = com_tdg_chord(props);
		
		chordChart(container);

		renderConfig.modules.tooltip.updateToolTips();
		appendCoverScreen(container, props.width, props.height);
	}

	function appendCoverScreen (container, width, height) {
		container.append("rect")
			.attr({
				width: width,
				height: height
			})
			.style({
				fill: 'white',
				opacity: 0.9
			});
		
		container.append('text')
			.text('Add more measures or dimensions')
			.attr({
				'text-anchor': 'middle',
				y: height / 2,
				x: width / 2
			})
			.style({
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
			script: ['lib/d3.min.js', 'lib/chord.js', 'lib/util.js', 'lib/underscore.js'],
			css: []
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