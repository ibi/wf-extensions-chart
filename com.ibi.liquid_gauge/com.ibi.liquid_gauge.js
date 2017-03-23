/*global tdgchart: false, d3: false */
// Copyright 1996-2015 Information Builders, Inc. All rights reserved.

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
		
		var container = d3.select(renderConfig.container)
			.attr('class', 'com_ibi_chart')
		.append('g')
			.attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
			.attr('id', 'gaugeContainer');

		var gauge = d3.liquidGauge();
		tdgchart.util.mergeObjects(gaugeProps, gauge);
		gauge.width = width;
		gauge.height = height;
		
		var value = chart.data[0][0].value;
		gauge.draw("gaugeContainer", value);
	}

	var config = {
		id: 'com.ibi.liquid_gauge',
		name: 'Liquid Gauge Chart',
		preRenderCallback: preRenderCallback,
		renderCallback: renderCallback,
		resources:  {
			script: ['lib/d3.min.js', 'lib/liquid_gauge.js']
		}
	};

	tdgchart.extensionManager.register(config);
  
}());