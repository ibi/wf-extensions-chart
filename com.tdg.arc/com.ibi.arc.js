/* globals _*/
(function() {
	// Required: Is invoked in the middle of each Moonbeam draw cycle
	// This is where your extension should be rendered
	// Arguments:
	//  - renderConfig: the standard callback argument object, including additional properties width, height, etc
	
	function preRenderCallback (prerenderConfig) {
		prerenderConfig.moonbeamInstance.legend.visible = false;
	}

	function renderCallback(renderConfig) {

		var chart = renderConfig.moonbeamInstance;
		var props = renderConfig.properties;

		chart.legend.visible = false;

		props.width = renderConfig.width;
		props.height = renderConfig.height;
		props.data = renderConfig.data;

		var container = d3.select(renderConfig.container)
			.attr('class', 'tdg_marker_chart');

		var arc_chart = tdg_arc(props);
		
		arc_chart(container);

		renderConfig.modules.tooltip.updateToolTips();
	}

	// Your extension's configuration
	var config = {
		id: 'com.tdg.arc',  // string that uniquely identifies this extension
		name: 'Chord Diagram',  // colloquial name for your chart - might be used in some extension list UI
		description: 'd3 chord diagram',  // description useful for a UI tooltip or similar
		renderCallback: renderCallback,  // reference to a function that will draw the actual chart.  Will be passed one 'renderConfig' object, defined below
		preRenderCallback: preRenderCallback,
		resources:  {  // Additional external resources (CSS & JS) required by this extension
			script: ['lib/d3.min.js', 'lib/arc.js'],
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
