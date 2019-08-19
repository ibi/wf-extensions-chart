/*global tdgchart: false, d3: false */
// Copyright 1996-2015 Information Builders, Inc. All rights reserved.

 (function() {

	 var tdg = tdgchart.util;

	function preRenderCallback(preRenderConfig) {
		var chart = preRenderConfig.moonbeamInstance;
		if (chart.noDataMode || !hasAtLeastOneValidDatum(preRenderConfig.data)) {
			chart.title.visible = true;
			chart.title.text = "Drop Measures or Sorts into the Query Pane";
			chart.title.align = "center";
			chart.title.font = "20pt Sans-Serif";
			chart.title.color = "#A8A8A8";
		}
		chart.legend.visible = false;
	}
	
	function hasAtLeastOneValidDatum(flatDataArray) {
		return flatDataArray.some(function(datum) {
			if (Array.isArray(datum)) {
				return datum[0] != null && datum[1] != null && datum[2] != null;
			}
			return datum.source != null && datum.target != null && datum.value != null;
		});
	}

	function renderCallback(renderConfig) {

		if (tdg.isEmpty(renderConfig.data)) {
			return noDataRenderCallback(renderConfig);
		}

		if ( !hasAtLeastOneValidDatum(renderConfig.data) ) {
			return noDataRenderCallback(renderConfig);
		}

		var chart = renderConfig.moonbeamInstance;
		var props = renderConfig.properties;
		var formatNumber = d3.format(",.0f");
		var color = d3.scaleOrdinal(d3.schemeCategory20);

		var margin = {left: 10, right: 10, top: 10, bottom: 10};
		var width = renderConfig.width - margin.left - margin.right;
		var height = renderConfig.height - margin.top - margin.bottom;

		var data = {
			nodes: [],
			links: []
		};

		if (renderConfig.greyState) {
			color = function() {return renderConfig.baseColor;};
		}

		function pushNode(name) {
			var idx = data.nodes.indexOf(name);
			if (idx >= 0) {
				return idx;
			}
			data.nodes.push(name);
			return data.nodes.length - 1;
		}

		/* Logic prior to CHART-2117
		data.links = renderConfig.data.map(function(el) {
			return {
				source: pushNode(el.source),
				target: pushNode(el.target),
				value: el.value
			};
		});
		*/
		// Start CHART-2117
		
			var filteredData = renderConfig.data.filter(function (row) {   //Filter out all Sources with 0 (zero) target values
													return row.value != 0;
											   });
			
			data.links = filteredData.map(function(el) {
				return {
					source: pushNode(el.source),
					target: pushNode(el.target),
					value: el.value
				};
			});		
			
		// End CHART-2117

		data.nodes = data.nodes.map(function(el, i) {
			return {name: el, id: i};
		});

		for (var i = data.links.length - 1; i >= 0; i--) {
			if (data.links[i].source === data.links[i].target) {
				data.links.splice(i, 1);
			}
		}

		var sourceNodes = [];
		data.links.forEach(function(el){sourceNodes[el.source] = true;});

		for (var i = 0; i < data.links.length; i++) {
			var link = data.links[i];
			if (link.deleted) {
				continue;
			}
			var sourceList = [];
			sourceList[link.source] = sourceList[link.target] = true;
			checkCycles(link.target, sourceList);
		}

		function checkCycles(target, sourceList) {
			if (!sourceNodes[target]) {
				return;
			}
			for (var i = 0; i < data.links.length; i++) {
				var link = data.links[i];
				if (!link.deleted && link.source === target) {
/*
					if (sourceList[link.target]) {
						link.deleted = true;
						continue;
					}
*/
					sourceList[link.target] = true;
					checkCycles(link.target, sourceList);
				}
			}
		}

		for (var i = data.links.length - 1; i >= 0; i--) {
			if (data.links[i].deleted) {
				data.links.splice(i, 1);
			}
		}
        
// If colour array has been supplied then ensure that there are enough colours in the props.colors array to supply all the nodes.
        var cntNodes = data.nodes.length;
        var colors = props.colors;
        if (props.colors) {
            do {
                colors = colors.concat(props.colors);
            } while (colors.length < cntNodes);
        }

		var nodeWidth = props.nodeWidth ? props.nodeWidth : 15;
		var nodePadding = props.nodePadding ? props.nodePadding : 40;
		var sankeyAlign = props.nodeAlign ? props.nodeAlign : "justify";
        
        var container = d3.select(renderConfig.container)
			.attr('class', 'com_ibi_chart')
		.append('g')
			.attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

        var svgDefs = d3.selectAll("defs");

		var sankey = d3.sankey()
			.nodeWidth(nodeWidth)
			.nodePadding(nodePadding)
			.size([width, height])
			.nodes(data.nodes)
			.links(data.links)
            .align(sankeyAlign)
			.layout(32);

		var path = sankey.link();

		var link = container.append('g').selectAll('.link')
			.data(data.links)
		.enter().append("path")
			.attr("class", "link")
			.attr("d", path)
			.attr("fill", "none")
			.attr("tdgtitle", function(d) {
				if (!d || typeof d !== 'object') {
					return 'No Data';
				}
				if (d.source) {
					if (d.target) {
						return d.source.name + ' -> ' + d.target.name + ': ' + formatNumber(d.value);
					}
					return d.source.name + ': ' + formatNumber(d.value);
				}
			})
			.on("mouseover",  linkmouseover)
			.on("mouseout",  mouseout)
            .style("stroke", function(link) { var clrSource = props.colors ? colors[link.source.id] : color(link.source.name.replace(/ .*/, ""));
                                              var clrTarget = props.colors ? colors[link.target.id] : color(link.target.name.replace(/ .*/, ""));
                                              var gradient = svgDefs.append("linearGradient")
                                                                      .attr("gradientUnits", "objectBoundingBox")
//                                                                      .attr("gradientUnits", "userSpaceOnUse")
                                                                      .attr("id", "grad_" + link.source.id + "_" + link.target.id);
                                                  gradient.append("stop").attr("offset", "0.3").attr("stop-color", clrSource);
                                                  gradient.append("stop").attr("offset", "0.7").attr("stop-color", clrTarget);
                                              var fillColor1 = props.colorMode ? props.colors ? colors[link.source.id] : color(link.source.name.replace(/ .*/, "")) : null;
                                              var fillColor2 = props.colorMode ? props.colors ? colors[link.target.id] : color(link.target.name.replace(/ .*/, "")) : null;
                                              var fillColor3 = "url(#grad_" + link.source.id + "_" + link.target.id + ")";
                                              return props.colorMode.toLowerCase() === "source" ? fillColor1 : props.colorMode.toLowerCase() === "target" ? fillColor2 : props.colorMode.toLowerCase() === "gradient" ? fillColor3 : null; })
			.attr("stroke-opacity", 0.2)
			.style("stroke-width", function(d) { return Math.max(1, d.dy); })
			.sort(function(a, b) { return b.dy - a.dy; });

		var node = container.append("g").selectAll(".node")
			.data(data.nodes)
		.enter().append("g")
			.attr("class", "node")
			.attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; })
			.on("mouseover",  nodemouseover)
			.on("mouseout",  mouseout)
		.call(d3.drag()
			.subject(function(d) { return d; })
			.on("start", function() { this.parentNode.appendChild(this); })
			.on("drag", dragmove));

		node.append("rect")
			.attr("height", function(d) { return d.dy; })
			.attr("width", nodeWidth)
			.attr("tdgtitle", function(d) { return d.name + ": " + formatNumber(d.value); })
			.attr("shape-rendering", "crispEdges")
			.attr("stroke-width", 1)
			.attr("fill-opacity", 0.9)
			.style("fill", function(d) { var fillColor = props.colors ? colors[d.id] : color(d.name.replace(/ .*/, ""));
                                         return fillColor; })
			.style("stroke", function(d) { return d3.rgb(d.color).darker(2); });
        
		if (!renderConfig.greyState) {
			node.append("text")
				.attr("x", -6)
				.attr("y", function(d) { return d.dy / 2; })
				.attr("dy", ".35em")
				.attr("text-anchor", "end")
				.attr("transform", null)
				.attr("fill", "black")
				.attr("font-size", "10px")
				.attr("font-family", "sans-serif")
				.text(function(d) { return d.name; })
			.filter(function(d) { return d.x < width / 2; })
				.attr("x", 6 + sankey.nodeWidth())
				.attr("text-anchor", "start");
		}
        
        function nodemouseover(_) {
            var objThis = _.name, objTarget = [], objSource = [];
            if (_.sourceLinks.length) {
                i = 0;
                do {
                    objTarget.push(_.sourceLinks[i].target.name);
                    i++;
                } while (i < _.sourceLinks.length);
            };
            if (_.targetLinks.length) {
                i = 0;
                do {
                    objSource.push(_.targetLinks[i].source.name);
                    i++;
                } while (i < _.targetLinks.length);
            };
            var allNodes = d3.selectAll(".node")
                               .attr("opacity", function(d) { var a = (objThis === d.name || objSource.indexOf(d.name) >= 0 || objTarget.indexOf(d.name) >= 0) ? "1" : props.fadeOpacity;
                                                              return a;});
            var allNodes = d3.selectAll(".link")
                               .attr("stroke-opacity", function(d) { var a = (objThis === d.source.name || objThis === d.target.name) ? "0.5" : props.fadeOpacity;
                                                              return a;});
        }

        function linkmouseover(_) {
            var objTarget = _.source.name, objSource = _.target.name;
            var allNodes = d3.selectAll(".node")
                               .attr("opacity", function(d) { var a = (objSource === d.name || objTarget === d.name) ? "1" : props.fadeOpacity;
                                                              return a;});
            var allNodes = d3.selectAll(".link")
                               .attr("stroke-opacity", function(d) { var a = (objTarget === d.source.name && objSource === d.target.name) ? "0.5" : props.fadeOpacity;
//                                                              if (a === "1") { console.log(a + " : " + d.source.name + " : " + d.target.name); };
                                                              return a;});
        }

        function mouseout(d) {
            var allNodes = d3.selectAll(".node").attr("opacity", "1");
            var allNodes = d3.selectAll(".link").attr("stroke-opacity", "0.2");
        }

		function dragmove(d) {
			d3.select(this).attr("transform", "translate(" + d.x + "," + (d.y = Math.max(0, Math.min(height - d.dy, d3.event.y))) + ")");
			sankey.relayout();
			link.attr("d", path);
		}

		renderConfig.modules.tooltip.updateToolTips();
	}

	function noDataRenderCallback(renderConfig) {
		renderConfig.data = [
			{source: 'Coal', target: 'Fossil Fuels', value: 25},
			{source: 'Coal', target: 'Electricity', value: 25},
			{source: 'Natural Gas', target: 'Fossil Fuels', value: 20},
			{source: 'Oil', target: 'Fossil Fuels', value: 15},
			{source: 'Fossil Fuels', target: 'Energy', value: 60},
			{source: 'Electricity', target: 'Energy', value: 25}
		];

		var chart = renderConfig.moonbeamInstance;
		chart.title.visible = true;
		chart.title.text = "Drop Measures or Sorts into the Query Pane";
		chart.title.font = "20pt Sans-Serif";
		chart.title.color = "#A8A8A8";
		renderConfig.greyState = true;
		renderCallback(renderConfig);
	}

	var config = {
		id: 'com.ibi.sankey',
		name: 'Sankey Chart',
		preRenderCallback: preRenderCallback,
		renderCallback: renderCallback,
		noDataRenderCallback: noDataRenderCallback,
		resources:  {
			script: window.d3
				? ['lib/sankey.js']
				: ['lib/d3.v4.min.js', 'lib/d3-sankey.js'],
			css: ['lib/sankey.css']
		},
		modules: {
			tooltip: {supported: true}
		}
	};

	tdgchart.extensionManager.register(config);

}());
