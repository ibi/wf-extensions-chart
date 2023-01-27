/*global tdgchart: false, d3: false */
/* Copyright (C) 1996-2023. Cloud Software Group, Inc. All rights reserved. */

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

				// To support multi-drill, each riser must include a class name with the appropriate seriesID and groupID
				// You can use chart.buildClassName to create an appropriate class name.
				// 1st argument must be 'riser', 2nd is seriesID, 3rd is groupID, 4th is an optional extra string which can be used to identify the risers in your extension.
				return chart.buildClassName('riser', 0, g, 'bar');
			})
			.each(function(d, g) {

				// addDefaultToolTipContent will add the same tooltip to this riser as the built in chart types would.
				// Assumes that 'this' DOM node includes a class name that is a fully qualified series & group (genereally created with buildClassName).
				// addDefaultToolTipContent can also accept optional arguments:
				// addDefaultToolTipContent(targetDOMNode, s, g, d, data), useful if this node does not have a class
				// or if you want to override the default series / group / datum lookup logic.
				// This is one way to implement multi-drill in an extension.
				renderConfig.modules.tooltip.addDefaultToolTipContent(this, 0, g, d);
			});

		renderConfig.renderComplete();
	}

	// Multi-drills are handled with additional entries in a riser's tooltip; this is supported via the general purpose 'tooltip' module.
	var config = {
		id: 'com.ibi.tutorial_multi_drill',
		containerType: 'svg',
		renderCallback: renderCallback,
		resources: {
			script: ['../lib/d3.js'],
			css: ['../lib/style.css']
		},
		modules: {
			tooltip: {
				supported: true  // Multi drills are handled by adding additional entries to a riser's tooltip.  Enable this module, and define a default tooltip for each riser to support multi-drill.
			}
		}
	};

	tdgchart.extensionManager.register(config);
})();
