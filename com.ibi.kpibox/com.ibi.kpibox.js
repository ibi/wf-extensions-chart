/*global tdgchart: false, d3: false */
(function() {

	// Optional: if defined, is called exactly *once* during chart engine initialization
	// Arguments:
	//  - successCallback: a function that you must call when your extension is fully
	//	 initialized - pass in true if init is successful, false otherwise.
	// - initConfig: the standard callback argument object (moonbeamInstance, data, properties, etc)
	function initCallback(successCallback, initConfig) {
		successCallback(true);
	}
	
	function noDataRenderCallback(renderConfig) {

		renderConfig.testData = true;

		var grey = renderConfig.baseColor;
		renderConfig.data = JSON.parse('[{"value":123456789,"comparevalue":1234567.01,"_s":0,"_g":0}]');
		renderConfig.moonbeamInstance.dataBuckets = JSON.parse('{"buckets":{"value":{"title":"Testing data","count":1},"comparevalue":{"title":"Testing data Comp","count":1}},"depth":1}');
		//renderConfig.dataBuckets = renderConfig.moonbeamInstance.dataBuckets;
		renderConfig.moonbeamInstance.getSeries(0).color = grey;
		renderConfig.moonbeamInstance.getSeries(1).color = pv.color(grey).lighter(0.18).color;
		renderCallback(renderConfig);
	}

	function preRenderCallback(preRenderConfig) {
		var chart = preRenderConfig.moonbeamInstance;
		chart.legend.visible = false;
	}

	function renderCallback(renderConfig) {
		
		var isDummyData = renderConfig.testData;

		//IMPORTANT: Setup the renderConfig to custom $ib3
		$ib3.config.setup(renderConfig);
		$ib3.chart.draw(isDummyData);

	}

	var config = {
		id: 'com.ibi.kpibox',
		ibiVersion: '1.0', // control developing version
		containerType: 'svg',
		name: 'KPI Box',
		initCallback: initCallback,
		preRenderCallback: preRenderCallback,
		noDataRenderCallback: noDataRenderCallback,
		renderCallback: renderCallback,
		resources: {
			script: [
				'lib/d3.v5.min.js',
				'lib/jquery-3.3.1.min.js',
				'services/config-service.min.js',
				'services/utils-service.min.js',
				'chart/chart.js'
			],
			css: [
				'css/ib3.css',
				'css/kpibox.css'
			]
		},
		modules: {
			dataSelection: {
				supported: true,  // Set this true if your extension wants to enable data selection
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
				autoContent: function(dataObject) {
					//title: of tooltip content
					//data_array: data names and values
					//title + ':' + format_number(numberFormat, value) + '\n' + comparetitle + ':' + format_number(numberFormat, comparevalue) + '\nΔ:' + parseFloat(percvalue).toFixed(2) + '% ')
					
					var tooltip_html = ''
					
					for(var propertyName in dataObject) {
					   // propertyName is what you want
					   // you can get the value like this: myObject[propertyName]
					   tooltip_html += '<div class="tooltip_row"><span class="tooltip_property_name">' + propertyName + '</span>:<span class="tooltip_property_value">' + dataObject[propertyName] + '</span></div>';
					}
					
					return tooltip_html;
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
			},
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

	// IBI This Global variable will be container of extension and will contain services, etc...
	if(window.console) {
		window.console.log(window.name + ':' + config.id + ' WF Extension. v' + config.ibiVersion);
	}

	tdgchart.extensionManager.register(config);

}());