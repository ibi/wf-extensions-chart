/*global tdgchart: false, d3: false, pv: false, document: false */
/* Copyright (C) 1996-2023. Cloud Software Group, Inc. All rights reserved. */

(function() {

var tdg = tdgchart.util;

tdg.color.isLineVisible = tdg.color.isLineVisible || function(props) {
	return props && props.width > 0 && tdg.color.isVisible(props.color);
};

// internacionalizar
var monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

var todayDate = (function(){
	var today = new Date();
	var dd = today.getDate();
	var mm = today.getMonth()+1; //As January is 0.
	var yyyy = today.getFullYear();
	return yyyy+"/"+mm+"/"+dd;
}());

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

	// First, sort each datum's list of risers
	data.forEach(function(d) {
		if (d && d.risers && d.risers.length > 1) {
			sortData(d.risers, sort);
		}
	});

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
			if (a && a.risers && a.risers[0]) {
				a = a.risers[0];
			}
			if (b && b.risers && b.risers[0]) {
				b = b.risers[0];
			}
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
			if (a && Array.isArray(a.risers)) {
				a = a.risers[a.risers.length - 1];
			}
			if (b && Array.isArray(b.risers)) {
				b = b.risers[b.risers.length - 1];
			}
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

function convertData(data) {

	/*
	data in, all times are unsanitized: [
		{label: 'taskName', start, stop, milestone: [time, time, ...]}
	]

	data out, all times are sanitized: [{
		label: 'taskName',
		risers: [{start, stop, groupID}, {start, stop, groupID}, ...],
		milestone: [{time, groupID}, {time, groupID}]}
	}]
	*/

	// Convert all string dates in the data set to JS Date objects
	// Convert flat {start, stop} into riser: [{start, stop}] array
	// Ensure milestone is an array
	data = data.map(function(d, idx) {
		var d2 = tdg.clone(d);
		d2.risers = [{start: sanitizeTime(d.start), stop: sanitizeTime(d.stop), groupID: idx, shape: d.shape, color: d.color}];
		d2.milestone = Array.isArray(d.milestone) ? d.milestone : (d.milestone ? [d.milestone] : []);
		d2.milestone = d2.milestone.map(function(time) {
			return {time: sanitizeTime(time), groupID: idx};
		});
		return d2;
	});

	// Merge datums that have the same label into one datum
	var labelSet = {}, newData = [];
	while (data.length) {
		var d = data.shift();
		if (labelSet.hasOwnProperty(d.label)) {
			labelSet[d.label].risers.push(d.risers[0]);
			labelSet[d.label].milestone = labelSet[d.label].milestone.concat(d.milestone);
		} else {
			labelSet[d.label] = d;
			newData.push(d);
		}
	}

	return newData;
}

function getAxis(data, properties) {

	// Find first and last time entries across all start & stop values
	var i, j, d, start, stop;
	for (i = 0; i < data.length; i++) {
		d = data[i];
		if (!d) {
			continue;
		}
		for (j = 0; j < d.risers.length; j++) {
			var dStart = d.risers[j].start, dStop = d.risers[j].stop;
			start = time_min(start, time_min(dStart, dStop));
			stop = time_max(stop, time_max(dStart, dStop));
		}
		for (j = 0; j < d.milestone.length; j++) {
			var time = d.milestone[j].start;
			start = time_min(start, time);
			stop = time_max(stop, time);
		}
	}
	// Return Standard Scale Timestamps
	var useBasicAxis = start == null && stop == null;
	if (useBasicAxis) {
		return {
			rows: [],
			count: 0,
			scale: d3.scaleTime()
		};
	}
	
	switch(properties.fixedAxisPeriod) {
		case "year":
			return getYearAxis(start, stop);
		case "month":
			return getMonthAxis(start, stop);
		case "week":
			return getWeekAxis(start, stop, null, null, properties.weekStartsOnMonday);
		case "day":
			return getDayAxis(start, stop);
		case "hour":
			return getHourAxis(start, stop);
		default:
	}
	
	// YEARS PERIOD #######################
	var yearScale = getYearScale(start, stop), 
		yearsTicks = getYearTicks(yearScale), 
		useYearPeriods = yearsTicks.length > (properties.autoAxisPeriodLimits.year || 5);
	
	if(useYearPeriods) {
		return getYearAxis(start, stop, yearScale, yearsTicks);
	}
	
	// MONTHS PERIOD #######################
	var monthScale = getMonthScale(start, stop),
		monthsTicks = getMonthTicks(monthScale),
		useMonthAxis = monthsTicks.length > (properties.autoAxisPeriodLimits.month || 4);
	
	if (useMonthAxis) {		
		return getMonthAxis(start, stop, monthScale, monthsTicks);
	}
	
	// WEEK PERIOD #######################
	var weekScale = getWeekScale(start, stop),
		weeksTicks = getWeekTicks(weekScale, properties.weekStartsOnMonday),
		useWeekAxis = weeksTicks.length > (properties.autoAxisPeriodLimits.week || 3);
	
	if (useWeekAxis) {		
		return getWeekAxis(start, stop, weekScale, weeksTicks, properties.weekStartsOnMonday);

	}
	
	// DAY PERIOD #######################	
	var dayScale = getDayScale(start, stop),
		daysTicks = getDayTicks(dayScale),
		useDayAxis = daysTicks.length > (properties.autoAxisPeriodLimits.day || 1);
	
	if (useDayAxis) {
		return getDayAxis(start, stop, dayScale, daysTicks);
	}
	
	// HOUR PERIOD #######################	
	var hourScale = getHourScale(start, stop),
		hoursTicks = getHourTicks(hourScale),
		useHourAxis = hoursTicks.length > (properties.autoAxisPeriodLimits.hour || 2);
	
	if (useHourAxis) {
		return getHourAxis(start, stop, hourScale, hoursTicks);
	}

	return null;
	
	// AXIS FUNCTIONS ####################	
	function getYearAxis(start, stop, scaleFn, ticks) {
		var yearScale = scaleFn || getYearScale(start, stop),
			yearsTicks = ticks || getYearTicks(yearScale),
			yearDivisions = yearsTicks.map(function(el, i) {
				return {start: i, width: 1, text: el.getFullYear() + ''};
			});
			
		return {
			scale: yearScale,
			rows: [yearDivisions],
			count: yearsTicks.length,
			start: new Date(start.getFullYear(), 1, 1),
			stop: new Date(stop.getFullYear(), 12, 1, 23, 59, 59)
		};
	}
		
	function getYearScale(start, stop) {
		return d3.scaleTime().domain([start, stop]).nice();
	}
	
	function getYearTicks(yearScale) {
		var yearTicks = yearScale.ticks(d3.timeYear.every(1));
		yearTicks.pop();
		return yearTicks;
	}
	
	function getMonthAxis(start, stop, scaleFn, ticks) {
		var monthScale = scaleFn || getMonthScale(start, stop),
			monthsTicks = ticks || getMonthTicks(monthScale),
			monthDivisons = monthsTicks.map(function(el, i) {
//				if (el <= stop)
				return {start: i, width: 1, text: monthNames[el.getMonth()]};
			}),
			yearDivisions = [],
			startTime = null;
		
		if (monthsTicks[monthsTicks.length - 1].getFullYear() > monthsTicks[0].getFullYear()) {
			monthsTicks.forEach(function(m, i) {
				if (startTime == null || m.getFullYear() > startTime) {
					yearDivisions.push({start: i, width: 1, text: m.getFullYear() + ''});
					startTime = m.getFullYear();
				} else {
					yearDivisions[yearDivisions.length - 1].width += 1;
				}
			});
			return {
				scale: monthScale,
				rows: [yearDivisions, monthDivisons],
				count: monthsTicks.length,
				start: new Date(start.getFullYear(), 1, 1),
				stop: new Date(stop.getFullYear(), 12, 1, 23, 59, 59)
			};
		}
		return {
			scale: monthScale,
			rows: [monthDivisons],
			count: monthsTicks.length,
			start: new Date(start.getFullYear(), 1, 1),
			stop: new Date(stop.getFullYear(), 12, 1, 23, 59, 59)
		};
	}
		
	function getMonthScale(start, stop) {
		var returnScale;
		if (properties.adjustToDataLimits === true){
			returnScale = d3.scaleTime().domain([start, stop]).nice(d3.timeMonth);
		}else{
			returnScale = d3.scaleTime().domain([start, stop]).nice();
		}
		return returnScale;
	}
	
	function getMonthTicks(monthScale) {
		var monthTicks = monthScale.ticks(d3.timeMonth.every(1));
		monthTicks.pop();
		return monthTicks;
	}
	
	function getWeekAxis(start, stop, scaleFn, ticks, weekStartsOnMonday) {	
		var weekScale = scaleFn || getWeekScale(start, stop),
			weekTicks = ticks || getWeekTicks(weekScale, weekStartsOnMonday),
			weekDivisons = weekTicks.map(function(el, i) {
				return {start: i, width: 1, text: el.getDate()};
			}),
			startYear = null,
			startMonthIndex = null,
			monthDivisons = [],
			firstTick = weekTicks[0],
			lastTick = weekTicks[weekTicks.length - 1];
		
		if (lastTick.getMonth() != firstTick.getMonth() 
				|| lastTick.getFullYear() != firstTick.getFullYear()) {
			weekTicks.forEach(function(m, i) {
				if (startMonthIndex == null || m.getMonth() > startMonthIndex || m.getFullYear() > startYear) {
					monthDivisons.push({start: i, width: 1, text: monthNames[m.getMonth()] + '-' + m.getFullYear()});
					startMonthIndex = m.getMonth();
					startYear = m.getFullYear();
				} else {
					monthDivisons[monthDivisons.length - 1].width += 1;
				}
			});
			return {
				scale: weekScale,
				rows: [monthDivisons, weekDivisons],
				count: weekTicks.length,
				start: new Date(start.getFullYear(), 1, 1),
				stop: new Date(stop.getFullYear(), 12, 1, 23, 59, 59)
			};
		}
		
		return {
			scale: weekScale,
			rows: [weekDivisons],
			count: weekTicks.length,
			start: new Date(start.getFullYear(), 1, 1),
			stop: new Date(stop.getFullYear(), 12, 1, 23, 59, 59)
		};
	}	
		
	function getWeekScale(start, stop) {
		var returnScale;
		if (properties.adjustToDataLimits === true){
			returnScale = d3.scaleTime().domain([start, stop]).nice(d3.timeWeek);
		}else{
			returnScale = d3.scaleTime().domain([start, stop]).nice();
		}
		return returnScale;
	}
	
	function getWeekTicks(weekScale, weekStartsOnMonday) {
		//use d3.timeWeek.every(1) to start weeks on sunday;
		var weekTicks = weekScale.ticks(weekStartsOnMonday ? d3.timeMonday.every(1) : d3.timeWeek.every(1));
		weekTicks.pop();
		return weekTicks;
	}	
	
	function getDayAxis(start, stop, scaleFn, ticks) {
		var dayScale = scaleFn || getDayScale(start, stop),
			daysTicks = ticks || getDayTicks(dayScale),
			dayDivisions = daysTicks.map(function(el, i) {
				return {start: i, width: 1, text: el.getDate() + ''};
			}),
			startTime,
			monthDivisons = [];
		
		if (daysTicks[daysTicks.length - 1].getMonth() > daysTicks[0].getMonth()) {
			daysTicks.forEach(function(m, i) {
				if (startTime == null || m.getMonth() > startTime) {
					monthDivisons.push({start: i, width: 1, text: monthNames[m.getMonth()]});
					startTime = m.getMonth();
				} else {
					monthDivisons[monthDivisons.length - 1].width += 1;
				}
			});
			return {
				scale: dayScale,
				rows: [monthDivisons, dayDivisions],
				count: daysTicks.length,
				start: new Date(start.getFullYear(), 1, 1),
				stop: new Date(stop.getFullYear(), 12, 1, 23, 59, 59)
			};
		}
		return {
			scale: dayScale,
			rows: [dayDivisions],
			count: daysTicks.length,
			start: new Date(start.getFullYear(), 1, 1),
			stop: new Date(stop.getFullYear(), 12, 1, 23, 59, 59)
		};
	}
		
	function getDayScale(start, stop) {
		var returnScale;
		if (properties.adjustToDataLimits === true){
			returnScale = d3.scaleTime().domain([start, stop]).nice(d3.timeDay);
		}else{
			returnScale = d3.scaleTime().domain([start, stop]).nice();
		}
		return returnScale;
	}
	
	function getDayTicks(dayScale) {
		var dayTicks = dayScale.ticks(d3.timeDay.every(1));
		dayTicks.pop();
		return dayTicks;
	}
	
	function getHourAxis(start, stop, scaleFn, ticks) {
		var hourScale = scaleFn || getHourScale(start, stop),
			hoursTicks = ticks || getHourTicks(hourScale),
			hourDivisions = [],
			hoursTicks = hourScale.ticks(d3.timeHour.every(1));
		
		if (start.getHours() < 3) {
//			start = start.clone().setHours(0);  // If start hour is near 0h, round down to 0
			start = new Date(start.getFullYear(), start.getMonth()+1, start.getDate(),0,0,0);
		} else {
//			start = start.clone().setHours(start.getHours() - 1);  // Round start hour down one
			start = new Date(start.getFullYear(), start.getMonth()+1, start.getDate(),start.getHours() - 1,0,0);
		}
		var stopHour = stop.getHours();
		if (stopHour > 10 && stopHour < 13) {
//			stop = stop.clone().setHours(12);  // If stop hour is near but below 12, round up to 12
			stop = new Date(stop.getFullYear(), stop.getMonth()+1, stop.getDate(),12,0,0);
		} else if (stopHour > 19) {
//			stop = stop.clone().setHours(24);  // If stop hour is near 24, round up to 24
			stop = new Date(stop.getFullYear(), stop.getMonth()+1, stop.getDate(),24,0,0);
		} else {
//			stop = stop.clone().setHours(stopHour + 1);  // Round stop hour up one
			stop = new Date(stop.getFullYear(), stop.getMonth()+1, stop.getDate(),stopHour + 1,0,0);
		}
		hourScale = d3.scaleTime().domain([start, stop]).nice(d3.timeHour);
		hours = hourScale.ticks(d3.timeHour.every(1));
		hours.pop();
		hourDivisions = hours.map(function(el, i) {
			return {start: i, width: 1, text: d3.timeFormat('%H:%M')(el)};
		});
		return {
			scale: hourScale,
			rows: [hourDivisions],
			count: hours.length,
			start: new Date(start.getFullYear(), 1, 1,0,0,0),
			stop: new Date(stop.getFullYear(), 12, 1, 23, 59, 59)
		};
	}
	
	function getHourScale(start, stop) {
		var returnScale;
		if (properties.adjustToDataLimits === true){
			returnScale = d3.scaleTime().domain([start, stop]).nice(d3.timeHour);
		}else{
			returnScale = d3.scaleTime().domain([start, stop]).nice();
		}
		return returnScale;
	}
	
	function getHourTicks(hourScale) {
		var hourTicks = hourScale.ticks(d3.timeHour.every(1));
		hourTicks.pop();
		return hourTicks;
	}
	
}

// props: container, x, y, width, height, style, className, clipURL, contentCallback
function drawRegion(props) {
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
	var fmt = tdg.formatString;
	var labelScrollGroup, riserScrollGroup, axisScrollGroup, i;
	//var container = d3.select('#' + renderConfig.container.id)
	var container = d3.select(renderConfig.container)   //Fix for IA-8622
		.append('g')
		.attr('transform', 'translate(5, 5)')
		.attr('class', 'com_ibi_gantt')
		.attr('stroke-linecap', 'square')
		.attr('shape-rendering', 'crispEdges');

	var defs = getDefsNode(renderConfig.container.id);

	data = convertData(data);

	data = sortData(data, properties.sort);

	//Define periods axis
	var axis = getAxis(data, properties);

	if (axis == null) {
		throw 'Gantt: Error calculating Time Span';
	}

	//Dimension labels
	var labels = data.map(function(el) {
		return el.label;
	});
	
	var otherHeights=155;
	if (properties.fixedAxisPeriod){
		if ((properties.fixedAxisPeriod == null) || (properties.fixedAxisPeriod == 'year')){
			otherHeights = 135;
		}
	}
	var aux_labelSizeMax = Math.round((document.getElementsByTagName("BODY")[0].offsetHeight - otherHeights) / (labels.length));
	var aux_labelSizeMin = chart.measureLabel('W', style.labels.font).height;
	var aux_labelSize;
	if (properties['adaptableSize'] === true){
		aux_labelSize = (aux_labelSizeMax < aux_labelSizeMin) ? aux_labelSizeMin : aux_labelSizeMax;
	}else{
		aux_labelSize = aux_labelSizeMin;
	}

	var labelSize = {
		width: tdg.max(labels, function(el) {
			return chart.measureLabel(el, style.labels.font).width; //Set the dimension column's width
		}),
//		height: chart.measureLabel('W', style.labels.font).height //Set row's height
		height: aux_labelSize,
	};

	//Truncate labelSize if width is greater than the percentage of the total width available
	if (labelSize.width > renderConfig.width * properties.layout.max_label_width) {
		labelSize.width = renderConfig.width * properties.layout.max_label_width;
		labels = labels.map(function(el) {
			return chart.truncateLabel(el, style.labels.font, labelSize.width);
		});
	}

	var maxLabel = 'May';
	//Set label size (width, height) related with properties.json
	var axisLabelSizes = axis.rows.map(function(row, i) {
		return chart.measureLabel(maxLabel, style.timeAxis.rows[i].label.font);
	});
	var aux_labelGroupSizeWidth = labelSize.width + 15;
	
	var aux_cellSizeMax = Math.round((document.getElementsByTagName("BODY")[0].offsetWidth - aux_labelGroupSizeWidth -32) / axis.count);
	var aux_cellSizeMin = Math.round((tdg.max(axisLabelSizes, 'width') || 0) + 12);
	var aux_cellSize;
	if (properties['adaptableSize'] === true){
		aux_cellSize = (aux_cellSizeMax < aux_cellSizeMin) ? aux_cellSizeMin : aux_cellSizeMax
	}else{
		aux_cellSize = aux_cellSizeMin;
	}
	var cellSize = {
		//width: Math.round((tdg.max(axisLabelSizes, 'width') || 0) + 12),
		width: aux_cellSize,
		height: Math.round(labelSize.height + 10)
	};

	var axisRowHeights = axisLabelSizes.map(function(row, i) {
		return axisLabelSizes[i].height + 5;
	});
	
	//Set chart size
	var axisGroupSize = {
		width: cellSize.width * axis.count,
		overallWidth: cellSize.width * axis.count,
		height: tdg.sum(axisRowHeights)
	};

	//Set range for d3 scale function
	axis.scale.range([0, axisGroupSize.width]);

	//Set label column's width, Set labels column's height
	var labelGroupSize = {
		width: aux_labelGroupSizeWidth,
		height: cellSize.height * labels.length,
		overallHeight: cellSize.height * labels.length
	};

	//Set label column's height if is greater than container's height
	var labelClipURL;
	if (axisGroupSize.height + labelGroupSize.height > renderConfig.height - 25) {  // 25 for pad + scrollbar
		labelGroupSize.height = renderConfig.height - axisGroupSize.height - 25;
		labelClipURL = renderConfig.container.id + '_label_clip';
		createClipRect(defs, labelGroupSize, labelClipURL);
	}

	//Set label column's height if is greater than container's width
	var axisClipURL;
	if (axisGroupSize.width + labelGroupSize.width + 25 > renderConfig.width) {
		axisGroupSize.width = renderConfig.width - labelGroupSize.width - 25;
		axisClipURL = renderConfig.container.id + '_axis_clip';
		createClipRect(defs, axisGroupSize, axisClipURL);
	}

	//Draw label column
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
//				.attr('y', labelSize.height + 1)
				.attr('y', (properties['adaptableSize'] === true) ? (cellSize.height/2) + 3 : labelSize.height + 1)
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

		//Draw header (periods) row
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
// is trying to center the across but it is based on the width of the title, it is not known how many the across have
//						.attr('x', (axisLabelSizes[i].width + 12) / 2)
						.attr('x', 5)
						.attr('y', axisLabelSizes[i].height)
//						.attr('text-anchor', 'middle')
						.attr('text-anchor', 'left')
						.attr('fill', style.timeAxis.rows[i].label.color)
						.attr('style', 'font: ' + style.timeAxis.rows[i].label.font);
				});
			}
		});

		//Draw header row
		var riserClipURL;
		if (labelClipURL || axisClipURL) {
			riserClipURL = renderConfig.container.id + '_riser_clip';
			createClipRect(defs, {width: axisGroupSize.width, height: labelGroupSize.height}, riserClipURL);
		}

		var baseRiserStyle = {
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
				//Draw grid
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
				
				//Draw today line
				if (properties.todayLine){
					if (properties.todayLine.enabled){
						var lineMarkDate = (properties.todayLine.otherDay) ? sanitizeTime(properties.todayLine.otherDay) : sanitizeTime(todayDate);
						var lineMark = axis.scale(lineMarkDate);
						
						if ((lineMarkDate >= axis.start) && (lineMarkDate <= axis.stop)){
							props.scrollGroup.append('rect')
									.attr('x', lineMark)
									.attr('y', 1)
									.attr('width', 1)
									.attr('height', cellSize.height * labels.length)
									.attr('fill', properties.todayLine.color)
									.attr('stroke', properties.todayLine.color)
									.attr('stroke-width', '3');
						}
					}
				}			
				// Draw the risers
				data.forEach(function(d, idx) {

					var node, path;
					var g = props.scrollGroup.append('g')
						.attr('transform', fmt('translate(0, {0})', cellSize.height * idx));

					if (altRowFill && (idx % 2 === 1)) {
						g.append('rect')
							.attr('x', 0)
							.attr('y', 0)
							.attr('width', axisGroupSize.overallWidth)
							.attr('height', cellSize.height)
							.attr('fill', altRowFill);
					}
					
					//Draw timestamps
					d.risers.forEach(function(riser) {
						if (!riser.start && !riser.stop) {
							return;
						}
						var riserStyle = baseRiserStyle;
						if (riser.color != null) {
							if (typeof riser.color === 'number') {
								riserStyle = {
									color: chart.getSeriesAndGroupProperty(riser.color, null, 'color'),
									invertedColor: style.risers.data.invertedStartStop.color,
									border: {
										color: chart.getSeriesAndGroupProperty(riser.color, null, 'border.color'),
										width: chart.getSeriesAndGroupProperty(riser.color, null, 'border.width')
									}
								};
							} else if (typeof riser.color === 'string') {
								riserStyle = tdg.clone(baseRiserStyle);
								riserStyle.color = riser.color;
							}
						}
						var borderOffset = tdg.color.isLineVisible(riserStyle.border) ? riserStyle.border.width : 0;
						var riserHeight = (1 - (style.risers.inset || 0)) * cellSize.height;

						if (riser.start && riser.stop) {
							var riserElement;
							var inverted = (riser.stop < riser.start);
							var start = inverted ? riser.stop : riser.start, stop = inverted ? riser.start : riser.stop;

							var shape = 'bar';
							if (riser.shape != null) {
								if (typeof riser.shape === 'number') {
									shape = chart.getSeriesAndGroupProperty(riser.shape, null, 'riserShape');
								} else if (typeof riser.shape === 'string' && riser.shape.toLowerCase() === 'line') {
									shape = 'line';
								}
							}

							var riserColor = inverted ? riserStyle.invertedColor : riserStyle.color;
							if (properties.coloredByTuples){
								if (properties.coloredByTuples.enabled === true){
									Object.getOwnPropertyNames(properties.coloredByTuples.tuples).forEach(function (key) {
										if (riser.color == key){
											riserColor = properties.coloredByTuples.tuples[key];
										}
									});
								}
							}
							
							if (shape === 'line') {
								riserElement = g.append('line')
									.attr('x1', axis.scale(start))
									.attr('y1', cellSize.height / 2)
									.attr('x2', axis.scale(stop))
									.attr('y2', cellSize.height / 2)
									.attr('stroke', riserColor)
									.attr('stroke-width', riserStyle.border.width || 1);
							} else {
								riserElement = g.append('rect')
									.attr('x', axis.scale(start))
									.attr('y', (cellSize.height - riserHeight) / 2)
									.attr('width', Math.max(2, axis.scale(stop) - axis.scale(start)))
									.attr('height', riserHeight - 1 + borderOffset)
									.attr('fill', riserColor)
									.attr('stroke', riserStyle.border.color)
									.attr('stroke-width', riserStyle.border.width);
							}
							riserElement.attr('class', chart.buildClassName('riser', 0, riser.groupID, 'bar'))
								.attr('tdgtitle', 'placeholder')
								.each(function() {
									this.tdgtitle = tooltip;
								});
						} else {
							var haveStart = (riser.start != null && riser.stop == null);
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
								var dx = axis.scale(haveStart ? riser.start : riser.stop), dy = cellSize.height / 2;
								node.attr('transform', fmt('translate({0}, {1})', dx, dy))
									.attr('class', chart.buildClassName('riser', 0, riser.groupID, 'riser'))
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
					});

					d.milestone.forEach(function(m, idx) {
						if (!m || !m.time) {
							return;
						}
						var seriesID = idx + 1;
						var marker = {
							shape: chart.getSeriesAndGroupProperty(seriesID, m.groupID, 'marker.shape'),
							size: chart.getSeriesAndGroupProperty(seriesID, m.groupID, 'marker.size'),
							color: chart.getSeriesAndGroupProperty(seriesID, m.groupID, 'color'),
							border: {
								color: chart.getSeriesAndGroupProperty(seriesID, m.groupID, 'marker.border.color'),
								width: chart.getSeriesAndGroupProperty(seriesID, m.groupID, 'marker.border.width')
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
								path = pv.SvgScene.getPath({
									shape: marker.shape || 'diamond',
									radius: marker.size || 10,
									size: marker.size || 10
								});
								if (pv.SvgScene.pathRequiresStroke(marker.shape)) {
									marker.border.color = marker.color;
									marker.border.width = marker.border.width || 1;
									marker.color = null;
								}
							}
							node = g.append('path').attr('d', path);
						}
						if (node) {
							var dx = axis.scale(m.time), dy = cellSize.height / 2;
							node.attr('transform', fmt('translate({0}, {1})', dx, dy))
								.attr('class', chart.buildClassName('marker', 0, m.groupID, 'marker'))
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
			//var matrix = target.transform.baseVal[0].matrix;
			//Start CHART-2895 
			try {   //For non-IE or non-Edge browser
				var matrix = target.transform.baseVal[0].matrix;	
			}
			catch(error) { //For IE or Edge browser
				var matrix = target.transform.baseVal.getItem(0).matrix; 
			}
			
			//End CHART-2895
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
	resources: {script: window.d3 ? ['lib/d3-selection-multi.min.js','lib/d3-time.min.js','lib/d3-time-format.min.js','lib/d3-transition.min.js'] : 
	['lib/d3.v5.16.min.js','lib/d3-selection-multi.min.js','lib/d3-time.min.js','lib/d3-time-format.min.js','lib/d3-transition.min.js']},
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
