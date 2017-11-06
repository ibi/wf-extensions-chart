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
		var color = d3.scale.category20();

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

		data.links = renderConfig.data.map(function(el) {
			return {
				source: pushNode(el.source),
				target: pushNode(el.target),
				value: el.value
			};
		});

		data.nodes = data.nodes.map(function(el) {
			return {name: el};
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
					if (sourceList[link.target]) {
						link.deleted = true;
						continue;
					}
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

		var container = d3.select(renderConfig.container)
			.attr('class', 'com_ibi_chart')
		.append('g')
			.attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

		var sankey = d3.sankey()
			.nodeWidth(15)
			.nodePadding(10)
			.size([width, height])
			.nodes(data.nodes)
			.links(data.links)
			.layout(32);

		var path = sankey.link();

		var link = container.append('g').selectAll('.link')
			.data(data.links)
		.enter().append("path")
			.attr("class", "link")
			.attr("d", path)
			.attr("fill", "none")
			.attr("stroke", "#000")
			.attr("stroke-opacity", 0.2)
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
			.style("stroke-width", function(d) { return Math.max(1, d.dy); })
			.sort(function(a, b) { return b.dy - a.dy; });

		var node = container.append("g").selectAll(".node")
			.data(data.nodes)
		.enter().append("g")
			.attr("class", "node")
			.attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; })
		.call(d3.behavior.drag()
			.origin(function(d) { return d; })
			.on("dragstart", function() { this.parentNode.appendChild(this); })
			.on("drag", dragmove));

		node.append("rect")
			.attr("height", function(d) { return d.dy; })
			.attr("width", sankey.nodeWidth())
			.attr("tdgtitle", function(d) { return d.name + ": " + formatNumber(d.value); })
			.attr("shape-rendering", "crispEdges")
			.attr("stroke-width", 1)
			.attr("fill-opacity", 0.9)
			.style("fill", function(d) { return d.color = color(d.name.replace(/ .*/, "")); })
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

		function dragmove(d) {
			d3.select(this).attr("transform", "translate(" + d.x + "," + (d.y = Math.max(0, Math.min(height - d.dy, d3.event.y))) + ")");
			sankey.relayout();
			link.attr("d", path);
		}

		renderConfig.modules.tooltip.updateToolTips();
	}

	function noDataRenderCallback(renderConfig) {
		renderConfig.data = [
			{source: 'A', target: 'E', value: 10},
			{source: 'A', target: 'C', value: 10},
			{source: 'B', target: 'C', value: 10},
			{source: 'B', target: 'D', value: 10},
			{source: 'C', target: 'G', value: 10},
			{source: 'C', target: 'E', value: 10}
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
			script: ['http://d3js.org/d3.v3.min.js', 'lib/sankey.js'],
			css: ['lib/sankey.css']
		},
		modules: {
			tooltip: {supported: true}
		}
	};

	tdgchart.extensionManager.register(config);

}());
