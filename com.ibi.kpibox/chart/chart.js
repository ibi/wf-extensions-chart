(function() {

  //Set the Global IBI Variable if not exists
  if(typeof window.comIbiKpiboxChartExtension == 'undefined') {
		window.comIbiKpiboxChartExtension = {};
	}
	
	window.comIbiKpiboxChartExtension = {
		draw: _draw
	};
	
	function _draw(ib3SLI, isDummyData) {
		
		$ib3.checkObject(ib3SLI);
		
		ib3SLI.config.checkServiceIsInitinalized();
		
		//Declare main extension vars
		var data = ib3SLI.config.getData(),
			container = ib3SLI.config.getContainer(),
			chart = ib3SLI.config.getChart(),
			width = ib3SLI.config.getChartWidth(),
			height = ib3SLI.config.getChartHeight(),
			properties = ib3SLI.config.getCustomProperties();	
			
		var numberFormat = ib3SLI.config.getFormatByBucketName('value', 0),
			colorBands = ib3SLI.config.getProperty('colorScale.colorBands'),
			bodyBackgroundColor = ib3SLI.config.getProperty('kpiboxProperties.bodyBackgroundColor') || "transparent",
			calculateComparationFunctionParam1 = ib3SLI.config.getProperty('kpiboxProperties.calculateComparationFunction.param1'),
			calculateComparationFunctionParam2 = ib3SLI.config.getProperty('kpiboxProperties.calculateComparationFunction.param2'),
			calculateComparationFunctionBody = ib3SLI.config.getProperty('kpiboxProperties.calculateComparationFunction.body'),
			customCompareIconActive = ib3SLI.config.getProperty('kpiboxProperties.customCompareIcon.active'),
			customCompareIconUp = ib3SLI.config.getProperty('kpiboxProperties.customCompareIcon.iconUp'),
			customCompareIconDown = ib3SLI.config.getProperty('kpiboxProperties.customCompareIcon.iconDown'),
			formatComparation = ib3SLI.config.getProperty('kpiboxProperties.formatComparation'),
			setInfiniteToZero = ib3SLI.config.getProperty('kpiboxProperties.setInfiniteToZero'),
			shortenNumber = ib3SLI.config.getProperty('kpiboxProperties.shortenNumber'),
			typeShortenNumber = ib3SLI.config.getProperty('kpiboxProperties.typeShortenNumber'),
			titleRow = ib3SLI.config.getProperty('kpiboxProperties.titleRow'),
			calculateFontSize = ib3SLI.config.getProperty('kpiboxProperties.calculateFontSize'),
			fixedFontSizeProp = ib3SLI.config.getProperty('kpiboxProperties.fixedFontSizeProp') || '20px',
			fixedPixelLinesMargin = ib3SLI.config.getProperty('kpiboxProperties.fixedPixelLinesMargin') || 0,
			imagePercentageWidth = ib3SLI.config.getProperty('kpiboxProperties.imagePercentageWidth'),
			wfPath = ib3SLI.config.getProperty('kpiboxProperties.ibiAppsPath');
			
		//Advanced Function
		var calculateComparisonValueFunctionBody = ib3SLI.config.getProperty('kpiboxProperties.calculateComparisonValueFunction'),
			calculateComparisonValueColorFunctionBody = ib3SLI.config.getProperty('kpiboxProperties.calculateComparisonValueColorFunction'),
			calculateComparisonIconFunctionBody = ib3SLI.config.getProperty('kpiboxProperties.calculateComparisonIconFunction');
			
		//Several Custom Font Sizes
		var titleFontSize = ib3SLI.config.getProperty('kpiboxProperties.titleFont.size') || fixedFontSizeProp,
			titleFontColor = ib3SLI.config.getProperty('kpiboxProperties.titleFont.color') || 'black',
			titleFontFamily = ib3SLI.config.getProperty('kpiboxProperties.titleFont.family') || 'Arial, sans-serif',
			measureFontSize = ib3SLI.config.getProperty('kpiboxProperties.measureFont.size') || fixedFontSizeProp,
			measureFontColor = ib3SLI.config.getProperty('kpiboxProperties.measureFont.color') || 'black',
			measureFontFamily = ib3SLI.config.getProperty('kpiboxProperties.measureFont.family') || 'Arial, sans-serif',
			variationFontSize = ib3SLI.config.getProperty('kpiboxProperties.variationFont.size') || fixedFontSizeProp,
			variationFontFamily = ib3SLI.config.getProperty('kpiboxProperties.variationFont.family') || 'Arial, sans-serif';
			
		d3.select('body')
			.style('background-color', bodyBackgroundColor)
		
		d3.select('rect.eventCatcher')
			.style('fill', bodyBackgroundColor)
			
		//Defaults
		if (typeof imagePercentageWidth == 'undefined') {
			imagePercentageWidth = 40;
		}
			
		var imageWidth = width * parseFloat(imagePercentageWidth / 100),
			infoWidth = width - imageWidth,
			imageHeight = titleRow ? height - 40 : height,
			imageY = titleRow ? 40 : 0,
			titleX = titleRow ? 10 : 0;
			
		//get Buckets Data
		var kpiDataElem = data[0],
			kpiValue = kpiDataElem.value,
			compareValue = kpiDataElem.comparevalue,
			kpiSign = !!parseInt(typeof kpiDataElem.kpisign === 'undefined' ? 1 : kpiDataElem.kpisign),
			kpiBoxTitle = ib3SLI.config.getBucketTitle('value', 0),
			hasCompareValue = typeof compareValue !== 'undefined',
			auxNumberFormat = numberFormat,
			isPercentaje = false;
		
		if (auxNumberFormat.indexOf('`%') != -1){
			isPercentaje = true;
			auxNumberFormat = auxNumberFormat.split('`%')[0];
		}
		if (auxNumberFormat.indexOf('%') != -1){
			isPercentaje = true;
			auxNumberFormat = auxNumberFormat.split('%')[0];
		}
//		kpiFormattedValue = $ib3.utils.getFormattedNumber(ib3SLI.config.formatNumber, kpiValue, auxNumberFormat, shortenNumber);
		kpiFormattedValue = $ib3.utils.getFormattedNumber(ib3SLI.config.formatNumber, kpiValue, auxNumberFormat, shortenNumber, typeShortenNumber)
		if (isPercentaje){
			kpiFormattedValue += '%';
		}
		
/* Gaizka, no default image
		var imageHref = '';
		if(typeof kpiDataElem.image === 'undefined') {
			imageHref = 'data:image/png;base64,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';
		} else {
			imageHref = $ib3.utils.getWebFOCUSUriByResourcePath(kpiDataElem.image, wfPath);
		}
*/
		var isImage = false;
		if (typeof kpiDataElem.image != 'undefined') {
			var imageContainer = d3.select(container)
				.append('g')
				.attr('width', imageWidth)
				.attr('height', imageHeight);
	
			var imageElem = imageContainer.append('svg:image')
				.attr('class', 'image-container')
				.attr('width', imageWidth)
				.attr('height', imageHeight)
				.attr('xlink:href', $ib3.utils.getWebFOCUSUriByResourcePath(kpiDataElem.image, wfPath))
				.attr('x', 0)
				.attr('y', imageY);
			isImage = true;
		}
		
		var gPosition = (isImage) ? imageWidth : 20 ;
		var infoContainer = d3.select(container)
			.append('g')
			.attr('class', 'info-container')
			.attr('width', infoWidth)
			.attr('height', height)
			.attr('transform', 'translate(' + gPosition + ',0)');
			
		var titleContainer = titleRow ? d3.select(container) : infoContainer;
				
		var kpiTitleElem = titleContainer.append('text')
			.attr('class', 'kpi-title')
			.attr('width', infoWidth)
			.attr('fill', titleFontColor)
			.attr('font-family', titleFontFamily)
			.attr('x', titleX)
			.text(kpiBoxTitle);	
	
		kpiTitleElem
			.attr('font-size', function() { 
				return calculateFontSize
					? Math.min((titleRow ? width : infoWidth), ((titleRow ? width : infoWidth) - 8) / this.getComputedTextLength() * parseInt($(this).css('font-size'))) + 'px'
					: titleFontSize;
			})
			.attr('height', function() { 
				return this.getBBox().height;
			})
			.attr('y', function() { 
				return this.getBBox().height;
			});

		var kpiValueElem = infoContainer.append('text')
			.attr('class', 'kpi-value')
			.attr('width', infoWidth)
			.attr('fill', measureFontColor)
			.attr('font-family', measureFontFamily)
			.attr('x', 0)
			.text(kpiFormattedValue);

		kpiValueElem
			.attr('font-size', function() { 
				return calculateFontSize
					? Math.min(infoWidth, (infoWidth - 8) / this.getComputedTextLength() * parseInt($(this).css('font-size'))) + 'px'
					: measureFontSize;
			})
			.attr('height', function() { 
				return this.getBBox().height;
			})
			.attr('y', function() { 
				return this.getBBox().height + kpiTitleElem.node().getBBox().height + fixedPixelLinesMargin;
			});
		
		if (hasCompareValue) {
			
			var isAdvancedWay = !!calculateComparisonValueFunctionBody && !isDummyData;	
			if(isAdvancedWay) {
				//To use advanced way set up the following properties in json fileCreatedDate
				/*
					"calculateComparisonValueFunction": "if(value == 0 && comparevalue == 0) { return 0; } var result = (value - comparevalue) / Math.abs(comparevalue);  return (result == 'Infinity') ? String.fromCharCode(8734) : ib3SLI.config.formatNumber(parseFloat(result).toFixed(4), '#,###.00%');",	
					"calculateComparisonValueColorFunction": "var colorBands = ib3SLI.config.getProperty('colorScale.colorBands'); var color = 'black'; for (var a = 0; a < colorBands.length; a++) { var aux = (kpisign == 0) ? (value * (-1)) : value; if ((aux > colorBands[a].start) && (aux < colorBands[a].stop)) { color = colorBands[a].color; break; } } return color;",	
					"calculateComparisonIconFunction": "if(value == 0 && comparevalue == 0) { return 0; } var result = (value - comparevalue) / Math.abs(comparevalue); if(result == 'Infinity' || result == 0) { return '' } else if (result > 0) { return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAArCAYAAAA65tviAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAIGNIUk0AAHolAACAgwAA+f8AAIDpAAB1MAAA6mAAADqYAAAXb5JfxUYAAAHxSURBVHja1NnLahRBFIDhzzESNxovoASUaLyQhQuzUIMo2YRgkGwiElAXIt4x8S4BRUPQMcaASMRxGXwZn8S3cOFiWhhietIz09Xd9a+6Z6po/pk6Veec3mZxRmBu4jzuhnxITXje4g4GYha5gqPJ9WqsItvxseX+NiZjFGngxIbPlmMTOZnExUZGMR2TSL3Nd+vYG4PIdBLkaezDu6qL9ON7hnEPcbjKItdwKMO4HVssv1JFDuBrB+NvYLaKIt+wq8M5b6omMoarXcw7hQdVEunll63jYBVE5nC5h/l7OoytICIDOZ0JsxgpU+Q+9ue0PL+UJTKCDznuepdS8rPgImtJqp4nr4oWGcdEgDztOB4VKfI5YB2ztkkdE0RkAWcCl8jLoUUGsVhAw2IGp0OKPEtS9SJohBIZxQvFMYb5ECI/FM8CduYpMoWzJYgM4mWeIivKYylL4GcReZ/UDWVS71VkKFmnZTOFC72IzAXIp7pltVuRCTxXHc61q31qJeVT3XIv7UBOE7neaYpQ4Hb8KatIX7JTVZXHm51ptZQ0+ohqs7KVyLGkDq8647jYTmRJPKxr9pD/E5nUbELHwrCWxmCtJcAb4uOJpB1Va6nIhiMU2Y3X//6JIfwUL0/xq0+zG96P3xXKq7LyR/PF0q2/AwC35DSzyhxPxQAAAABJRU5ErkJggg==' } else { return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAArCAYAAAA65tviAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAIGNIUk0AAHolAACAgwAA+f8AAIDpAAB1MAAA6mAAADqYAAAXb5JfxUYAAAMwSURBVHja1JjJTxNxFMdfpxXa2oWWaUtpSxe2VlBEZFEiwYP6JygH44XowUSDJhoOJiToAZcQNyJRjJFEFDXIQTFRlsYFkRBjjUBIlIA1qMRqAkG0luelGMSWdjq/aWcmeYfJ/Oa972e+eW/mN6J+s3a6zOujp5TSgHgBRSCgY0EkwrTZeXGHK/2FxGNQt5Z5fTXGmXkxCPD4KaFgLFVxGBAAOnONQwiAQozmInsjAgAFAOAxqHfNJEtQaG5MquX+KaW0FgAAMBjteSa30Ny4UOKoXdT/F6Su0iWfUMt/CQWi264bxyX6YenJ2dLM/UIBaSjP2RoWBAFgyJjyje8Q97PT3i7XTS1vILeNPsTnBveqZL8HTZqi/y5giOjMNb7iqxuXN9iaQmkOCVJX6VJ9UiQH+AYxQivnMIxmCHehPc/UyzeQ8yWZRxiDIAB4DKoZvkDccxoHV9JKrdRYPXb9UT40eIASwSitPLjiIowQzy3aL4l2484a09NIOiOCnNmUvTOREGOpih8YhU6IZtGtPHN3okAuFjuOEQOpq3SlJGIcewyqWYxSI0S78HpBxt14g5zenF1FHAQB4LVBHbdx3OFMf8lEG8VkDD526KvjtX0d1in3MroJGYbbSn/k2o0bay0PmepiDNJQnrONS4g3+ugbnBVIsPHbuQI5V5p5IG4gCADjKeS3xQMmzddY9VCxNmSfTXeT9PeU26bbHXMCZBH9Zu00KTfa8s0P2Gih2DzFJ1Z6Dwk3fLIkfKdV7GOVBFlGj103wdaN1nUZt9nqYA1yYktu/nfpqoVYIZ5ZUj8jAR1AIsm19da2WEEay7KqeQOCABDcNzCC6LXpPpCqT5Ean302upnJ+tkkCfZbtDuIzW8kGI8c+vfRunG10NpCsjZF8qU2aNJU+cWRU04ppYFJtbyG6CczEo5o/lI2FTvqSdclDlJf4bT7ZOHHcZ+N9iIHdYGLpMEnHhLkZHnOdsGAIAAM65RzyyG6sgwjXNUj2uz//qXU1S89H9es9g+YtQWc7Y+Rw+jKMowuunFpo/0Ul7U4BTle4bQgAE6qZX7kuBYg966MtBTarnBd588A2LuBDm0qJvAAAAAASUVORK5CYII=' }",	
				*/
				var percentageCalcValue;
				try {
					var calculateComparisonValueFunction = new Function('value', 'comparevalue', 'kpisign', calculateComparisonValueFunctionBody);
					percentageCalcValue = calculateComparisonValueFunction(kpiValue, compareValue, kpiSign);
				} catch (e) {
					$ib3.utils.showRenderError('Error compare function definition<br>Params names must match the buckets names used inside the body of the function<br><br> Javascript Error: ' + e.message);
					return;
				}

				var percentageColor;
				try {
					var calculateComparisonValueColorFunction = new Function('value', 'comparevalue', 'kpisign', calculateComparisonValueColorFunctionBody);
					percentageColor = calculateComparisonValueColorFunction(kpiValue, compareValue, kpiSign);
				} catch (e) {
					$ib3.utils.showRenderError('Error calculateComparisonValueColor function definition<br>Params names must match the buckets names used inside the body of the function<br><br> Javascript Error: ' + e.message);
					return;
				}

				var comparisonIconHref;
				try {
					var calculateComparisonIconFunction = new Function('value', 'comparevalue', 'kpisign', calculateComparisonIconFunctionBody);
					comparisonIconHref = calculateComparisonIconFunction(kpiValue, compareValue, kpiSign);
				} catch (e) {
					$ib3.utils.showRenderError('Error calculateComparisonIcon function definition<br>Params names must match the buckets names used inside the body of the function<br><br> Javascript Error: ' + e.message);
					return;
				}

				var comparisonIconElem = infoContainer.append('svg:image')
					.attr('class', 'comparison-image-container')
					.attr('width', kpiTitleElem.node().getBBox().height)
					.attr('height', kpiTitleElem.node().getBBox().height)
					.attr('xlink:href', comparisonIconHref)
					.attr('transform', function() {
						return 'translate(0, ' + (this.getBBox().height + kpiTitleElem.node().getBBox().height + kpiValueElem.node().getBBox().height) + ') ';
					});

				var kpiCompareValueWidth = infoWidth - comparisonIconElem.node().getBBox().width;

				var comparisonValueElem = infoContainer.append('text')
					.attr('class', 'kpi-value')
					.attr('width', kpiCompareValueWidth)
					.attr('fill', percentageColor)
					.attr('font-family', variationFontFamily)
					.attr('x', comparisonIconElem.node().getBBox().width)
					.text(percentageCalcValue);

				comparisonValueElem
					.attr('font-size', function() {
						return calculateFontSize ?
							Math.min(kpiCompareValueWidth, (kpiCompareValueWidth - 8) / this.getComputedTextLength() * parseInt($(this).css('font-size'))) + 'px' :
							variationFontSize;
					})
					.attr('height', function() {
						return this.getBBox().height;
					})
					.attr('y', function() {
						return this.getBBox().height + kpiTitleElem.node().getBBox().height + kpiValueElem.node().getBBox().height + fixedPixelLinesMargin * 2;
					});

				comparisonIconElem
					.attr('transform', 'translate(0, ' + (comparisonValueElem.attr('y') - comparisonIconElem.node().getBBox().height) + ')')
				
			} else {
						
				var percentageCalcValue;
				try { 
					var calculateComparationFunction = new Function(calculateComparationFunctionParam1, calculateComparationFunctionParam2, calculateComparationFunctionBody);
					percentageCalcValue = calculateComparationFunction(kpiValue, compareValue); 
				} catch(e) { 			
					$ib3.utils.showRenderError('Error compare function definition<br>Params names must match the var names used inside the body of the function<br><br> Javascript Error: ' + e.message);			
					return;
				}
				
				var percentageFormattedValue;
				if(setInfiniteToZero){
					percentageFormattedValue = ((percentageCalcValue == 'Infinity')||(isNaN(percentageCalcValue))) ? 0 : ib3SLI.config.formatNumber(parseFloat(percentageCalcValue).toFixed(4), formatComparation);
				} else {
					percentageFormattedValue = (percentageCalcValue == 'Infinity') ? String.fromCharCode(8734) : ib3SLI.config.formatNumber(parseFloat(percentageCalcValue).toFixed(4), formatComparation);
				}
				
				if(calculateFontSize) {
				
					var percentageColor = _calculateComparisonColor(percentageCalcValue, kpiSign, isDummyData);
						percentageVariationDirection = percentageCalcValue < 0 ? 'down' : 'up';

					var triangleHeight = kpiValueElem.node().getBBox().height;
					var trianglePath = d3.symbol()
						.size([triangleHeight * triangleHeight / 2]) //TODO: Make responsive size
						.type(d3.symbolTriangle);
						
					var marginTriangle = percentageVariationDirection == 'up' ? 1.75 : 1.5;
					
					if(customCompareIconActive) {
						 
						var imageUp = $ib3.utils.getWebFOCUSUriByResourcePath(customCompareIconUp, wfPath),
							imageDown = $ib3.utils.getWebFOCUSUriByResourcePath(customCompareIconDown, wfPath),
							imageCompare = percentageVariationDirection == 'up' ? imageUp : imageDown;
							
						var comparisonIconElem = infoContainer.append('svg:image')
							.attr('class', 'image-container')
							.attr('width', kpiTitleElem.node().getBBox().height)
							.attr('height', kpiTitleElem.node().getBBox().height)
							.attr('xlink:href', imageCompare)
							.attr('transform', function() {
								return 'translate(0, ' + (this.getBBox().height + kpiTitleElem.node().getBBox().height + kpiValueElem.node().getBBox().height) + ') '; 
							});	
						 
					} else {
						var comparisonIconElem = infoContainer.append('path')
							.attr('d', trianglePath)
							.attr('fill', percentageColor)
							.attr('transform', function() {
								return 'translate( ' + (this.getBBox().width / 2) + ', ' + (this.getBBox().height + kpiTitleElem.node().getBBox().height + kpiValueElem.node().getBBox().height + fixedPixelLinesMargin * marginTriangle) + ') ' + 
									'rotate(' + ( percentageVariationDirection == 'up' ? 0 : 180) + ')'; 
							});	
					}

					var kpiCompareValueWidth = infoWidth - comparisonIconElem.node().getBBox().width;

					var comparisonValueElem = infoContainer.append('text')
						.attr('class', 'kpi-value')
						.attr('width', kpiCompareValueWidth)
						.attr('fill', percentageColor)
						.attr('font-family', variationFontFamily)
						.attr('x', comparisonIconElem.node().getBBox().width)
						.text(percentageFormattedValue);

					comparisonValueElem
						.attr('font-size', function() { 
							return calculateFontSize
								? Math.min(kpiCompareValueWidth, (kpiCompareValueWidth - 8) / this.getComputedTextLength() * parseInt($(this).css('font-size'))) + 'px'
								: variationFontSize;
						})
						.attr('height', function() { 
							return this.getBBox().height;
						})
						.attr('y', function() { 
							return this.getBBox().height + kpiTitleElem.node().getBBox().height + kpiValueElem.node().getBBox().height + fixedPixelLinesMargin * 2;
						});
				} else {
					var percentageColor = _calculateComparisonColor(percentageCalcValue, kpiSign, isDummyData);
						percentageVariationDirection = percentageCalcValue < 0 ? 'down' : 'up';

					var comparisonValueElem = infoContainer.append('text')
						.attr('class', 'kpi-value')
						.attr('fill', percentageColor)
						.attr('font-family', variationFontFamily)
						.text(percentageFormattedValue);

					comparisonValueElem
						.attr('font-size', function() { 
							return variationFontSize;
						})
						.attr('height', function() { 
							return this.getBBox().height;
						})
						.attr('y', function() { 
							return this.getBBox().height + kpiTitleElem.node().getBBox().height + kpiValueElem.node().getBBox().height + fixedPixelLinesMargin * 2;
						});

					var triangleHeight = comparisonValueElem.node().getBBox().height;
					if(calculateFontSize) {
						triangleHeight = kpiValueElem.node().getBBox().height;
					}
					var trianglePath = d3.symbol()
						.size([triangleHeight * triangleHeight / 2]) //TODO: Make responsive size
						.type(d3.symbolTriangle);
						
					var marginTriangle = percentageVariationDirection == 'up' ? 1.75 : 1.5;
					
					if(customCompareIconActive) {
						 
						var imageUp = $ib3.utils.getWebFOCUSUriByResourcePath(customCompareIconUp, wfPath),
							imageDown = $ib3.utils.getWebFOCUSUriByResourcePath(customCompareIconDown, wfPath),
							imageCompare = percentageVariationDirection == 'up' ? imageUp : imageDown;
							
						var comparisonIconElem = infoContainer.append('svg:image')
							.attr('class', 'image-container')
							.attr('width', kpiTitleElem.node().getBBox().height)
							.attr('height', kpiTitleElem.node().getBBox().height)
							.attr('xlink:href', imageCompare)
							.attr('transform', function() {
								return 'translate(0, ' + (this.getBBox().height + kpiTitleElem.node().getBBox().height + kpiValueElem.node().getBBox().height) + ') '; 
							});	
						 
					} else {
						var comparisonIconElem = infoContainer.append('path')
							.attr('d', trianglePath)
							.attr('fill', percentageColor)
							.attr('transform', function() {
								return 'translate( ' + (this.getBBox().width / 2) + ', ' + (this.getBBox().height + kpiTitleElem.node().getBBox().height + kpiValueElem.node().getBBox().height + fixedPixelLinesMargin * marginTriangle) + ') ' + 
									'rotate(' + ( percentageVariationDirection == 'up' ? 0 : 180) + ')'; 
							});	
					}
						
					comparisonValueElem
						.attr('x', comparisonIconElem.node().getBBox().width)
						
					if(calculateFontSize) {
						
						var kpiCompareValueWidth = infoWidth - comparisonIconElem.node().getBBox().width;
						
						comparisonValueElem
							.attr('width', kpiCompareValueWidth)
							
						comparisonValueElem
							.attr('font-size', function() {
								Math.min(kpiCompareValueWidth, (kpiCompareValueWidth - 8) / this.getComputedTextLength() * parseInt($(this).css('font-size'))) + 'px'
							})
						
						
					}
				}
			}
		}
		
		if((calculateFontSize) && (titleRow)){
			imageElem
				.attr('y', 20 + kpiTitleElem.node().getBBox().height);
		}
		
		//Check if text over flow height
		var availableHeight = height,
			kpiTitleHeight = kpiTitleElem.node().getBBox().height,
			kpiValueHeight = kpiValueElem.node().getBBox().height,
			kpiCompareTriangleHeight = hasCompareValue ? comparisonIconElem.node().getBBox().height : 0,
			notHasEnoughtHeight = availableHeight - kpiTitleHeight - kpiValueHeight - kpiCompareTriangleHeight < 0;
		
		if (notHasEnoughtHeight && calculateFontSize) {
			
			//Redraw by Height
			var elemHeight = availableHeight / 2;
			if(hasCompareValue)
				elemHeight = availableHeight / 3;
				
			var titleScale = elemHeight / kpiTitleHeight;
			if (titleScale < 1) {							
				kpiTitleElem
					.attr('transform', 'scale(' + titleScale + ')')
					.attr('y', function() { 
						return (elemHeight / titleScale);// + this.getBBox().height;
					});
			}
				
			var valueScale = elemHeight / kpiValueHeight;
						
			if (valueScale < 1) {							
				kpiValueElem
					.attr('transform', 'scale(' + valueScale + ')')
					.attr('y', function() { 
						return (elemHeight / valueScale) * 2;
					});
			}
				
			if(hasCompareValue && isAdvancedWay) {
				
				var compareTriangleScale = elemHeight / kpiCompareTriangleHeight;
				
				if (compareTriangleScale < 1) {	
					comparisonIconElem
						.attr('transform', function() {
							return 'scale(' + compareTriangleScale + ') translate( ' + (this.getBBox().width / 2) + ', ' + (this.getBBox().height + (elemHeight / compareTriangleScale) * 2) + ') ' + 
								'rotate(' + ( percentageVariationDirection == 'up' ? 0 : 180) + ')'; 
						});
				}
									
				var compareValueScale = elemHeight / kpiCompareTriangleHeight + 0.3;
			
				if (compareValueScale < 1) {	
					kpiCompareValueElem
						.attr('transform', 'scale(' + compareValueScale + ')')
						.attr('x', comparisonIconElem.node().getBBox().width)
						.attr('y', function() { 
							return (elemHeight / compareValueScale) * 3;
						});
				}
			
			}
			
		}
		
		if(isDummyData) {
			imageElem
				.attr('filter', 'url(#grayscale);');
			kpiTitleElem
				.attr('fill', '#d1d1d1');
			kpiValueElem
				.attr('fill', '#d1d1d1');
			comparisonValueElem
				.attr('fill', '#d1d1d1');
			comparisonIconElem
				.attr('fill', '#d1d1d1');
		}
		
		//Asing drill/tooltip
		d3.select(container).attr('class', ib3SLI.config.getDrillClass('riser', 0, 0));
		d3.select('svg > rect').attr('class', ib3SLI.config.getDrillClass('riser', 0, 0));
		ib3SLI.config.setUpTooltip(d3.select(container).node(), 0, 0, kpiDataElem);
		ib3SLI.config.setUpTooltip(d3.select('svg > rect').node(), 0, 0, kpiDataElem);

		ib3SLI.config.finishRender();
		
		function _calculateComparisonColor(value, kpiSign, isDummyData){
			
			var fillColor = 'black';
			var is_percentaje = formatComparation.indexOf('%');
			if (is_percentaje == -1){
				for (var a = 0; a < colorBands.length; a++) {
					var aux = (kpiSign == 0) ? (value * (-1)) : value;
					if ((aux > colorBands[a].start) && (aux < colorBands[a].stop)) {
						fillColor = colorBands[a].color;
						break;
					}
				}
			}else{
				for (var a = 0; a < colorBands.length; a++) {
					var aux = (kpiSign == 0) ? (value * (-1)) : value;
					if ((aux > colorBands[a].start) && (aux < colorBands[a].stop)) {
						fillColor = colorBands[a].color;
						break;
					}
				}
			}
			
			return fillColor;
			
		}
	}
	
}())