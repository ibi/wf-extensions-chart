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
		var props = JSON.parse(JSON.stringify(renderConfig.properties));
		
		props.renderConfig = renderConfig;   //For CHART-2954 NFR, need access to renderConfig.chart and renderConfig.modules inside tdg_usmap function

		props.buckets = getFormatedBuckets(renderConfig);
		if (!props.buckets || !props.buckets.src) {
			return noDataRenderCallback(renderConfig);
		}

		props.width = renderConfig.width;
		props.height = renderConfig.height;
		props.data = renderConfig.data;
		props.measureLabel = chart.measureLabel;

		props.states = tdg_usmap_states;
		props.airports = tdg_usmap_airports;

		props.isInteractionDisabled = renderConfig.disableInteraction;

		props.onRenderComplete = chart.processRenderComplete.bind(chart);

		var container = d3.select(renderConfig.container)
			.attr('class', 'com_tdg_sunburst');

		// ---------------- INIT YOUR EXTENSION HERE

		var tdg_usmap_chart = tdg_usmap(props);
		tdg_usmap_chart(container);

		// ---------------- END ( INIT YOUR EXTENSION HERE )

		// ---------------- CALL updateToolTips IF YOU USE MOONBEAM TOOLTIP
		if (!renderConfig.disableInteraction) {
			renderConfig.modules.tooltip.updateToolTips();
		}
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

		props.renderConfig = renderConfig;   //For CHART-2954 NFR and CHART-3172: need access to renderConfig.chart and renderConfig.modules inside tdg_usmap function		
			
		chart.legend.visible = false;

		props.width = renderConfig.width;
		props.height = renderConfig.height;
		props.data = [{"src":"ABQ","dst":"LAX","size":9,"_s":0,"_g":0},{"src":"ALB","dst":"BWI","size":-7,"_s":0,"_g":1},{"src":"ALB","dst":"MCO","size":-3,"_s":0,"_g":2},{"src":"AUS","dst":"LAS","size":-5,"_s":0,"_g":3},{"src":"AUS","dst":"MAF","size":-2,"_s":0,"_g":4},{"src":"BDL","dst":"BNA","size":-12,"_s":0,"_g":5},{"src":"BDL","dst":"BWI","size":0,"_s":0,"_g":6},{"src":"BDL","dst":"MDW","size":-21,"_s":0,"_g":7},{"src":"BHM","dst":"BNA","size":15,"_s":0,"_g":8},{"src":"BHM","dst":"HOU","size":20,"_s":0,"_g":9},{"src":"BHM","dst":"MSY","size":6,"_s":0,"_g":10},{"src":"BHM","dst":"PHX","size":4,"_s":0,"_g":11},{"src":"BHM","dst":"STL","size":4,"_s":0,"_g":12},{"src":"BNA","dst":"HOU","size":2,"_s":0,"_g":13},{"src":"BNA","dst":"MCI","size":0,"_s":0,"_g":14},{"src":"BNA","dst":"MDW","size":9,"_s":0,"_g":15},{"src":"BNA","dst":"TPA","size":0,"_s":0,"_g":16},{"src":"BOI","dst":"SEA","size":-10,"_s":0,"_g":17},{"src":"BUF","dst":"BWI","size":-3,"_s":0,"_g":18},{"src":"BUF","dst":"MCO","size":6,"_s":0,"_g":19},{"src":"BUR","dst":"LAS","size":-2,"_s":0,"_g":20},{"src":"BUR","dst":"OAK","size":-15,"_s":0,"_g":21},{"src":"BUR","dst":"PHX","size":-8,"_s":0,"_g":22},{"src":"BUR","dst":"SJC","size":-5,"_s":0,"_g":23},{"src":"BUR","dst":"SMF","size":1,"_s":0,"_g":24},{"src":"BWI","dst":"BHM","size":1,"_s":0,"_g":25},{"src":"BWI","dst":"BNA","size":7,"_s":0,"_g":26},{"src":"BWI","dst":"LAS","size":-25,"_s":0,"_g":27},{"src":"BWI","dst":"MCI","size":-17,"_s":0,"_g":28},{"src":"BWI","dst":"SLC","size":-28,"_s":0,"_g":29},{"src":"CLE","dst":"BNA","size":8,"_s":0,"_g":30},{"src":"CLE","dst":"MDW","size":4,"_s":0,"_g":31},{"src":"CMH","dst":"MDW","size":-3,"_s":0,"_g":32},{"src":"DAL","dst":"ELP","size":2,"_s":0,"_g":33},{"src":"DTW","dst":"BNA","size":-2,"_s":0,"_g":34},{"src":"DTW","dst":"STL","size":-25,"_s":0,"_g":35},{"src":"ELP","dst":"DAL","size":5,"_s":0,"_g":36},{"src":"ELP","dst":"PHX","size":-2,"_s":0,"_g":37},{"src":"FLL","dst":"BNA","size":-15,"_s":0,"_g":38},{"src":"FLL","dst":"MSY","size":6,"_s":0,"_g":39},{"src":"FLL","dst":"TPA","size":0,"_s":0,"_g":40},{"src":"GEG","dst":"SLC","size":-3,"_s":0,"_g":41},{"src":"HOU","dst":"BWI","size":-18,"_s":0,"_g":42},{"src":"HOU","dst":"DAL","size":-4,"_s":0,"_g":43},{"src":"HOU","dst":"MSY","size":-15,"_s":0,"_g":44},{"src":"HOU","dst":"TUL","size":0,"_s":0,"_g":45},{"src":"IND","dst":"BWI","size":-12,"_s":0,"_g":46},{"src":"IND","dst":"LAS","size":-3,"_s":0,"_g":47},{"src":"IND","dst":"STL","size":-10,"_s":0,"_g":48},{"src":"ISP","dst":"BWI","size":-3,"_s":0,"_g":49},{"src":"ISP","dst":"MCO","size":-6,"_s":0,"_g":50},{"src":"ISP","dst":"MDW","size":-14,"_s":0,"_g":51},{"src":"JAX","dst":"BHM","size":13,"_s":0,"_g":52},{"src":"LAS","dst":"BUR","size":-5,"_s":0,"_g":53},{"src":"LAS","dst":"HOU","size":-28,"_s":0,"_g":54},{"src":"LAS","dst":"LAX","size":-2,"_s":0,"_g":55},{"src":"LAS","dst":"ONT","size":-3,"_s":0,"_g":56},{"src":"LAS","dst":"PHX","size":-3,"_s":0,"_g":57},{"src":"LAS","dst":"SJC","size":-7,"_s":0,"_g":58},{"src":"LAX","dst":"ABQ","size":-15,"_s":0,"_g":59},{"src":"LAX","dst":"BNA","size":-19,"_s":0,"_g":60},{"src":"LAX","dst":"IND","size":-2,"_s":0,"_g":61},{"src":"LAX","dst":"MCI","size":-5,"_s":0,"_g":62},{"src":"LAX","dst":"OAK","size":-10,"_s":0,"_g":63},{"src":"LAX","dst":"PHX","size":-6,"_s":0,"_g":64},{"src":"LAX","dst":"SJC","size":10,"_s":0,"_g":65},{"src":"LBB","dst":"DAL","size":17,"_s":0,"_g":66},{"src":"Los Angeles;-118.4079971;33.94250107","dst":"Boston;-71.00520325;42.36429977","size":12,"_s":0,"_g":67},{"src":"Los Angeles;-118.4079971;33.94250107","dst":"New York;-73.77890015;40.63980103","size":13,"_s":0,"_g":68},{"src":"MAF","dst":"AUS","size":4,"_s":0,"_g":69},{"src":"MCI","dst":"ABQ","size":-11,"_s":0,"_g":70},{"src":"MCI","dst":"BWI","size":7,"_s":0,"_g":71},{"src":"MCI","dst":"MDW","size":16,"_s":0,"_g":72},{"src":"MCI","dst":"OKC","size":0,"_s":0,"_g":73},{"src":"MCO","dst":"BWI","size":-19,"_s":0,"_g":74},{"src":"MCO","dst":"JAN","size":4,"_s":0,"_g":75},{"src":"MCO","dst":"MCI","size":4,"_s":0,"_g":76},{"src":"MCO","dst":"MSY","size":12,"_s":0,"_g":77},{"src":"MDW","dst":"CMH","size":36,"_s":0,"_g":78},{"src":"MDW","dst":"DTW","size":-7,"_s":0,"_g":79},{"src":"MDW","dst":"LAS","size":-25,"_s":0,"_g":80},{"src":"MDW","dst":"MCI","size":-4,"_s":0,"_g":81},{"src":"MDW","dst":"MCO","size":-10,"_s":0,"_g":82},{"src":"MDW","dst":"OMA","size":-14,"_s":0,"_g":83},{"src":"MDW","dst":"SDF","size":1,"_s":0,"_g":84},{"src":"MDW","dst":"STL","size":-21,"_s":0,"_g":85},{"src":"MHT","dst":"BNA","size":24,"_s":0,"_g":86},{"src":"MHT","dst":"BWI","size":23,"_s":0,"_g":87},{"src":"MHT","dst":"MDW","size":-19,"_s":0,"_g":88},{"src":"MSY","dst":"BNA","size":-1,"_s":0,"_g":89},{"src":"MSY","dst":"BWI","size":-13,"_s":0,"_g":90},{"src":"MSY","dst":"HOU","size":3,"_s":0,"_g":91},{"src":"OAK","dst":"BNA","size":-15,"_s":0,"_g":92},{"src":"OAK","dst":"BUR","size":-6,"_s":0,"_g":93},{"src":"OAK","dst":"LAS","size":-8,"_s":0,"_g":94},{"src":"OAK","dst":"LAX","size":-9,"_s":0,"_g":95},{"src":"OAK","dst":"MCI","size":-13,"_s":0,"_g":96},{"src":"OAK","dst":"ONT","size":-12,"_s":0,"_g":97},{"src":"OAK","dst":"SAN","size":-5,"_s":0,"_g":98},{"src":"OAK","dst":"SLC","size":0,"_s":0,"_g":99},{"src":"OKC","dst":"DAL","size":-3,"_s":0,"_g":100},{"src":"OKC","dst":"HOU","size":-10,"_s":0,"_g":101},{"src":"OKC","dst":"PHX","size":3,"_s":0,"_g":102},{"src":"OMA","dst":"MDW","size":-4,"_s":0,"_g":103},{"src":"ONT","dst":"LAS","size":-8,"_s":0,"_g":104},{"src":"ONT","dst":"OAK","size":-6,"_s":0,"_g":105},{"src":"ONT","dst":"PHX","size":-5,"_s":0,"_g":106},{"src":"ONT","dst":"SMF","size":5,"_s":0,"_g":107},{"src":"PDX","dst":"LAS","size":-8,"_s":0,"_g":108},{"src":"PDX","dst":"MCI","size":-10,"_s":0,"_g":109},{"src":"PHX","dst":"BNA","size":-17,"_s":0,"_g":110},{"src":"PHX","dst":"BUR","size":-5,"_s":0,"_g":111},{"src":"PHX","dst":"LAS","size":-2,"_s":0,"_g":112},{"src":"PHX","dst":"LAX","size":10,"_s":0,"_g":113},{"src":"PHX","dst":"OAK","size":-12,"_s":0,"_g":114},{"src":"PHX","dst":"OMA","size":-6,"_s":0,"_g":115},{"src":"PHX","dst":"SAT","size":-13,"_s":0,"_g":116},{"src":"PHX","dst":"SLC","size":2,"_s":0,"_g":117},{"src":"PHX","dst":"TUL","size":-8,"_s":0,"_g":118},{"src":"PVD","dst":"PHX","size":-26,"_s":0,"_g":119},{"src":"RDU","dst":"AUS","size":-10,"_s":0,"_g":120},{"src":"RDU","dst":"BNA","size":-10,"_s":0,"_g":121},{"src":"RDU","dst":"MCI","size":-6,"_s":0,"_g":122},{"src":"RDU","dst":"MDW","size":-20,"_s":0,"_g":123},{"src":"RNO","dst":"LAS","size":8,"_s":0,"_g":124},{"src":"RNO","dst":"PHX","size":1,"_s":0,"_g":125},{"src":"RNO","dst":"SJC","size":-2,"_s":0,"_g":126},{"src":"SAN","dst":"MSY","size":-31,"_s":0,"_g":127},{"src":"SAN","dst":"PHX","size":-5,"_s":0,"_g":128},{"src":"SAT","dst":"DAL","size":0,"_s":0,"_g":129},{"src":"SAT","dst":"HOU","size":-2,"_s":0,"_g":130},{"src":"SDF","dst":"BWI","size":5,"_s":0,"_g":131},{"src":"SDF","dst":"PHX","size":0,"_s":0,"_g":132},{"src":"SEA","dst":"BOI","size":0,"_s":0,"_g":133},{"src":"SEA","dst":"OAK","size":-10,"_s":0,"_g":134},{"src":"SEA","dst":"SLC","size":-3,"_s":0,"_g":135},{"src":"SEA","dst":"SMF","size":-14,"_s":0,"_g":136},{"src":"SFO","dst":"SAN","size":-2,"_s":0,"_g":137},{"src":"SJC","dst":"BUR","size":-5,"_s":0,"_g":138},{"src":"SJC","dst":"LAS","size":-9,"_s":0,"_g":139},{"src":"SJC","dst":"LAX","size":0,"_s":0,"_g":140},{"src":"SJC","dst":"PHX","size":-15,"_s":0,"_g":141},{"src":"SJC","dst":"RNO","size":-5,"_s":0,"_g":142},{"src":"SJC","dst":"SAN","size":-8,"_s":0,"_g":143},{"src":"SJC","dst":"SNA","size":0,"_s":0,"_g":144},{"src":"SLC","dst":"LAX","size":16,"_s":0,"_g":145},{"src":"SLC","dst":"OAK","size":-3,"_s":0,"_g":146},{"src":"SLC","dst":"SEA","size":5,"_s":0,"_g":147},{"src":"SMF","dst":"BUR","size":-5,"_s":0,"_g":148},{"src":"SMF","dst":"LAS","size":-3,"_s":0,"_g":149},{"src":"SMF","dst":"PDX","size":13,"_s":0,"_g":150},{"src":"STL","dst":"MCI","size":-11,"_s":0,"_g":151},{"src":"STL","dst":"MDW","size":-8,"_s":0,"_g":152},{"src":"STL","dst":"OKC","size":-5,"_s":0,"_g":153},{"src":"STL","dst":"TUL","size":-8,"_s":0,"_g":154},{"src":"TPA","dst":"ABQ","size":-5,"_s":0,"_g":155},{"src":"TPA","dst":"AUS","size":25,"_s":0,"_g":156},{"src":"TPA","dst":"BHM","size":9,"_s":0,"_g":157},{"src":"TPA","dst":"BNA","size":-4,"_s":0,"_g":158},{"src":"TPA","dst":"BWI","size":2,"_s":0,"_g":159},{"src":"TPA","dst":"MSY","size":4,"_s":0,"_g":160},{"src":"TPA","dst":"RDU","size":-6,"_s":0,"_g":161},{"src":"TUL","dst":"LAS","size":-13,"_s":0,"_g":162},{"src":"TUL","dst":"STL","size":-7,"_s":0,"_g":163},{"src":"TUS","dst":"SAN","size":-5,"_s":0,"_g":164}];
		props.buckets = {"src":["origin"],"dst":["destination"],"size":["delay"]};
		props.measureLabel = chart.measureLabel;

		props.states = tdg_usmap_states;
		props.airports = tdg_usmap_airports;

		props.isInteractionDisabled = renderConfig.disableInteraction;

		var invokeAfterTwo = getInvokeAfter(chart.processRenderComplete.bind(chart), 2);

		props.onRenderComplete = invokeAfterTwo;

		var container = d3.select(renderConfig.container)
			.attr('class', 'com_tdg_sunburst');

		// ---------------- INIT YOUR EXTENSION HERE

		var tdg_usmap_chart = tdg_usmap(props);
		tdg_usmap_chart(container);

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
				opacity: 0.3
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

			invokeAfterTwo();
	}

	// Your extension's configuration
	var config = {
		id: 'com.ibi.usmap',  // string that uniquely identifies this extension
		preRenderCallback: preRenderCallback,  // reference to a function that is called right *before* your extension is rendered.  Will be passed one 'preRenderConfig' object, defined below.  Use this to configure a Monbeam instance as needed
		renderCallback: renderCallback,  // reference to a function that will draw the actual chart.  Will be passed one 'renderConfig' object, defined below
		noDataRenderCallback: noDataRenderCallback,
		resources:  {  // Additional external resources (CSS & JS) required by this extension
			script: ['lib/d3.min.js', 'lib/usmap.js', 'data/states.js', 'data/airports.js'],
			css: []
		},
		modules: {
			/*dataSelection: {
				supported: true,  // Set this true if your extension wants to enable data selection
				needSVGEventPanel: false, // if you're using an HTML container or altering the SVG container, set this to true and Moonbeam will insert the necessary SVG elements to capture user interactions
				svgNode: function(arg){}  // if you're using an HTML container or altering the SVG container, return a reference to your root SVG node here.
			},*/
			tooltip: {
				supported: true  // Set this true if your extension wants to enable HTML tooltips  //Used by CHART-2954
			}
		}
	};

	// Required: this call will register your extension with Moonbeam
	tdgchart.extensionManager.register(config);

}());
