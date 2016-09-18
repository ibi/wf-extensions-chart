/* jshint eqnull:true*/
/* globals d3*/

var tdg_usmap = (function() { // <---------------------------------------- CHANGE ME

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
    function getProjection(states, width, height) {
        var projection = (true) ? d3.geo.albersUsa() : d3.geo.albers();

        projection.scale(1)
            .translate([0, 0]);

        var path = d3.geo.path().projection(projection);

        var b = path.bounds(states),
            s = 0.95 / Math.max((b[1][0] - b[0][0]) / width, (b[1][1] - b[0][1]) / height),
            t = [(width - s * (b[1][0] + b[0][0])) / 2, (height - s * (b[1][1] + b[0][1])) / 2];

        projection
            .scale(s)
            .translate(t);

        return projection;
    }

    function renderStates(states_group, states, projection, colored) {
        var path = d3.geo.path().projection(projection);
        var states_enter = states_group.selectAll("path")
            .data(states.features)
            .enter().append("path")
            .attr("d", path)
            .style('stroke', '#fff');

        if ( colored ) {
            var color = d3.scale.category20b();
            var neighbors = [
                [2, 8],
                [2, 3, 9, 13],
                [0, 1, 8, 13, 22, 23],
                [1, 4, 9],
                [3, 7, 9, 14],
                [10],
                [7, 24, 25],
                [4, 6, 14, 17],
                [0, 2, 21, 23],
                [1, 3, 4, 13, 14, 15],
                [5, 11, 16],
                [10, 12, 16],
                [11, 16, 18, 19, 26],
                [1, 2, 9, 15, 22, 27],
                [4, 7, 9, 15, 17, 29],
                [9, 13, 14, 27, 29, 30],
                [10, 11, 12, 19, 20],
                [7, 14, 25, 29, 34],
                [12, 24, 26, 28, 31, 32],
                [12, 16, 20],
                [16, 19],
                [8, 23, 36],
                [2, 13, 23, 27, 36],
                [2, 8, 21, 22, 36],
                [6, 18, 25, 28, 34],
                [6, 17, 24, 34],
                [12, 18, 31],
                [13, 15, 22, 30, 37, 38],
                [18, 24, 32, 33, 34],
                [14, 15, 17, 30, 34, 37, 39, 42],
                [15, 27, 29, 37],
                [18, 26, 32],
                [18, 28, 31, 33, 35],
                [28, 32, 34, 35, 39, 40],
                [17, 24, 25, 28, 29, 33, 39],
                [32, 33],
                [21, 22, 23, 38],
                [27, 29, 30, 38, 41, 42],
                [27, 36, 37, 41],
                [29, 33, 34, 40, 42, 44, 45, 46],
                [33, 39, 43, 45],
                [37, 38, 42, 47],
                [29, 37, 39, 41, 46, 47],
                [40, 45],
                [39, 45, 46, 48],
                [39, 40, 43, 44, 48],
                [39, 42, 44, 47],
                [41, 42, 46],
                [44, 45],
                [],
                [],
                [],
                []
            ];
            var colors = [];

            states_group.style('opacity', 0.6);
            states_enter.style({
                fill: function(d, i) {
                    return color(colors[i] = d3.max(neighbors[i], function(n) {
                        return colors[n];
                    }) + 1 | 0);
                }
            });
        } else {
            states_enter.style('fill', 'lightgrey');
        }

    }

    function isNumber(d) {
        return !isNaN(d);
    }

    function strip(str) {
        return str.replace(/[^A-z0-9]/, '').toLowerCase();
    }

    function lookupAirport(airports, str) {
        var idx = -1;
        airports.some(function(a, i) {
            if (a.lookup.indexOf(strip(str)) >= 0) {
                idx = i;
                return true;
            }
        });

        return idx >= 0 ? airports[idx] : null;
    }
    // add to properties.js: user should be able to format label. Ex. "city, abr" or "city" or "abr"
    function getNodeLabel(airp) {
        var lbl = '',
            idx = 0;
        if (airp.city) {
            lbl += airp.city;
            idx++;
        }
        if (idx > 0) {
            lbl += ', ';
        }
        if (airp.abr) {
            lbl += airp.abr;
        }
        return lbl;
    }

    function getLinkWidthScale(data, range) {
        var domain = d3.extent(data, function(d) {
            return d.width;
        });

        return d3.scale.linear().domain(domain).range(range); // add link width range to properties.js
    }

    function getLinkColorScale(data) {
        var domain = d3.extent(data, function(d) {
            return d.color;
        });

        return d3.scale.linear().domain(domain).range(['#bdbdbd', '#000']); // add link color range to properties.js
    }

    function getNodeSizeScale(data, range) {
        var domain = d3.extent(data, function(d) {
            return d.size;
        });

        return d3.scale.sqrt() /*.exponent(2)*/ .domain(domain).range(range); // add max bubble size ratio to properties.js
    }

    function getFixedData(orig_data, projection, airports, dynamicValsInfo, props) {
        var separator = props.nodes.dataSeparator;

        var nodes = [],
            links = [];
        var used_nodes = [],
            used_links = [];

        var lWidthScale = dynamicValsInfo.hasDynamicLinkWidth ? getLinkWidthScale(orig_data, props.links.widthRange) : null;
        var lColorScale = dynamicValsInfo.hasDynamicLinkColor ? getLinkColorScale(orig_data) : null;

        function addNodeToNodes(idx, lbl, pos, size) {
            nodes.push({
                idx: idx,
                label: lbl,
                pos: pos,
                size: size
            });
        }

        function addNode(str, d) {
            if (nSizeScale && d.size == null) {
                return;
            }

            var parts = str.split(separator).map(function (str) {
                return str.trim();
            });

            var airp, pos;

            if (parts.length === 3 && isNumber(parts[1]) && isNumber(parts[2])) { //user provided lon, lat
                // parts[0] is a label
                pos = projection([+parts[1], +parts[2]]);
                if (pos) {
                    addNodeToNodes(nodes.length, parts[0], pos, d.size);
                    return 1;
                }
            } else if (parts.length === 1) { //try to find
                // parts[0] is a label and a name to lookup
                airp = lookupAirport(airports, parts[0]);
                if (airp) {
                    pos = projection([+airp.lon, +airp.lat]);
                    if (pos) {
                        addNodeToNodes(nodes.length, getNodeLabel(airp), pos, d.size);
                        return 1;
                    }
                }
            }
            return 0;
        }

        function aggregateNodeValues(node, d) {
            if (d.size != null) {
                node.size = (node.size != null) ? node.size : 0;
                node.size += d.size;
            }
        }

        function getSlope(dx, dy) {
            dx = (!dx) ? 0.01 : dx; // we want to avoid 0 for dx and dy because that will make slope either 0 or infinity
            dy = (!dy) ? 0.01 : dy;

            return dy / dx;
        }

        // this function adds a link to links array and also modifies nodes objects by adding targets and targetOf info
        //
        function addLink(src, dst, d) {
            // if link width is dynamic and width of the current link is undefined then we do not render this link
            if (lWidthScale && d.width == null) {
                return;
            }
            // same logic as for width
            if (lColorScale && d.color == null) {
                return;
            }

            var link = {};

            link.color = (lColorScale) ? lColorScale(d.color) : props.links.defaultColor;

            // targets and links hold indexes, that will be used to enabled interactions
            if (!src.targets) {
                src.targets = [];
            }

            src.targets.push(dst.idx);

            if (!src.links) {
                src.links = [];
            }

            src.links.push(links.length);

            link.idx = links.length;
            link.srcidx = src.idx;
            link.dstidx = dst.idx;

            link.tooltip = {};

            link.tooltip.src = src.label;
            link.tooltip.dst = dst.label;
            link.tooltip.color = d.color;
            link.tooltip.width = d.width;

            link.width = (lWidthScale) ? lWidthScale(d.width) : props.links.defaultWidth;

            link.arrow = {};

            link.arrow.height = Math.max(1.8 * link.width, 8);
            link.arrow.width = link.arrow.height;


            var dx = dst.pos[0] - src.pos[0];
            var dy = dst.pos[1] - src.pos[1];
            var slope = getSlope(dx, dy);
            var sr = src.r + 3;
            var tr = dst.r + link.arrow.width + 3;
            var dir = (dx >= 0) ? 1 : -1;

            var dxs = sr / Math.sqrt(1 + Math.pow(slope, 2)),
                dys = dxs * slope;
            var dxt = tr / Math.sqrt(1 + Math.pow(slope, 2)),
                dts = dxt * slope;

            var spos = [src.pos[0] + dir * dxs, src.pos[1] + dir * dys];
            var dpos = [dst.pos[0] - dir * dxt, dst.pos[1] - dir * dts];


            link.spos = spos;
            link.dpos = dpos;

            links.push(link);
            return 1;
        }

        var srcidx, dstidx, lidx;

        orig_data.forEach(function(d) {
            srcidx = used_nodes.indexOf(d.src);
            dstidx = used_nodes.indexOf(d.dst);
            if (d.src && srcidx < 0 && addNode(d.src, d)) {
                used_nodes.push(d.src);
            } else if (nodes[srcidx]) { // aggregate src node
                aggregateNodeValues(nodes[srcidx], d);
                //console.log("Update", d.src);
            }
            if (d.dst && dstidx < 0 && addNode(d.dst, d)) {
                used_nodes.push(d.dst);
            } else if (nodes[srcidx]) { // aggregate dst node
                //console.log("Update", d.dst);
                //aggregateNodeValues(nodes[srcidx], d);
            }
        });

        var nSizeScale = dynamicValsInfo.hasDynamicNodeSize ? getNodeSizeScale(nodes, props.nodes.sizeRange) : null;

        nodes.forEach(function(d) {
            d.tooltip = {
                size: d.size,
                src: d.label
            };
            d.r = (nSizeScale && d.size != null) ? nSizeScale(d.size) : props.nodes.defaultSize;
        });

        orig_data.forEach(function(d) {
            srcidx = used_nodes.indexOf(d.src);
            dstidx = used_nodes.indexOf(d.dst);

            if (srcidx >= 0 && dstidx >= 0) {
                lidx = used_links.indexOf(srcidx + '-' + dstidx);
                if (lidx < 0) {
                    addLink(nodes[srcidx], nodes[dstidx], d);
                    used_links.push(srcidx + '-' + dstidx);
                } else if (lidx >= 0) { // link already exist so we aggregate num props
                    console.log("Update", d.src, d.dst);
                }
            }
        });

        return {
            nodes: nodes,
            links: links
        };
    }

    function buildNodeTitle(buckets) {
        return function(d) {
            var str = '<div style="padding:5px">';
            var idx = 0;
            for (var p in d.tooltip) {
                if (buckets.hasOwnProperty(p)) {
                    if (d.tooltip[p] == null || !buckets[p]) continue;

                    if (idx) {
                        str += '<br/>';
                    }

                    str += '<b>' + buckets[p][0] + ': </b>' + d.tooltip[p];
                    idx++;
                }
            }

            str += '</div>';
            return str;
        };
    }

    function renderNodes(group, data, buckets, nodeProps) {
        var node_groups = group.selectAll('g.node')
            .data(data);

        var node_groups_enter = node_groups.enter()
            .append('g').classed('node', true)
            .attr({
                transform: function(d) {
                    return 'translate(' + [d.pos[0], d.pos[1]] + ')';
                },
                tdgtitle: buildNodeTitle(buckets)
            });

        node_groups_enter.append('circle')
            .attr('r', function(d) {
                return d.r;
            })
            .style({
                fill: nodeProps.defaultColor,
                stroke: 'black'
            });

        node_groups_enter.append('text')
            .attr({
                'text-anchor': 'middle',
                dy: '1.2em',
                y: function(d) {
                    return d.r;
                }
            })
            .style({
                fill: 'black'
            })
            .text(function(d) {
                return d.label;
            });

        return node_groups;
    }

    function addArrowMarker(defs, idx, width, height, color) {
        var id = "line_arrow_" + idx;

        defs.append("marker")
            .attr({
                "id": id,
                "viewBox": "0 -5 10 10",
                markerUnits: 'userSpaceOnUse',
                "refX": 0,
                "refY": 0,
                "markerWidth": width,
                "markerHeight": height,
                "orient": "auto"
            })
            .append("path")
            .attr("d", "M0,-5L10,0L0,5")
            .attr("class", "arrowHead")
            .style({
                fill: color,
                stroke: 'none'
            });

        return id;
    }

    function buildLinkTooltip(buckets) {
        return function(d) {
            var str = '<div style="padding:5px">';
            var idx = 0;
            var used = [];
            for (var p in d.tooltip) {
                if (buckets.hasOwnProperty(p)) {
                    if (d.tooltip[p] == null || !buckets[p]) continue;
                    if ( used.indexOf(buckets[p][0]) >= 0 ) continue;
                    used.push(buckets[p][0]);

                    if (idx) {
                        str += '<br/>';
                    }

                    str += '<b>' + buckets[p][0] + ': </b>' + d.tooltip[p];
                    idx++;
                }
            }

            str += '</div>';
            return str;
        };
    }

    function renderLinks(group, data, buckets, defs) {
        var links = group.selectAll('line')
            .data(data);

        links.enter()
            .append('line')
            .each(function(d, i) {
                d3.select(this).attr({
                    'marker-end': 'url(#' + addArrowMarker(defs, i, d.arrow.width, d.arrow.height, d.color) + ')',
                    x1: d.spos[0],
                    y1: d.spos[1],
                    x2: d.dpos[0],
                    y2: d.dpos[1]
                });
            })
            .attr('tdgtitle', buildLinkTooltip(buckets))
            .style({
                stroke: function(d) {
                    return d.color;
                },
                'stroke-width': function(d) {
                    return d.width;
                }
            });

        return links;
    }

    function nodeHover(opacity, nodes, links) {
        return function(d) {
            var fn;
            if (d.targets) {
                fn = nodes.filter(function(n, i) {
                    return d.idx !== i && d.targets.indexOf(i) < 0;
                });
            } else {
                fn = nodes.filter(function(n, i) {
                    return d.idx !== i;
                });
            }

            fn.transition('changing_nodes_opacity')
                .style('opacity', opacity);

            var fl;
            if (d.links) {
                fl = links.filter(function(l, i) {
                    return d.links.indexOf(i) < 0;
                });
            } else {
                fl = links;
            }

            fl.transition('changing_links_opacity')
                .style('opacity', opacity);
        };
    }

    function linkHover(opacity, nodes, links) {
        return function(d) {
            var fn = nodes.filter(function(n, i) {
                return d.srcidx !== i && d.dstidx !== i;
            });

            fn.transition('changing_nodes_opacity')
                .style('opacity', opacity);

            var fl = links.filter(function(l, i) {
                return d.idx !== i;
            });

            fl.transition('changing_links_opacity')
                .style('opacity', opacity);
        };
    }

    function enableInteractions(nodes, links) {
        nodes.on('mouseover', nodeHover(0.1, nodes, links));
        nodes.on('mouseout', nodeHover(1, nodes, links));

        links.on('mouseover', linkHover(0.1, nodes, links));
        links.on('mouseout', linkHover(1, nodes, links));
    }

    function getDynamicValuesInfo(data) {

        var info = {
            hasDynamicLinkWidth: false,
            hasDynamicLinkColor: false,
            hasDynamicNodeSize: false
        };

        data.some(function(d) { // iterate until the end of the data set or until all the attrs of info object are true
            if (!info.hasDynamicLinkWidth) {
                info.hasDynamicLinkWidth = d.width != null;
            }
            if (!info.hasDynamicLinkColor) {
                info.hasDynamicLinkColor = d.color != null;
            }
            if (!info.hasDynamicNodeSize) {
                info.hasDynamicNodeSize = d.size != null;
            }
            return info.hasDynamicLinkWidth && info.hasDynamicLinkColor && info.hasDynamicNodeSize;
        });

        return info;
    }

    function drawVerticalAxis(container, values, relValues, height, borderPad, measureLabel) {
        var lblPad = 5,
            tickLength = 5;
        var strokeOffset = 1;
        var axisOffset = strokeOffset + 3;
        var line, i, lProps, yPos, xPos, lbl;

        // label dimensions
        var lblDims = values.map(function(v) {
            return measureLabel(v, '12px sans-serif');
        });

        var lblSpace = d3.max(lblDims, function(dim) {
            return dim.width;
        });

        var top = borderPad + strokeOffset + lblDims[0].height / 2;
        var bottom = height - borderPad - lblDims[0].height / 2 - strokeOffset;
        var length = bottom - top;
        var hPos = axisOffset; // hPos is the right side of the color bar + a little offset
        // group
        var g = container.append('g');

        // baseline
        line = g.append('line')
            .attr({
                x1: hPos,
                y1: top - strokeOffset,
                x2: hPos,
                y2: bottom + strokeOffset
            })
            .style('stroke', 'black');

        // ticks
        for (i = 0; i < relValues.length; i++) {
            yPos = bottom - length * relValues[i];
            line = g.append('line')
                .attr({
                    x1: hPos,
                    y1: yPos,
                    x2: hPos + tickLength,
                    y2: yPos
                })
                .style('stroke', 'black');

            g.append('text').text(values[i])
                .attr({
                    x: hPos + tickLength + lblPad,
                    y: yPos,
                    dy: '.35em'
                })
                .style('fill', 'black');
        }

        return {
            g: g,
            y: top - strokeOffset,
            width: axisOffset + tickLength + lblPad + lblSpace, // doesn't include padding on the right side of the label
            height: length + 2 * strokeOffset
        };
    }

    function getRelativeValues(values) {

        var minMax = d3.extent(values);
        var start = minMax[0];
        var length = Math.abs(minMax[1] - minMax[0]);

        return values.map(function(v) { // relative value is the ratio of the value with respect to the whole domain
            return Math.abs(v - start) / length;
        });
    }

    function halfArcPath (x, y, rad) {
        return  "M" + (x - rad) + ' ' + y + ' A ' + rad + ' ' + rad + ', 0, 0, 1, ' + x + ' ' + ( y - rad );
    }

    function drawRadiusLegend(svg, titleText, x, y, values, ranges, measureLabel, legendProp) {

        var rangeExtent = d3.extent(ranges);
        var borderPad = 10,
            lblPad = 5;
        var axisLblHeight = measureLabel('1', '12px sans-serif').height;

        var scale = d3.scale.sqrt().domain(d3.extent(values)).range(rangeExtent);

        var relRanges = getRelativeValues(ranges); // values, scale

        // group
        var g = svg.append('g').classed('radiusLegend', true)
            .attr('transform', 'translate(' + [ x, y ] + ')');

        var titleGroup = g.append('g');
        var title = titleGroup.append('text')
            .style({
                'text-anchor': 'middle',
                fill: 'black',
                font: 'bold 14px sans-serif'
            })
            .text(titleText);

        var titleDim = measureLabel(titleText, 'bold 14px sans-serif');

        // axis and half arcs group
        var AHGroup = g.append('g');

        // first we create axis because radius panel width will depend on it
        var totAxisHeight = rangeExtent[1] - rangeExtent[0] + 2 * borderPad + axisLblHeight + 2;
        var axisObj = drawVerticalAxis(AHGroup, values, relRanges, totAxisHeight, borderPad, measureLabel);

        var width = Math.max(rangeExtent[1] + axisObj.width, titleDim.width) + 2 * borderPad;
        var bottomOffset = Math.max(rangeExtent[0], axisLblHeight / 2);
        var height = axisObj.height + axisLblHeight / 2 + bottomOffset + titleDim.height + 2 * borderPad;

        var bg = g.insert('rect', ':first-child')
            .attr({
                width: width,
                height: height,
                rx: 2,
                ry: 2
            })
            .style('fill', legendProp.color);

        titleGroup.attr('transform', 'translate(' + [width / 2, titleDim.height] + ')');

        var arcGroup = AHGroup.append('g')
            .attr('transform', 'translate(' + [ 0, axisObj.y + axisObj.height + rangeExtent[0] ] + ')');

        axisObj.g.attr('transform', 'translate(' + [rangeExtent[1], 0] + ')');

        AHGroup.attr('transform', 'translate(' + [(width - (rangeExtent[1] + axisObj.width)) / 2, titleDim.height] + ')');

        ranges.forEach(function(v, idx) {
            var d = halfArcPath(rangeExtent[1], 0, v);

            var arc = arcGroup.append('path')
                .attr('d', d)
                .style('stroke', 'black');
        });

        return { width: width, height: height };
    }

    function drawWidthLegend(svg, name, x, y, width, values, ranges, titleText, measureLabel, legendProps) {

        var borderPad = 10,
            lblPad = 5,
            barPad = 10;
        var axisLblHeight = measureLabel('1', '12px sans-serif').height;

        // group
        var g = svg.append('g')
            .attr('transform', 'translate(' + [x, y] + ')');

        var titleGroup = g.append('g');

        var title = titleGroup
            .append('text')
            .text(titleText || 'Line Width')
            .style({
                'text-anchor': 'middle',
                fill: 'black',
                font: 'bold 14px sans-serif'
            });

        var titleDim = measureLabel(title.text(), 'bold 14px sans-serif'); //add to properties.js

        width = Math.max(width, titleDim.width + borderPad);

        titleGroup
            .attr('transform', 'translate(' + [width / 2, titleDim.height] + ')');

        // this is the space that is required to fit bars (width bars) using certain padding

        var BAGroup = g.append('g')
            .attr('transform', 'translate(' + [borderPad, borderPad] + ')');

        var barsGroup = BAGroup.append('g');

        var bar, yPos = titleDim.height,
            offset, rangesReverse = ranges.slice().reverse();
        var barYPositions = [];
        for (var i = 0; i < rangesReverse.length; i++) {
            barYPositions.push(yPos);
            yPos += rangesReverse[i] + barPad;
        }
        // space that is required to fit all bars
        var totalBarsSpace = yPos - barPad;

        // axis ranges here are different from actual ranges because of the way axis positioned
        // axis ranges will be used to position ticks on axis
        var axisRanges = [];
        ranges.forEach(function(r, idx, arr) {
            if (idx === 0) {
                axisRanges.push(r / 2);
            } else {
                axisRanges.push(arr[idx - 1] / 2 + barPad + r / 2 + axisRanges[axisRanges.length - 1]);
            }
        });
        // draw vertical axis
        var relRanges = getRelativeValues(axisRanges);
        var axisHeight = totalBarsSpace - ranges[0] / 2 - ranges[ranges.length - 1] / 2 + axisLblHeight - titleDim.height;
        var axisObj = drawVerticalAxis(BAGroup, values, relRanges, axisHeight, 0, measureLabel);

        // draw bars
        var barWidth = width - 2 * borderPad - axisObj.width;

        for (i = 0; i < rangesReverse.length; i++) {
            barsGroup.append('rect')
                .attr({
                    y: barYPositions[i],
                    width: barWidth,
                    height: rangesReverse[i]
                })
                .style({
                    fill: 'black',
                    stroke: 'none'
                });
        }

        // position axis
        axisObj.g.attr('transform', 'translate(' + [barWidth, ranges[ranges.length - 1] / 2 - axisLblHeight / 2 + titleDim.height] + ')');

        var height = Math.max(totalBarsSpace + 2 * borderPad, axisHeight);

        // background

        var bg = g.insert('rect', ':first-child')
            .attr({
                width: width,
                height: height,
                rx: 2,
                ry: 2
            })
            .attr('fill', legendProps.color);

        return {
            width: width,
            height: height
        };
    }

    function createGradient(defs, values, ranges, lName, isVert) { // lName is the class name of the color legend group element

        var refUrl = lName + '_gradient';
        var lGrad = defs.append('linearGradient')
            .attr({
                id: refUrl,
                x1: 0,
                x2: 0,
                y1: 1,
                y2: 0
            });

        var stop;
        values.forEach(function(v, i) {
            lGrad.append('stop')
                .attr({
                    offset: (v * 100) + '%',
                    'stop-color': ranges[i]
                });
        });

        return refUrl;
    }

    function drawColorLegend(svg, defs, name, x, y, width, height, values, ranges, titleText, measureLabel, legendProp) {

        var borderPad = 10;

        var relValues = getRelativeValues(values);

        var gradRefId = createGradient(defs, relValues, ranges, name, true);
        // group

        var g = svg.append('g').classed(name, true)
            .attr('transform', 'translate(' + [x, y] + ')');

        var titleDim = measureLabel(titleText, 'bold 14px sans-serif');

        width = Math.max(width, titleDim.width + borderPad);

        var bg = g.insert('rect', ':first-child')
            .attr({
                width: width,
                height: height
            })
            .style('fill', legendProp.color);

        var titleGroup = g.append('g')
            .attr('transform', 'translate(' + [width / 2, titleDim.height] + ')');

        var title = titleGroup.append('text')
            .style({
                'text-anchor': 'middle',
                fill: 'black',
                font: 'bold 14px sans-serif'
            })
            .text(titleText);

        // axis and color bar group
        var AGGroup = g.append('g');
        //var AGGroup = svgUtil.createElement('g');

        // first we create axis because the dimensions of color bar will depend on it
        var axisObj = drawVerticalAxis(AGGroup, values, relValues, height - titleDim.height, borderPad, measureLabel);
        // color bar
        var clrBarProps = {
            width: width - 2 * borderPad - axisObj.width,
            height: axisObj.height,
            y: axisObj.y,
            fill: 'url(#' + gradRefId + ')'
        };
        AGGroup.append('rect')
            .attr(clrBarProps);

        // transform axis group so it appear on the right side of the color bar
        axisObj.g.attr('transform', 'translate(' + [clrBarProps.width, 0] + ')');

        // center axis and color bar inside of the legend
        AGGroup.attr('transform', 'translate(' + [(width - (clrBarProps.width + axisObj.width)) / 2, titleDim.height] + ')');

        return { width: width, height: height };
    }

    function renderLegends ( legends_group, defs, data, dynamicValsInfo, props, maxLegendWidth ) {
        var legendPad = 10;
        var offset = 0;
        var legendsTotHeight = 0;
        var domain;

        var wLegendProp, cLegendProp, rLegendProp;

        if ( props.legends.linkWidth.enabled && dynamicValsInfo.hasDynamicLinkWidth ) {
            domain = d3.extent(data.links, function (d) {
                return d.tooltip.width;
            });

            wLegendProp = drawWidthLegend(legends_group, 'widthLegend', 0, offset, maxLegendWidth, domain, props.links.widthRange, props.buckets.width[0], props.measureLabel, props.legends.linkWidth);
            legendsTotHeight += offset + wLegendProp.height;
            offset += wLegendProp.height + legendPad;
        }

        if ( props.legends.linkColor.enabled && dynamicValsInfo.hasDynamicLinkColor ) {
            domain = d3.extent(data.links, function (d) {
                return d.tooltip.color;
            });
            cLegendProp = drawColorLegend(legends_group, defs, 'colorLegend', 0, offset, 100, maxLegendWidth, domain, props.links.colorRange, props.buckets.color[0], props.measureLabel, props.legends.linkColor);
            legendsTotHeight = offset + cLegendProp.height;
            offset += cLegendProp.height + legendPad;
        }

        if ( props.legends.nodeSize.enabled && dynamicValsInfo.hasDynamicNodeSize ) {
            domain = d3.extent(data.nodes, function (d) {
                return d.size;
            });
            rLegendProp = drawRadiusLegend(legends_group, props.buckets.size[0], 0, offset, domain, props.nodes.sizeRange, props.measureLabel, props.legends.nodeSize);
            legendsTotHeight += rLegendProp.height;
        }

        return {
            width: maxLegendWidth,
            height: legendsTotHeight
        };
    }

    function hasLegend ( lp, dvi ) {
        return lp.enabled && ( (dvi.hasDynamicNodeSize && lp.nodeSize.enabled) || ( dvi.hasDynamicLinkWidth && lp.linkWidth.enabled ) || ( dvi.hasDynamicLinkColor && lp.linkColor.enabled ) );
    }

    // --------------------------------- END OF Z1
    return function(user_props) {
        var props = {
            width: 300,
            height: 400,
            isInteractionDisabled: false,
            onRenderComplete: function() {},
            buckets: null,
            data: null,
            states: null,
            airports: null,
            measureLabel: null,
            toolTip: {
              enabled: true
            },
            legends: {
                enabled: true,
                linkWidth: {
                    enabled: true,
                    color: "#e0e0e0"
                },
                linkColor: {
                    enabled: true,
                    color: "#e0e0e0"
                },
                nodeSize: {
                    enabled: true,
                    color: "#e0e0e0"
                }
            },
            links: {
                defaultWidth: 1,
                defaultColor: '#000',
                widthRange: [1, 10],
                colorRange: ["#bdbdbd", "#000"]
            },
            nodes: {
                dataSeparator: ';',
                defaultSize: 4,
                defaultColor: 'lightblue',
                sizeRange: [4, 15]
            },
            colorStates: true
        };

        var innerProps = {

        };

        // ---------------------------------- INTERNAL FUNCTIONS THAT NEED ACCESS TO PROPS AND INNERPROPS THROUGH SCOPE GO HERE (Z2)

        function render(group_main) {
            var defs = group_main.append('defs');

            var dynamicValsInfo = getDynamicValuesInfo( props.data );

            var width = props.width,
                height = props.height;

            var minLegendWidth = 100;

            if ( hasLegend(props.legends, dynamicValsInfo) ) {
                var maxLegendTitleWidth = 0;
                // quick hack to approximate legend width
                ['width', 'color', 'size'].forEach(function ( attr ) {
                    if ( Array.isArray( props.buckets[attr] ) ) {
                        maxLegendTitleWidth = Math.max(maxLegendTitleWidth, props.measureLabel( props.buckets[attr][0], '14px sans-serif').width);
                    }
                });

                width -= Math.max( maxLegendTitleWidth + 20, minLegendWidth );
            }

            var projection = getProjection(props.states, width, height);

            var states_group = group_main.append('g').classed('states', true);
            renderStates(states_group, props.states, projection, props.colorStates);

            var data = getFixedData(props.data, projection, props.airports, dynamicValsInfo, props);

            if ( hasLegend(props.legends, dynamicValsInfo) ) {
                var legends_group = group_main.append('g');
                var legendsDim = renderLegends(legends_group, defs, data, dynamicValsInfo, props, minLegendWidth);
                legends_group.attr('transform', 'translate(' + [props.width - legendsDim.width, ( props.height - legendsDim.height ) / 2 ] + ')');
            }

            var links_group = group_main.append('g').classed('links', true);
            var links = renderLinks(links_group, data.links, props.buckets, defs);

            var nodes_group = group_main.append('g').classed('nodes', true);
            var nodes = renderNodes(nodes_group, data.nodes, props.buckets, props.nodes);

            if (!props.isInteractionDisabled) {
              enableInteractions(nodes, links);
            }
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

            var invokeAfterTwo = getInvokeAfter(props.onRenderComplete, 2);

            if (!props.isInteractionDisabled) {
              group_main.style('opacity', 0)
                .transition()
                .duration(500)
                .style('opacity', 1)
                .call(getOnAllTransitionComplete(invokeAfterTwo));
            } else {
              invokeAfterTwo();
            }

            render(group_main);

            invokeAfterTwo();
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
