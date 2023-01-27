/*global tdgchart: false, d3: false */
// Copyright (C) 1996-2023. Cloud Software Group, Inc. All rights reserved.

(function() {

	function preRenderCallback(preRenderConfig) {
		var chart = preRenderConfig.moonbeamInstance;
		chart.legend.visible = false;
	}

	function renderCallback(renderConfig) {

		var chart = renderConfig.moonbeamInstance;
		var gaugeProps = renderConfig.properties;
		
		var margin = {left: 10, right: 10, top: 10, bottom: 10};
		var width = renderConfig.width - margin.left - margin.right;
		var height = renderConfig.height - margin.top - margin.bottom;
		var id = renderConfig.containerIDPrefix + '_gaugeContainer';
		
		var container = d3.select(renderConfig.container)
			.attr('class', 'com_ibi_chart')
		.append('g')
			.attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
			.attr('id', id);

		var gauge = liquidGauge();
		tdgchart.util.mergeObjects(gaugeProps, gauge);
		if (chart.drawStaticChart) {
		  	/* [VIZ-803] PDF/PNG rendering should get the final look not the initial state of animation */
			gauge.waveRise = gauge.waveAnimate = gauge.valueCountUp = false;
		}
		gauge.width = width;
		gauge.height = height;

		var value = (((chart.data || [])[0] || [])[0] || {}).value || 0;
		gauge.draw(id, value);
		
		//Start CHART-2971 new feature code
		
		var lGauge = d3.select("#"+ id);   //D3 css selector reference to the liquid guage DOM object
		
		// To support multi-drill, a riser must include a class name with the appropriate seriesID and groupID
		// You can use chart.buildClassName to create an appropriate class name.
		// 1st argument must be 'riser', 2nd is seriesID, 3rd is groupID, 4th is an optional extra string which can be used to identify the risers in your extension.	
		//Adopted from example in com.ibi.simple_bar.js: https://github.com/ibi/wf-extensions-chart/blob/master/com.ibi.simple_bar/com.ibi.simple_bar.js	
		lGauge.attr('class', chart.buildClassName('riser', 0, 0, 'liquidGauge'));

		// addDefaultToolTipContent will add the same tooltip a riser as the built in chart types would.
		//Adopted from example in com.ibi.simple_bar.js: https://github.com/ibi/wf-extensions-chart/blob/master/com.ibi.simple_bar/com.ibi.simple_bar.js
		if (chart.data) {		
			renderConfig.modules.tooltip.addDefaultToolTipContent(lGauge.node(), 0, 0, chart.data[0][0]);   //lGauge.node is the DOM reference to the liquid guage
			renderConfig.renderComplete();  //Method will build the tooltip content referenced by chart.buildClassName and renderConfig.modules.tooltip.addDefaultToolTipContent
		}	
		
		//End CHART-2917 new feature code	
		
	}

	var config = {
		id: 'com.ibi.liquid_gauge',
		name: 'Liquid Gauge Chart',
		preRenderCallback: preRenderCallback,
		renderCallback: renderCallback,
		resources:  {
			script: window.d3
				? ['lib/liquid_gauge.js']
				: ['lib/d3.v5.16.min.js', 'lib/liquid_gauge.js']
		},
		//Start CHART-2971 new feature code
		modules: {
			eventHandler: {        
				supported: true
			},			
			tooltip: {
				supported: true  // Multi drills are handled by adding additional entries to a riser's tooltip.  Enable this module, and define a default tooltip for each riser to support multi-drill.
			},
			autoContent: function(target, s, g, d) {
					return d.value;
			}
		}
        //End CHART-2917 new feature code		
	};

	tdgchart.extensionManager.register(config);
  
}());
