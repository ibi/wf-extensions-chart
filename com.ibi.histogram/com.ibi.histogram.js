/* Copyright (C) 2016-2023. Cloud Software Group, Inc. All rights reserved. */
/* eslint-disable */
/* globals _*/
(function() {
	// Optional: if defined, is invoked once at the very beginning of each Moonbeam draw cycle
	// Use this to configure a specific Moonbeam instance before rendering.
	// Arguments:
	//  - preRenderConfig: the standard callback argument object
	function preRenderCallback(preRenderConfig) {
		preRenderConfig.moonbeamInstance.legend.visible = false;

		/*preRenderConfig.moonbeamInstance.eventDispatcher = { // testing drilling capability
        events: [
          { event: 'setURL', object: 'riser', series: 0, group: 0, url: 'http://google.com' ,target: '_blank' }
        ]
		};*/
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

	function jsonCpy( el ) {
		return JSON.parse(JSON.stringify(el));
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

//		props.data = (renderConfig.data || []).map(function(datum){
//			var datumCpy = jsonCpy(datum);
//			datumCpy.elClassName = chart.buildClassName('riser', datum._s, datum._g, 'bar');
//			return datumCpy;
//		});

		props.data = renderConfig.data;
		props.measureLabel = chart.measureLabel;
		props.formatNumber = chart.formatNumber.bind(chart);

		props.buckets = getFormatedBuckets(renderConfig);

		props.isInteractionDisabled = renderConfig.disableInteraction;

		var container = d3.select(renderConfig.container)
			.attr('class', 'com_tdg_histogram');

		// ---------------- INIT YOUR EXTENSION HERE


		var histogram = tdg_histogram(props);
		container.call(histogram);

		d3.selectAll('g.riser rect').attr('class', function(d, g) {
			return chart.buildClassName('riser', 0, g, 'bar');
		})
		.each(function(d, g) {
			var chart_datum = chart.getDataFromIds({series: 0, group: g});
			if (chart_datum && chart_datum.d) {
				chart_datum.d.value = ((d || {}).tooltip || {}).count;
			}
			renderConfig.modules.tooltip.addDefaultToolTipContent(this, 0, g, d);
		});

		// ---------------- END ( INIT YOUR EXTENSION HERE )

		// ---------------- CALL updateToolTips IF YOU USE MOONBEAM TOOLTIP

		renderConfig.renderComplete();

		// renderConfig.modules.tooltip.updateToolTips();
		// chart.processRenderComplete();
	}

	function noDataRenderCallback (renderConfig) {
		var chart = renderConfig.moonbeamInstance;
		var props = renderConfig.properties;

		chart.legend.visible = false;

		props.width = renderConfig.width;
		props.height = renderConfig.height;
		props.data = [{"value":73,"_s":0,"_g":0},{"value":1,"_s":0,"_g":1},{"value":26,"_s":0,"_g":2},{"value":54,"_s":0,"_g":3},{"value":32,"_s":0,"_g":4},{"value":52,"_s":0,"_g":5},{"value":23,"_s":0,"_g":6},{"value":35,"_s":0,"_g":7},{"value":19,"_s":0,"_g":8},{"value":51,"_s":0,"_g":9},{"value":60,"_s":0,"_g":10},{"value":50,"_s":0,"_g":11},{"value":22,"_s":0,"_g":12},{"value":97,"_s":0,"_g":13},{"value":25,"_s":0,"_g":14},{"value":93,"_s":0,"_g":15},{"value":43,"_s":0,"_g":16},{"value":67,"_s":0,"_g":17},{"value":59,"_s":0,"_g":18},{"value":24,"_s":0,"_g":19},{"value":0,"_s":0,"_g":20},{"value":21,"_s":0,"_g":21},{"value":4,"_s":0,"_g":22},{"value":73,"_s":0,"_g":23},{"value":32,"_s":0,"_g":24},{"value":87,"_s":0,"_g":25},{"value":89,"_s":0,"_g":26},{"value":41,"_s":0,"_g":27},{"value":61,"_s":0,"_g":28},{"value":4,"_s":0,"_g":29},{"value":59,"_s":0,"_g":30},{"value":93,"_s":0,"_g":31},{"value":0,"_s":0,"_g":32},{"value":54,"_s":0,"_g":33},{"value":16,"_s":0,"_g":34},{"value":11,"_s":0,"_g":35},{"value":33,"_s":0,"_g":36},{"value":26,"_s":0,"_g":37},{"value":21,"_s":0,"_g":38},{"value":7,"_s":0,"_g":39},{"value":0,"_s":0,"_g":40},{"value":69,"_s":0,"_g":41},{"value":52,"_s":0,"_g":42},{"value":5,"_s":0,"_g":43},{"value":49,"_s":0,"_g":44},{"value":51,"_s":0,"_g":45},{"value":74,"_s":0,"_g":46},{"value":85,"_s":0,"_g":47},{"value":24,"_s":0,"_g":48},{"value":32,"_s":0,"_g":49},{"value":7,"_s":0,"_g":50},{"value":15,"_s":0,"_g":51},{"value":45,"_s":0,"_g":52},{"value":55,"_s":0,"_g":53},{"value":79,"_s":0,"_g":54},{"value":46,"_s":0,"_g":55},{"value":83,"_s":0,"_g":56},{"value":14,"_s":0,"_g":57},{"value":88,"_s":0,"_g":58},{"value":81,"_s":0,"_g":59},{"value":77,"_s":0,"_g":60},{"value":86,"_s":0,"_g":61},{"value":92,"_s":0,"_g":62},{"value":61,"_s":0,"_g":63},{"value":24,"_s":0,"_g":64},{"value":75,"_s":0,"_g":65},{"value":49,"_s":0,"_g":66},{"value":26,"_s":0,"_g":67},{"value":64,"_s":0,"_g":68},{"value":96,"_s":0,"_g":69},{"value":15,"_s":0,"_g":70},{"value":7,"_s":0,"_g":71},{"value":91,"_s":0,"_g":72},{"value":50,"_s":0,"_g":73},{"value":60,"_s":0,"_g":74},{"value":92,"_s":0,"_g":75},{"value":68,"_s":0,"_g":76},{"value":24,"_s":0,"_g":77},{"value":24,"_s":0,"_g":78},{"value":63,"_s":0,"_g":79},{"value":56,"_s":0,"_g":80},{"value":88,"_s":0,"_g":81},{"value":3,"_s":0,"_g":82},{"value":17,"_s":0,"_g":83},{"value":83,"_s":0,"_g":84},{"value":99,"_s":0,"_g":85},{"value":94,"_s":0,"_g":86},{"value":63,"_s":0,"_g":87},{"value":11,"_s":0,"_g":88},{"value":38,"_s":0,"_g":89},{"value":30,"_s":0,"_g":90},{"value":83,"_s":0,"_g":91},{"value":80,"_s":0,"_g":92},{"value":7,"_s":0,"_g":93},{"value":49,"_s":0,"_g":94},{"value":65,"_s":0,"_g":95},{"value":66,"_s":0,"_g":96},{"value":58,"_s":0,"_g":97},{"value":35,"_s":0,"_g":98},{"value":97,"_s":0,"_g":99},{"value":56,"_s":0,"_g":100},{"value":6,"_s":0,"_g":101},{"value":45,"_s":0,"_g":102},{"value":38,"_s":0,"_g":103},{"value":38,"_s":0,"_g":104},{"value":46,"_s":0,"_g":105},{"value":65,"_s":0,"_g":106},{"value":32,"_s":0,"_g":107},{"value":84,"_s":0,"_g":108},{"value":15,"_s":0,"_g":109},{"value":57,"_s":0,"_g":110},{"value":87,"_s":0,"_g":111},{"value":69,"_s":0,"_g":112},{"value":76,"_s":0,"_g":113},{"value":27,"_s":0,"_g":114},{"value":26,"_s":0,"_g":115},{"value":76,"_s":0,"_g":116},{"value":78,"_s":0,"_g":117},{"value":39,"_s":0,"_g":118},{"value":6,"_s":0,"_g":119},{"value":54,"_s":0,"_g":120},{"value":29,"_s":0,"_g":121},{"value":82,"_s":0,"_g":122},{"value":54,"_s":0,"_g":123},{"value":64,"_s":0,"_g":124},{"value":54,"_s":0,"_g":125},{"value":45,"_s":0,"_g":126},{"value":61,"_s":0,"_g":127},{"value":24,"_s":0,"_g":128},{"value":32,"_s":0,"_g":129},{"value":80,"_s":0,"_g":130},{"value":43,"_s":0,"_g":131},{"value":6,"_s":0,"_g":132},{"value":71,"_s":0,"_g":133},{"value":98,"_s":0,"_g":134},{"value":3,"_s":0,"_g":135},{"value":11,"_s":0,"_g":136},{"value":68,"_s":0,"_g":137},{"value":2,"_s":0,"_g":138},{"value":15,"_s":0,"_g":139},{"value":12,"_s":0,"_g":140},{"value":88,"_s":0,"_g":141},{"value":10,"_s":0,"_g":142},{"value":90,"_s":0,"_g":143},{"value":7,"_s":0,"_g":144},{"value":58,"_s":0,"_g":145},{"value":89,"_s":0,"_g":146},{"value":12,"_s":0,"_g":147},{"value":63,"_s":0,"_g":148},{"value":80,"_s":0,"_g":149},{"value":13,"_s":0,"_g":150},{"value":92,"_s":0,"_g":151},{"value":79,"_s":0,"_g":152},{"value":27,"_s":0,"_g":153},{"value":84,"_s":0,"_g":154},{"value":46,"_s":0,"_g":155},{"value":19,"_s":0,"_g":156},{"value":55,"_s":0,"_g":157},{"value":31,"_s":0,"_g":158},{"value":63,"_s":0,"_g":159},{"value":77,"_s":0,"_g":160},{"value":91,"_s":0,"_g":161},{"value":0,"_s":0,"_g":162},{"value":92,"_s":0,"_g":163},{"value":53,"_s":0,"_g":164},{"value":85,"_s":0,"_g":165},{"value":2,"_s":0,"_g":166},{"value":11,"_s":0,"_g":167},{"value":76,"_s":0,"_g":168},{"value":88,"_s":0,"_g":169},{"value":52,"_s":0,"_g":170},{"value":65,"_s":0,"_g":171},{"value":53,"_s":0,"_g":172},{"value":23,"_s":0,"_g":173},{"value":13,"_s":0,"_g":174},{"value":17,"_s":0,"_g":175},{"value":40,"_s":0,"_g":176},{"value":62,"_s":0,"_g":177},{"value":7,"_s":0,"_g":178},{"value":70,"_s":0,"_g":179},{"value":55,"_s":0,"_g":180},{"value":75,"_s":0,"_g":181},{"value":54,"_s":0,"_g":182},{"value":71,"_s":0,"_g":183},{"value":68,"_s":0,"_g":184},{"value":13,"_s":0,"_g":185},{"value":5,"_s":0,"_g":186},{"value":17,"_s":0,"_g":187},{"value":95,"_s":0,"_g":188},{"value":24,"_s":0,"_g":189},{"value":32,"_s":0,"_g":190},{"value":94,"_s":0,"_g":191},{"value":56,"_s":0,"_g":192},{"value":60,"_s":0,"_g":193},{"value":44,"_s":0,"_g":194},{"value":58,"_s":0,"_g":195},{"value":26,"_s":0,"_g":196},{"value":78,"_s":0,"_g":197},{"value":30,"_s":0,"_g":198},{"value":67,"_s":0,"_g":199}];
		props.measureLabel = chart.measureLabel.bind(chart);
		props.formatNumber = chart.formatNumber.bind(chart);

		props.buckets = {"value":["value"]};

		var container = d3.select(renderConfig.container)
			.attr('class', 'com_tdg_histogram');

		var histogram = tdg_histogram(props);
		container.call(histogram);

		// ---------------- INIT YOUR EXTENSION HERE


		// ---------------- END ( INIT YOUR EXTENSION HERE )

		// ---------------- CALL updateToolTips IF YOU USE MOONBEAM TOOLTIP
		//renderConfig.modules.tooltip.updateToolTips();

		// ADD TRANSPARENT SCREEN

		container.append("rect")
			.attr({
				width: props.width,
				height: props.height
			})
			.style({
				fill: 'white',
				opacity: 0.7
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
				'font-size' : '14px',
				dy: '0.35em',
				fill: 'grey'
			});

		renderConfig.renderComplete();
	}

	// Your extension's configuration
	var config = {
		id: 'com.ibi.histogram',  // string that uniquely identifies this extension
		preRenderCallback: preRenderCallback,  // reference to a function that is called right *before* your extension is rendered.  Will be passed one 'preRenderConfig' object, defined below.  Use this to configure a Monbeam instance as needed
		renderCallback: renderCallback,  // reference to a function that will draw the actual chart.  Will be passed one 'renderConfig' object, defined below
		noDataRenderCallback: noDataRenderCallback,
		resources:  {  // Additional external resources (CSS & JS) required by this extension
			script: ['lib/d3.min.js', 'lib/histogram.js']
		},
		modules: {
			eventHandler: {
				supported: true
			},
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
