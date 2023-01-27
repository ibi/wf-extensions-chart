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
        var data = [{"Question":"Focal Point is a great resource for all levels of user.","replies":[5,5,20,150,100]},{"Question":"An InfoAssist forum is necessary.","replies":[15,5,200,5,15]},{"Question":"International Summit Series is a great opportunity to meet peers in my group.","replies":[5,5,60,80,100]},{"Question":"WebFOCUS InfoGraphics in 8.2.04 is a good step in BI.","replies":[5,10,100,50,40]}];
        var props = renderConfig.properties;
		var buckets = {"replies":{"title":["Strongly Disagree","Disagree","Neither Agree nor Disagree","Agree","Strongly Agree"],"count":5}};

        var width = renderConfig.width;
        var height = renderConfig.height;

		var container = d3.select(renderConfig.container)
			.attr('class', 'com_ibi_chart');
           
        checkData(data,container,width,height,props,buckets,chart);

        appendCoverScreen(container, width, height);

		renderConfig.renderComplete();
	}

    function appendCoverScreen(container, width, height) {
        container.append("rect")
            .attr({
                width: width,
                height: height
            })
            .style({
                fill: 'white',
                opacity: 0.7
            });
        container.append('text')
            .text('Currently, there are insufficient buckets completed.')
            .attr({
                'text-anchor': 'middle',
                y: (height / 2) - 30,
                x: width / 2
            })
            .style({
                'font-weight': 'bold',
                'font-size': '14px',
                dy: '0.35em',
                fill: 'grey'
            });
        container.append('text')
            .text('Please add more measures or dimensions')
            .attr({
                'text-anchor': 'middle',
                y: (height / 2) + 30,
                x: width / 2
            })
            .style({
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
//		chart.title.visible = false;
//		chart.title.text = info.custom_title;
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
		var buckets = renderConfig.dataBuckets.buckets;

        var width = renderConfig.width;
        var height = renderConfig.height;

		var container = d3.select(renderConfig.container)
			.attr('class', 'com_ibi_chart');
            
        if (buckets.replies.count) {
            if (buckets.replies.count === 5) {
                checkData(data,container,width,height,props,buckets,chart);
            } else {
                noDataRenderCallback(renderConfig);
            }
        } else {
            noDataRenderCallback(renderConfig);
        }

		renderConfig.renderComplete();
	}

	// Your extension's configuration
	var config = {
		id: 'com.ibi.divergent',     // string that uniquely identifies this extension
		containerType: 'svg',  // either 'html' or 'svg' (default)
		initCallback: initCallback,
		preRenderCallback: preRenderCallback,  // reference to a function that is called right *before* your extension is rendered.  Will be passed one 'preRenderConfig' object, defined below.  Use this to configure a Moonbeam instance as needed
		renderCallback: renderCallback,  // reference to a function that will draw the actual chart.  Will be passed one 'renderConfig' object, defined below
		noDataPreRenderCallback: noDataPreRenderCallback,
		noDataRenderCallback: noDataRenderCallback,
		resources: {  // Additional external resources (CSS & JS) required by this extension
			script: ['lib/d3.min.js','lib/divergent.js'],
			css: ['css/extension.css']
		},
		modules: {
		}
	};

	// Required: this call will register your extension with the chart engine
	tdgchart.extensionManager.register(config);

}());
