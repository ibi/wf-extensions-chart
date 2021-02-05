/* Copyright 1996-2021 Information Builders, Inc. All rights reserved. */
/* $Revision: 1.1 $ */

(function() {
	
	var isIE11 = !!window.MSInputMethodContext && !!document.documentMode;
	
	//variable that is used, if no data render callback is being used
	var noDataCallback = '';
	
	//regex workaround for IE11
	//if the 'lookbehind' character is present, IE11 balks.
	//so using a token to replace dynamically to work around that.
	var notIE11Expression = '\\B(?LESS_THAN!\\.\\d*)(?=(\\d{3})+(?!\\d))';
	notIE11Expression = notIE11Expression.replace('LESS_THAN', '<' );	

	var numberFormatRegex = isIE11 ? new RegExp('\\B(?=(\\d{3})+(?!\\d))','g') : new RegExp(notIE11Expression,'g');

	// Decimal and grouping separator (will be checked in render callback)
	var decimalSeparator 			=	".";
	var groupingSeparator 			=	",";

	//function to add grouping separator as thousands separator
	function numberWithGroupingSeparator(number, groupingSeparator) {
		var temp_number_with_grouping = number;

		temp_number_with_grouping = temp_number_with_grouping.toString().replace(numberFormatRegex, groupingSeparator);
		
		return temp_number_with_grouping;
	}

	////function to add comma as thousands separator
	//function NumberWithComma(number) {
	//	return number.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",");
	//}
	////function to add dot as thousands separator
	//function NumberWithDot(number) {
	//	return number.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ".");
	//}
	
	//function to sort array based on measure
	function measure_sort(a, b) {
		const measureA = a.measure;
		const measureB = b.measure;

		let comparisonM = 0;
		//highest value at top
		if (measureA > measureB) {
			comparisonM = -1;
		} 
		else if (measureA < measureB) {
			comparisonM = 1;
		}
		return comparisonM;
	}
	//function to sort array based on dimension
	function dimension_sort(a, b) {
		const dimensionA = a.dimension.toUpperCase();
		const dimensionB = b.dimension.toUpperCase();

		let comparisonD = 0;
		//sort alphabetical from a to z
		if (dimensionA > dimensionB) {
			comparisonD = 1;
		} 
		else if (dimensionA < dimensionB) {
			comparisonD = -1;
		}
		return comparisonD;
	}

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
	// 	var chart = preRenderConfig.moonbeamInstance;
	// 	chart.title.visible = ;
	// 	chart.title.text = "My DataGrid";  // contrived example
	// 	chart.footnote.visible = false;
	// 	chart.footnote.text = "footnote";
	// 	chart.footnote.align = 'right';
	// 
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
		var dataBuckets = renderConfig.dataBuckets;	
		
	//	var userLang = navigator.language || navigator.userLanguage;  	// This gets the browser language
		var userLang = document.documentElement.lang;					// This gets the webfocus language		
		
		//$(renderConfig.rootContainer).parent().css('backgroundColor',props.backgroundColor);

		// Check the CDN setting of the webfocus system
		if (props.setCDN == true) {
			var innerHTML = document.documentElement.innerHTML;
		
			var decimalSeparatorText		=	"setDecimalSeparator";
			var groupingSeparatorText		=	"setGroupingSeparator";
			var decimalSeparatorPosition	=	0;
			var groupingSeparatorPosition	=	0;

			// Determine the position of the decimal and grouping text
			decimalSeparatorPosition		=	innerHTML.search(decimalSeparatorText)
			groupingSeparatorPosition		= 	innerHTML.search(groupingSeparatorText);
		
			// Change position to the decimal and grouping separator
			decimalSeparatorPosition		=	decimalSeparatorPosition + 21;
			groupingSeparatorPosition		=	groupingSeparatorPosition + 22;

			// Determine the decimal and grouping separator
			if (decimalSeparatorPosition !== 20) {
				decimalSeparator			=	innerHTML.substr(decimalSeparatorPosition,1);
			}
			if (groupingSeparatorPosition !== 21) {
				groupingSeparator			=	innerHTML.substr(groupingSeparatorPosition,1);
				if (groupingSeparator == "[") {
						groupingSeparator	=	"'";
				}
			}	
		}
	
		/* Format JSON Data */
		if (typeof data[0].measure !== 'undefined'||typeof data[0].dimension !== 'undefined') {
			
			data.sort(dimension_sort)
			data.sort(measure_sort);
			
			var counter = 0;
			var topDimension = '';
			var firstLine = '';
			var thirdLine = '';
			
			//counter contains the number of lines in data array
			counter = data.length;
			
			//topDimension contains top entry. if available, text will be taken from optional dimension.
			if (typeof data[0].dimensionText !== 'undefined') {
				topDimension = data[0].dimensionText;
			}
			else{
				topDimension = data[0].dimension;
			}
			
			//number format with thousand separator
			counter = numberWithGroupingSeparator(counter, groupingSeparator);
			
			var titleElement = $('foreignObject[class="title"]');

			var titleHeight =  titleElement.length == 1 ? titleElement.height() + 5 : 0;
			
			//text for first and third line
			if (noDataCallback == 'no_Data') {
				firstLine =  '#Product Category';
				thirdLine = 'Top Product Category';
				noDataCallback = '';
			}
			else {
				if (props.firstLine.overwriteFirstLine == true)
					firstLine = props.firstLine.overwriteFirstLineText;
				else
					firstLine =  '#' + dataBuckets.getBucket("dimension").fields[0].title;
				
				if (props.thirdLine.overwriteThirdLine == true)
					thirdLine = props.thirdLine.overwriteThirdLineText;
				else
					thirdLine = 'Top ' + dataBuckets.getBucket("dimension").fields[0].title;
			}

			$(container).css('top',titleHeight+'px').append('<div class="counter-container" style="font-family:'+props.fontFamily+';font-size:'+props.fontSize+';color:'+props.color+';font-style:'+props.fontStyle+'"></div>');
			// fill containers on html page - firstLine
			$(container).find('.counter-container').append('<div><div class="counter-firstLine" style="font-weight:'+props.firstLine.fontWeight+';font-size:'+props.firstLine.fontSize+';color:'+props.firstLine.color+';font-style:'+props.firstLine.fontStyle+'">' + firstLine + '</div></div>');
			// fill containers on html page - counter			
			$(container).find('.counter-container').append('<div><div class="counter-measure" style="font-weight:'+props.counter.fontWeight+';font-size:'+props.counter.fontSize+';color:'+props.counter.color+';font-style:'+props.counter.fontStyle+'">' + counter + '</div></div>');	
			
			if (props.hideTopDimension == true) {
			}
			else {
				// fill containers on html page - thirdLine	
				$(container).find('.counter-container').append('<div><div class="counter-thirdLine" style="font-weight:'+props.thirdLine.fontWeight+';font-size:'+props.thirdLine.fontSize+';color:'+props.thirdLine.color+';font-style:'+props.thirdLine.fontStyle+'">' + thirdLine + '</div></div>');
				// fill containers on html page - topDimension			
				$(container).find('.counter-container').append('<div><div class="counter-topDimension" style="font-weight:'+props.topDimension.fontWeight+';font-size:'+props.topDimension.fontSize+';color:'+props.topDimension.color+';font-style:'+props.topDimension.fontStyle+'">' + topDimension + '</div></div>');
			}			
		}
		renderConfig.renderComplete();	
	}
	
	function noDataRenderCallback(renderConfig) {
		var container = renderConfig.container;
		var grey = renderConfig.baseColor;
		renderConfig.data = [{"dimension":"Computer","measure":250000,"_s":0,"_g":0},{"dimension":"B","measure":225000,"_s":0,"_g":1},{"dimension":"C","measure":200000,"_s":0,"_g":2},{"dimension":"D","measure":175000,"_s":0,"_g":3},{"dimension":"E","measure":150000,"_s":0,"_g":4},{"dimension":"F","measure":125000,"_s":0,"_g":5},{"dimension":"G","measure":100000,"_s":0,"_g":6},{"dimension":"H","measure":75000,"_s":0,"_g":7},{"dimension":"I","measure":50000,"_s":0,"_g":8},{"dimension":"J","measure":25000,"_s":0,"_g":9}];
		
		noDataCallback = 'no_Data';
		
		renderCallback(renderConfig);
		
		$(container).append('<div class="placeholder">Add measures or dimensions</div>');
	}

	// Your extension's configuration
	var config = {
		id: 'com.ibi.dimension_counter_by_kpi',     // string that uniquely identifies this extension
		containerType: 'html',  // either 'html' or 'svg' (default)
		initCallback: initCallback,
		preRenderCallback: preRenderCallback,  // reference to a function that is called right *before* your extension is rendered.  Will be passed one 'preRenderConfig' object, defined below.  Use this to configure a Monbeam instance as needed
		renderCallback: renderCallback,  // reference to a function that will draw the actual chart.  Will be passed one 'renderConfig' object, defined below
		noDataPreRenderCallback: noDataPreRenderCallback, 
		noDataRenderCallback: noDataRenderCallback,
		resources: {
			script:
				window.jQuery
					? ['lib/jquery.sparkline.min.js']
					: [
						['', tdgchart.getScriptPath().split('/')[1], 'jquery/js/jquery.js'].join('/'),
						'lib/jquery.sparkline.min.js'
					],
			css: ['css/open-sans.css', 'css/dim_counter.css']
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
