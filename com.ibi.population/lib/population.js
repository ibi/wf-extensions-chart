/* jshint eqnull:true*/
/* globals d3*/

var tdg_population = (function() {

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
        //xaxis starts
        var xaxisLbls = extractUniqueValues(data, 'x');

        var xaxisMaxLblWidth = d3.max(xaxisLbls, function (lbl) {
            return props.measureLabel(lbl, props.axes.x.labels.font).width;
        }) + 2 * pad;

        var xaxisHorizSize = xaxisMaxLblWidth + 2 * pad;

        margins.left = Math.max(margins.left, xaxisHorizSize);
        //xaxis ends
        //yaxis starts
        var yaxisLblsHeight = props.measureLabel('L', props.axes.y.labels.font).height; // all yaxis labels will have the same height

        var yaxisVertSize = yaxisLblsHeight + 2 * pad;

        margins.bottom = Math.max(margins.bottom, yaxisVertSize);
        //yaxis ends
        //type lbls starts
        if ( data.some(function(d){ return d.type; }) ) {
            var typeLblsHeight = props.measureLabel('L', props.typeLabels.font).height; // all type labels will have the same height        
            var typeLblsVertsize = typeLblsHeight + 2 * pad;

            margins.top = Math.max(margins.top, typeLblsVertsize);
        }

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

        var offset = ( layout.pos(domain[1]) - layout.pos(domain[2]) - layout.bandWidth ) / 2;

        domain.forEach(function ( lbl, idx ) {
            if ( idx !== 0 ) {
                layout.gridLinesPos.push( layout.pos(lbl) + layout.bandWidth + offset );
            }
        });

        return layout;
    }

    function getData (dataset) {

        function compare ( a, b ) {
            if ( a.x == null || b.x == null ) {
                return 0;
            }

            var re1 = /\d+|[A-z]+/g,
                re2 = /\d+|[A-z]+/g;

            var w1, w2;

            var res = 0;

            while ( ( w1 = re1.exec(a.x) ) && ( w2 = re2.exec(b.x) ) && !res) {
                if ( !isNaN(w1[0]) && !isNaN(w2[0]) ) {
                    res = parseInt(w1[0], 10) - parseInt(w2[0], 10);
                } else {
                    res = ( w1 > w2 ) ? 1 : ( w1 < w2 ) ? -1 : 0;
                }
            }

            return res;
        }

        var data = dataset.slice().sort(compare);

        var isDoubleSeires = data.some(function (d) { return d.type != null; });

        data = data.filter(function (d) {
            return d.x != null && d.y != null && ( !isDoubleSeires || d.type != null );
        });

        return data;
    }

    function getCanvasLayout ( data, margins, props, yaxisLayout, xaxisLayout ) {
        var layout = {
            x : margins.left,
            y : margins.top,
            width: props.width - margins.left - margins.right,
            height: props.height - margins.top - margins.bottom,
            rects : []
        };

        var xpos = xaxisLayout.pos, // ordinal axis position. In this case vertical position
            bandWidth = xaxisLayout.bandWidth;

        var ypos = yaxisLayout.pos, // numeric axis position. In this case horizontal position
            rvrsdAxisIdx = yaxisLayout.reversedAxisIdx,
            types = yaxisLayout.types,
            y_origin = yaxisLayout.origin;

        var rect;
        data.forEach( function ( d ) {
            rect = {};

            var idx = ( types.length > 1 && d.type ) ? types.indexOf( d.type ) : 0;

            if ( rvrsdAxisIdx === idx ) {
                rect.x = ypos(d); // ypos takes obj with y attribute and also type attribute (if double series)
                rect.width = y_origin - ypos(d);
            } else {
                rect.x = y_origin;
                rect.width = ypos(d) - y_origin;
            }

            rect.y = xpos(d.x);
            rect.height = bandWidth;
            rect.color = props.colorBySeries[idx];

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

    function buildLayout ( props, innerProps ) {
        var layout = {
            margins: null,
            yaxis: null,
            xaxis: null
        };

        var data = getData(props.data);

        layout.margins = calcMargins( data, props, innerProps );

        layout.y = getYAxisLayout( data, layout.margins, props, innerProps );
        layout.x = getXAxisLayout( data, layout.margins, props, layout.y );
        
        layout.canvas = getCanvasLayout ( data, layout.margins, props, layout.y, layout.x );

        layout.typeLabels = getTypeLabelsLayout( layout.margins, layout.y );

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
        var type_labels = group_main.append('g').classed('type-labels', true)
            .attr('transform', 'translate(' + [layout.typeLabels.x, layout.typeLabels.y] + ')');

        var type_label = type_labels.selectAll('text')
            .data(layout.typeLabels.labels);

        type_label.enter()
            .append('text')
            .attr({
                x: function (d) {
                    return d.x;
                }
            })
            .style({
                'text-anchor': 'middle',
                font: props.typeLabels.font
            })
            .text(function (d) {
                return d.text;
            });

        var x_axis = group_main.selectAll('g.x-axis')
            .data([layout.x]);

        var ordAxis = d3.svg.axis().scale(layout.x.pos).orient('left')
            .innerTickSize(0);

        x_axis.enter().append('g').classed('x-axis', true)
            .attr({
                transform: function (l) {
                    return 'translate(' + [l.x, l.y] + ')';
                }
            })
            .style('font', props.axes.x.labels.font)
            .call(ordAxis);

        var x_grid = x_axis.selectAll('line.grid')
            .data(layout.x.gridLinesPos);

        x_grid.enter().append('line').classed('grid', true)
            .attr({
                x0: 0,
                y1: function (d) {
                    return d;
                },
                x2: layout.y.maxRangeValue,
                y2: function (d) {
                    return d;
                },
            })
            .style({
                'stroke-dasharray': '2 5'
            });

        var y_axes = group_main.append('g').classed('y-axes', true)
            .attr('transform', 'translate(' + [layout.y.x, layout.y.y] + ')');
            

        var y_axis = y_axes.selectAll('g.y-axis')
            .data(layout.y.axes);
        
        y_axis.enter().append('g').classed('y-axis', true)
            .attr({
                transform: function (l) {
                    return 'translate(' + [l.x, l.y] + ')';
                }
            })
            .style('font', props.axes.y.labels.font)
            .each(function ( l ) {
                //apply axis layout
                var axis = d3.svg.axis()
                    .scale( l.scale )
                    .tickFormat(function (d, i) {
                        return l.labels[i];
                    })
                    .orient('bottom');
                d3.select(this).call( axis );
            });

        var canvas = group_main.append('g').classed('canvas', true)
            .attr('transform', 'translate(' + [ layout.canvas.x, layout.canvas.y ] + ')');

        var rect = canvas.selectAll('rect')
            .data(layout.canvas.rects);

        var rect_enter = rect.enter().append('rect')
            .attr({
                y: function (d) {
                    return d.y;
                },
                x: function (d) {
                    return d.x;
                },
                width: function (d) {
                    return d.width;
                },
                height: function (d) {
                    return d.height;
                }
            })
            .style({
                fill : function (d) {
                    return d.color;
                }
            });

        if ( props.toolTip && props.toolTip.enabled ) {
            rect_enter.attr('tdgtitle', buildToolTip);
        }

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
            colorBySeries: ['#ffafbf', '#cce9f8'],
            typeLabels: {
                font: '14px sans-serif',
                color: '#000'
            },
            axes: {
                x: {
                    labels: {
                        font: '12px sans-serif',
                        color: '#000'
                    }
                },
                y: {
                    labels: {
                        font: '12px sans-serif',
                        format: 'auto'
                    }
                }
            },
            toolTip: {
                enabled: true
            }
        };

        var innerProps = {
            labelsPad: 5
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
                .classed('group-main', true)
                .style('opacity', 0);

            group_main.transition()
                .duration(500)
                .style('opacity', 1);

            var layout = buildLayout(props, innerProps);
            
            var components = render( group_main, layout, props );

            addInteractions(components);
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
