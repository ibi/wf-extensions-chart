(function() {
    tdgscatter = typeof tdgscatter !== 'undefined' ? tdgscatter : {};
    tdgscatter.hexbinbg = tdgscatter.hexbinbg || {};
    tdgscatter.hexbinbg.init = hexbinBGInit;

    function hexbinBGInit(config) {

        var props = {
            x: null,
            y: null,
            data: [],
            radius: 20,
            colors: ["white", "steelblue"],
            aggregateBy: null, // if null than we aggregate by count
            mesh: false
        };

        var innerProps = {
            domain: null,
            colorScale: null
        };

        if (config && config.constructor === Object) {
            for (var key in config) {
                if (config.hasOwnProperty(key)) {
                    props[key] = config[key];
                }
            }
        }

        function hexbinBackground(d3_container) {
            var hexbin_group = d3_container.append('g').classed("hexbin-background", true);

            if (!props.x || !props.y) {
                return;
            }

            var xrange = props.x.range();
            var yrange = props.y.range();

            var width = Math.abs(xrange[1] - xrange[0]);
            var height = Math.abs(yrange[1] - yrange[0]);

            var hexbin = d3.hexbin()
                .size([width, height])
                .radius(props.radius);

            var data = props.data.map(function(d, idx) {
                return [props.x(d.x), props.y(d.y), idx, d[props.aggregateBy]];
            });

            var hexbinData = hexbin(data);

            innerProps.domain = getColorScaleDomain(hexbinData, data, props.colors);

            var color = innerProps.colorScale = d3.scale.linear()
                .domain(innerProps.domain)
                .range(props.colors)
                .interpolate(d3.interpolateLab);

            hexbin_group
                .selectAll(".hexagon")
                .data(hexbinData)
                .enter().append("path")
                .attr("class", "hexagon")
                .attr("d", hexbin.hexagon())
                .attr("transform", function(d) {
                    return "translate(" + [d.x, d.y] + ")";
                })
                .style('fill', function(bin) {
                    if (isAggregatable(hexbinData)) {
                        return color(d3.sum(bin, function(d) {
                            return d[3] || 0;
                        }));
                    } else {
                        return color(bin.length);
                    }
                });

            if (props.mesh && hexbin_group.select('path.mesh').empty()) {
                hexbin_group.append('path').classed('mesh', true)
                    .attr('d', hexbin.mesh())
                    .style('fill', 'none')
                    .style('stroke', 'black');
            }

        }

        hexbinBackground.getDomain = function () {
            return innerProps.domain;
        };

        hexbinBackground.getColorScale = function () {
            return innerProps.colorScale.copy();
        };

        function isAggregatable (hexbinData) {
            return props.aggregateBy && hexbinData.some(function(d){
                return d.some(function (d) {
                    return d[3] != null;
                });
            });
        }

        function getColorScaleDomain(hexbinData, data, colorRange) {
            var extent;
            if (isAggregatable(hexbinData)) {
                extent = [0, d3.max(hexbinData, function(bin) {
                    return d3.sum(bin, function(d) {
                        return d[3] || 0;
                    });
                })];
            } else {
                extent = [0, d3.max(hexbinData, function(d) {
                    return d.length;
                })];
            }

            var ratio = d3.scale.ordinal().domain(colorRange).rangePoints(extent, 0);

            var domain = colorRange.map(function (color) {
                return ratio(color);
            });

            return domain;
        }

        return hexbinBackground;
    }
})();