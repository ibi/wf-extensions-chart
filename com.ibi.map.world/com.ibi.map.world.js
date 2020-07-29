/* globals _*/
(function() {
	// Optional: if defined, is invoked once at the very beginning of each Moonbeam draw cycle
	// Use this to configure a specific Moonbeam instance before rendering.
	// Arguments:
	//  - preRenderConfig: the standard callback argument object
	function preRenderCallback(preRenderConfig) {

		/*preRenderConfig.moonbeamInstance.eventDispatcher = { // testing drilling capability
			events: [
			  { event: 'setURL', object: 'riser', series: 0, group: 0, url: 'http://google.com' ,target: '_blank' }
			]
		};*/

		preRenderConfig.moonbeamInstance.legend.visible = false;
	}

	function getFormatedBuckets(renderConfig) {
          function trim (str) {
            return typeof str === 'string' && str.trim(); 
          }

          if (!renderConfig.dataBuckets || !renderConfig.dataBuckets.buckets) {
            return;
          }

          var bkts = renderConfig.dataBuckets.buckets,
              modif_bkts = {};

          for (var bkt in bkts) {
              if (bkts.hasOwnProperty(bkt)) {
                modif_bkts[bkt] = Array.isArray(bkts[bkt].title)
                  ? bkts[bkt].title
                  : [bkts[bkt].title];

                modif_bkts[bkt] = modif_bkts[bkt].map(trim);
              }
          }

          return modif_bkts;
        }

	function jsonCpy( el ) {
          return JSON.parse(JSON.stringify(el));
	}
        
        function hasEnoughData( buckets ) {
          return ( Array.isArray(buckets.value) && buckets.value.length )
            && ( Array.isArray(buckets.name) || ( Array.isArray(buckets.longitude) &&  Array.isArray(buckets.latitude) ) ); 
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

          props.buckets = getFormatedBuckets(renderConfig);
          
          if ( !hasEnoughData( props.buckets ) ) return noDataRenderCallback( renderConfig );

          props.data = (renderConfig.data || []).map(function(datum){
            var datumCpy = jsonCpy(datum);
            datumCpy.elClassName = chart.buildClassName('riser', datum._s, datum._g, 'location');
            return datumCpy;
          });

          //props.data = renderConfig.data;

          props.measureLabel = chart.measureLabel;
          props.formatNumber = chart.formatNumber;

          props.isInteractionDisabled = renderConfig.disableInteraction;

          //props.onRenderComplete = renderConfig.renderComplete.bind(chart);

          var container = d3.select(renderConfig.container)
                  .attr('class', 'com_ibi_map_world');
				  
				  
				  
			//Start VIZ-43
			props.onRenderComplete = function() {
				container.selectAll('[class^=riser]')
					.each(function(d, g) {
						renderConfig.modules.tooltip.addDefaultToolTipContent(this, 0, g, d);
					});
				renderConfig.renderComplete();
			};

			//End VIZ-43
				  
				  
				  

          // ---------------- INIT YOUR EXTENSION HERE
          var map_word_chart = window.COM_IBI_MAP_WORLD.init(props);
          container.call(map_word_chart);

          // ---------------- END ( INIT YOUR EXTENSION HERE )

          // ---------------- CALL updateToolTips IF YOU USE MOONBEAM TOOLTIP
	  /* Code before VIZ-43	  
	  renderConfig.renderComplete();
	  */
   
		//Begin VIZ-300 using the assumption that the last svg element is the errant element that causes the scroll bar
		document.querySelectorAll('svg')[document.querySelectorAll('svg').length-1].style.display = "none";
		//End VIZ-300 
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

          chart.legend.visible = false;

          props.width = renderConfig.width;
          props.height = renderConfig.height;
          props.data = []; // <------------------------ YOUR DATA

          props.buckets = {};

          props.measureLabel = chart.measureLabel;
          props.formatNumber = chart.formatNumber;

          //var invokeAfterTwo = getInvokeAfter(renderConfig.renderComplete.bind(chart), 2);

          props.isInteractionDisabled = renderConfig.disableInteraction;
          //props.onRenderComplete = invokeAfterTwo;

          var container = d3.select(renderConfig.container)
            .attr('class', 'com_tdg_sunburst');

          // ---------------- INIT YOUR EXTENSION HERE

          var map_word_chart = window.COM_IBI_MAP_WORLD.init(props);
          container.call(map_word_chart);

          // ---------------- END ( INIT YOUR EXTENSION HERE )

          // ---------------- CALL updateToolTips IF YOU USE MOONBEAM TOOLTIP
          //renderConfig.renderComplete();

          // ADD TRANSPARENT SCREEN

          container.append("rect")
            .attrs({
              width: props.width,
              height: props.height
            })
            .styles({
              fill: 'white',
              opacity: 0.3
            });

          // ADD NO DATA TEXT

          container.append('text')
            .text('Add more measures or dimensions')
            .attrs({
              'text-anchor': 'middle',
              y: props.height / 2,
              x: props.width / 2
            })
            .styles({
              'font-weight' : 'bold',
              'font-size' : '14',
              dy: '0.35em',
              fill: 'grey'
            });

          //invokeAfterTwo();
	}

	// Your extension's configuration
	var config = {
		id: 'com.ibi.map.world',  // string that uniquely identifies this extension
		preRenderCallback: preRenderCallback,  // reference to a function that is called right *before* your extension is rendered.  Will be passed one 'preRenderConfig' object, defined below.  Use this to configure a Monbeam instance as needed
		renderCallback: renderCallback,  // reference to a function that will draw the actual chart.  Will be passed one 'renderConfig' object, defined below
		noDataRenderCallback: noDataRenderCallback,
		resources:  {  // Additional external resources (CSS & JS) required by this extension
			script: window.d3 ? [
        'lib/d3-selection-multi.min.js','lib/d3-time.min.js','lib/d3-time-format.min.js','lib/d3-transition.min.js',
        'lib/d3-geo-projection.min.js',
				'data/id_to_countryName_map.js',
				'data/countryName_to_id_map.js',
				'data/topojson_countries.js'
			] : [
        'lib/d3.v5.16.min.js','lib/d3-selection-multi.min.js','lib/d3-time.min.js','lib/d3-time-format.min.js','lib/d3-transition.min.js',
        'lib/d3-geo-projection.min.js',
				'lib/map.world.js',
				'data/id_to_countryName_map.js',
				'data/countryName_to_id_map.js',
				'data/topojson_countries.js'
			],
			css: []
		},
		modules: {
			/*dataSelection: {
				supported: true,  // Set this true if your extension wants to enable data selection
				needSVGEventPanel: false, // if you're using an HTML container or altering the SVG container, set this to true and Moonbeam will insert the necessary SVG elements to capture user interactions
				svgNode: function(arg){}  // if you're using an HTML container or altering the SVG container, return a reference to your root SVG node here.
			},*/
			eventHandler: {
				supported: true
			},
			tooltip: {
				supported: true  // Set this true if your extension wants to enable HTML tooltips
			}
		}
	};

	// Required: this call will register your extension with Moonbeam
	tdgchart.extensionManager.register(config);

}());
