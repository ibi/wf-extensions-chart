(function () {
	//Set the Global IBI Variable if not exists
	if (typeof window.comIbiKpiboxChartExtension == 'undefined') {
		window.comIbiKpiboxChartExtension = {};
	}

	window.comIbiKpiboxChartExtension = {
		draw: _draw,
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
					'<div style="display:flex;flex-direction:column;height: 100%;justify-content: center;">' +
					
						'<div class=kpiBoxTitle></div>' +
						'<div style=display:flex;flex-direction:row;flex:1>' +
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
			textAlign = ib3SLI.config.getProperty('kpiboxProperties.textAlign');
		/*devuelve undefined*/
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
			variationFontFamily = ib3SLI.config.getProperty('kpiboxProperties.variationFont.family') || 'Arial, sans-serif',
			variationTitleFontSize = ib3SLI.config.getProperty('kpiboxProperties.variationTitle.size') || fixedFontSizeProp,
			variationTitleFontFamily = ib3SLI.config.getProperty('kpiboxProperties.variationTitle.family') || 'Arial, sans-serif',
			variationTitleColor = ib3SLI.config.getProperty('kpiboxProperties.variationTitle.color') || 'black';
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
			$('.chart').css('height', '100%');
			$(container).css('height', '100%').css('width', '100%');
			$(container).parent().css('height', '100%').css('width', '100%');
			//habria que preguntar por ie si ponen colores con opacity o generar el filter-opacicty
			if (bodyBackgroundColor.indexOf('#') != 1) bodyBackgroundColor = bodyBackgroundColor.substring(0, 7);
			$('body').css('background-color', bodyBackgroundColor);
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
			$('.kpiBoxValue').text(kpiFormattedValue);
		}

		function setTitle() {
			var _kpiBoxTitle = kpiBoxTitle;
			_kpiBoxTitle = _kpiBoxTitle.split('\\n');
			for (var index = 0; index < _kpiBoxTitle.length; index++) {
				_kpiBoxTitle[index] = $.trim(_kpiBoxTitle[index]);	
			}
			_kpiBoxTitle=_kpiBoxTitle.join('\n');
			$('.kpiBoxTitle').html(_kpiBoxTitle);
		}

		function setImage() {
			if (hasImage) {
				var _imageURL = $ib3.utils.getWebFOCUSUriByResourcePath(kpiDataElem.image, wfPath);
				$('.kpiBoximageIcon').css('background-image', 'url(' + _imageURL + ')');
			} else {
				$('.kpiBoximage').remove();
			}
		}

		function setIconWidth() {
			$('.kpiBoximage').css({
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
				_colorComparation = _getColorComparation(),
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
			}
			function _setValueReal() {
				if (!comparationValue){
					$('.kpiBoxValueCompareRow').remove();
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
				if ($('.kpiBoxValueCompareRow > div').length != 0) {
					$('.kpiBoxValueCompareRow').append(_$separator);
				}
				 
				$('.kpiBoxValueCompareRow').css({
					'font-size':$('.kpiBoxValue').css('font-size').replace(/[^-\d\.]/g, '')/1.5 + 'px'
					
				}).append(
					$('<div>').text(_compareValue)
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
					.css('border-color', _borderColor);
			}

			function _setCustomIcon() {
				var _customIcon = customCompareIconUp;
				if (percentValue < 0) _customIcon = customCompareIconDown;
				$templateComparation2.find('.kpiBoxCompareImage').css({
					'background-image': 'url(' + $ib3.utils.getWebFOCUSUriByResourcePath(_customIcon, wfPath) + ')',
					width: 'calc(15px + 3vmin)',
					height: 'calc(15px + 3vmin)',
					'background-size': 'contain',
					'background-repeat': 'no-repeat',
				});
			}

			function _setCompareIcon() {
				if (customCompareIconActive) {
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
							? 0
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

			function _getColorComparation() {
				var fillColor = 'black';
				for (var a = 0; a < colorBands.length; a++) {
					var aux = kpiSign == 0 ? percentValue * -1 : percentValue;
					if (aux > colorBands[a].start && aux < colorBands[a].stop) {
						fillColor = colorBands[a].color;
						break;
					}
				}

				return fillColor;
			}

			function _calculeFormatComparation() {
				var calculateComparationFunction = new Function(param1, param2, functionBody);
				var percentageCalcValue = calculateComparationFunction(kpiValue, compareValue);
				return percentageCalcValue;
			}

			$('.kpiBoxComparativeRow').append($templateComparation2);
		}

		function fixedSizes() {
			var _sizeTriangle = variationFontSize.replace('px', '') - 6 + 'px';
			$('.kpiBoxContainer,.kpiBoxRow').css({
				'align-items': 'inherit',
				'justify-content': 'center',
			});

			$('.kpiBoxTitle').css({
				'font-size': titleFontSize,
				height: 'auto',
				//	'margin-bottom': fixedPixelLinesMargin +'px',
			});

			$('.kpiBoxValue').css({
				'font-size': measureFontSize,
				height: 'auto',
				//	'margin-bottom': fixedPixelLinesMargin +'px',
			});
			$('.kpiBoxValueCompareRow').css({
				'font-size': measureFontSize.replace(/[^-\d\.]/g, '')/1.5,
				height: 'auto',
				//	'margin-bottom': fixedPixelLinesMargin +'px',
			});
			
			$('.kpiBoxComparativeRow').css({
				'font-size': variationFontSize,
				height: 'auto',
				//'margin-bottom': fixedPixelLinesMargin +'px',
				'font-family': measureFontFamily,
			});

			$('.kpiBoxTitleCompare').css({
				'font-size': variationTitleFontSize,
				height: 'auto',
			});

			$('.triangleUp').css({
				'border-width': ' 0 ' + _sizeTriangle + ' ' + variationFontSize + ' ' + _sizeTriangle,
			});

			$('.triangleDown').css({
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
			$('.kpiBoxTitle').css({
				'color': titleFontColor,
				'font-family': titleFontFamily,
				'align-self': (titleRow == false ) ?  'auto' : 'center'	 
			});

			$('.kpiBoxValue,.kpiBoxValueCompareRow').css({
				'color': measureFontColor,
				'font-family': measureFontFamily,
			});

			$('.kpiBoxComparativeRow').css({
				'font-family': variationFontFamily,
			});

			$('.kpiBoxTitleCompare').css({
				'color': variationTitleColor,
				'font-family': variationTitleFontFamily,
			});
		}

		function alignContent() {
			if (textAlign) {
				$('.kpiBoxRow').css('margin', '0px');
				$('.kpiBoxRow').css('flex', 'initial'); 
				$('.kpiBoxContent').addClass('centerContent')
				$('.kpiBoxContainer').css('align-items','center')
				$('.kpiBoxContainer,.KpiBoxData').css('align-items','center')

			//	$('.kpiBoxRow > div').addClass('centerContent');
			} else {
				$('.kpiBoxContainer').css('align-items','normal')
				$('.kpiBoxComparative:first').css('padding-right', '4vw');
				$('.kpiBoxContainer').css('align-items','normal')
				$('.kpiBoxContainer,.KpiBoxData').css('align-items','normal')
			}
		}

		function tooltip() {
			var attrTooltip = ['value', 'comparevalue', 'comparevalue2', 'tooltip'];
			var $div = $('<div>').addClass('kpiBoxTooltip');

			function formatValueTootip(value) {
				return $ib3.utils.getFormattedNumber(ib3SLI.config.formatNumber, value, '#,##.00', false);
			}

			function _evenTooltip() {
				$(container).on('mouseover', function () {
					$('.kpiBoxTooltip').css('visibility', 'visible');
				});
				$(container).on('mouseout', function () {
					$('.kpiBoxTooltip').css('visibility', 'hidden');
				});
				$(container).on('mousemove', function (event) {
					var tooltipWidth = $('.kpiBoxTooltip').outerWidth(true),
						tooltipHeight = $('.kpiBoxTooltip').outerHeight(true),
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
					$('.kpiBoxTooltip').css({
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
							var _$divRow = $('<div>').addClass('kpiBoxTooltipRow');
							var _valueFormatted = formatValueTootip(kpiDataElem[attribute][index]);
							_$divRow.append([
								$('<div>')
									.text(ib3SLI.config.getBucketTitle(attribute, index).replace('\\n','') + ':')
									.addClass('kpiBoxTooltipLabel'),
								$('<div>').text(_valueFormatted).addClass('kpiBoxTooltipValue'),
							]);
							$div.append(_$divRow);
						}
					} else {
						var _$divRow = $('<div>').addClass('kpiBoxTooltipRow');
						var _valueFormatted = formatValueTootip(kpiDataElem[attribute]);
						_$divRow.append([
							$('<div>')
								.text(ib3SLI.config.getBucketTitle(attribute, 0).replace('\\n','') + ':')
								.addClass('kpiBoxTooltipLabel'),
							$('<div>').text(_valueFormatted).addClass('kpiBoxTooltipValue'),
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
				$('.kpiBoxRow').css('margin-left','5px');
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
				_$footing= (typeFooting == 'Internal') ? $('.kpiBoxFootingInternal') : $('.kpiBoxFootingExternal') ;
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
				_$heading= (typeHeading == 'Internal') ? $('.kpiBoxHeadingInternal') : $('.kpiBoxHeadingExternal') ;
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
				$('.kpiBoxTitle'),
				$('.kpiBoxValue'),
				$('.kpiBoxComparativeRow'),
				$('.kpiBoxTitleCompare'),
			]);
			recalculateBorder([$('.triangleUp'), $('.triangleDown')]);
			recalculateIconCustom($('.kpiBoxCompareImage'));
		}
		alignContent();
		tooltip();

		ib3SLI.config.finishRender();
		//Defaults
	}
})();
