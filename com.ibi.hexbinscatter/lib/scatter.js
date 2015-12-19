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
            circles: {
                radius: 3
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
            }
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
                    fill : 'black'
                })
                .text(props.axes.y.title);
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

            var circles = tdgscatter.circles.init({
                x: xscale,
                y: yscale,
                data: data,
                radius: props.circles.radius
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
                .call(hexbinbg)
                .call(circles);


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
