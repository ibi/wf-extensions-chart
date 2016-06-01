/* globals _*/
(function() {
	// Optional: if defined, is invoked once at the very beginning of each Moonbeam draw cycle
	// Use this to configure a specific Moonbeam instance before rendering.
	// Arguments: 
	//  - preRenderConfig: the standard callback argument object
	function preRenderCallback(preRenderConfig) {
		preRenderConfig.moonbeamInstance.legend.visible = false;
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

	// Required: Is invoked in the middle of each Moonbeam draw cycle
	// This is where your extension should be rendered
	// Arguments:
	//  - renderConfig: the standard callback argument object, including additional properties width, height, etc
	function renderCallback(renderConfig) {
		var chart = renderConfig.moonbeamInstance;


		/*renderConfig.properties = {
			"axes": {
				"invert": true,
				"numerical" : {
					"labels": {
						"format": "auto",
						"font": "12px serif"
					}
				},
				"ordinal": {
					"labels": {
						"format": "auto",
						"font": "12px serif"
					},
					"title": {
						"font": "16px serif",
						"color": "black"
					}
				}
			},
			"canvas": {
				"ranges": {
					"color": "pink",
					"widthRatio": 0.8,
					"tooltip": {
						"enabled": true
					}
				},
				"markers": {
					"size": 10,
					"stroke": "none",
					"strokeWidth": 1,
					"colors": ["#1f77b4", "#ff7f0e", "#2ca02c", "#d62728", "#9467bd", "#8c564b", "#e377c2", "#7f7f7f", "#bcbd22", "#17becf"],
					"symbols": ["circle", "diamond", "square", "cross" , "triangle-down", "triangle-up"],
					"tooltip": {
						"enabled": true
					}
				}
			},
			"legend": {
				"labels": {
					"font": "12px serif",
					"color": "black"
				}
			}
		};*/

		var props = JSON.parse(JSON.stringify(renderConfig.properties));

		props.width = renderConfig.width;
		props.height = renderConfig.height;
		props.data = renderConfig.data;
		
		props.measureLabel = chart.measureLabel;

		props.formatNumber = chart.formatNumber.bind(chart);

		props.buckets = getFormatedBuckets(renderConfig);

		var container = d3.select(renderConfig.container)
			.attr('class', 'com_tdg_sunburst');

		// ---------------- INIT YOUR EXTENSION HERE

		var range = tdg_range(props);
		range(container);

		// ---------------- END ( INIT YOUR EXTENSION HERE )

		// ---------------- CALL updateToolTips IF YOU USE MOONBEAM TOOLTIP
		renderConfig.modules.tooltip.updateToolTips();
	}

	function noDataRenderCallback (renderConfig) {
		var chart = renderConfig.moonbeamInstance;
		var props = renderConfig.properties;
		
		chart.legend.visible = false;

		props.width = renderConfig.width;
		props.height = renderConfig.height;
		props.data = []; // <------------------------ YOUR DATA

		props.measureLabel = chart.measureLabel;
		props.buckets = getFormatedBuckets(renderConfig);


		var container = d3.select(renderConfig.container)
			.attr('class', 'com_tdg_sunburst');

		// ---------------- INIT YOUR EXTENSION HERE

		//var tdg_sunburst_chart = tdg_sunburst(props);
		//tdg_sunburst_chart(container);

		// ---------------- END ( INIT YOUR EXTENSION HERE )

		// ---------------- CALL updateToolTips IF YOU USE MOONBEAM TOOLTIP
		renderConfig.modules.tooltip.updateToolTips();
		
		// ADD TRANSPARENT SCREEN

		container.append("rect")
			.attr({
				width: props.width,
				height: props.height
			})
			.style({
				fill: 'white',
				opacity: 0.9
			});
		
		// ADD NO DATA TEXT
		
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
		id: 'com.ibi.range',  // string that uniquely identifies this extension
		preRenderCallback: preRenderCallback,  // reference to a function that is called right *before* your extension is rendered.  Will be passed one 'preRenderConfig' object, defined below.  Use this to configure a Monbeam instance as needed
		renderCallback: renderCallback,  // reference to a function that will draw the actual chart.  Will be passed one 'renderConfig' object, defined below
		noDataRenderCallback: noDataRenderCallback,
		resources:  {  // Additional external resources (CSS & JS) required by this extension
			script: ['lib/d3.min.js', 'lib/range.js'],
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