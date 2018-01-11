/*global tdgchart: false, d3: false */
/* Copyright 1996-2015 Information Builders, Inc. All rights reserved. */

(function() {

	function renderCallback(renderConfig) {

		var pad = 10;
		var data = renderConfig.data;
		var labels = data.map(function(el) {return el.labels;});
		var x = d3.scale.ordinal().domain(labels).rangeRoundBands([pad, renderConfig.width - pad], 0.2);
		var ymax = d3.max(data, function(d) {return d.value;});
		var y = d3.scale.linear().domain([0, ymax]).range([renderConfig.height - pad, pad]);

		// The size scale module includes a 'getSizeScale()' method, which returns a d3 style scale function;
		// Pass it a value and it returns a number representing the *radius* of the value along the scale.
		var sizeScale = renderConfig.modules.sizeScale.getSizeScale();
		var groupRadius= x.rangeBand() / 2;

		// If there's nothing in the size bucket, getBucket('size') will return null, and the sizeScale() will be ill-defined
		// In that case, one option is to use a fixed size
		if (renderConfig.dataBuckets.getBucket('size') == null) {
			sizeScale = x.rangeBand;
		}

		var container = d3.select(renderConfig.container).attr('class', 'extension_container').append('g');

		container.append('path')
			.attr('d', 'M' + pad + ',' + (y(0) + 1) + 'l' + (renderConfig.width - pad - pad) + ',0');

		container.selectAll('rect')
			.data(data).enter().append('rect')
			.attr('fill', renderConfig.moonbeamInstance.getSeriesAndGroupProperty(0, null, 'color'))
			.attr('y', function(d) {return y(d.value);})
			.attr('height', function(d) {return Math.abs(y(d.value) - y(0));})
			.attr('x', function(d) {
				return x(d.labels) + groupRadius - (sizeScale(d.size) / 2);
			})
			.attr('width', function(d) {
				return sizeScale(d.size);
			});

		renderConfig.renderComplete();
	}

	var config = {
		id: 'com.ibi.tutorial_size_scale_legend',
		containerType: 'svg',
		renderCallback: renderCallback,
		resources: {
			script: ['../lib/d3.min.js'],
			css: ['../lib/style.css']
		},
		modules: {
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
			legend: {
				sizeMode: 'size'  // Return 'size' to always draw a size scale in the legend
			}
		}
	};

	tdgchart.extensionManager.register(config);
})();
