/* Copyright (C) 1996-2023. Cloud Software Group, Inc. All rights reserved. */
/* $Revision: 1.3 $ */

(function() {

	var isIE11 = !!window.MSInputMethodContext && !!document.documentMode;	
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
	
	//function NumberWithComma(number) {
	//	return number.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",");
	//}
	//function NumberWithDot(number) {
	//	return number.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ".");
	//}
	function measure_sort(a, b) {
		const measureA = a.measure;
		const measureB = b.measure;

		let comparisonM = 0;
		if (measureA > measureB) {
			comparisonM = -1;
		} 
		else if (measureA < measureB) {
			comparisonM = 1;
		}
		return comparisonM;
	}
	function dimension_sort(a, b) {
		const dimensionA = a.dimension.toUpperCase();
		const dimensionB = b.dimension.toUpperCase();

		let comparisonD = 0;
		if (dimensionA > dimensionB) {
			comparisonD = 1;
		} 
		else if (dimensionA < dimensionB) {
			comparisonD = -1;
		}
		return comparisonD;
	}
		function abbreviateNumber(number, decimals, userLang) {
		var SI_POSTFIXES = ["", "K", "M", "B", "T", "P", "E"];
				if (userLang == 'de-DE') {
			SI_POSTFIXES = ["", "Tsd.", "Mio.", "Mrd.", "Bio.", "Brd.", "Trio."];
		}
		var tier = Math.log10(Math.abs(number)) / 3 | 0;
		if (tier == 0) 
			return number;
		var postfix = SI_POSTFIXES[tier];
		var scale = Math.pow(10, tier * 3);
		var scaled = number / scale;
		var formatted = scaled.toFixed(decimals) + '';
		return formatted + postfix;
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
			var dim_text =  [];
			var msr_value = [];
			var percent = '';
			var position = '';
			var titleNumber = 0;
			var title = '';
			var rankingNumbersArr = ["1st", "2nd", "3rd", "4th", "5th", "6th", "7th", "8th", "9th", "10th"];
						
			for (var i=0; i<data.length; i++) {
				if (i < 10 && i < props.numberOfTopEntries) {
					dim_text[i] 	= data[i].dimension;
					msr_value[i]	= data[i].measure;
					msr_value[i]	= msr_value[i].toFixed(props.measureNumber.decimalPlaces);
					if (props.measureNumber.abbreviateNumber == true) {
						msr_value[i] = abbreviateNumber(msr_value[i], props.measureNumber.decimalPlaces, userLang);
					}
					else {
					}
					msr_value[i] = msr_value[i].replace(".", decimalSeparator);
					msr_value[i] = numberWithGroupingSeparator(msr_value[i], groupingSeparator);
				}
			}
			
			// measure number with or without % sign
			if  (props.measureNumber.percentValue == true)
				percent = '%';
			
			var titleElement = $('foreignObject[class="title"]');

			var titleHeight =  titleElement.length == 1 ? titleElement.height() + 5 : 0;

			if (props.numberOfTopEntries < 11) 
				titleNumber = props.numberOfTopEntries;
			else
				titleNumber = 10;
			
			if (noDataCallback == 'no_Data') {
				title =  'Top10 Sales by Department';
				noDataCallback = '';
			}
			else {
				if (props.headline.overwriteHeadline == true)
					title = props.headline.overwriteHeadlineText;
				else
					title =  'Top' + titleNumber + ' ' + dataBuckets.getBucket("measure").fields[0].title + ' by ' + dataBuckets.getBucket("dimension").fields[0].title;
			}

			if (props.measureNumber.hideMeasureNumber == true) {
				// create top10-container-wo-measure				
				$(container).css('top',titleHeight+'px').append('<div class="top10-container-wo-measure" style="font-family:'+props.fontFamily+';font-size:'+props.fontSize+';color:'+props.color+';font-style:'+props.fontStyle+';min-width:'+props.widgetWidth.minimumWidgetWidth+'px;max-width:'+props.widgetWidth.maximumWidgetWidth+'px"></div>');
				if (props.headline.disableHeadline == true) {
				}
				else {
					// fill containers on html page - headline
					$(container).find('.top10-container-wo-measure').append('<div><div class="top10-headline" style="font-weight:'+props.headline.fontWeight+';font-size:'+props.headline.fontSize+';color:'+props.headline.color+';font-style:'+props.headline.fontStyle+'">' + title + '</div></div>');
				}
			}
			else {
				// create top10-container				
				$(container).css('top',titleHeight+'px').append('<div class="top10-container" style="font-family:'+props.fontFamily+';font-size:'+props.fontSize+';color:'+props.color+';font-style:'+props.fontStyle+';min-width:'+props.widgetWidth.minimumWidgetWidth+'px;max-width:'+props.widgetWidth.maximumWidgetWidth+'px"></div>');
				if (props.headline.disableHeadline == true) {
				}
				else {
					// fill containers on html page - headline
					$(container).find('.top10-container').append('<div><div class="top10-headline" style="font-weight:'+props.headline.fontWeight+';font-size:'+props.headline.fontSize+';color:'+props.headline.color+';font-style:'+props.headline.fontStyle+'">' + title + '</div></div>');
				}
			}
			
			for (var z=0; z<props.numberOfTopEntries; z++) {
				if ( z < 10 ) {
					if (props.dimensionText.disableRankingText == true) {
						position = '';
					}
					else {
						if (props.dimensionText.switchRankingNumbersFormat == true) {
							position = rankingNumbersArr[z];
							position = position + ' ';	
						}
						else {						
							position = z + 1;
							position = '#' + position + ' ';
						}
					}

					if (props.measureNumber.hideMeasureNumber == true) {
						// fill containers on html page - dimension only
						$(container).find('.top10-container-wo-measure').append('<div><div class="top10-dimension-wo-measure" style="font-weight:'+props.dimensionText.fontWeight+';font-size:'+props.dimensionText.fontSize+';color:'+props.dimensionText.color+';text-align:'+props.dimensionText.textAlign+';font-style:'+props.dimensionText.fontStyle+'">' + position + dim_text[z] + '</div></div>');
					}
					else {
						// fill containers on html page - dimension + measure
						$(container).find('.top10-container').append('<div><div class="top10-dimension" style="font-weight:'+props.dimensionText.fontWeight+';font-size:'+props.dimensionText.fontSize+';color:'+props.dimensionText.color+';text-align:'+props.dimensionText.textAlign+';font-style:'+props.dimensionText.fontStyle+'">' + position + dim_text[z] + '</div><div class="top10-measure" style="font-weight:'+props.measureNumber.fontWeight+';font-size:'+props.measureNumber.fontSize+';color:'+props.measureNumber.color+';font-style:'+props.measureNumber.fontStyle+'">' + msr_value[z] + percent + '</div></div>');						
					}
				}
			}	
		}
		renderConfig.renderComplete();	
	}
	
	function noDataRenderCallback(renderConfig) {
		var container = renderConfig.container;
		var grey = renderConfig.baseColor;
		renderConfig.data = [{"dimension":"A","measure":250000,"_s":0,"_g":0},{"dimension":"B","measure":225000,"_s":0,"_g":1},{"dimension":"C","measure":200000,"_s":0,"_g":2},{"dimension":"D","measure":175000,"_s":0,"_g":3},{"dimension":"E","measure":150000,"_s":0,"_g":4},{"dimension":"F","measure":125000,"_s":0,"_g":5},{"dimension":"G","measure":100000,"_s":0,"_g":6},{"dimension":"H","measure":75000,"_s":0,"_g":7},{"dimension":"I","measure":50000,"_s":0,"_g":8},{"dimension":"J","measure":25000,"_s":0,"_g":9}];
		
		noDataCallback = 'no_Data'
		
		renderCallback(renderConfig);
		
		$(container).append('<div class="placeholder">Add measures or dimensions</div>');
	}

	// Your extension's configuration
	var config = {
		id: 'com.ibi.top_10_with_kpi_flexible',     // string that uniquely identifies this extension
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
			css: ['css/open-sans.css', 'css/top_10.css']
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
