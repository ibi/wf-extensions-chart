/* jshint eqnull:true*/
/* globals d3*/

var tdg_pack = (function() {

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

    // --------------------------------- PUT HERE ALL THE GLOBAL VARIABLES AND FUNCTIONS THAT DON'T NEED TO ACCESS PROPS AND INNERPROPS THROUGH SCOPE (Z1)

    function jsonCopy (obj) {
        return JSON.parse(JSON.stringify(obj));
    }

    var _color_map_last_result;

    function getColorMap ( data, colors, useLastComputed ) {

        if ( _color_map_last_result && useLastComputed ) {
            return _color_map_last_result;
        }

        var uniqElements = data.map(function (d) {
            return d.color;
        }).reduce(function (colors, color) {
            return colors.indexOf(color) < 0 ? colors.concat(color) : colors;
        }, []);

        var map = {};
        uniqElements.forEach(function (key, idx) {
            if ( key === 'null' || key === 'undefind' ) {
                map[key] = 'none';
            } else {
                map[key] = colors[ idx % colors.length ];
            }
        });

        _color_map_last_result = map;

        return map;
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

    var _data_helper_last_result;

    function getDataHelper(data, useLastComputed) {
        if ( useLastComputed && _data_helper_last_result ) {
            return _data_helper_last_result;
        }

        _data_helper_last_result = {
            isDynamicSize: data.some(function(d) {
                return d.size;
            }),
            isDynamicColor: data.some(function(d) {
                return d.color;
            })
        };

        return _data_helper_last_result;
    }

    // --------------------------------- END OF Z1
    return function(user_props) {
        var props = {
            width: 300,
            height: 400,
            data: null,
            buckets: null,
            measureLabel: null,
            isInteractionDisabled: false,
            onRenderComplete: function() {},
            circles: {
                colors: ["#4087b8","#e31a1c","#9ebcda","#c994c7","#41b6c4","#49006a","#ec7014","#a6bddb","#67001f","#800026","#addd8e","#e0ecf4","#fcc5c0","#238b45","#081d58","#d4b9da","#2b8cbe","#74a9cf","#41ab5d","#fed976","#ce1256","#7f0000","#a6bddb","#ffffcc","#e7e1ef","#016c59","#f7fcfd","#99d8c9","#fff7fb","#ffffe5","#fdd49e","#ffffd9","#fe9929","#8c96c6","#810f7c","#993404","#c7e9b4","#bfd3e6","#e7298a","#7fcdbb","#3690c0","#ae017e","#d9f0a3","#ece2f0","#014636","#f7fcb9","#66c2a4","#fff7bc","#f7fcf0","#e5f5f9","#fdbb84","#fa9fb5","#4d004b","#fff7fb","#cc4c02","#78c679","#1d91c0","#ccebc5","#feb24c","#b30000","#8c6bb1","#fec44f","#d0d1e6","#084081","#0868ac","#f7fcfd","#0570b0","#ef6548","#fff7ec","#006837","#f768a1","#edf8b1","#fee391","#238443","#ffffe5","#023858","#7a0177","#67a9cf","#dd3497","#980043","#88419d","#d0d1e6","#fc8d59","#4eb3d3","#fd8d3c","#fff7f3","#fc4e2a","#ccece6","#ece7f2","#a8ddb5","#41ae76","#bd0026","#e0f3db","#045a8d","#ffeda0","#253494","#7bccc4","#fde0dd","#00441b","#225ea8","#006d2c","#02818a","#f7f4f9","#d7301f","#df65b0","#662506","#3690c0","#004529","#fee8c8"],
                prioritizeSortByMeasure: true,
                labels: {
                    font : "12px sans-serif",
                    strategy : "resizeToFit" //"resizeToFit", "truncateToFit"
                },
                padding: 1
            },
            legend: {
                enabled: true,
                title: {
                    font: '14px sans-serif'
                },
                labels: {
                    font: '12px sans-serif'
                }
            },
            hover: {
                stroke: 'grey',
                'stroke-width': 3
            },
            toolTip: {
              enabled: true
            }
        };

        var innerProps = {

        };

        // ---------------------------------- INTERNAL FUNCTIONS THAT NEED ACCESS TO PROPS AND INNERPROPS THROUGH SCOPE GO HERE (Z2)

        function renderCircles ( circles_group, onRenderComplete ) {
            function byMeasure(a, b) {
                return b.value - a.value;
            }

            function byDimension(a, b) {
                if (a.color > b.color) {
                    return -1;
                } else if (b.color > a.color) {
                    return 1;
                } else {
                    return 0;
                }
            }

            function sort(a, b) {
                var res;
                if (a.sort_mes && b.sort_mes) { // add property to prioritize sort by measure or dimension
                    res = byMeasure(a, b);
                }
                if (!res && a.sort_dim && b.sort_dim) {
                    res = byDimension(a, b);
                }
                return res;
            }

            function getLabel(d) {
                var lbls = Array.isArray(d.labels) ? d.labels : [d.labels];
                var str = '';

                lbls.forEach(function(lbl, idx) {
                    if (idx) {
                        str += '<tspan dy="1em">';
                    } else {
                        str += '<tspan>';
                    }
                    str += lbl;
                    str += '</tspan>';
                });
                return str;
            }

            function buildAndPositionLabel ( d ) {
                var text = d3.select(this),
                    labels = jsonCopy(( Array.isArray(d.labels) ) ? d.labels : [d.labels]);

                var maxLblsHeight = Math.sqrt( 2 * Math.pow(d.r, 2) );
                var lineHeight = props.measureLabel('W', props.circles.labels.font).height;

                while ( labels.length * lineHeight > maxLblsHeight ) {
                    labels.pop();
                }

                var lblsHeight = labels.length * lineHeight;

                var maxLblsWidth = 2 * Math.sqrt( Math.pow(d.r, 2) - Math.pow(lblsHeight / 2, 2) );

                var len = labels.length;

                while ( len-- ) {
                    if ( props.measureLabel( labels[len], props.circles.labels.font ).width > maxLblsWidth ) {
                        labels.splice(len, 1);
                    }
                }

                lblsHeight = labels.length * lineHeight;

                labels.forEach(function (label, i) {
                    text.append('tspan')
                        .attr('dy', '1em')
                        .attr('x', 0)
                        .text(label);
                });

                // ---------- position ------------
                text.attr('transform' , 'translate(' + [0, -lblsHeight / 2] + ')');
            }

            function labelColor (d) { // we want lbl color to have a contrast with the background
                var color = d3.select(this.parentNode)
                    .select('circle')
                    .style('fill');

                var rgb = d3.rgb(color);
                return contrast(rgb.r, rgb.g, rgb.b);
            }

            function buildToolTipStr ( buckets ) {

                var keys = ['labels', 'color', 'size'];

                return function ( d ) {
                    var str = '<div style="padding:5px">';
                    var gi = 0;
                    keys.forEach(function (key) {
                        if ( d[key] ) {
                            var values = (Array.isArray(d[key])) ? d[key] : [d[key]];
                            values.forEach(function (value, vidx) {
                                if (gi) {
                                    str += '<br/>';
                                }
                                str += '<b>' + buckets[key][vidx] + ': </b>';
                                str += value;
                                // update gi
                                gi++;
                            });
                        }
                    });

                    str += '</div>';

                    return str;
                };
            }

            var dataHelper = getDataHelper(props.data);

            var colorMap = (dataHelper.isDynamicColor) ? getColorMap(props.data, props.circles.colors) : null;

            var data = ( dataHelper.isDynamicSize ) ? props.data.filter(function(d){ return d.size != null; }) : props.data;

            var scale;
            if ( dataHelper.isDynamicSize ) {
                var extent = d3.extent(data, function(d){ return d.size; });
                scale = ( extent[0] * extent[1] < 0  ) ? d3.scale.linear().domain(extent).range([0.01, Math.abs(extent[1] - extent[0])]) : d3.scale.linear().domain(extent).range(extent);
            }

            var pack = d3.layout.pack()
                .sort(sort)
                .value(function(d) {
                    return scale ? scale(d.size) : 1; // scale is not null if dataHelper.isDynamicSize is true
                })
                .size([props.width, props.height])
                .padding(props.circles.padding);

            var pack_data = pack.nodes({
                children: props.data
            }).slice(1).filter(function (d) {
                return d.r > 0;
            });

            var node = circles_group.selectAll('g.node')
                .data(pack_data)
                .enter().append('g').classed('node', true)
                .attr({
                    tdgtitle: buildToolTipStr( props.buckets ),
                    transform: function(d) {
                        return 'translate(' + [d.x, d.y] + ')';
                    }
                })
                .style('opacity', 0);

            var invokeAfterTwo = getInvokeAfter(onRenderComplete, 2);

            if ( props.isInteractionDisabled ) {
              node.style('opacity', 1);
              invokeAfterTwo();
            } else {
              node.transition()
                  .duration(700)
                  .style('opacity', 1)
                  .call(getOnAllTransitionComplete(invokeAfterTwo));
            }


            node.append('circle')
                .attr('r', function(d) {
                    return d.r;
                })
                .style({
                    fill: colorMap ? function(d) { return colorMap[d.color]; } : '#00c9d3'
                });

            node.append('text')
                .style({
                    font: props.circles.labels.font,
                    'text-anchor': 'middle',
                    fill: labelColor,
                    corsor: 'default'
                })
                .each(buildAndPositionLabel);

            var hover = props.hover;

            if ( !props.isInteractionDisabled ) {
              node.on('mouseenter', function () {
                  var circle = d3.select(this).select('circle');

                  circle.attr({
                      stroke: hover.stroke,
                      'stroke-width': hover['stroke-width']
                  });

              }).on('mouseleave', function () {
                  var circle = d3.select(this).select('circle');

                  circle.attr({
                      stroke: null,
                      'stroke-width': null
                  });
              });
            }

            invokeAfterTwo();
        }

        function renderLegend ( legends_group, width, height, colorMap, title, widthRatio, props ) {
            var labels = [];

            for ( var label in colorMap ) {
                if ( colorMap.hasOwnProperty(label) ) {
                    labels.push(label);
                }
            }

            var labelsDims = labels.map(function (lbl) {
                return props.measureLabel(lbl, props.labelsFont); // <------<<< add legend label font to properties.js
            });

            var titleDims = props.measureLabel(title, props.titleFont); // <------<<< add legend title font to properties.js

            var pad = 5;

            var markerDiameter = labelsDims[0].height * 0.8;

            var maxContentWidth = Math.max(d3.max(labelsDims, function(d){ return d.width; }) + markerDiameter + 3 * pad, titleDims.width + 2 * pad) + pad; // last pad is for offset

            var legendHorizSpace = Math.min( maxContentWidth, widthRatio * width );
            var legendWidth = legendHorizSpace - pad;

            var legendHeight = d3.sum(labelsDims, function (d) { return d.height; }) + titleDims.height + 3 * pad;

            var x = width - legendHorizSpace,
                y = (height - legendHeight) / 2;

            var color_legend_group = legends_group.selectAll('g.color-legend')
                .data([{}]);

            color_legend_group
                .enter().append('g')
                .classed('color-legend', true)
                .attr('transform', 'translate(' + [x, y] + ')');

            color_legend_group.append('rect')
                .attr({
                    width: legendWidth,
                    height: legendHeight,
                    rx: 2,
                    ry: 2
                })
                .style({
                    stroke: 'grey',
                    'stroke-width': 1,
                    fill: '#fff'
                });

            color_legend_group.append('text').classed('title', true)
                .attr({
                    dy: '1em',
                    'text-anchor': 'middle',
                    x: legendWidth / 2,
                    y: pad
                })
                .style({
                    fill: '#000',
                    font: props.titleFont
                })
                .text(title);

            var lblGroupTopOffset = 2 * pad + titleDims.height;

            var labels_group = color_legend_group.append('g')
                .classed('labels', true)
                .style({
                    fill: '#000',
                    font: props.labelsFont
                })
                .attr('transform', 'translate(' + [pad, lblGroupTopOffset] + ')');

            labels.forEach(function ( lbl, idx ) {
                var lg = labels_group.append('g');

                lg.attr('transform', 'translate(' + [0, idx * labelsDims[0].height ] + ')');

                lg.append('text')
                    .text(lbl)
                    .attr({
                        dy: '1em',
                        x: markerDiameter + pad
                    });

                lg.append('circle')
                    .attr({
                        r: markerDiameter / 2,
                        cy: labelsDims[0].height / 2,
                        cx: markerDiameter / 2//pad + markerDiameter / 2
                    })
                    .style('fill', colorMap[lbl]);
            });
        }

        function render (group_main) {

            var invokeAfterTwo = getInvokeAfter(props.onRenderComplete, 2);

            var circles_group = group_main.append('g').classed('circles', true);
            renderCircles(circles_group, invokeAfterTwo);

            var dataHelper = getDataHelper(props.data, true);

            if ( props.legend.enabled && dataHelper.isDynamicColor && props.buckets.color ) {
                var legends_group = group_main.append('g');
                renderLegend(legends_group, props.width, props.height, getColorMap(props.data, props.circles.colors, true), props.buckets.color[0], 0.3, {
                    titleFont: props.legend.title.font,
                    labelsFont: props.legend.labels.font,
                    measureLabel: props.measureLabel
                });
            }

            invokeAfterTwo();
        }

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
            var group_main = selection.append('g').classed('group-main', true);
            render(group_main);
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
