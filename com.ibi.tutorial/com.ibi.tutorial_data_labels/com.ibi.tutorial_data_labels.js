/*global tdgchart: false, d3: false */
/* Copyright 1996-2015 Information Builders, Inc. All rights reserved. */

(function() {

	function renderCallback(renderConfig) {

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
			.attr('fill', renderConfig.moonbeamInstance.getSeriesAndGroupProperty(0, null, 'color'))
			.each(function(d, g, s) {

				// The first step in drawing data labels is to retrieve the content and position of the label
				// to be drawn on this riser.  getDataLabelProperties() does this.  Arguments are the typical
				// 'd' (single riser datum), 'data' (array of data for this series) and series / group ID object.
				// This returns an object describing the content, style and position of the label to be drawn.
				var lbl = renderConfig.modules.dataLabels.getDataLabelProperties(d, data, {series: 0, group: g});

				// The second step is to draw the label in the right spot.  An extension can do this itself
				// manually, by reading the necessary info from 'lbl' above.  Or an extension can use the built in
				// 'addDataLabelToRiser' method.  This takes two arguments: a reference to the DOM node that
				// contains the current riser, and a reference to a label properties object returned from 
				// getDataLabelProperties().
				renderConfig.modules.dataLabels.addDataLabelToRiser(this, lbl);
			});

		renderConfig.renderComplete();
	}

	var config = {
		id: 'com.ibi.tutorial_data_labels',
		containerType: 'svg',
		renderCallback: renderCallback,
		resources: {
			script: ['../lib/d3.js'],
			css: ['../lib/style.css']
		},
		modules: {
			dataLabels: {
				supported: true,  // This must be true to enable data label support
				defaultDataArrayEntry: function(arg) {
					// Return the name of the 'default' bucket that should be used to define data label content,
					// if a more specific data label content lookup is not found.
					return 'value'
				}
			}
		}
	};

	tdgchart.extensionManager.register(config);
})();
