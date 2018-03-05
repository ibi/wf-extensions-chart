/* Copyright 1996-2015 Information Builders, Inc. All rights reserved. */
/* $Revision: 1.0 $ */

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
	function initCallback(successCallback, initConfig) {
		successCallback(true);
	}
	
	// Optional: if defined, is invoked once at the very beginning of each chart engine draw cycle
	// Use this to configure a specific chart engine instance before rendering.
	// Arguments: 
	//  - preRenderConfig: the standard callback argument object
	function preRenderCallback(preRenderConfig) {
		var chart = preRenderConfig.moonbeamInstance;
		chart.title.visible = false;
		chart.title.text = "My DataGrid";  // contrived example
		chart.footnote.visible = false;
		chart.footnote.text = "footnote";
		chart.footnote.align = 'right';
	}
	
	function noDataPreRenderCallback(preRenderConfig) {
		var chart = preRenderConfig.moonbeamInstance;
		chart.legend.visible = false;
		chart.dataArrayMap = undefined;
		chart.dataSelection.enabled = false;
	}

	// Required: Invoked during each chart engine draw cycle
	// This is where your extension should be rendered
	// Arguments:
	//  - renderConfig: the standard callback argument object, including additional properties width, height, etc
	function renderCallback(renderConfig) {

		var chart = renderConfig.moonbeamInstance;
		var props = renderConfig.properties;
		
		var container = renderConfig.container;
		var data = renderConfig.data;
		var dataBuckets = renderConfig.dataBuckets.buckets;	
		
		//$(renderConfig.rootContainer).parent().css('backgroundColor',props.backgroundColor);
	
		/* Format JSON Data */
		if (typeof data[0].measure !== 'undefined'||typeof data[0].xaxis !== 'undefined') {
			var group1='';
			var group2='';
			var total1 = 0;
			var total2 = 0;
			var bars = [];

			for (var i=0; i<data.length; i++) {
				/* Process Groups */
				if (typeof data[i].xaxis !== 'undefined') {
					if (typeof data[i].compare === 'undefined') {
						//group1 = data[i].row;
						bars.push(data[i].measure);
						total1 += data[i].measure;
					}
					else {
						/* Capture Group #1 */
						if (i==0)
							group1 = data[i].compare;

						/* Capture Group #2 */
						if (data[i].compare!=group1 && group2=='')
							group2 = data[i].compare;

						/* Create Data Array and capture Totals */
						if (data[i].compare==group1) {
								bars.push(data[i].measure);	
								total1 += data[i].measure;
						}
						else if (data[i].compare==group2) {
								total2 += data[i].measure;
						}
						else {
							break;
						}
					}
				}
			}
			
			var title = dataBuckets.measure.title;
			$(container).css('top','0px').append('<div class="kpi-container" style="font-family:'+props.fontFamily+';font-size:'+props.fontSize+';color:'+props.color+'"></div>');
			var seriesColor = props.barProperties.goodColor;

			if (group2=='')
				$(container).find('.kpi-container').append('<div><div class="kpi-title" style="font-weight:'+props.measureName.fontWeight+';font-size:'+props.measureName.fontSize+';color:'+props.measureName.color+'">' + title + '</div></div>');
			else {
				var percentChange = Math.round((total1-total2)/total1/100*10000);
				var goodIs = eval(percentChange+props.barProperties.goodIs);
				seriesColor = goodIs? seriesColor: props.barProperties.badColor;
				percentChange = goodIs? '+' + percentChange + '% ' + dataBuckets.compare.title : percentChange + '% ' + dataBuckets.compare.title;
				$(container).find('.kpi-container').append('<div><div class="kpi-title compare" style="font-weight:'+props.measureName.fontWeight+';font-size:'+props.measureName.fontSize+';color:'+props.measureName.color+'">' + title + '</div><div class="kpi-change" style="font-size:'+props.percentChange.fontSize+';color:'+props.percentChange.color+'">'+percentChange+'</div></div>');
			}

			$(container).find('.kpi-container').append('<div><div class="kpi-total" style="font-weight:'+props.total.fontWeight+';font-size:'+props.total.fontSize+';color:'+props.total.color+'">' + abbreviateNumber(total1) + '</div><div class="kpi-sparkline"></div></div>');

			var chartProperties;
			if (props.type=='bar')
				chartProperties = {	type: props.type , barWidth: props.barProperties.width, height: props.barProperties.height, barColor: seriesColor };
			else
				chartProperties = {	type: props.type , width: props.barProperties.width * (bars.length-1), height: props.barProperties.height, lineColor: seriesColor, lineWidth: 2, fillColor: 'rgba(0,0,0,0)', spotColor: 'rgba(0,0,0,0)', minSpotColor: 'rgba(0,0,0,0)', maxSpotColor: 'rgba(0,0,0,0)', highlightLineColor: 'rgba(0,0,0,0)' };
			$(container).find('.kpi-sparkline').sparkline(bars, chartProperties);
		}
		
		renderConfig.renderComplete();	
	}
	
	function noDataRenderCallback(renderConfig) {
		var container = renderConfig.container;
		var grey = renderConfig.baseColor;
		renderConfig.data = [{"compare":"2017","xaxis":"1","measure":35861466.38,"_s":0,"_g":0},{"compare":"2017","xaxis":"2","measure":32447335.21,"_s":0,"_g":1},{"compare":"2017","xaxis":"3","measure":35431268.47,"_s":0,"_g":2},{"compare":"2017","xaxis":"4","measure":32401840.77,"_s":0,"_g":3},{"compare":"2017","xaxis":"5","measure":33927910.25,"_s":0,"_g":4},{"compare":"2017","xaxis":"6","measure":32732103.34,"_s":0,"_g":5},{"compare":"2017","xaxis":"7","measure":33867267.96,"_s":0,"_g":6},{"compare":"2017","xaxis":"8","measure":34030687.74,"_s":0,"_g":7},{"compare":"2017","xaxis":"9","measure":33129035.69,"_s":0,"_g":8},{"compare":"2017","xaxis":"10","measure":41468698.51,"_s":0,"_g":9},{"compare":"2017","xaxis":"11","measure":41330631.98,"_s":0,"_g":10},{"compare":"2017","xaxis":"12","measure":45063421.35,"_s":0,"_g":11},{"compare":"2016","xaxis":"1","measure":22177047.24,"_s":0,"_g":12},{"compare":"2016","xaxis":"2","measure":20713191.81,"_s":0,"_g":13},{"compare":"2016","xaxis":"3","measure":22452940.04,"_s":0,"_g":14},{"compare":"2016","xaxis":"4","measure":20640310.85,"_s":0,"_g":15},{"compare":"2016","xaxis":"5","measure":20959571.54,"_s":0,"_g":16},{"compare":"2016","xaxis":"6","measure":20936944.44,"_s":0,"_g":17},{"compare":"2016","xaxis":"7","measure":21603354.91,"_s":0,"_g":18},{"compare":"2016","xaxis":"8","measure":21851731.9,"_s":0,"_g":19},{"compare":"2016","xaxis":"9","measure":21194759.49,"_s":0,"_g":20},{"compare":"2016","xaxis":"10","measure":25734517.06,"_s":0,"_g":21},{"compare":"2016","xaxis":"11","measure":25549323.64,"_s":0,"_g":22},{"compare":"2016","xaxis":"12","measure":26292085.01,"_s":0,"_g":23},{"compare":"2015","xaxis":"1","measure":10194919.22,"_s":0,"_g":24},{"compare":"2015","xaxis":"2","measure":9271678.03,"_s":0,"_g":25},{"compare":"2015","xaxis":"3","measure":10166669.36,"_s":0,"_g":26},{"compare":"2015","xaxis":"4","measure":9176805.13,"_s":0,"_g":27},{"compare":"2015","xaxis":"5","measure":9644014.21,"_s":0,"_g":28},{"compare":"2015","xaxis":"6","measure":9270650.48,"_s":0,"_g":29},{"compare":"2015","xaxis":"7","measure":9823910.8,"_s":0,"_g":30},{"compare":"2015","xaxis":"8","measure":10039632.37,"_s":0,"_g":31},{"compare":"2015","xaxis":"9","measure":9763960.06,"_s":0,"_g":32},{"compare":"2015","xaxis":"10","measure":11932626.45,"_s":0,"_g":33},{"compare":"2015","xaxis":"11","measure":11606727.04,"_s":0,"_g":34},{"compare":"2015","xaxis":"12","measure":12572846.65,"_s":0,"_g":35},{"compare":"2014","xaxis":"1","measure":7298667.22,"_s":0,"_g":36},{"compare":"2014","xaxis":"2","measure":6801359.08,"_s":0,"_g":37},{"compare":"2014","xaxis":"3","measure":7263788.97,"_s":0,"_g":38},{"compare":"2014","xaxis":"4","measure":6611436.62,"_s":0,"_g":39},{"compare":"2014","xaxis":"5","measure":6795189.18,"_s":0,"_g":40},{"compare":"2014","xaxis":"6","measure":6618896,"_s":0,"_g":41},{"compare":"2014","xaxis":"7","measure":6987826.48,"_s":0,"_g":42},{"compare":"2014","xaxis":"8","measure":7024899.82,"_s":0,"_g":43},{"compare":"2014","xaxis":"9","measure":6679889.03,"_s":0,"_g":44},{"compare":"2014","xaxis":"10","measure":8281929.67,"_s":0,"_g":45},{"compare":"2014","xaxis":"11","measure":8037545.37,"_s":0,"_g":46},{"compare":"2014","xaxis":"12","measure":8427240.8,"_s":0,"_g":47},{"compare":"2013","xaxis":"1","measure":4666392.2,"_s":0,"_g":48},{"compare":"2013","xaxis":"2","measure":4400576.8,"_s":0,"_g":49},{"compare":"2013","xaxis":"3","measure":4726378.34,"_s":0,"_g":50},{"compare":"2013","xaxis":"4","measure":4254925.17,"_s":0,"_g":51},{"compare":"2013","xaxis":"5","measure":4412965.72,"_s":0,"_g":52},{"compare":"2013","xaxis":"6","measure":4656829.9,"_s":0,"_g":53},{"compare":"2013","xaxis":"7","measure":4884691.35,"_s":0,"_g":54},{"compare":"2013","xaxis":"8","measure":4957273.31,"_s":0,"_g":55},{"compare":"2013","xaxis":"9","measure":4856841.92,"_s":0,"_g":56},{"compare":"2013","xaxis":"10","measure":5597174.49,"_s":0,"_g":57},{"compare":"2013","xaxis":"11","measure":5583364.73,"_s":0,"_g":58},{"compare":"2013","xaxis":"12","measure":5815484.48,"_s":0,"_g":59},{"compare":"2012","xaxis":"1","measure":3874651.96,"_s":0,"_g":60},{"compare":"2012","xaxis":"2","measure":3592608.63,"_s":0,"_g":61},{"compare":"2012","xaxis":"3","measure":3977546.75,"_s":0,"_g":62},{"compare":"2012","xaxis":"4","measure":3648111.77,"_s":0,"_g":63},{"compare":"2012","xaxis":"5","measure":3704586.77,"_s":0,"_g":64},{"compare":"2012","xaxis":"6","measure":3694435.21,"_s":0,"_g":65},{"compare":"2012","xaxis":"7","measure":4020855.35,"_s":0,"_g":66},{"compare":"2012","xaxis":"8","measure":4126310.8,"_s":0,"_g":67},{"compare":"2012","xaxis":"9","measure":3688054.34,"_s":0,"_g":68},{"compare":"2012","xaxis":"10","measure":4794720.4,"_s":0,"_g":69},{"compare":"2012","xaxis":"11","measure":4574636.32,"_s":0,"_g":70},{"compare":"2012","xaxis":"12","measure":5001973.63,"_s":0,"_g":71}];
		renderConfig.dataBuckets = {"buckets":{"compare":{"title":"LY","count":1},"xaxis":{"title":"Sale Month","count":1},"measure":{"title":"Revenue","count":1}},"depth":1};
		renderCallback(renderConfig);
		
		$(container).append('<div class="placeholder">Add measures or dimensions</div>');
	}

	
	// Your extension's configuration
	var config = {
		id: 'com.ibi.kpi.sparkline',     // string that uniquely identifies this extension
		containerType: 'html',  // either 'html' or 'svg' (default)
		initCallback: initCallback,
		preRenderCallback: preRenderCallback,  // reference to a function that is called right *before* your extension is rendered.  Will be passed one 'preRenderConfig' object, defined below.  Use this to configure a Monbeam instance as needed
		renderCallback: renderCallback,  // reference to a function that will draw the actual chart.  Will be passed one 'renderConfig' object, defined below
		noDataPreRenderCallback: noDataPreRenderCallback, 
		noDataRenderCallback: noDataRenderCallback,
		resources:  window.jQuery? {
			script: ['../com.ibi.kpi.sparkline/lib/jquery.sparkline.min.js','../com.ibi.kpi.sparkline/lib/util.js'],
			css: ['../com.ibi.kpi.sparkline/css/open-sans.css','css/sparkline.css']
		} : {
			script: ['../com.ibi.kpi.sparkline/lib/jquery-3.2.1.min.js','../com.ibi.kpi.sparkline/lib/jquery.sparkline.min.js','../com.ibi.kpi.sparkline/lib/util.js'],
			css: ['../com.ibi.kpi.sparkline/css/open-sans.css','css/sparkline.css']
		},
		modules: {
			dataSelection: {
				supported: true,  // Set this true if your extension wants to enable data selection
				needSVGEventPanel: true, // if you're using an HTML container or altering the SVG container, set this to true and the chart engine will insert the necessary SVG elements to capture user interactions
				svgNode: function(arg){}  // if you're using an HTML container or altering the SVG container, return a reference to your root SVG node here.
			},
			eventHandler: {
				supported: true
			},
			tooltip: {
				supported: false,  // Set this true if your extension wants to enable HTML tooltips
				// This callback is called when no default tooltip content is passed into the chart.
				// Use this to define 'nice' default tooltips for the given target, ids & data.
				// Return value can be a string (including HTML), or HTML nodes, or any Moonbeam tooltip API object.
				autoContent: function(target, s, g, d, data) {
					if (d.hasOwnProperty('color')) {
						return 'Bar Size: ' + d.value + '<br />Bar Color: ' + d.color;
					}
					return 'Bar Size: ' + d.value;
				}
			}
		}
	};

	// Required: this call will register your extension with the chart engine
	tdgchart.extensionManager.register(config);
}());

