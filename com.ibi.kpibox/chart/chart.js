(function () {
	//Set the Global IBI Variable if not exists
	if (typeof window.comIbiKpiboxChartExtension == 'undefined') {
		window.comIbiKpiboxChartExtension = {};
	}

	window.comIbiKpiboxChartExtension = {
		draw: _draw,
		container: null
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
		this.container = container;

		var template1 = 
			'<div class="template1 kpiBoxContainer" style="display: flex">' +
			'	<div class="kpiBoxHeadingExternal"></div>' +
			'	<div class=kpiBoxContent>' +
			'		<div class="kpiBoximage"> ' +
			'			<div  class="kpiBoximageIcon" ></div>' +			 
			'		</div>' +
			'		<div class="kpiBoxRow">' +
			'			<div class="kpiBoxHeadingInternal"></div>' +
			'			<div class=KpiBoxData>' +
			'				<div class="kpiBoxTitle"></div>' +
			'				<div class="kpiBoxValueRow">' +
			'					<div class="kpiBoxValue"> </div>' +
			'					<div class="kpiBoxValueCompareRow"></div>' +
			'				</div>' +
			'				<div class="kpiBoxComparativeRow"></div>' +
			'			</div>' +
			'			<div class="kpiBoxFootingInternal"></div>' +
			'		</div>' +
			'	</div>' +
			'	<div class="kpiBoxFootingExternal"></div>' +
			'</div>';

		var template2 = 
				'<div class="template2 kpiBoxContainer" style="display: flex">' +
				    '<div class="kpiBoxHeadingExternal"></div>' +
					'<div style="display:flex;flex-direction:column;height: 100%;justify-content:center; width:100%">' +
					
						'<div class=kpiBoxTitle></div>' +
						'<div class="kpiBoxBody" style="display:flex;flex-direction:row;flex:1">' +
							'<div class=kpiBoximage>' +
								'<div  class=kpiBoximageIcon ></div>' +
							'</div>' +
							'<div class=kpiBoxRow>' +
							'<div class="kpiBoxHeadingInternal"></div>' +
								'<div class="kpiBoxValueRow">' +
									'<div class="kpiBoxValue"></div>' +
									'<div class="kpiBoxValueCompareRow"></div>' +														
								'</div>' +
								'<div class=kpiBoxComparativeRow></div>' +
								'<div class="kpiBoxFootingInternal"></div>' +
							'</div>' +
						'</div>' +
					
					'</div>	' +
					'<div class="kpiBoxFootingExternal"></div>' +
				'</div>';

		var numberFormat = ib3SLI.config.getFormatByBucketName('value', 0),
			shortenNumber = ib3SLI.config.getProperty('kpiboxProperties.shortenNumber'),
			typeShortenNumber = ib3SLI.config.getProperty('kpiboxProperties.typeShortenNumber'),
			//???? no pilla colorBandas
			//colorBands = ib3SLI.config.getProperty('colorScale.colorBands'),
			colorBands = ib3SLI.config.getProperty('colorScale.colorBands'),
			bodyBackgroundColor = ib3SLI.config.getProperty('kpiboxProperties.bodyBackgroundColor') || 'transparent',
			calculateComparationFunctionParam1 = ib3SLI.config.getProperty('kpiboxProperties.calculateComparationFunction.param1'),
			calculateComparationFunctionParam2 = ib3SLI.config.getProperty('kpiboxProperties.calculateComparationFunction.param2'),
			calculateComparationFunctionBody = ib3SLI.config.getProperty('kpiboxProperties.calculateComparationFunction.body'),
			calculateComparationFunction2Param1 = ib3SLI.config.getProperty('kpiboxProperties.calculateComparationFunction2.param1'),
			calculateComparationFunction2Param2 = ib3SLI.config.getProperty('kpiboxProperties.calculateComparationFunction2.param2'),
			calculateComparationFunction2Body = ib3SLI.config.getProperty('kpiboxProperties.calculateComparationFunction2.body'),

			customCompareIconActive = ib3SLI.config.getProperty('kpiboxProperties.customCompareIcon.active'),
			customCompareIconUp = ib3SLI.config.getProperty('kpiboxProperties.customCompareIcon.iconUp'),
			customCompareIconDown = ib3SLI.config.getProperty('kpiboxProperties.customCompareIcon.iconDown'),
			formatComparation = ib3SLI.config.getProperty('kpiboxProperties.formatComparation'),

			setInfiniteToZero = ib3SLI.config.getProperty('kpiboxProperties.setInfiniteToZero'),
			titleRow = ib3SLI.config.getProperty('kpiboxProperties.titleRow'),
			calculateFontSize = ib3SLI.config.getProperty('kpiboxProperties.calculateFontSize'),
			fixedFontSizeProp = ib3SLI.config.getProperty('kpiboxProperties.fixedFontSizeProp') || '20px',
			fixedPixelLinesMargin = ib3SLI.config.getProperty('kpiboxProperties.fixedPixelLinesMargin') || 0,
			imagePercentageWidth = ib3SLI.config.getProperty('kpiboxProperties.imagePercentageWidth'),
			wfPath = ib3SLI.config.getProperty('kpiboxProperties.ibiAppsPath'),
			comparationTitle = ib3SLI.config.getProperty('kpiboxProperties.comparationTitle'),
			comparationValue = ib3SLI.config.getProperty('kpiboxProperties.comparationValue'),
			textAlign = ib3SLI.config.getProperty('kpiboxProperties.textAlign'), // deprecated use titleCenter and contentCenter
			contentCenter =ib3SLI.config.getProperty('kpiboxProperties.contentCenter'), 
			borderCompareColor = ib3SLI.config.getProperty('kpiboxProperties.borderCompareColor.border') || 'none',
			borderCompareColorSize = ib3SLI.config.getProperty('kpiboxProperties.borderCompareColor.size') || '3px',
			zoomIcon=ib3SLI.config.getProperty('kpiboxProperties.zoomIcon') || 1;

		 
		/*devuelve undefined*/
		//Advanced Function
		var calculateComparisonValueFunctionBody = ib3SLI.config.getProperty('kpiboxProperties.calculateComparisonValueFunction'),
			calculateComparisonValueColorFunctionBody = ib3SLI.config.getProperty('kpiboxProperties.calculateComparisonValueColorFunction'),
			calculateComparisonIconFunctionBody = ib3SLI.config.getProperty('kpiboxProperties.calculateComparisonIconFunction');

		//Several Custom Font Sizes
		var titleFontSize = ib3SLI.config.getProperty('kpiboxProperties.titleFont.size') || fixedFontSizeProp,
			titleFontColor = ib3SLI.config.getProperty('kpiboxProperties.titleFont.color') || 'black',
			titleFontFamily = ib3SLI.config.getProperty('kpiboxProperties.titleFont.family') || 'Arial, sans-serif',
			titleFontWeight = ib3SLI.config.getProperty('kpiboxProperties.titleFont.weight') || 'normal',
			titleTextAlign =  ib3SLI.config.getProperty('kpiboxProperties.titleFont.text-align') || 'left',
			titlePadding = ib3SLI.config.getProperty('kpiboxProperties.titleFont.padding') || '0 0 0 0',
		 
			measureFontSize = ib3SLI.config.getProperty('kpiboxProperties.measureFont.size') || fixedFontSizeProp,
			measureFontColor = ib3SLI.config.getProperty('kpiboxProperties.measureFont.color') || 'black',
			measureFontFamily = ib3SLI.config.getProperty('kpiboxProperties.measureFont.family') || 'Arial, sans-serif',
			measureFontWeight = ib3SLI.config.getProperty('kpiboxProperties.measureFont.weight') || 'normal',
			measureTextAlign =  ib3SLI.config.getProperty('kpiboxProperties.measureFont.text-align') || 'left',
			measurePadding =  ib3SLI.config.getProperty('kpiboxProperties.measureFont.padding') || '0 0 0 0',

			variationFontSize = ib3SLI.config.getProperty('kpiboxProperties.variationFont.size') || fixedFontSizeProp,
			variationFontFamily = ib3SLI.config.getProperty('kpiboxProperties.variationFont.family') || 'Arial, sans-serif',
			variationFontWeight = ib3SLI.config.getProperty('kpiboxProperties.variationFont.weight') || 'normal',
			variationTextAlign =  ib3SLI.config.getProperty('kpiboxProperties.variationFont.text-align') || 'left',
			variationPadding=  ib3SLI.config.getProperty('kpiboxProperties.variationFont.padding') || '10px 0 0 0',

			variationTitleFontSize = ib3SLI.config.getProperty('kpiboxProperties.variationTitle.size') || fixedFontSizeProp,
			variationTitleFontFamily = ib3SLI.config.getProperty('kpiboxProperties.variationTitle.family') || 'Arial, sans-serif',
			variationTitleFontWeight = ib3SLI.config.getProperty('kpiboxProperties.variationTitle.weight') || 'normal',
			variationTitleColor = ib3SLI.config.getProperty('kpiboxProperties.variationTitle.color') || 'black',
			variationTitleTextAlign =  ib3SLI.config.getProperty('kpiboxProperties.variationTitle.text-align') || 'left',
			variationTitlePadding=  ib3SLI.config.getProperty('kpiboxProperties.variationTitle.padding') || '0 0 0 0';


		//footing - heading
		var	footing=ib3SLI.config.getProperty('footnote.renderedText'),
			heading=ib3SLI.config.getProperty('title.renderedText'),
			typeFooting=ib3SLI.config.getProperty('kpiboxProperties.footing.type') ,
			typeHeading=ib3SLI.config.getProperty('kpiboxProperties.heading.type') ;
		//datas
		var kpiDataElem = data[0],
			kpiValue = kpiDataElem.value,
			compareValue = kpiDataElem.comparevalue,
			compareValue2 = kpiDataElem.comparevalue2,
			imageElem = kpiDataElem.image,
			kpiSign = !!parseInt(typeof kpiDataElem.kpisign === 'undefined' ? 1 : kpiDataElem.kpisign),
			kpiBoxTitle = ib3SLI.config.getBucketTitle('value', 0),
			hasCompareValue = typeof compareValue !== 'undefined',
			hasCompareValue2 = typeof compareValue2 !== 'undefined',
			hasImage = typeof imageElem !== 'undefined',
			auxNumberFormat = numberFormat,
			isPercentaje = false;

		if (auxNumberFormat.indexOf('`%') != -1) {
			isPercentaje = true;
			auxNumberFormat = auxNumberFormat.split('`%')[0];
		}
		if (auxNumberFormat.indexOf('%') != -1) {
			isPercentaje = true;
			auxNumberFormat = auxNumberFormat.split('%')[0];
		}

		function bodyColor() {
			$('.chart', window.comIbiKpiboxChartExtension.container).css('height', '100%');
			$(container).css({
				'height': '100%',
				'width': '100%'
			});
			$(container).parent().css('height', '100%').css('width', '100%');
			//habria que preguntar por ie si ponen colores con opacity o generar el filter-opacicty
			if (bodyBackgroundColor.indexOf('#') != 1) bodyBackgroundColor = bodyBackgroundColor.substring(0, 7);
			$(container).closest('body').css('background-color', bodyBackgroundColor);
		}

		function setValue() {
			kpiFormattedValue = $ib3.utils.getFormattedNumber(
				ib3SLI.config.formatNumber,
				kpiValue,
				auxNumberFormat,
				shortenNumber,
				typeShortenNumber
			);
			if (isPercentaje) {
				kpiFormattedValue += '%';
			}
			$('.kpiBoxValue', window.comIbiKpiboxChartExtension.container).text(kpiFormattedValue);
		}

		function setTitle() {
			var _kpiBoxTitle = kpiBoxTitle;
			_kpiBoxTitle = _kpiBoxTitle.split('\\n');
			for (var index = 0; index < _kpiBoxTitle.length; index++) {
				_kpiBoxTitle[index] = $.trim(_kpiBoxTitle[index]);	
			}
			_kpiBoxTitle=_kpiBoxTitle.join('\n');
			$('.kpiBoxTitle', window.comIbiKpiboxChartExtension.container).html(_kpiBoxTitle);
		}

		function setImage() {
			if (hasImage) {
				var _imageURL = $ib3.utils.getWebFOCUSUriByResourcePath(kpiDataElem.image, wfPath);
				$('.kpiBoximageIcon', window.comIbiKpiboxChartExtension.container).css('background-image', 'url(' + _imageURL + ')');
			} else {
				$('.kpiBoximage', window.comIbiKpiboxChartExtension.container).remove();
			}
		}

		function setIconWidth() {
			$('.kpiBoximage', window.comIbiKpiboxChartExtension.container).css({
				width: imagePercentageWidth + 'vw',
			});
		}

		function generateComparation(parameters) {
			var field = parameters.field,
				param1 = parameters.calculateComparationFunctionParam1,
				param2 = parameters.calculateComparationFunctionParam2,
				functionBody = parameters.calculateComparationFunctionBody,
				kpiValue = parameters.kpiValue,
				value = parameters.kpiValue,
				compareValue = parameters.compareValue,
				kpiSign = parameters.kpiSign,
				percentValue = _calculeFormatComparation(),
				percentValueFormater = _formattedPercentage(percentValue),
				_infoComparation= _getColorIconComparation(),
				_colorComparation = _infoComparation.colorComparation;
				_iconComparation = _infoComparation.iconComparation;
				_templateComparation2 =
					'\n\t\t\t\t<div  class="kpiBoxComparative">\n\t\t\t\t\t<div class=kpiBoxTitleCompare></div>\n\t\t\t\t\t\t<div class=kpiBoxCompareElement>\n\t\t\t\t\t\t\t<div class="kpiBoxCompareImage"></div>\n\t\t\t\t\t\t\t<div class="kpiBoxCompareValue"></div>\n\t\t\t\t\t\t</div>\t\t\t\t\t \n\t\t\t\t</div>',
				/*	_templateComparation2 = `
				<div  class="kpiBoxComparative">
					<div class=kpiBoxTitleCompare></div>
						<div class=kpiBoxCompareElement>
							<div class="kpiBoxCompareImage"></div>
							<div class="kpiBoxCompareValue"></div>
						</div>					 
				</div>`,*/
				$templateComparation2 = $(_templateComparation2);

			_setTitleCompare();
			_setValueCompare();
			_setCompareIcon();
			_setValueReal();

			function _setTitleCompare() {
				if (comparationTitle) {
					$templateComparation2.find('.kpiBoxTitleCompare').text(ib3SLI.config.getBucketTitle(field, 0));
				} else {
					$templateComparation2.remove('.kpiBoxTitleCompare');
				}
			}

			function _setValueCompare() {
				$templateComparation2
					.find('.kpiBoxCompareValue')
					.text(percentValueFormater)
					.css('color', _colorComparation);
				$(container).closest('body').css({
					'border-top': (borderCompareColor.indexOf('top') > -1) ? borderCompareColorSize + ' solid ' + _colorComparation : '0px',
					'border-bottom': (borderCompareColor.indexOf('bottom') > -1) ? borderCompareColorSize + ' solid ' + _colorComparation : '0px',
					'border-left': (borderCompareColor.indexOf('left') > -1) ? borderCompareColorSize + ' solid ' + _colorComparation : '0px',
					'border-right': (borderCompareColor.indexOf('right') > -1) ? borderCompareColorSize + ' solid ' + _colorComparation : '0px'
				});
			}
			function _setValueReal() {
				if (!comparationValue){
					$('.kpiBoxValueCompareRow', window.comIbiKpiboxChartExtension.container).remove();
					return;
				};
				var _compareValue = (kpiFormattedValue = $ib3.utils.getFormattedNumber(
					ib3SLI.config.formatNumber,
					compareValue,
					auxNumberFormat,
					shortenNumber,
					typeShortenNumber
				));
				var _$separator = $('<div>').text(' | ').css({
					'margin-left':'1vw',
					'margin-right':'1vw'
				});
				if ($('.kpiBoxValueCompareRow > div', window.comIbiKpiboxChartExtension.container).length != 0) {
					$('.kpiBoxValueCompareRow', window.comIbiKpiboxChartExtension.container).append(_$separator);
				}
				 
				$('.kpiBoxValueCompareRow', window.comIbiKpiboxChartExtension.container).css({
					'font-size':$('.kpiBoxValue', window.comIbiKpiboxChartExtension.container).css('font-size').replace(/[^-\d\.]/g, '')/1.5 + 'px'
					
				}).append(
					$('<div>', window.comIbiKpiboxChartExtension.container).text(_compareValue)
				);
				//$templateComparation2.find('.kpiBoxCompareImport').text(_compareValue);
			}

			function _setDefaultIcon() {
				var _iconDefault = 'triangleUp',
					_borderColor = 'transparent transparent ' + _colorComparation + ' transparent';

				if (percentValue < 0) {
					_iconDefault = 'triangleDown';
					_borderColor = _colorComparation + ' transparent transparent transparent';
				}
				$templateComparation2
					.find('.kpiBoxCompareImage')
					.addClass(_iconDefault)
					.css('border-color', _borderColor)
					.css('zoom',zoomIcon);
			}

			function _setCustomIcon() {
				var _customIcon = customCompareIconUp;
				if (percentValue < 0) _customIcon = customCompareIconDown;
				$templateComparation2.find('.kpiBoxCompareImage', window.comIbiKpiboxChartExtension.container).css({
					'background-image': 'url(' + $ib3.utils.getWebFOCUSUriByResourcePath(_customIcon, wfPath) + ')',
					width: 'calc(15px + 3vmin)',
					height: 'calc(15px + 3vmin)',
					'background-size': 'contain',
					'background-repeat': 'no-repeat',
					'zoom':zoomIcon
				});
			}

			function _setCustomBandsIcon(){
				$templateComparation2.find('.kpiBoxCompareImage', window.comIbiKpiboxChartExtension.container).css({
					'background-image': 'url(' + $ib3.utils.getWebFOCUSUriByResourcePath(_iconComparation, wfPath) + ')',
					width: 'calc(15px + 3vmin)',
					height: 'calc(15px + 3vmin)',
					'background-size': 'contain',
					'background-repeat': 'no-repeat',
					'zoom':zoomIcon
				});
			}

			function _setCompareIcon() {
				function checkColorBands(){
					var iconNumber=0,
						check=false;

					for (var a = 0; a < colorBands.length; a++) {
						if (typeof colorBands[a].icon !== 'undefined'){
							if  (colorBands[a].icon != '')	iconNumber++;
						}						 
					}
					check=(iconNumber == colorBands.length ) ? true : false;
					return check
				}
				if (checkColorBands()){
					_setCustomBandsIcon();
				}else if (customCompareIconActive) {
					_setCustomIcon();
				} else {
					_setDefaultIcon();
				}
			}

			function _formattedPercentage(percentageCalcValue) {
				var percentageFormattedValue;
				if (setInfiniteToZero) {
					percentageFormattedValue =
						percentageCalcValue == 'Infinity' ||
						percentageCalcValue == '-Infinity' ||
						isNaN(percentageCalcValue)
							? ib3SLI.config.formatNumber(0, formatComparation)
							: ib3SLI.config.formatNumber(parseFloat(percentageCalcValue).toFixed(4), formatComparation);
				} else {
					percentageFormattedValue =
						percentageCalcValue == 'Infinity'
							? String.fromCharCode(8734)
							: percentageCalcValue == '-Infinity'
							? '-' + String.fromCharCode(8734)
							: ib3SLI.config.formatNumber(parseFloat(percentageCalcValue).toFixed(4), formatComparation);
				}
				return percentageFormattedValue;
			}

			function _getColorIconComparation() {
				var fillColor = 'black';
					iconComparation = null;
				for (var a = 0; a < colorBands.length; a++) {
					var aux = kpiSign == 0 ? percentValue * -1 : percentValue;
					if (aux > colorBands[a].start && aux < colorBands[a].stop) {
						fillColor = colorBands[a].color;
						iconComparation = (typeof colorBands[a].icon != 'undefined') ? colorBands[a].icon  : null;
						break;
					}
				}
			 
				return {
					colorComparation: fillColor,
					iconComparation: iconComparation
				}
			}

			function _calculeFormatComparation() {
				var calculateComparationFunction = new Function(param1, param2, functionBody);
				var percentageCalcValue = calculateComparationFunction(kpiValue, compareValue);
				return percentageCalcValue;
			}

			$('.kpiBoxComparativeRow', window.comIbiKpiboxChartExtension.container).append($templateComparation2);
		}

		function fixedSizes() {
			var _sizeTriangle = variationFontSize.replace('px', '') - 6 + 'px';
			$('.kpiBoxContainer,.kpiBoxRow', window.comIbiKpiboxChartExtension.container).css({
				'align-items': 'inherit',
				'justify-content': 'center',
			});

			$('.kpiBoxTitle', window.comIbiKpiboxChartExtension.container).css({
				'font-size': titleFontSize,
				height: 'auto',
				//	'margin-bottom': fixedPixelLinesMargin +'px',
			});

			$('.kpiBoxValue', window.comIbiKpiboxChartExtension.container).css({
				'font-size': measureFontSize,
				height: 'auto',
				//	'margin-bottom': fixedPixelLinesMargin +'px',
			});
			$('.kpiBoxValueCompareRow', window.comIbiKpiboxChartExtension.container).css({
				'font-size': measureFontSize.replace(/[^-\d\.]/g, '')/1.5,
				height: 'auto',
				//	'margin-bottom': fixedPixelLinesMargin +'px',
			});
			
			$('.kpiBoxComparativeRow', window.comIbiKpiboxChartExtension.container).css({
				'font-size': variationFontSize,
				height: 'auto',
				//'margin-bottom': fixedPixelLinesMargin +'px',
				'font-family': measureFontFamily,
				'font-weight': measureFontWeight,
			});

			$('.kpiBoxTitleCompare', window.comIbiKpiboxChartExtension.container).css({
				'font-size': variationTitleFontSize,
				height: 'auto',
			});

			$('.triangleUp', window.comIbiKpiboxChartExtension.container).css({
				'border-width': ' 0 ' + _sizeTriangle + ' ' + variationFontSize + ' ' + _sizeTriangle,
			});

			$('.triangleDown', window.comIbiKpiboxChartExtension.container).css({
				'border-width': variationFontSize + ' ' + _sizeTriangle + ' 0 ' + _sizeTriangle,
			});
		}

		function recalculateFont(objectArray) {
			if (!hasImage) {
				$.each(objectArray, function (indexInArray, $object) {
					_fontSize = 'calc(' + $object.css('font-size') + ' + ' + imagePercentageWidth / 20 + 'vmin)';
					$object.css('font-size', _fontSize);
				});
			}
		}

		function recalculateBorder(objectArray) {
			if (!hasImage) {
				$.each(objectArray, function (indexInArray, $object) {
					var _borderLeft = ($object.css('border-left-width') == '0px') ? '0px' : 'calc(' + $object.css('border-left-width') + ' + ' + imagePercentageWidth / 20 + 'vmin)',
						_borderRight = ($object.css('border-right-width') == '0px') ? '0px' : 'calc(' + $object.css('border-right-width') + ' + ' + imagePercentageWidth / 20 + 'vmin)',
						_borderBottom = ($object.css('border-bottom-width') == '0px') ? '0px' : 'calc(' + $object.css('border-bottom-width') + ' + ' + imagePercentageWidth / 20 + 'vmin)',
						_borderTop =($object.css('border-top-width') == '0px') ? '0px' : 'calc(' + $object.css('border-top-width') + ' + ' + imagePercentageWidth / 20 + 'vmin)';

					$object.css({
						'border-left-width': _borderLeft,
						'border-right-width': _borderRight,
						'border-bottom-width': _borderBottom,
						'border-top-width': _borderTop,
					});
				});
			}
		}

		function recalculateIconCustom($object) {
			if (!hasImage && customCompareIconActive) {
				var	_width = 'calc(' + $object.css('width') + ' + ' + imagePercentageWidth / 20 + 'vmin)';
					_height = 'calc(' + $object.css('height') + ' + ' + imagePercentageWidth / 20 + 'vmin)';

				$object.css({
					width: _width,
					height: _height,
				});
			}
		}

		function applyStyleFonts() {
			$('.kpiBoxTitle', window.comIbiKpiboxChartExtension.container).css({
				'color': titleFontColor,
				'font-family': titleFontFamily,
				'font-weight': titleFontWeight,
				'text-align' : titleTextAlign,
				'padding': titlePadding,
				//'align-self': (titleRow == false ) ?  'auto' : 'center'	 
			});

			$('.kpiBoxValue,.kpiBoxValueCompareRow', window.comIbiKpiboxChartExtension.container).css({
				'color': measureFontColor,
				'font-family': measureFontFamily,
				'font-weight': measureFontWeight,

				 
			});
			
			$('.kpiBoxValueRow', window.comIbiKpiboxChartExtension.container).css({
				'justify-content' : (measureTextAlign == 'left') ? 'flex-start' : (measureTextAlign == 'right') ? 'flex-end' :'center',
				'padding':measurePadding, 
			});
			 
			$('.kpiBoxComparativeRow', window.comIbiKpiboxChartExtension.container).css({
				'font-family': variationFontFamily,
				'font-weight': variationFontWeight, 
				'padding':variationPadding, 
				'justify-content' : (variationTextAlign == 'left') ? 'flex-start' : (variationTextAlign == 'right') ? 'flex-end' :'center',
			});

			$('.kpiBoxTitleCompare', window.comIbiKpiboxChartExtension.container).css({
				'color': variationTitleColor,
				'font-family': variationTitleFontFamily,
				'font-weight': variationTitleFontWeight,
				'text-align' : variationTitleTextAlign,
				'padding':variationTitlePadding, 
			});
		}

		function alignContent() {
			 
	 		if (textAlign || contentCenter)  {	
				$('.kpiBoxRow', window.comIbiKpiboxChartExtension.container).css('margin', '0px');
				$('.kpiBoxRow', window.comIbiKpiboxChartExtension.container).css('flex', 'initial'); 
				$('.kpiBoxContent,.kpiBoxBody', window.comIbiKpiboxChartExtension.container).addClass('centerContent');
				
				$('.kpiBoxContainer', window.comIbiKpiboxChartExtension.container).css('align-items','center');
				$('.kpiBoxContainer,.KpiBoxData', window.comIbiKpiboxChartExtension.container).css('align-items','center');
				

			//	$('.kpiBoxRow > div').addClass('centerContent');
			} else {
				$('.kpiBoxContainer', window.comIbiKpiboxChartExtension.container).css('align-items','normal')
				$('.kpiBoxComparative:first', window.comIbiKpiboxChartExtension.container).css('padding-right', '4vw');
				$('.kpiBoxContainer', window.comIbiKpiboxChartExtension.container).css('align-items','normal')
				$('.kpiBoxContainer,.KpiBoxData', window.comIbiKpiboxChartExtension.container).css('align-items','normal')
			 
			}
 
		 
		/*	if (!titleCenter){
				$('.kpiBoxTitle', window.comIbiKpiboxChartExtension.container).css({'text-align':'left',
																					'padding' :'1vw'});
			} 
			if (contentCenter){
				$('.kpiBoxRow', window.comIbiKpiboxChartExtension.container).css('margin', '0px');
				$('.kpiBoxRow', window.comIbiKpiboxChartExtension.container).css('flex', 'initial'); 
				$('.kpiBoxContent', window.comIbiKpiboxChartExtension.container).addClass('centerContent');
				$('.kpiBoxContainer', window.comIbiKpiboxChartExtension.container).css('align-items','center');
				$('.kpiBoxContainer,.KpiBoxData', window.comIbiKpiboxChartExtension.container).css('align-items','center');
			}else{
				$('.kpiBoxContainer', window.comIbiKpiboxChartExtension.container).css('align-items','normal')
				$('.kpiBoxComparative:first', window.comIbiKpiboxChartExtension.container).css('padding-right', '4vw');
				$('.kpiBoxContainer', window.comIbiKpiboxChartExtension.container).css('align-items','normal')
				$('.kpiBoxContainer,.KpiBoxData', window.comIbiKpiboxChartExtension.container).css('align-items','normal')

			}*/
		}

		function tooltip() {
			var attrTooltip = ['value', 'comparevalue', 'comparevalue2', 'tooltip'];
			var $div = $('<div>', window.comIbiKpiboxChartExtension.container).addClass('kpiBoxTooltip');

			function formatValueTooltip(bucketName, value) {
//				return $ib3.utils.getFormattedNumber(ib3SLI.config.formatNumber, value, '#,##.00', false);
				return $ib3.utils.getFormattedNumber(ib3SLI.config.formatNumber, value, ib3SLI.config.getFormatByBucketName(bucketName), false)
			}

			function _evenTooltip() {
				$(container).on('mouseover', function () {
					$('.kpiBoxTooltip', window.comIbiKpiboxChartExtension.container).css('visibility', 'visible');
				});
				$(container).on('mouseout', function () {
					$('.kpiBoxTooltip', window.comIbiKpiboxChartExtension.container).css('visibility', 'hidden');
				});
				$(container).on('mousemove', function (event) {
					var tooltipWidth = $('.kpiBoxTooltip', window.comIbiKpiboxChartExtension.container).outerWidth(true),
						tooltipHeight = $('.kpiBoxTooltip', window.comIbiKpiboxChartExtension.container).outerHeight(true),
						paddingMouse = 5,
						positionX = 0,
						positionY = 0,
						totalWidth = $(container).outerWidth(true),
						totalHeight = $(container).outerHeight(true);
						
					if (event.pageX + tooltipWidth + paddingMouse >= totalWidth) {
						positionX = event.pageX - tooltipWidth - paddingMouse;
					} else {
						positionX = event.pageX + paddingMouse;
					}
					if (event.pageY + tooltipHeight + paddingMouse >= totalHeight) {
						positionY = event.pageY - tooltipHeight - paddingMouse;
					} else {
						positionY = event.pageY + paddingMouse;
					}
					$('.kpiBoxTooltip', window.comIbiKpiboxChartExtension.container).css({
						top: positionY + 'px',
						left: positionX + 'px',
					});
				});
			}

			function _generateTooltip() {
				$.each(attrTooltip, function (indexInArray, attribute) {
					if (typeof kpiDataElem[attribute] === 'undefined') return;
					if (typeof kpiDataElem[attribute] === 'object') {
						for (var index = 0; index < kpiDataElem[attribute].length; index++) {
							var _$divRow = $('<div>', window.comIbiKpiboxChartExtension.container).addClass('kpiBoxTooltipRow');
							var _valueFormatted = formatValueTooltip(attribute, kpiDataElem[attribute][index]);
							_$divRow.append([
								$('<div>', window.comIbiKpiboxChartExtension.container)
									.text(ib3SLI.config.getBucketTitle(attribute, index).replace(/\\n/g,'') + ':')
									.addClass('kpiBoxTooltipLabel'),
								$('<div>', window.comIbiKpiboxChartExtension.container).text(_valueFormatted).addClass('kpiBoxTooltipValue'),
							]);
							$div.append(_$divRow);
						}
					} else {
						var _$divRow = $('<div>', window.comIbiKpiboxChartExtension.container).addClass('kpiBoxTooltipRow');
						var _valueFormatted = formatValueTooltip(attribute, kpiDataElem[attribute]);
						_$divRow.append([
							$('<div>', window.comIbiKpiboxChartExtension.container)
								.text(ib3SLI.config.getBucketTitle(attribute, 0).replace(/\\n/g,'') + ':')
								.addClass('kpiBoxTooltipLabel'),
							$('<div>', window.comIbiKpiboxChartExtension.container).text(_valueFormatted).addClass('kpiBoxTooltipValue'),
						]);
						$div.append(_$divRow);
					}
				});
				console.log($div);
				$(container).append($div);
			}

			_generateTooltip();
			_evenTooltip();
			/*	for (var attr in kpiDataElem) {
				 
			}*/
		}
		function setMargin(){
			if (!hasImage) {
				$('.kpiBoxRow', window.comIbiKpiboxChartExtension.container).css('margin-left','5px');
				//$('.kpiBoxContainer').css('margin','5px');
			}else{

			}
			 
		}
		function getTemplate() {
			var _template;
			if (titleRow == false) {
				_template = template1;
			} else {
				_template = template2;
			}

			return _template;
		}
		function  setFooting(){
			if (ib3SLI.config.getProperty('footnote.visible')){
				_$footing= (typeFooting == 'Internal') ? $('.kpiBoxFootingInternal', window.comIbiKpiboxChartExtension.container) : $('.kpiBoxFootingExternal', window.comIbiKpiboxChartExtension.container) ;
				_$footing.html(footing).css({
					'padding-bottom':'1vh',
					'padding-top':'1vh',
					'padding-right': '1vw'
				});
				if(calculateFontSize){
					_$footing.children().css('font-size','inherit')
				}
				$ib3.utils.hideNativeFooting();
			}
		}
		function  setHeading(){
			if (ib3SLI.config.getProperty('title.visible')){
				_$heading= (typeHeading == 'Internal') ? $('.kpiBoxHeadingInternal', window.comIbiKpiboxChartExtension.container) : $('.kpiBoxHeadingExternal', window.comIbiKpiboxChartExtension.container) ;
				_$heading.html(heading).css({
					'padding-bottom':'1vh',
					'padding-top':'1vh',
					'padding-right': '1vw'
				});
				if(calculateFontSize){
					_$heading.children().css('font-size','inherit')
				}
				$ib3.utils.hideNativeHeading();
			}
		}

		 
		$(container).css('top', '0px').append(getTemplate());

		bodyColor();
		setValue();
		setTitle();
		setImage();
		setFooting();
		setHeading();


		if (hasCompareValue) {
			var attrComparation = {
				field: 'comparevalue',
				calculateComparationFunctionParam1: calculateComparationFunctionParam1,
				calculateComparationFunctionParam2: calculateComparationFunctionParam2,
				calculateComparationFunctionBody: calculateComparationFunctionBody,
				kpiValue: kpiValue,
				compareValue: compareValue,
				kpiSign: kpiSign,
			};
			generateComparation(attrComparation);
		}
		if (hasCompareValue2) {
			var attrComparation2 = {
				field: 'comparevalue2',
				calculateComparationFunctionParam1: calculateComparationFunction2Param1,
				calculateComparationFunctionParam2: calculateComparationFunction2Param2,
				calculateComparationFunctionBody: calculateComparationFunction2Body,
				kpiValue: kpiValue,
				compareValue: compareValue2,
				kpiSign: kpiSign,
			};
			generateComparation(attrComparation2);
		}

		applyStyleFonts();
		setMargin();

		if (!calculateFontSize) {
			setIconWidth();
			fixedSizes();
		} else {
			recalculateFont([
				$('.kpiBoxTitle', window.comIbiKpiboxChartExtension.container),
				$('.kpiBoxValue', window.comIbiKpiboxChartExtension.container),
				$('.kpiBoxComparativeRow', window.comIbiKpiboxChartExtension.container),
				$('.kpiBoxTitleCompare', window.comIbiKpiboxChartExtension.container),
			]);
			recalculateBorder([$('.triangleUp', window.comIbiKpiboxChartExtension.container), $('.triangleDown', window.comIbiKpiboxChartExtension.container)]);
			recalculateIconCustom($('.kpiBoxCompareImage', window.comIbiKpiboxChartExtension.container));
		}
		alignContent();
//		tooltip();
		$(window.comIbiKpiboxChartExtension.container).css('z-index',-1);
		$(window.comIbiKpiboxChartExtension.container).parent().css('z-index',1);
		$('div.kpiBoxContainer:first', window.comIbiKpiboxChartExtension.container).css('background-color', $('rect.background:first', $(window.comIbiKpiboxChartExtension.container).parent()).attr('fill'));
		$('rect.background:first', $(window.comIbiKpiboxChartExtension.container).parent()).remove();
		d3.select('.eventCatcher').attr('class', 'eventCatcher '+ ib3SLI.config.getDrillClass('riser', 0, 0));
		d3.select('.chartPanel').attr('class',  ib3SLI.config.getDrillClass('riser', 0, 0))
			.append('rect').attr('class','drill')
			.attr('width',d3.select('.eventCatcher').attr('width'))
			.attr('height',d3.select('.eventCatcher').attr('height'));
		ib3SLI.config.setUpTooltip(d3.select('.eventCatcher').node(), 0, 0, kpiDataElem);
		ib3SLI.config.setUpTooltip(d3.select('.drill').node(), 0, 0, kpiDataElem);
		ib3SLI.config.finishRender();
		//Defaults
	}
})();
