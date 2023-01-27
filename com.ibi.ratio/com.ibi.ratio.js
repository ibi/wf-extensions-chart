/* Copyright (C) 2016-2023. Cloud Software Group, Inc. All rights reserved. */
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

        function getUseMoonbeamColorSeries( moonbeamSeries ) {
          return (moonbeamSeries || []).filter(function(s){
              return typeof s.series === 'number' && !!s.color;
            }).reduce(function(clrs, s) {
              clrs[s.series] = s.color;
              return clrs;
            }, []);
        }

	// Required: Is invoked in the middle of each Moonbeam draw cycle
	// This is where your extension should be rendered
	// Arguments:
	//  - renderConfig: the standard callback argument object, including additional properties width, height, etc
	function renderCallback( renderConfig ) {
          var chart = renderConfig.moonbeamInstance;
          var props = JSON.parse(JSON.stringify(renderConfig.properties));

          if ( props.risers.useMoonbeamColorSeries ) {
            props.risers.colorSeries = getUseMoonbeamColorSeries(
              renderConfig.moonbeamInstance.series
            );
          }

          props.width = renderConfig.width;
          props.height = renderConfig.height;

          props.data = (renderConfig.data || []).map(function(datum){
            var datumCpy = jsonCpy(datum);
            datumCpy.elClassName = chart.buildClassName(
              'riser',
              datum._s,
              datum._g,
              'bar'
            );
            return datumCpy;
          });

          //props.data = renderConfig.data;
          props.measureLabel = chart.measureLabel;
          props.formatNumber = chart.formatNumber;

          props.buckets = getFormatedBuckets(renderConfig);

          props.isInteractionDisabled = renderConfig.disableInteraction || true;

          var container = d3.select(renderConfig.container)
                  .attr('class', 'com_tdg_ratio');

          // ---------------- INIT YOUR EXTENSION HERE

          var tdg_ratio_chart = tdg_ratio(props);
          tdg_ratio_chart(container);

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
		props.data = [{"x":"ENGLAND","y":12000,"_s":0,"_g":0},{"x":"ITALY","y":30200,"_s":0,"_g":1},{"x":"JAPAN","y":78030,"_s":0,"_g":2},{"x":"W GERMANY","y":88190,"_s":0,"_g":3}];
		props.measureLabel = chart.measureLabel;
		props.formatNumber = chart.formatNumber;

		props.buckets = {"x":["COUNTRY"],"y":["SALES"]};

		var container = d3.select(renderConfig.container)
			.attr('class', 'com_tdg_ratio');

		// ---------------- INIT YOUR EXTENSION HERE

		var tdg_ratio_chart = tdg_ratio(props);
		tdg_ratio_chart(container);

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
				'font-size' : '14px',
				dy: '0.35em',
				fill: 'grey'
			});

		//chart.processRenderComplete();
		renderConfig.renderComplete();
	}

	// Your extension's configuration
	var config = {
		id: 'com.ibi.ratio',  // string that uniquely identifies this extension
		preRenderCallback: preRenderCallback,  // reference to a function that is called right *before* your extension is rendered.  Will be passed one 'preRenderConfig' object, defined below.  Use this to configure a Monbeam instance as needed
		renderCallback: renderCallback,  // reference to a function that will draw the actual chart.  Will be passed one 'renderConfig' object, defined below
		noDataRenderCallback: noDataRenderCallback,
		resources:  {  // Additional external resources (CSS & JS) required by this extension
			script: ['lib/d3.min.js', 'lib/ratio.js'],
			css: ['css/styles.css']
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
