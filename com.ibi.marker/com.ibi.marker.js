/* globals _*/
// Copyright (c) 1996-2021 TIBCO Software Inc. All Rights Reserved.

(function() {
	// All extension callback functions are passed a standard 'renderConfig' argument:
	//
	// Properties that are always available:
	//   moonbeamInstance: the chart instance currently being rendered
	//   data: the data set being rendered
	//   properties: the block of your extension's properties, as they've been set by the user
	//   modules: the 'modules' object from your extension's config, along with additional API methods
	//
	// Properties available during render callback:
	//   width: width of the container your extension renders into, in px
	//   height: height of the container your extension renders into, in px
	//   containerIDPrefix:  the ID of the DOM container your extension renders into.  Prepend this to *all* IDs your extension generates, to ensure multiple copies of your extension work on one page.
	//   container: DOM node for your extension to render into;
	//   rootContainer: DOM node containing the overall Moonbeam chart.

	function preRenderCallback(preRenderConfig) {
		/*preRenderConfig.moonbeamInstance.eventDispatcher = { // testing drilling capability
        events: [
          { event: 'setURL', object: 'riser', series: 0, group: 0, url: 'http://amazon.com' ,target: '_blank' },
					{ event: 'setURL', object: 'riser', series: 0, group: 2, url: 'http://google.com' ,target: '_blank' }
        ]
		};*/
	}

	function extractSeriesColors (chart) {
		var len = chart.seriesCount(),
			i,
			result = [];
		for (i = 0; i < len; i++) {
			result[i] = chart.getSeriesAndGroupProperty(i, null, 'color');
		}
		return result;
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
		var props = renderConfig.properties;

		chart.legend.visible = false;

		props.width = renderConfig.width;
		props.height = renderConfig.height;
		//props.data = renderConfig.data;

		props.data = (renderConfig.data || []).map(function(datum){
			var datumCpy = jsonCpy(datum);
			datumCpy.elClassName = chart.buildClassName('riser', datum._s, datum._g, 'bar');
			return datumCpy;
		});

		props.buckets = renderConfig.dataBuckets.buckets;
		props.formatNumber = renderConfig.moonbeamInstance.formatNumber;

		props.isInteractionDisabled = renderConfig.disableInteraction;

		var container = d3.select(renderConfig.container)
			.attr('class', 'tdg_marker_chart');

		props.onRenderComplete = function() {
                  console.log(container);
                  renderConfig.modules.tooltip.updateToolTips();
                  renderConfig.renderComplete();
                }
		var marker_chart = tdg_marker(props);


		marker_chart(container);

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
		props.data = [{count: 45, label: 'Democrats'}, {count: 55, label: 'Republicans'}];
		props.formatNumber = renderConfig.moonbeamInstance.formatNumber;

		props.isInteractionDisabled = renderConfig.disableInteraction;

		var invokeAfterTwo = getInvokeAfter(renderConfig.renderComplete.bind(renderConfig), 2);

		props.onRenderComplete = invokeAfterTwo;

		var container = d3.select(renderConfig.container)
			.attr('class', 'tdg_marker_chart');

		var marker_chart = tdg_marker(props);

		marker_chart(container);

		container.append("rect")
			.attr({
				width: props.width,
				height: props.height
			})
			.style({
				fill: 'white',
				opacity: 0.3
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
				'font-size' : '14px',
				dy: '0.35em',
				fill: 'grey'
			});

			invokeAfterTwo();
	}

	// Your extension's configuration
	var config = {
		id: 'com.ibi.marker',  // string that uniquely identifies this extension
		name: 'Chord Diagram',  // colloquial name for your chart - might be used in some extension list UI
		description: 'd3 chord diagram',  // description useful for a UI tooltip or similar
		preRenderCallback: preRenderCallback,
		renderCallback: renderCallback,  // reference to a function that will draw the actual chart.  Will be passed one 'renderConfig' object, defined below
		noDataRenderCallback: noDataRenderCallback,
		resources:  {  // Additional external resources (CSS & JS) required by this extension
			script: window.d3
				? ['lib/marker.js']
				: ['lib/d3.min.js', 'lib/marker.js'],
			css: ['css/style.css']
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
