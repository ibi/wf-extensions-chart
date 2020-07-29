/* eslint-disable no-implicit-globals, quote-props */
/* globals d3 */


var tdg_arc = (function() { // change name

    // this function only copies attributes values if it is present on src and it's not null or undefined on trgt
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
    
    var markerPath = {
        star: getStarMarker,
        square: getSquire,
        circle: getCircle
    };
    
    function getStarMarker(r) {
        var t36 = 0.7265,
            t72 = 3.0777,
            c72 = 0.309,
            s72 = 0.951,
            c36 = 0.809,
            s36 = 0.588;
        var h = r,
            b = h / 3.236,
            hp = b / c36;
        return 'M0,' + -h + 'L' + (b * t36) + ',' + -b + 'L' + (b * t72)
            + ',' + -b + 'L' + (hp * s72) + ',' + (hp * c72) + 'L' + (h * s36)
            + ',' + (h * c36) + 'L0,' + hp + 'L' + -(h * s36) + ',' + (h * c36)
            + 'L' + -(hp * s72) + ',' + (hp * c72) + 'L' + -(b * t72) + ',' + -b
            + 'L' + -(b * t36) + ',' + -b + 'Z';
    }
    
    function getCircle(r) {
        return 'M0,0 m' + -r + ',0a' + [r, r] + ' 0 1, 0 ' + (r * 2)
            + ',0a' + [r, r] + ' 0 1, 0 ' + (-r * 2) + ',0';
    }
    
    function getSquire(r) {
        return 'M' + -r + ',' + -r + 'L' + r + ',' + -r + ' ' + r + ',' + r + ' ' + -r + ',' + r + 'Z';
    }
    
    return function(user_props) {
        // here we put all the function that need to access props or innerProps objects
        var props = {
            //Start CHART-2438
            getChartColor: null,   // callback to chart engine's series color logic
            //End CHART-2438
            //Start CHART-3401
            showCenteredText: {
                enabled: true
            },
            //End CHART-3401
            width: 300,
            height: 400,
            data: null,
            type: 'regular', // 'regular', 'stacked'
            onRenderComplete: function() {},
            isInteractionDisabled: false,
            formatNumber: function() {
                throw new Error('provide formatNumber function');
            },
            arc: {
                start: Math.PI / 2,
                extent: 0.75, // 0.25, 0.5, 0.75;
                padding: 0.2,
                sortBy: 'value',
                sort: {
                    by: 'value',
                    ascending: true
                },
                border: {
                    width: 1,
                    color: 'blue'
                }
            },
            axis: {
                base: {
                    color: 'black',
                    width: 1
                },
                labels: {
                    format: null
                },
                ticks: {
                    color: 'black',
                    width: 1,
                    labels: {
                        fontSize: '10px',
                        color: 'black'
                    }
                }
            },
            valueLabel: {
                fontFamily: 'sans-serif',
                fontSize: '16px',
                color: '#000000',
                fontWeight: 'bold',
                format: 'auto'
            },
            labels: {
                text: {
                    color: 'green',
                    font: 'Verdana',
                    weight: 'bold',
                    size: '14px'
                },
                marker: {
                    type: 'circle'
                }
            },
            tooltip: {
                enabled: true
            }
        };
    
        var innerProps = {
            padding: 5,
            colors: [
                '#e1542b', '#fee08b', '#33a02c', '#b2df8a', '#1f78b4', '#ffb061', '#ec7014', '#a6bddb',
                '#67001f', '#800026', '#addd8e', '#e0ecf4', '#fcc5c0', '#238b45', '#081d58', '#d4b9da',
                '#2b8cbe', '#74a9cf', '#41ab5d', '#fed976', '#ce1256', '#7f0000', '#a6bddb', '#ffffcc',
                '#e7e1ef', '#016c59', '#f7fcfd', '#99d8c9', '#fff7fb', '#ffffe5', '#fdd49e', '#ffffd9',
                '#fe9929', '#8c96c6', '#810f7c', '#993404', '#c7e9b4', '#bfd3e6', '#e7298a', '#7fcdbb',
                '#3690c0', '#ae017e', '#d9f0a3', '#ece2f0', '#014636', '#f7fcb9', '#66c2a4', '#fff7bc',
                '#f7fcf0', '#e5f5f9', '#fdbb84', '#fa9fb5', '#4d004b', '#fff7fb', '#cc4c02', '#78c679',
                '#1d91c0', '#ccebc5', '#feb24c', '#b30000', '#8c6bb1', '#fec44f', '#d0d1e6', '#084081',
                '#0868ac', '#f7fcfd', '#0570b0', '#ef6548', '#fff7ec', '#006837', '#f768a1', '#edf8b1',
                '#fee391', '#238443', '#ffffe5', '#023858', '#7a0177', '#67a9cf', '#dd3497', '#980043',
                '#88419d', '#d0d1e6', '#fc8d59', '#4eb3d3', '#fd8d3c', '#fff7f3', '#fc4e2a', '#ccece6',
                '#ece7f2', '#a8ddb5', '#41ae76', '#bd0026', '#e0f3db', '#045a8d', '#ffeda0', '#253494',
                '#7bccc4', '#fde0dd', '#00441b', '#225ea8', '#006d2c', '#02818a', '#f7f4f9', '#d7301f',
                '#df65b0', '#662506', '#3690c0', '#004529', '#fee8c8'
            ],
            arc: {
                radius: {
                    inner: 0.2,
                    outer: 0.9
                },
                animation: {
                    delay: function(d, i) {
                        return 50 * i;
                    },
                    duration: 500
                }
            },
            axis: {
                width: 1,
                offset: 5,
                base: {
                    color: 'grey',
                    width: 1,
                    animation: {
                        delay: 500,
                        duration: 500
                    }
                },
                ticks: {
                    length: 5,
                    color: 'grey',
                    width: 1,
                    animation: {
                        delay: function(d, i) {
                            return 500 + 50 * i;
                        },
                        duration: 500
                    },
                    labels: {
                        fontFamily: 'sans-serif',
                        fontSize: '14px',
                        color: 'grey'
                    }
                }
            },
            labels: {
                text: {
                    animation: {
                        delay: 500,
                        duration: 500
                    }
                },
                padding: {
                    horizontal: 5,
                    vertical: 0
                },
                marker: {
                    radius: 8,
                    animation: {
                        delay: 500,
                        duration: 500
                    }
                },
                line: {
                    animation: {
                        delay: 500,
                        duration: 500
                    }
                }
            },
            rescale: {
                enabled: true,
                padding: 5,
                animation: {
                    delay: 500,
                    duration: 500
                }
            },
            reposition: {
                enabled: true,
                animation: {
                    delay: 500,
                    duration: 500
                }
            }
        };
    
        function throwDataError() {
            throw new Error('Wrong data set format');
        }
    
        function getOnAllTransitionComplete(cb) {
            return function(transition) {
                var count = transition.size();
                transition.on('end', function() {
                    if (!(--count && typeof cb === 'function')) {
                        cb();
                    }
                });
            };
        }
    
        function getInvokeAfter(cb, count) {
            if (!count && typeof cb === 'function') {
                cb();
            }
    
            return function() {
                if (!(--count) && typeof cb === 'function') {
                    cb();
                }
            };
        }
    
        function getData() {
            if (!Array.isArray(props.data)) {
                throwDataError();
            }
            if (!props.data.every(function(d) {
                return Array.isArray(d);
            })) {
                throwDataError();
            }
            var result;
            if (['stacked', 'percent'].indexOf(props.type) >= 0) {
                result = cleanData(props.data);
            } else {
                result = cleanData(props.data.slice(0, 1))[0];
                if (props.arc.sort.by != null) {
                    result.sort(function(a, b) {
                        if (props.arc.sort.ascending) {
                            return (a[props.arc.sort.by] > b[props.arc.sort.by]) ? 1 : -1;
                        } else {
                            return (a[props.arc.sort.by] < b[props.arc.sort.by]) ? 1 : -1;
                        }
                    });
                }
            }
    
            return result;
        }
    
        function cleanData() {
            var result = props.data.map(function(d) {
                return d.filter(function(d) {
                    var castedValue = typeof d.value == 'string' ? parseFloat(d.value) : d.value;
                    return castedValue != null && typeof castedValue !== 'string' && !isNaN(castedValue);
                });
            });
            return result;
        }
    
        // theta scale always starts from zero
        // buy finding max value from absolute values of min and max we make sure that our domain will be enough to fit all negative or positive values
        function getThetaScaleRegular() {
            var minMax = d3.extent(getData(), function(d) {
                return d.value;
            });
    
            minMax[0] = Math.abs(minMax[0]);
            minMax[1] = Math.abs(minMax[1]);
    
            var max = d3.max(minMax);
            var extent = Math.min(Math.abs(props.arc.extent), 0.75);
            var range = [props.arc.start, props.arc.start + extent * 2 * Math.PI];
    
            return d3
              .scaleLinear()
              .domain([0, max])
              .range(range);
    
            //return d3.scale.linear().domain([0, max]).range(range);
        }
    
        function getThetaScaleStacked() {
            var i,
                data = d3.transpose(getData()),
                sumBySeries = [];
    
            for (i = 0; i < data.length; i++) {
                sumBySeries[i] = d3.sum(data[i], function(d) {
                    return (d.value > 0) ? d.value : 0;
                });
            }
    
            var extent = Math.min(Math.abs(props.arc.extent), 0.75);
            var range = [props.arc.start, props.arc.start + extent * 2 * Math.PI];
            var max = d3.max(sumBySeries);
            
            return d3
              .scaleLinear()
              .domain([0, max])
              .range(range);
    
    
            //return d3.scale.linear().domain([0, max]).range(range);
        }
    
        function getThetaScalePercent() {
            var extent = Math.min(Math.abs(props.arc.extent), 0.75);
            var range = [props.arc.start, props.arc.start + extent * 2 * Math.PI];
            return d3.scaleLinear().domain([0, 1]).range(range);
        }
    
        function getThetaScale() {
            switch (props.type) {
                case 'stacked':
                    return getThetaScaleStacked();
                case 'percent':
                    return getThetaScalePercent();
                default:
                    return getThetaScaleRegular();
            }
        }
    
        function getRadiusInfo() {
            var length = Math.min(props.width, props.height) / 2;
            var coef = (props.arc.extent < 0.75) ? 0.9 : 1;
            return {
                inner: innerProps.arc.radius.inner * length,
                outer: innerProps.arc.radius.outer * length * coef
            };
        }
    
        function getRadiusScale() {
    
            switch (props.type) {
                case 'stacked':
                    return getRadiusScaleStacked();
                case 'percent':
                    return getRadiusScalePercent();
                default:
                    return getRadiusScaleRegular();
            }
        }
    
        function getRadiusScalePercent() {
            return getRadiusScaleStacked();
        }
    
        function getRadiusScaleRegular() {
            var data = getData(),
                radiusInfo = getRadiusInfo();
                
                return d3
              .scaleBand()
              .domain(d3.range(data.length))
              .range([radiusInfo.inner, radiusInfo.outer])
              .paddingInner(props.arc.padding)
              .paddingOuter(0);
    
                /*
            return d3.scale.ordinal()
                .domain(d3.range(data.length))
                .rangeBands([radiusInfo.inner, radiusInfo.outer], props.arc.padding, 0);
                
                */
        }
    
        function getRadiusScaleStacked() {
            var data = d3.transpose(getData()),
                radiusInfo = getRadiusInfo();
    
                /*
            return d3.scale.ordinal()
                .domain(d3.range(data.length))
                .rangeBands([radiusInfo.inner, radiusInfo.outer], props.arc.padding, 0);
                */
            return d3
              .scaleBand()
              .domain(d3.range(data.length))
              .range([radiusInfo.inner, radiusInfo.outer])
              .paddingInner(props.arc.padding)
              .paddingOuter(0);
        }
    
        function buildDataset(type) {
            switch (type) {
                case 'stacked':
                    return buildStackDataset();
                case 'regular':
                    return buildRegularDataset();
                case 'percent':
                    return buildPercentDataset();
                default:
                    throw new Error('Unknown chart type');
            }
        }
    
        function buildStackDataset() {
            var data = d3.transpose(getData()),
                result = [],
                lastEndValuePos, res;
            data.forEach(function(series, idx) {
                lastEndValuePos = 0;
                result[idx] = series.map(function(d, i) {
                    res = {
                        label: d.label,
                        originalChartGroup: (d._g == null) ? i : d._g,
                        color: (d.color != null) ? d.color : innerProps.colors[i],
                        value: d.value,
                        class: d.elClassName
                    };
                    if (d.value > 0) {
                        res.startValue = lastEndValuePos;
                        res.endValue = lastEndValuePos += d.value;
                    }
                    return res;
                });
            });
    
            return d3.transpose(result);
        }
    
        function buildRegularDataset() {
            return getData().map(function(d, i) {
                return {
                    label: d.label,
                    originalChartGroup: (d._g == null) ? i : d._g,
                    /* CHART-2438 Comment out old color assignment logic
                    color: (d.color != null) ? d.color : innerProps.colors[i],
                    */
                    //Start CHART-2438
                    color: (d.color != null) ? d.color : props.getChartColor('color', i),
                    //End CHART-2438
                    value: d.value,
                    class: d.elClassName
                };
            });
        }
    
        function buildPercentDataset() {
            var data = d3.transpose(getData()),
                result = [],
                lastEndValuePos, res, sum;
            data.forEach(function(series, idx) {
                lastEndValuePos = 0;
                sum = d3.sum(series, function(d) {
                    return (d.value > 0) ? d.value : 0;
                });
                result[idx] = series.map(function(d, i) {
                    res = {
                        label: d.label,
                        originalChartGroup: (d._g == null) ? i : d._g,
                        color: (d.color != null) ? d.color : innerProps.colors[i],
                        value: d.value,
                        ratio: (d.value / sum),
                        class: d.elClassName
                    };
                    if (d.value > 0) {
                        res.startValue = lastEndValuePos;
                        res.endValue = lastEndValuePos += res.ratio;
                    }
                    return res;
                });
            });
    
            return d3.transpose(result);
        }
    
        function getFormater(formatNumberFn, format, extent) {
            var minMax = {
                min: extent[0],
                max: extent[1]
            };
    
            return function(num) {
                return formatNumberFn(
                    num,
                    format,
                    minMax
                );
            };
        }
    
        function renderArcsPercent(container, onRenderComplete) {
            var group_arc = container.append('g')
                .classed('group-arc', true);
    
            var theta = getThetaScale(),
                radius = getRadiusScale(),
                arcWidth = radius.bandwidth();
    
            var arc = d3.arc()
                .innerRadius(function(d, i) {
                    return radius(i);
                })
                .outerRadius(function(d, i) {
                    return radius(i) + arcWidth;
                })
                .startAngle(function(d) {
                    return theta(d.startValue || 0);
                })
                .endAngle(function(d) {
                    return theta(d.endValue || 0);
                });
    
            var data = buildPercentDataset();
    
            var series = group_arc.selectAll('g.series')
                .data(data);
    
            series.enter()
                .append('g')
                .classed('series', true);
    
            var arcs = series.selectAll('path')
                .data(function(d) {
                    return d;
                });
    
            arcs.enter().append('path');
    
            arcs.each(function(d) {
                d3.select(this).classed(d.class, true);
            });
    
            arcs.styles({
                fill: function(d, i, g) {
                    if (d.color != null) {
                        return d.color;
                    } else {
                        return innerProps.colors[g];
                    }
                },
                stroke: props.arc.border.color,
                'stroke-width': props.arc.border.width
            });
    
            if (props.isInteractionDisabled) {
                arcs.attr('d', arc);
                onRenderComplete();
            } else {
                arcs.transition()
                    .delay(innerProps.arc.animation.delay)
                    .duration(innerProps.arc.animation.duration)
                    .attrTween('d', function(d, i) {
                        var range = d3.interpolate(
                            {startValue: 0, endValue: 0},
                            {startValue: d.startValue, endValue: d.endValue}
                        );
                        return function(t) {
                            return arc(range(t), i);
                        };
                    })
                    .call(getOnAllTransitionComplete(onRenderComplete));
            }
    
            arcs.filter(function(d) { // this will remove negative arcs
                return d.startValue == null || d.endValue == null;
            }).remove();
    
            return group_arc;
    
        }
    
        function renderArcsStacked(container, onRenderComplete) {
            var group_arc = container.append('g')
                .classed('group-arc', true);
    
            var theta = getThetaScale(),
                radius = getRadiusScale(),
                arcWidth = radius.bandwidth();
    
            var arc = d3.arc()
                .innerRadius(function(d, i) {
                    return radius(i);
                })
                .outerRadius(function(d, i) {
                    return radius(i) + arcWidth;
                })
                .startAngle(function(d) {
                    return theta(d.startValue || 0);
                })
                .endAngle(function(d) {
                    return theta(d.endValue || 0);
                });
    
            var data = buildStackDataset();
    
            var series = group_arc.selectAll('g.series')
                .data(data);
    
            series.enter()
                .append('g')
                .classed('series', true);
    
            var arcs = series.selectAll('path')
                .data(function(d) {
                    return d;
                });
    
            arcs.enter()
                .append('path');
    
            arcs.each(function(d) {
                d3.select(this).classed(d.class, true);
            });
    
            arcs.styles({
                fill: function(d, i, g) {
                    if (d.color != null) {
                        return d.color;
                    } else {
                        return innerProps.colors[g];
                    }
                },
                stroke: props.arc.border.color,
                'stroke-width': props.arc.border.width
            });
    
            if (props.isInteractionDisabled) {
                arcs.attr('d', arc);
                onRenderComplete();
            } else {
                arcs.transition()
                    .delay(innerProps.arc.animation.delay)
                    .duration(innerProps.arc.animation.duration)
                    .attrTween('d', function(d, i) {
                        var range = d3.interpolate(
                            {startValue: 0, endValue: 0},
                            {startValue: d.startValue, endValue: d.endValue}
                        );
                        return function(t) {
                            return arc(range(t), i);
                        };
                    })
                    .call(getOnAllTransitionComplete(onRenderComplete));
            }
    
            arcs.filter(function(d) { // this will remove negative arcs
                return d.startValue == null || d.endValue == null;
            }).remove();
    
            return group_arc;
        }
    
        function renderArcsRegular(container, onRenderComplete) {
            var group_arc = container.append('g')
                .classed('group-arc', true);
    
            var theta = getThetaScale(),
                radius = getRadiusScale(),
                arcWidth = radius.bandwidth();
    
            var arc = d3.arc()
                .innerRadius(function(d, i) {
                    return radius(i);
                })
                .outerRadius(function(d, i) {
                    return radius(i) + arcWidth;
                })
                .startAngle(theta(0))
                .endAngle(function(d) {
                    return theta(d.value);
                });
    
            var data = buildRegularDataset();
    
            var arcs = group_arc.selectAll('path')
                .data(data).enter()
                .append('path');
    
            var extent = d3.extent(data, function(d) {
                return d.value;
            });
    
            var format = getFormater(props.formatNumber, props.valueLabel.format, extent);
    
            arcs.each(function(d) {
                d3.select(this).classed(d.class, true);
            });
    
            arcs.styles({
                fill: function(d, i) {
                    if (d.color != null) {
                        return d.color;
                    } else {
                        return innerProps.colors[i];
                    }
                },
                stroke: props.arc.border.color,
                'stroke-width': props.arc.border.width
            });
            

           
            if (props.isInteractionDisabled) {
                arcs.attr('d', arc);
                onRenderComplete();
            } else {
                arcs.transition()
                    .delay(innerProps.arc.animation.delay)
                    .duration(innerProps.arc.animation.duration)
                    .attrTween('d', function(d, i) {
                        var range = d3.interpolate({value: 0}, {value: d.value});
                        return function(t) {
                            return arc(range(t), i);
                        };
                    })
                  .call(getOnAllTransitionComplete(onRenderComplete));
            }
            
            return group_arc;
        }
    
        function getAxisDataObj(axis) {
            var ticks = axis.ticks();
    
            var extent = d3.extent(ticks);
    
            var format = getFormater(
                props.formatNumber,
                props.axis.labels.format,
                extent
            );
    
            //var format = getAxisLabelFormatFunction();
            return ticks.map(function(d) {
                return {label: format(d), angle: axis(d)};
            });
        }
    
        function renderThetaAxis(container, onRenderComplete) {
            var group_axis = container.append('g')
                .classed('group-axis', true);
    
            var radius = getRadiusInfo().outer + innerProps.axis.offset;
            var theta = getThetaScale();
            var domain = theta.domain();
    
            var arc = d3.arc()
                .innerRadius(radius)
                .outerRadius(radius)
                .startAngle(theta(0))
                .endAngle(function(d) {
                    return theta(d.value);
                });
    
            var axis = group_axis.selectAll('path.base')
                .data([{value: domain[1]}]).enter().append('path').classed('base', true);
            
            
            
            axis.styles({
                stroke: props.axis.base.color,
                'stroke-width': props.axis.base.width
            });
            
            
            var invokeAfterTwo = getInvokeAfter(onRenderComplete, 2);
    
            if (props.isInteractionDisabled) {
                axis.attr('d', arc);
                invokeAfterTwo();
            } else {

                axis.transition()
                    .delay(innerProps.axis.base.animation.delay)
                    .duration(innerProps.axis.base.animation.duration)
                    .attrTween('d', function(d) {
                        var range = d3.interpolate({value: 0}, {value: d.value});
                        return function(t) {
                            return arc(range(t));
                        };
                    })
                    .call(getOnAllTransitionComplete(invokeAfterTwo));
            }
    
            var ticks = group_axis.selectAll('g.group-tick')
                .data(getAxisDataObj(theta)).enter()
                .append('g')
                .classed('group-tick', true);


    
            ticks.attr('transform', function(d) {
                return 'rotate(' + (d.angle * 180 / Math.PI - 90) + ') translate(' + [radius, 0] + ')';
            }).style('opacity', 0);
    
            ticks.append('line').classed('tick', true)
                .attrs({
                    x1: 0,
                    y1: 0,
                    x2: innerProps.axis.ticks.length,
                    y2: 0
                })
                .styles({
                    stroke: props.axis.ticks.color,
                    'stroke-width': props.axis.ticks.width
                });
    
            ticks.append('text').classed('label', true)
                .attrs({
                    x: 8,
                    dy: '.35em',
                    transform: function(d) {
                        return d.angle > Math.PI ? 'rotate(180)translate(-16)' : null;
                    }
                })
                .styles({
                    'text-anchor': function(d) {
                        return d.angle > Math.PI ? 'end' : null;
                    },
                    'font-family': innerProps.axis.ticks.labels.fontFamily,
                    'font-size': props.axis.ticks.labels.fontSize,
                    fill: props.axis.ticks.labels.color
                })
                .text(function(d) {
                    return d.label;
                });
    
            if (props.isInteractionDisabled) {
                ticks.style('opacity', 1);
                invokeAfterTwo();
            } else {

                ticks.transition()
                    .delay(innerProps.axis.ticks.animation.delay)
                    .duration(innerProps.axis.ticks.animation.duration)
                    .style('opacity', 1)
                    .call(getOnAllTransitionComplete(invokeAfterTwo));
            }
    
            return group_axis;
        }
    
        function getAxisLabelFormatFunction() {
            var formatFn;
            if (props.axis.labels.format != null) {
                formatFn = d3.format(axis.labels.format);
            } else if (props.type === 'percent') {
                formatFn = d3.format('%');
            } else {
                formatFn = d3.format();
            }
    
            return formatFn;
        }
    
        function rescaleGroupChart(selection, onScaleComplete) {
            var selectionDim = selection.node().getBoundingClientRect();
    
            var horrizOverflow = selectionDim.width - props.width;
            var vertOverflow = selectionDim.height - props.height;
            if (horrizOverflow > 0 || vertOverflow > 0) {
                var origTransform = selection.attr('transform'),
                    scale;
                scale = (horrizOverflow > vertOverflow)
                    ? (props.width - 2 * innerProps.rescale.padding) / selectionDim.width
                    : (props.height - 2 * innerProps.rescale.padding) / selectionDim.height;
    
                scale *= 0.95;
    
                if (props.isInteractionDisabled) {
                    selection.attr('transform', function() {
                        return (origTransform ? origTransform : '') + 'scale(' + scale + ')';
                    });
                    onScaleComplete();
                } else {

                    selection.attr('transform', function() {
                        return (origTransform ? origTransform : '') + 'scale(' + scale + ')';
                    });
                    onScaleComplete();

                    selection.transition()
                        .delay(innerProps.rescale.animation.delay)
                        .duration(innerProps.rescale.animation.duration)
                        .attr('transform', (origTransform ? origTransform : '') + 'scale(' + scale + ')')
                        .call(getOnAllTransitionComplete(onScaleComplete));

                }
            } else {
                onScaleComplete();
            }
        }
    
        /*function repositionGroupChart (group_main, group_axis) {
            var center = {
                x: props.width / 2,
                y: props.height / 2
            };
    
            var group_axis_rad = group_axis.node().getBoundingClientRect().width / 2;
            var group_main_dim = group_main.node().getBoundingClientRect();
    
            var actualCenter = {
                x: center.x - group_axis_rad + group_main_dim.width / 2,
                y: center.y - group_axis_rad + group_main_dim.height / 2
            };
    
            group_main
    
        }*/
    
        function renderLabels(container, onRenderComplete) {
    
            function getLabelYPosFun(offset, labelCount) {
                var totalHeight = offset * labelCount;
                return function(d, i) {
                    return (offset * i) - totalHeight;
                };
            }
    
            function positionTween(d, i) {
                var range = d3.interpolate(0, ypos(d, i));
                return function(t) {
                    return range(t);
                };
            }
    
            var group_labels = container.append('g')
                .classed('group-labels', true);
    
            var data = getData().map(function(d, i) {
                /* CHART-2438 Logic prior to dynamic color assignment
                return { label: d.label, color: d.color, idx: i };
                */
                //START CHART-2438
                return {label: d.label, color: props.getChartColor('color', i), idx: i};
                //End CHART-2438
            }).filter(function(d) {
                return d.label != null;
            });
    
            var group_label = group_labels.selectAll('g.group-label')
                .data(data).enter().append('g')
                .classed('group-label', true);
    
    
            var radius = getRadiusScale(),
                rangeMiddle = radius.bandwidth() / 2;
    

                group_label.attr('transform', function(d) {
                    return 'rotate('
                        + (props.arc.start * 180 / Math.PI - 90)
                        + ')  translate(' + [radius(d.idx) + rangeMiddle, 0] + ')';
                });
    
            var markerRadius = innerProps.labels.marker.radius;
    
            var labels = group_label.append('text')
                .styles({
                    opacity: 0,
                    fill: props.labels.text.color,
                    'font-family': props.labels.text.font,
                    'font-weight': props.labels.text.weight,
                    'font-size': props.labels.text.size
                })
                .attrs({
                    dy: '.35em',
                    x: innerProps.labels.padding.horizontal + markerRadius
                })
                .text(function(d) {
                    return d.label;
                });
    
            var labelBox = labels.node() ? labels.node().getBoundingClientRect().height : 0;
            var verticalOffset = Math.max(labelBox, 2 * markerRadius) + innerProps.labels.padding.vertical;
    
            var ypos = getLabelYPosFun(verticalOffset, data.length); // gives us y position depending on index
    
            labels.attr('y', ypos);
    
            var lines = group_label.append('line')
                .attrs({
                    x1: 0,
                    y1: 0,
                    x2: 0
                })
                .styles({
                    stroke: '#333333'
                });
    
            var markers = group_label.append('path')
                .attrs({
                    d: markerPath[props.labels.marker.type || 'square'](markerRadius),
                    transform: function(d, i) {
                        return 'translate(' + [0, ypos(d, i)] + ')';
                    }
                })
                .styles({
                    opacity: 0,
                    fill: function(d) {
                        if (d.color != null) {
                            return d.color;
                        } else {
                            return innerProps.colors[d.idx];
                        }
                    },
                    stroke: '#333333'
                });
    
            var invokeAfterThree = getInvokeAfter(onRenderComplete, 3);
    
            if (props.isInteractionDisabled) {
                lines.attr('y2', ypos);
                invokeAfterThree();
                labels.attr('y', ypos).style('opacity', 1);
                invokeAfterThree();
                markers.attr('transform', function(d, i) {
                    return 'translate(0,' + ypos(d, i) + ')';
                }).style('opacity', 1);
                invokeAfterThree();
            } else {
                lines.transition()
                    .delay(innerProps.labels.line.animation.delay)
                    .duration(innerProps.labels.line.animation.duration)
                    .attrTween('y2', positionTween)
                    .call(getOnAllTransitionComplete(invokeAfterThree));
    
                labels.transition()
                    .delay(innerProps.labels.text.animation.delay)
                    .duration(innerProps.labels.text.animation.duration)
                    .attrTween('y', positionTween)
                    .style('opacity', 1)
                    .call(getOnAllTransitionComplete(invokeAfterThree));
    
                markers.transition()
                    .delay(innerProps.labels.marker.animation.delay)
                    .duration(innerProps.labels.marker.animation.duration)
                    .attrTween('transform', function(d, i) {
                        var range = d3.interpolate('translate(0,0)', 'translate(0,' + ypos(d, i) + ')');
                        return function(t) {
                            return range(t);
                        };
                    })
                    .style('opacity', 1)
                    .call(getOnAllTransitionComplete(invokeAfterThree));
            }
    
            return group_label;
        }
    
        function hasOnlyPositiveValues() {
            return !getData().some(function(d) {
                return d && d.value < 0;
            });
        }
    
        function fadeRegular(opacity, selection) {
            return function(d, i) {
                var fadeout = selection.filter(function(d, idx) {
                    return (d.idx) ? d.idx !== i : idx !== i;
                });
    
                if (d3.event.type === 'touchstart') {
                    selection.filter(function() {
                        return fadeout[0].indexOf(this) < 0;
                    }).transition().style('opacity', 1);
                }
    
                fadeout.transition().style('opacity', opacity);
            };
        }
    
        function fadeStacked(opacity, selection) {
            return function(d, i, g) {
                var fadeout = selection.filter(function(d, idx, group) {
                    return idx !== i || g !== group;
                });
    
                if (d3.event.type === 'touchstart') {
                    selection.filter(function() {
                        return fadeout[0].indexOf(this) < 0;
                    }).transition().style('opacity', 1);
                }
    
                fadeout.transition().style('opacity', opacity);
            };
        }
    
        function enableHiglight(group_arc, bg, group_label) {
            var arcs = group_arc.selectAll('path');
    
            var fade = (props.type === 'stacked') ? fadeStacked : fadeRegular;
    
            arcs
                .on('mouseover.arcs', fade(0.2, arcs))
                .on('mouseout.arcs', fade(1, arcs));
    
            arcs
                .on('touchstart.arcs', fade(0.2, arcs));
    
    
            if (!group_label) {
                return;
            }
    
            arcs.on('mouseover.labels', fade(0.2, group_label))
                .on('mouseout.labels', fade(1, group_label));
    
            arcs.on('touchstart.labels', fade(0.2, group_label));
    
            bg.on('touchstart', function() {
                arcs.filter(function() {
                    return d3.select(this).style('opacity') !== 1;
                }).transition().style('opacity', 1);
    
                group_label.filter(function() {
                    return d3.select(this).style('opacity') !== 1;
                }).transition().style('opacity', 1);
            });
        }
    
        function getTextScaleFactorForRadius(radius, width, height) {
            /*Code prior to CHART-3401
            var widthToFit = Math.pow( Math.pow( radius, 2 ) - Math.pow( height, 2 ), 0.5),
                heightToFit = Math.pow( Math.pow( radius, 2 ) - Math.pow( width, 2 ), 0.5),
                deltaWidth = width - widthToFit,
                deltaHeight = height - heightToFit;
    
            return ( Math.abs(deltaWidth) > Math.abs(deltaHeight) )
                ? widthToFit / width
                : heightToFit / height;
            */
    
            //Start CHART-3401
            var widthToFit = Math.pow(Math.pow(radius, 2) - Math.pow(Math.min(radius, height), 2), 0.5),
                heightToFit = Math.pow(Math.pow(radius, 2) - Math.pow(Math.min(radius, width), 2), 0.5),
                deltaWidth = width - widthToFit,
                deltaHeight = height - heightToFit;
    
            var scaleFactor = (Math.abs(deltaWidth) > Math.abs(deltaHeight))
                ? widthToFit / width
                : heightToFit / height;
    
            //Minimum scaleFactor of 1.5
            return Math.max(1.5, scaleFactor);
    
            //End CHART-3401
        }
    
        function enableShowValueOnHiglight(group_arc, bg) {
            var group_value = group_arc
                .append('g')
                .classed('group-value', true);
    
            var arcs = group_arc.selectAll('path');
    
            var lblProps = props.valueLabel || {};
    
            var minRadius = getRadiusScale().range()[0];
    
            var data = buildDataset(props.type);
    
            var extent = d3.extent(data, function(d) {
                return d.value;
            });
    
            var format = getFormater(
                props.formatNumber,
                lblProps.format,
                extent
            );
    
            function mouseover(d) {
    
                group_value.select('text').remove();
    
                var text = group_value.append('text')
                    .styles({
                        'font-family': lblProps.fontFamily || 'sans-serif',
                        'font-size': lblProps.fontSize || '16px',
                        'font-weight': lblProps.fontWeight || 'normal',
                        fill: lblProps.color || '#000',
                        'text-anchor': 'middle',
                        dy: '.35em'
                    })
                    /*Code prior to CHART-3401
                    .text(props.showCenteredText.enabled ?  format(d.value): ' ');
                    */
                    //Start CHART-3401
                    .text(props.showCenteredText.enabled ? format(d.value) : '');
                    //End CHART-3401
    
                if (lblProps.fontSize === 'auto') {
                    var bbox = text.node().getBBox();
                    var factor = getTextScaleFactorForRadius(
                        minRadius - innerProps.padding,
                        /* Code before to CHART-3401
                        bbox.width,
                        bbox.height
                        */
                        //Start CHART-3401
                        Math.max(1, bbox.width),
                        Math.max(1, bbox.height)
                        //End CHART-3401
                    );
    
                    text.attr('transform', 'scale(' + factor + ')');
                } else {
                    text.style('font-size', lblProps.fontSize || '16px');
                }
                group_value.select('text').attr('dy', '.35em');
            }
    
            function mouseout() {
                group_value.select('text').remove();
            }
    
            arcs
                .on('mouseover.value', mouseover)
                .on('mouseout.value', mouseout);
    
            arcs
                .on('touchstart.value', mouseover);
    
            bg.on('touchstart.value', mouseout);
        }
    
        function addBackground(group_main, width, height) {
            return group_main.append('rect').classed('background', true)
                .attrs({
                    width: width,
                    height: height,
                    fill: 'none',
                    'pointer-events': 'all'
                });
        }
    
        function onRenderComplete(group_main, props) {
            // resize main_group to fit into a container
            // call onRenderComplete callback
            return function() {
                if (!group_main || !document.body.contains(group_main.node())) {
                    // Do not do any of this if the current target is no longer in the DOM.
                    // In Firefox, getBBox() throws a horribly generic NS_ERROR_FAILURE if its target is not in the DOM.
                    return;
                }
                var bbox = group_main.node().getBBox();
    
                var overflow = {
                    horiz: bbox.width - props.width,
                    vert: bbox.height - props.height
                };
    
                if (overflow.horiz > 0 || overflow.vert > 0) {
                    var factor = (overflow.horiz > overflow.vert)
                        ? props.width / bbox.width
                        : props.height / bbox.height;
    
                    var translate = [
                        props.width / 2 * (1 - factor) * -1,
                        props.height / 2 * (1 - factor)
                    ];
    
                    if (!props.isInteractionDisabled) {
                        group_main
                            .transition()
                            .attr(
                                'transform',
                                'translate(' + translate + ') scale(' + factor + ')'
                            )
                            ;
                            /*
                            .call(
                                getOnAllTransitionComplete(props.onRenderComplete)
                            );
                            */
                    } else {
                        group_main
                            .attr(
                                'transform',
                                'translate(' + translate + ') scale(' + factor + ')'
                            );
    
                        props.onRenderComplete();
                    }
                } else {
                    props.onRenderComplete();
                }
            };
        }
    
        function chart(selection) {
            var group_main = selection.append('g').classed('group-main', true);
    
            var bg = addBackground(group_main, props.width, props.height);
    
            var group_chart = group_main.append('g')
                .classed('group-chart', true)
                .attr('transform', 'translate(' + [props.width / 2, props.height / 2] + ')');
    
            var group_arc;
    
            var invokeAfterFour = getInvokeAfter(onRenderComplete(group_main, props), 4);
    
            switch (props.type) {
                case 'stacked':
                    group_arc = renderArcsStacked(group_chart, invokeAfterFour);
                    break;
                case 'regular':
                    group_arc = renderArcsRegular(group_chart, invokeAfterFour);
                    break;
                case 'percent':
                    group_arc = renderArcsPercent(group_chart, invokeAfterFour);
                    break;
                default:
                    throw new Error('Unknown chart type');
            }
    
            renderThetaAxis(group_chart, invokeAfterFour);
    
            if (hasOnlyPositiveValues() && ['stacked', 'percent'].indexOf(props.type) < 0) {
                var group_label = renderLabels(group_chart, invokeAfterFour);
    
                /* Logic prior to CHART-3188
                if ( !props.isInteractionDisabled ) {
                    enableHiglight(group_arc, bg, group_label);
                    enableShowValueOnHiglight(group_arc, bg);
                }
                */
                //Start CHART-3188
                enableHiglight(group_arc, bg, group_label);
                enableShowValueOnHiglight(group_arc, bg);
                //END CHART-3188
            } else {
                enableHiglight(group_arc, bg);
                invokeAfterFour();
            }
    
            if (innerProps.rescale.enabled) {
                rescaleGroupChart(group_chart, invokeAfterFour);
            } else {
                invokeAfterFour();
            }
        }
    
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
    
        copyIfExisty(props, user_props);
    
        for (var attr in props) {
            if ((!chart[attr]) && (props.hasOwnProperty(attr))) {
                chart[attr] = createAccessor(attr);
            }
        }
    
        return chart;
    };
    })();
    