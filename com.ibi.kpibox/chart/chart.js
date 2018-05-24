(function() {

    //Set the Global IBI Variable if not exists
    if(typeof window.$ib3 == 'undefined') {
        //console.log("Global variable window.$ib3 doesn't exist. ");
		window.$ib3 = {};
	}
	
	var chart = {
		draw: _draw
	};
	
	window.$ib3.chart = chart;
	
	function _draw(isDummyData) {
		
		$ib3.config.checkServiceIsInitinalized();
		
		//Declare main extension vars
		var data = $ib3.config.getData(),
			container = $ib3.config.getContainer(),
			chart = $ib3.config.getChart(),
			width = $ib3.config.getChartWidth(),
			height = $ib3.config.getChartHeight(),
			properties = $ib3.config.getCustomProperties();	
			
		var numberFormat = $ib3.config.getFormatByBucketName('value', 0),
			colorBands = $ib3.config.getProperty('colorScale.colorBands'),
			shortenNumbers = $ib3.config.getProperty('shortenNumbers'),
			shortenNumbersTooltip = $ib3.config.getProperty('shortenNumbersTooltip'),
			widthImage = width * 0.4,
			widthInfo = width * 0.6,
			calculateFontSize = $ib3.config.getProperty('calculateFontSize'),
			fixedFontSizeProp = $ib3.config.getProperty('fixedFontSizeProp') || '20px',
			fixedPixelLinesMargin = $ib3.config.getProperty('fixedPixelLinesMargin') || 0;

		//get Buckets
		var kpiDataElem = data[0],
			kpiValue = shortenNumbers 
				? $ib3.utils.setShortenNumber(kpiDataElem.value, false, 1) 
				: $ib3.config.formatNumber(kpiDataElem.value, numberFormat),
			compareValue = kpiDataElem.comparevalue,
			image = typeof kpiDataElem.image === 'undefined' 
				? 'data:image/png;base64,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'
				: (typeof WFInstallOption_CGIPath == 'undefined' ? $ib3.config.getProperty('ibiAppsPath') : WFInstallOption_CGIPath) + 'run.bip?BIP_REQUEST_TYPE=BIP_RUN' +
					'&BIP_folder=' + kpiDataElem.image.substring(0, kpiDataElem.image.lastIndexOf("/")) +
					'&BIP_item=' + kpiDataElem.image.substring(kpiDataElem.image.lastIndexOf("/") + 1),
			kpiSign = !!parseInt(typeof kpiDataElem.kpisign === 'undefined' ? 1 : kpiDataElem.kpisign),
			kpiBoxTitle = $ib3.config.getBucketTitle('value', 0),
			hasCompareValue = typeof compareValue !== 'undefined';

		var imageContainer = d3.select(container)
			.append('g')
			.attr('width', widthImage)
			.attr('height', height);

		var imageElem = imageContainer.append('svg:image')
			.attr('class', 'image-container')
			.attr('width', widthImage)
			.attr('height', height)
			.attr('xlink:href', image)
			.attr('x', 0)
			.attr('y', 0);

		var infoContainer = d3.select(container)
			.append('g')
			.attr('class', 'info-container')
			.attr('width', widthInfo)
			.attr('height', height)
			.attr('transform', 'translate(' + width * 0.4 + ',0)');

		var kpiTitleElem = infoContainer.append('text')
			.attr('class', 'kpi-title')
			.attr('width', widthInfo)
			.attr('fill', '#333')
			.attr('x', 0)
			.text(kpiBoxTitle);

		kpiTitleElem
			.attr('font-size', function() { 
				return calculateFontSize
					? Math.min(widthInfo, (widthInfo - 8) / this.getComputedTextLength() * parseInt($(this).css('font-size'))) + 'px'
					: fixedFontSizeProp;
			})
			.attr('height', function() { 
				return this.getBBox().height;
			})
			.attr('y', function() { 
				return this.getBBox().height;
			});

		var kpiValueElem = infoContainer.append('text')
			.attr('class', 'kpi-value')
			.attr('width', widthInfo)
			.attr('fill', '#333')
			.attr('x', 0)
			.text(kpiValue);

		kpiValueElem
			.attr('font-size', function() { 
				return calculateFontSize
					? Math.min(widthInfo, (widthInfo - 8) / this.getComputedTextLength() * parseInt($(this).css('font-size'))) + 'px'
					: fixedFontSizeProp;
			})
			.attr('height', function() { 
				return this.getBBox().height;
			})
			.attr('y', function() { 
				return this.getBBox().height + kpiTitleElem.node().getBBox().height + fixedPixelLinesMargin;
			});
		
		if (hasCompareValue) {

			var compareTitle =  $ib3.config.getBucketTitle('comparevalue'),
				percentageCalcValue = (kpiDataElem.value - compareValue) / compareValue,
				percentageValue = (percentageCalcValue == 'Infinity') 
					? String.fromCharCode(8734)
					: $ib3.config.formatNumber(parseFloat(percentageCalcValue).toFixed(4), '#,###.00%'),
				percentageColor = calculateColor(percentageCalcValue);
				percentageTriangleDirection = percentageCalcValue < 0 ? 'down' : 'up';

			var triangleHeight = kpiValueElem.node().getBBox().height;
	
			var trianglePath = d3.symbol()
				.size([triangleHeight * triangleHeight / 2]) //TODO: Make responsive size
				.type(d3.symbolTriangle);
	
			var triangleElem = infoContainer.append('path')
				.attr('d', trianglePath)
				.attr('fill', percentageColor)
				.attr('transform', function() {
					return 'translate( ' + (this.getBBox().width / 2) + ', ' + (this.getBBox().height + kpiTitleElem.node().getBBox().height + kpiValueElem.node().getBBox().height + fixedPixelLinesMargin * 2) + ') ' + 
						'rotate(' + ( percentageTriangleDirection == 'up' ? 0 : 180) + ')'; 
				});		

			var kpiCompareValueWidth = widthInfo - triangleElem.node().getBBox().width;

			var kpiCompareValueElem = infoContainer.append('text')
				.attr('class', 'kpi-value')
				.attr('width', kpiCompareValueWidth)
				.attr('fill', percentageColor)
				.attr('x', triangleElem.node().getBBox().width)
				.text(percentageValue);

			kpiCompareValueElem
				.attr('font-size', function() { 
					return calculateFontSize
						? Math.min(kpiCompareValueWidth, (kpiCompareValueWidth - 8) / this.getComputedTextLength() * parseInt($(this).css('font-size'))) + 'px'
						: fixedFontSizeProp;
				})
				.attr('height', function() { 
					return this.getBBox().height;
				})
				.attr('y', function() { 
					return this.getBBox().height + kpiTitleElem.node().getBBox().height + kpiValueElem.node().getBBox().height + fixedPixelLinesMargin * 2;
				});
		
		}
		
		//Check if text over flow height
		var availableHeight = height,
			availableWidth = widthInfo,
			kpiTitleWidth = kpiTitleElem.node().getBBox().width,
			kpiTitleHeight = kpiTitleElem.node().getBBox().height,
			kpiValueWidth = kpiValueElem.node().getBBox().width,
			kpiValueHeight = kpiValueElem.node().getBBox().height,
			kpiCompareTriangleHeight = hasCompareValue ? triangleElem.node().getBBox().height : 0,
			kpiCompareTriangleWidth = hasCompareValue ? triangleElem.node().getBBox().width : 0,
			kpiCompareValueWidth = hasCompareValue ? kpiCompareValueElem.node().getBBox().width : 0,
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
				
			if(hasCompareValue) {
				
				var compareTriangleScale = elemHeight / kpiCompareTriangleHeight;
				
				if (compareTriangleScale < 1) {	
					triangleElem
						.attr('transform', function() {
							return 'scale(' + compareTriangleScale + ') translate( ' + (this.getBBox().width / 2) + ', ' + (this.getBBox().height + (elemHeight / compareTriangleScale) * 2) + ') ' + 
								'rotate(' + ( percentageTriangleDirection == 'up' ? 0 : 180) + ')'; 
						});
				}
									
				var compareValueScale = elemHeight / kpiCompareTriangleHeight + 0.3;
			
				if (compareValueScale < 1) {	
					kpiCompareValueElem
						.attr('transform', 'scale(' + compareValueScale + ')')
						.attr('x', triangleElem.node().getBBox().width)
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
			triangleElem
				.attr('fill', '#d1d1d1');
			kpiCompareValueElem
				.attr('fill', '#d1d1d1');
		}
		
		//Asing drill/tooltip clases
		d3.select(container)
			.attr('class', $ib3.config.getDrillClass(0, 0));		
			
		$ib3.utils.setUpTooltip(d3.select(container).node(), 0, 0, kpiDataElem);
		
		$ib3.config.finishRender();
		
		function calculateColor(field){
			var the_fill = 'black';
			for (var a = 0; a < colorBands.length; a++){
				if ((field > colorBands[a].start) &&
					(field < colorBands[a].stop)){
					the_fill = colorBands[a].color;
					break;
				}
			}
			return the_fill;
		}
	}
	
}())