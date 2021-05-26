//This addresses VIZ-611
//by not storing the extension in the window object
//In addition, it uses a simplified version of a jquery plugin implementation pattern
//Heading and Footing has been disabled in favour of using Designer's heading and footing.
(function ($) {

    var CONSTANTS = {
        ID_SUFFIX: 'kpibox'
    }

    var TEMPLATES = {

        template1:
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
            '</div>',

        template2:
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
            '</div>'
    }

    var methods = {
        /*
               function name: init
               parameters:
                   options: see below
       
               The constructor
               */
        init: function (options) {
            return this.each(function () {
                var settings = $.extend(
                    {
                        o_renderConfig: null
                    },
                    options
                );

                var controlID = jQuery(this).attr("id");
                elements.controlElement(controlID).data("renderConfig", settings.o_renderConfig);
                //create scorecard from HTML table
                methods.createControl(controlID);
            });
        },

        createControl: function (controlID) {
            var controlHTML = [];
            var renderConfig = elements.renderConfig(controlID);

            var data = renderConfig.data,
                container = elements.controlElement(controlID),
                chart = renderConfig.moonbeamInstance,
                width = renderConfig.width,
                height = renderConfig.height,
                properties = renderConfig.properties;

            var dataBucket = renderConfig.dataBuckets.getBucket('value');

            var fn_formatNumber = chart.formatNumber.bind(chart);
            var numberFormat = dataBucket.fields[0].numberFormat,
                shortenNumber = properties.kpiboxProperties.shortenNumber,
                typeShortenNumber = properties.kpiboxProperties.typeShortenNumber,


                customCompareIconActive = properties.kpiboxProperties.customCompareIcon.active,
                customCompareIconUp = properties.kpiboxProperties.customCompareIcon.iconUp,
                customCompareIconDown = properties.kpiboxProperties.customCompareIcon.iconDown,
                formatComparation = properties.kpiboxProperties.formatComparation,

                setInfiniteToZero = properties.kpiboxProperties.setInfiniteToZero,
                titleRow = properties.kpiboxProperties.titleRow,

                fixedFontSizeProp = properties.kpiboxProperties.fixedFontSizeProp || '20px',
                fixedPixelLinesMargin = properties.kpiboxProperties.fixedPixelLinesMargin || 0,

                
                comparationTitle = properties.kpiboxProperties.comparationTitle,
                comparationValue = properties.kpiboxProperties.comparationValue;

            //Several Custom Font Sizes
            var titleFontSize = properties.kpiboxProperties.titleFont.size || fixedFontSizeProp,
                titleFontColor = properties.kpiboxProperties.titleFont.color || 'black',
                titleFontFamily = properties.kpiboxProperties.titleFont.family || 'Arial, sans-serif',
                measureFontSize = properties.kpiboxProperties.measureFont.size || fixedFontSizeProp,
                measureFontColor = properties.kpiboxProperties.measureFont.color || 'black',
                measureFontFamily = properties.kpiboxProperties.measureFont.family || 'Arial, sans-serif',
                variationFontSize = properties.kpiboxProperties.variationFont.size || fixedFontSizeProp,
                variationFontFamily = properties.kpiboxProperties.variationFont.family || 'Arial, sans-serif',
                variationTitleFontSize = properties.kpiboxProperties.variationTitle.size || fixedFontSizeProp,
                variationTitleFontFamily = properties.kpiboxProperties.variationTitle.family || 'Arial, sans-serif',
                variationTitleColor = properties.kpiboxProperties.variationTitle.color || 'black';
            //footing - heading
            // var	footing=properties.footnote.renderedText,
            // 	heading=properties.title.renderedText,
            // 	typeFooting=properties.kpiboxProperties.footing.type ,
            // 	typeHeading=properties.kpiboxProperties.heading.type ;
            var kpiDataElem = data[0],
                kpiValue = kpiDataElem.value,



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

            var _template = titleRow == false ? TEMPLATES.template1 : TEMPLATES.template2;

            controlHTML.push('<div id="' + controlID + '-' + CONSTANTS.ID_SUFFIX + '" class="' + renderConfig.moonbeamInstance.buildClassName('riser', 0, 0, 'bar') + '">'); // root div
            controlHTML.push(_template);
            controlHTML.push('</div>'); // end root div
            container.html(controlHTML.join(''));

            //BEGIN start configuring elements

            //set the title
            var _kpiBoxTitle = dataBucket.fields[0].title;
            _kpiBoxTitle = _kpiBoxTitle.split('\\n');
            for (var index = 0; index < _kpiBoxTitle.length; index++) {
                _kpiBoxTitle[index] = $.trim(_kpiBoxTitle[index]);
            }
            _kpiBoxTitle = _kpiBoxTitle.join('\n');
            $('.kpiBoxTitle', container).html(_kpiBoxTitle);


            //main KPI number
            $('.kpiBoxValue', container).text(fn_formatNumber(kpiValue, dataBucket.fields[0].numberFormat));

            //comparison elements

            methods.initComparisons(container, renderConfig);

            //body color
            methods.styling(container, renderConfig);

            eventHandlers.tooltip(controlID, renderConfig);

        },

        styling: function (container, renderConfig) {

            var properties = renderConfig.properties;
            var calculateFontSize = properties.kpiboxProperties.calculateFontSize;
            var titleRow = properties.kpiboxProperties.titleRow;
            var kpiDataElem = renderConfig.data[0], kpiValue = kpiDataElem.value;
            var imageElem = kpiDataElem.image;
            var hasImage = typeof imageElem !== 'undefined';
            var bodyBackgroundColor = properties.kpiboxProperties.bodyBackgroundColor || 'transparent',
                textAlign = properties.kpiboxProperties.textAlign;
            var chart = renderConfig.moonbeamInstance;
            var wfPath = properties.kpiboxProperties.ibiAppsPath;
            var dataBucketObj = renderConfig.dataBuckets;


            var kpiBoxValueRowElement = $('.kpiBoxValueRow', container);

            kpiBoxValueRowElement.css('height', properties.kpiboxProperties.measureFont.size);
            kpiBoxValueRowElement.css('padding-bottom','5px');
            $('.chart', container).css('height', '100%');
            $(container).css('height', '100%').css('width', '100%');
            $(container).parent().css('height', '100%').css('width', '100%');
            //habria que preguntar por ie si ponen colores con opacity o generar el filter-opacicty
            if (bodyBackgroundColor.indexOf('#') != 1) bodyBackgroundColor = bodyBackgroundColor.substring(0, 7);
            $('body').css('background-color', bodyBackgroundColor);

            var imagePercentageWidth = properties.kpiboxProperties.imagePercentageWidth;
            $('.kpiBoximage', container).css({
                width: imagePercentageWidth + 'vw',
            });

            function fixedSizes() {
                var _sizeTriangle = properties.kpiboxProperties.variationFont.size.replace('px', '') - 6 + 'px';
                $('.kpiBoxContainer,.kpiBoxRow', container).css({
                    'align-items': 'inherit',
                    'justify-content': 'center',
                });

                $('.kpiBoxTitle', container).css({
                    'font-size': properties.kpiboxProperties.titleFont.size,
                    height: 'auto',
                    //	'margin-bottom': fixedPixelLinesMargin +'px',
                });

                $('.kpiBoxValue', container).css({
                    'font-size': properties.kpiboxProperties.measureFont.size,
                    height: 'auto',
                    //	'margin-bottom': fixedPixelLinesMargin +'px',
                });
                $('.kpiBoxValueCompareRow', container).css({
                    'font-size': properties.kpiboxProperties.measureFont.size.replace(/[^-\d\.]/g, '') / 1.5,
                    height: 'auto',
                    //	'margin-bottom': fixedPixelLinesMargin +'px',
                });

                $('.kpiBoxComparativeRow', container).css({
                    'font-size': properties.kpiboxProperties.variationFont.size,
                    height: 'auto',
                    //'margin-bottom': fixedPixelLinesMargin +'px',
                    'font-family': properties.kpiboxProperties.measureFont.family,
                });

                $('.kpiBoxTitleCompare', container).css({
                    'font-size': properties.kpiboxProperties.variationTitle.size,
                    height: 'auto',
                });

                $('.triangleUp', container).css({
                    'border-width': ' 0 ' + _sizeTriangle + ' ' + properties.kpiboxProperties.variationFont.size + ' ' + _sizeTriangle,
                });

                $('.triangleDown', container).css({
                    'border-width': properties.kpiboxProperties.variationFont.size + ' ' + _sizeTriangle + ' 0 ' + _sizeTriangle,
                });
            }

            function recalculateFont(objectArray) {
                if (!hasImage) {
                    $.each(objectArray, function (indexInArray, $object) {
                        _fontSize = 'calc(' + $object.css('font-size') + ' + ' + properties.kpiboxProperties.imagePercentageWidth / 20 + 'vmin)';
                        $object.css('font-size', _fontSize);
                    });
                }
            }

            function recalculateBorder(objectArray) {
                if (!hasImage) {
                    $.each(objectArray, function (indexInArray, $object) {
                        var _borderLeft = ($object.css('border-left-width') == '0px') ? '0px' : 'calc(' + $object.css('border-left-width') + ' + ' + properties.kpiboxProperties.imagePercentageWidth / 20 + 'vmin)',
                            _borderRight = ($object.css('border-right-width') == '0px') ? '0px' : 'calc(' + $object.css('border-right-width') + ' + ' + properties.kpiboxProperties.imagePercentageWidth / 20 + 'vmin)',
                            _borderBottom = ($object.css('border-bottom-width') == '0px') ? '0px' : 'calc(' + $object.css('border-bottom-width') + ' + ' + properties.kpiboxProperties.imagePercentageWidth / 20 + 'vmin)',
                            _borderTop = ($object.css('border-top-width') == '0px') ? '0px' : 'calc(' + $object.css('border-top-width') + ' + ' + properties.kpiboxProperties.imagePercentageWidth / 20 + 'vmin)';

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
                    var _width = 'calc(' + $object.css('width') + ' + ' + properties.kpiboxProperties.imagePercentageWidth / 20 + 'vmin)';
                    _height = 'calc(' + $object.css('height') + ' + ' + properties.kpiboxProperties.imagePercentageWidth / 20 + 'vmin)';

                    $object.css({
                        width: _width,
                        height: _height,
                    });
                }
            }
            function setIconWidth() {
                $('.kpiBoximage', container).css({
                    width: properties.kpiboxProperties.magePercentageWidth + 'vw',
                });
            }

            function applyStyleFonts() {
                $('.kpiBoxTitle', container).css({
                    'color': properties.kpiboxProperties.titleFont.color,
                    'font-family': properties.kpiboxProperties.titleFont.family,
                    'align-self': (titleRow == false) ? 'auto' : 'center'
                });

                $('.kpiBoxValue,.kpiBoxValueCompareRow', container).css({
                    'color': properties.kpiboxProperties.measureFont.color,
                    'font-family': properties.kpiboxProperties.measureFont.family,
                });

                $('.kpiBoxComparativeRow', container).css({
                    'font-family': properties.kpiboxProperties.variationFont.family,
                });

                $('.kpiBoxTitleCompare', container).css({
                    'color': properties.kpiboxProperties.variationTitle.color,
                    'font-family': properties.kpiboxProperties.variationTitle.family,
                });
            }

            function alignContent() {
                if (textAlign) {
                    $('.kpiBoxRow', container).css('margin', '0px');
                    $('.kpiBoxRow', container).css('flex', 'initial');
                    $('.kpiBoxContent', container).addClass('centerContent')
                    $('.kpiBoxContainer', container).css('align-items', 'center')
                    $('.kpiBoxContainer,.KpiBoxData', container).css('align-items', 'center')

                    //	$('.kpiBoxRow > div').addClass('centerContent');
                } else {
                    $('.kpiBoxContainer', container).css('align-items', 'normal')
                    $('.kpiBoxComparative:first', container).css('padding-right', '4vw');
                    $('.kpiBoxContainer', container).css('align-items', 'normal')
                    $('.kpiBoxContainer,.KpiBoxData', container).css('align-items', 'normal')
                }
            }

            function setMargin() {
                if (!hasImage) {
                    $('.kpiBoxRow', container).css('margin-left', '5px');
                    //$('.kpiBoxContainer').css('margin','5px');
                } else {

                }

            }



            if (!calculateFontSize) {
                setIconWidth();
                fixedSizes();
            } else {
                recalculateFont([
                    $('.kpiBoxTitle', container),
                    $('.kpiBoxValue', container),
                    $('.kpiBoxComparativeRow', container),
                    $('.kpiBoxTitleCompare', container),
                ]);
                recalculateBorder([$('.triangleUp', container), $('.triangleDown', container)]);
                recalculateIconCustom($('.kpiBoxCompareImage', container));
            }

            function bodyColor() {
                $('.chart', container).css('height', '100%');
                $(container).css('height', '100%').css('width', '100%');
                $(container).parent().css('height', '100%').css('width', '100%');
                //habria que preguntar por ie si ponen colores con opacity o generar el filter-opacicty
                if (bodyBackgroundColor.indexOf('#') != 1) bodyBackgroundColor = bodyBackgroundColor.substring(0, 7);
                $('body').css('background-color', bodyBackgroundColor);
            }


            function setImage() {
                if (hasImage) {
                    var _imageURL = $ib3.utils.getWebFOCUSUriByResourcePath(kpiDataElem.image, wfPath);
                    $('.kpiBoximageIcon', container).css('background-image', 'url(' + _imageURL + ')');
                } else {
                    $('.kpiBoximage', container).remove();
                }
            }
            //$(container).css('top', '0px');
            applyStyleFonts();
            setMargin();
            alignContent();
            bodyColor();
            setImage();
        },

        initComparisons: function (container, renderConfig) {
            var chart = renderConfig.moonbeamInstance;

            var properties = renderConfig.properties;
            var colorBands = properties.colorScale.colorBands,

                calculateComparationFunctionParam1 = properties.kpiboxProperties.calculateComparationFunction.param1,
                calculateComparationFunctionParam2 = properties.kpiboxProperties.calculateComparationFunction.param2,
                calculateComparationFunctionBody = properties.kpiboxProperties.calculateComparationFunction.body,
                calculateComparationFunction2Param1 = properties.kpiboxProperties.calculateComparationFunction2.param1,
                calculateComparationFunction2Param2 = properties.kpiboxProperties.calculateComparationFunction2.param2,
                calculateComparationFunction2Body = properties.kpiboxProperties.calculateComparationFunction2.body,

                customCompareIconActive = properties.kpiboxProperties.customCompareIcon.active,
                customCompareIconUp = properties.kpiboxProperties.customCompareIcon.iconUp,
                customCompareIconDown = properties.kpiboxProperties.customCompareIcon.iconDown,
                formatComparation = properties.kpiboxProperties.formatComparation,

                setInfiniteToZero = properties.kpiboxProperties.setInfiniteToZero;

            //data related variables
            var kpiDataElem = renderConfig.data[0],
                kpiValue = kpiDataElem.value,
                dataBucketObj = renderConfig.dataBuckets,
                compareValue = kpiDataElem.comparevalue,
                compareValue2 = kpiDataElem.comparevalue2,
                wfPath = properties.kpiboxProperties.ibiAppsPath,
                comparationTitle = properties.kpiboxProperties.comparationTitle,
                comparationValue = properties.kpiboxProperties.comparationValue,

                kpiSign = !!parseInt(typeof kpiDataElem.kpisign === 'undefined' ? 1 : kpiDataElem.kpisign),

                hasCompareValue = typeof compareValue !== 'undefined',
                hasCompareValue2 = typeof compareValue2 !== 'undefined',
                fn_formatNumber = chart.formatNumber.bind(chart);


            if (hasCompareValue) {
                var attrComparation = {
                    field: 'comparevalue',
                    calculateComparationFunctionParam1: calculateComparationFunctionParam1,
                    calculateComparationFunctionParam2: calculateComparationFunctionParam2,
                    calculateComparationFunctionBody: calculateComparationFunctionBody,
                    kpiValue: kpiValue,
                    compareValue: compareValue,

                    //compareValueDisplay: 
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
                    var dataBucket = renderConfig.dataBuckets.getBucket(parameters.field);
                
                _setTitleCompare();
                _setValueCompare();
                _setCompareIcon();
                _setValueReal();

                
                function _setTitleCompare() {
                    if (comparationTitle) {
                        $templateComparation2.find('.kpiBoxTitleCompare').text(dataBucket.fields[0]);
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
                    if (!comparationValue) {
                        $('.kpiBoxValueCompareRow', container).remove();
                        return;
                    };
                    var _compareValue = fn_formatNumber(compareValue, dataBucketObj.getBucket(parameters.field).fields[0].numberFormat);
                    var _$separator = $('<div>').text(' | ').css({
                        'margin-left': '1vw',
                        'margin-right': '1vw'
                    });
                    if ($('.kpiBoxValueCompareRow > div', container).length != 0) {
                        $('.kpiBoxValueCompareRow', container).append(_$separator);
                    }

                    $('.kpiBoxValueCompareRow', container).css({
                        'font-size': $('.kpiBoxValue', container).css('font-size').replace(/[^-\d\.]/g, '') / 1.5 + 'px'

                    }).append(
                        $('<div>', container).text(_compareValue)
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
                    $templateComparation2.find('.kpiBoxCompareImage', container).css({
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
                                ? fn_formatNumber(0, formatComparation)
                                : fn_formatNumber(percentageCalcValue, formatComparation);
                    } else {
                        percentageFormattedValue =
                            percentageCalcValue == 'Infinity'
                                ? String.fromCharCode(8734)
                                : percentageCalcValue == '-Infinity'
                                    ? '-' + String.fromCharCode(8734)
                                    : fn_formatNumber(percentageCalcValue, formatComparation);
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

                $('.kpiBoxComparativeRow', container).append($templateComparation2);
            }
        }

    }

    var eventHandlers = {
        tooltip: function (controlID, renderConfig) {
            var chart = renderConfig.moonbeamInstance;
            var dataBucketObj = renderConfig.dataBuckets;
            var kpiDataElem = renderConfig.data[0];
            var fn_formatNumber = chart.formatNumber.bind(chart);
            var container = $(renderConfig.container);
            var kpiContainer = $('.kpiBoxValueRow', container);
            var $div = null;
            var tooltip = $('.kpiBoxTooltip', container);
            var attrTooltip = ['value', 'comparevalue', 'comparevalue2', 'tooltip'];

            if (tooltip.length == 0) {
                $div =$('<div>', kpiContainer).addClass('kpiBoxTooltip');
                _generateTooltip();
                tooltip = $('.kpiBoxTooltip', container);
                //container.append('<div id="tooltip-' + container.attr('id') + '" style="position: absolute; top: 0px; left: 0px; width: 100px; height: 100px;" class="kpiBoxTooltip">Hello</div>');

               // tooltip = $('.kpiBoxTooltip', container);
            }

            $(kpiContainer).mouseenter(function (e) {
                var elementOffSet = $(this).offset();
                var mouseElementX = e.offsetX;
                var mouseElementY = e.offsetY;

                var x = mouseElementX + 5;
                var y = mouseElementY + 5;



                tooltip.css('left', x + 'px');
                tooltip.css('top', y + 'px');
                tooltip.css('visibility', 'visible');
                console.log('here');
            });

            (kpiContainer).mouseleave(function (e) {
                tooltip.css('visibility', 'hidden');
            });

            function _generateTooltip() {
                $.each(attrTooltip, function (indexInArray, attribute) {
                    if (typeof kpiDataElem[attribute] === 'undefined') return;
                    var dataBucket = dataBucketObj.getBucket(attribute);
                    if (typeof kpiDataElem[attribute] === 'object') {
                        
                        for (var index = 0; index < kpiDataElem[attribute].length; index++) {
                            var _$divRow = $('<div>', kpiContainer).addClass('kpiBoxTooltipRow');
                            var _valueFormatted = fn_formatNumber(kpiDataElem[attribute], dataBucket.fields[0].numberFormat);
                            _$divRow.append([
                                $('<div>', kpiContainer)
                                    .text(dataBucket.fields[0].title.replace(/\\n/g, '') + ':')
                                    .addClass('kpiBoxTooltipLabel'),
                                $('<div>', kpiContainer).text(_valueFormatted).addClass('kpiBoxTooltipValue'),
                            ]);
                            $div.append(_$divRow);
                        }
                    } else {
                        var _$divRow = $('<div>', kpiContainer).addClass('kpiBoxTooltipRow');
                        var _valueFormatted = fn_formatNumber(kpiDataElem[attribute], dataBucket.fields[0].numberFormat);
                        _$divRow.append([
                            $('<div>', kpiContainer)
                                .text(dataBucket.fields[0].title.replace(/\\n/g, '') + ':')
                                .addClass('kpiBoxTooltipLabel'),
                            $('<div>', kpiContainer).text(_valueFormatted).addClass('kpiBoxTooltipValue'),
                        ]);
                        $div.append(_$divRow);
                    }
                });
                console.log($div);
                $('.kpiBoxValue', container).append($div);
            }

        }
    }

    var elements = {
        controlElement: function (controlID) {
            return jQuery("#" + controlID);
        },

        renderConfig: function (controlID) {
            return elements.controlElement(controlID).data("renderConfig");
        }
    }

    //see jquery plugin development guide for this:
    //http://docs.jquery.com/Plugins/Authoring
    $.fn.comIbiKpiBox = function (method) {
        // Method calling logic
        if (methods[method]) {
            return methods[method].apply(
                this,
                Array.prototype.slice.call(arguments, 1)
            );
        } else if (typeof method === "object" || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error("Method " + method + " does not exist on comIbiKpiBox");
        }
    }; //calling methods definition
})(jQuery);    