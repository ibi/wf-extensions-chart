(function() {
    tdgscatter = typeof tdgscatter !== 'undefined' ? tdgscatter : {};
    tdgscatter.init = scatterInit;

    function isNumber(d) {
        return !isNaN(d);
    }

    function scatterInit(config) {

        var props = {
            width: 400,
            height: 300,
            data: [],
            buckets: null,
            circles: {
                hide: false,
                radius: 3,
                opacity: 0.8,
                color: "grey"
            },
            axes: {
                x: {
                    title: null
                },
                y: {
                    title: null
                }
            },
            hexbin: {
                mesh: false,
                radius: 20,
                colors: ['white', 'steelblue'],
                aggregateBy: null
            },
            colorLegend: {
                enabled: true,
                background: {
                    color: 'none'
                },
                border: {
                    color: 'black',
                    width: 1,
                    round: 2
                },
                title: {
                    font: '16px serif',
                    color: 'black'
                },
                rows: {
                    count: 3,
                    labels: {
                        font: '10px serif',
                        color: 'black',
                        format: 'auto'
                    }
                }
            },
            measureLabel: null,
            formatNumber: null
        };

        var innerProps = {
            hexbin: {
                aggregateBy: 'aggregate'
            },
            margins: {
                top: 5,
                bottom: 30,
                left: 45,
                right: 40
            },
            pad: 5,
            colorLegend: {
                maxHeight: 200
            }
        };

        if (config && config.constructor === Object) {
            for (var key in config) {
                if (config.hasOwnProperty(key)) {
                    props[key] = config[key];
                }
            }
        }

        function fixMarginProps(canvasContent, maingGroup) {
            var axisPad = 5;

            var xAxisHeight = d3.max(canvasContent.selectAll('g .x-axis text')[0], function(text) {
                return text.getBBox().height;
            });

            var yAxisWidth = d3.max(canvasContent.selectAll('g .y-axis text')[0], function(text) {
                return text.getBBox().width;
            });

            var xAxisTitle = maingGroup.select('x-axis-title');
            var xAxisTitleHeight = 0;
            if (!xAxisTitle.empty()) {
                xAxisTitleHeight = xAxisTitle.node().getBBox().height;
            }

            var yAxisTitle = maingGroup.select('.y-axis-title');
            var yAxisTitleHeight = 0;
            if (!yAxisTitle.empty()) {
                yAxisTitleHeight = yAxisTitle.node().getBBox().height;
            }

            innerProps.margins.left = yAxisWidth + 2 * axisPad + 6 + yAxisTitleHeight;
            innerProps.margins.bottom = xAxisHeight + 2 * axisPad + 6 + xAxisTitleHeight;
        }

        function renderAxesTitles (mainGroup) {
            var axesTitles = mainGroup.append('g').classed('axes-titles', true);
            
            axesTitles.append('g').classed('x-axis-title', true)
                .attr({
                    'transform' : 'translate(' + [ props.width / 2, props.height ] + ')'
                })
                .append('text')
                .style({
                    'text-anchor' : 'middle',
                    'font-weight' : 'bold',
                    fill : 'black'
                })
                .text(props.axes.x.title);

            axesTitles.append('g').classed('y-axis-title', true)
                .attr({
                    'transform' : 'translate(' + [ 0, props.height / 2 ] + ') rotate(-90)',
                })
                .append('text')
                .attr({
                    dy: '1em'
                })
                .style({
                    'text-anchor' : 'middle',
                    'font-weight' : 'bold',
                    fill : 'black'
                })
                .text(props.axes.y.title);
        }

        function getClrLegendLayout (clrScale, props, innerProps) {
            
            clrScale.nice(); // nice color scale just in case

            var pad = innerProps.pad;

            var titleText = Array.isArray(props.buckets.aggregate) ? props.buckets.aggregate[0] : 'Markers Count';

            var titleDim = props.measureLabel(titleText, props.colorLegend.title.font);

            var ticksCount = typeof props.colorLegend.rows.count === 'number'
                ? props.colorLegend.rows.count
                : null;

            var extent = clrScale.domain();

            var values = d3.scale.linear()
                .domain(extent)
                .nice()
                .ticks(ticksCount);

            var frmtCnfg = { min: extent[0], max: extent[1] };

            var lblsDims = values.map(function (lbl) {
                var lbl = props.formatNumber( lbl, props.colorLegend.rows.labels.format, frmtCnfg );
                return props.measureLabel(lbl, props.colorLegend.rows.label);
            });

            var lblsHorizSpace = d3.max(lblsDims, function(dim){ return dim.width; });

            var lgndVertSpace = Math.min(props.height, innerProps.colorLegend.maxHeight);

            var rowsTopOffset = titleDim.height + 2 * pad;

            var rowsVertSpace = lgndVertSpace - rowsTopOffset - pad;

            var rowsPosScale = d3.scale.ordinal()
                .domain(values)
                .rangeBands([rowsVertSpace, 0], 0);

            var band = rowsPosScale.rangeBand();

            var rows = values.map(function (value) {
                
                return {
                    translate: [ pad, rowsTopOffset + rowsPosScale(value) ],
                    marker: {
                        width: band,
                        height: band,
                        color: clrScale(value)
                    },
                    label: {
                        x: band + pad,
                        y: band / 2,
                        text: props.formatNumber(
                                value,
                                props.colorLegend.rows.labels.format,
                                frmtCnfg )
                    }
                };
            });

            var lgndWidth = Math.max(band + lblsHorizSpace + 3 * pad, titleDim.width + 2 * pad);

            return {
                width: lgndWidth,
                height: lgndVertSpace,
                title: {
                    text: titleText,
                    translate: [lgndWidth / 2, pad + titleDim.height / 2]
                },
                rows: rows
            };
        }

        function renderLegend (group_legend, legendLayout, props) {
        
            var bg = group_legend
                .append('rect')
                .attr({
                    width: legendLayout.width,
                    height: legendLayout.height,
                    rx: props.colorLegend.border.round,
                    ry: props.colorLegend.border.round
                })
                .style({
                    fill: props.colorLegend.background.color,
                    stroke: props.colorLegend.border.color,
                    'stroke-width': props.colorLegend.border.width
                });

            group_legend
                .append('g')
                .classed('title', true)
                .attr('transform', 'translate(' + legendLayout.title.translate + ')')
                .append('text')
                .attr('dy', '.35em')
                .style({
                    font: props.colorLegend.title.font,
                    fill: props.colorLegend.title.color,
                    'text-anchor': 'middle'
                })
                .text(legendLayout.title.text);

            var group_rows = group_legend
                .append('g')
                .classed('rows', true);

            var rows = group_rows.selectAll('g.row')
                .data(legendLayout.rows);

            var rows_enter = rows.enter().append('g')
                .classed('row', true)
                .attr('transform', function (d) {
                    return 'translate(' + d.translate + ')';
                });

            rows_enter.append('rect')
                .datum(function (d) {
                    return d.marker;
                })
                .each(function (d) {
                    d3.select(this).attr({
                        width: d.width,
                        height: d.height,
                        fill: d.color
                    });
                });

            rows_enter.append('text')
                .datum(function (d) {
                    return d.label;
                })
                .each(function (d) {
                    d3.select(this).attr({
                        x: d.x,
                        y: d.y,
                        dy: '.35em'
                    })
                    .style({
                        font: props.colorLegend.rows.labels.font,
                        fill: props.colorLegend.rows.labels.color
                    })
                    .text(d.text);
                });
        }
        // this is the hack to get color scale domain
        // we create and render a hexbinbg and the extract the color scale from it
        function getColorScale (group_main, data, props) {
            var hexbinbg = tdgscatter.hexbinbg.init({
                x: getScale(data, 'x'),
                y: getScale(data, 'y'),
                data: data,
                mesh: props.hexbin.mesh,
                radius: props.hexbin.radius,
                colors: props.hexbin.colors,
                aggregateBy: innerProps.hexbin.aggregateBy
            });

            var temp_group = group_main.append('g').call(hexbinbg);

            var clrScale = hexbinbg.getColorScale();

            temp_group.remove();

            return clrScale;
        }

        return function(d3_container) {
            var containerProps = {};
            var mainGroup = d3_container.selectAll("g.tdgscatter-main")
                .data([containerProps]);

            if (!Array.isArray(props.data) || !props.data.length) {
                return;
            }

            var mainGroupEnter = mainGroup.enter()
                .append('g').classed("tdgscatter-main", true);

            var data = props.data.filter(function(d) {
                return isNumber(d.x) && isNumber(d.y);
            });

            if (props.colorLegend.enabled) {
                var colorScale = getColorScale(mainGroup, data, props);

                var legendLayout = getClrLegendLayout(colorScale, props, innerProps);

                var group_legend = d3_container.append('g')
                    .classed('group-legend', true)
                    .attr(
                        'transform',
                        'translate(' + [ props.width - legendLayout.width - innerProps.pad, ( props.height - legendLayout.height ) / 2 ] + ')'
                    );

                renderLegend(group_legend, legendLayout, props);

                innerProps.margins.right += legendLayout.width + innerProps.pad * 2;
            }

            var xscale = getScale(data, 'x');
            var yscale = getScale(data, 'y');

            var axesProps = JSON.parse(JSON.stringify(props.axes));
            axesProps.x.scale = xscale;
            axesProps.y.scale = yscale;

            var axes = tdgscatter.axes.init(axesProps);

            var canvasContent = mainGroupEnter.append('g')
                .classed('canvas', true)
                .call(axes); // this will render axes            

            renderAxesTitles(mainGroupEnter);

            fixMarginProps(canvasContent, mainGroupEnter);

            canvasContent.attr({
                'transform': 'translate(' + [innerProps.margins.left, innerProps.margins.top] + ')'
            });

            var hexbinbg = tdgscatter.hexbinbg.init({
                x: xscale,
                y: yscale,
                data: data,
                mesh: props.hexbin.mesh,
                radius: props.hexbin.radius,
                colors: props.hexbin.colors,
                aggregateBy: innerProps.hexbin.aggregateBy
            });

            defineCanvasClip(d3_container); // defines clip-path that we will use to clip canvas

            canvasContent
                .append('g').classed('canvas-content', true)
                .attr("clip-path", "url(#canvas-clip)") // this will make sure that nothing is rendered outside of canvas
                .call(hexbinbg);

            if ( !props.circles.hide ) {
                var circles = tdgscatter.circles.init({
                    x: xscale,
                    y: yscale,
                    data: data,
                    radius: props.circles.radius,
                    opacity: props.circles.opacity,
                    color: props.circles.color
                });

                canvasContent.call(circles);
            }
        };

        function defineCanvasClip(d3_container) {
            var padding = 0;
            d3_container.append("defs")
                .append("clipPath")
                .attr("id", "canvas-clip")
                .append("rect")
                .attr("x", -padding)
                .attr("y", -padding)
                .attr("width", canvasWidth() + 2 * padding)
                .attr("height", canvasHeight() + 2 * padding);
        }

        function getScale(data, type) {
            var domain, range;
            if (type === 'y') {
                domain = d3.extent(data, function(d) {
                    return d.y;
                });
                range = [canvasHeight(), 0];
            } else {
                domain = d3.extent(data, function(d) {
                    return d.x;
                });
                range = [0, canvasWidth()];
            }

            if (domain[0] === domain[1]) {
                domain[0] -= 1;
                domain[1] += 1;
            }

            var offset = Math.abs(domain[1] - domain[0]) * 0.05;

            domain[0] -= offset;
            domain[1] += offset;

            return d3.scale.linear().domain(domain).range(range).nice();
        }

        function canvasWidth() {
            return props.width - innerProps.margins.left - innerProps.margins.right;
        }

        function canvasHeight() {
            return props.height - innerProps.margins.top - innerProps.margins.bottom;
        }

    }
})();
