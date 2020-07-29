/* Copyright 1996-2019 Information Builders, Inc. All rights reserved. */
/* Forked from Force-Directed extension by Mario Delgado */
/* Developer: Anthony Alsford */

(function () {

	// All extension callback functions are passed a standard 'renderConfig' argument:
	//
	// Properties that are always available:
	//   moonbeamInstance: the chart instance currently being rendered
	//   data: the data set being rendered
	//   properties: the block of your extension's properties, as they've been set by the user
	//   modules: the 'modules' object from your extension's config, along with additional API methods
	//   
	// Properties available during render callback:
	//   width: width of the container your extension renders into, in px
	//   height: height of the container your extension renders into, in px
	//   containerIDPrefix:  the ID of the DOM container your extension renders into.  Prepend this to *all* IDs your extension generates, to ensure multiple copies of your extension work on one page.
	//   container: DOM node for your extension to render into;
	//   rootContainer: DOM node containing the specific chart engine instance being rendered.

	// Optional: if defined, is called exactly *once* during chart engine initialization
	// Arguments:
	//  - successCallback: a function that you must call when your extension is fully
	//     initialized - pass in true if init is successful, false otherwise.
	// - initConfig: the standard callback argument object (moonbeamInstance, data, properties, etc)

	// Adopted from: http://bl.ocks.org/mbostock/1153292 
	// Overview of Force-Directed graphs: https://github.com/d3/d3-3.x-api-reference/blob/master/Force-Layout.md 
	// Understanding D3.js Force Layout: http://bl.ocks.org/sathomas/11550728

	function initCallback(successCallback, initConfig) {
		successCallback(true);
	} //initCallback

	function noDataPreRenderCallback(preRenderConfig) {

		var chart = preRenderConfig.moonbeamInstance;
		chart.title.visible = true;
		chart.title.text = "ForceNetwork Chart";
		chart.legend.visible = false;
		chart.dataArrayMap = undefined;
		chart.dataSelection.enabled = false;
	} //noDataPreRenderCallback

	function noDataRenderCallback(renderConfig) {
		renderConfig.data = [
			{ from: "Node1", to: "Node2", relationship: "owns", thickness: 10 },
			{ from: "Node1", to: "Node3", relationship: "owns", thickness: 1 },
			{ from: "Node3", to: "Node1", relationship: "owns", thickness: 3 }
		];
		renderCallback(renderConfig);
	} //noDataRenderCallback	

	// Optional: if defined, is invoked once at the very beginning of each chart engine draw cycle
	// Use this to configure a specific chart engine instance before rendering.
	// Arguments: 
	//  - preRenderConfig: the standard callback argument object
	function preRenderCallback(preRenderConfig) {

	} //preRenderCallback	

	// Required: Invoked during each chart engine draw cycle
	// This is where your extension should be rendered
	// Arguments:
	//  - renderConfig: the standard callback argument object, including additional properties width, height, etc
	function renderCallback(renderConfig) {

		//Transform 'From', 'To', 'Relationship' and 'Thickness' into 'links'
		var links = [];
		var lists = {
			nodetypes: [],
			relationships: [],
			dblLinks: [],
			nodettips: []
		};

		var chart = renderConfig.moonbeamInstance,
			props = renderConfig.properties;

		// Internet Explorer 6-11
		var isIE = /*@cc_on!@*/false ||  !!document.documentMode;
		// Edge 20+
		var isEdge = !isIE && !!window.StyleMedia;
		var menuClass = isIE ? "menuShowIE" : "menuShow";
		var mnubClass = isIE ? "menuBorderIE" : "menuBorder";

		// Reset the tooltip property if the tooltip bucket has been populated

		if (renderConfig.dataBuckets.tooltip === undefined) {
			//api v2
			props.tooltips = renderConfig.dataBuckets.getBucket('tooltip') ? Array.isArray(renderConfig.dataBuckets.getBucket('tooltip').fields) ? true : props.tooltips : props.tootooltipslTip;
		}
		else {
			//api v1
			props.tooltips = renderConfig.dataBuckets.tooltip ? Array.isArray(renderConfig.dataBuckets.tooltip.fields) ? true : props.tooltips : props.tooltips;
		}

		renderConfig.data.forEach(function (datum) {
			var link = {};
			link.source = datum.from;
			link.target = datum.to;
			link.sourcetype = datum.sourceType ? nodetypes(datum.sourceType, "source") : -1;
			link.targettype = datum.targetType ? nodetypes(datum.targetType, "target") : -1;
			link.relationship = datum.relationship ? datum.relationship.toUpperCase() : null;
			link.relGroup = relationships(datum.relationship);
			link.relIndex = doublelinks(datum.from + "~" + datum.to);

			var ttlist = [];
			if (renderConfig.dataBuckets.tooltip === undefined) {

				//api v2 

				if (datum.tooltip) {
					if (typeof (datum.tooltip) == 'string') {
						ttlist.push(datum.tooltip);
					}
					else {
						for (i = 0; i < datum.tooltip.length; i++) {
							ttlist.push(datum.tooltip[i]);
						}
					}
					
				}
				link.toolTip = datum.tooltip ? nodeTooltips(datum.from, ttlist) : props.tooltips ? nodeTooltips(datum.from, [lists.nodetypes[link.sourcetype].name + ": " + link.source]) : null;
			}
			else {
				ttlist.push(datum.tooltip1, datum.tooltip2, datum.tooltip3, datum.tooltip4);
				for (i = ttlist.length - 1; i > 0; i--) {
					if (ttlist[i] === undefined) {
						ttlist.pop();
					};
				};
				link.toolTip = datum.tooltip1 ? nodeTooltips(datum.from, ttlist) : props.tooltips ? nodeTooltips(datum.from, [lists.nodetypes[link.sourcetype].name + ": " + link.source]) : null;
			}


			
			// nodeTooltips(name, datum.tooltip)
			if (datum.thickness) {
				link.thickness = datum.thickness;
			}
			else {
				link.thickness = 1;
			}
			if (datum.size) {
				link.size = datum.size;
			}
			else {
				link.size = 1;
			}
			links.push(link);
		});

		links.forEach(function (link) {
			var i = 0;
			// Don't count multiple times the same source-target combination
			if (isNaN(link.multiLinkCount)) {
				var sameLinks = [];

				// Search all links with the source and target
				links.forEach(function (otherLink) {
					if ((link.source === otherLink.source && link.target === otherLink.target) ||
						(link.target === otherLink.source && link.source === otherLink.target)) {
						sameLinks.push(otherLink);
					}
				});

				// Set the total amount and its index for every node
				for (i = 0; i < sameLinks.length; i++) {
					sameLinks[i].multiLinkCount = sameLinks.length;
					sameLinks[i].multiLinkIndex = i;
				}
			}
		});

		//Using d3 min/max method to determine minimum/maximum thickness and size for low/high linear range	
		var minThickness = d3.min(links, function (d) { return d.thickness });
		var maxThickness = d3.max(links, function (d) { return d.thickness });
		var minSize = d3.min(links, function (d) { return d.size });
		var maxSize = d3.max(links, function (d) { return d.size });

		var scaleWidth = d3.scaleLinear()
			.domain([minThickness, maxThickness])
			.range([1.5, 3]);  //Pixel width drawn

		var scaleSize = d3.scaleLinear()
			.domain([minSize, maxSize])
			.range([25, 30]);  //Pixel width drawn

		var nodes = {};

		// Make sure there are enough colors within the arrays for all node types
		var arrLinkColors = props.colors.nodeTypes,
			arrTextColors = props.colors.textTypes,
			arrLength = arrLinkColors.length,
			i = 0;
		do {
			arrLinkColors = arrLinkColors.concat(props.colors.nodeTypes);
			arrTextColors = arrTextColors.concat(props.colors.textTypes);
			arrLength = arrLinkColors.length;
			i++;
			i = lists.nodetypes.length < arrLength ? 5 : i;
		}
		while (lists.nodetypes.length < arrLength && i < 5);
		props.colors.nodeTypes = arrLinkColors;
		props.colors.textTypes = arrTextColors;

		// Compute the distinct nodes from the links.
		links.forEach(function (link) {
			link.toolTip = nodeTooltips(link.source, []);
			// Array.from(new Set(link.toolTip.map(JSON.stringify))).map(JSON.parse) is a long handed method of deduplicating the tooltip array.
			var srcTooltip = link.toolTip.length > 0 && renderConfig.dataBuckets.tooltip ? link.toolTip : link.toolTip.length > 0 ? removeDupls(link.toolTip) : link.sourcetype >= 0 ? [lists.nodetypes[link.sourcetype].name + ": " + link.source] : [];
			var tgtTooltip = link.targettype >= 0 ? [lists.nodetypes[link.targettype].name + ": " + link.target] : [];
			link.source = nodes[link.source] || (nodes[link.source] = { name: link.source, type: "source", nodeType: link.sourcetype, size: link.size, tooltip: srcTooltip });
			link.target = nodes[link.target] || (nodes[link.target] = { name: link.target, type: "target", nodeType: link.targettype, size: link.size, tooltip: tgtTooltip });
			var idx = lists.dblLinks.map(function (o) { return o.name; }).indexOf(link.source.name + "~" + link.target.name);
			link.relCount = lists.dblLinks[idx].value;
		});

		function removeDupls(names) {
			var unique = {};
			names.forEach(function (i) {
				if (!unique[i]) {
					unique[i] = true;
				}
			});
			return Object.keys(unique);
		};

		// To ensure we utilise maximum height, calculate the SVG viewBox dimensions from which
		// all other objects are dervied.
		var ratioHeight = (renderConfig.width / renderConfig.height);
		var width = Math.floor(screen.availHeight - (window.outerHeight - window.innerHeight)) * ratioHeight,
			height = Math.floor(screen.availHeight - (window.outerHeight - window.innerHeight));

		//			console.log(screen.availWidth + " : " + width);
		//			console.log(screen.availHeight + " : " + height);
		var linkDistance = props.linkDistance ? props.linkDistance : 100;
		var linkCharge = props.linkCharge ? 0 - props.linkCharge : -500;
		var linkStrength = props.linkStrength != undefined ? props.linkStrength : 0.5;
		var chargeDistance = props.chargeDistance ? props.chargeDistance : 1000;
		var linkGravity = props.gravity ? props.gravity : 0.1;
		var linkFriction = props.friction ? props.friction : 0.5;

		var curveFunction = d3.line()
			.x(function (d) {
				return d.x;
			})
			.y(function (d) {
				return d.y;
			}).curve(d3.curveBundle)
			, loopFunction = d3.line()
				.x(function (d) {
					return d.x;
				})
				.y(function (d) {
					return d.y;
				}).curve(d3.curveBundle.beta(-1));

		// Now begin building the chart
		var svg = d3.select("svg")
			//		              .attr("width", null)
			//		              .attr("height", null)
			.attr("preserveAspectRatio", "xMidYMid meet")
			.attr("viewBox", "0 0 " + (width) + " " + (height));

		// Set-up the D3.force object

		/*
			gravity is replaced with this:	
			var forceX = d3.forceX(width / 2).strength(linkGravity)
			var forceY = d3.forceY(height / 2).strength(linkGravity)
		*/
		var forceX = d3.forceX([width / 2]).strength(linkGravity)
		var forceY = d3.forceY([height / 2]).strength(linkGravity)


		var force = d3.forceSimulation()
			.nodes(d3.values(nodes))

			//.links(links) - add linkage to layout
			.force('link', d3.forceLink().id(function (d) { return d.relGroup }).links(links).distance(linkDistance))
			//.force('link',d3.forceLink().links(links).distance(linkDistance).strength(linkStrength))
			//.gravity(linkGravity) - 
			.force('x', forceX)
			.force('y', forceY)
			.force('charge', d3.forceManyBody().strength(linkCharge).distanceMax(chargeDistance))
			//.force('charge',d3.forceManyBody().strength(linkCharge).distanceMin(1).distanceMax(chargeDistance))
			//.friction(linkFriction)
			.velocityDecay(linkFriction)
			//.chargeDistance(chargeDistance)- how do we add this? .distanceMax(chargeDistance)
			.force('collide', d3.forceCollide(function (d) { return scaleSize(d.size); }))
			//.linkStrength(linkStrength) - chained on line 247 with strength
			//.size([(width), (height)]) - used to center chart in d3 v3
			.force("center", d3.forceCenter(width / 2, height / 2))
		//.linkDistance(linkDistance)  - chained on line 247 with distance
		//.charge(linkCharge)- chained on line 249 with strength
		//.start(); not needed anymore

		if (props.settings) { showMenu() };

		// Set-up functions for when a node is dragged
		var node_drag = d3.drag()
			.on("start", dragstart)
			.on("drag", dragmove)
			.on("end", dragend);

		function dragstart(d, i) {

			force.stop();

		}

		function dragmove(d, i) {
			d.fx = d3.event.x;
			d.fy = d3.event.y;
			d.x += d3.event.dx;
			d.y += d3.event.dy;

			tick(16); // this is the key to make it work together with updating both px,py,x,y on d !
		}

		function dragend(d, i) {
			d3.selectAll("#pin" + i).attr("visibility", "visible");
			//d.fixed = true; // set the node to fixed so the force doesn't include the node in its auto positioning stuff
			d.fx = d3.event.x;
			d.fy = d3.event.y;
			tick(16);
			force.alpha(0.5);
			force.restart();
		}

		// The links should end in a filled in arrow
		// and the pins should end in a pinhead so create SVG.Markers for each type.
		var defs = d3.selectAll("svg").select("defs")

		defs.selectAll("marker")
			.data(["node"])
			.enter()
			.append("marker")
			.attr("id", function (d) { return d; })
			.attr("viewBox", "0 -2.5 5 5")
			.attr("refX", 5)
			.attr("refY", 0)
			.attr("markerWidth", 5)
			.attr("markerHeight", 5)
			.attr("orient", "auto")
			.append("path")
			.attr("d", "M0,-2.5L5,0L0,2.5")
			.attr("fill", props.colors.links);

		defs.append("marker")
			.attr("id", "pinhead")
			.attr("viewBox", "-4 -4 12 12")
			.attr("refX", 0)
			.attr("refY", 0)
			.attr("markerWidth", 8)
			.attr("markerHeight", 8)
			.attr("orient", "auto")
			.append("circle")
			.attr("cx", 0)
			.attr("cy", 0)
			.attr("r", 2.75)
			.attr("fill", props.colors.pinhead);

		// Now we can begin building the chart within the tdgchart container
		var svg = d3.select(renderConfig.container);

		// Each force component is built within it's own group to make the output easier to read.
		var path = svg.append("g")
			.attr("id", "links")
			.attr("class", "layer relationships")
			.selectAll("path")
			.data(links)
			.enter().append("g");

		path.append("path")
			.attr("id", function (d, i) { return "id" + i; })
			.attr("class", function (d) { return "link node path " + d.relGroup; })
			.attr("stroke", props.colors.links)
			.attr("marker-end", function (d) { return "url(#node)"; })
			.attr("stroke-width", function (d) { return scaleWidth(d.thickness); });

		path.append("text")
			.attr("class", function (d, i) { return "link text " + d.relGroup; })
			.attr("dy", "-0.3em")
			.append("textPath")
			.attr("xlink:href", function (d, i) { return "#id" + i; })
			.attr("x", function (d) { return d.source.x; })
			.attr("y", function (d) { return d.source.y; })
			.attr("text-anchor", "middle")
			.attr("startOffset", "50%")
			.attr("font-size", "8px")
			.text(function (d) {
				var strSlice = d.relationship ? d.relationship.length > 8 ? d.relationship.slice(0, 8) + "..." : d.relationship : null;
				return strSlice;
			});

		var circle = svg.append("g")
			.attr("id", "nodes")
			.attr("class", "layer nodes")
			.selectAll("g")
			.data(force.nodes())
			.enter().append("g")
			.call(node_drag);

		if (props.lockType === "ring") {
			circle.append("circle")
				.attr("id", function (d) { return "pin" + d.index; })
				.attr("r", function (d) { return scaleSize(d.size) + 4; })
				.attr("fill", props.colors.pinhead)
				.attr("visibility", "hidden");
		};

		circle.append("circle")
			.attr("id", function (d) { return d.index; })
			.attr("r", function (d) { return scaleSize(d.size); })
			.attr("stroke-width", 0.2)
			.attr("stroke", "#333")
			.attr("fill", function (d) { return props.colors.nodeTypes[d.nodeType + 1]; })
			.attr("tdgtitle", function (d) {
				var arrTooltip = d.tooltip ? d.tooltip : [];
				var toolTips = "";
				if (!props.tooltips) { return []; };
				for (i = 0; i < arrTooltip.length; i++) {
					toolTips += arrTooltip[i] + "<br />";
				}
				return toolTips;
			})
			.on("dblclick", releaseNode)
			.on("mouseover", focusNode)
			.on("mouseout", blurNode);

		if (props.lockType === "pin") {
			circle.append("g")
				.attr("id", function (d) { return "pin" + d.index; })
				.attr("visibility", "hidden")
				.on("click", releaseNode)
				.append("path")
				.attr("d", "M 5 -18 l 5 -15")
				.attr("stroke", "#000")
				.attr("stroke-width", 2)
				.attr("marker-end", "url(#pinhead)");
		};

		circle.append("text")
			.attr("x", 0)
			.attr("y", 0)
			.attr("dy", "-0.5em")
			.attr("class", "nodetext")
			.attr("fill", function (d) { return props.colors.textTypes[d.nodeType + 1]; })
			.attr("text-anchor", "middle")
			.text(function (d) { return d.name; });

		function focusNode() {
			d3.select(this).classed("nodeHover", true);
		}

		function blurNode() {
			d3.select(this).classed("nodeHover", false);
		}

		// Currently the node text is a single line, so call a function to wrap it to a certain length.
		d3.selectAll(".nodetext")
			.call(wrap, 45);

		// Build a legend "pop-out"
		createLegend();

		// ... and switch the chart "on"
		force.on("tick", tick);

		function tick() {
			circle.attr("transform", transform);
			// -- start of IE fix
			if (isIE) {
				// Internet Explorer does not deal with markers on lines or paths resulting in broken links
				// and poor rendering.
				// The following line re-adds all the links to the DOM causing IE to rerender them properly.
				d3.selectAll(".link").each(function () { this.parentNode.insertBefore(this, this) });
			}
			// -- end of IE fix
			d3.selectAll(".link").filter(".path").attr("d", linkArc)
				.attr("stroke", function (d, i) {
					var linkColor = props.colorLinks ? props.colors.nodeTypes[d.sourcetype + 1] : props.colors.links;
					return linkColor;
				});
			d3.selectAll(".link").filter(".box")
				.attr("x", function (d) {
					var x = d.source.x < d.target.x ? d.source.x + ((d.target.x - d.source.x - this.width.animVal.value) / 2) : d.target.x + ((d.source.x - d.target.x - this.width.animVal.value) / 2);
					return x;
				})
				.attr("y", function (d) {
					var y = d.source.y < d.target.y ? d.source.y + ((d.target.y - d.source.y - this.height.animVal.value) / 2) : d.target.y + ((d.source.y - d.target.y - this.height.animVal.value) / 2);
					return y;
				})
				.attr("transform", function (d) {
					var dx = d.source.x - d.target.x;
					var dy = d.source.y - d.target.y;
					var angle = d.source.x > d.target.x ? Math.atan2(dy, dx) * 180 / Math.PI : (Math.atan2(dy, dx) * 180 / Math.PI) - 180;
					var x = d.source.x < d.target.x ? d.source.x + ((d.target.x - d.source.x) / 2) : d.target.x + ((d.source.x - d.target.x) / 2);
					var y = d.source.y < d.target.y ? d.source.y + ((d.target.y - d.source.y) / 2) : d.target.y + ((d.source.y - d.target.y) / 2);
					return "rotate(" + angle + " " + x + " " + y + ")";
				});
		}

		function linkArc(d) {
			// Calculate these every time to get nicer curved arrows
			var pathStart = calculateIntersection(d.target, d.source, 1)
				, pathEnd = calculateIntersection(d.source, d.target, 1)
				, curvePoint = calculateCurvePoint(pathStart, pathEnd, d);
			d.curvePoint = curvePoint;

			return curveFunction([calculateIntersection(d.curvePoint, d.source, 1),
				curvePoint, calculateIntersection(d.curvePoint, d.target, 1)]);
		}

		/* Calculates the point where the link between the source and target node
		 * intersects the border of the target node */
		function calculateIntersection(source, target, additionalDistance) {

			var dx = target.x - source.x
				, dy = target.y - source.y
				, innerDistance = scaleSize(target.size);

			var length = Math.sqrt(dx * dx + dy * dy)
				, ratio = (length - (innerDistance + additionalDistance)) / length
				, x = dx * ratio + source.x
				, y = dy * ratio + source.y;

			return { x: x, y: y };
		}

		/* Calculates a point between two points for curves */
		function calculateCurvePoint(source, target, l) {
			var distance = calculateMultiLinkDistance(l)
				// Find the center of the two points
				, dx = target.x - source.x
				, dy = target.y - source.y

				, cx = source.x + dx / 2
				, cy = source.y + dy / 2

				, n = calculateNormalVector(source, target, distance);

			if (l.source.index < l.target.index) {
				n.x = -n.x;
				n.y = -n.y;
			}

			if (l.multiLinkIndex % 2 !== 0) {
				n.x = -n.x;
				n.y = -n.y;
			}

			return { "x": cx + n.x, "y": cy + n.y };
		}

		/* Calculate the optimal Multi Link distance */
		function calculateMultiLinkDistance(l) {
			var level = Math.floor((l.multiLinkIndex - l.multiLinkCount % 2) / 2) + 1
				, oddConstant = (l.multiLinkCount % 2) * 15
				, distance = 0;
			switch (level) {
				case 1:
					distance = 20 + oddConstant;
					break;
				case 2:
					distance = 45 + oddConstant;
					break;
			}
			return distance * (linkDistance / linkDistance);
		}

		/* Calculates the normal vector between two points */
		function calculateNormalVector(source, target, length) {
			var dx = target.x - source.x
				, dy = target.y - source.y

				, nx = -dy
				, ny = dx

				, vlength = Math.sqrt(nx * nx + ny * ny)
				, ratio = length / vlength;

			return { "x": nx * ratio, "y": ny * ratio };
		}

		function createLegend() {
			if (lists.nodetypes.length === 0) { return false; };
			var legend = svg.insert("g", ":first-child")
				.attr("id", "legend")
				.classed("legendin", true)
				.attr("transform", "translate(140,0)");
			var innerLegend = legend.insert("g")
				.attr("id", "innerLegend")
				// If you want the legend section mid-point
				//						  .attr("style", "transform:translate(0px," + ((height / 2) - (lists.nodetypes.length / 2 * 20) + 10) + "px);")
				.selectAll("circle")
				.data(lists.nodetypes)
				.enter();
			innerLegend.append("circle")
				.attr("id", function (d, i) { return "legend" + i; })
				.attr("cx", function (d, i) { return ((width) - 127); })
				.attr("cy", function (d, i) { return i * 18; })
				.attr("r", function (d, i) { return 7; })
				.attr("stroke-width", 0.2)
				.attr("stroke", "#333")
				.attr("fill", function (d, i) { return props.colors.nodeTypes[i + 1]; });
			innerLegend.append("text")
				.attr("id", function (d, i) { return "legendtext" + i; })
				.attr("x", function (d, i) { return ((width) - 115); })
				.attr("y", function (d, i) { return i * 18; })
				.attr("dy", ".3em")
				.attr("stroke-opacity", 1)
				.attr("stroke-width", 0.6)
				.attr("style", "font-size: 12px;")
				.attr("stroke", "#604a0e")
				//	.attr("stroke", function(d,i) {return props.colors.nodeTypes[i + 1];})
				.text(function (d, i) { return d.name; });

			var legend = svg.select("#legend")
				.insert("line", ":first-child")
				.attr("x1", ((width) - 145))
				.attr("y1", -70)
				.attr("x2", ((width) - 145))
				.attr("y2", (height + 20))
				.attr("stroke", "#aaa")
				.attr("stroke-width", 10)
				.attr("opacity", 0.05)
				.attr("style", "cursor:pointer;")
				.on("click", showLegend);
			var legend = svg.select("#legend")
				.insert("path", ":first-child")
				.attr("id", "btnLegend")
				.attr("transform", "translate(0,0) rotate(0)")
				.attr("fill", "#aaa")
				.attr("stroke-width", 1)
				.attr("d", "M " + ((width) - 150) + " " + (height / 2) + " l 8 -4 l 0 8 z");
			var legend = svg.select("#legend")
				.insert("path", ":first-child")
				.attr("d", "M " + ((width) - 150) + " -70 L " + ((width) - 150) + " " + ((height) + 20))
				.attr("stroke", "#aaa")
				.attr("stroke-width", 0.25);
		}

		function showLegend() {
			var t = d3.transition().duration(500);
			var objLegend = d3.selectAll("#legend");
			objLegend.transition(t)
				.attr("transform", function () {
					var transform = objLegend.classed("legendin") ? "translate(0,0)" : "translate(140,0)";
					objLegend.classed("legendin", !objLegend.classed("legendin"));
					return transform;
				});
			var objButton = d3.selectAll("#btnLegend")
				.attr("transform", function () {
					var transform = objLegend.classed("legendin") ? "translate(0,0) rotate(0)" : "rotate(-180 " + ((width) - 145) + " " + (height / 2) + ")";
					return transform;
				});
		}

		function showMenu() {
			var inputEvent = isIE ? "change" : "input";
			var menuDiv = d3.select(".chart")
				.append("div")
				.attr("id", "menu")
				.classed(menuClass, true)
				.attr("style", "font-size:10px;position:absolute;top:0px;left:10px;width:260px;height:10px;padding-left:10px;padding-right:10px;");
			var label = menuDiv.append("label")
				.text("Link Strength");
			label.append("input")
				.attr("class", "range")
				.attr("style", "left:23px;")
				.attr("type", "range")
				.attr("min", 0)
				.attr("max", 1)
				.attr("step", 0.01)
				.attr("value", linkStrength)
				.on(inputEvent, setStrength);
			label.append("text").attr("id", "txt1").attr("class", "range").attr("style", "top:-1px;left:28px;width:40px;").text(linkStrength);
			menuDiv.append("br");
			var label = menuDiv.append("label")
				.text("Link Distance");
			label.append("input")
				.attr("class", "range")
				.attr("style", "left:22px;")
				.attr("type", "range")
				.attr("min", 50)
				.attr("max", 150)
				.attr("step", 10)
				.attr("value", linkDistance)
				.on(inputEvent, setLength);
			label.append("text").attr("id", "txt2").attr("class", "range").attr("style", "top:-1px;left:25px;width:40px;").text(linkDistance);
			menuDiv.append("br");
			var label = menuDiv.append("label")
				.text("Link Charge");
			label.append("input")
				.attr("style", "left:28px;")
				.attr("class", "range")
				.attr("type", "range")
				.attr("min", 150)
				.attr("max", 1200)
				.attr("step", 50)
				.attr("value", 0 - linkCharge)
				.on(inputEvent, setCharge);
			label.append("text").attr("id", "txt3").attr("class", "range").attr("style", "top:-1px;left:28px;width:40px;").text(linkCharge);
			menuDiv.append("br");
			var label = menuDiv.append("label")
				.text("Charge Distance");
			label.append("input")
				.attr("style", "left:8px;")
				.attr("class", "range")
				.attr("type", "range")
				.attr("min", 0)
				.attr("max", 5000)
				.attr("step", 50)
				.attr("value", chargeDistance)
				.on(inputEvent, setChgDist);
			label.append("text").attr("id", "txt4").attr("class", "range").attr("style", "top:-1px;left:12px;width:40px;").text(chargeDistance);
			menuDiv.append("br");
			var label = menuDiv.append("label")
				.text("Gravity");
			label.append("input")
				.attr("style", "left:50px;")
				.attr("class", "range")
				.attr("type", "range")
				.attr("min", 0)
				.attr("max", 1)
				.attr("step", 0.01)
				.attr("value", linkGravity)
				.on(inputEvent, setGravity);
			label.append("text").attr("id", "txt5").attr("class", "range").attr("style", "top:-1px;left:57px;width:40px;").text(linkGravity);
			menuDiv.append("br");
			var label = menuDiv.append("label")
				.text("Friction");
			label.append("input")
				.attr("style", "left:50px;")
				.attr("class", "range")
				.attr("type", "range")
				.attr("min", 0)
				.attr("max", 1)
				.attr("step", 0.01)
				.attr("value", linkFriction)
				.on(inputEvent, setFriction);
			label.append("text").attr("id", "txt6").attr("class", "range").attr("style", "top:-1px;left:56px;width:40px;").text(linkFriction);
			menuDiv.append("br");
			menuDiv.append("div")
				.attr("class", "menuButton")
				.on("click", function () {
					var t = d3.transition().duration(500);
					var objMenu = d3.select("#menu");
					objMenu.transition(t)
						.attr("transform", function () {
							var transform = objMenu.classed(menuClass) ? "translate(0, -148)" : "translate(0, 0)";
							objMenu.classed(menuClass, !objMenu.classed(menuClass));
							return transform
						});
				});
			menuDiv.append("div").attr("class", mnubClass);

			function setStrength() {
				force.stop();
				force.linkStrength(+this.value);
				d3.select("#txt1").text(+this.value);
				force.start();
			}

			function setLength() {
				force.stop();
				force.linkDistance(+this.value);
				d3.select("#txt2").text(+this.value);
				force.start();
			}

			function setCharge() {
				force.stop();
				force.charge(0 - this.value);
				d3.select("#txt3").text(-this.value);
				force.start();
			}

			function setChgDist() {
				force.stop();
				force.chargeDistance(+this.value);
				d3.select("#txt4").text(+this.value);
				force.start();
			}

			function setGravity() {
				force.stop();
				force.gravity(+this.value);
				d3.select("#txt5").text(+this.value);
				force.start();
			}

			function setFriction() {
				force.stop();
				force.friction(+this.value);
				d3.select("#txt6").text(+this.value);
				force.start();
			}
		}

		function setSwitches() {
			var switches = svg.select(".chart")
				.data(lists.relationships)
				.enter();

			switches.append("span")
				.attr("id", function (d, i) { return "txt" + d; })
				.attr("style", function (d, i) { return "position:absolute; font-size: 12px; left:35px; top:" + (20 + (i * 22)) + "px"; })
				.text(function (d, i) { return d; });

			switches.append("input")
				.attr("type", "checkbox")
				.attr("checked", true)
				.attr("id", function (d, i) { return d; })
				.attr("style", function (d, i) { return "position:absolute; left:10px; top:" + (18 + (i * 22)) + "px"; })
				.on("change", function (d, i) { return changeState(d, i, this); });
		}

		function changeState(name, idx, ctrl) {
			d3.selectAll(".relGroup" + idx).classed("linkShow", !ctrl.checked);
		}

		function releaseNode(d, i) {
			d3.selectAll("#pin" + i).attr("visibility", "hidden");
			d.fixed = false;
			tick();
		}

		function wrap(text, width) {
			text.each(function () {
				var text = d3.select(this),
					words = text.text().split(/\s+/).reverse(),
					word,
					line = [],
					lineNumber = 0,
					lineHeight = 1.1, // ems
					y = text.attr("y"),
					dy = parseFloat(text.attr("dy")),
					tspan = text.text(null).append("tspan").attr("x", 0).attr("y", y).attr("dy", dy + "em");
				while (word = words.pop()) {
					line.push(word);
					tspan.text(line.join(" "));
					if (tspan.node().getComputedTextLength() > width) {
						line.pop();
						tspan.text(line.join(" "));
						line = [word];
						tspan = text.append("tspan").attr("x", 0).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy + "em").text(word);
					}
				}
			});
		}

		function transform(d) {
			return "translate(" + d.x + "," + d.y + ")";
		}

		function nodetypes(name, subtype) {
			var idx = lists.nodetypes.map(function (o) { return o.name; }).indexOf(name);
			if (idx >= 0) {
				return idx;
			}
			lists.nodetypes.push({ "name": name, "subtype": subtype });
			return (lists.nodetypes.length - 1);
		}

		function relationships(name) {
			var idx = lists.relationships.indexOf(name);
			if (idx >= 0) {
				return "relGroup" + idx;
			}
			lists.relationships.push(name);
			return "relGroup" + (lists.relationships.length - 1);
		}

		function doublelinks(name) {
			var items = name.split("~");
			var idx = lists.dblLinks.map(function (o) { return o.name; }).indexOf(name);
			if (idx >= 0) {
				lists.dblLinks[idx].value += 1;
				return lists.dblLinks[idx].value;
			}
			lists.dblLinks.push({ "name": name, "value": 1 });
			return 1;
		}

		function nodeTooltips(name, arrTooltip) {
			var idx = lists.nodettips.map(function (o) { return o.name; }).indexOf(name);
			var arrTooltip = Array.isArray(arrTooltip) ? arrTooltip : [arrTooltip];
			for (i = 0; i < arrTooltip.length; i++) {
				arrTooltip[i] = arrTooltip[i] && renderConfig.dataBuckets.tooltip ? renderConfig.dataBuckets.tooltip.fields[i].title + ": " + arrTooltip[i] : arrTooltip[i];
			}
			if (idx >= 0) {
				lists.nodettips[idx].tooltip = lists.nodettips[idx].tooltip.concat(arrTooltip);
				return lists.nodettips[idx].tooltip;
			}
			lists.nodettips.push({ "name": name, "tooltip": arrTooltip });
			return arrTooltip;
		}

		renderConfig.modules.tooltip.updateToolTips();

	} //renderCallback

	// Extension Configuration
	var config = {
		id: 'com.ibi.forcenetwork',     // string that uniquely identifies this extension
		containerType: 'svg',  // either 'html' or 'svg' (default)
		initCallback: initCallback,
		preRenderCallback: preRenderCallback,  // reference to a function that is called right *before* your extension is rendered.  Will be passed one 'preRenderConfig' object, defined below.  Use this to configure a Monbeam instance as needed
		renderCallback: renderCallback,  // reference to a function that will draw the actual chart.  Will be passed one 'renderConfig' object, defined below
		noDataPreRenderCallback: noDataPreRenderCallback,
		noDataRenderCallback: noDataRenderCallback,
		resources: {  // Additional external resources (CSS & JS) required by this extension
			script: window.d3 ? ['lib/d3-selection-multi.min.js','lib/d3-time.min.js','lib/d3-time-format.min.js','lib/d3-transition.min.js'] : 
			['lib/d3.v5.16.min.js','lib/d3-selection-multi.min.js','lib/d3-time.min.js','lib/d3-time-format.min.js','lib/d3-transition.min.js'],
			css: ['css/forcenetwork.css']
		},
		modules: {

			tooltip: {
				supported: true  // Set this true if your extension wants to enable HTML tooltips
			}

		}
	}; //var config 

	// Required: this call will register your extension with the chart engine
	tdgchart.extensionManager.register(config);

}());