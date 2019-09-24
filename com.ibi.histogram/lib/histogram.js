/* eslint-disable */
/* globals d3*/

var tdg_histogram = (function() {

    function copyIfExisty(src, trgt) {
        each(src, function(attr, key) {
            if (isObject(attr) && isObject(trgt[key])) {
                copyIfExisty(attr, trgt[key]);
            } else if (trgt[key] != null && !isObject(src[key])) {
                src[key] = trgt[key];
            }
        });
    }

    function isObject(o) {
        return o && o.constructor === Object;
    }

    function each(obj, cb) {
        if (Array.isArray(obj)) {
            for (var i = 0; i < obj.length; i++) {
                cb(obj[i], i, obj);
            }
            obj.forEach(cb);
        } else if (isObject(obj)) {
            for (var key in obj) {
                if (obj.hasOwnProperty(key)) {
                    cb(obj[key], key, obj);
                }
            }
        }
    }

    function jsonCpy(o) {
      return JSON.parse(JSON.stringify(o));
    }

    function calcMargins( textsLayout, innerProps ) {
      var innerPropsMargins = innerProps.margins,
        pad = innerProps.pad || 5;

      var yaxisMaxLblWidth = d3.max(textsLayout.yaxis.labels, function (label) {
        return label.dim.width;
      });

      var yaxisTitleHeight = textsLayout.yaxis.title ? textsLayout.yaxis.title.dim.height : 0;

      var yaxisHorizLength = yaxisMaxLblWidth + yaxisTitleHeight + 3 * pad + innerProps.axisTickLength;

      var xAxisFirstLabelOffset = textsLayout.xaxis.labels[0] ? textsLayout.xaxis.labels[0].dim.width / 2 + pad : 0;
      var xAxisLastLabelIdx = textsLayout.xaxis.labels.length - 1;
      var xAxisLastLabelOffset = textsLayout.xaxis.labels[xAxisLastLabelIdx]
        ? textsLayout.xaxis.labels[xAxisLastLabelIdx].dim.width / 2 + pad
        : 0;

      var yAxisFirstLabelOffset = textsLayout.yaxis.labels[0] ? textsLayout.yaxis.labels[0].dim.width / 2 + pad : 0;
      var yAxisLastLabelIdx = textsLayout.yaxis.labels.length - 1;
      var yAxisLastLabelOffset = textsLayout.yaxis.labels[yAxisLastLabelIdx]
        ? textsLayout.yaxis.labels[yAxisLastLabelIdx].dim.width / 2 + pad
        : 0;

      var xaxisLblsHeight = textsLayout.xaxis.labels[0] ? textsLayout.xaxis.labels[0].dim.height : 0;
      var xaxisVerticalLength = xaxisLblsHeight + 2 * pad + innerProps.axisTickLength;

      return {
        top: Math.max(yAxisLastLabelOffset, innerProps.margins.top),
        bottom: Math.max(xaxisVerticalLength, yAxisFirstLabelOffset, innerProps.margins.bottom),
        left: Math.max(yaxisHorizLength, innerProps.margins.left, xAxisFirstLabelOffset),
        right: Math.max(innerProps.margins.right, xAxisLastLabelOffset)
      };
    }

    function getYAxisLayout ( data, yaxisLabels, margins, props ) {
      var height = props.height - margins.top - margins.bottom;
      var yscale = getYScaleWithoutRange(data, props.bins.thresholds, props.bins.count);
      yscale.range([height, 0]);

      return {
        x: margins.left,
        y: margins.top,
        pos: yscale,
        labels: yaxisLabels
      };
    }

    function getXAxisLayout (cleanData, yaxisLabels, margins, props) {
        var width = props.width - margins.left - margins.right;
        return {
            x : margins.left,
            y : props.height - margins.bottom,
            labels : yaxisLabels || [],
            pos: getXScale(cleanData, props.bins.thresholds, props.bins.count, width)
        };
    }

    function getCanvasLayout ( cleanData, margins, props, yscale, xscale) {
        var layout = {
            x : margins.left,
            y : margins.top,
            width: props.width - margins.left - margins.right,
            height: props.height - margins.top - margins.bottom,
            rects : []
        };

        var xpos = xscale, // ordinal axis position. In this case vertical position
            bandWidth = xscale.rangeBand();

        var rect;

        var bins = getHistogramBins(cleanData, props.bins.thresholds, props.bins.count);

        bins.forEach( function ( bin ) {
            rect = {};

            rect.x = xpos(bin.x);
            rect.y = yscale(bin.length);

            rect.height = layout.height - rect.y;
            rect.width= bandWidth;

//          rect.class = d.elClassName;

            rect.color = props.bins.color;

            rect.tooltip = {};
            rect.tooltip['count'] = bin.length;
            rect.tooltip['range'] = '' + bin.x + '-' + d3.max(bin);

            layout.rects.push(rect);
        });

        return layout;
    }

    function isNumber(num) {
      return num != null && !isNaN(num);
    }

    function getCleanData(data) {
      return data.filter(function(d){
        return isNumber(d.value);
      });
    }

    function getYScaleDomainExtent(cleanData, thresholds, count) {
      var bins = getHistogramBins(cleanData, thresholds, count);
      return [0, d3.max(bins, function(d){
        return d.length;
      })];
    }

    // the returned scale does not have range set on it
    // it's implied that cunsumer will set
    // the scale without range can be used to get tick values
    function getYScaleWithoutRange(cleanData, thresholds, count) {
      var yScaleDomain = getYScaleDomainExtent(cleanData, thresholds, count);
      return d3.scale.linear().domain(yScaleDomain).nice();
    }

    function getYAxisLabels(cleanData, thresholds, count, formatNumber, format) {
      var domain = getYScaleDomainExtent(cleanData, thresholds, count);

      var formatConfig = {
        min: domain[0],
        max: domain[1]
      };

      var yscale = getYScaleWithoutRange(cleanData, thresholds, count);
      var labels = yscale.ticks();
      return labels.map(function (label) {
        return formatNumber(+label, format, formatConfig);
      });
    }

    function getYaxisTitleText(props) {
      return Array.isArray(props.buckets.value) ? props.buckets.value[0] : null;
    }

    function getXScale( cleanData, thresholds, count, width ) {
      var domain = getHistogramBins(cleanData, thresholds, count).map(function(bin){ return bin.x});
      return d3.scale.ordinal().domain(domain).rangeBands([0, width], 0.1, 0.05);
    }

    function getHistogramBins( cleanData, thresholds, count ) {
      var histogram = d3.layout.histogram();

      var values = cleanData.map(function(d){ return d.value; });

      if ( thresholds && thresholds.length > 0 ) {
        var max = d3.max(values);
        thresholds = thresholds.slice().sort();
        thresholds = ( thresholds[thresholds.length - 1] < max ) ? thresholds.concat(max) : thresholds;
        histogram.bins(thresholds);
      } else if ( isNumber(count) ) {
        histogram.bins(count); 
      }

      return histogram(values);
    }

    function getXScaleGroupValues ( cleanData, thresholds, count ) {
      var bins = getHistogramBins(cleanData, thresholds, count);
      return ( bins.length > 0 )
        ? bins.reduce( function ( ticks, bin ) {
          return ticks.concat(d3.max(bin));
        }, [bins[0].x])
        : [];
    }

    function getXAxisLabels (cleanData, thresholds, count, formatNumber, format) {
      var groups = getXScaleGroupValues(cleanData, thresholds, count);

      var formatConfig = {
        min: groups[0],
        max: groups[1]
      };

      return groups.map(function(group) {
        return formatNumber(group, format, formatConfig);
      });
    }

    function getTextsLayout ( cleanData, props ) {

      var yaxisLabels = getYAxisLabels(
        cleanData, props.bins.thresholds, props.bins.count,
        props.formatNumber, props.yaxis.labels.format
      );

      var xaxisLabels = getXAxisLabels(
        cleanData, props.bins.thresholds, props.bins.count,
        props.formatNumber, props.xaxis.labels.format
      );

      var yaxisTitleText = getYaxisTitleText(props);

      return {
        xaxis: {
          labels: xaxisLabels.map(function( label ) {
            return {
              text: label,
              dim: props.measureLabel(label, props.xaxis.labels.font)
            };
          })
        },
        yaxis: {
          title: ( yaxisTitleText )
            ? {
                text: yaxisTitleText,
                dim: props.measureLabel(yaxisTitleText, props.yaxis.title.font)
              }
            : null,
          labels: yaxisLabels.map(function( label ) {
            return {
              text: label,
              dim: props.measureLabel(label, props.yaxis.labels.font)
            };
          })
        }
      }
    }

    function buildLayout ( props, innerProps ) {
        var layout = {
            margins: null,
            y: null,
            x: null,
            canvas: null
        };

        var data = getCleanData(props.data);

        var textsLayout = getTextsLayout(data, props);

        layout.margins = calcMargins( textsLayout, innerProps );

        layout.x = getXAxisLayout(
          data,
          textsLayout.xaxis.labels.map(function(label){
            return label.text;
          }),
          layout.margins,
          props
        );

        layout.y = getYAxisLayout(
          data,
          textsLayout.yaxis.labels.map(function(label){
            return label.text;
          }),
          layout.margins,
          props
        );
        

        layout.canvas = getCanvasLayout ( data, layout.margins, props, layout.y.pos, layout.x.pos );

        layout.y.title = textsLayout.yaxis.title;
        layout.y.title.x = innerProps.pad;
        layout.y.title.y = layout.margins.top + layout.canvas.height / 2;

        return layout;
    }

    function buildToolTip (d) {
        if (!d.tooltip) return;
        var tip = d.tooltip,
            str = '<div style="padding: 5px">',
            idx = 0;

        for ( var key in tip ) {
            if ( tip.hasOwnProperty(key) ) {
                if ( idx ) str += '<br/>';
                str += '<b>' + key + ':</b> ';
                str += tip[key];
                idx++;
            }
        }

        str += '</div>';
        return str;
    }

    function render ( group_main, layout, props ) {

        var canvas = group_main.append('g').classed('canvas', true)
            .attr('transform', 'translate(' + [ layout.canvas.x, layout.canvas.y ] + ')');

        var rect = canvas.selectAll('g.riser')
            .data(layout.canvas.rects);

        var rect_enter = rect.enter().append('g').classed('riser', true)
            .attr('transform', function (d) { return 'translate(' + [d.x, d.y] + ')'; });

        if (props.tooltips.enabled) {
        //   rect_enter.attr('tdgtitle', buildToolTip);  // Tooltips drawn by chart engine in com.ibi.histogram now
        }

        rect_enter.append('rect')
            .attr({
                class: function(d) {
                  return d.class;
                },
                width: function (d) {
                    return d.width;
                },
                height: function (d) {
                    return d.height;
                }
            })
            .style('fill', function (d) {
                return d.color;
            });


        var x_axis = group_main.selectAll('g.x-axis')
            .data([layout.x]);

        var ordAxisScale = d3.scale.ordinal().domain(layout.x.labels).rangePoints([0, layout.canvas.width]);

        var ordAxis = d3.svg.axis().scale(ordAxisScale).orient('bottom');

        var x_axis_enter = x_axis.enter().append('g').classed('x-axis', true)
            .attr({
                transform: function (l) {
                    return 'translate(' + [l.x, l.y] + ')';
                }
            })
            .style({
                font : props.xaxis.labels.font
            })
            .call(ordAxis);

        x_axis_enter.selectAll('g.tick > text').style({
            fill: props.xaxis.labels.color
        });

        x_axis_enter.selectAll('line,path').style('stroke', 'black');

        
        var y_axis = group_main.selectAll('g.y-axis')
            .data([layout.y]);

        var ordAxis = d3.svg.axis().scale(layout.y.pos).orient('left');

        var y_axis_enter = y_axis.enter().append('g').classed('y-axis', true)
            .attr({
                transform: function (l) {
                    return 'translate(' + [l.x, l.y] + ')';
                }
            })
            .style({
                font : props.yaxis.labels.font
            })
            .call(ordAxis);

        y_axis_enter.selectAll('g.tick > text').style({
            fill: props.yaxis.labels.color
        });

        y_axis_enter.selectAll('line,path').style('stroke', 'black');

        var y_title = group_main
          .append('text')
          .text(layout.y.title.text);

        y_title.style({
          fill: props.yaxis.title.color,
          font: props.yaxis.title.font
        });

        y_title
          .attr('dy', '1em')
          .attr(
	    'transform',
            'translate(' + [ 
              layout.y.title.x, 
              layout.y.title.y + layout.y.title.dim.width / 2
            ] + ') rotate(-90)'
          );


        return {
            rects: rect_enter
        };
    }

    function hover ( opacity, rects ) {
        return function () {
            var that = this;
            rects.filter(function () {
                return this !== that;
            }).transition().style('opacity', function () {
                return opacity;
            });
        };
    }

    function addInteractions ( components ) {
        components.rects.on('mouseover', hover(0.3, components.rects));
        components.rects.on('mouseout', hover(1, components.rects));
    }

    // --------------------------------- PUT HERE ALL THE GLOBAL VARIABLES AND FUNCTIONS THAT DON'T NEED TO ACCESS PROPS AND INNERPROPS THROUGH SCOPE (Z1)



    // --------------------------------- END OF Z1
    return function(user_props) {
        var props = {
            width: 300,
            height: 400,
            data: null,
            buckets: null,
            measureLabel: null, // function
            formatNumber: null, // function
            isInteractionDisabled: false,
            bins: {
              count: "auto",
              thresholds: [],
              color: "steelblue",
              labels: {
                format: "auto",
                font: "12px sans-serif",
                color: "black"
              }
            },
            xaxis: {
              title: {
                font: "14px sans-serif",
                color: "black"
              },
              labels: {
                format: "auto",
                font: "12px sans-serif",
                color: "black"
              }
            },
            yaxis: {
            title: {
              font: "14px sans-serif",
              color: "black"
            },
            labels: {
              format: "auto",
                font: "12px sans-serif",
                color: "black"
              }
            },
            tooltips: {
              enabled: true
            }
        };

        var innerProps = {
            pad: 5,
            axisTickLength: 5,
            margins: {
              top: 5,
              right: 5,
              bottom: 5,
              left: 5
            }
        };

        // ---------------------------------- INTERNAL FUNCTIONS THAT NEED ACCESS TO PROPS AND INNERPROPS THROUGH SCOPE GO HERE (Z2)

        // ---------------------------------- END OF Z2
        copyIfExisty(props, user_props || {});

        function createAccessor(attr) {
            function accessor(value) {
                if (!arguments.length) {
                    return props[attr];
                }
                props[attr] = value;
                return chart;
            }
            return accessor;
        }

        function chart(selection) {
            var group_main = selection
                .append('g')
                .classed('group-main', true);


            var layout = buildLayout(props, innerProps);
            //render
            var components = render( group_main, layout, props );
            //interactions
            if (!props.isInteractionDisabled) {
              addInteractions(components);
            }
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
