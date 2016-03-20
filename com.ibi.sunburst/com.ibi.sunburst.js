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
		props.data = [{"levels":["ENGLAND","JAGUAR","CONVERTIBLE","V12XKE AUTO"],"value":0,"_s":0,"_g":0},{"levels":["ENGLAND","JAGUAR","SEDAN","XJ12L AUTO"],"value":12000,"_s":0,"_g":1},{"levels":["ENGLAND","JENSEN","SEDAN","INTERCEPTOR III"],"value":0,"_s":0,"_g":2},{"levels":["ENGLAND","TRIUMPH","HARDTOP","TR7"],"value":0,"_s":0,"_g":3},{"levels":["FRANCE","PEUGEOT","SEDAN","504 4 DOOR"],"value":0,"_s":0,"_g":4},{"levels":["ITALY","ALFA ROMEO","COUPE","2000 GT VELOCE"],"value":12400,"_s":0,"_g":5},{"levels":["ITALY","ALFA ROMEO","ROADSTER","2000 SPIDER VELOCE"],"value":13000,"_s":0,"_g":6},{"levels":["ITALY","ALFA ROMEO","SEDAN","2000 4 DOOR BERLINA"],"value":4800,"_s":0,"_g":7},{"levels":["ITALY","MASERATI","COUPE","DORA 2 DOOR"],"value":0,"_s":0,"_g":8},{"levels":["JAPAN","DATSUN","SEDAN","B210 2 DOOR AUTO"],"value":43000,"_s":0,"_g":9},{"levels":["JAPAN","TOYOTA","SEDAN","COROLLA 4 DOOR DIX AUTO"],"value":35030,"_s":0,"_g":10},{"levels":["W GERMANY","AUDI","SEDAN","100 LS 2 DOOR AUTO"],"value":7800,"_s":0,"_g":11},{"levels":["W GERMANY","BMW","SEDAN","2002 2 DOOR"],"value":8950,"_s":0,"_g":12},{"levels":["W GERMANY","BMW","SEDAN","2002 2 DOOR AUTO"],"value":8900,"_s":0,"_g":13},{"levels":["W GERMANY","BMW","SEDAN","3.0 SI 4 DOOR"],"value":14000,"_s":0,"_g":14},{"levels":["W GERMANY","BMW","SEDAN","3.0 SI 4 DOOR AUTO"],"value":18940,"_s":0,"_g":15},{"levels":["W GERMANY","BMW","SEDAN","530I 4 DOOR"],"value":14000,"_s":0,"_g":16},{"levels":["W GERMANY","BMW","SEDAN","530I 4 DOOR AUTO"],"value":15600,"_s":0,"_g":17}];

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