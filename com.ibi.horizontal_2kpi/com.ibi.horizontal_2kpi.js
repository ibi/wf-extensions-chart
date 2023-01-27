/*global tdgchart: false, pv: false, d3: false */
/* Copyright (C) 1996-2023. Cloud Software Group, Inc. All rights reserved. */

(function() {
	var chartVersion = '1.0';
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
		var chart = preRenderConfig.moonbeamInstance;
		chart.legend.visible = false;
		chart.dataArrayMap = undefined;
		chart.dataSelection.enabled = false;
	}
 
	// Optional: if defined, is called whenever this extension must be drawn but doesn't yet have any data.
	// Use this to define the extensions' initial 'grey state' appearance.
	// Arguments:
	//  - renderConfig: the standard callback argument object (moonbeamInstance, data, properties, etc)
	function noDataRenderCallback(renderConfig) {
		
		renderConfig.testData = true;
		
		var grey = renderConfig.baseColor;
		renderConfig.data = JSON.parse('[{"dimension":"Accessories","value":89753898,"image":"/ibi_apps/web_resource/extensions/com.ibi.horizontal_2kpi/icons/good.png","comparevalue":25.5,"_s":0,"_g":0},'+
										' {"dimension":"Camcorder","value":104866857,"image":"/ibi_apps/web_resource/extensions/com.ibi.horizontal_2kpi/icons/bad.png","comparevalue":10.239997,"_s":0,"_g":1},'+
										' {"dimension":"Computers","value":69807664,"image":"/ibi_apps/web_resource/extensions/com.ibi.horizontal_2kpi/icons/good.png","comparevalue":1.119933,"_s":0,"_g":2},'+
										' {"dimension":"Media Player","value":190240481,"image":"/ibi_apps/web_resource/extensions/com.ibi.horizontal_2kpi/icons/bad.png","comparevalue":21.359965,"_s":0,"_g":3},'+
										' {"dimension":"Stereo Systems","value":205113863,"image":"/ibi_apps/web_resource/extensions/com.ibi.horizontal_2kpi/icons/good.png","comparevalue":5.519796,"_s":0,"_g":4},'+
										' {"dimension":"Televisions","value":61551109,"image":"/ibi_apps/web_resource/extensions/com.ibi.horizontal_2kpi/icons/bad.png","comparevalue":7.810008,"_s":0,"_g":5},'+
										' {"dimension":"Video Production","value":40105657,"image":"/ibi_apps/web_resource/extensions/com.ibi.horizontal_2kpi/icons/good.png","comparevalue":9.620011,"_s":0,"_g":6}]');
		//renderConfig.dataBuckets.depth = 2;
		renderConfig.moonbeamInstance.dataBuckets = JSON.parse('{"buckets":{"dimension":{"title":"Categoría de Producto","count":1},"value":{"title":"Costo de los bienes","count":1},"comparevalue":{"title":"Beneficio Bruto","count":1}},"depth":1}');
		renderConfig.moonbeamInstance.getSeries(0).color = grey;
		renderConfig.moonbeamInstance.getSeries(1).color = pv.color(grey).lighter(0.18).color;
 
		renderCallback(renderConfig);
	}

	// Required: Invoked during each chart engine draw cycle
	// This is where your extension should be rendered
	// Arguments:
	//  - renderConfig: the standard callback argument object, including additional properties width, height, etc
	// This simple bar extension supports:
	//  - multiple measure entries in a generic 'value' bucket.  Each value will be drawn on its own split-y axis.
	//  - one dimension entry in a generic 'labels' bucket.  This bucket defines the set of labels on the ordinal axis.
	//  - one dimension entry in the built-in 'series_break' bucket.  This will split each value entry into multiple similar colors.
	function renderCallback(renderConfig) {
		 
		var isDummyData = renderConfig.testData;
		//IMPORTANT: Setup the renderConfig to custom $ib3
		
		var ib3SLI = $ib3(renderConfig, {
			tooltip: {
				hiddenBuckets: ['kpisign','image','drillCondition','order']
			}
		});
		
		window.comIbiHorizontal_2kpiChartExtension.draw(ib3SLI, isDummyData);	
		
	}

	// Your extension's configuration
	var config = {
		id: 'com.ibi.horizontal_2kpi',     // string that uniquely identifies this extension
		containerType: 'svg',  // either 'html' or 'svg' (default)
		initCallback: initCallback,
		renderCallback: renderCallback,  // reference to a function that will draw the actual chart.  Will be passed one 'renderConfig' object, defined below
		noDataPreRenderCallback: noDataPreRenderCallback,
		noDataRenderCallback: noDataRenderCallback,

		resources: {  // Additional external resources (CSS & JS) required by this extension
			script: (function() {
				var scripts = [];
				if (!window.jQuery) {
					var tdgchartPath = tdgchart.getScriptPath();
						jqueryPath = tdgchartPath.substr(0, tdgchartPath.indexOf('tdg')) + 'jquery/js/jquery.js';
						
					scripts.push(jqueryPath);
				}
				
				var customScripts = [
					'lib/d3.v5.min.js?' + chartVersion,
					'services/config-service.min.js?' + chartVersion,
					'services/utils-service.min.js?' + chartVersion,
					'chart/chart.js?' + chartVersion
				];
				
				return scripts.concat(customScripts);
			}()),
			css: [
				'css/ibi_horizontal_2kpi.css?' + chartVersion  
			]
		},
		modules: {
 
			dataSelection: {
				supported: false,  // Set this true if your extension wants to enable data selection
				needSVGEventPanel: false, // if you're using an HTML container or altering the SVG container, set this to true and the chart engine will insert the necessary SVG elements to capture user interactions
				svgNode: function() {}  // if you're using an HTML container or altering the SVG container, return a reference to your root SVG node here.
			},
			eventHandler: {
				supported: true
			},
			tooltip: {
				supported: true,  // Set this true if your extension wants to enable HTML tooltips
				// This callback is called when no default tooltip content is passed into the chart.
				// Use this to define 'nice' default tooltips for the given target, ids & data.
				// Return value can be a string (including HTML), or HTML nodes, or any Moonbeam tooltip API object.
				autoContent: function(target, s, g, d) {
					debugger;
					if (d.hasOwnProperty('color')) {
						return 'Bar Size: ' + d.value + '<br />Bar Color: ' + d.color;
					}
					return 'Bar Size: ' + d.value;
				}
			},
			sizeScale: {
				supported: true,  // This must be true to enable size scale support

				// Use this to manually define the diameter of the largest marker.  Can be a function callbacl.
				// Should return a number representing the diameter of the shape in pixels.  If undefined,
				// the chart engine will pick a 'nice' max diameter based on the current chart size.
				maxDiameter: null,

				// Return a {min, max} object that defines the axis min and max values for this size scale
				minMax: function(renderConfig) {
					// If there's nothing in the size bucket, the min / max code below will fail because 'd.size' is null.
					// But this minMax callback must return valid numbers for min & max, otherwise the generated
					// sizeScale() will be ill-defined.  Setting min = max = 1 gives a sizeScale that always returns 1.
					if (renderConfig.dataBuckets.getBucket('size') == null) {
						return {min: 1, max: 1};
					}
					return {
						min: d3.min(renderConfig.data, function(d) {return d.size;}),
						max: d3.max(renderConfig.data, function(d) {return d.size;})
					};
				}
			},
			dataLabels: {
				supported: true,  // This must be true to enable data label support
				defaultDataArrayEntry: function(arg) {
					// Return the name of the 'default' bucket that should be used to define data label content,
					// if a more specific data label content lookup is not found.
					return 'value'
				}
			},
			colorScale: {
				supported: true,  // This must be true to enable color scale support
				minMax: function(renderConfig) {
					// Return a {min, max} object that defines the axis min and max values for this color scale
					return {
						min: d3.min(renderConfig.data, function(d){
							return d.value;
						}),
						max: d3.max(renderConfig.data, function(d){
							return d.value;
						})
					};
				}
			}
			// Not used in this extension; here for documentation purposes.
//			colorScale: {
//				supported: true,
//				minMax: function(arg){}  // Optional: return a {min, max} object to use for the color scale min & max.
//			}
//			sizeScale: {
//				supported: false,
//				minMax: function(arg){}  // Optional: return a {min, max} object to use for the size scale min & max.
//			},
//			legend: {
//				colorMode: function(arg){}, // Return either 'data' or 'series'.  If implemented, force the chart engine to use this color mode legend
//				sizeMode: function(arg){},  // return either 'size' or falsey.  If implemented, force the chart engine to use this size legend
//			}
		}
	};


	// Required: this call will register your extension with the chart engine
	tdgchart.extensionManager.register(config);

})();
