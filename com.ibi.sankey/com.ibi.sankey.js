/*global tdgchart: false, d3: false */

 (function() {

	function preRenderCallback(preRenderConfig) {
		var chart = preRenderConfig.moonbeamInstance;
		chart.legend.visible = false;
	}

	function renderCallback(renderConfig) {

		var chart = renderConfig.moonbeamInstance;
		var formatNumber = d3.format(",.0f");
		var format = function(d) { return formatNumber(d) + " TWh"; };
		var color = d3.scale.category20();
		
		var margin = {left: 10, right: 10, top: 10, bottom: 10};
		var width = renderConfig.width - margin.left - margin.right;
		var height = renderConfig.height - margin.top - margin.bottom;
		
		var data = {
			nodes: [],
			links: []
		};
		
		function pushNode(name) {
			var idx = data.nodes.indexOf(name);
			if (idx >= 0) {
				return idx;
			}
			data.nodes.push(name);
			return data.nodes.length - 1;
		}
		
		data.links = chart.data[0].map(function(el) {
			return {
				source: pushNode(el.source),
				target: pushNode(el.target),
				value: el.value
			};
		});
		
		data.nodes = data.nodes.map(function(el) {
			return {name: el};
		});
		
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
			.attr("tdgtitle", function(d) { return d.source.name + " ? " + d.target.name + "\n" + format(d.value); })
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
			.attr("tdgtitle", function(d) { return d.name + "\n" + format(d.value); })
			.style("fill", function(d) { return d.color = color(d.name.replace(/ .*/, "")); })
			.style("stroke", function(d) { return d3.rgb(d.color).darker(2); });

		node.append("text")
			.attr("x", -6)
			.attr("y", function(d) { return d.dy / 2; })
			.attr("dy", ".35em")
			.attr("text-anchor", "end")
			.attr("transform", null)
			.text(function(d) { return d.name; })
		.filter(function(d) { return d.x < width / 2; })
			.attr("x", 6 + sankey.nodeWidth())
			.attr("text-anchor", "start");
			
		function dragmove(d) {
			d3.select(this).attr("transform", "translate(" + d.x + "," + (d.y = Math.max(0, Math.min(height - d.dy, d3.event.y))) + ")");
			sankey.relayout();
			link.attr("d", path);
		}

		function removeCycles() {
			nodes.forEach(function(node) {
				var visitedNodes = [node.name];
				node.targetLinks.forEach(function(targetNode) {
					var targetName = targetNode.target.name;
					if (visitedNodes.indexOf(targetName) >= 0) {
					} else {
						visitedNodes.push(targetNode.target.name);
					}
				});
			});
		}

		renderConfig.modules.tooltip.updateToolTips();
	}

	var config = {
		id: 'com.ibi.sankey',
		name: 'Sankey Chart',
		preRenderCallback: preRenderCallback,
		renderCallback: renderCallback,
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
