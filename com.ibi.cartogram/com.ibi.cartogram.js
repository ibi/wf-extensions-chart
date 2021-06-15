/* Copyright (c) 1996-2021 TIBCO Software Inc. All Rights Reserved. */
/* $Revision: 1.0 $ */

(function() {
	
	//Documentation References: 
	// http://webfocusinfocenter.informationbuilders.com/wfbue/topics/05_chart_types.htm#_OPENTOPIC_TOC_PROCESSING_d0e31253
	// http://prag.ma/code/d3-cartogram/

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
	function initCallback(successCallback, initConfig) {
		successCallback(true);
	}
	

	function noDataPreRenderCallback(preRenderConfig) {
		/* Commented out while working on CHART-1935; not needed
		var chart = preRenderConfig.moonbeamInstance;
		chart.legend.visible = false;
		chart.dataArrayMap = undefined;
		chart.dataSelection.enabled = false;
		fnShowCartogram("initialize",preRenderConfig);   
		*/
	}
	
	function noDataRenderCallback(renderConfig) {
		/* Commented out while working on CHART-1935; not needed
		var grey = renderConfig.baseColor;
		renderConfig.data = [{value: [3, 3]}, {value: [4, 4]}, {value: [5, 5]}, {value: [6, 6]}, {value: [7, 7]}];
		renderConfig.moonbeamInstance.getSeries(0).color = grey;
		renderConfig.moonbeamInstance.getSeries(1).color = pv.color(grey).lighter(0.18).color;
		renderCallback(renderConfig);
		*/
		fnShowCartogram("initialize",renderConfig);  //Correctly placed here while working on CHART-1935
	}	
	

	// Optional: if defined, is invoked once at the very beginning of each chart engine draw cycle
	// Use this to configure a specific chart engine instance before rendering.
	// Arguments: 
	//  - preRenderConfig: the standard callback argument object
	function preRenderCallback(preRenderConfig) {
		var chart = preRenderConfig.moonbeamInstance;
		
		/* Removing default sample title and footnote as requested by CHART-1935
		
		//title and footnote can be assinged to chart with GRAPH commands 'HEADING' and 'FOOTING'
		
		chart.title.visible = true;
		chart.title.text = "USA Cartogram";  // contrived example
		chart.footnote.visible = false;
		chart.footnote.text = "footnote";
		chart.footnote.align = 'right';
		
		*/
	}
		
	
	function renderCallback(renderConfig) {
			
		fnShowCartogram("withdata",renderConfig);	
				
	}//renderCallback    	
	
	function fnShowCartogram(sequence,renderConfig) {
	
			var chart = renderConfig.moonbeamInstance;
			var props = renderConfig.properties;

				
				
			var container = d3.select(renderConfig.container)
				.attr('class', 'com_ibi_chart');	

			//width/height  = renderConfig.width  renderConfig.height

			var	colors = colorbrewer.RdYlBu[3]
					.reverse()
					.map(function(rgb) { return d3.hsl(rgb); });

			  
			var map = container;

			var	layer = map.append("g")
					.attr("id", "layer");
		    var states = layer.append("g")
					.attr("id", "states")
					.selectAll("path");
									

			/*	 
			//alternate way of getting topology json from a server-side file
				  d3.json("data/us-states.topojson", function(topo) {
					topology = topo;
					geometries = topology.objects.states.geometries;
				   init();	
				  });
			*/			
		
		
			var proj = d3.geo.albersUsa(),
				  topology,
				  geometries,
				  carto = d3.cartogram()
					.projection(proj);
					
			topology = fnGetUSAtopoJSON();

			geometries = topology.objects.states.geometries;
			
			var statesDataValues = fnGetStateAreas();  //Initial areas for states 
					
			var features = carto.features(topology, geometries),
				path = d3.geo.path()
				  .projection(proj);
			states = states.data(features)
			  .enter()
			  .append("path")
				.attr("d", path)
				.attr("id",function (d) {return d.id})
				//Start CHART-2104
				.attr('class', function(d, g) {
					// To support data selection, events and tooltips, each riser must include a class name with the appropriate seriesID and groupID
					// Use chart.buildClassName to create an appropriate class name.
					// 1st argument must be 'riser', 2nd is seriesID, 3rd is groupID, 4th is an optional extra string which can be used to identify the risers in your extension.
					return chart.buildClassName('riser', 0, g, 'state');
					}) //attr
				.each(function(d,i) {
					// addDefaultToolTipContent will add the same tooltip to this riser as the built in chart types would.
					// Assumes that 'this' node includes a fully qualified series & group class string.
					// addDefaultToolTipContent can also accept optional arguments:
					// addDefaultToolTipContent(target, s, g, d, data), useful if this node does not have a class
					// or if you want to override the default series / group / datum lookup logic.
					/* IA-9120 fix for IE-11 not supporting .findIndex method
						var inDataIndex = renderConfig.data.findIndex(function(datum){return datum.state == d.id}); //input data matched to state feature
					*/
					//Start IA-9120 .findIndex not supported with IE-11 fix
					
					var inDataIndex = -1;
					for (var j = 0; j < renderConfig.data.length; ++j) {
						if (renderConfig.data[j].state == d.id) {
							inDataIndex = j; //input data matched to state feature
							break;
						}
}					
					//End IA-9120 .findIndex fix
					if (inDataIndex != -1) {  //Incorrectly spelled state may not have a tooltip assigned to it; as well as data, see below IA-9120 NFR
						renderConfig.modules.tooltip.addDefaultToolTipContent(this, 0, inDataIndex, renderConfig.data[inDataIndex]);
					} //if
				}) //each	
				 //End CHART-2104	
				 ;	

			
			//Override state areas with the values they will be cartogram-ed with	
			if (sequence == "withdata") {
				//Zero out all values
				Object.keys(statesDataValues).forEach(function ( key ) { statesDataValues[key] = 0; });
				
				var incorrectStates=[];  //IA-9120 NFR
				
				//Get values from renderConfig.data and over-write respective statesDataValues json
				renderConfig.data.forEach(function (obj) {
					if (statesDataValues[obj.state] != undefined) {
						statesDataValues[obj.state] = obj.value;
					} //if
					else {
					  incorrectStates.push(obj.state); //IA-9120 NFR
					} //else
					
				}); //renderConfig.data.forEach
				
				if (incorrectStates.length > 0) alert("The following value(s) don't have a corresponding state in the cartogram: \r\n\r\n" + incorrectStates.join("\r\n")); //IA-9120 NFR
				
			} //if

						
			var arr = Object.keys( statesDataValues ).map(function ( key ) { return statesDataValues[key]; }),
				lo = Math.min.apply( null, arr ),
				hi = Math.max.apply( null, arr );	
				
			var color = d3.scale.linear()
			  .range(colors)
			  .domain(lo < 0
				? [lo, 0, hi]
				: [lo, d3.mean(arr), hi]);			
				

			// normalize the scale to positive numbers
			var scale = d3.scale.linear()
			  .domain([lo, hi])
			  .range([1, renderConfig.width]);

			// tell the cartogram to use the scaled values
			carto.value(function(d,i) {
			  return scale(statesDataValues[d.id]);
			  //return scale(renderConfig.data[i].value);
			});
			

			// generate the new features, pre-projected
			var features = carto(topology, geometries).features;
			

			// update the data
			states.data(features);

				
			states.transition()
			  .duration(750)
			  .ease("linear")
			  .attr("fill", function(d) {
				return color(statesDataValues[d.id]);
			  })
			  .attr("d", carto.path);
			  
			//Start CHART-2104
			
				renderConfig.renderComplete();
			
			//End CHART-2104
			
			
			function fnAddCommas(nStr){
					 nStr += '';
					 var x = nStr.split('.');
					 var x1 = x[0];
					 var x2 = x.length > 1 ? '.' + x[1] : '';
					 var rgx = /(\d+)(\d{3})/;
					 while (rgx.test(x1)) {
					  x1 = x1.replace(rgx, '$1' + ',' + '$2');
					 }
					 return x1 + x2;
			}//fnAddCommas

				
			//Get the initial areas pased on the projection by first converting topojson back to geojson using area method
			function fnGetStateAreas () {
			
				areaJSON = {};
				geojson = topojson.feature(topology,topology.objects.states).features;
				geojson.forEach(function(d) {
						areaJSON[d.id] = d3.geo.path().projection(proj).area(d)		
					});
				return areaJSON;
				
			}//fnGetStateAreas	  
			
			
			function fnGetUSAtopoJSON() {
				return (
				{"type":"Topology","transform":{"scale":[0.010483693461690662,0.005244681944955843],"translate":[-171.79111060289114,18.91619]},"objects":{"states":{"type":"GeometryCollection","geometries":[{"type":"Polygon","id":"Maryland","arcs":[[0,1,2,3,4,5,6,7,8,9]]},{"type":"Polygon","id":"Minnesota","arcs":[[10,11,12,13,14]]},{"type":"Polygon","id":"Montana","arcs":[[15,16,17,18,19]]},{"type":"Polygon","id":"North Dakota","arcs":[[20,-18,21,-13]]},{"type":"MultiPolygon","id":"Hawaii","arcs":[[[22]],[[23]],[[24]],[[25]],[[26]]]},{"type":"Polygon","id":"Idaho","arcs":[[27,28,29,30,31,32,-16,33]]},{"type":"Polygon","id":"Washington","arcs":[[34,35,-32]]},{"type":"Polygon","id":"Arizona","arcs":[[36,37,38,39,40]]},{"type":"Polygon","id":"California","arcs":[[-37,41,42,43]]},{"type":"Polygon","id":"Colorado","arcs":[[44,45,46,47,48,49]]},{"type":"Polygon","id":"Nevada","arcs":[[-44,50,-29,51,-38]]},{"type":"Polygon","id":"New Mexico","arcs":[[52,-46,53,54,55]]},{"type":"Polygon","id":"Oregon","arcs":[[-51,-43,56,-35,-31,57]]},{"type":"Polygon","id":"Wyoming","arcs":[[58,-34,-20,59,60,-48]]},{"type":"Polygon","id":"Arkansas","arcs":[[61,62,63,64,65,66]]},{"type":"Polygon","id":"Iowa","arcs":[[67,68,69,70,-11,71]]},{"type":"Polygon","id":"Kansas","arcs":[[72,-50,73,74,75,76]]},{"type":"Polygon","id":"Missouri","arcs":[[77,78,-66,79,80,81,-75,82,-69,83]]},{"type":"Polygon","id":"Nebraska","arcs":[[-83,-74,-49,-61,84,-70]]},{"type":"Polygon","id":"Oklahoma","arcs":[[85,-54,-45,-73,86,-80,-65]]},{"type":"Polygon","id":"South Dakota","arcs":[[-85,-60,-19,-21,-12,-71]]},{"type":"Polygon","id":"Louisiana","arcs":[[87,88,89,90,-63]]},{"type":"Polygon","id":"Texas","arcs":[[-91,91,-55,-86,-64]]},{"type":"Polygon","id":"Connecticut","arcs":[[92,93,94,95]]},{"type":"Polygon","id":"Massachusetts","arcs":[[96,-94,97,98,99,100]]},{"type":"Polygon","id":"New Hampshire","arcs":[[101,102,103,104,-100]]},{"type":"Polygon","id":"Rhode Island","arcs":[[-97,105,-95]]},{"type":"Polygon","id":"Vermont","arcs":[[-99,106,107,-102]]},{"type":"Polygon","id":"Alabama","arcs":[[108,109,110,111,112]]},{"type":"Polygon","id":"Florida","arcs":[[-109,113,114]]},{"type":"Polygon","id":"Georgia","arcs":[[-114,-113,115,116,117,118]]},{"type":"Polygon","id":"Mississippi","arcs":[[-62,119,-111,120,121]]},{"type":"Polygon","id":"South Carolina","arcs":[[-118,122,123]]},{"type":"Polygon","id":"Illinois","arcs":[[124,125,-84,-68,126,127]]},{"type":"Polygon","id":"Indiana","arcs":[[128,129,-125,130,131]]},{"type":"Polygon","id":"Kentucky","arcs":[[132,133,134,-78,-126,-130,135]]},{"type":"Polygon","id":"North Carolina","arcs":[[-123,-117,136,137,138]]},{"type":"Polygon","id":"Ohio","arcs":[[-136,-129,139,140,141,142]]},{"type":"Polygon","id":"Tennessee","arcs":[[143,-137,-116,-112,-120,-67,-79,-135]]},{"type":"Polygon","id":"Wisconsin","arcs":[[-127,-72,-15,144,145,146]]},{"type":"Polygon","id":"West Virginia","arcs":[[147,-8,148,-133,-143,149]]},{"type":"Polygon","id":"Delaware","arcs":[[-1,150,151,152]]},{"type":"Polygon","id":"New Jersey","arcs":[[-152,153,154,155]]},{"type":"Polygon","id":"New York","arcs":[[-98,-93,156,-155,157,158,-107]]},{"type":"Polygon","id":"Pennsylvania","arcs":[[-151,-10,-150,-142,159,-158,-154]]},{"type":"Polygon","id":"Maine","arcs":[[-104,160]]},{"type":"MultiPolygon","id":"Michigan","arcs":[[[-140,-132,161]],[[162,163]]]},{"type":"MultiPolygon","id":"Alaska","arcs":[[[164]],[[165]],[[166]],[[167]]]},{"type":"MultiPolygon","id":"Virginia","arcs":[[[-7,168,-5,169,-138,-144,-134,-149]]]},{"type":"Polygon","id":"District of Columbia","arcs":[[-6,-169]]},{"type":"Polygon","id":"Utah","arcs":[[-52,-28,-59,171,-39]]}]}},"arcs":[[[9157,3967],[7,-243],[63,0]],[[9227,3724],[0,-9],[-31,-74]],[[9196,3641],[-22,-3],[-11,-12]],[[9163,3626],[-15,22],[-12,19],[-10,15],[-12,17],[-2,29],[-2,31],[-2,28],[-2,35],[-3,35],[-7,-32],[-5,-25],[-6,-25],[5,-31],[5,-32],[5,-28],[5,-30],[-12,6],[-13,6],[-17,8],[-21,10]],[[9042,3684],[-1,6],[-4,21],[-16,-9],[-12,11],[10,42],[13,14],[4,4],[1,16]],[[9037,3789],[3,3],[2,3],[3,4],[2,3],[3,4],[-3,4],[-2,4],[-3,4],[-2,4],[-2,3],[-3,-2],[-2,-3],[-3,-4]],[[9030,3816],[-18,22],[-20,11],[1,5],[6,16],[-13,14],[-11,5],[-3,1]],[[8972,3890],[-7,25],[-12,27],[-29,15],[-19,-14],[-10,-15],[-28,8],[-13,-20],[-19,-7],[-16,-22]],[[8819,3887],[-15,-17],[1,96]],[[8805,3966],[88,0],[31,0],[67,1],[82,-1],[84,1]],[[7684,4687],[-125,4],[-139,-2],[-130,-2],[-104,0]],[[7186,4687],[1,178],[-12,183],[-16,15],[-10,29],[5,26],[22,21],[1,28]],[[7177,5167],[1,35],[-6,29],[-8,30],[-5,39],[-1,44],[-3,10],[-4,56],[-1,26],[-2,22],[-4,39],[-12,39],[-11,35],[-2,35],[-1,37],[3,24],[1,23],[-9,27],[-1,19]],[[7112,5736],[197,0],[0,73],[33,1],[17,-105],[29,-32],[67,-12],[97,-30],[93,-59],[77,25],[117,-50],[-97,-63],[-68,-76],[-64,-81],[-1,-28]],[[7609,5299],[-25,-10],[1,-107],[-3,0],[-23,-21],[-21,-18],[-13,-36],[20,-35],[-8,-48],[0,-52],[-3,-42],[28,-36],[12,-2],[31,-27],[10,-13],[7,-21],[24,-32],[32,-29],[3,-15],[1,-46],[2,-22]],[[5790,4879],[-10,10],[-10,27],[-10,5],[-14,-38],[-21,-6],[-54,12],[-3,-19],[-31,7],[-18,-26],[-17,49],[-11,28],[-20,5],[-6,14],[-6,50],[-17,23],[-10,61],[-12,26],[-11,5],[-10,-27],[-19,-22],[-17,18],[-1,49],[11,13],[-8,49],[9,50],[11,42],[-29,2],[-24,27],[-27,59],[-16,30],[-22,18],[-18,30],[0,35],[-25,50],[-7,201]],[[5317,5736],[285,0],[285,0],[285,0],[285,1]],[[6457,5737],[1,-350],[5,-232]],[[6463,5155],[-5,-174]],[[6458,4981],[-159,2],[-171,-1],[-149,2],[-188,-2],[1,-97],[-2,-6]],[[7177,5167],[-181,-10],[-155,0],[-196,-1],[-182,-1]],[[6457,5737],[330,-1],[325,0]],[[1549,31],[-14,-31],[-23,27],[3,53],[-16,70],[4,21],[17,31],[-7,37],[6,18],[7,-3],[37,-33],[17,-16],[15,-26],[25,-67],[-3,-10],[-37,-41],[-31,-30]],[[1498,329],[-32,-14],[-16,40],[-11,16],[-1,12],[9,16],[34,-18],[25,-29],[-8,-23]],[[1433,431],[-3,-21],[-51,5],[7,24],[47,-8]],[[1348,458],[-5,-11],[-7,3],[-33,6],[-12,44],[-4,7],[26,27],[8,-13],[27,-63]],[[1187,584],[-12,-19],[-32,35],[5,14],[15,19],[22,-5],[2,-44]],[[5793,4401],[-284,-1]],[[5509,4400],[-286,1]],[[5223,4401],[1,343],[9,54]],[[5233,4798],[-8,25],[-18,12],[0,31],[14,43],[20,38],[14,61],[13,50],[10,24],[-6,29],[-16,16],[-22,37]],[[5234,5164],[1,33],[-9,30],[-3,265],[0,243]],[[5223,5735],[94,1]],[[5790,4879],[3,-4],[0,-474]],[[5234,5164],[-197,-2],[-34,-20],[-24,9],[-19,-16],[-35,-21],[-43,3],[-22,-16],[-20,-7],[-15,10],[-34,9],[-22,-6],[-37,-21],[-23,0],[-22,7],[-7,27],[-3,32],[-18,36],[-27,11],[-23,17],[-30,1],[-21,1]],[[4558,5218],[-7,110],[-31,164],[-27,88],[11,37],[138,-64],[51,-180],[23,50],[-15,156],[-32,157],[270,0],[284,-1]],[[5443,2632],[13,-1],[10,38],[-17,26],[-3,29],[-5,33],[19,44],[7,87],[29,39],[-18,37],[-12,36],[-8,33],[-5,26],[-2,17]],[[5451,3076],[6,38],[-5,37],[-2,37],[0,41],[-9,26],[7,24],[20,0],[18,-14],[13,-7],[7,29],[4,6],[-1,153]],[[5509,3446],[154,3],[183,0],[139,-1]],[[5985,3448],[0,-1079]],[[5985,2369],[-189,-2],[-218,135],[-144,92],[9,38]],[[5443,2632],[-121,-21],[-108,-15],[-16,98],[-62,109],[-45,23],[-10,55],[-54,9],[-34,52],[-88,19],[-25,31],[-11,104],[-93,192],[-79,265],[3,44],[-42,63],[-74,160],[-13,155],[-51,104],[21,158],[-3,164]],[[4538,4401],[402,-2]],[[4940,4399],[0,-571],[179,-258],[172,-252],[160,-242]],[[6653,3446],[-92,1]],[[6561,3447],[-114,0],[-162,0],[-151,0],[-149,0]],[[5985,3447],[-1,764]],[[5984,4211],[95,0],[96,0],[191,0],[96,0]],[[6462,4211],[190,0],[0,-185],[0,-6]],[[6652,4020],[1,-294],[0,-280]],[[4940,4399],[283,1],[0,1]],[[5509,4400],[0,-954]],[[5985,2369],[0,1078]],[[6561,3447],[0,-95]],[[6561,3352],[0,-499],[0,-359],[-88,0],[-172,0],[-86,0],[1,-16],[11,-31]],[[6227,2447],[-166,0],[0,-78],[-76,0]],[[4538,4401],[-31,146],[38,180],[23,346],[-10,145]],[[5233,4798],[-8,-54],[-2,-343]],[[5984,4211],[-35,0],[-39,2],[-40,1],[-43,1],[-34,1],[0,69],[0,64],[0,52]],[[6458,4981],[3,-389]],[[6461,4592],[1,-381]],[[7777,3070],[-1,-15],[-17,-14],[-1,-28],[-12,-51],[-11,-11],[-17,-26],[-10,-39],[-21,-66],[-2,-46],[11,-50],[-5,-37]],[[7691,2687],[-81,6],[-104,-6],[-92,0]],[[7414,2687],[6,108],[-23,1],[-18,-2],[-5,12]],[[7374,2806],[3,167],[2,185],[-19,202]],[[7360,3360],[116,-3],[105,0],[101,0],[109,-12],[7,-24],[-10,-20],[-11,-21],[-6,-19],[62,0]],[[7833,3261],[-1,-16],[-9,-26],[-17,-19],[-4,-32],[-15,-25],[1,-55],[-11,-18]],[[7740,4497],[6,-14],[11,-10],[4,-21],[15,-15],[10,-16],[-5,-52],[-17,-43],[-7,-14],[-22,-11],[-32,-9],[-9,-33],[12,-15],[4,-29],[-12,-33],[-7,-29],[-24,-28],[-2,-35]],[[7665,4090],[-13,16],[-18,31],[-105,-5],[-109,-1],[-86,0],[-86,0]],[[7248,4131],[-6,34],[3,34],[-2,33],[-10,55],[-6,23],[-7,6],[-1,44],[-6,32],[-17,36],[0,16],[-6,31],[-5,19]],[[7185,4494],[1,18],[-16,21],[8,31],[5,31],[2,20],[-12,26],[0,46],[13,0]],[[7684,4687],[1,-10],[13,-31],[-9,-14],[1,-40],[4,-17],[6,-30],[31,-19],[9,-29]],[[7277,3447],[-172,0],[-172,0],[-95,-1],[-96,0],[-89,0]],[[6652,4020],[167,0],[124,0],[219,0],[132,0]],[[7294,4020],[22,-26],[13,1],[2,-28],[-13,-35],[7,-18],[12,-40]],[[7337,3874],[25,-18],[-1,-205]],[[7361,3651],[-1,-203],[-83,-1]],[[7887,3438],[-3,-19],[2,-30],[-16,-16],[-21,-20]],[[7849,3353],[-2,-18],[-6,-27],[-8,-47]],[[7360,3360],[1,87],[-1,0]],[[7360,3447],[1,204]],[[7361,3651],[1,204],[-25,19]],[[7294,4020],[-13,41],[-15,24],[-16,30],[-2,16]],[[7665,4090],[-9,-48],[9,-57],[16,-39],[18,-32],[22,-26],[9,-9],[8,-36],[1,-32],[11,-8],[18,13],[18,-31],[-5,-35],[-9,-28],[-6,-34],[13,-28],[19,-27],[11,-1],[25,-42],[10,-5],[7,-46],[-4,-29],[13,-47],[10,5],[17,-30]],[[6461,4592],[186,0],[143,0],[191,0],[25,-24],[35,-16],[8,9],[23,-1],[34,2],[25,-24],[26,-16],[4,-16],[8,-9],[16,-3]],[[7374,2806],[-41,37],[-27,21],[-22,-13],[-33,2],[-20,0],[-16,-16],[-16,-8],[-14,9],[-32,-10],[-14,32],[-15,-28],[-26,13],[-27,29],[-29,-19],[-12,46],[-45,-4],[-28,10],[-32,13],[-14,40],[-25,-13],[-16,16],[-23,20],[0,182],[0,187],[-95,0],[-96,0],[-95,0]],[[7277,3447],[83,0]],[[7691,2687],[7,-11],[-9,-28],[14,-39],[-4,-24],[12,-32],[-13,-20],[-4,-36],[-19,-30],[-8,-40],[-9,-46],[-12,-21],[4,-47],[84,-7],[90,0],[-3,-32],[-6,-31],[6,-24],[13,-22],[3,-32]],[[7837,2165],[2,-19],[1,-3]],[[7840,2143],[17,-50],[-1,-78],[20,-37],[-18,-25],[-36,28],[-36,-36],[-69,5],[-71,101],[-83,-24],[-70,45],[-59,-14]],[[7434,2058],[-7,21],[10,28],[14,25],[1,38],[-7,13],[8,45],[6,21],[9,70],[-8,26],[-11,43],[-8,44],[-6,30],[-15,21],[-6,204]],[[7434,2058],[-80,-44],[-87,-142],[-95,-82],[-52,-91],[-22,-86],[-1,-131],[5,-92],[18,-65],[-37,-5],[-68,42],[-74,59],[-27,89],[-21,134],[-56,108],[-33,112],[-48,131],[-67,76],[-78,-4],[-60,-151],[-79,58],[-50,57],[-23,105],[-32,100],[-57,83],[-49,61],[-34,67]],[[9361,4202],[-1,5],[-3,24],[20,18],[-7,16],[5,146]],[[9375,4411],[73,-3],[89,-5]],[[9537,4403],[1,-104],[-6,-28]],[[9532,4271],[-42,-9],[-55,-10],[-74,-51],[0,1]],[[9602,4305],[-3,29],[-15,22],[-7,50],[-40,-3]],[[9375,4411],[21,132]],[[9396,4543],[79,-3]],[[9475,4540],[115,-2],[10,19],[20,12],[11,-3]],[[9631,4566],[-1,-101],[32,-101],[39,-5],[-10,70],[29,-43],[-8,-54],[-64,-31],[-46,4]],[[9475,4540],[-8,19],[7,25],[3,50],[3,12],[3,45],[10,38],[8,17],[12,45],[2,31],[3,18],[18,9],[22,22],[3,24],[-7,28],[12,51],[-1,0]],[[9565,4974],[10,47],[30,10]],[[9605,5031],[14,-351],[-4,-18],[18,-29],[4,-26],[10,2]],[[9647,4609],[-16,-43]],[[9602,4305],[-70,-34]],[[9396,4543],[4,157],[-14,1],[-1,8],[6,27],[-9,50],[9,39],[-5,30],[-2,56],[4,25],[2,38]],[[9390,4974],[175,0]],[[8278,2302],[-195,-1],[-54,-11],[-2,-15],[22,-46],[-5,-38],[-7,-26]],[[8037,2165],[-85,21]],[[7952,2186],[-3,291],[17,305],[17,247],[-7,37]],[[7976,3066],[120,0],[123,-2]],[[8219,3064],[24,-237],[23,-190],[13,-59],[9,-34],[-16,-34],[-5,-61],[5,-35],[-2,-34],[-3,-31],[6,-25],[5,-22]],[[8278,2302],[14,-52],[96,-8],[155,-29],[7,-33],[12,17],[0,66],[12,7],[19,-14],[20,-4]],[[8613,2252],[17,-132],[32,-164],[42,-134],[1,-83],[45,-221],[-3,-129],[-4,-74],[-24,-116],[-29,-24],[-47,23],[-15,83],[-36,44],[-51,164],[-44,146],[-14,75],[19,126],[-26,105],[-75,160],[-37,29],[-96,-87],[-17,10],[-47,89],[-59,47],[-108,-24]],[[8219,3064],[73,-2],[51,2]],[[8343,3064],[119,-2]],[[8462,3062],[-11,-16],[-15,-36],[26,-31],[16,-12],[18,-60],[11,-34],[34,-45],[6,-24],[23,-31],[11,-46],[30,-38],[7,-44],[6,-21],[-3,-14],[17,-21],[10,-35],[0,-37],[8,-7],[17,-9]],[[8673,2501],[-45,-114],[-15,-135]],[[7777,3070],[94,0],[105,-4]],[[7952,2186],[-73,-13],[-39,-30]],[[7840,2143],[-3,22],[-3,32],[-13,22],[-6,24],[6,31],[3,32],[-90,0],[-84,7],[-4,47],[12,21],[9,46],[8,40],[19,30],[4,36],[13,20],[-12,32],[4,24],[-14,39],[9,28],[-7,11]],[[8462,3062],[9,6],[52,33],[88,-2],[44,-9],[1,-17],[10,13],[15,-32],[-1,-23],[106,-2],[107,-180]],[[8893,2849],[-48,-70],[-14,-64],[-105,-124],[-53,-90]],[[8037,4345],[0,-221],[0,-220],[-11,-53],[8,-14],[5,-33],[-1,-26],[-8,-11],[-7,-32],[-19,-41],[-14,-52],[-3,-38]],[[7987,3604],[1,-14],[-11,-27],[8,-18],[-17,-14],[-21,-16],[4,-41],[-13,-16],[-23,17],[-25,11],[-7,-19],[4,-29]],[[7740,4497],[97,0],[100,0],[73,-2],[0,1],[1,0]],[[8011,4496],[0,-1],[0,-49],[26,-101]],[[8297,4339],[-1,-172],[0,-186],[-1,-132]],[[8295,3849],[-6,-9],[8,-39],[-4,-14],[-16,0],[-15,-17],[-22,7],[-2,-37],[-14,-14],[-12,-33],[-14,-5],[-21,-57],[-19,16],[-6,23],[-17,-38],[-10,-21],[-21,23],[-22,-18],[-7,-19],[-30,29],[-20,-21],[-25,15],[0,-21],[-13,5]],[[8037,4345],[9,-13],[32,1],[26,21]],[[8104,4354],[103,-1],[90,1],[0,-15]],[[8508,3717],[2,-18],[-1,-39],[11,-30],[5,-29],[14,-25],[9,-23],[19,-3]],[[8567,3550],[-10,-15],[-28,-42],[-30,-22],[-2,-16],[-10,-20],[-25,-21],[-2,-2],[-1,-2],[-7,-16],[-15,-9],[-5,-3],[-27,-11]],[[8405,3371],[-65,-6],[-84,8],[-27,-2],[-55,5],[-56,2],[-51,1],[-60,-6],[-3,9],[-19,0],[0,-30],[-136,1]],[[8295,3849],[33,-4],[17,-19],[25,-43],[20,-13],[15,-16],[22,6],[17,-11],[21,10],[18,3],[7,-26],[18,-19]],[[8343,3064],[2,40],[20,12],[7,21],[13,23],[20,5],[22,8],[22,17],[9,17],[19,15],[-1,14],[24,26],[8,-17],[35,36],[16,-4],[15,32],[20,8],[-2,28],[3,24]],[[8595,3369],[161,-9],[190,-1],[101,2],[90,1],[12,0]],[[9149,3362],[14,-191],[-61,-141],[-99,-57],[-62,-112],[-48,-12]],[[8297,4339],[48,2],[44,0],[36,2]],[[8425,4343],[59,-40],[47,-10],[69,26],[57,52],[49,26]],[[8706,4397],[0,-255]],[[8706,4142],[-14,-10],[4,-24],[-4,-44],[-10,-50],[-9,-41],[-2,-19],[-26,-44],[-11,-9],[-13,-6],[-11,5],[-21,-33],[-4,-34],[-3,-19],[-9,-8],[-1,22],[-13,4],[-13,-41],[-2,-42],[-12,-27],[-24,-5]],[[8405,3371],[142,-6],[11,1],[37,3]],[[7609,5299],[96,40],[58,-65]],[[7763,5274],[0,-1],[6,4],[15,-7],[8,-34],[84,-34],[55,-34],[27,-1],[18,-2],[5,-31],[23,-12],[8,-27],[-5,-15],[-5,-31],[21,-2],[-7,-31],[13,-22],[2,-1]],[[8031,4993],[0,-2],[-38,-69],[13,-23],[70,123],[15,1],[-50,-147],[-22,-133],[-18,-108],[12,-93],[-2,-46]],[[8805,3966],[-1,-97],[15,18]],[[8972,3890],[-10,-35],[-5,4],[-44,47],[-2,-11],[-6,-40],[-8,-13],[-3,-6],[-8,-10],[-11,-14],[-14,-25],[-7,8],[-4,-10],[-7,-17],[-9,-24],[-5,-17],[-13,-8],[-15,14],[-12,15],[-9,-42],[-8,-15],[-9,-19],[-4,-28],[-19,-25],[-13,-33],[2,-22],[-1,-7],[-1,-11],[-15,-14],[-14,2],[-12,-13],[-10,6],[-1,-6],[-1,-11],[-6,-2],[-30,-14],[-11,14],[-9,-6],[-22,-17],[-14,15],[-2,4],[-9,13],[-4,33]],[[8706,4142],[0,-176],[99,0]],[[9157,3967],[7,15],[9,8],[20,-9]],[[9193,3981],[-14,-20],[3,-37]],[[9182,3924],[20,-103],[23,-34],[2,-63]],[[9193,3981],[20,17],[7,12],[22,25],[13,21],[-30,49],[-2,20],[-10,6],[0,31],[11,23],[-5,25],[15,17],[17,43],[12,8]],[[9263,4278],[73,-75],[-4,-40]],[[9332,4163],[-29,-53],[28,-9],[-21,-137],[-69,-147],[-7,49],[-21,10],[-31,48]],[[9361,4202],[-6,-5],[140,36],[28,-36],[-133,-57],[-61,-1],[3,24]],[[9263,4278],[-16,14],[-16,13],[-6,27],[2,21],[-11,18],[-21,30],[-129,0],[-139,0],[-149,0],[0,52]],[[8778,4453],[82,113],[-2,19],[-8,57],[45,22],[75,-7],[78,-16],[71,63],[-5,74],[-10,27],[98,133],[43,35],[145,1]],[[8706,4397],[72,55],[0,1]],[[9605,5031],[41,30],[34,86],[29,149],[73,144],[31,-51],[64,33],[43,-55],[0,-260],[62,-108],[17,-62],[-102,-93],[-98,-66],[-101,-56],[-51,-113]],[[8104,4354],[19,27],[39,93],[3,125],[-32,118],[5,81],[25,94],[24,64],[38,45],[9,-63],[16,94],[22,19],[13,73],[81,-39],[71,-74],[7,-87],[-8,-86],[-53,-77],[5,-48],[19,-1],[59,84],[35,-20],[18,-110],[4,-78],[-45,-105],[-20,-67],[-33,-73]],[[8031,4993],[-2,1],[-13,22],[7,31],[-21,2],[5,31],[5,15],[-8,27],[-23,12],[-5,31],[-18,2],[-27,1],[-55,34],[-84,34],[-8,34],[-15,7],[-6,-4],[0,1],[0,-1]],[[7763,5273],[74,49],[77,62],[84,63],[-31,-101],[54,-24],[67,-73],[85,43],[94,16],[20,-53],[29,-8],[6,19],[-6,-19],[25,-6],[48,-76],[-84,-17],[-3,1],[-75,20],[-75,-38],[-65,-17],[-56,-121]],[[1791,7283],[-95,-73],[-49,50],[-14,89],[86,68],[51,29],[63,-13],[41,-59],[-83,-91]],[[592,7816],[-58,-30],[-63,36],[-58,52],[94,32],[76,-17],[9,-73]],[[5,8554],[59,-36],[60,19],[77,-50],[94,-25],[-8,-21],[-72,-40],[-72,41],[-37,35],[-84,-11],[-22,16],[5,72]],[[1595,9958],[69,-86],[42,37],[161,-11],[-5,-44],[145,-32],[98,19],[201,-61],[183,-18],[74,-24],[127,31],[144,-58],[104,-26],[-1,-708],[0,-1086],[94,-5],[93,-53],[66,-84],[85,-125],[93,107],[95,61],[51,-98],[64,-78],[88,-86],[59,-137],[98,-217],[162,-122],[3,-120],[-53,-92],[-53,72],[-84,60],[-27,167],[-123,154],[-51,180],[-92,12],[-151,5],[-112,55],[-197,198],[-92,36],[-167,68],[-132,-16],[-187,87],[-114,82],[-106,-41],[20,-132],[-53,-12],[-110,-40],[-84,-65],[-106,-40],[-13,112],[43,187],[101,59],[-26,48],[-122,-106],[-65,-127],[-137,-136],[69,-93],[-90,-137],[-102,-79],[-96,-58],[-23,-85],[-149,-98],[-30,-90],[-112,-81],[-65,14],[-89,-53],[-97,-65],[-80,-64],[-163,-54],[-15,32],[104,89],[93,59],[102,104],[118,22],[47,78],[133,114],[21,38],[70,68],[17,144],[48,113],[-110,-58],[-30,33],[-52,-70],[-62,97],[-26,-68],[-36,95],[-95,-77],[-59,1],[-8,113],[17,70],[-61,68],[-124,-37],[-81,90],[-65,46],[0,108],[-74,81],[37,110],[78,106],[34,98],[77,14],[66,-31],[77,92],[69,-16],[73,59],[-18,87],[-54,34],[71,74],[-59,-2],[-101,-42],[-29,-42],[-75,42],[-135,-21],[-140,46],[-40,76],[-120,111],[134,80],[212,93],[79,0],[-13,-95],[201,7],[-77,118],[-118,73],[-67,95],[-92,81],[-131,61],[53,100],[170,6],[120,87],[23,93],[97,90],[93,22],[181,85],[88,-13],[146,102],[145,-41]],[[9030,3816],[3,-6],[2,-5],[3,-5],[0,-5],[-1,-6]],[[9042,3684],[66,-61],[4,-182],[27,-13],[10,-66]],[[9163,3626],[-29,-130],[8,-7],[54,152]],[[5984,4211],[1,-763]]]}
				);
			  
			} //fnGetUSAtopoJSON	
	
			
		}//fnShowCartogram
	
	


	// Your extension's configuration
	var config = {
		id: 'com.ibi.cartogram',     // string that uniquely identifies this extension
		containerType: 'svg',  // either 'html' or 'svg' (default)
		initCallback: initCallback,
		preRenderCallback: preRenderCallback,  // reference to a function that is called right *before* your extension is rendered.  Will be passed one 'preRenderConfig' object, defined below.  Use this to configure a Monbeam instance as needed
		renderCallback: renderCallback,  // reference to a function that will draw the actual chart.  Will be passed one 'renderConfig' object, defined below
		noDataPreRenderCallback: noDataPreRenderCallback, 
		noDataRenderCallback: noDataRenderCallback,
		resources:  {  // Additional external resources (CSS & JS) required by this extension
			script: ['lib/d3.v3.min.js', 'lib/cartogram.js', 'lib/colorbrewer.js', 'lib/topojson.js' ],
			css: []
		},
		modules: {
			dataSelection: {
				supported: false,  // Set this true if your extension wants to enable data selection
				needSVGEventPanel: false, // if you're using an HTML container or altering the SVG container, set this to true and the chart engine will insert the necessary SVG elements to capture user interactions
				svgNode: function(arg){}  // if you're using an HTML container or altering the SVG container, return a reference to your root SVG node here.
			},				
			tooltip: {
				supported: true  // Set this true if your extension wants to enable HTML tooltips
			}
		}
	};

	// Required: this call will register your extension with the chart engine
	tdgchart.extensionManager.register(config);
  
}());