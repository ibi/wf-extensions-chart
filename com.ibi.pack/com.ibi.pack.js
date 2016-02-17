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
		var props = JSON.parse(JSON.stringify(renderConfig.properties));

		props.width = renderConfig.width;
		props.height = renderConfig.height;
		props.data = renderConfig.data;
		props.measureLabel = renderConfig.moonbeamInstance.measureLabel;
		
		var container = d3.select(renderConfig.container)
			.attr('class', 'com_ibi_pack');

		if ( renderConfig.dataBuckets && renderConfig.dataBuckets.buckets ) {

			if ( !renderConfig.dataBuckets.buckets.labels ) {
				return noDataRenderCallback(renderConfig);
			}

			var bkts = renderConfig.dataBuckets.buckets,
				modif_bkts = {};
			for ( var bkt in bkts ) {
				if ( bkts.hasOwnProperty( bkt ) ) {
					modif_bkts[bkt] = Array.isArray( bkts[bkt].title ) ? bkts[bkt].title : [bkts[bkt].title];
				}
			}

			props.buckets = modif_bkts;
		} else {
			return noDataRenderCallback(renderConfig);
		}

		// ---------------- INIT YOUR EXTENSION HERE

		var pack = tdg_pack(props);
		pack(container);

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
		props.data = [{"labels":["ALFA ROMEO","2000 4 DOOR BERLINA","SEDAN"],"color":"ITALY","sort_dim":"ITALY","size":4800,"_s":0,"_g":0},{"labels":["ALFA ROMEO","2000 GT VELOCE","COUPE"],"color":"ITALY","sort_dim":"ITALY","size":12400,"_s":0,"_g":1},{"labels":["ALFA ROMEO","2000 SPIDER VELOCE","ROADSTER"],"color":"ITALY","sort_dim":"ITALY","size":13000,"_s":0,"_g":2},{"labels":["AUDI","100 LS 2 DOOR AUTO","SEDAN"],"color":"W GERMANY","sort_dim":"W GERMANY","size":7800,"_s":0,"_g":3},{"labels":["BMW","2002 2 DOOR","SEDAN"],"color":"W GERMANY","sort_dim":"W GERMANY","size":8950,"_s":0,"_g":4},{"labels":["BMW","2002 2 DOOR AUTO","SEDAN"],"color":"W GERMANY","sort_dim":"W GERMANY","size":8900,"_s":0,"_g":5},{"labels":["BMW","3.0 SI 4 DOOR","SEDAN"],"color":"W GERMANY","sort_dim":"W GERMANY","size":14000,"_s":0,"_g":6},{"labels":["BMW","3.0 SI 4 DOOR AUTO","SEDAN"],"color":"W GERMANY","sort_dim":"W GERMANY","size":18940,"_s":0,"_g":7},{"labels":["BMW","530I 4 DOOR","SEDAN"],"color":"W GERMANY","sort_dim":"W GERMANY","size":14000,"_s":0,"_g":8},{"labels":["BMW","530I 4 DOOR AUTO","SEDAN"],"color":"W GERMANY","sort_dim":"W GERMANY","size":15600,"_s":0,"_g":9},{"labels":["DATSUN","B210 2 DOOR AUTO","SEDAN"],"color":"JAPAN","sort_dim":"JAPAN","size":43000,"_s":0,"_g":10},{"labels":["JAGUAR","V12XKE AUTO","CONVERTIBLE"],"color":"ENGLAND","sort_dim":"ENGLAND","size":0,"_s":0,"_g":11},{"labels":["JAGUAR","XJ12L AUTO","SEDAN"],"color":"ENGLAND","sort_dim":"ENGLAND","size":12000,"_s":0,"_g":12},{"labels":["JENSEN","INTERCEPTOR III","SEDAN"],"color":"ENGLAND","sort_dim":"ENGLAND","size":0,"_s":0,"_g":13},{"labels":["MASERATI","DORA 2 DOOR","COUPE"],"color":"ITALY","sort_dim":"ITALY","size":0,"_s":0,"_g":14},{"labels":["PEUGEOT","504 4 DOOR","SEDAN"],"color":"FRANCE","sort_dim":"FRANCE","size":0,"_s":0,"_g":15},{"labels":["TOYOTA","COROLLA 4 DOOR DIX AUTO","SEDAN"],"color":"JAPAN","sort_dim":"JAPAN","size":35030,"_s":0,"_g":16},{"labels":["TRIUMPH","TR7","HARDTOP"],"color":"ENGLAND","sort_dim":"ENGLAND","size":0,"_s":0,"_g":17}];
		props.buckets = {"labels":["CAR","MODEL","BODYTYPE"],"color":["COUNTRY"],"sort_dim":["COUNTRY"],"size":["SALES"]};
		props.measureLabel = renderConfig.moonbeamInstance.measureLabel;


		var container = d3.select(renderConfig.container)
			.attr('class', 'com_ibi_pack');

		// ---------------- INIT YOUR EXTENSION HERE

		var pack = tdg_pack(props);
		pack(container);

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
		id: 'com.ibi.pack',  // string that uniquely identifies this extension
		preRenderCallback: preRenderCallback,  // reference to a function that is called right *before* your extension is rendered.  Will be passed one 'preRenderConfig' object, defined below.  Use this to configure a Monbeam instance as needed
		renderCallback: renderCallback,  // reference to a function that will draw the actual chart.  Will be passed one 'renderConfig' object, defined below
		noDataRenderCallback: noDataRenderCallback,
		resources:  {  // Additional external resources (CSS & JS) required by this extension
			script: ['lib/d3.min.js', 'lib/pack.js'],
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