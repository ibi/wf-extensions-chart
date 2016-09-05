/* jshint eqnull:true*/
/* globals d3*/

var com_tdg_chord = (function () {
	return function (user_props) {
		var props = {
			width: 300,
			height: 400,
			data: null,
			inverseData: false, // not tested
			chordSort: 'none', // ascending, descending, none
			groupPadding: 0.05,
			isInteractionDisabled: false,
			onRenderComplete: function() {},
			groupCurves: {
				radius: {
					inner: 'auto', // can be either 'auto' or a number between 0 and 1
					outer: 'auto' // can be either 'auto' or a number between 0 and 1
				},
				title: {
					font: "12px sans-serif",
					color: 'black',
					bold: true
				}
			},
			axis: {
				preciseCount: false, // if true then axis.lable.count and axis.ticks.count are required, otherwise - advisory
				label: {
					fontFamily: 'sans-serif',
					fontSize: 10,
					format: '.2s', // format string that will be passed to d3.format function. https://github.com/mbostock/d3/wiki/Formatting
					count: 20 // number of labels on every axis
				},
				ticks: {
					count: 90 // number that will be passed to axis.tics function to draw axis tics. https://github.com/mbostock/d3/wiki/Quantitative-Scales#linear_ticks
				}
			},
			toolTipEnabled: false,
			groupColors: ["#4087b8","#e31a1c","#9ebcda","#c994c7","#41b6c4","#49006a","#ec7014","#a6bddb","#67001f","#800026","#addd8e","#e0ecf4","#fcc5c0","#238b45","#081d58","#d4b9da","#2b8cbe","#74a9cf","#41ab5d","#fed976","#ce1256","#7f0000","#a6bddb","#ffffcc","#e7e1ef","#016c59","#f7fcfd","#99d8c9","#fff7fb","#ffffe5","#fdd49e","#ffffd9","#fe9929","#8c96c6","#810f7c","#993404","#c7e9b4","#bfd3e6","#e7298a","#7fcdbb","#3690c0","#ae017e","#d9f0a3","#ece2f0","#014636","#f7fcb9","#66c2a4","#fff7bc","#f7fcf0","#e5f5f9","#fdbb84","#fa9fb5","#4d004b","#fff7fb","#cc4c02","#78c679","#1d91c0","#ccebc5","#feb24c","#b30000","#8c6bb1","#fec44f","#d0d1e6","#084081","#0868ac","#f7fcfd","#0570b0","#ef6548","#fff7ec","#006837","#f768a1","#edf8b1","#fee391","#238443","#ffffe5","#023858","#7a0177","#67a9cf","#dd3497","#980043","#88419d","#d0d1e6","#fc8d59","#4eb3d3","#fd8d3c","#fff7f3","#fc4e2a","#ccece6","#ece7f2","#a8ddb5","#41ae76","#bd0026","#e0f3db","#045a8d","#ffeda0","#253494","#7bccc4","#fde0dd","#00441b","#225ea8","#006d2c","#02818a","#f7f4f9","#d7301f","#df65b0","#662506","#3690c0","#004529","#fee8c8"]
		};

		function getOnAllTransitionComplete ( cb ) {
	      return function ( transition ) {
	          var count = transition.size();
	          transition.each('end', function () {
	              if ( !(--count && typeof cb === 'function') ) cb();
	          });
	      };
	  }

	  function getInvokeAfter (cb, count) {
	      if (!count && typeof cb === 'function' ) cb();

	      return function () {
	          if (!(--count) && typeof cb === 'function') cb();
	      };
	  }

		function getCurveRadiusObj () { // not tested
			function isValidValue (val) {
				return _.isNumber(val) &&  val >= 0 && val <= 1;
			}

			var radiusProps = props.groupCurves.radius,
				maxRadius = Math.min(props.width, props.height) / 2,
				result = {};

			if ( radiusProps.inner === 'auto' ) {
				result.inner = maxRadius * 0.81;
			} else if ( isValidValue(radiusProps.inner) ) {
				result.inner = maxRadius * radiusProps.inner;
			} else {
				throw new Error('Wrong format of the groupCurves.radius.inner property');
			}

			if ( radiusProps.outer === 'auto' ) {
				result.outer = result.inner * 1.1;
			} else if ( isValidValue(radiusProps.outer) ) {
				result.outer = maxRadius * radiusProps.outer;
			} else {
				throw new Error('Wrong format of the groupCurves.radius.outer property');
			}

			if ( radiusProps.inner === 'auto' &&  isValidValue(radiusProps.outer) ) {
				result.inner = result.outer * 0.9;
			}

			if ( result.outer < result.inner ) {
				throw new Error('Outer radius must be larger than inner');
			}

			return result;
		}

		function getCloseColor (color) {
			return d3.rgb(color).brighter();
		}

		function getGroupFillScale (groupsCount) {
			var groupColors;
			if ( groupsCount > props.groupColors.length ) {
				if ( props.groupColors.length ) {
					var idx = props.groupColors.length - 1, lastIndx = groupsCount - 1;
					while ( idx++ < groupsCount ) {
						props.groupColors.push( getCloseColor( props.groupColors[idx % props.groupColors.length] ) );
					}
				}
			}
			return d3.scale.ordinal()
				.domain(d3.range(groupsCount)) // take a look later !
				// range of fill we get from series colors only
				.range(props.groupColors.slice(0, groupsCount));
		}

		function buildGroupCurveToolTip (idToIndx) {
			//var groupNames = _.keys(idToIndx);
			var groupNames = [];
			_.each(idToIndx, function(idx, name){
				groupNames[parseInt(idx, 10)] = name;
			});
			return function (d) {
				var str = '<div style="padding:5px">';
				str += '<b>name: </b>';
				str += groupNames[d.index];
				str += '</div>';
				return str;
			};
		}

		function renderGroupCurves (containerGroup, groups, idToIndx, onRenderComplete) {
			var group_curves = containerGroup.selectAll('path.group-curve')
				.data(groups);

			group_curves.enter()
				.append('path')
				.classed('group-curve', true);

			var radiusObj = getCurveRadiusObj();

			var fill = getGroupFillScale(groups.length);

			var curves = group_curves
				.attr('d', d3.svg.arc().innerRadius(radiusObj.inner).outerRadius(radiusObj.outer))
				.style({
					fill: function (d) {
						return fill(d.index);
					},
					stroke: function (d) {
						return fill(d.index);
					},
					opacity: 0
				});
				// .transition()
				// .delay(function (d, i) {
				// 	return 100 * i;
				// })
				// .duration(1000)
				// .style('opacity', 1);

			if ( props.isInteractionDisabled ) {
				curves.style('opacity', 1);
				onRenderComplete();
			} else {
				curves
					.transition()
					.delay(function (d, i) {
						return 100 * i;
					})
					.duration(1000)
					.style('opacity', 1)
					.call(getOnAllTransitionComplete(onRenderComplete));
			}

			if ( props.toolTipEnabled && false) {
				group_curves.attr('tdgtitle', buildGroupCurveToolTip(idToIndx));
			}

			return group_curves;
		}

		function getAxisTicksCount () {
			return _.isNumber(props.axis.ticks.count) ? props.axis.ticks.count : 90;
		}

		function getAxisLblCount () {
			return _.isNumber(props.axis.label.count) ? props.axis.label.count : 90;
		}

		function preciseTics (totalValue, d) {
			var ratio = d.value / totalValue;

			var groupTicksCount = Math.round(ratio * getAxisTicksCount()); // number of ticks in a group curve
			var groupLblsCount = Math.round(ratio * getAxisLblCount()); // number of lables in a group curve
			var lblOffsetInTicks = Math.round(groupTicksCount / groupLblsCount); // number of ticks to position each label

			var k = (d.endAngle - d.startAngle) / d.value;
			var lblFormat = d3.format(props.axis.label.format);

			return d3.range(0, d.value, d.value / groupTicksCount).map(function(v, i) {
				var lbl;
				if ( i % lblOffsetInTicks === 0 ) {
					lbl = (v === 0) ? 0 : lblFormat(v);
				}
				return {
					angle: v * k + d.startAngle,
					label: lbl
				};
			});
		}

		function niceTics (totalValue, d) {
			var ratio = d.value / totalValue;
			var scale = d3.scale.linear().domain([0, d.value]).range([d.startAngle, d.endAngle]);

			var groupTicksCount = Math.round(ratio * getAxisTicksCount()); // number of ticks in a group curve
			var groupLblsCount = Math.round(ratio * getAxisLblCount()); // number of lables in a group curve
			var lblOffsetInTicks = Math.round(groupTicksCount / groupLblsCount); // number of ticks to position each label

			var lblFormat = d3.format(props.axis.label.format);

			return scale.ticks(groupTicksCount).map(function (v, i) {
				var lbl;
				if ( i % lblOffsetInTicks === 0 ) {
					lbl = (v === 0) ? 0 : lblFormat(v);
				}
				return {
					angle: scale(v),
					label: lbl
				};
			});
		}

		function rescale (selection, onResizeComplete) {
			var selectionDim = selection.node().getBBox();

			var horrizOverflow = selectionDim.width - props.width;
			var vertOverflow = selectionDim.height - props.height;
			if ( horrizOverflow > 0 || vertOverflow > 0 ) {
				var origTransform = selection.attr('transform'), scale;
				scale = (horrizOverflow > vertOverflow) ? props.width / selectionDim.width : props.height / selectionDim.height;

				if ( props.isInteractionDisabled ) {
					selection.attr(
						'transform',
						origTransform + 'scale(' + ( scale * 0.99 ) + ')'
					);
					onResizeComplete();
				} else {
					selection
						.transition()
						.duration(500)
						.attr('transform', origTransform + 'scale(' + ( scale * 0.99 ) + ')')
						.call(getOnAllTransitionComplete(onResizeComplete));
				}
			}
		}

		function renderAxis (containerGroup, groups, onRenderComplete) {
			var axis_groups = containerGroup.selectAll("g.axis-group")
				.data(groups);

			var axis_group = axis_groups.enter()
				.append("g").classed('axis-group', true);

			var totalValue = d3.sum(groups, function(g){return g.value;});

			var radiusObj = getCurveRadiusObj();

			var axis_curve = axis_group.selectAll('path.axis-curve')
				.data(groups)
				.enter().append('path')
				.classed('.axis-curve', true)
				.attr('d', d3.svg.arc().innerRadius(radiusObj.outer + 5).outerRadius(radiusObj.outer + 5)) // add intercations
				.style({
					stroke: 'black',
					opacity: 0
				});
				// .transition()
				// .delay(function (d, i) {
				// 	return 100 * i;
				// })
				// .duration(1000)
				// .style('opacity', 1);

			if ( props.isInteractionDisabled ) {
				axis_curve.style('opacity', 1);
				onRenderComplete();
			} else {
				axis_curve
					.transition()
					.delay(function (d, i) {
						return 100 * i;
					})
					.duration(1000)
					.style('opacity', 1)
					.call(getOnAllTransitionComplete(onRenderComplete));
			}

			var ticksDataFnc = (props.axis.preciseCount) ? preciseTics : niceTics;

			var ticks = axis_group.selectAll("g.tick")
				.data(_.partial(ticksDataFnc, totalValue) )
				.enter().append("g")
				.classed('tick', true)
				.attr("transform", function(d) {
					return "rotate(" + (d.angle * 180 / Math.PI - 90) + ")" + "translate(" + (radiusObj.outer + 5) + ",0)";
				});

			ticks.append("line")
				.attr("x1", 1)
				.attr("y1", 0)
				.attr("x2", 5)
				.attr("y2", 0)
				.style({
					stroke: "#000",
					opacity: 0
				})
				.transition()
				.delay(function (d, i) {
					return 20 * i;
				})
				.duration(1000)
				.style('opacity', 1);

			ticks.filter(function(d){ return d.label != null;})
				.append("text")
				.attr({
					x: 8,
					dy: '.35em',
					transform: function(d) {
						return d.angle > Math.PI ? "rotate(180)translate(-16)" : null;
					}
				})
				.style({
					'text-anchor': function(d) {
						return d.angle > Math.PI ? "end" : null;
					},
					'font-family': props.axis.label.fontFamily,
					'font-size': props.axis.label.fontSize,
					fill: "#000",
					opacity: 0
				})
				.text(function(d) { return d.label; })
				.transition()
				.delay(function (d, i) {
					return 50 * i;
				})
				.duration(1000)
				.style('opacity', 1);
		}

		function buildChordToolTip (idToIndx) {
			//var ids = _.keys(idToIndx);
			var ids = [];
			_.each(idToIndx, function(idx, name){
				ids[parseInt(idx, 10)] = name;
			});

			var map = {
				index: 'source',
				subindex: 'target',
				value: 'value'
			};

			var names = ['source', 'target'];
			var keys = ['index', 'subindex', 'value'];

			return function (d) {
				var str = '<div style="padding: 5px">';
				names.forEach(function (name, idx, arr) {
					if ( d[name].index === d[name].subindex && idx > 0) {
						return;
					}
					if (idx > 0) {
						str += '<br/><br/>';
					}
					keys.forEach(function (key, idx) {
						if (idx > 0) {
							str += '<br/>';
						}

						str += '<b>' + map[key] + ':</b> ';
						if (key !== 'value') {
							str += ids[d[name][key]];
						} else {
							str += d[name][key];
						}
					});
				});
				str += '</div>';
				return str;
			};
		}

		function renderChords (containerGroup, chord, idToIndx, onRenderComplete) {

			var fill = getGroupFillScale(chord.groups().length);

			var chords = containerGroup.selectAll('path')
				.data(chord.chords());

			chords.enter().append('path');

			chords.attr('d', d3.svg.chord().radius( getCurveRadiusObj().inner - 3 ))
				.attr({
					stroke: 'black',
					'stroke-width': 0.5
				})
				.style({
					fill: function (d, idx) {
						return fill(d.target.index);
					},
					opacity: 0
				});
				// .transition()
				// .delay(function (d, i) {
				// 	return 50 * i;
				// })
				// .duration(1000)
				// .style('opacity', 0.8);

				if ( props.isInteractionDisabled ) {
					chords.style('opacity', 0.8);
					onRenderComplete();
				} else {
					chords
						.transition()
						.delay(function (d, i) {
							return 50 * i;
						})
						.duration(1000)
						.style('opacity', 0.8)
						.call(getOnAllTransitionComplete(onRenderComplete));
				}

				if ( props.toolTipEnabled ) {
					chords.attr('tdgtitle', buildChordToolTip(idToIndx));
				}
		}

		function isRightDataFormat (data) {
			return Array.isArray(data) && data.length && data.every(function (group) {
				return Array.isArray(group);
			});
		}

		// transform moonbeam data array into matrix that d3.chord layout requires
		function getMatrix (data) {
			if (!isRightDataFormat(data)) {
				throw new Error('Wrong data set format');
			}

			var idToIndx = {}, lastIndx = 0;

			var result = [];

			data.forEach(function (array) {
				array.forEach(function (d, idx) {
					if (idToIndx[d.source] == null) {
						idToIndx[d.source] = lastIndx++;
						result[idToIndx[d.source]] = [];
					}
					if (idToIndx[d.target] == null) {
						idToIndx[d.target] = lastIndx++;
						result[idToIndx[d.target]] = [];
					}

					result[idToIndx[d.source]][idToIndx[d.target]] = d.value;
				});
			});
			var len;
			result.forEach(function (arr) {
				len = lastIndx;
				while (len--) {
					arr[len] = (arr[len] == null) ? 0 : arr[len];
				}
			});

			if (props.inverseData) {
				result = _.unzip(result);
			}

			result.idToIndx = idToIndx;
			return result;
		}

		// Returns an event handler for fading a given chord group.
		function groupCurvefadeInteraction(opacity, paths, curves) {
			return function(g, i) {
				var filteredPaths = paths.filter(function(d) {
						return d.source.index != i && d.target.index != i;
					})
					.transition()
					.style("opacity", opacity);


				curves.filter(function(d) {
						return d.index !== g.index;
					})
					.transition()
					.style("opacity", opacity);
			};
		}

		function chordFadeInteraction (opacity, chords, curves) {
			return function(chord_d, i) {
				chords.filter(function(d) {
						return d.source.index !== chord_d.source.index || d.source.subindex !== chord_d.source.subindex;
					})
					.transition()
					.style("opacity", opacity);

				curves.filter(function (curve_d) {
						return curve_d.index !== chord_d.source.index && curve_d.index !== chord_d.target.index;
					})
					.transition()
					.style("opacity", opacity);
			};
		}

		function getGroupTitleOffset ( els ) {
			var TICK_LENGTH = 5,
				TITLE_PAD = 10;

			return els.map(function (el) {
				return el.getBBox().width;
			}).reduce(function (max, cur) {
				return (cur > max) ? cur : max;
			}, -Infinity) + TICK_LENGTH + TITLE_PAD; // tallest axis label + tick length + padding
		}

		function renderGroupCurvesTitles(chord_titles_group, groups, idToIndx, offset, onRenderComplete) {
			var groupNames = [];
			_.each(idToIndx, function(idx, name){
				groupNames[parseInt(idx, 10)] = name;
			});

			var lblOffset = getCurveRadiusObj().outer + offset;

			var titles = chord_titles_group
				.selectAll('text.title')
				.data(groups);

			titles.enter()
				.append('text')
				.text(function (d) {
					return groupNames[d.index];
				})
				.each(function (d) {

					var rad = d.startAngle + (d.endAngle - d.startAngle) / 2,
						x = lblOffset * Math.cos(rad - Math.PI / 2),
						y = lblOffset * Math.sin(rad - Math.PI / 2),
						rotate = ( rad > 0 && rad < Math.PI )
							? ( rad - Math.PI / 2 ) * ( 180 / Math.PI )
							: ( rad - 3 * Math.PI / 2 ) * ( 180 / Math.PI );

					d3.select(this)
						.style({
							fill: props.groupCurves.title.color,
							font: props.groupCurves.title.font,
							'font-weight': ( props.groupCurves.title.bold ) ? 'bold' : 'normal'
						})
						.attr({
							'text-anchor': ( rad > 0 && rad < Math.PI ) ? 'start' : 'end',
							transform: ' translate(' + [x, y] + ') rotate(' + rotate  + ')'
						});
				});

			onRenderComplete();
		}

		function enableMouseInteraction (group_curves, chord_group) {
			var chords = chord_group.selectAll('path');
			var curves = group_curves.selectAll('path.group-curve');

			curves
				.on('mouseover', groupCurvefadeInteraction(0.1, chords, curves))
				.on('mouseout', groupCurvefadeInteraction(0.8, chords, curves));

			chords
				.on('mouseover', chordFadeInteraction(0.1, chords, curves))
				.on('mouseout', chordFadeInteraction(0.8, chords, curves));
		}

		function sortChords () {
			var res = {
				'ascending' : d3.ascending,
				'descending' : d3.descending
			};

			return res[props.chordSort];
		}

		if (!com_tdg_util) {
			throw new Error('com_tdg_util must be defined');
		}

		com_tdg_util.copyIfExisty(props, user_props || {});

		function createAccessor (attr) {
			function accessor (value) {
				if (!arguments.length) { return props[attr]; }
				props[attr] = value;
				return chart;
			}
			return accessor;
		}

		function chart (selection) {
			var matrix = getMatrix(props.data || []);

			var chord = d3.layout.chord()
				.padding(props.groupPadding)
				.sortSubgroups(sortChords())
				.matrix(matrix);

			var mainGroup = selection.append('g')
				.attr('transform', 'translate(' + [ props.width / 2, props.height / 2 ] + ')');

			var invokeAfterFive = getInvokeAfter(props.onRenderComplete, 5);

			var group_curves = mainGroup.append('g').classed('group-curves', true);
			renderGroupCurves(group_curves, chord.groups(), matrix.idToIndx, invokeAfterFive);

			var axis_groups = mainGroup.append('g').classed('axis-groups', true);
			renderAxis(axis_groups, chord.groups(), invokeAfterFive);

			var groupTitleOffset = getGroupTitleOffset( axis_groups.selectAll('g.tick>text')[0] );

			var chord_group = mainGroup.append('g').classed('chord-group', true);
			renderChords(chord_group, chord, matrix.idToIndx, invokeAfterFive);

			var chord_titles_group = mainGroup.append('g').classed('chord-titles-group', true);
			renderGroupCurvesTitles(
				chord_titles_group,
				chord.groups(),
				matrix.idToIndx,
				groupTitleOffset,
				invokeAfterFive
			);

			enableMouseInteraction(group_curves, chord_group);

			rescale(mainGroup, invokeAfterFive);
		}

		for (var attr in props) {
			if ((!chart[attr]) && (props.hasOwnProperty(attr))) {
				chart[attr] = createAccessor(attr);
			}
		}

		return chart;
	};
})();
