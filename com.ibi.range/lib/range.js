/* jshint eqnull:true*/
/* globals d3*/

var tdg_range = (function() { // <---------------------------------------- CHANGE ME

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
    // every datum needs to have group and either at least one marker, or min, max range
    
    function isValidDatum (d) {
        return d.group && (d.marker || (d.min && d.max) );
    }

    function getCleanData (data) {
        return data.filter(isValidDatum);
    }

    function extractAllNumbers (d) {
        var res;

        switch (true) {
            case ( Array.isArray(d.markers) ) :
                res = d.markers.slice();
                break;
            case ( !!d.markers ) :
                res = [ d.markers ];
                break;
            default :
                res = [];
        }

        if ( d.max != null ) {
            res.push(d.max);
        }

        if ( d.min != null ) {
            res.push(d.min);
        }

        return res;
    }

    function getNumScaleExtent ( data ) {
        var extent = [];
        extent[0] = d3.min(data, function (d) {
            return Math.min.apply(Math, extractAllNumbers(d));
        });

        extent[1] = d3.max(data, function (d) {
            return Math.max.apply(Math, extractAllNumbers(d));
        });

        return extent;
    }

    function getNumScale ( data ) {
        var extent = getNumScaleExtent(data);

        var scale = d3.scale.linear().domain(extent).nice()/*.range([0, length])*/;
        scale.type = 'numerical';
        scale.color = 'lightblue';

        return scale;
    }

    function getOrdScale ( data ) {
        var groups = getGroups(data);

        var scale = d3.scale.ordinal().domain(groups)/*.rangeBands([0, length])*/;
        scale.type = 'ordinal';
        scale.color = 'salmon';

        return scale;
    }

    // assumes data array is clean
    function getGroups ( data ) {
        return data.reduce(function ( groups, d ) {
            return d.group != null && groups.indexOf(d.group) < 0
                ? groups.concat(d.group)
                : groups;
        }, []);
    }

    function getLblsDims ( lbls, measureText, font ) {
        return lbls.map(function (lbl) {
            return measureText(lbl, font);
        });
    }

    function getNumScaleLabels ( scale, formater, formatStr ) {
        var extent = scale.domain();

        var formatConfig = {
            min: extent[0],
            max: extent[1]
        };

        return scale.ticks().map(function (n) {
            return formater(n, formatStr, formatConfig);
        });
    }

    function getMaxLblWidth ( labels, measureLabel, font ) {
        return d3.max(labels, function (lbl) {
            return measureLabel(lbl, font).width;
        });
    }

    function getMaxLblHeight ( labels, measureLabel, font ) {
        return d3.max(labels, function (lbl) {
            return measureLabel(lbl, font).height;
        });
    }

    function getAxisLabels ( scale, props ) {
        if ( scale.type === 'numerical' ) {
            return getNumScaleLabels(
                scale,
                props.formatNumber,
                props.axes.numerical.labels.format
            );
        } else {
            return scale.domain();
        }
    }

    // only can add title to ordinal axis, because numerical will have many buckets
    // buckets.group

    function hasAxisTitle ( scale, buckets ) {
        return scale.type === 'ordinal' && Array.isArray( buckets.group );
    }

    function getAxisTitleText ( scale, buckets ) {
        if ( hasAxisTitle(scale, buckets) ) {
            return buckets.group[0];
        }
    }

    function getAxisTitleHeight ( scale, props ) {
        var titleText = getAxisTitleText( scale, props.buckets );
        return ( titleText != null ) ? props.measureLabel(titleText, props.axes.ordinal.title.font).height : 0;
    }

    function getHorizAxisHeight ( scale, props, innerProps, skipTitle ) {
        var pad = innerProps.pad,
            tSize = innerProps.tickSize;

        var lblsHorizSpace = getMaxLblHeight(
            getAxisLabels(scale, props),
            props.measureLabel,
            props.axes[scale.type].labels.font
        );

        var height = pad + lblsHorizSpace + tSize + pad;

        var titleHeight = getAxisTitleHeight(scale, props);

        if ( titleHeight && !skipTitle ) {
            height += pad + titleHeight;
        }

        return height;
    }

    function getVertAxisWidth ( scale, props, innerProps, skipTitle ) {
        var pad = innerProps.pad,
            tSize = innerProps.tickSize;

        var lblsVertSpace = getMaxLblWidth(
            getAxisLabels(scale, props),
            props.measureLabel,
            props.axes[scale.type].labels.font
        );

        var width = pad + lblsVertSpace + tSize + pad;

        var titleHeight = getAxisTitleHeight(scale, props);
        
        if ( titleHeight && !skipTitle ) {
            width += pad + titleHeight;
        }

        return width;
    }

    function setScaleRange ( scale, range, padRatio ) {
        if ( scale.type === 'numerical' ) {
            return scale.range(range);
        } else {
            return scale.rangeBands(range, padRatio);
        }
    }

    function buildTdgTitle ( buckets, keys ) {
        var names, values;
        return function (d, dynamic_keys ) {
            var str = (Array.isArray(dynamic_keys) ? keys.concat(dynamic_keys) : keys)
                .reduce(function (str, key, idx) {
                    if ( idx ) {
                        str += '<br/>';
                    }
                    if ( typeof key === 'string' ) {
                        names = Array.isArray(buckets[key]) ? buckets[key] : [buckets[key]];
                        values = Array.isArray(d[key]) ? d[key] : [d[key]];
                    } else if ( key && typeof key.name === 'string' && key.idx != null ) {
                        names = Array.isArray(buckets[key.name]) ? buckets[key.name] : [buckets[key.name]];
                        values = Array.isArray(d[key.name]) ? d[key.name] : [d[key.name]];
                        names = [names[key.idx]];
                        values = [values[key.idx]];
                    }

                    return names.reduce(function ( str, bucket_name, idx ) {
                            str += '<b>' + bucket_name + ': </b>';
                            str += values[idx];
                            return str;
                        }, str);
                }, '<div style="padding: 5px">');

            str += '</div>';
            return str;
        };
    }

    // HAVENT FINISHED ! ! !
    function getRanges ( data, props, numScale, ordScale ) {
        var buckets = props.buckets,
            isInvert = props.axes.invert;

        var rangeBand = ordScale.rangeBand(),
            tdgtitle = buildTdgTitle(buckets, ['group', 'max', 'min']);

        return data.filter(function ( d ) {
            return d.min != null && d.max != null;
        }).map(function ( d ) {
            var maxPos = numScale(d.max),
                minPos = numScale(d.min);

            var res = {
                x: isInvert ? minPos : ordScale(d.group),
                y: isInvert ? ordScale(d.group) : maxPos,
                width: isInvert ? Math.abs(maxPos - minPos) : rangeBand,
                height: isInvert ? rangeBand : Math.abs(maxPos - minPos)
            };

            if ( props.canvas.ranges.tooltip.enabled ) {
                res.tdgtitle = tdgtitle(d);
            }

            return res;
        });
    }

    function getSymbolsByMarkerSeries ( markersBucket, symbols ) {
        var res = [],
            symbs = symbols,
            multip = Math.floor( markersBucket.length / symbs.length ),
            rest = markersBucket.length % symbs.length;

        var i,
            len = multip * markersBucket.length;

        for ( i = 0; i < len; i++ ) {
            res.push(symbs[ i % symbs.length ]);
        }

        for ( ; i < rest; i++ ) {
            res.push(symbs[ i % symbs.length ]);
        }

        return res;
    }

    function getMarkersColorScale (colors) {
        if ( Array.isArray(colors) ) {
            return d3.scale.category20().range(colors);
        } else {
            return d3.scale.category20();
        }
    }

    function getMarkers ( data, props, numScale, ordScale ) {
        var buckets = props.buckets,
            isInvert = props.axes.invert;

        var halfBand = ordScale.rangeBand() / 2,
            symbols = getSymbolsByMarkerSeries(props.buckets.markers || [], props.canvas.markers.symbols),
            color = getMarkersColorScale(props.canvas.markers.colors),
            tdgtitle = buildTdgTitle(buckets, ['group']);

        return data.filter(function (d) {
            return d.markers != null && d.group != null;
        }).reduce(function ( res, d ) {
            var markers = ( Array.isArray(d.markers) ? d.markers : [d.markers] )
                .map(function (value, sidx) {
                    var res = {
                        x : isInvert ? numScale(value) : ordScale(d.group) + halfBand,
                        y : isInvert ? ordScale(d.group) + halfBand : numScale(value),
                        series : sidx,
                        symbol : symbols[ sidx % symbols.length ],
                        color : color(sidx)
                    };

                    if ( props.canvas.markers.tooltip.enabled ) {
                        res.tdgtitle = tdgtitle(d, [{name: 'markers', idx: sidx}]);
                    }

                    return res;
            });

            return res.concat(markers);

        }, []);
        
    }

    function hasLegend (props) {
        return Array.isArray(props.buckets.markers) && props.buckets.markers.length;
    }

    function legend (data, props, pad) {
        var symbols = getSymbolsByMarkerSeries(props.buckets.markers || [], props.canvas.markers.symbols),
            color = getMarkersColorScale(props.canvas.markers.colors);

        var seriesLbls = props.buckets.markers.slice();

        var lblsDims = seriesLbls.map(function (lbl) {
            return props.measureLabel(lbl, props.legend.labels.font);
        });

        var lblsHorizSpace = d3.max(lblsDims, function (dim) {
            return dim.width;
        });

        var lblMaxHeight = props.measureLabel('W', props.legend.labels.font).height;
        var markerDiameter = props.canvas.markers.size * 2;
        
        var rowHeight = Math.max(
            markerDiameter,
            lblMaxHeight
        );

        var width = pad + markerDiameter + pad + lblsHorizSpace + pad,
            height = pad * (seriesLbls.length + 1) + seriesLbls.length * rowHeight;

        var markerOffset = props.canvas.markers.size,
            lblLeftOffset = markerOffset + props.canvas.markers.size;

        var rows = seriesLbls.map(function (lbl, idx) {
            return {
                x : pad,
                y : pad * ( idx + 1 ) + rowHeight * idx,
                marker : {
                    x : markerOffset,
                    y : markerOffset,
                    color : color(idx),
                    symbol : symbols[idx]
                },
                label : {
                    x : lblLeftOffset,
                    y : markerOffset,
                    text: lbl
                }
            };
        });

        return {
            type: 'legend',
            x : props.width - width,
            y : ( props.height - height ) / 2,
            width : width,
            height : height,
            rows : rows
        };
        
    }

    // make a copy of initial properties
    // this way we can modify props object
    // without worrying about modifying original properties
    function copyProps (props) {
        var cp = JSON.parse(JSON.stringify(props));
        cp.measureLabel = props.measureLabel;
        cp.formatNumber = props.formatNumber;
        return cp;
    }

    function getVertAxisTitleLayout ( scale, props, innerProps, axisLength ) {
        var titleText = getAxisTitleText(scale, props.buckets);

        var titleOffset = getVertAxisWidth(
            scale,
            props,
            innerProps,
            true // do not include title height and pad
        );

        return {
            y: axisLength / 2,
            x: titleOffset,
            text: titleText
        };
    }

    function getHorizAxisTitleLayout ( scale, props, innerProps, axisLength ) {
        var titleText = getAxisTitleText(scale, props.buckets);

        var titleOffset = getHorizAxisHeight(
            scale,
            props,
            innerProps,
            true // don't include title height and pad
        );

        return {
            y: titleOffset,
            x: axisLength / 2,
            text: titleText
        };

    }

    function getAxisTitleLayout ( scale, props, innerProps, axisLength, type ) {
        if ( !hasAxisTitle( scale, props.buckets ) ) return null;

        if ( type === 'horizontal' ) {
            return getHorizAxisTitleLayout(scale, props, innerProps, axisLength);
        } else if ( type === 'vertical' ) {
            return getVertAxisTitleLayout(scale, props, innerProps, axisLength);
        }
    }

    function getPadRatio ( widthRatio ) {
        return Math.abs(1 - widthRatio);
    }

    function layout ( data, props, innerProps ) {

        props = copyProps(props);

        var legendLayout;

        if ( hasLegend(props) ) {
            legendLayout = legend( data, props, innerProps.pad );
            props.width = props.width - legendLayout.width;
        }

        var horizAxisHeight, vertAxisWidth,
            horizAxisLayout, vertAxisLayout,
            numScale = getNumScale(data),
            ordScale = getOrdScale(data);

        // CALCULATE HEIGHT OF THE HORIZONTAL AXIS AND
        // WIDTH OF THE VERTICAL AXIS

        horizAxisHeight = getHorizAxisHeight(
            props.axes.invert ? numScale : ordScale,
            props,
            innerProps
        );

        vertAxisWidth = getVertAxisWidth(
            props.axes.invert ? ordScale : numScale,
            props,
            innerProps
        );

        // CALCULATE LAYOUT OF THE VERTICAL AXIS

        vertAxisLayout = {
            type: 'axis-vert',
            x: 0,
            y: innerProps.offset.top,
            width: vertAxisWidth,
            height: props.height - horizAxisHeight - innerProps.offset.top
        };

        vertAxisLayout.scale = setScaleRange(
            props.axes.invert ? ordScale : numScale,
            [vertAxisLayout.height, 0],
            getPadRatio(props.canvas.ranges.widthRatio)
        );

        vertAxisLayout.labels = getAxisLabels(vertAxisLayout.scale, props);

        /*if ( hasAxisTitle( vertAxisLayout.scale, props.buckets ) ) {
            vertAxisLayout.title = getVertAxisTitleLayout( vertAxisLayout.scale, props, innerProps, vertAxisLayout.height );
        }*/

        vertAxisLayout.title = getAxisTitleLayout(
            vertAxisLayout.scale,
            props,
            innerProps,
            vertAxisLayout.height,
            'vertical'
        );

        // CALCULATE LAYOUT OF THE HORIZONTAL AXIS

        horizAxisLayout = {
            type: 'axis-horiz',
            x: vertAxisWidth,
            y: vertAxisLayout.height + vertAxisLayout.y,
            width: props.width - vertAxisWidth - innerProps.offset.right,
            height: horizAxisHeight
        };

        horizAxisLayout.scale = setScaleRange(
            props.axes.invert ? numScale : ordScale,
            [0, horizAxisLayout.width],
            getPadRatio(props.canvas.ranges.widthRatio)
        );

        horizAxisLayout.labels = getAxisLabels(horizAxisLayout.scale, props);

        /*if ( hasAxisTitle(horizAxisLayout.scale, props.buckets) ) {
            horizAxisLayout.title = getHorizAxisTitleLayout( horizAxisLayout.scale, props, innerProps, horizAxisLayout.width );
        }*/

        horizAxisLayout.title = getAxisTitleLayout(
            horizAxisLayout.scale,
            props,
            innerProps,
            horizAxisLayout.width,
            'horizontal'
        );

        // CACLULATE LAYOUT OF RANGES

        var ranges = getRanges(data, props, numScale, ordScale);

        var markers = getMarkers(data, props, numScale, ordScale);

        return {
            axes: {
                horizontal: horizAxisLayout,
                vertical: vertAxisLayout
            },
            canvas: {
                type: 'canvas',
                x: vertAxisLayout.width,
                y: innerProps.offset.top,
                width: horizAxisLayout.width,
                height: vertAxisLayout.height,
                ranges: ranges,
                markers: markers
            },
            legend: legendLayout
        };
    }

    function renderAxisTitle ( group, layout, props, type ) {
        var title = group.select('g.title');
        if ( title.empty() ) {

            var group_title = group.append('g').classed('title', true);
            var text = group_title.append('text').text(layout.title.text);

            if ( type === 'vertical' ) {
                group_title.attr(
                    'transform',
                    'rotate(-90) translate(' + [ -layout.title.y, -layout.title.x ] + ')'
                );
                text.style({
                    'text-anchor' : 'middle',
                    'font' : props.axes.ordinal.title.font,
                    'fill' : props.axes.ordinal.title.color
                });
            } else {
                group_title.attr(
                    'transform',
                    'translate(' + [layout.title.x, layout.title.y] + ')'
                );
                
                text.attr('dy', '1em')
                    .style({
                        'text-anchor' : 'middle',
                        'font' : props.axes.ordinal.title.font,
                        'fill' : props.axes.ordinal.title.color
                    });
            }
        }
    }

    function renderAxis ( group, layout, props, innerProps, type ) {
        var transform = type === 'vertical'
            ? 'translate(' + [layout.x + layout.width, layout.y] + ')'
            : 'translate(' + [layout.x, layout.y] + ')';

        group.classed(layout.type, true)
            .attr('transform', transform);

        // start debugging background
        
        /*group.append('rect')
            .attr({
                x: type === 'vertical' ? d=>-d.width : 0,
                width: d=>d.width,
                height: d=>d.height,
                fill: d=>d.scale.color
            });*/

        // end debugging background

        var orient = type === 'vertical' ? 'left' : 'bottom';

        var axis = d3.svg.axis()
            .scale(layout.scale)
            .orient(orient)
            .tickPadding( innerProps.pad )
            .tickSize(innerProps.tickSize);

        if ( layout.scale.type === 'numerical' ) {
            axis
                .tickValues( layout.scale.ticks() )
                .tickFormat(function (d, i) {
                    return layout.labels[i];
                });
        }

        group.call(axis);

        // start apply styles to axis

        group.selectAll('g.tick>line')
            .style('stroke', 'black');

        group.selectAll('g.tick>text')
            .style({
                fill : 'black',
                font : props.axes[layout.scale.type].labels.font
            });

        group.select('path.domain')
            .style('stroke', 'black');

        // end apply styles to axis

        if ( layout.title != null ) {
            renderAxisTitle(group, layout, props, type);
        }
    }

    function renderCanvas ( group, layout, props, innerProps ) {
        group.classed(layout.type, true)
            .attr('transform', 'translate(' + [ layout.x, layout.y ] + ')' );

        var group_ranges = group.select('g.ranges');

        if (group_ranges.empty()) {
            group_ranges = group.append('g').classed('ranges' , true);
        }

        var ranges = group_ranges.selectAll('rect.range')
            .data(layout.ranges);

        ranges.enter().append('rect').classed('range', true)
            .each(function (rectProps) {
                d3.select(this).attr(rectProps);
            })
            .style('fill', props.canvas.ranges.color);

        var group_markers = group.select('g.markers');

        if (group_markers.empty()) {
            group_markers = group.append('g').classed('markers' , true);
        }

        var markers = group_markers.selectAll('path.marker')
            .data(layout.markers);

        var symbol = d3.svg.symbol(),
            size = Math.pow(props.canvas.markers.size, 2);

        markers.enter().append('path').classed('marker', true)
            .each(function (mp) {
                d3.select(this).attr({
                    transform: 'translate(' + [mp.x, mp.y] + ')',
                    d: symbol.type(mp.symbol).size(size),
                    fill: mp.color,
                    tdgtitle: mp.tdgtitle
                });
            })
            .style({
                stroke: props.canvas.markers.stroke,
                'stroke-width': props.canvas.markers.strokeWidth
            });
        
    }

    function renderLegend ( group, layout, props, innerProps ) {
        group.classed(layout.type, true)
            .attr(
                'transform',
                'translate(' + [layout.x, layout.y] + ')'
            );

        // start debugging background

        /*group.append('rect')
            .each(function (l) {
                d3.select(this).attr({
                    width: l.width,
                    height: l.height
                });
            })
            .style('fill', 'lightgreen');*/

        // end debugging background

        var rows = group.selectAll('g.row')
            .data(layout.rows);

        var symbol = d3.svg.symbol()
            .size( Math.pow(props.canvas.markers.size, 2) );

        var rows_enter = rows.enter().append('g')
            .classed('row', true)
            .attr('transform', function (d) {
                return 'translate(' + [d.x, d.y] + ')';
            });

        rows_enter.append('path')
            .datum(function (d) {
                return d.marker;
            })
            .each(function ( d ) {
                d3.select(this).attr({
                    d: symbol.type(d.symbol),
                    transform: 'translate(' + [d.x, d.y] + ')',
                    fill: d.color
                });
            })
            .style({
                stroke: props.canvas.markers.stroke,
                'stroke-width': props.canvas.markers.strokeWidth
            });

        rows_enter.append('text')
            .datum(function (d) {
                return d.label;
            })
            .each(function ( d ) {
                d3.select(this).attr({
                    x: d.x,
                    y: d.y,
                    dy: '.35em'
                })
                .text(d.text);
            })
            .style({
                font: props.legend.labels.font,
                fill: props.legend.labels.color
            });


    }

    function renderGroups ( props, innerProps ) {
        return function ( layout ) {
            switch ( layout.type ) {
                case 'axis-vert':
                    renderAxis(d3.select(this), layout, props, innerProps, 'vertical');
                    break;
                case 'axis-horiz':
                    renderAxis(d3.select(this), layout, props, innerProps, 'horizontal');
                    break;
                case 'canvas':
                    renderCanvas(d3.select(this), layout, props, innerProps);
                    break;
                case 'legend':
                    renderLegend(d3.select(this), layout, props, innerProps);
                    break;
            }
        };
    }

    function render ( group_main, layout, props, innerProps ) {

        var layouts = [
                layout.canvas,
                layout.axes.vertical,
                layout.axes.horizontal
            ];

        if ( layout.legend ) {
            layouts.push(layout.legend);
        }

        var groups = group_main.selectAll('g')
            .data(layouts);

        var groups_enter = groups.enter()
            .append('g')
            .each(renderGroups(props, innerProps));

        
    }

    function behaviors ( group_main ) {

        function fade ( opacity, selection ) {
            return function () {
                selection.each(function () {
                    if ( d3.event.target !== this ) {
                        d3.select(this).transition()
                            .style('opacity', opacity);
                    }
                });
            };
        }

        // ranges hover
        var range = group_main.selectAll('g.ranges > rect.range');
        
        range.on('mouseover', fade(0.3, range))
            .on('mouseout', fade(1, range));
        // markers hover
        var marker = group_main.selectAll('g.markers > path.marker');
        
        marker.on('mouseover', fade(0.3, marker))
            .on('mouseout', fade(1, marker));
    }

    // --------------------------------- END OF Z1
    return function(user_props) {
        var props = {
            width: 300,
            height: 400,
            data: [],
            buckets: [],
            measureLabel: null,
            formatNumber: null,
            axes: {
                invert: false,
                numerical : {
                    labels: {
                        format: 'auto',
                        font: '12px sans-serif'
                    }
                },
                ordinal: {
                    labels: {
                        format: 'auto',
                        font: '12px sans-serif'
                    },
                    title: {
                        font: '14px sans-serif',
                        color: 'black'
                    }
                }
            },
            canvas: {
                ranges: {
                    color: 'pink',
                    widthRatio: 0.9,
                    tooltip: {
                        enabled: true
                    }
                },
                markers: {
                    size: 5,
                    stroke: 'black',
                    strokeWidth: 1,
                    colors: ["#1f77b4", "#ff7f0e", "#2ca02c", "#d62728", "#9467bd", "#8c564b", "#e377c2", "#7f7f7f", "#bcbd22", "#17becf"],
                    symbols: ["circle", "diamond", "square", "cross" , "triangle-down", "triangle-up"],
                    tooltip: {
                        enabled: true
                    }
                }
            },
            legend: {
                labels: {
                    font: '12px serif',
                    color: 'black'
                }
            }
        };

        var innerProps = {
            pad: 5,
            tickSize: 5,
            offset: {
                top: 10,
                right: 10
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
            var group_main = selection.append('g')
                .classed('group-main', true);

            var data = getCleanData( props.data );
            if (!data.length) return;

            var l = layout(data, props, innerProps);

            render( group_main, l, props, innerProps );

            behaviors( group_main );
        }

        for (var attr in props) {
            if ((!chart[attr]) && (props.hasOwnProperty(attr))) {
                chart[attr] = createAccessor(attr);
            }
        }

        return chart;
    };
})();
