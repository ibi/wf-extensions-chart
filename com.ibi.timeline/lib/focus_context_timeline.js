/*jshint eqnull: true*/
/*globals d3*/
(function() {

    var tdg_context = (function() { // <---------------------------------------- CHANGE ME

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

        // --------------------------------- PUT HERE ALL THE GLOBAL VARIABLES AND FUNCTIONS THAT DON'T NEED TO ACCESS PROPS AND INNERPROPS THROUGH SCOPE (Z1)

        // it's importan to separate your layout calculation logic
        // from your rendering logic. This function should return
        // the object that represents the state of the component
        // and used by render function
        function buildLayout(props, innerProps) {
            var layout = {};

            layout.height = props.height;
            layout.x = props.scale;

            return layout;
        }

        // all of the elements of the component should go to group_main
        // use layout obj to render your component
        // do not calulate anything in this function! It's only for rendering
        // if you need to calculate s-g do it in buildLayout
        function render(selection, layout, props, innerProps) {
            var brush = d3.svg.brush()
                .x(layout.x)
                .on('brush', function() {
                    if (typeof props.onChange === 'function') {
                        props.onChange(brush.empty() ? layout.x.domain() : brush.extent());
                    }
                });

            selection.call(brush)
                .selectAll('rect')
                .attr('height', layout.height);
        }

        // --------------------------------- END OF Z1
        return function(user_props) {
            var props = {
                height: 100,
                scale: null,
                onChange: function(domain) {
                    console.log('context changed -> ', domain);
                }
            };

            var innerProps = {

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

                var layout = buildLayout(props, innerProps);

                render(selection, layout, props, innerProps);
            }

            /*add extra methods to chart object zone*/



            /*end of add extra methods to chart object zone*/

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


    /* jshint eqnull:true*/
    /* globals d3*/

    var tdg_timeline = (function() { // <---------------------------------------- CHANGE ME

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

        // --------------------------------- PUT HERE ALL THE GLOBAL VARIABLES AND FUNCTIONS THAT DON'T NEED TO ACCESS PROPS AND INNERPROPS THROUGH SCOPE (Z1)

        function parseDateStr (str) {
            var d = new Date(str);

            if ( !isNaN(d.getTime()) ) {
                return d.getTime();
            }

            return (new Date(str.match(/^(\d{2})(\d{2})(\d{4})/).slice(1).join('-') ) ).getTime();
        }

        function getTimeAxisDomain(data) {
            return data.reduce(function(domain, d) {
                domain[0] = (parseDateStr(d.start) < domain[0]) ? parseDateStr(d.start) : domain[0];
                domain[1] = (parseDateStr(d.end) > domain[1]) ? parseDateStr(d.end) : domain[1];
                return domain;
            }, [Infinity, -Infinity]);
        }

        function getIsWithinDomainFn(domain) {
            return function(d) {
                switch (true) {
                    //riser within domain
                    case (parseDateStr(d.start) >= domain[0] && parseDateStr(d.end) <= domain[1]):
                        return true;
                        //riser sticks from the beginning of domain
                    case (parseDateStr(d.start) < domain[0] && parseDateStr(d.end) > domain[0]):
                        return true;
                        //riser sticks from the end of domain
                    case (parseDateStr(d.start) < domain[1] && parseDateStr(d.end) > domain[1]):
                        return true;
                    default:
                        return false;
                }
            };
        }

        function hash(s) {
            var res = s.split('').reduce(function(a, b) {
                a = ((a << 5) - a) + b.charCodeAt(0);
                return a & a;
            }, 0);

            return Math.abs(res);
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

        function buildLayout(props, innerProps) {
            var layout = {
                    rowLabels: {},
                    rowBorders: {},
                    timeAxis: {},
                    canvas: {},
                    clip: {}
                },
                rightOffset = 10,
                topOffset = 5,
                pad = 5;

            var data = props.data;
            var timeAxisDomain;

            var isWithinDomain = getIsWithinDomainFn(innerProps.timeAxisScaleDomain);

            if (innerProps.timeAxisScaleDomain) {
                data = props.data.filter(isWithinDomain);
                timeAxisDomain = innerProps.timeAxisScaleDomain;
            } else {
                timeAxisDomain = getTimeAxisDomain(data);
                data = props.data;
            }

            // use props.data because even if riser got filtered out
            // we still want to have its raw rendered
            var rowNames = props.data.reduce(function(all, d) {
                return all.indexOf(d.task) < 0 ? all.concat(d.task) : all;
            }, []);

            var rowsDims = rowNames.map(function(name) {
                return props.measureLabel(name, props.rows.labels.font);
            });

            var rowsPanelWidth = d3.max(rowsDims, function(d) {
                return d.width;
            }) + 2 * pad;

            var timeAxisPanelHeight = props.measureLabel('W', props.timeAxis.labels.font).height + 2 * pad;

            // row labels

            layout.rowLabels.labels = rowNames;
            layout.rowLabels.y = topOffset;
            layout.rowLabels.width = rowsPanelWidth;
            layout.rowLabels.height = props.height - timeAxisPanelHeight - topOffset;

            layout.rowLabels.scale = d3.scale.ordinal()
                .domain(rowNames).rangeBands(
                    [layout.rowLabels.height, 0]
                );

            // time axis

            layout.timeAxis.x = rowsPanelWidth;
            layout.timeAxis.y = props.height - timeAxisPanelHeight;
            layout.timeAxis.height = timeAxisPanelHeight;
            layout.timeAxis.width = props.width - rowsPanelWidth - rightOffset;

            layout.timeAxis.scale = d3.time.scale()
                .domain(timeAxisDomain)
                .range([0, layout.timeAxis.width]);

            // row borders

            layout.rowBorders.x = layout.timeAxis.x;
            layout.rowBorders.y = layout.rowLabels.y;

            layout.rowBorders.borders = [];

            rowNames.forEach(function(name, idx, arr) {
                if (idx === arr.length - 1) return; // skip the first one

                var y = layout.rowLabels.scale(name);

                layout.rowBorders.borders.push({
                    x1: 0,
                    y1: y,
                    x2: layout.timeAxis.width,
                    y2: y
                });
            });


            // canvas

            layout.canvas.x = layout.timeAxis.x;
            layout.canvas.y = topOffset;
            layout.canvas.height = layout.rowLabels.height;
            layout.canvas.width = layout.timeAxis.width;

            // clip

            layout.clip.width = layout.canvas.width;
            layout.clip.height = layout.canvas.height;

            // risers

            var riserHeight = layout.rowLabels.scale.rangeBand() * 0.8;
            var riserVertOffset = (layout.rowLabels.scale.rangeBand() * 0.2) / 2;

            var x = layout.timeAxis.scale,
                y = layout.rowLabels.scale,
                start, end;

            var colors = innerProps.colors;

            function getToolTipBuilder (buckets) {
                var keys = ['task', 'subtask', 'start', 'end'];
                return function (d) {
                    var t = []; // finish

                    keys.forEach(function (key) {
                        (buckets[key] || []).forEach(function (bkt_name, idx) {
                            t.push({
                                key: bkt_name,
                                value: d[key]
                            });
                        });
                    });
                    return t;
                };
            }

            var toolTipBuilder = getToolTipBuilder(props.buckets);

            layout.canvas.risers = data.filter(function (d) {
                start = x( parseDateStr(d.start) );
                end = x( parseDateStr(d.end) );
                return ( end - start ) > 0;
            }).map(function(d) {
                start = x( parseDateStr(d.start) );
                end = x( parseDateStr(d.end) );

                var riser = {
                    tooltip: toolTipBuilder(d),
                    x: start,
                    y: y(d.task) + riserVertOffset,
                    width: end - start,
                    height: riserHeight,
                    fill: colors[hash(d.task) % colors.length]
                };
                // subtask string is used as a label
                var lblDim = props.measureLabel(d.subtask || d.task, props.risers.labels.font);

                if ( lblDim.width + 2 * pad < riser.width && lblDim.height + 2 * pad < riser.height ) {
                    var clr = d3.rgb(riser.fill);
                    riser.label = {
                        text: d.subtask || d.task,
                        x: riser.width / 2,
                        y: riser.height / 2,
                        fill: contrast(clr.r, clr.g, clr.b)
                    };
                }

                return riser;
            });

            return layout;
        }

        function render(group_main, layout, props, innerProps) {
            
            var clip_area_id = parseInt(Math.random() * 10000000, 10);

            group_main.append('clipPath')
                .attr('id', clip_area_id)
                .append('rect')
                .attr(layout.clip);

            var canvas_group = group_main.append('g')
                .classed('canvas', true)
                .attr('clip-path', 'url(#' + clip_area_id + ')')
                .attr('transform',
                    'translate(' + [layout.canvas.x, layout.canvas.y] + ')'
                );

            var rows_group = group_main.append('g')
                .classed('rows', true)
                .attr('transform',
                    'translate(' + [0, layout.rowLabels.y] + ')'
                );

            var time_axis_group = group_main.append('g')
                .classed('time-axis', true)
                .attr('transform',
                    'translate(' + [layout.timeAxis.x, layout.timeAxis.y] + ')'
                );

            var row_labels = rows_group.selectAll('text.label')
                .data(layout.rowLabels.labels);

            row_labels.enter()
                .append('text').classed('row-label', true)
                .attr({
                    dy: '.35em',
                    x: layout.rowLabels.width - 5,
                    y: function(lbl) {
                        var scale = layout.rowLabels.scale;
                        return scale(lbl) + scale.rangeBand() / 2;
                    }
                })
                .style({
                    'text-anchor': 'end',
                    font: props.rows.labels.font,
                    fill: props.rows.labels.color
                })
                .text(function(lbl) {
                    return lbl;
                });

            var row_borders = group_main.append('g')
                .classed('row-borders', true)
                .attr('transform',
                    'translate(' + [layout.rowBorders.x, layout.rowBorders.y] + ')'
                );

            var border = row_borders.selectAll('line.row-border')
                .data(layout.rowBorders.borders);

            border.enter().append('line')
                .classed('row-border', true)
                .each(function(d) {
                    d3.select(this).attr(d);
                });

            var timeAxis = d3.svg.axis()
                .orient('bottom')
                .scale(layout.timeAxis.scale)
                .ticks(6)
                .tickPadding(5);

            time_axis_group.call(timeAxis);

            time_axis_group.selectAll('text')
                .style({
                    font: props.timeAxis.labels.font,
                    fill: props.timeAxis.labels.color
                })
                .classed('axis-label', true);

            var riser_lbl_groups = canvas_group.selectAll('g.riser-lbl-group')
                .data(layout.canvas.risers);

            var riser_lbl_groups_enter = riser_lbl_groups.enter().append('g')
                .classed('riser-lbl-group', true)
                .attr('transform',  function (d) {
                    return 'translate(' + [d.x, d.y] + ')';
                });
            
            function getTDGTitleHTML ( tooltip ) {
                var lstIdx = tooltip.length - 1;
                return tooltip.reduce(function ( str, cur, idx ) {
                    if ( idx ) {
                        str += '<br/>';
                    }
                    str += '<b>' + cur.key + ': </b>';
                    str += cur.value;
                    if ( lstIdx === idx ) {
                        str += '</div>';
                    }
                    return str;
                }, '<div style="padding:5px">');

            }

            riser_lbl_groups_enter.append('rect')
                .each(function (d) {
                    var riser = d3.select(this).attr({
                        width: d.width,
                        height: d.height,
                        fill: d.fill
                    });

                    if ( Array.isArray(d.tooltip) && d.tooltip.length ) {
                        riser.attr('tdgtitle', getTDGTitleHTML(d.tooltip) );
                    }

                });

            riser_lbl_groups_enter.on('mouseover', function () {
                d3.select(this).select('rect').style('stroke', 'black');
                canvas_group.node().appendChild(d3.select(this).node());
                
            }).on('mouseout', function () {
                d3.select(this).select('rect').style('stroke', null);
            });

            riser_lbl_groups_enter.filter(function (d) {
                return d.label != null;
            })
            .append('text')
                .each(function (d) {
                    d3.select(this).attr({
                        x: d.label.x,
                        y: d.label.y,
                        dy: '.35em'
                    }).style({
                        'text-anchor': 'middle',
                        fill: d.label.fill,
                        font: props.risers.labels.font
                    });
                })
                .text(function (d) {
                    return d.label.text;
                });

            if (props.context.enabled) {
                group_main.append('g')
                    .attr(
                        'transform',
                        'translate(' + [layout.canvas.x, layout.canvas.y] + ')'
                    )
                    .classed('context', true)
                    .call(
                        tdg_context({
                            height: layout.canvas.height,
                            scale: layout.timeAxis.scale,
                            onChange: function(domain) {
                                if (typeof props.onContextChange === 'function') {
                                    props.onContextChange(domain);
                                }
                            }
                        })
                    );
            }

        }

        // --------------------------------- END OF Z1
        return function(user_props) {
            var props = {
                width: 300,
                height: 400,
                data: null,
                measureLabel: null,
                context: {
                    enabled: false
                },
                buckets: {
                    task: null,
                    subtask: null,
                    start: null,
                    end: null
                },
                onContextChange: function(domain) {

                },
                rows: {
                    labels: {
                        font: '12px sans-serif',
                        color: 'black'
                    }
                },
                timeAxis: {
                    labels: {
                        font: '10px sans-serif',
                        color: 'black'
                    }
                },
                risers: {
                    labels: {
                        enabled: false,
                        font: '12px sans-serif',
                        color: 'black'
                    },
                    tdgtitle: {
                        enabled: false
                    }
                }
            };

            var innerProps = {
                timeAxisScaleDomain: null,
                colors: ["#1f77b4", "#ff7f0e", "#2ca02c", "#d62728", "#9467bd", "#8c564b", "#e377c2", "#7f7f7f", "#bcbd22", "#17becf"],
                selection: null // this attr get value after the first draw
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

                innerProps.selection = selection;

                if (!selection.select('g.group-main').empty()) {
                    selection.select('g.group-main').remove();
                }

                var group_main = selection.append('g').classed('group-main', true);

                var layout = buildLayout(props, innerProps);

                render(group_main, layout, props, innerProps);
            }

            for (var attr in props) {
                if ((!chart[attr]) && (props.hasOwnProperty(attr))) {
                    chart[attr] = createAccessor(attr);
                }
            }

            chart.setTimeAxisDomain = function(domain) {
                innerProps.timeAxisScaleDomain = domain;
            };

            chart.rerender = function() {
                chart(innerProps.selection);
            };

            /* start-test-block */

            /* end-test-block */

            return chart;
        };
    })();

    /* jshint eqnull:true*/
    /* globals d3*/
    var focus_context_timeline = (function() { // <---------------------------------------- CHANGE ME

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

        // --------------------------------- PUT HERE ALL THE GLOBAL VARIABLES AND FUNCTIONS THAT DON'T NEED TO ACCESS PROPS AND INNERPROPS THROUGH SCOPE (Z1)
        // it's importan to separate your layout calculation logic
        // from your rendering logic. This function should return
        // the object that represents the state of the component
        // and used by render function
        function buildLayout(props, innerProps) {

            var focusHeight = (1 - props.context.heightToTotalHeightRatio) * props.height;

            var layout = {
                focus: {
                    width: props.width,
                    height: focusHeight
                },
                context: {
                    width: props.width,
                    height: props.height - focusHeight,
                    translate: [0, focusHeight]
                }
            };

            return layout;
        }

        // all of the elements of the component should go to group_main
        // use layout obj to render your component
        // do not calulate anything in this function! It's only for rendering
        // if you need to calculate s-g do it in buildLayout
        function render(group_main, layout, props, innerProps) {
            var chart = this;

            var focus_group = group_main.append('g')
                .classed('focus', true);

            /*var focusRisersProps = JSON.parse(JSON.stringify(props.focus.risers));
            focusRisersProps.tdgtitle.enabled = true;*/

            var focus_chart = tdg_timeline({
                width: layout.focus.width,
                height: layout.focus.height,
                data: props.data,
                measureLabel: props.measureLabel,
                rows: props.focus.rows,
                timeAxis: props.focus.timeAxis,
                risers: props.focus.risers,
                buckets: props.buckets
            });

            focus_group
                .call(focus_chart);

            var context_group = group_main.append('g')
                .classed('context', true)
                .attr('transform',
                    'translate(' + layout.context.translate + ')'
                );

            var context_chart = tdg_timeline({
                width: layout.context.width,
                height: layout.context.height,
                data: props.data,
                measureLabel: props.measureLabel,
                context: {
                    enabled: true
                },
                rows: props.context.rows,
                timeAxis: props.context.timeAxis,
                risers: props.context.risers,
                onContextChange: function(domain) {
                    focus_chart.setTimeAxisDomain(domain);
                    focus_chart.rerender();
                    if ( typeof chart.onrerender === 'function' ) {
                        chart.onrerender();
                    }
                }
            });

            context_group
                .call(context_chart);
        }

        // --------------------------------- END OF Z1
        return function(user_props) {
            var props = {
                width: 400,
                height: 300,
                data: null,
                measureLabel: null,
                buckets: {
                    task: null,
                    subtask: null,
                    end: null,
                    start: null
                },
                focus: {
                    rows: {
                        labels: {
                            font: '12px sans-serif',
                            color: 'black'
                        }
                    },
                    timeAxis: {
                        labels: {
                            font: '10px sans-serif',
                            color: 'black'
                        }
                    },
                    risers: {
                        labels: {
                            font: '12px sans-serif',
                            color: 'black'
                        }
                    }
                },
                context: {
                    heightToTotalHeightRatio: 0.3,
                    rows: {
                        labels: {
                            font: '12px sans-serif',
                            color: 'black'
                        }
                    },
                    timeAxis: {
                        labels: {
                            font: '10px sans-serif',
                            color: 'black'
                        }
                    },
                    risers: {
                        labels: {
                            font: '10px sans-serif',
                            color: 'black'
                        }
                    }  
                }
            };

            var innerProps = {

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
                var group_main = selection.append('g')
                    .classed('group-main', true);

                var layout = buildLayout(props, innerProps);

                render.call(chart, group_main, layout, props, innerProps);
            }

            /*add extra methods to chart object zone*/



            /*end of add extra methods to chart object zone*/

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

    this.focus_context_timeline = focus_context_timeline;
})();
