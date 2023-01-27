/*global tdgchart: false, d3: false */
/* Copyright (C) 1996-2023. Cloud Software Group, Inc. All rights reserved. */

(function() {

	function renderCallback(renderConfig) {

		var chart = renderConfig.moonbeamInstance;
		var data = renderConfig.data;
		var w = renderConfig.width;
		var h = renderConfig.height;
		var pad = 10;

		var labels = data.map(function(el) {return el.labels;});
		var x = d3.scale.ordinal().domain(labels).rangeRoundBands([pad, w - pad], 0.2);
		var ymax = d3.max(data, function(d) {return d.value;});
		var y = d3.scale.linear().domain([0, ymax]).range([h - pad, pad]);

		var container = d3.select(renderConfig.container).attr('class', 'extension_container').append('g');

		// Draw axis divider line
		container.append('path')
			.attr('d', 'M' + pad + ',' + (y(0) + 1) + 'l' + (w - pad - pad) + ',0');

		// Draw risers
		container.selectAll('rect')
			.data(data)
			.enter().append('rect')
			.attr('x', function(d) {return x(d.labels);})
			.attr('y', function(d) {return y(d.value);})
			.attr('width', x.rangeBand())
			.attr('height', function(d) {return Math.abs(y(d.value) - y(0));})
			.attr('fill', chart.getSeriesAndGroupProperty(0, null, 'color'))
			.attr('class', function(d, g) {

				// To support data selection, each riser must include a unique class name with the appropriate
				// seriesID and groupID.  Use chart.buildClassName to create an appropriate class name.
				// 1st argument must be 'riser', 2nd is seriesID, 3rd is groupID, 4th is an optional extra
				// string which can be used to identify the risers in your extension.
				return chart.buildClassName('riser', 0, g, 'bar');
			});

		renderConfig.renderComplete();
	}

	var config = {
		id: 'com.ibi.tutorial_data_selection',
		containerType: 'svg',
		renderCallback: renderCallback,
		resources: {
			script: ['../lib/d3.js'],
			css: ['../lib/style.css']
		},
		modules: {
			dataSelection: {

				supported: true,  // This must be true to enable support for data selection

				// If you're using an HTML container, altering the provided SVG container, or creating your 
				// own SVG container outside the provided container, use this to return a reference to the 
				// DOM container that contains all of the extension's riser nodes.
				svgNode: function(renderConfig) {
					return renderConfig.container.getElementsByTagName('svg')[0];
				}
			},
		}
	};

	tdgchart.extensionManager.register(config);
})();
