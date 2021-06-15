/* Copyright (c) 1996-2021 TIBCO Software Inc. All Rights Reserved. */
/* Developer: Mario Delgado */

(function() {

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
		chart.title.text = "Force-directed Chart"; 		
		chart.legend.visible = false;
		chart.dataArrayMap = undefined;
		chart.dataSelection.enabled = false;
	} //noDataPreRenderCallback

	function noDataRenderCallback(renderConfig) {
			renderConfig.data  = [
						{from: "Node1", to: "Node2", thickness: 10},
						{from: "Node1", to: "Node3", thickness: 1},
						{from: "Node3", to: "Node1", thickness: 3}
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
		
		//Transform 'From', 'To' and 'Thickness' into 'links'
		var links = [];
		renderConfig.data.forEach(function(datum) {
					var link = {};
					link.source = datum.from;
					link.target = datum.to;
					if (datum.thickness) {
						link.thickness = datum.thickness; }
					else {
					    link.thickness = 1;}
					links.push(link);
				});
		
		//Using d3 min/max method to detmine minimum/maximum thickness for low/high linear range	
		var minThickness = 	d3.min(links,function(d) { return d.thickness});
		var maxThickness = 	d3.max(links,function(d) { return d.thickness});
		
		var scaleWidth = d3.scale.linear()
						   .domain([minThickness,maxThickness])
						   .range([1.5,3]);  //Pixel width drawn
						   
		var nodes = {}	;

		// Compute the distinct nodes from the links.
		links.forEach(function(link) {
		  link.source = nodes[link.source] || (nodes[link.source] = {name: link.source});
		  link.target = nodes[link.target] || (nodes[link.target] = {name: link.target});
		});
		
		
		var width = renderConfig.width,
			height = renderConfig.height;

        //Understanding D3.js Force Layout: http://bl.ocks.org/sathomas/11550728
		var force = d3.layout.force()
			.nodes(d3.values(nodes))
			.links(links)
			.size([width, height])
			.linkDistance(60)
			.charge(-300)
			.on("tick", tick)
			.start();

		
		var svg = d3.select(renderConfig.container);

		// Per-type markers, as they don't inherit styles.
		// Background on SVG defs (definitions) elements: http://tutorials.jenkov.com/svg/defs-element.html 
		svg.append("defs").selectAll("marker")
			.data(["node"])
		  .enter().append("marker")
			.attr("id", function(d) { return d; })
			.attr("viewBox", "0 -5 10 10")
			.attr("refX", 15)
			.attr("refY", -1.5)
			.attr("markerWidth", 6)
			.attr("markerHeight", 6)
			.attr("orient", "auto")
		  .append("path")
			.attr("d", "M0,-5L10,0L0,5");
			

		var path = svg.append("g").selectAll("path")
			.data(force.links())
		  .enter().append("path")
			.attr("class", function(d) { return "link node"; })
			.style("stroke-width", function(d) {return scaleWidth(d.thickness) + "px";})
			.attr("marker-end", function(d) { return "url(#node)"; });
		

		var circle = svg.append("g").selectAll("circle")
			.data(force.nodes())
		  .enter().append("circle")
			.attr("r", 6)
			.call(force.drag);
		
		
		var text = svg.append("g").selectAll("text")
			.data(force.nodes())
		    .enter()
				.append("text")
				.attr("x", 8)
				.attr("y", ".31em")
				.attr("class","nodetext") //Discussion on D3 classed: https://jaketrent.com/post/d3-class-operations/
				//.text("test");
			    .text(function(dParm) { return dParm.name; });

		// Use elliptical arc path segments to doubly-encode directionality.
		function tick() {
		  path.attr("d", linkArc);
		  circle.attr("transform", transform);
		  text.attr("transform", transform);
		}

		function linkArc(d) {
		  var dx = d.target.x - d.source.x,
			  dy = d.target.y - d.source.y,
			  dr = Math.sqrt(dx * dx + dy * dy);
		  return "M" + d.source.x + "," + d.source.y + "A" + dr + "," + dr + " 0 0,1 " + d.target.x + "," + d.target.y;
		}

		function transform(d) {
		  return "translate(" + d.x + "," + d.y + ")";
		}
	} //renderCallback
	


	// Extension Configuration
	var config = {
		id: 'com.ibi.forcedirected',     // string that uniquely identifies this extension
		containerType: 'svg',  // either 'html' or 'svg' (default)
		initCallback: initCallback,
		preRenderCallback: preRenderCallback,  // reference to a function that is called right *before* your extension is rendered.  Will be passed one 'preRenderConfig' object, defined below.  Use this to configure a Monbeam instance as needed
		renderCallback: renderCallback,  // reference to a function that will draw the actual chart.  Will be passed one 'renderConfig' object, defined below
		noDataPreRenderCallback: noDataPreRenderCallback, 
		noDataRenderCallback: noDataRenderCallback,
		resources:  {  // Additional external resources (CSS & JS) required by this extension
			script: ['lib/d3.min.js'],
			css:    ['css/styles.css']
		},
		modules: {

			tooltip: {
				supported: false  // Set this true if your extension wants to enable HTML tooltips
			}

		}
	}; //var config 

	// Required: this call will register your extension with the chart engine
	tdgchart.extensionManager.register(config);
  
}());