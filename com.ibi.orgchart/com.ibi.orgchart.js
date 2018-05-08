/* globals _*/
(function() {
	// Optional: if defined, is invoked once at the very beginning of each Moonbeam draw cycle
	// Use this to configure a specific Moonbeam instance before rendering.
	// Arguments:
	//  - preRenderConfig: the standard callback argument object
	function preRenderCallback(preRenderConfig) {
		preRenderConfig.moonbeamInstance.legend.visible = false;
	}

	function getFormatedBuckets(renderConfig) {
        if (!renderConfig.dataBuckets || !renderConfig.dataBuckets.buckets) {
            return;
        }
        var bkts = renderConfig.dataBuckets.buckets,
            modif_bkts = {};
        for (var bkt in bkts) {
            if (bkts.hasOwnProperty(bkt)) {
                modif_bkts[bkt] = Array.isArray(bkts[bkt].title) ? bkts[bkt].title : [bkts[bkt].title];
            }
        }

        return modif_bkts;
    }

	// Required: Is invoked in the middle of each Moonbeam draw cycle
	// This is where your extension should be rendered
	// Arguments:
	//  - renderConfig: the standard callback argument object, including additional properties width, height, etc
	function renderCallback(renderConfig) {
		var chart = renderConfig.moonbeamInstance;
		var props = JSON.parse(JSON.stringify(renderConfig.properties));

		props.width = renderConfig.width;
		props.height = renderConfig.height;
		props.data = renderConfig.data;
		props.levelTitles = (renderConfig.dataBuckets.buckets.levels) ? renderConfig.dataBuckets.buckets.levels.title : null;
		props.valueTitle = (renderConfig.dataBuckets.buckets.value) ? renderConfig.dataBuckets.buckets.value.title : null;

		props.isInteractionDisabled = renderConfig.disableInteraction;

		props.buckets = getFormatedBuckets(renderConfig);

		props.measureLabel = chart.measureLabel;
		props.formatNumber = chart.formatNumber;

		var hierarchy = tdghierarchy.init(props);

		//Start CHART-2947 issue with FireFox getBBox issue on hidden svg elements
		try {
			var container = d3.select(renderConfig.container)
				.attr('class', 'com_tdg_hierarchy')
				.call(hierarchy);
		}
		catch(err) {
			console.log(err);
		}
		//END CHART-2947

		chart.processRenderComplete();

		renderConfig.modules.tooltip.updateToolTips();
	}

	function noDataRenderCallback (renderConfig) {
		var chart = renderConfig.moonbeamInstance;
		var props = renderConfig.properties;

		chart.legend.visible = false;

		props.width = renderConfig.width;
		props.height = renderConfig.height;
		props.data = [{"levels":["ENGLAND","JAGUAR","V12XKE AUTO","CONVERTIBLE"],"_s":0,"_g":0},{"levels":["ENGLAND","JAGUAR","XJ12L AUTO","SEDAN"],"_s":0,"_g":1},{"levels":["ENGLAND","JENSEN","INTERCEPTOR III","SEDAN"],"_s":0,"_g":2},{"levels":["ENGLAND","TRIUMPH","TR7","HARDTOP"],"_s":0,"_g":3},{"levels":["FRANCE","PEUGEOT","504 4 DOOR","SEDAN"],"_s":0,"_g":4},{"levels":["ITALY","ALFA ROMEO","2000 4 DOOR BERLINA","SEDAN"],"_s":0,"_g":5},{"levels":["ITALY","ALFA ROMEO","2000 GT VELOCE","COUPE"],"_s":0,"_g":6},{"levels":["ITALY","ALFA ROMEO","2000 SPIDER VELOCE","ROADSTER"],"_s":0,"_g":7},{"levels":["ITALY","MASERATI","DORA 2 DOOR","COUPE"],"_s":0,"_g":8},{"levels":["JAPAN","DATSUN","B210 2 DOOR AUTO","SEDAN"],"_s":0,"_g":9},{"levels":["JAPAN","TOYOTA","COROLLA 4 DOOR DIX AUTO","SEDAN"],"_s":0,"_g":10},{"levels":["W GERMANY","AUDI","100 LS 2 DOOR AUTO","SEDAN"],"_s":0,"_g":11},{"levels":["W GERMANY","BMW","2002 2 DOOR","SEDAN"],"_s":0,"_g":12},{"levels":["W GERMANY","BMW","2002 2 DOOR AUTO","SEDAN"],"_s":0,"_g":13},{"levels":["W GERMANY","BMW","3.0 SI 4 DOOR","SEDAN"],"_s":0,"_g":14},{"levels":["W GERMANY","BMW","3.0 SI 4 DOOR AUTO","SEDAN"],"_s":0,"_g":15},{"levels":["W GERMANY","BMW","530I 4 DOOR","SEDAN"],"_s":0,"_g":16},{"levels":["W GERMANY","BMW","530I 4 DOOR AUTO","SEDAN"],"_s":0,"_g":17}];

		props.buckets = getFormatedBuckets(renderConfig);

		props.measureLabel = chart.measureLabel;
		props.formatNumber = chart.formatNumber;

		var hierarchy = tdghierarchy.init(props);
		
		//Start CHART-2947 issue with FireFox getBBox issue on hidden svg elements
		try {
			var container = d3.select(renderConfig.container)
				.attr('class', 'com_tdg_hierarchy')
				.call(hierarchy);

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
				
		} //try
		catch(err) {
			console.log(err);
		} //catch
		//End CHART-2947


		chart.processRenderComplete();
	}

	// Your extension's configuration
	var config = {
		id: 'com.ibi.orgchart',  // string that uniquely identifies this extension
		preRenderCallback: preRenderCallback,  // reference to a function that is called right *before* your extension is rendered.  Will be passed one 'preRenderConfig' object, defined below.  Use this to configure a Monbeam instance as needed
		renderCallback: renderCallback,  // reference to a function that will draw the actual chart.  Will be passed one 'renderConfig' object, defined below
		noDataRenderCallback: noDataRenderCallback,
		resources:  {  // Additional external resources (CSS & JS) required by this extension
			script: ['lib/d3.min.js', 'lib/hierarchy.js', 'lib/dagre-d3.js'],
			css: ['css/style.css']
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
	

	window.onbeforeunload = function (e) {
								debugger;        
							}
	

}());
