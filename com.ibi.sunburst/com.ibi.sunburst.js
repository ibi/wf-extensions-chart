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
		props.data = [{"levels":["100 LS 2 DOOR AUTO","AUDI","W GERMANY"],"value":5,"_s":0,"_g":0},{"levels":["2000 4 DOOR BERLINA","ALFA ROMEO","ITALY"],"value":4,"_s":0,"_g":1},{"levels":["2000 GT VELOCE","ALFA ROMEO","ITALY"],"value":2,"_s":0,"_g":2},{"levels":["2000 SPIDER VELOCE","ALFA ROMEO","ITALY"],"value":2,"_s":0,"_g":3},{"levels":["2002 2 DOOR","BMW","W GERMANY"],"value":5,"_s":0,"_g":4},{"levels":["2002 2 DOOR AUTO","BMW","W GERMANY"],"value":4,"_s":0,"_g":5},{"levels":["3.0 SI 4 DOOR","BMW","W GERMANY"],"value":5,"_s":0,"_g":6},{"levels":["3.0 SI 4 DOOR AUTO","BMW","W GERMANY"],"value":5,"_s":0,"_g":7},{"levels":["504 4 DOOR","PEUGEOT","FRANCE"],"value":5,"_s":0,"_g":8},{"levels":["530I 4 DOOR","BMW","W GERMANY"],"value":5,"_s":0,"_g":9},{"levels":["530I 4 DOOR AUTO","BMW","W GERMANY"],"value":5,"_s":0,"_g":10},{"levels":["B210 2 DOOR AUTO","DATSUN","JAPAN"],"value":4,"_s":0,"_g":11},{"levels":["COROLLA 4 DOOR DIX AUTO","TOYOTA","JAPAN"],"value":4,"_s":0,"_g":12},{"levels":["DORA 2 DOOR","MASERATI","ITALY"],"value":2,"_s":0,"_g":13},{"levels":["INTERCEPTOR III","JENSEN","ENGLAND"],"value":4,"_s":0,"_g":14},{"levels":["TR7","TRIUMPH","ENGLAND"],"value":2,"_s":0,"_g":15},{"levels":["V12XKE AUTO","JAGUAR","ENGLAND"],"value":2,"_s":0,"_g":16},{"levels":["XJ12L AUTO","JAGUAR","ENGLAND"],"value":5,"_s":0,"_g":17}];

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