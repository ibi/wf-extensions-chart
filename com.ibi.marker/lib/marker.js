/* jshint eqnull:true, laxbreak:true*/
/* globals d3*/

var tdg_marker = (function () {

  // this function only copies attributes values if it is present on src and it's not null or undefined on trgt
  function copyIfExisty (src, trgt) {
    each(src, function (attr, key) {
      if ( isObject(attr) && isObject(trgt[key]) ) {
        copyIfExisty(attr, trgt[key]);
      } else if (trgt[key] != null && !isObject(src[key])) {
        src[key] = trgt[key];
      }
    });
  }

  function isObject (o) {
    return o && o.constructor === Object;
  }

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

  function each (obj, cb) {
    if ( Array.isArray(obj) ) {
      for (var i = 0; i < obj.length; i++) {
        cb(obj[i], i, obj);
      }
      obj.forEach(cb);
    } else if ( isObject(obj) ) {
      for (var key in obj) {
        if ( obj.hasOwnProperty(key) ) {
          cb(obj[key], key, obj);
        }
      }
    }
  }

  var pathMarker = {
    star: getStarMarker,
    square: getSquire,
    circle: getCircle
  };

  function getStarMarker (r) {
    var t36 = 0.7265, t72 = 3.0777, c72 = 0.309, s72 = 0.951, c36 = 0.809, s36 = 0.588;
    var h = r, b = h / 3.236, hp = b / c36;
    return "M0," + -h
      + "L" + (b*t36) + "," + -b
      + "L" + (b*t72) + "," + -b
      + "L" + (hp*s72) + "," + (hp*c72)
      + "L" + (h*s36) + "," + (h*c36)
      + "L0," + hp
      + "L" + -(h*s36) + "," + (h*c36)
      + "L" + -(hp*s72) + "," + (hp*c72)
      + "L" + -(b*t72) + "," + -b
      + "L" + -(b*t36) + "," + -b
      + "Z";
  }

  function getCircle (r) {
    return "M0,0" + " m" + -r + ',0' + 'a' + [r, r] + ' 0 1, 0 ' + (r * 2) + ',0' + 'a' + [r, r] + ' 0 1, 0 ' + (-r * 2) + ',0';
  }

  function getSquire (r) {
    return "M" + -r + "," + -r
      + "L" + r + "," + -r
      + " " + r + "," + r
      + " " + -r + "," + r
      + "Z";
  }

	return function (user_props) {
    // here we put all the function that need to access props or innerProps objects
		var props = {
			width: 300,
			height: 400,
			data: null,
      formatNumber: null, // moonbeam function
      extraMarkersColor: '#898989',
      isInteractionDisabled: false,
      onRenderComplete: function(){},
      mode: "proportion", // "proportion" or "count"
      marker: {
        type: 'circle', // 'square', 'star'
        cellRatio: 0.8,
        countRange : [100, 625],
        stroke: {
          color: 'black',
          width: 0.5
        }
      },
      label: {
        enabled: true,
        format: 'd',
        font: {
          family: 'sans-serif',
          size: '15px',
          color: 'auto'
        }
      }
		};

    var innerProps = {
      colors: ["#4087b8","#e31a1c","#9ebcda","#c994c7","#41b6c4","#49006a","#ec7014","#a6bddb","#67001f","#a4e3f4","#addd8e","#e0ecf4","#fcc5c0","#238b45","#081d58","#d4b9da","#2b8cbe","#74a9cf","#41ab5d","#fed976","#ce1256","#7f0000","#a6bddb","#ffffcc","#e7e1ef","#016c59","#f7fcfd","#99d8c9","#fff7fb","#ffffe5","#fdd49e","#ffffd9","#fe9929","#8c96c6","#810f7c","#993404","#c7e9b4","#bfd3e6","#e7298a","#7fcdbb","#3690c0","#ae017e","#d9f0a3","#ece2f0","#014636","#f7fcb9","#66c2a4","#fff7bc","#f7fcf0","#e5f5f9","#fdbb84","#fa9fb5","#4d004b","#fff7fb","#cc4c02","#78c679","#1d91c0","#ccebc5","#feb24c","#b30000","#8c6bb1","#fec44f","#d0d1e6","#084081","#0868ac","#f7fcfd","#0570b0","#ef6548","#fff7ec","#006837","#f768a1","#edf8b1","#fee391","#238443","#ffffe5","#023858","#7a0177","#67a9cf","#dd3497","#980043","#88419d","#d0d1e6","#fc8d59","#4eb3d3","#fd8d3c","#fff7f3","#fc4e2a","#ccece6","#ece7f2","#a8ddb5","#41ae76","#bd0026","#e0f3db","#045a8d","#ffeda0","#253494","#7bccc4","#fde0dd","#00441b","#225ea8","#006d2c","#02818a","#f7f4f9","#d7301f","#df65b0","#662506","#3690c0","#004529","#fee8c8"],
      verticalPadding: 5,
      horizontalPadding: 5,
      labels: {
        animation: {
          delay: function (d, i) {
            return 50 * i;
          },
          duration: 500
        }
      },
      markers: {
        animation: {
          delay: function (d, i, g) {
            return 10 * (i + g);
          },
          duration: 500
        }
      }
    };

    function getData () {
      if ( !Array.isArray(props.data) ) {
        throw new Error('Wrong data set format');
      }

      return props.data.filter(function (d) {
        return d != null && d.count > 0;
      }).sort(function (a, b) {
        return a.count - b.count;
      });
    }

    function getColor (d, idx) {
      return ( typeof d.color === 'string' ) ? d.color : innerProps.colors[idx];
    }

    function getLabelsByGroup () {
      return getData().map(function (d) {
        return d.label;
      });
    }

    function buildLabelsData (markerInfo) {

      var counts = getCountByGroup(),
        labels = getLabelsByGroup(),
        format = d3.format(props.label.format),
        colors;

      function text (label, count) {
        if (label) {
          return label + '(' + count + ')';
        } else {
          return count;
        }
      }

      if (props.label.font.color === 'auto') {
        colors = getColors();
      } else if (typeof props.label.font.color === 'string') {
        colors = d3.range(counts.length).map(function () {
          return props.label.font.color;
        });
      }

      var data = getData();

      var extent = d3.extent(data, function (d) { return d.count; });

      var config = {
        max: extent[1],
        min: extent[0]
      };

      return data.filter(function (d, idx) {
        return markerInfo.groupSequence.indexOf(idx) >= 0;
      }).map(function (d, i) {
        var g = markerInfo.groupSequence[i];
        return {
          text: text(labels[g], props.formatNumber(d.count, props.label.format, config) ),
          color: colors[i] || props.extraMarkersColor
        };
      });
    }

    function renderLabels (group_labels, data, onRenderComplete) {
      var labels = group_labels.selectAll('text.label')
        .data(data);

      labels
        .enter()
        .append('text').classed('label', true);

      labels
        .attr({
          x: innerProps.horizontalPadding,
          dy: '.5em'
        })
        .style({
          fill: function (d) {
            return d.color;
          },
          /*'font-family': props.label.font.family,
          'font-size': props.label.font.size,*/
          cursor: 'default',
          opacity: 0
        })
        .text(function (d) {
          return d.text;
        });

      if (props.isInteractionDisabled) {
        labels.style('opacity', 1);
        onRenderComplete();
      } else {
        labels.transition()
          .delay(innerProps.labels.animation.delay)
          .duration(innerProps.labels.animation.duration)
          .style('opacity', 1)
          .call(getOnAllTransitionComplete(onRenderComplete));
      }

      return labels;
    }

    function getMaxLabelWidth (labels) {
      return d3.max(labels[0], function (el) {
        return el.getBoundingClientRect().width;
      });
    }

    function getGroupLabelsWidth (labels) {
      if (!labels) {
        return 0;
      }
      return getMaxLabelWidth(labels) + 2 * innerProps.horizontalPadding;
    }

    function getMarkerInfo () {
      var data = getData(),
        countRange = props.marker.countRange;

      var counts = data.map(function (d, idx) {
        return d.count;
      });

      var groupSequence = counts.map(function (d, idx) {
        return idx;
      });

      var actualTotalCount = d3.sum(counts);

      switch (true) {
        case ( countRange[0] > actualTotalCount && props.mode === 'count' ) : // actual count of markers is less than min count of markers
          counts.push(countRange[0] - actualTotalCount);
          actualTotalCount = d3.sum(counts);
          break;
        case ( props.mode === 'proportion' ) : // actual count of markers is greater than max count of markers
          var ratios = counts.map(function (count) {
            return count / actualTotalCount * 100;
          });

          var minRatio = d3.min(ratios);

          if ( minRatio < 1 ) {
            var coef = 1 / minRatio;

            ratios = ratios.map(function (ratio) {
              return ratio * coef;
            });
          }

          counts = ratios.map(function (count) {
            return Math.ceil(count);
          });

          actualTotalCount = d3.sum(counts);

          var trim = 0;

          if ( actualTotalCount > countRange[1] ) {
            trim = Math.ceil(( actualTotalCount - countRange[1] ) / counts.length);
          }

          groupSequence = [];

          counts = counts.map(function ( count ) {
            return count - trim;
          }).filter(function (count, idx) {
            if ( count < 0 ) {
              return false;
            } else {
              groupSequence.push(idx);
              return true;
            }
          });

          actualTotalCount = d3.sum(counts);

          break;
      }

      return {
        countByGroup: counts,
        groupSequence: groupSequence,
        totalCount: actualTotalCount
      };

    }

    function getTotalMarkerCount () {
      var data  = getData(),
        counts = 0,
        totals = ( typeof props.marker.countRange[0] === 'number' ) ? props.marker.countRange[0] : 0;
      data.forEach(function (d) {
        counts += d.count;
        totals = Math.max(totals, d.total);
      });

      return Math.max(counts, !isNaN(totals) ? totals : props.marker.countRange[0] );
    }

    function getLayoutInfo (markerInfo, width, height) {
      var widthToHeight = width / height;

      //var total = getTotalMarkerCount();

      var total = markerInfo.totalCount;

      var x = Math.sqrt(total * widthToHeight);
      var y = total / x;

      var actions = ['ceil', 'floor'],
        resultTotals = [], temp;

      actions.forEach(function (action_x) {
        actions.forEach(function (action_y) {
          temp = Math[action_x](x) * Math[action_y](y);
          if (temp >= total) {
            resultTotals.unshift(temp);
          } else {
            resultTotals.unshift(Infinity);
          }
        });
      });

      var bestIndx = resultTotals.indexOf(d3.min(resultTotals));

      switch(bestIndx) {
        case 0:
          x = Math.floor(x);
          y = Math.floor(y);
          break;
        case 1:
          x = Math.floor(x);
          y = Math.ceil(y);
          break;
        case 2:
          x = Math.ceil(x);
          y = Math.floor(y);
          break;
        case 3:
          x = Math.ceil(x);
          y = Math.ceil(y);
          break;
      }

      var sideLength = Math.min( width / x, height / y );

      return {
        colCount: x,
        rowCount: y,
        sideLength: sideLength
      };
    }

    function getCountByGroup () {
      var data = getData();

      var counts = data.map(function (d, idx) {
        return d.count;
      });

      var totalCount = d3.sum(counts);
      var actualTotalCount = getTotalMarkerCount();

      if (totalCount < actualTotalCount) {
        counts.push(actualTotalCount - totalCount);
      }

      return counts;
    }

    function getColors () {
      var data = getData();

      return data.map(function (d, idx) {
        return getColor(d, idx);
      });
    }

    function buildMarkersData (markerInfo, layout) {
      var i, j, result = [],
        cellHalfLength = layout.sideLength / 2,
        radius = cellHalfLength * props.marker.cellRatio;

      //var markerInfo = getMarkerInfo();

      var colors = getColors();
      //var counts = getCountByGroup();

      var counts = markerInfo.countByGroup;

      var rowNum, colNum,
        lastIndx = 0;

      counts.forEach(function (count, clusterIndex) {
        for ( i = lastIndx; i < count + lastIndx; i++ ) {
          rowNum = Math.floor(i / layout.colCount);
          colNum = i % layout.colCount;
          if (!result[rowNum]) {
            result[rowNum] = [];
          }
          result[rowNum][colNum] = {
            color: colors[clusterIndex] || props.extraMarkersColor,
            x: colNum * layout.sideLength + cellHalfLength,
            y: rowNum * layout.sideLength + cellHalfLength,
            radius: radius,
            group: clusterIndex
          };
        }
        lastIndx = i;
      });

      return result;
    }

    function renderMarkers (group_markers, markersData, onRenderComplete) {
      var markerRows = group_markers.selectAll('g.row')
        .data(markersData);

      markerRows.enter().append('g').classed('row', true);

      var markers = markerRows.selectAll('path.marker')
        .data(function (d) {
          return d;
        });

      markers.enter().append('path').classed('marker', true);

      markers.attr({
          d : function (d) {
            return pathMarker[props.marker.type](d.radius);
          },
          transform: function (d) {
            return 'translate(' + [d.x, d.y] + ')';
          }
        })
        .style({
          fill: function (d) {
            return d.color;
          },
          opacity: 0
        });

      if (props.isInteractionDisabled) {
        markers.style('opacity', 1)
        onRenderComplete();
      } else {
        markers.transition()
          .delay(innerProps.markers.animation.delay)
          .duration(innerProps.markers.animation.duration)
          .style('opacity', 1)
          .call(getOnAllTransitionComplete(onRenderComplete));
      }

      return markers;
    }

    function getGroupMarkers (markers, group) {
      return markers.filter(function (d, mIdx, g) {
          return group === d.group;
        }).filter(function (arr) {
          return arr.length;
        }).reduce(function (arr, cur) {
          return arr.concat(cur);
        });
    }

    function positionLabelsVerticaly (labels, markers) {
      var yPositions;
      labels.attr('y', function (d, group) {
        yPositions = [];
        markers.filter(function (d) {
          return group === d.group;
        }).each(function (d) {
          yPositions.push(d.y);
        });

        return d3.mean(yPositions);
      });
    }

    function enableInteraction (labels, markers) {
      function fadeLabels (opacity) {
        var lf, mf;
        return function (d, i) {
          lf = labels.filter(function (d, idx) {
            return i !== idx;
          });

          mf = markers.filter(function (d) {
            return i !== d.group;
          });

          lf.transition()
            .style('opacity', opacity);

          mf.transition()
            .style('opacity', opacity);
        };
      }

      function fadeMarkers (opacity) {
        var lf, mf;
        return function (dM) {
          if (labels) {
            lf = labels.filter(function (d, idx) {
              return dM.group !== idx;
            });

            lf.transition()
              .style('opacity', opacity);
          }

          mf = markers.filter(function (dm) {
            return dM.group !== dm.group;
          });

          mf.transition()
            .style('opacity', opacity);
        };
      }

      if (labels) {
        labels
          .on('mouseover', fadeLabels(.2))
          .on('mouseout', fadeLabels(1));
      }

      markers
        .on('mouseover', fadeMarkers(.2))
        .on('mouseout', fadeMarkers(1));
    }

		function chart (selection) {
      var group_main = selection.append('g')
        .classed('group-main', true);

      var markerInfo = getMarkerInfo();

      var invokeAfterThreeOrTwo = props.label.enabled
        ? getInvokeAfter(props.onRenderComplete, 3)
        : getInvokeAfter(props.onRenderComplete, 2);

      // -------------- LABEL RENDERING LOGIC STARTS
      var labels, group_labels;
      if (props.label.enabled) {
        group_labels = selection.append('g')
          .classed('group-labels', true);
        var labelsData = buildLabelsData(markerInfo);
        labels = renderLabels(group_labels, labelsData, invokeAfterThreeOrTwo);
      }
      // -------------- LABEL RENDERING LOGIC ENDS

      var markerLeftOffset =  getGroupLabelsWidth(labels);

      // -------------- MARKERS RENDERING LOGIC STARTS
      var group_markers = selection.append('g')
        .classed('group-markers', true);

      var width = props.width - markerLeftOffset - 2 * innerProps.horizontalPadding;
      var height = props.height - 2 * innerProps.verticalPadding;

      var layout = getLayoutInfo(markerInfo, width, height);
      var markersData = buildMarkersData(markerInfo, layout);

      var markers = renderMarkers(group_markers, markersData, invokeAfterThreeOrTwo);
      // -------------- MARKERS RENDERING LOGIC ENDS

      // -------------- GROUP_MARKERS POSITIONING LOGIC STARTS
      group_markers
        .attr('transform', 'translate(' + [innerProps.horizontalPadding + markerLeftOffset, innerProps.verticalPadding] + ')');

      // -------------- GROUP_MARKERS POSITIONING LOGIC ENDS

      // -------------- LABEL POSITIONING LOGIC STARTS
      if (props.label.enabled) {
        group_labels
          .attr('transform', 'translate(' + [0, innerProps.verticalPadding] + ')');
        positionLabelsVerticaly(labels, markers);
      }
      // -------------- LABEL POSITIONING LOGIC ENDS

      // -------------- INTERACTION LOGIC STARTS
      if (!props.isInteractionDisabled) {
          enableInteraction(labels, markers);
      }
      // -------------- INTERACTION LOGIC ENDS

      invokeAfterThreeOrTwo();
		}

    copyIfExisty(props, user_props || {});

    function createAccessor (attr) {
      function accessor (value) {
        if (!arguments.length) { return props[attr]; }
        props[attr] = value;
        return chart;
      }
      return accessor;
    }

		for (var attr in props) {
			if ((!chart[attr]) && (props.hasOwnProperty(attr))) {
				chart[attr] = createAccessor(attr);
			}
		}

		/* start-test-block */

		/* end-test-block */

		return chart;
	};
})();
