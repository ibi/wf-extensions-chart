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
	
	function getTierNumber(number) {
		return Math.log10(Math.abs(number)) / 3 | 0;
	}
	
	function getShortenNumber(number) {
		var tier = getTierNumber(number);
		if (tier == 0) 
			return number;
		
		var scale = Math.pow(10, tier * 3);
		var shortenNumber = number / scale;
		return shortenNumber;
	}
	
	function getShortenLetter(number) {
		var SI_POSTFIXES = ["", "k", "M", "B", "T", "P", "E"];
		var tier = getTierNumber(number);
		if (tier == 0) 
			return '';
		return SI_POSTFIXES[tier];
	}

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
	
	function getNumberFormat(bucketName, fieldIndex, renderConfig) {
		var bucket = renderConfig.moonbeamInstance.dataBuckets.getBucket(bucketName);
		if (typeof bucket == 'undefined') {
			throw 'Bucket: ' + bucketName + ' is undefined';
		}
		var numberFormat = bucket.fields[fieldIndex || 0].numberFormat;
		return numberFormat === undefined ? '###' : numberFormat;
	}
	
	function getFormattedNumber(number, numberFormat, makeShortenNumbers, renderConfig) {
		if(makeShortenNumbers) {			
			var shortenLetter = getShortenLetter(number),
			    shortenNumber = getShortenNumber(number),
			    valueFormatApplied = numberFormat;

			var lastCharValueFormat = valueFormatApplied.substring(valueFormatApplied.length - 1);
			if (lastCharValueFormat == '%') {
				valueFormatApplied = valueFormatApplied.replace('`%', '%').replace('%', shortenLetter + lastCharValueFormat);
			} else if (lastCharValueFormat == '€') {
				valueFormatApplied = valueFormatApplied.substring(0, valueFormatApplied.length - 2) + shortenLetter + lastCharValueFormat;
			} else {
				valueFormatApplied += shortenLetter;
			}

			return renderConfig.moonbeamInstance.formatNumber(shortenNumber, valueFormatApplied);			
		} else {
			return renderConfig.moonbeamInstance.formatNumber(number, numberFormat);
		}
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
		
		/* Set Background Color */
		//$(renderConfig.rootContainer).parent().css('backgroundColor',props.backgroundColor);
		
		/* Format JSON Data */
		if (typeof data[0].keymeasure !== 'undefined' && typeof data[0].measure !== 'undefined') {
			$(container).css('top','0px').append('<div class="kpi-table-container" style="font-size:'+props.fontSize+';color:'+props.color+'"></div>');
			var numOfMeasures = typeof data[0].measure == 'object'? data[0].measure.length : 1;

			if (typeof data[0].group !== 'undefined')
				$(container).find('.kpi-table-container').addClass('multi').append('<div class="kpi-table-nav"></div>');
			
			var makeShortenNumbers = props.shortenNumbers;
			
			data.forEach(function(row, index){
				if (typeof row.group !== 'undefined')
					$(container)
						.find('.kpi-table-container>.kpi-table-nav')
						.append('<a href="#" class="kpi-table-nav-pill">' + row.group + '</a>');
						
				var keymeasureFormat = getNumberFormat('keymeasure', 0, renderConfig),
					formattedKeyMeasure = getFormattedNumber(row.keymeasure, keymeasureFormat, makeShortenNumbers, renderConfig);

				var drillMeasureClass = chart.buildClassName('riser', row._s, row._g, 'mbar');
					
				var slide = '<div class="kpi-table-slide"><table>'
					+ '<thead>'
						+ '<tr><th class="' + drillMeasureClass + ' kpi-table-heading-title" colspan="' + numOfMeasures
							+ '" style="font-weight:' + props.headingTitle.fontWeight
							+ ';font-size:' + props.headingTitle.fontSize
							+ ';color:' + props.headingTitle.color + '">'
							+ dataBuckets.keymeasure.title+'</th></tr>'
						+ '<tr><th class="' + drillMeasureClass + ' kpi-table-heading-nbr" colspan="' + numOfMeasures
							+ '" style="font-weight:' + props.headingData.fontWeight
							+ ';font-size:' + props.headingData.fontSize
							+ ';color:' + props.headingData.color + '">'
						+ formattedKeyMeasure + '</th></tr>'
					+ '</thead>'
					+ '<tbody><tr></tr><tr></tr></tbody></table></div>'
				$(container).find('.kpi-table-container').append(slide);

				for (var i=0; i<numOfMeasures; i++) {
					
					var measure = Array.isArray(row.measure) ? row.measure[i] : row.measure,
						measureFormat = getNumberFormat('measure', i, renderConfig),
						formattedMeasure = getFormattedNumber(measure, measureFormat, makeShortenNumbers, renderConfig);
					
					if (numOfMeasures==1)
						$(container)
							.find('.kpi-table-container>.kpi-table-slide:last tbody>tr:first')
							.append('<td class="kpi-table-title" style="font-weight:' + props.columnTitle.fontWeight
								+ ';font-size:' + props.columnTitle.fontSize
								+ ';color:' + props.columnTitle.color
							+ '">' + dataBuckets.measure.title + '</td>')
					else
						$(container)
							.find('.kpi-table-container>.kpi-table-slide:last tbody>tr:first')
							.append('<td class="kpi-table-title" style="font-weight:' + props.columnTitle.fontWeight
								+ ';font-size:' + props.columnTitle.fontSize
								+ ';color:' + props.columnTitle.color
							+ '">' + dataBuckets.measure.title[i] + '</td>')

					$(container)
						.find('.kpi-table-container>.kpi-table-slide:last tbody>tr:last')
						.append('<td class="kpi-table-data" style="font-weight:' + props.columnData.fontWeight
							+ ';font-size:' + props.columnData.fontSize
							+ ';color:' + props.columnData.color
							+ '">' + formattedMeasure + '</td>')
				}
			});
			
			$(container).find('.kpi-table-nav-pill:first,.kpi-table-slide:first').addClass('active');

			$(container).find('.kpi-table-nav-pill').on('touchstart click', function(e){
				e.stopPropagation();
				e.preventDefault();

				var activeIndex = $(this).parent().children('.active').index();
				var index = $(this).index();
				var prevIndex = index==0? $(this).parent().children().length : index-1;
				var nextIndex = index==$(this).parent().children().length? 0 : index+1;
				console.log('index:', index, 'next:', nextIndex, 'prev:', prevIndex);
				
				$(this).addClass('active').siblings().removeClass('active');

				var $container = $(this).closest('.kpi-table-container');
					if (activeIndex<index) {
						$container
							.find('.kpi-table-slide:eq('+activeIndex+')')
							.animate({ left: '-200%' }, function(){ $(this).removeClass('active') });
						$container
							.find('.kpi-table-slide:eq('+index+')')
							.css('left', '200%')
							.addClass('active').animate({ left: '0' });				
					}
					else if (activeIndex > index) {
						$container
							.find('.kpi-table-slide:eq('+activeIndex+')')
							.animate({ left: '200%' }, function(){ $(this).removeClass('active') });
						$container
							.find('.kpi-table-slide:eq('+index+')')
							.css('left', '-200%').addClass('active').animate({ left: '0' });										
					}				
			})
		}
		
		renderConfig.renderComplete();	
	}
			
	function noDataRenderCallback(renderConfig) {
		var container = renderConfig.container;
		var grey = renderConfig.baseColor;
		renderConfig.data = [{"group":"EMEA","keymeasure":4696057.26,"measure":[3298764,1397293.26,17155],"_s":0,"_g":0},{"group":"North America","keymeasure":1886995.03,"measure":[1326176,560819.03,6924],"_s":0,"_g":1},{"group":"South America","keymeasure":438176.63,"measure":[306903,131273.63,1733],"_s":0,"_g":2}];
		renderConfig.dataBuckets = {"buckets":{"group":{"title":"Store Region","count":1},"keymeasure":{"title":"Revenue","count":1},"measure":{"title":["Cost of Goods","Gross Profit","Quantity Sold"],"count":3}},"depth":1};
		getNumberFormat = function () {return '###'};
		renderCallback(renderConfig);		
		
		if ($('.drop-label.ibx-widget').length==0)  //IA-9152
			$(container).append('<div class="placeholder">Add measures or dimensions</div>');
	}

	// Your extension's configuration
	var jqueryPath;
	if (!window.jQuery) {
		var path = tdgchart.getScriptPath();
		jqueryPath = path.substr(0, path.indexOf('tdg')) + 'jquery/js/jquery.js';
	}
	var config = {
		id: 'com.ibi.kpi.table',     // string that uniquely identifies this extension
		containerType: 'html',  // either 'html' or 'svg' (default)
		initCallback: initCallback,
		preRenderCallback: preRenderCallback,  // reference to a function that is called right *before* your extension is rendered.  Will be passed one 'preRenderConfig' object, defined below.  Use this to configure a Monbeam instance as needed
		renderCallback: renderCallback,  // reference to a function that will draw the actual chart.  Will be passed one 'renderConfig' object, defined below
		noDataPreRenderCallback: noDataPreRenderCallback, 
		noDataRenderCallback: noDataRenderCallback,
		resources: {
			script: window.jQuery
					? []
					: [jqueryPath],
			css: ['css/open-sans.css','css/table.css']
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

