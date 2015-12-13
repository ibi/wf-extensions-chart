/* globals _*/
(function() {
	// Optional: if defined, is invoked once at the very beginning of each Moonbeam draw cycle
	// Use this to configure a specific Moonbeam instance before rendering.
	// Arguments: 
	//  - preRenderConfig: the standard callback argument object
	function preRenderCallback(preRenderConfig) {
		preRenderConfig.moonbeamInstance.legend.visible = false;
	}

	// Required: Is invoked in the middle of each Moonbeam draw cycle
	// This is where your extension should be rendered
	// Arguments:
	//  - renderConfig: the standard callback argument object, including additional properties width, height, etc
	function renderCallback(renderConfig) {
		var chart = renderConfig.moonbeamInstance;
		var props = renderConfig.properties;

		props.width = renderConfig.width;
		props.height = renderConfig.height;
		props.data = renderConfig.data;
		
		var container = d3.select(renderConfig.container)
			.attr('class', 'com_tdg_sunburst');

		var tdg_sunburst_chart = tdg_sunburst(props);
		
		tdg_sunburst_chart(container);

		renderConfig.modules.tooltip.updateToolTips();
	}

	function noDataRenderCallback (renderConfig) {
		var chart = renderConfig.moonbeamInstance;
		var props = renderConfig.properties;
		
		chart.legend.visible = false;

		props.width = renderConfig.width;
		props.height = renderConfig.height;
		props.data = [{"level1":"ENGLAND","level2":"JAGUAR","value":18621,"_s":0,"_g":0},{"level1":"ENGLAND","level2":"JENSEN","value":14940,"_s":0,"_g":1},{"level1":"ENGLAND","level2":"TRIUMPH","value":4292,"_s":0,"_g":2},{"level1":"FRANCE","level2":"PEUGEOT","value":4631,"_s":0,"_g":3},{"level1":"ITALY","level2":"ALFA ROMEO","value":16235,"_s":0,"_g":4},{"level1":"ITALY","level2":"MASERATI","value":25000,"_s":0,"_g":5},{"level1":"JAPAN","level2":"DATSUN","value":2626,"_s":0,"_g":6},{"level1":"JAPAN","level2":"TOYOTA","value":2886,"_s":0,"_g":7},{"level1":"W GERMANY","level2":"AUDI","value":5063,"_s":0,"_g":8},{"level1":"W GERMANY","level2":"BMW","value":49500,"_s":0,"_g":9}];

		var container = d3.select(renderConfig.container)
			.attr('class', 'com_tdg_sunburst');

		var tdg_sunburst_chart = tdg_sunburst(props);
		
		tdg_sunburst_chart(container);

		renderConfig.modules.tooltip.updateToolTips();
		
		container.append("rect")
			.attr({
				width: props.width,
				height: props.height
			})
			.style({
				fill: 'white',
				opacity: 0.9
			});
		
		container.append('text')
			.text('Add more measures or dimensions')
			.attr({
				'text-anchor': 'middle',
				y: props.height / 2,
				x: props.width / 2
			})
			.style({
				'font-weight' : 'bold',
				'font-size' : '14',
				dy: '0.35em',
				fill: 'grey'
			});
		
	}

	// Your extension's configuration
	var config = {
		id: 'com.ibi.sunburst',  // string that uniquely identifies this extension
		preRenderCallback: preRenderCallback,  // reference to a function that is called right *before* your extension is rendered.  Will be passed one 'preRenderConfig' object, defined below.  Use this to configure a Monbeam instance as needed
		renderCallback: renderCallback,  // reference to a function that will draw the actual chart.  Will be passed one 'renderConfig' object, defined below
		noDataRenderCallback: noDataRenderCallback,
		resources:  {  // Additional external resources (CSS & JS) required by this extension
			script: ['lib/d3.min.js', 'lib/sunburst.js'],
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