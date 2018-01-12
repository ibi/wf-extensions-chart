/*global tdgchart: false, d3: false */
/* Copyright 1996-2015 Information Builders, Inc. All rights reserved. */

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
	//   rootContainer: DOM node containing the specific chart engine instance being rendered.


	// Optional: if defined, is called exactly *once* during chart engine initialization
	// Arguments:
	//  - successCallback: a function that you must call when your extension is fully
	//     initialized - pass in true if init is successful, false otherwise.
	// - initConfig: the standard callback argument object (moonbeamInstance, data, properties, etc)
	function initCallback(successCallback, initConfig) {
		successCallback(true);
	}

	// Optional: if defined, is called once before each draw that does not include any data
	// Arguments:
	//  - preRenderConfig: the standard callback argument object (moonbeamInstance, data, properties, etc)
	function noDataPreRenderCallback(preRenderConfig) {
	}

	// Optional: if defined, is called whenever this extension must be drawn but doesn't yet have any data.
	// Use this to define the extensions' initial 'grey state' appearance.
	// Arguments:
	//  - renderConfig: the standard callback argument object (moonbeamInstance, data, properties, etc)
	function noDataRenderCallback(renderConfig) {
	}

	// Optional: if defined, is invoked once at the very beginning of each chart engine draw cycle
	// Use this to configure a specific chart engine instance before rendering.
	// Arguments:
	//  - preRenderConfig: the standard callback argument object
	function preRenderCallback(preRenderConfig) {
	}

	// Required: Invoked during each chart engine draw cycle
	// This is where your extension should be rendered
	// Arguments:
	//  - renderConfig: the standard callback argument object, including additional properties width, height, etc
	function renderCallback(renderConfig) {

		var d3 = renderConfig.externalLibraries.d3;
		var chart = renderConfig.moonbeamInstance;
		var data = renderConfig.data;
		var w = renderConfig.width;
		var h = renderConfig.height;
		var container = d3.select(renderConfig.container);

		// Extension draw code goes here

		renderConfig.renderComplete();
	}

	var config = {
		id: 'com.ibi.template',  // String that uniquely identifies this extension.  id should match the extension's folder name and main .js file name
		containerType: 'svg',  // Either 'html' or 'svg' (default).  Defines the type of container your extension will be passed
		initCallback: initCallback,
		preRenderCallback: preRenderCallback,
		renderCallback: renderCallback,
		noDataPreRenderCallback: noDataPreRenderCallback,
		noDataRenderCallback: noDataRenderCallback,
		resources: {  // Additional external resources (CSS & JS) required by this extension
			script: [
				{name: 'd3'}
			],
			css: [
			]
		},
		modules: {
			// All inner module properties can be function callbacks.  All module function callbacks are passed the same 'renderConfig' argument
			dataLabels: {
				supported: false,  // Set this to true if your extension wants to enable data label support
				defaultDataArrayEntry: 'value'  //  Return the name of the 'default' bucket that should be used to define data label content, if a more specific data label content lookup is not found
			},
			dataSelection: {
				supported: false,  // Set this true if your extension wants to enable data selection
				svgNode: function(renderConfig) {  // if you're using an HTML container or altering the SVG container, return a reference to your root SVG node here
				}
			},
			eventHandler: {
				supported: false  // Set this to true if your extension wants to support chart events like single drill down
			},
			tooltip: {
				supported: false  // Set this true if your extension wants to enable HTML tooltips (necessary for multi-drill)
			},
			colorScale: {
				supported: false,  // Set this to true if your extension wants to draw a color scale legend
				minMax: function(renderConfig) {  // Optional: return a {min, max} object to use for the color scale min & max
				}
			},
			sizeScale: {
				supported: false,  // Set this to true if your extension wants to draw a size legend
				maxDiameter: null,  // Optional: return the diameter of the largest shape in pixels
				minMax: function(renderConfig) {  // Optional: return a {min, max} object to use for the size scale min & max
				}
			},
			legend: {
				colorMode: 'series',  // One of 'data', 'series' or a function that returns 'data' or 'series'.  If implemented, force the chart engine to use this color mode legend
				sizeMode: false,  // One of  'size' or falsey, or a function that returns 'size' or false.  If implemented, force the chart engine to use this size legend
				seriesCount: function(renderConfig) {  // Return the number of series in this legend.  Only necessary if legend.colorMode is 'series'
				}
			}
		}
	};

	// Required: this call registers your extension with the chart engine
	tdgchart.extensionManager.register(config);

})();
