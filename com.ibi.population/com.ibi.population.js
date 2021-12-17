/* globals _*/
(function() {
	// Optional: if defined, is invoked once at the very beginning of each Moonbeam draw cycle
	// Use this to configure a specific Moonbeam instance before rendering.
	// Arguments:
	//  - preRenderConfig: the standard callback argument object
	function preRenderCallback(preRenderConfig) {
		preRenderConfig.moonbeamInstance.legend.visible = false;

		/*preRenderConfig.moonbeamInstance.eventDispatcher = { // testing drilling capability
        events: [
          { event: 'setURL', object: 'riser', series: 0, group: 0, url: 'http://google.com' ,target: '_blank' }
        ]
		};*/
	}

	function getFormatedBuckets ( renderConfig ) {
		if ( !renderConfig.dataBuckets || !renderConfig.dataBuckets.buckets ) {
			return;
		}
		var bkts = renderConfig.dataBuckets.buckets,
			modif_bkts = {};
		for ( var bkt in bkts ) {
			if ( bkts.hasOwnProperty( bkt ) ) {
				modif_bkts[bkt] = Array.isArray( bkts[bkt].title ) ? bkts[bkt].title : [bkts[bkt].title];
			}
		}

		return modif_bkts;
	}

	function jsonCpy( el ) {
		return JSON.parse(JSON.stringify(el));
	}

	// Required: Is invoked in the middle of each Moonbeam draw cycle
	// This is where your extension should be rendered
	// Arguments:
	//  - renderConfig: the standard callback argument object, including additional properties width, height, etc
	function renderCallback(renderConfig) {
		
		//Start CHART-2641
		//Documentation for d3.nest: https://github.com/d3/d3-collection/blob/v1.0.7/README.md#nest
		//Use it to sort by 'type' and determine how many unique types are in the inboud data array
		
		var _arrType = new Array(),
			_arrX = new Array(),
			_arrTypeExist = false,
			_arrXExist = false;
		for (var i = 0; i < renderConfig.data.length; i++){
			_arrTypeExist = false;
			_arrXExist = false;
			
			for (var a = 0; a < _arrX.length; a++){
				if (_arrX[a] == renderConfig.data[i].x){
					_arrXExist = true;
					break;
				}
			}
			if (!_arrXExist) _arrX.push( renderConfig.data[i].x );
			
			for (var b = 0; b < _arrType.length; b++){
				if (_arrType[b] == renderConfig.data[i].type){
					_arrTypeExist = true;
					break;
				}
			}
			if (!_arrTypeExist) _arrType.push( renderConfig.data[i].type );
		}
		
		var _numFirstData = 0;
		for (var i = 0; i < renderConfig.data.length; i++){
			if (renderConfig.data[i].x == _arrX[0]){
				_numFirstData
			}
		}
		
		if (_arrType[0].toUpperCase() > _arrType[1].toUpperCase()) _arrType = _arrType.reverse();
		
		var _newData = new Array(),
			_dataExist = false,
			_existingData,
			_g = 0;
		for (var a = 0; a < _arrX.length; a++){
			for (var b = 0; b < _arrType.length; b++){
				_dataExist = false;
				for (var i = 0; i < renderConfig.data.length; i++){
					if ((renderConfig.data[i].x ==_arrX[a]) && (renderConfig.data[i].type == _arrType[b])){
						_existingData = renderConfig.data[i];
						_dataExist = true;
						break;
					}
				}
				
				if (_dataExist){
					_newData.push( _existingData );
				}else{
					_newData.push( {x: _arrX[a], type: _arrType[b], y: 0, _s: 0, _g: 0} );
				}
				_newData[_newData.length-1]._g = _g;
				//VIZ-720 increment the group index
				_g++;
			}
		}
		
		
		//var numUniqueTypes = d3.nest().key(function(d) {return d.type}).entries(renderConfig.data).length;
		var numUniqueTypes = d3.nest().key(function(d) {return d.type}).entries(_newData).length;
		if (numUniqueTypes > 2){
			alert("'Type' bucket has " +  numUniqueTypes + " unique types assigned to it. No more that two types can be visualized with the population chart.")
			return;
		}//if
		//End CHART-2641
		
		var chart = renderConfig.moonbeamInstance;
		var props = JSON.parse(JSON.stringify(renderConfig.properties));

		props.width = renderConfig.width;
		props.height = renderConfig.height;

//		props.data = (renderConfig.data || []).map(function(datum){
		props.data = (_newData || []).map(function(datum){
			var datumCpy = jsonCpy(datum);
			datumCpy.elClassName = chart.buildClassName('riser', datum._s, datum._g, 'bar');
			return datumCpy;
		});

		//props.data = renderConfig.data;
		props.measureLabel = chart.measureLabel;
		props.formatNumber = chart.formatNumber;

		props.buckets = getFormatedBuckets(renderConfig);

    props.isInteractionDisabled = renderConfig.disableInteraction;

		props.onRenderComplete = renderConfig.renderComplete.bind(renderConfig);

		var container = d3.select(renderConfig.container)
			.attr('class', 'com_tdg_population');

		// ---------------- INIT YOUR EXTENSION HERE

		var tdg_population_chart = tdg_population(props);
		tdg_population_chart(container);

		// ---------------- END ( INIT YOUR EXTENSION HERE )

		// ---------------- CALL updateToolTips IF YOU USE MOONBEAM TOOLTIP
		//renderConfig.modules.tooltip.updateToolTips();
	}

  function getInvokeAfter (cb, count) {
      if (!count && typeof cb === 'function' ) cb();

      return function () {
          if (!(--count) && typeof cb === 'function') cb();
      };
  }

	function noDataRenderCallback (renderConfig) {
		var chart = renderConfig.moonbeamInstance;
		var props = renderConfig.properties;

		chart.legend.visible = false;

		props.width = renderConfig.width;
		props.height = renderConfig.height;
		props.data = [{"x":"0-5","type":"Female","y":1450376,"_s":0,"_g":0},{"x":"0-5","type":"Male","y":1483789,"_s":0,"_g":1},{"x":"10-15","type":"Female","y":1216114,"_s":0,"_g":2},{"x":"10-15","type":"Male","y":1260099,"_s":0,"_g":3},{"x":"15-20","type":"Female","y":1110619,"_s":0,"_g":4},{"x":"15-20","type":"Male","y":1077133,"_s":0,"_g":5},{"x":"20-25","type":"Female","y":1003841,"_s":0,"_g":6},{"x":"20-25","type":"Male","y":1017281,"_s":0,"_g":7},{"x":"25-30","type":"Female","y":799482,"_s":0,"_g":8},{"x":"25-30","type":"Male","y":862547,"_s":0,"_g":9},{"x":"30-35","type":"Female","y":639636,"_s":0,"_g":10},{"x":"30-35","type":"Male","y":730638,"_s":0,"_g":11},{"x":"35-40","type":"Female","y":505012,"_s":0,"_g":12},{"x":"35-40","type":"Male","y":588487,"_s":0,"_g":13},{"x":"40-45","type":"Female","y":428185,"_s":0,"_g":14},{"x":"40-45","type":"Male","y":475911,"_s":0,"_g":15},{"x":"45-50","type":"Female","y":341254,"_s":0,"_g":16},{"x":"45-50","type":"Male","y":384211,"_s":0,"_g":17},{"x":"5-10","type":"Female","y":1359668,"_s":0,"_g":18},{"x":"5-10","type":"Male","y":1411067,"_s":0,"_g":19},{"x":"50-55","type":"Female","y":286580,"_s":0,"_g":20},{"x":"50-55","type":"Male","y":321343,"_s":0,"_g":21},{"x":"55-60","type":"Female","y":187208,"_s":0,"_g":22},{"x":"55-60","type":"Male","y":194080,"_s":0,"_g":23},{"x":"60-65","type":"Female","y":162236,"_s":0,"_g":24},{"x":"60-65","type":"Male","y":174976,"_s":0,"_g":25},{"x":"65-70","type":"Female","y":105534,"_s":0,"_g":26},{"x":"65-70","type":"Male","y":106827,"_s":0,"_g":27},{"x":"70-75","type":"Female","y":71762,"_s":0,"_g":28},{"x":"70-75","type":"Male","y":73677,"_s":0,"_g":29},{"x":"75-80","type":"Female","y":40229,"_s":0,"_g":30},{"x":"75-80","type":"Male","y":40834,"_s":0,"_g":31},{"x":"80-85","type":"Female","y":22949,"_s":0,"_g":32},{"x":"80-85","type":"Male","y":23449,"_s":0,"_g":33},{"x":"85-90","type":"Female","y":10511,"_s":0,"_g":34},{"x":"85-90","type":"Male","y":8186,"_s":0,"_g":35},{"x":"90-95","type":"Female","y":6569,"_s":0,"_g":36},{"x":"90-95","type":"Male","y":5259,"_s":0,"_g":37}];
		props.measureLabel = chart.measureLabel;
		props.formatNumber = chart.formatNumber;

		props.buckets = {"x":["age"],"type":["sex"],"y":["people"]};

    props.isInteractionDisabled = renderConfig.disableInteraction;

    var invokeAfterTwo = getInvokeAfter(renderConfig.renderComplete.bind(renderConfig), 2);

		props.onRenderComplete = invokeAfterTwo;

		var container = d3.select(renderConfig.container)
			.attr('class', 'com_tdg_population');

		// ---------------- INIT YOUR EXTENSION HERE

		var tdg_population_chart = tdg_population(props);
		tdg_population_chart(container);

		// ---------------- END ( INIT YOUR EXTENSION HERE )

		// ---------------- CALL updateToolTips IF YOU USE MOONBEAM TOOLTIP
		//renderConfig.modules.tooltip.updateToolTips();

		// ADD TRANSPARENT SCREEN

		container.append("rect")
			.attr({
				width: props.width,
				height: props.height
			})
			.style({
				fill: 'white',
				opacity: 0.3
			});

		// ADD NO DATA TEXT

		container.append('text')
			.text('Add more measures or dimensions')
			.attr({
				'text-anchor': 'middle',
				y: props.height / 2,
				x: props.width / 2
			})
			.style({
				'font-weight' : 'bold',
				'font-size' : '14px',
				dy: '0.35em',
				fill: 'grey'
			});

    invokeAfterTwo();
	}

	// Your extension's configuration
	var config = {
		id: 'com.ibi.population',  // string that uniquely identifies this extension
		preRenderCallback: preRenderCallback,  // reference to a function that is called right *before* your extension is rendered.  Will be passed one 'preRenderConfig' object, defined below.  Use this to configure a Monbeam instance as needed
		renderCallback: renderCallback,  // reference to a function that will draw the actual chart.  Will be passed one 'renderConfig' object, defined below
		noDataRenderCallback: noDataRenderCallback,
		resources:  {  // Additional external resources (CSS & JS) required by this extension
			script: ['lib/d3.min.js', 'lib/population.js'],
			css: ['css/styles.css']
		},
		modules: {
			eventHandler: {
				supported: true
			},
			/*dataSelection: {
				supported: true,  // Set this true if your extension wants to enable data selection
				needSVGEventPanel: false, // if you're using an HTML container or altering the SVG container, set this to true and Moonbeam will insert the necessary SVG elements to capture user interactions
				svgNode: function(arg){}  // if you're using an HTML container or altering the SVG container, return a reference to your root SVG node here.
			},*/
			tooltip: {
				supported: true  // Set this true if your extension wants to enable HTML tooltips
			}
		}
	};

	// Required: this call will register your extension with Moonbeam
	tdgchart.extensionManager.register(config);

}());
