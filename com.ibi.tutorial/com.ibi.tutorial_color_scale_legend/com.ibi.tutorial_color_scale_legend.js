/*global tdgchart: false, d3: false */
/* Copyright (c) 1996-2021 TIBCO Software Inc. All Rights Reserved. */

(function() {

	function renderCallback(renderConfig) {

		var pad = 10;
		var data = renderConfig.data;
		var labels = data.map(function(el) {return el.labels;});
		var x = d3.scale.ordinal().domain(labels).rangeRoundBands([pad, renderConfig.width - pad], 0.2);
		var ymax = d3.max(data, function(d) {return d.value;});
		var y = d3.scale.linear().domain([0, ymax]).range([renderConfig.height - pad, pad]);

		// The color scale module includes a 'getColorScale()' method, which returns a d3 style scale function;
		// Pass it a value and it returns an RGB color object for the value's color along the color scale.
		var colorScale = renderConfig.modules.colorScale.getColorScale();

		var container = d3.select(renderConfig.container).attr('class', 'extension_container').append('g');

		container.append('path')
			.attr('d', 'M' + pad + ',' + (y(0) + 1) + 'l' + (renderConfig.width - pad - pad) + ',0');

		container.selectAll('rect')
			.data(data).enter().append('rect')
			.attr('x', function(d) {return x(d.labels);})
			.attr('y', function(d) {return y(d.value);})
			.attr('width', x.rangeBand())
			.attr('height', function(d) {return Math.abs(y(d.value) - y(0));})
			.attr('fill', function(d) {

				// Use the color scale to determine a color for this value
				return colorScale(d.value);
			});

		renderConfig.renderComplete();
	}

	var config = {
		id: 'com.ibi.tutorial_color_scale_legend',
		containerType: 'svg',
		renderCallback: renderCallback,
		resources: {
			script: ['../lib/d3.min.js'],
			css: ['../lib/style.css']
		},
		modules: {
			colorScale: {
				supported: true,  // This must be true to enable color scale support
				minMax: function(renderConfig) {
					// Return a {min, max} object that defines the axis min and max values for this color scale
					return {
						min: d3.min(renderConfig.data, function(d) {return d.value;}),
						max: d3.max(renderConfig.data, function(d) {return d.value;})
					};
				}
			},
			legend: {
				colorMode: 'data' // Return 'data' to always draw a color scale in the legend
			}
		}
	};

	tdgchart.extensionManager.register(config);
})();
