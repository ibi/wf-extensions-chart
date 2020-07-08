/* Copyright 1996-2015 Information Builders, Inc. All rights reserved. */
/* $Revision: 1.4 $ */

(function() {

	var noDataCallback = '';

	function NumberWithComma(number) {
		return number.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",");
	}
	function NumberWithDot(number) {
		return number.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ".");
	}
	function changeBackground(color) {
		document.body.style.background = color;
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
		
		//$(renderConfig.rootContainer).parent().css('backgroundColor',props.backgroundColor);
	
		/* Format JSON Data */
		if (typeof data[0].measure !== 'undefined'||typeof data[0].time !== 'undefined') {
			var total1 = 0;
			var total2 = 0;
			var previous = 0;
			var temp_value = 0;

			for (var i=0; i<data.length; i++) {
				/* Process Data */
				if (typeof data[i].time !== 'undefined') {
					temp_value = data[i].measure;
					total1 = temp_value;
										
					if (i!=0){
						previous = i - 1;
						temp_value = data[previous].measure;
						total2 = temp_value;
					}
				}
			}
			total1 = total1.toFixed(props.currentValue.total.decimalPlaces);
			total2 = total2.toFixed(props.previousValue.previousTotal.decimalPlaces);			
	
			var titleElement = $('foreignObject[class="title"]');

			var titleHeight =  titleElement.length == 1 ? titleElement.height() + 5 : 0;

			var title = '';
			
			if (noDataCallback == 'no_Data') {
				title =  'Gross Profit';
				noDataCallback = '';
			}
			else {
				title =  dataBuckets.getBucket("measure").fields[0].title;
			}
			
			//default width settings
			var widthPrevTotal = 40;
			var widthPercentChange = 40;
			var widthTrendChange = 20;			
			
			//check which elements are enabled to change width
			if (props.previousValue.disablePreviousValue == true && props.changeValue.disableChangeValue == true)
				widthTrendChange = 100;
			else if (props.previousValue.disablePreviousValue == true && props.trendIcon.disableTrendIcon == true)
				widthPercentChange = 100;
			else if (props.changeValue.disableChangeValue == true && props.trendIcon.disableTrendIcon == true)
				widthPrevTotal = 100;
			else if (props.previousValue.disablePreviousValue == true) {
				widthPercentChange = 60;
				widthTrendChange = 40;
			}
			else if (props.changeValue.disableChangeValue == true) {
				widthPrevTotal = 60;
				widthTrendChange = 40;
			}	
			else if (props.trendIcon.disableTrendIcon == true) {
				widthPrevTotal = 50;				
				widthPercentChange = 50;			
			}			
			
			var currentTotal = 0;		
			var prevTotal = '';
			var percentChange = '';
			var trendChange = '';
			var cssPrevTotalTitle = '';
			var cssPercentChangeTitle = '';
			var cssTrendChangeTitle = '';
			var cssPrevTotal = '';
			var cssPercentChange = '';
			var cssTrendChange = '';
			var dynamicColorChange = '';
			var dynamicColorTrend = '';
			var dynamicColorBackground = '';
			var risingColor = props.dynamicColorMode.risingColor;
			var fallingColor = props.dynamicColorMode.fallingColor;
			
			//number format for currentTotal value
			if (props.setCDN == true) {
				currentTotal = total1.replace(".", ",");
				currentTotal = NumberWithDot(currentTotal);
			}
			else {
				currentTotal = total1.replace(",", ".");
				currentTotal = NumberWithComma(currentTotal);			
			}
			//check if current total is percent value
			if  (props.currentValue.total.percentValue == true)
				currentTotal = currentTotal + '%' ;
			
			//if no total2 value, no change will be shown
			if (total2==0) {
				prevTotal = '';
				percentChange = '';
				trendChange = '';
				cssPrevTotalTitle = '';
				cssPercentChangeTitle = '';
				cssTrendChangeTitle = '';
				cssPrevTotal = '';
				cssPercentChange = '';
				cssTrendChange = '';
				if (props.dynamicColorMode.applyDynamicColorOn == 'full widget background')
					dynamicColorBackground = ';background-color:#b7bfb5';
				else
					dynamicColorBackground = '';
			}				
			//if total2 is not equal ''
			else {
				//block for previous total value
				if (props.previousValue.disablePreviousValue == true) {
					prevTotal = '';	
					cssPrevTotalTitle = '';
					cssPrevTotal = '';
				}
				else {
					if (props.setCDN == true) {
						prevTotal = total2.replace(".", ",");
						prevTotal = NumberWithDot(prevTotal);
					}
					else {
						prevTotal = total2.replace(",", ".");
						prevTotal = NumberWithComma(prevTotal);					
					}
					if (props.previousValue.previousTotal.percentValue == true) 
						prevTotal = prevTotal + '%';
					
					//css for previous total title
					cssPrevTotalTitle = '<div class="kpi-box-previous-title" style="font-weight:'+props.previousValue.previousText.fontWeight+';font-size:'+props.previousValue.previousText.fontSize+';color:'+props.previousValue.previousText.color+';font-style:'+props.previousValue.previousText.fontStyle+';width:'+widthPrevTotal+'%">' + props.previousValue.previousText.previousText + '</div>';
					//css for previous total value
					cssPrevTotal = '<div class="kpi-box-previous-total" style="font-weight:'+props.previousValue.previousTotal.fontWeight+';font-size:'+props.previousValue.previousTotal.fontSize+';color:'+props.previousValue.previousTotal.color+';font-style:'+props.previousValue.previousTotal.fontStyle+';width:'+widthPrevTotal+'%">' + prevTotal + '</div>';					
				}
				
				//block for change value
				if (props.changeValue.disableChangeValue == true) {
					percentChange = '';	
					cssPercentChangeTitle = '';
					cssPercentChange = '';
				}	
				else {
					//block for change value in percent
					if (props.changeValue.changeValue.deviationInPercent == true) {
						percentChange = Math.round(((total1/total2)-1)*100000)/1000;
						percentChange = percentChange.toFixed(props.changeValue.changeValue.decimalPlaces);

						if (props.setCDN == true) {
							percentChange = percentChange.replace(".", ",");
							percentChange = NumberWithDot(percentChange);
							percentChange = percentChange + '%';
						}
						else {
							percentChange = percentChange.replace(",", ".");
							percentChange = NumberWithComma(percentChange);
							percentChange = percentChange + '%';							
						}
					}
					//block for change value as absolute number
					else {
						percentChange = total1-total2;
						percentChange = percentChange.toFixed(props.changeValue.changeValue.decimalPlaces);
				
						if (props.setCDN == true) {
							percentChange = percentChange.replace(".", ",");
							percentChange = NumberWithDot(percentChange);
						}						
						else {
							percentChange = percentChange.replace(",", ".");
							percentChange = NumberWithComma(percentChange);
						}
					}
					//check if dynamic color should be applied on change
					if ((total1-total2) < 0) {
						if (props.dynamicColorMode.applyDynamicColorOn == 'change only' || props.dynamicColorMode.applyDynamicColorOn == 'change and trend')
							dynamicColorChange = fallingColor;
						else
							dynamicColorChange = props.changeValue.changeValue.color;
					}
					else if ((total1-total2) > 0) {
						if (props.dynamicColorMode.applyDynamicColorOn == 'change only' || props.dynamicColorMode.applyDynamicColorOn == 'change and trend')
							dynamicColorChange = risingColor;
						else
							dynamicColorChange = props.changeValue.changeValue.color;
					}						
					else {
						dynamicColorChange = props.changeValue.changeValue.color;
					}
					//css for change value title
					cssPercentChangeTitle = '<div class="kpi-box-change-title" style="font-weight:'+props.changeValue.changeValueText.fontWeight+';font-size:'+props.changeValue.changeValueText.fontSize+';color:'+props.changeValue.changeValueText.color+';font-style:'+props.changeValue.changeValueText.fontStyle+';width:'+widthPercentChange+'%">' + props.changeValue.changeValueText.changeText + '</div>';
					//css for change value
					cssPercentChange = '<div class="kpi-box-change-total" style="font-weight:'+props.changeValue.changeValue.fontWeight+';font-size:'+props.changeValue.changeValue.fontSize+';color:'+dynamicColorChange+';font-style:'+props.changeValue.changeValue.fontStyle+';width:'+widthPercentChange+'%">' + percentChange + '</div>';					
				}					
				//block for trend icon including check for dynamic color
				if (props.trendIcon.disableTrendIcon == true) {
					trendChange = '';	
					cssTrendChangeTitle = '';
					cssTrendChange = '';
				}	
				else {
					if ((total1-total2) < 0) {
						trendChange = '\u23F7';
						if (props.dynamicColorMode.applyDynamicColorOn == 'trend only' || props.dynamicColorMode.applyDynamicColorOn == 'change and trend')
							dynamicColorTrend = fallingColor;
						else
							dynamicColorTrend = props.trendIcon.trendIcon.color;
					}
					else if ((total1-total2) > 0) {
						trendChange = '\u23F6';
						if (props.dynamicColorMode.applyDynamicColorOn == 'trend only' || props.dynamicColorMode.applyDynamicColorOn == 'change and trend')
							dynamicColorTrend = risingColor;
						else
							dynamicColorTrend = props.trendIcon.trendIcon.color;
					}						
					else {
						trendChange = '=';
						dynamicColorTrend = props.trendIcon.trendIcon.color;
					}
					//css for trend title
					cssTrendChangeTitle = '<div class="kpi-box-trend-title" style="font-weight:'+props.trendIcon.trendIconText.fontWeight+';font-size:'+props.trendIcon.trendIconText.fontSize+';color:'+props.trendIcon.trendIconText.color+';font-style:'+props.trendIcon.trendIconText.fontStyle+';width:'+widthTrendChange+'%">' + props.trendIcon.trendIconText.trendText + '</div>';
					//css for trend icon
					cssTrendChange = '<div class="kpi-box-trend-total" style="font-weight:'+props.trendIcon.trendIcon.fontWeight+';font-size:'+props.trendIcon.trendIcon.fontSize+';color:'+dynamicColorTrend+';width:'+widthTrendChange+'%">' + trendChange + '</div>';						
				}
				//block for dynamic background color of full widget
				if ((total1-total2) < 0) {
					if (props.dynamicColorMode.applyDynamicColorOn == 'full widget background') {
						changeBackground(fallingColor);
						dynamicColorBackground = ';background-color:'+fallingColor;
					}
					else {
						dynamicColorBackground = '';
						changeBackground("#ffffff");
					}
				}
				else if ((total1-total2) > 0) {
					if (props.dynamicColorMode.applyDynamicColorOn == 'full widget background') {
						changeBackground(risingColor);
						dynamicColorBackground = ';background-color:'+risingColor;
					}
					else {
						dynamicColorBackground = '';
						changeBackground("#ffffff");
					}
				}						
				else {
					if (props.dynamicColorMode.applyDynamicColorOn == 'full widget background') {
						changeBackground("#b7bfb5");
						dynamicColorBackground = ';background-color:#b7bfb5';
					}
					else {
						changeBackground("#ffffff");
						dynamicColorBackground = '';
					}
				}				
			}
			
			//final css for widget
			//create kpi-box-container				
			$(container).css('top',titleHeight+'px').append('<div class="kpi-box-container" style="font-family:'+props.fontFamily+';font-size:'+props.fontSize+';color:'+props.color+';font-style:'+props.fontStyle+';min-width:'+props.widgetWidth.minimumWidgetWidth+'px;max-width:'+props.widgetWidth.maximumWidgetWidth+'px'+dynamicColorBackground+'"></div>');
			// fill containers on html page - 1st line			
			$(container).find('.kpi-box-container').append('<div><div class="kpi-box-title" style="font-weight:'+props.currentValue.measureName.fontWeight+';font-size:'+props.currentValue.measureName.fontSize+';color:'+props.currentValue.measureName.color+';font-style:'+props.currentValue.measureName.fontStyle+'">' + title + '</div></div>');
			// fill containers on html page - 2nd line
			$(container).find('.kpi-box-container').append('<div><div class="kpi-box-total" style="font-weight:'+props.currentValue.total.fontWeight+';font-size:'+props.currentValue.total.fontSize+';color:'+props.currentValue.total.color+';font-style:'+props.currentValue.total.fontStyle+'">' + currentTotal + '</div></div>');				

			if (props.previousValue.disablePreviousValue == true && props.changeValue.disableChangeValue == true && props.trendIcon.disableTrendIcon == true) {
			}
			else {
				// fill containers on html page - 3rd line
				$(container).find('.kpi-box-container').append('<div>' + cssPrevTotalTitle + cssPercentChangeTitle + cssTrendChangeTitle + '</div>');
				// fill containers on html page - 4th line
				$(container).find('.kpi-box-container').append('<div>' + cssPrevTotal + cssPercentChange + cssTrendChange + '</div>');	
			}				
		}
		
		renderConfig.renderComplete();	
	}
	
	function noDataRenderCallback(renderConfig) {
		var container = renderConfig.container;
		var grey = renderConfig.baseColor;
		renderConfig.data = [{"time":"1","measure":15000,"_s":0,"_g":0},{"time":"2","measure":20000,"_s":0,"_g":1},{"time":"3","measure":25000,"_s":0,"_g":2},{"time":"4","measure":30000,"_s":0,"_g":3},{"time":"5","measure":33500,"_s":0,"_g":4}];
		
		noDataCallback = 'no_Data';
		
		renderCallback(renderConfig);
		
		$(container).append('<div class="placeholder">Add measures or dimensions</div>');
	}

	// Your extension's configuration
	var config = {
		id: 'com.ibi.kpi_box_trend',     // string that uniquely identifies this extension
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
			css: ['css/open-sans.css', 'css/kpi_box_trend.css']
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
