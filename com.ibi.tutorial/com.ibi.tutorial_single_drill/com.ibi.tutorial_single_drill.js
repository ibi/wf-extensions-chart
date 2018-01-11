/*global tdgchart: false, d3: false */
/* Copyright 1996-2015 Information Builders, Inc. All rights reserved. */

(function() {

	function renderCallback(renderConfig) {

		var chart = renderConfig.moonbeamInstance;
		var data = renderConfig.data;
		var pad = 10;

		var labels = data.map(function(el) {return el.labels;});
		var x = d3.scale.ordinal().domain(labels).rangeRoundBands([pad, renderConfig.width - pad], 0.2);
		var ymax = d3.max(data, function(d) {return d.value;});
		var y = d3.scale.linear().domain([0, ymax]).range([renderConfig.height - pad, pad]);

		var container = d3.select(renderConfig.container).attr('class', 'extension_container').append('g');

		// Draw axis divider line
		container.append('path')
			.attr('d', 'M' + pad + ',' + (y(0) + 1) + 'l' + (renderConfig.width - pad - pad) + ',0');

		// Draw risers
		container.selectAll('rect')
			.data(data).enter().append('rect')
			.attr('x', function(d) {return x(d.labels);})
			.attr('y', function(d) {return y(d.value);})
			.attr('width', x.rangeBand())
			.attr('height', function(d) {return Math.abs(y(d.value) - y(0));})
			.attr('fill', chart.getSeriesAndGroupProperty(0, null, 'color'))
			.attr('class', function(d, g) {

				// To support events (like single drilldown clicks), each riser must include a class name with the appropriate seriesID and groupID
				// You can use chart.buildClassName to create an appropriate class name.
				// 1st argument must be 'riser', 2nd is seriesID, 3rd is groupID, 4th is an optional extra string which can be used to identify the risers in your extension.
				return chart.buildClassName('riser', 0, g, 'bar');
			});

		renderConfig.renderComplete();
	}

	// Automatic, built in WebFOCUS single drills and multi-drills are handled very differently.
	// Single drills are handled with a single click on a riser; this is supported via the general purpose 'eventHandler' module
	var config = {
		id: 'com.ibi.tutorial_single_drill',
		containerType: 'svg',
		renderCallback: renderCallback,
		resources: {
			script: ['../lib/d3.js'],
			css: ['../lib/style.css']
		},
		modules: {
			eventHandler: {
				supported: true  // Single drills are handled by clicking a riser, which is implemented in the eventHandler module.
			}
		}
	};

	tdgchart.extensionManager.register(config);
})();
