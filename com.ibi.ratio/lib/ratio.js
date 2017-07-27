/* jshint eqnull:true*/
/* globals d3*/

var tdg_ratio = (function() {

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

    function getUniqueLabelValues ( data ) {
        return data.reduce(function (max, cur) {
            if ( cur.x != null && map.x.indexOf(cur.x) >= 0 ) {
                map.xaxis.push(cur.x);
            }
            if ( cur.y != null && map.y.indexOf(cur.y) >= 0 ) {
                map.yaxis.push(cur.y);
            }
            if ( cur.type != null && map.type.indexOf(cur.type) >= 0 ) {
                map.type.push(cur.y);
            }
            return map;
        }, { xaxis:[], yaxis:[], type: [] });
    }

    function extractUniqueValues (data, attr) {
        return data.reduce(function (all, cur) {
            return cur[attr] != null && all.indexOf(cur[attr]) ? all.concat(cur[attr]) : all;
        }, []);
    }

    function calcMargins (data, props, innerProps ) {
        var margins = { top: 10, right: 10, bottom: 10, left: 10 };

        var pad = innerProps.labelsPad || 5;

        //var axesLbls = getUniqueAxesValues( props.data );
        //xaxis starts
        var xaxisLbls = extractUniqueValues(data, 'x');

        var xaxisMaxLblWidth = d3.max(xaxisLbls, function (lbl) {
            return props.measureLabel(lbl, props.axes.category.labels.font).width;
        }) + 2 * pad;

        var xaxisHorizSize = xaxisMaxLblWidth + 2 * pad;

        margins.left = Math.max(margins.left, xaxisHorizSize);

        // top/bottom axis starts
        margins.top = margins.bottom = props.measureLabel('L', props.axes.ratio.labels.font).height + innerProps.whiskersSize  + 3 * pad;
        // top/bottom axis ends

        return margins;
    }

    function getNumericScale ( length, max, isReverse ) {
        var range = ( isReverse ) ? [0, -length] : [0, length];

        return d3.scale.linear().domain([0, max]).range(range).nice();
    }

    function getYAxisLayout ( data, margins, props, innerProps ) {
        var layout = {
            x : margins.left,
            y : props.height - margins.bottom,
            maxRangeValue: 0,
            types : [],
            axes : [],
            reversedAxisIdx: 1,
            origin: 0,
            pos : null
        };

        var width = props.width - margins.left - margins.right;

        var values = [], scales = [];

        var isDoubleSeires = data.some(function(d){ return d.type != null; });

        data.forEach( function ( d ) {
            var idx = isDoubleSeires ? layout.types.indexOf(d.type) : 0;
            if ( idx < 0 ) {
                idx = layout.types.push(d.type) - 1;
            }

            if ( !values[idx] ) {
                values[idx] = [];
            }

            values[idx].push(d.y);
        });

        values = values.slice(0, 2); // we can't have more than two series

        var max = d3.max(values, function (series) {
            return d3.max(series);
        });

        var maxLbl = props.formatNumber(max, props.axes.y.labels.format);

        var maxLblWidth = props.measureLabel(maxLbl, props.axes.y.labels.font).width;

        var axisLength = ( ( values.length > 1 ) ? width / 2 : width ) - maxLblWidth / 2 - innerProps.labelsPad;


        values.map(function (series, idx) {
            layout.axes[idx] = {
                scale: getNumericScale( axisLength, max, idx === layout.reversedAxisIdx )
            };
        });

        var formatConfig = {
            max: max,
            min: 0
        };

        var labels = layout.axes[0].scale.ticks().map(function (val) {
            return props.formatNumber(val, props.axes.y.labels.format, formatConfig);
        });
        // set axis labels and position
        layout.axes.forEach(function (axis, idx) {
            axis.labels = labels;
            axis.y = 0;
            axis.x = ( isDoubleSeires ) ? axisLength : 0;
        });

        layout.origin = isDoubleSeires ? axisLength : 0;

        layout.pos = function (d) {
            var idx = isDoubleSeires ? layout.types.indexOf(d.type) : 0;
            return layout.origin + layout.axes[idx].scale(d.y);
        };

        layout.maxRangeValue = (isDoubleSeires) ? layout.origin + layout.axes[0].scale.range()[1] : layout.axes[0].scale.range()[1];

        return layout;
    }

    function getXAxisLayout ( data, margins, props ) {
        var layout = {
            x : margins.left,
            y : margins.top,
            labels : [],
            bandWidth: 0,
            gridLinesPos: [],
            gridLinesWidth: 0,
            pos: null
        };

        var height = props.height - margins.top - margins.bottom;
        var labels = data.map(function (d) {
            return d.x;
        });

        var innerPaddingRatio = 0.2;

        layout.pos = d3.scale.ordinal().domain(labels).rangeBands([height, 0], innerPaddingRatio );

        layout.bandWidth = layout.pos.rangeBand();

        var domain = layout.pos.domain();

        var offset;
        if ( domain.length > 2 ) {
            offset = ( layout.pos(domain[1]) - layout.pos(domain[2]) - layout.bandWidth ) / 2;
        } else {
            offset = ( layout.pos(domain[0]) - layout.pos(domain[1]) - layout.bandWidth ) / 2;
        }

        domain.forEach(function ( lbl, idx ) {
            if ( idx !== 0 ) {
                layout.gridLinesPos.push( layout.pos(lbl) + layout.bandWidth + offset );
            }
        });

        return layout;
    }

    function getData (dataset) {
        return dataset.filter(function (d) { return d.x != null && d.y != null; });
    }

    function contrast (r, g, b) {
        var rgb = [ r/255, g/255, b/255 ];
        for ( var i = 0; i < rgb.length; ++i ) {
            if ( rgb[i] <= 0.03928 ) {
                rgb[i] = rgb[i] / 12.92;
            } else {
                rgb[i] = Math.pow( ( rgb[i] + 0.055 ) / 1.055, 2.4);
            }
        }
        var l = 0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2];
        return (l > 0.179) ? "#000" : "#FFF";
    }

    function labelColor (d) { // we want lbl color to have a contrast with the background
        var color = d3.select(this.parentNode)
            .select('circle')
            .style('fill');

        var rgb = d3.rgb(color);
        return contrast(rgb.r, rgb.g, rgb.b);
    }

    function getCanvasLayout ( data, margins, props, yscale, xaxisLayout ) {
        var layout = {
            x : margins.left,
            y : margins.top,
            width: props.width - margins.left - margins.right,
            height: props.height - margins.top - margins.bottom,
            rects : []
        };

        var xpos = xaxisLayout.pos, // ordinal axis position. In this case vertical position
            bandWidth = xaxisLayout.bandWidth;

        var center = ( props.width - margins.left - margins.right ) / 2;

        var rect;

        var extent = d3.extent(data, function (d) { return d.y; });

        var config = {
            min: extent[0],
            max: extent[1]
        };


        data.forEach( function ( d, idx ) {
            rect = {};

            rect.width = yscale(d.y);
            rect.x = center - rect.width / 2;
            rect.y = xpos(d.x);
            rect.height = bandWidth;

            rect.class = d.elClassName;

            if ( Array.isArray(props.risers.colorSeries) ) {
              rect.color = props.risers.colorSeries[idx];
            } else {
              rect.color = props.risers.color;
            }

            var rgb = d3.rgb( rect.color );
            var lblColor = contrast(rgb.r, rgb.g, rgb.b);
            
            rect.label = {
                text: props.formatNumber(d.y, props.risers.label.format, config),
                color: lblColor,
                x: rect.width / 2,
                y: rect.height / 2
            };

            if ( props.measureLabel(rect.label.text, props.risers.label.font).width > rect.width ) {
                rect.label.text = '';
            }


            rect.tooltip = {};

            for ( var key in props.buckets ) {
                if (props.buckets.hasOwnProperty(key)) {
                    var values = ( Array.isArray( d[key] ) ) ? d[key] : [ d[key] ];
                    props.buckets[key].forEach(function (name, idx) {
                        rect.tooltip[name] = values[idx];
                    });
                }
            }

            layout.rects.push(rect);
        });

        return layout;
    }

    function getTypeLabelsLayout ( margins, yaxisLayout ) {
        var layout = {
            x: margins.left,
            y: margins.top,
            labels: []
        };

        if ( yaxisLayout.types.length !== 2 ) return layout;

        var domain = yaxisLayout.axes[0].scale.domain();

        var half = ( domain[1] - domain[0] ) / 2;

        yaxisLayout.types.forEach(function ( type, idx ) {
            var label = {};
            label.text = type;

            var yaxis = yaxisLayout.axes[idx];

            label.x = yaxis.x + yaxis.scale(half);

            layout.labels.push(label);
        });

        return layout;
    }

    function getRatioAxesLayout ( data, scale, margins, props, innerProps ) {
        var width = props.width - margins.left - margins.right;

        var pad = innerProps.labelsPad;

        var layout = {
            top: {
                x: margins.left + width / 2,
                y: pad,
                label: {
                    text: null
                },
                lines: []
            },
            bottom: {
                x: margins.left + width / 2,
                y: props.height - margins.bottom + pad,
                label: {
                    text: null,
                    y: 0
                },
                lines: []
            }
        };

        var lblHeight = props.measureLabel('L', props.axes.ratio.labels.font).height;

        var topAxisDatum = data[data.length - 1],
            bottomAxisDatum = data[0];

        var topAxisHorizSize = scale( topAxisDatum.y );



        var topHorizLineOffset = innerProps.whiskersSize / 2 + lblHeight;

        layout.top.lines.push({
            x1: -topAxisHorizSize/2,
            y1: topHorizLineOffset + pad,
            x2: topAxisHorizSize/2,
            y2: topHorizLineOffset + pad
        });

        layout.top.lines.push({
            x1: -topAxisHorizSize/2,
            y1: lblHeight + pad,
            x2: -topAxisHorizSize/2 ,
            y2: lblHeight + innerProps.whiskersSize + pad
        });

        layout.top.lines.push({
            x1: topAxisHorizSize/2,
            y1: lblHeight + pad,
            x2: topAxisHorizSize/2,
            y2: lblHeight + innerProps.whiskersSize + pad
        });

        layout.top.label.y = lblHeight;

        var bottomAxisHorizSize = scale( bottomAxisDatum.y );
        var bottomHorizLineOffset = innerProps.labelsPad + innerProps.whiskersSize / 2;

        layout.bottom.lines.push({
            x1: -bottomAxisHorizSize/2,
            y1: bottomHorizLineOffset,
            x2: bottomAxisHorizSize/2,
            y2: bottomHorizLineOffset
        });

        layout.bottom.lines.push({
            x1: -bottomAxisHorizSize/2,
            y1: innerProps.labelsPad,
            x2: -bottomAxisHorizSize/2,
            y2: innerProps.labelsPad + innerProps.whiskersSize
        });

        layout.bottom.lines.push({
            x1: bottomAxisHorizSize/2,
            y1: innerProps.labelsPad,
            x2: bottomAxisHorizSize/2,
            y2: innerProps.labelsPad + innerProps.whiskersSize
        });

        layout.bottom.label.y = innerProps.labelsPad + innerProps.whiskersSize / 2 + lblHeight + pad;
        var ratio, res;
        if ( topAxisDatum.y > bottomAxisDatum.y ) {
            layout.top.label.text = '100%';
            ratio = bottomAxisDatum.y / topAxisDatum.y;
            if ( ratio * 100 < 1 ) {
                res = (ratio * 100).toFixed(2);
            } else {
                res = parseInt( ratio * 100, 10 );
            }
            layout.bottom.label.text = res + '%';
        } else {
            layout.bottom.label.text = '100%';
            ratio = topAxisDatum.y / bottomAxisDatum.y;
            if ( ratio * 100 < 1 ) {
                res = (ratio * 100).toFixed(2);
            } else {
                res = parseInt( ratio * 100, 10 );
            }
            layout.top.label.text = res + '%';
        }

        return layout;
    }

    function getRatioScale (data, width, margins, maxBarRatio) {
        var canvasWidth = width - margins.left - margins.right;
        var domain = d3.extent(data, function (d) { return d.y; });
        var minToMaxRatio = domain[0] / domain[1];

        return d3.scale.linear().domain(domain).range([canvasWidth * maxBarRatio * minToMaxRatio, canvasWidth * maxBarRatio]);
    }

    function buildLayout ( props, innerProps ) {
        var layout = {
            margins: null,
            yaxis: null,
            xaxis: null,
            canvas: null,
            ratioAxes: null
        };

        var data = getData(props.data);

        layout.margins = calcMargins( data, props, innerProps );

        layout.x = getXAxisLayout( data, layout.margins, props );

        var rscale = getRatioScale(data, props.width, layout.margins, innerProps.bars.maxBarRatio);

        layout.ratioAxes = getRatioAxesLayout( data, rscale, layout.margins, props, innerProps );

        //layout.y = getYAxisLayout( data, layout.margins, props, innerProps );

        layout.canvas = getCanvasLayout ( data, layout.margins, props, rscale, layout.x );

        //layout.typeLabels = getTypeLabelsLayout( layout.margins, layout.y );

        return layout;
    }

    function buildToolTip (d) {
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

        var x_axis = group_main.selectAll('g.x-axis')
            .data([layout.x]);

        var ordAxis = d3.svg.axis().scale(layout.x.pos).orient('left');

        var x_axis_enter = x_axis.enter().append('g').classed('x-axis', true)
            .attr({
                transform: function (l) {
                    return 'translate(' + [l.x, l.y] + ')';
                }
            })
            .style({
                font : props.axes.category.labels.font
            })
            .call(ordAxis);

        x_axis_enter.selectAll('g.tick > text').style({
            font: props.axes.category.labels.font,
            fill: props.axes.category.labels.color
        });

        var x_grid = x_axis.selectAll('line.grid')
            .data(layout.x.gridLinesPos);

        x_grid.enter().append('line').classed('grid', true)
            .attr({
                x0: 0,
                y1: function (d) {
                    return d;
                },
                x2: layout.canvas.width,
                y2: function (d) {
                    return d;
                },
            })
            .style({
                'stroke-dasharray': props.axes.category.grid['stroke-dasharray'],
                'stroke-width': props.axes.category.grid.width,
                stroke: props.axes.category.grid.color
            });

        ['top', 'bottom'].forEach(function (type) {
            var axisLayout = layout.ratioAxes[type];

            var axis = group_main.append('g').classed('y-axis-' + type, true)
                .attr('transform', 'translate(' + [axisLayout.x, axisLayout.y] + ')');

            var lbl = axis.append('text')
                .style({
                    fill: props.axes.ratio.labels.color,
                    'text-anchor': 'middle',
                    font: props.axes.ratio.labels.font
                })
                .attr('y', axisLayout.label.y)
                .text(axisLayout.label.text);

            axis.selectAll('line')
                .data(axisLayout.lines)
                .enter()
                .append('line')
                .attr({
                    x1: function (d) {
                        return d.x1;
                    },
                    y1: function (d) {
                        return d.y1;
                    },
                    x2: function (d) {
                        return d.x2;
                    },
                    y2: function (d) {
                        return d.y2;
                    }
                })
                .style('stroke', props.axes.ratio.base.color);

        });

        var canvas = group_main.append('g').classed('canvas', true)
            .attr('transform', 'translate(' + [ layout.canvas.x, layout.canvas.y ] + ')');

        var rect = canvas.selectAll('g.riser')
            .data(layout.canvas.rects);

        var rect_enter = rect.enter().append('g').classed('riser', true)
            .attr({
                transform: function (d) {
                    return 'translate(' + [d.x, d.y] + ')';
                },
                tdgtitle: buildToolTip
            })
            .style('fill', props.risers.color);

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

        rect_enter.append('text')
            .attr({
                y: function (d) {
                    return d.label.y;
                },
                x: function (d) {
                    return d.label.x;
                },
                dy: '.35em',
            })
            .style({
                fill: 'black',
                'text-anchor' : 'middle',
                font: props.risers.label.font,
                fill: function (d) {
                    return d.label.color;
                }
            })
            .text(function (d) {
                return d.label.text;
            });

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
          risers: {
            color: 'salmon',
            colorSeries: null,
            label: {
              font: '12px sans-serif',
              format: 'auto'
            }
          },
          axes: {
            category: {
              labels: {
                font: '12px sans-serif',
                color: 'black'
              },
              grid: {
                "stroke-dasharray" : "2 5",
                width: 1,
                color: "black"
              }
            },
            ratio: {
              labels: {
                font: '14px sans-serif',
                color: 'black'
              },
              base: {
                color: 'black'
              }
            }
          }
        };

        var innerProps = {
            labelsPad: 5,
            whiskersSize: 10,
            bars: {
                minBarRatio: 0.05,
                maxBarRatio: 0.8
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
