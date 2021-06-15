/*global tdgchart: false, d3: false */
/* Copyright (c) 1996-2021 TIBCO Software Inc. All Rights Reserved. */

(function() {

	function renderCallback(renderConfig) {

		// If there's nothing in series_break, dataBuckets.depth will be 1 and data will be a flat array of datum objects.
		// Normalize whether we have a series_break or not by forcing internal data to always have two aray dimensions.
		var data = renderConfig.data;
		if (renderConfig.dataBuckets.depth === 1) {
			data = [data];
		}

		// Build list of all unique axis labels found across the entire data set
		var axisLabels = [].concat.apply([], data).map(function(el) {return el.labels;}).filter((function() {
			var seen = {};
			return function(el) {
				return el != null && !(el in seen) && (seen[el] = 1);
			};
		})());

		// If we have no valid labels, use 'Label X' placeholders
		if (!axisLabels.length) {
			var labelCount = d3.max(data, function(el) {return el.length;});
			axisLabels = d3.range(0, labelCount).map(function(el) {return 'Label ' + el;});
		}

		// Per-series data comes in as one array of data = one similarly colored riser across each group.
		// That's hard to work with. Transpose data so we have one array = one multi-colored stack of data.
		data = d3.transpose(data);

		// Calculate a y value for the start and end positions of each riser in each stack
		data.forEach(function(array) {
			var stackSum = 0;
			array.forEach(function(d, i) {
				if (!d.labels) {
					d.labels = 'Label ' + i;
				}
				d.y0 = stackSum;
				d.y1 = stackSum + d.value;
				stackSum += d.value;
			});
		});

		var pad = 10;
		var x = d3.scale.ordinal().domain(axisLabels).rangeRoundBands([pad, renderConfig.width - pad], 0.2);
		var ymax = d3.max(data.map(function(a) {return d3.sum(a, function(d) {return d.value;});}));
		var y = d3.scale.linear().domain([0, ymax]).range([renderConfig.height - pad - pad, pad]);

		var container = d3.select(renderConfig.container).attr('class', 'extension_container').append('g');

		// Draw the axis divider line
		container.append('path')
			.attr('d', 'M' + pad + ', ' + (y(0) + 1) + 'l' + (renderConfig.width - 25) + ',0');

		// Risers are grouped per stack / group label
		var riserGroups = container.selectAll('g')
			.data(data).enter().append('g');

		// Draw each riser
		riserGroups.selectAll('rect')
			.data(function(d) {return d;}).enter().append('rect')
			.attr('x', function(d) {return x(d.labels);})
			.attr('y', function(d) {return y(d.y1);})
			.attr('width', x.rangeBand())
			.attr('height', function(d) {return Math.abs(y(d.y1) - y(d.y0));})
			.attr('fill', function(d, s) {

				// getSeriesAndGroupProperty(seriesID, groupID, property) can be used
				// to easily look up any series dependent property. 'property' can be in
				// dot notation (eg: 'marker.border.width').  Use this to get the color
				// the chart engine would use to fill a given series.
				return renderConfig.moonbeamInstance.getSeriesAndGroupProperty(s, null, 'color');
			});

		// Draw x axis labels
		container.append('g')
			.selectAll('text')
			.data(axisLabels).enter().append('text')
			.attr('transform', function(d) {
				return 'translate(' + (x(d) + (x.rangeBand() / 2)) + ',' + (renderConfig.height - (pad / 2)) + ')';
			})
			.text(function(d, i) {
				return renderConfig.moonbeamInstance.truncateLabel(axisLabels[i], '12px helvetica', x.rangeBand());
			});

		renderConfig.renderComplete();
	}

	// Your extension's configuration
	var config = {
		id: 'com.ibi.tutorial_series_break',
		containerType: 'svg',
		renderCallback: renderCallback,
		resources: {
			script: ['../lib/d3.min.js'],
			css: ['../lib/style.css']
		},
		modules: {
			legend: {
				colorMode: 'series', // Return 'series' to draw a traditional series legend, with one unique marker & label for each series
				seriesCount: function(renderConfig) {
					// Return the number of entries that should be in the legend
					if (renderConfig.dataBuckets.depth === 1) {
						return 1;
					}
					return renderConfig.data.length;
				}
			}
		}
	};

	tdgchart.extensionManager.register(config);

})();
