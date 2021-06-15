/*global tdgchart: false, d3: false */
/* Copyright (c) 1996-2021 TIBCO Software Inc. All Rights Reserved. */

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
			.attr('fill', chart.getSeriesAndGroupProperty(0, null, 'color'));

		renderConfig.renderComplete();
	}

	var config = {
		id: 'com.ibi.tutorial_data_page_slider',
		containerType: 'svg',
		renderCallback: renderCallback,
		resources: {
			script: ['../lib/d3.js'],
			css: ['../lib/style.css']
		},
		modules: {
			// No modules are necessary to support the data page sliders. For this feature, the chart engine
			// does everything; it will draw the data page slider, handle all slider interaction, and will
			// redraw the extension on each slider movement, passing in the correct 'poge' of data associated
			// with the selected slider tick.
		}
	};

	tdgchart.extensionManager.register(config);
})();
