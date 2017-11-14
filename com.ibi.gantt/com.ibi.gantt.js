/*global tdgchart: false, d3: false, pv: false */
/* Copyright 1996-2015 Information Builders, Inc. All rights reserved. */

(function() {

tdgchart.util.color.isLineVisible = tdgchart.util.color.isLineVisible || function(props) {
	return props && props.width > 0 && tdgchart.util.color.isVisible(props.color);
};

var monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function sanitizeTime(t) {
	if (typeof t !== 'string') {
		return null;
	}
	t = t.trim();
	if (t) {
		var test = new Date(t);
		if (test && isFinite(test)) {
			return test;
		}
	}
	return null;
}

function time_min(t1, t2) {
	if (t1 && t2) {
		return (t1 < t2) ? t1 : t2;
	} else if (t1) {
		return t1;
	} else if (t2) {
		return t2;
	}
	return null;
}

function time_max(t1, t2) {
	if (t1 && t2) {
		return (t1 > t2) ? t1 : t2;
	} else if (t1) {
		return t1;
	} else if (t2) {
		return t2;
	}
	return null;
}

function sortData(data, sort) {
	if (!sort) {
		return data;
	}

	return data.sort(function(a, b) {
		if (sort === 'label') {
			if (a && b && a.label && b.label) {
				return a.label.localeCompare(b.label);
			} else if (a && a.label) {
				return 1;
			} else if (b && b.label) {
				return -1;
			}
		} else if (sort === 'start_time') {
			if (a && b && a.start && b.start) {
				if (a.start < b.start) {
					return -1;
				} else if (b.start < a.start) {
					return 1;
				}
				return 0;
			} else if (a && a.start) {
				return 1;
			} else if (b && b.start) {
				return -1;
			}
		} else if (sort === 'stop_time') {
			if (a && b && a.stop && b.stop) {
				if (a.stop < b.stop) {
					return -1;
				} else if (b.stop < a.stop) {
					return 1;
				}
				return 0;
			} else if (a && a.stop) {
				return 1;
			} else if (b && b.stop) {
				return -1;
			}
		}
		return 0;
	});
}

function getDefsNode(containerID) {
	var svg = document.getElementById(containerID).ownerSVGElement;
	var defs = svg.getElementsByTagName('defs');
	return d3.select(defs[0]);
}

function createClipRect(defs, size, url) {
	defs.append('clipPath')
		.attr('id', url)
	.append('rect')
		.attr('x', -1)
		.attr('y', -1)
		.attr('width', size.width + 1)
		.attr('height', size.height + 1);
}

function getAxis(data) {

	// Find first and last time entries across all start & stop values
	var i, d, start, stop;
	for (i = 0; i < data.length; i++) {
		d = data[i];
		if (!d) {
			continue;
		}
		start = time_min(start, time_min(d.start, d.stop));
		stop = time_max(stop, time_max(d.start, d.stop));
		d.milestone.forEach(function(m) {
			start = time_min(start, m);
			stop = time_max(stop, m);
		});
	}

	if (start == null && stop == null) {
		return {
			rows: [],
			count: 0,
			scale: d3.scaleTime()
		};
	}

	var scale = d3.scaleTime().domain([start, stop]).nice();
	var years = scale.ticks(d3.timeYear.every(1));
	years.pop();
	var yearDivisions = [], monthDivisons = [], dayDivisions = [], startTime;
	if (years.length > 5) {
		yearDivisions = years.map(function(el, i) {
			return {start: i, width: 1, text: el.getFullYear() + ''};
		});
		return {
			scale: scale,
			rows: [yearDivisions],
			count: years.length
		};
	}
	var months = scale.ticks(d3.timeMonth.every(1));
	months.pop();
	if (months.length > 4) {
		monthDivisons = months.map(function(el, i) {
			return {start: i, width: 1, text: monthNames[el.getMonth()]};
		});
		if (months[months.length - 1].getFullYear() > months[0].getFullYear()) {
			months.forEach(function(m, i) {
				if (startTime == null || m.getFullYear() > startTime) {
					yearDivisions.push({start: i, width: 1, text: m.getFullYear() + ''});
					startTime = m.getFullYear();
				} else {
					yearDivisions[yearDivisions.length - 1].width += 1;
				}
			});
			return {
				scale: scale,
				rows: [yearDivisions, monthDivisons],
				count: months.length
			};
		}
		return {
			scale: scale,
			rows: [monthDivisons],
			count: months.length
		};
	}
	scale = d3.scaleTime().domain([start, stop]).nice(d3.timeDay);
	var days = scale.ticks(d3.timeDay.every(1));
	days.pop();
	if (days.length > 4) {
		dayDivisions = days.map(function(el, i) {
			return {start: i, width: 1, text: el.getDate() + ''};
		});
		if (days[days.length - 1].getMonth() > days[0].getMonth()) {
			days.forEach(function(m, i) {
				if (startTime == null || m.getMonth() > startTime) {
					monthDivisons.push({start: i, width: 1, text: monthNames[m.getMonth()]});
					startTime = m.getMonth();
				} else {
					monthDivisons[monthDivisons.length - 1].width += 1;
				}
			});
			return {
				scale: scale,
				rows: [monthDivisons, dayDivisions],
				count: days.length
			};
		}
		return {
			scale: scale,
			rows: [dayDivisions],
			count: days.length
		};
	}
	return null;
}

// props: container, x, y, width, height, style, className, clipURL, contentCallback
function drawRegion(props) {

	var tdg = tdgchart.util;
	var fmt = tdg.formatString;

	var group = props.container.append('g')
		.attr('class', props.className)
		.attr('clip-path', props.clipURL ? fmt('url(#{0})', props.clipURL) : null)
		.attr('transform', fmt('translate({0}, {1})', props.x, props.y));

	if (tdg.color.isVisible(props.style.fill)) {
		group.append('rect')
			.attr('x', 0)
			.attr('y', 0)
			.attr('width', props.width)
			.attr('height', props.height)
			.attr('fill', props.style.fill);
	}

	props.scrollGroup = group.append('g')
		.attr('class', props.className + '-scroll')
		.attr('transform', 'translate(0, 0)');

	props.contentCallback(props);

	if (tdg.color.isLineVisible(props.style.border)) {
		group.append('rect')
			.attr('x', 0)
			.attr('y', 0)
			.attr('width', props.width)
			.attr('height', props.height)
			.attr('stroke', props.style.border.color)
			.attr('stroke-width', props.style.border.width);
	}

	return props.scrollGroup;
}

function renderCallback(renderConfig) {

	var chart = renderConfig.moonbeamInstance;
	var data = renderConfig.data;
	var properties = renderConfig.properties;
	var style = properties.style;
	var tdg = tdgchart.util;
	var fmt = tdg.formatString;
	var labelScrollGroup, riserScrollGroup, axisScrollGroup, i;

	var container = d3.select('#' + renderConfig.container.id)
		.append('g')
		.attr('transform', 'translate(5, 5)')
		.attr('class', 'com_ibi_gantt')
		.attr('stroke-linecap', 'square')
		.attr('shape-rendering', 'crispEdges');

	var defs = getDefsNode(renderConfig.container.id);

	// Convert all string dates in the data set to JS Date objects
	data = data.map(function(d, i) {
		var milestone = Array.isArray(d.milestone) ? d.milestone : (d.milestone ? [d.milestone] : []);
		milestone = milestone.map(function(m) {
			return sanitizeTime(m);
		});
		return {
			label: d.label,
			start: sanitizeTime(d.start),
			stop: sanitizeTime(d.stop),
			milestone: milestone,
			group: i
		};
	});

	data = sortData(data, properties.sort);

	var axis = getAxis(data);

	if (axis == null) {
		throw 'Gantt: Error calculating Time Span';
	}

	var labels = data.map(function(el) {
		return el.label;
	});

	var labelSize = {
		width: tdg.max(labels, function(el) {
			return chart.measureLabel(el, style.labels.font).width;
		}),
		height: chart.measureLabel('W', style.labels.font).height
	};

	if (labelSize.width > renderConfig.width * properties.layout.max_label_width) {
		labelSize.width = renderConfig.width * properties.layout.max_label_width;
		labels = labels.map(function(el) {
			return chart.truncateLabel(el, style.labels.font, labelSize.width);
		});
	}

	var maxLabel = 'May';
	var axisLabelSizes = axis.rows.map(function(row, i) {
		return chart.measureLabel(maxLabel, style.timeAxis.rows[i].label.font);
	});

	var cellSize = {
		width: Math.round((tdg.max(axisLabelSizes, 'width') || 0) + 12),
		height: Math.round(labelSize.height + 10)
	};

	var axisRowHeights = axisLabelSizes.map(function(row, i) {
		return axisLabelSizes[i].height + 5;
	});
	var axisGroupSize = {
		width: cellSize.width * axis.count,
		overallWidth: cellSize.width * axis.count,
		height: tdg.sum(axisRowHeights)
	};

	axis.scale.range([0, axisGroupSize.width]);

	var labelClipURL;
	var labelGroupSize = {
		width: labelSize.width + 15,
		height: cellSize.height * labels.length,
		overallHeight: cellSize.height * labels.length
	};

	if (axisGroupSize.height + labelGroupSize.height > renderConfig.height - 25) {  // 25 for pad + scrollbar
		labelGroupSize.height = renderConfig.height - axisGroupSize.height - 25;
		labelClipURL = renderConfig.container.id + '_label_clip';
		createClipRect(defs, labelGroupSize, labelClipURL);
	}

	var axisClipURL;
	if (axisGroupSize.width + labelGroupSize.width + 25 > renderConfig.width) {
		axisGroupSize.width = renderConfig.width - labelGroupSize.width - 25;
		axisClipURL = renderConfig.container.id + '_axis_clip';
		createClipRect(defs, axisGroupSize, axisClipURL);
	}

	labelScrollGroup = drawRegion({
		container: container,
		x: 0,
		y: axisGroupSize.height,
		width: labelGroupSize.width,
		height: labelGroupSize.height,
		style: style.labels,
		className: 'labels',
		clipURL: labelClipURL,
		contentCallback: function(props) {
			var labelSubGroups = props.scrollGroup.selectAll('g')
				.data(labels)
				.enter()
				.append('g')
				.attr('transform', function(d, i) {
					return fmt('translate(0, {0})', cellSize.height * i);
				});

			labelSubGroups.append('text')
				.text(function(d) {return d;})
				.attr('x', labelGroupSize.width - 10)
				.attr('y', labelSize.height + 1)
				.attr('text-anchor', 'end')
				.attr('fill', style.labels.color)
				.attr('style', 'font: ' + style.labels.font);

			if (tdg.color.isLineVisible(style.labels.dividers)) {
				labelSubGroups.append('path')
					.attr('d', function(d, i) {
						return (i === 0) ? null : fmt('M0 0H{0}', labelGroupSize.width);
					})
					.attr('stroke', style.labels.dividers.color)
					.attr('stroke-width', style.labels.dividers.width);
			}
		}
	});

	if (axis.count > 0) {

		axisScrollGroup = drawRegion({
			container: container,
			x: labelGroupSize.width,
			y: 0,
			width: axisGroupSize.width,
			height: axisGroupSize.height,
			style: style.timeAxis,
			className: 'axis',
			clipURL: axisClipURL,
			contentCallback: function(props) {
				if (tdg.color.isLineVisible(style.timeAxis.dividers)) {
					props.scrollGroup.append('path')
						.attr('d', fmt('M0 {0}H{1}', axisRowHeights[0], axisGroupSize.overallWidth))
						.attr('stroke', style.timeAxis.dividers.color)
						.attr('stroke-width', style.timeAxis.dividers.width)
						.attr('stroke-linecap', 'butt');
				}

				axis.rows.forEach(function(row, i) {
					var colGroups = props.scrollGroup.append('g')
						.attr('transform', fmt('translate(0, {0})', tdg.sum(axisRowHeights.slice(0, i))))
					.selectAll('g')
						.data(row)
						.enter()
						.append('g')
						.attr('transform', function(d) {
							return 'translate(' + (d.start * cellSize.width) + ', 0)';
						});

					if (tdg.color.isLineVisible(style.timeAxis.dividers)) {
						colGroups.append('path')
							.attr('d', function(d, idx) {
								return (idx === 0) ? null : fmt('M0 0V{0}', axisRowHeights[i]);
							})
							.attr('stroke', style.timeAxis.dividers.color)
							.attr('stroke-width', style.timeAxis.dividers.width)
							.attr('stroke-linecap', 'butt');
					}

					colGroups.append('text')
						.text(function(d) {
							return d.text;
						})
						.attr('class', 'month_text')
						.attr('x', (axisLabelSizes[i].width + 12) / 2)
						.attr('y', axisLabelSizes[i].height)
						.attr('text-anchor', 'middle')
						.attr('fill', style.timeAxis.rows[i].label.color)
						.attr('style', 'font: ' + style.timeAxis.rows[i].label.font);
				});
			}
		});

		var riserClipURL;
		if (labelClipURL || axisClipURL) {
			riserClipURL = renderConfig.container.id + '_riser_clip';
			createClipRect(defs, {width: axisGroupSize.width, height: labelGroupSize.height}, riserClipURL);
		}

		var riserStyle = {
			color: chart.getSeriesAndGroupProperty(0, null, 'color'),
			invertedColor: style.risers.data.invertedStartStop.color,
			border: {
				color: chart.getSeriesAndGroupProperty(0, null, 'border.color'),
				width: chart.getSeriesAndGroupProperty(0, null, 'border.width')
			}
		};

		var tooltip = chart.getSeriesAndGroupProperty(0, 0, 'tooltip');
		var altRowFill = style.risers.altRowFill;
		altRowFill = tdg.color.isVisible(altRowFill) ? altRowFill : null;

		riserScrollGroup = drawRegion({
			container: container,
			x: labelGroupSize.width,
			y: axisGroupSize.height,
			width: axisGroupSize.width,
			height: labelGroupSize.height,
			style: style.risers,
			className: 'risers',
			clipURL: riserClipURL,
			contentCallback: function(props) {

				// Draw the risers
				data.forEach(function(d, i) {

					var node, path;
					var g = props.scrollGroup.append('g')
						.attr('transform', fmt('translate(0, {0})', cellSize.height * i));

					if (altRowFill && (i % 2 === 1)) {
						g.append('rect')
							.attr('x', 0)
							.attr('y', 0)
							.attr('width', axisGroupSize.overallWidth)
							.attr('height', cellSize.height)
							.attr('fill', altRowFill);
					}

					if (d.start || d.stop) {
						var borderOffset = tdg.color.isLineVisible(riserStyle.border) ? riserStyle.border.width : 0;
						var riserHeight = (1 - (style.risers.inset || 0)) * cellSize.height;

						if (d.start && d.stop) {
							var inverted = (d.stop < d.start);
							var start = inverted ? d.stop : d.start, stop = inverted ? d.start : d.stop;
							g.append('rect')
								.attr('class', chart.buildClassName('riser', 0, d.group, 'bar'))
								.attr('x', axis.scale(start))
								.attr('y', (cellSize.height - riserHeight) / 2)
								.attr('width', Math.max(2, axis.scale(stop) - axis.scale(start)))
								.attr('height', riserHeight - 1 + borderOffset)
								.attr('fill', inverted ? riserStyle.invertedColor : riserStyle.color)
								.attr('stroke', riserStyle.border.color)
								.attr('stroke-width', riserStyle.border.width)
								.attr('tdgtitle', 'placeholder')
								.each(function() {
									this.tdgtitle = tooltip;
								});
						} else {
							var haveStart = (d.start != null && d.stop == null);
							var errorStyle = style.risers.data[haveStart ? 'onlyStart' : 'onlyStop'];
							var marker = {
								shape: errorStyle.marker.shape,
								size: errorStyle.marker.size,
								color: errorStyle.color,
								border: {
									color: errorStyle.border.color,
									width: errorStyle.border.width
								},
								antiAlias: true
							};
							if (marker.shape === 'circle') {
								node = g.append('circle')
									.attr('cx', 0)
									.attr('cy', 0)
									.attr('r', marker.size || 12);
							} else {
								if (marker.shape === 'dollar') {  // Temporary workaround until all builds include 'dollar' marker support
									var h = marker.size / 2, r = h * 0.375, r2 = r * 2;
									path = 'M 0 -' + h + 'V' + h + 'M -' + r + ' ' + r +
										'C -' + r + ' ' + r2 + ', ' + r + ' ' + r2 + ', ' + r + ', ' + r + ' ' +
										'S ' + (r * 0.2666) + ' ' + (r * 0.1333) + ', 0 0S -' + r + ' -' + (r / 3) + ', -' + r + ' -' + r +
										'C -' + r + ' -' + r2 + ', ' + r + ' -' + r2 + ', ' + r + ', -' + r;
									marker.border.color = marker.color;
									marker.border.width = marker.border.width || 1;
									marker.color = null;
								} else if (marker.shape == null) {
									var height = marker.size || 15;
									path = fmt('M0 -{0}v{1}', height / 2, height);
									marker.border.color = marker.color;
									marker.border.width = marker.border.width || 2;
									marker.color = null;
									marker.antiAlias = false;
								} else {
									path = pv.SvgScene.getPath({shape: marker.shape, radius: marker.size || 10});
									if (pv.SvgScene.pathRequiresStroke) {
										marker.border.color = marker.color;
										marker.border.width = marker.border.width || 1;
										marker.color = null;
									}
								}
								node = g.append('path').attr('d', path);
							}
							if (node) {
								var dx = axis.scale(haveStart ? d.start : d.stop), dy = cellSize.height / 2;
								node.attr('transform', fmt('translate({0}, {1})', dx, dy))
									.attr('class', chart.buildClassName('riser', 0, d.group, 'riser'))
									.attr('fill', marker.color)
									.attr('shape-rendering', marker.antiAlias ? 'auto' : 'crispEdges')
									.attr('stroke', marker.border.color)
									.attr('stroke-width', marker.border.width)
									.attr('stroke-linecap', 'butt')
									.attr('tdgtitle', 'placeholder')
									.each(function() {
										this.tdgtitle = tooltip;
									});
							}
						}
					}

					d.milestone.forEach(function(m, idx) {
						if (!m) {
							return;
						}
						var s = idx + 1;
						var marker = {
							shape: chart.getSeriesAndGroupProperty(s, i, 'marker.shape'),
							size: chart.getSeriesAndGroupProperty(s, i, 'marker.size'),
							color: chart.getSeriesAndGroupProperty(s, i, 'color'),
							border: {
								color: chart.getSeriesAndGroupProperty(s, i, 'marker.border.color'),
								width: chart.getSeriesAndGroupProperty(s, i, 'marker.border.width')
							}
						};
						if (marker.shape === 'circle') {
							node = g.append('circle')
								.attr('cx', 0)
								.attr('cy', 0)
								.attr('r', marker.size);
						} else {
							if (marker.shape === 'dollar') {  // Temporary workaround until all builds include 'dollar' marker support
								var h = marker.size / 2, r = h * 0.375, r2 = r * 2;
								path = 'M 0 -' + h + 'V' + h + 'M -' + r + ' ' + r +
									'C -' + r + ' ' + r2 + ', ' + r + ' ' + r2 + ', ' + r + ', ' + r + ' ' +
									'S ' + (r * 0.2666) + ' ' + (r * 0.1333) + ', 0 0S -' + r + ' -' + (r / 3) + ', -' + r + ' -' + r +
									'C -' + r + ' -' + r2 + ', ' + r + ' -' + r2 + ', ' + r + ', -' + r;
								marker.border.color = marker.color;
								marker.border.width = marker.border.width || 1;
								marker.color = null;
							} else {
								path = pv.SvgScene.getPath({shape: marker.shape || 'diamond', radius: marker.size || 10});
								if (pv.SvgScene.pathRequiresStroke) {
									marker.border.color = marker.color;
									marker.border.width = marker.borderWidth || 1;
									marker.color = null;
								}
							}
							node = g.append('path').attr('d', path);
						}
						if (node) {
							var dx = axis.scale(m), dy = cellSize.height / 2;
							node.attr('transform', fmt('translate({0}, {1})', dx, dy))
								.attr('class', chart.buildClassName('marker', 0, d.group, 'marker'))
								.attr('fill', marker.color)
								.attr('shape-rendering', 'auto')
								.attr('stroke', marker.border.color)
								.attr('stroke-width', marker.border.width)
								.attr('stroke-linecap', 'butt')
								.attr('tdgtitle', 'placeholder')
								.each(function() {
									this.tdgtitle = tooltip;
								});
						}
					});
				});

				if (tdg.color.isLineVisible(style.risers.dividers)) {
					var grid = '';
					for (i = 1; i < data.length; i++) {
						grid += fmt('M0 {0}h{1}', cellSize.height * i, axisGroupSize.overallWidth);
					}
					for (i = 1; i < axis.count; i++) {
						grid += fmt('M{0} 0v{1}', cellSize.width * i, labelGroupSize.overallHeight);
					}
					props.scrollGroup.append('path')
						.attr('d', grid)
						.attr('stroke', style.risers.dividers.color)
						.attr('stroke-width', style.risers.dividers.width)
						.attr('stroke-linecap', 'butt');
				}
			}
		});
	}

	function addScroll(parent, orientation, x, y, visibleLength, overallLength, attachedPanels) {

		var isHorizontal = (orientation === 'h');
		var scrollBarHeight = 15, ratio = visibleLength / overallLength;
		var handleLength = Math.max(visibleLength * ratio, scrollBarHeight);

		attachedPanels = attachedPanels.filter(function(el) {return !!el;}).map(function(el) {
			return el.node();
		});

		function moveBox(target, prop, dt, min, max) {
			var matrix = target.transform.baseVal[0].matrix;
			matrix[prop] += dt;
			matrix[prop] = Math.round(tdg.bound(matrix[prop], min, max));
		}

		function drag() {
			var prop = isHorizontal ? 'e' : 'f';
			var dt = isHorizontal ? d3.event.dx : d3.event.dy;
			moveBox(this, prop, dt, 0, visibleLength - handleLength);
			attachedPanels.forEach(function(el) {
				moveBox(el, prop, -(dt * 1 / ratio), visibleLength - overallLength, 0);
			});
		}

		var g = parent.append('g')
			.attr('class', 'scroll-' + orientation)
			.attr('transform', fmt('translate({0}, {1})', x, y));

		g.append('rect')
			.attr('class', 'scroll-background')
			.attr('x', 0)
			.attr('y', 0)
			.attr('width', isHorizontal ? visibleLength : scrollBarHeight)
			.attr('height', isHorizontal ? scrollBarHeight : visibleLength)
			.attr('fill', 'rgb(240,240,240)');

		g.append('rect')
			.attr('class', 'scroll-handle')
			.attr('x', 0)
			.attr('y', 0)
			.attr('transform', 'translate(0, 0)')
			.attr('width', isHorizontal ? handleLength : scrollBarHeight)
			.attr('height', isHorizontal ? scrollBarHeight : handleLength)
			.attr('fill', 'rgb(180,180,180)')
			.attr('cursor', 'pointer')
			.call(d3.drag().on('drag', drag));
	}

	if (labelClipURL) {
		addScroll(
			container, 'v',
			labelGroupSize.width + axisGroupSize.width,
			axisGroupSize.height,
			labelGroupSize.height,
			labelGroupSize.overallHeight,
			[labelScrollGroup, riserScrollGroup]
		);
	}

	if (axisClipURL) {
		addScroll(
			container, 'h',
			labelGroupSize.width,
			axisGroupSize.height + labelGroupSize.height,
			axisGroupSize.width,
			axisGroupSize.overallWidth,
			[axisScrollGroup, riserScrollGroup]
		);
	}

	renderConfig.renderComplete();
}

function noDataRenderCallback(renderConfig) {
	var grey = renderConfig.baseColor;
	renderConfig.data = [
		{
			label: 'Long Task 1',
			start: '2016/04/15 00:00:00',
			stop: '2016/06/23 00:00:00'
		},
		{
			label: 'Long Task 2',
			start: '2016/05/10 00:00:00',
			stop: '2016/07/20 00:00:00'
		},
		{
			label: 'Long Task 3',
			start: '2016/06/21 00:00:00',
			stop: '2016/09/19 00:00:00'
		}
	];
	var s = renderConfig.moonbeamInstance.getSeries(0);
	s.color = grey;
	s.border = {width: 1, color: 'black'};
	renderConfig.properties.style.labels.font = '12pt helvetica';
	renderConfig.properties.style.labels.color = 'white';
	renderConfig.properties.style.timeAxis.rows[0].font = '12pt helvetica';
	renderConfig.properties.style.timeAxis.rows[0].color = 'white';
	renderCallback(renderConfig);
}

// Your extension's configuration
var config = {
	id: 'com.ibi.gantt',
	containerType: 'svg',
	noDataRenderCallback: noDataRenderCallback,
	renderCallback: renderCallback,
	resources: {script: ['lib/d3.js']},
	modules: {
		dataLabels: {
			supported: true,
			defaultDataArrayEntry: function() {
				return 'labels';
			}
		},
		eventHandler: {
			supported: true
		},
		tooltip: {
			supported: true
		}
	}
};

// Required: this call will register your extension with the chart engine
tdgchart.extensionManager.register(config);

})();
