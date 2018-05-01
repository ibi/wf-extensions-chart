/* globals _*/
// Copyright 1996-2016 Information Builders, Inc. All rights reserved.

(function() {
    // Required: Is invoked in the middle of each Moonbeam draw cycle
    // This is where your extension should be rendered
    // Arguments:
    //  - renderConfig: the standard callback argument object, including additional properties width, height, etc

    function preRenderCallback(prerenderConfig) {

      /*prerenderConfig.moonbeamInstance.eventDispatcher = { // testing drilling capability
          events: [
            { event: 'setURL', object: 'riser', series: 0, group: 0, url: 'http://google.com' ,target: '_blank' }
          ]
      };*/

      prerenderConfig.moonbeamInstance.legend.visible = false;
    }

    function jsonCpy( el ) {
      return JSON.parse(JSON.stringify(el));
    }

    function renderCallback(renderConfig) {
        var chart = renderConfig.moonbeamInstance;
        var props = renderConfig.properties;

        chart.legend.visible = false;

        props.width = renderConfig.width;
        props.height = renderConfig.height;
        
        props.formatNumber = chart.formatNumber.bind(chart);

        props.data = [(renderConfig.data || []).map(function(datum){
    			var datumCpy = jsonCpy(datum);
    			datumCpy.elClassName = chart.buildClassName('riser', datum._s, datum._g, 'bar');
    			return datumCpy;
    		})];

//        props.data = [
//            [{ "label": "ENGLAND", "value": 123456789.123456, "_s": 0, "_g": 0 }, { "label": "ITALY", "value": 30200, "_s": 0, "_g": 2 }, { "label": "JAPAN", "value": 78030, "_s": 0, "_g": 3 }, { "label": "W GERMANY", "value": 88190, "_s": 0, "_g": 4 }]
//        ];

        props.isInteractionDisabled = renderConfig.disableInteraction;

        props.onRenderComplete = renderConfig.renderComplete.bind(renderConfig);

        var container = d3.select(renderConfig.container)
            .attr('class', 'tdg_marker_chart');

        var arc_chart = tdg_arc(props);
		
		//Start Chart-2836	
		arc_chart.isInteractionDisabled(!chart.introAnimation.enabled);                 //Turn of intro animation if false
		
		if (window.event != undefined) {
			if (window.event.type == "resize") arc_chart.isInteractionDisabled(true);   //Turn Off animation if chart is being resized
		}
		//End Chart-2836
		
        arc_chart(container);

		
		
    }

    function getInvokeAfter (cb, count) {
        if (!count && typeof cb === 'function' ) cb();

        return function () {
            if (!(--count) && typeof cb === 'function') cb();
        };
    }

    function noDataRenderCallback(renderConfig) {
        var chart = renderConfig.moonbeamInstance;
        var props = renderConfig.properties;

        chart.legend.visible = false;

        props.formatNumber = chart.formatNumber.bind(chart);

        props.width = renderConfig.width;
        props.height = renderConfig.height;
        props.data = [
            [{ "label": "ENGLAND", "value": 12000, "_s": 0, "_g": 0 }, { "label": "ITALY", "value": 30200, "_s": 0, "_g": 2 }, { "label": "JAPAN", "value": 78030, "_s": 0, "_g": 3 }, { "label": "W GERMANY", "value": 88190, "_s": 0, "_g": 4 }]
        ];
        props.isInteractionDisabled = renderConfig.disableInteraction;

        var invokeAfterTwo = getInvokeAfter(renderConfig.renderComplete.bind(renderConfig), 2);

        props.onRenderComplete = invokeAfterTwo;

        var container = d3.select(renderConfig.container)
            .attr('class', 'tdg_marker_chart');

        var arc_chart = tdg_arc(props);

        arc_chart(container);

        appendCoverScreen(container, props.width, props.height);
        invokeAfterTwo();
    }

    function appendCoverScreen(container, width, height) {
        container.append("rect")
            .attr({
                width: width,
                height: height
            })
            .style({
                fill: 'white',
                opacity: 0.9
            });

        container.append('text')
            .text('Add more measures or dimensions')
            .attr({
                'text-anchor': 'middle',
                y: height / 2,
                x: width / 2
            })
            .style({
                'font-weight': 'bold',
                'font-size': '14px',
                dy: '0.35em',
                fill: 'grey'
            });
    }

    // Your extension's configuration
    var config = {
        id: 'com.ibi.arc', // string that uniquely identifies this extension
        name: 'Chord Diagram', // colloquial name for your chart - might be used in some extension list UI
        description: 'd3 chord diagram', // description useful for a UI tooltip or similar
        renderCallback: renderCallback, // reference to a function that will draw the actual chart.  Will be passed one 'renderConfig' object, defined below
        preRenderCallback: preRenderCallback,
        noDataRenderCallback: noDataRenderCallback,
        resources: { // Additional external resources (CSS & JS) required by this extension
            script: ['lib/d3.min.js', 'lib/arc.js'],
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
                supported: true // Set this true if your extension wants to enable HTML tooltips
            }
        }
    };

    // Required: this call will register your extension with Moonbeam
    tdgchart.extensionManager.register(config);

}());
