/*global tdgchart: false, pv: false, d3: false */
/* Copyright (C) 1996-2023. Cloud Software Group, Inc. All rights reserved. */

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
		var chart = renderConfig.moonbeamInstance;
		var data = [{"radial":'Point 1',"series":'1996',"value":21600000}
                   ,{"radial":'Point 1',"series":'1997',"value":22700000}
                   ,{"radial":'Point 2',"series":'1996',"value":23800000}
                   ,{"radial":'Point 2',"series":'1997',"value":24900000}
                   ,{"radial":'Point 3',"series":'1996',"value":25000000}
                   ,{"radial":'Point 3',"series":'1997',"value":26900000}
                   ,{"radial":'Point 4',"series":'1996',"value":27800000}
                   ,{"radial":'Point 4',"series":'1997',"value":28700000}
                   ,{"radial":'Point 5',"series":'1996',"value":29600000}
                   ,{"radial":'Point 5',"series":'1997',"value":20500000}
                   ,{"radial":'Point 6',"series":'1996',"value":29400000}
                   ,{"radial":'Point 6',"series":'1997',"value":28300000}
                   ,{"radial":'Point 7',"series":'1996',"value":27200000}
                   ,{"radial":'Point 7',"series":'1997',"value":26100000}
                   ,{"radial":'Point 8',"series":'1996',"value":25000000}
                   ,{"radial":'Point 8',"series":'1997',"value":24100000}
                   ,{"radial":'Point 9',"series":'1996',"value":23200000}
                   ,{"radial":'Point 9',"series":'1997',"value":22300000}
                   ,{"radial":'Point 10',"series":'1996',"value":21400000}
                   ,{"radial":'Point 10',"series":'1997',"value":20500000}
                   ,{"radial":'Point 11',"series":'1996',"value":21600000}
                   ,{"radial":'Point 11',"series":'1997',"value":22700000}
                   ,{"radial":'Point 12',"series":'1996',"value":23800000}
                   ,{"radial":'Point 12',"series":'1997',"value":24900000}];

        var props = renderConfig.properties;

        var width = renderConfig.width;
        var height = renderConfig.height;

		var container = d3.select(renderConfig.container)
			.attr('class', 'com_ibi_chart');
           
        var arrBuckets = {"radial":{"title":"Ordinal"},"series":{"title":"Year"},"value":{"title":"Value"}};
  
		//BEGIN VIZ-398 - append extension prefix to global function
        com_ibi_corona_checkData(data,container,width,height,arrBuckets,props);
		//END - VIZ-398
        appendCoverScreen(container, width, height);

		renderConfig.renderComplete();
	}

    function appendCoverScreen(container, width, height) {
        var dimSquare = (width < height) ? width : height;
        container.append("rect")
            .attrs({
                width: dimSquare,
                height: dimSquare
            })
            .styles({
                fill: 'white',
                opacity: 0.4
            });

        container.append('text')
            .text('Currently, there are insufficient buckets completed.')
            .attrs({
                'text-anchor': 'middle',
                y: (dimSquare / 2) - 30,
                x: dimSquare / 2
            })
            .styles({
                'font-weight': 'bold',
                'font-size': '14px',
                dy: '0.35em',
                fill: 'grey'
            });
        container.append('text')
            .text('Please add more measures or dimensions')
            .attrs({
                'text-anchor': 'middle',
                y: (dimSquare / 2) + 30,
                x: dimSquare / 2
            })
            .styles({
                'font-weight': 'bold',
                'font-size': '14px',
                dy: '0.35em',
                fill: 'grey'
            });
    }

	// Optional: if defined, is invoked once at the very beginning of each chart engine draw cycle
	// Use this to configure a specific chart engine instance before rendering.
	// Arguments:
	//  - preRenderConfig: the standard callback argument object
	function preRenderCallback(preRenderConfig) {
		var chart = preRenderConfig.moonbeamInstance;

		// Example of manually loading a file in this extension's folder path and using it.
		var info = tdgchart.util.ajax(preRenderConfig.loadPath + 'lib/extra_properties.json', {asJSON: true});

		// Example of using the chart engine's built in title properties
		chart.title.visible = false;
		chart.title.text = info.custom_title;
//		chart.title.text = 'Cool Visualisation!';
		chart.footnote.visible = false;
		chart.footnote.text = 'xxxxxxxx';
		chart.footnote.align = 'right';
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

		var chart = renderConfig.moonbeamInstance;
		var data = renderConfig.data;
		var props = renderConfig.properties;

        var width = renderConfig.width;
        var height = renderConfig.height;

		var container = d3.select(renderConfig.container)
			.attr('class', 'com_ibi_chart');
            
        var arrBuckets = chart.dataBuckets.buckets;
  
        com_ibi_corona_checkData(data,container,width,height,arrBuckets,props);

		renderConfig.renderComplete();
	}

	// Your extension's configuration
	var config = {
		id: 'com.ibi.corona',     // string that uniquely identifies this extension
		containerType: 'svg',  // either 'html' or 'svg' (default)
		initCallback: initCallback,
		preRenderCallback: preRenderCallback,  // reference to a function that is called right *before* your extension is rendered.  Will be passed one 'preRenderConfig' object, defined below.  Use this to configure a Moonbeam instance as needed
		renderCallback: renderCallback,  // reference to a function that will draw the actual chart.  Will be passed one 'renderConfig' object, defined below
		noDataPreRenderCallback: noDataPreRenderCallback,
		noDataRenderCallback: noDataRenderCallback,
		resources: {  // Additional external resources (CSS & JS) required by this extension
			script: window.d3  ? ['lib/corona.js','lib/d3-selection-multi.min.js','lib/d3-time.min.js','lib/d3-time-format.min.js','lib/d3-transition.min.js']: 
			['lib/corona.js','lib/d3.v5.16.min.js','lib/d3-selection-multi.min.js','lib/d3-time.min.js','lib/d3-time-format.min.js','lib/d3-transition.min.js'],
			css: ['css/extension.css']
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
			title: {
				supported: true
			},
			tooltip: {
				supported: false,  // Set this true if your extension wants to enable HTML tooltips
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

}());
