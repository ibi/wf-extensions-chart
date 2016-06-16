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
		var props = renderConfig.properties;

		props.width = renderConfig.width;
		props.height = renderConfig.height;
		props.data = renderConfig.data;
		props.buckets = getFormatedBuckets(renderConfig);

        props.measureLabel = chart.measureLabel;
        props.formatNumber = chart.formatNumber;

		var container = d3.select(renderConfig.container)
			.attr('class', 'com_tdg_sunburst');

		// ---------------- INIT YOUR EXTENSION HERE

		var tdg_choropleth_chart = tdg_usa_choropleth(props);
		tdg_choropleth_chart(container);

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
		props.data = [{"state":"Alabama","value":7900000000,"_s":0,"_g":0},{"state":"Alaska","value":800000000,"_s":0,"_g":1},{"state":"Arizona","value":1700000000,"_s":0,"_g":2},{"state":"Arkansas","value":6600000000,"_s":0,"_g":3},{"state":"California","value":7200000000,"_s":0,"_g":4},{"state":"Colorado","value":9000000000,"_s":0,"_g":5},{"state":"Connecticut","value":4900000000,"_s":0,"_g":6},{"state":"Delaware","value":5600000000,"_s":0,"_g":7},{"state":"Florida","value":3000000000,"_s":0,"_g":8},{"state":"Georgia","value":1500000000,"_s":0,"_g":9},{"state":"Hawaii","value":8200000000,"_s":0,"_g":10},{"state":"Idaho","value":9700000000,"_s":0,"_g":11},{"state":"Illinois","value":7700000000,"_s":0,"_g":12},{"state":"Indiana","value":900000000,"_s":0,"_g":13},{"state":"Iowa","value":1500000000,"_s":0,"_g":14},{"state":"Kansas","value":5200000000,"_s":0,"_g":15},{"state":"Kentucky","value":9500000000,"_s":0,"_g":16},{"state":"Louisiana","value":2100000000,"_s":0,"_g":17},{"state":"Maine","value":800000000,"_s":0,"_g":18},{"state":"Maryland","value":4500000000,"_s":0,"_g":19},{"state":"Massachusetts","value":1300000000,"_s":0,"_g":20},{"state":"Michigan","value":9600000000,"_s":0,"_g":21},{"state":"Minnesota","value":7400000000,"_s":0,"_g":22},{"state":"Mississippi","value":5100000000,"_s":0,"_g":23},{"state":"Missouri","value":200000000,"_s":0,"_g":24},{"state":"Montana","value":5100000000,"_s":0,"_g":25},{"state":"Nebraska","value":4500000000,"_s":0,"_g":26},{"state":"Nevada","value":9200000000,"_s":0,"_g":27},{"state":"New Hampshire","value":9400000000,"_s":0,"_g":28},{"state":"New Jersey","value":8100000000,"_s":0,"_g":29},{"state":"New Mexico","value":2400000000,"_s":0,"_g":30},{"state":"New York","value":7000000000,"_s":0,"_g":31},{"state":"North Carolina","value":1200000000,"_s":0,"_g":32},{"state":"North Dakota","value":6300000000,"_s":0,"_g":33},{"state":"Ohio","value":5800000000,"_s":0,"_g":34},{"state":"Oklahoma","value":8300000000,"_s":0,"_g":35},{"state":"Oregon","value":4800000000,"_s":0,"_g":36},{"state":"Pennsylvania","value":6000000000,"_s":0,"_g":37},{"state":"Rhode Island","value":8800000000,"_s":0,"_g":38},{"state":"South Carolina","value":2100000000,"_s":0,"_g":39},{"state":"South Dakota","value":2400000000,"_s":0,"_g":40},{"state":"Tennessee","value":6600000000,"_s":0,"_g":41},{"state":"Texas","value":2400000000,"_s":0,"_g":42},{"state":"Utah","value":2900000000,"_s":0,"_g":43},{"state":"Vermont","value":2400000000,"_s":0,"_g":44},{"state":"Virginia","value":9100000000,"_s":0,"_g":45},{"state":"Washington","value":800000000,"_s":0,"_g":46},{"state":"West Virginia","value":5200000000,"_s":0,"_g":47},{"state":"Wisconsin","value":1200000000,"_s":0,"_g":48},{"state":"Wyoming","value":4700000000,"_s":0,"_g":49}]; // <------------------------ YOUR DATA

		props.buckets = {"state":["state"],"value":["value"]};

		props.measureLabel = chart.measureLabel;
        props.formatNumber = chart.formatNumber;

		var container = d3.select(renderConfig.container)
			.attr('class', 'com_tdg_sunburst');

		// ---------------- INIT YOUR EXTENSION HERE

		var tdg_choropleth_chart = tdg_usa_choropleth(props);
		tdg_choropleth_chart(container);

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
		id: 'com.ibi.map.usa.choropleth',  // string that uniquely identifies this extension
		preRenderCallback: preRenderCallback,  // reference to a function that is called right *before* your extension is rendered.  Will be passed one 'preRenderConfig' object, defined below.  Use this to configure a Monbeam instance as needed
		renderCallback: renderCallback,  // reference to a function that will draw the actual chart.  Will be passed one 'renderConfig' object, defined below
		noDataRenderCallback: noDataRenderCallback,
		resources:  {  // Additional external resources (CSS & JS) required by this extension
			script: ['lib/d3.min.js', 'lib/usa_choropleth.js'],
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