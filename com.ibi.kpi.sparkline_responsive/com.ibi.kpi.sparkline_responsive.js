/* Copyright 1996-2015 Information Builders, Inc. All rights reserved. */
/* $Revision: 1.4 $ */

(function () {

	var kpiSparkline = {

		//base64 encoded images of default indicators
		defaultImages: {
			defaultGreenUp: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAAAoCAYAAACM/rhtAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwA"
				+ "ADsQAAA7EAZUrDhsAAAGwSURBVFhH7ZS7SgNBGIXP7iYxAS+oKYKFoohlHkBURBs7K0FFH8RGsbTQ17AQBEFbIZ2NjWAjmDeIrTEmu55/MxvCGnVmB0RkPpjMf905O5Md"
				+ "GOKpOY3E+3NpP8HnGO2aegRq1kUWiLpmj0FipC7Hka4VX0Yn9jQY9JYm9PoXjlBpveCcZrUwgc2nY9zRFpFNjrRQbWwEJjsXUdx02MK9X8CkJGhHtDco8lbVtKVOcqbIUW"
				+ "Qh6RNxc50maok4gbbH2A1zK3RDCalhTJYm6Ul2rtJ5xWVQxEyc6YOxHHPXrFmkK7uXSWSmtyIhFx4J33AalFBVsU8wV2LNlRIpO5n8LbQxFZiXHy44Fb7jzB/CVhz9BtaM"
				+ "s/aCPct0RVwxTmhies2IuPmojRM/j326Wi/oBRhmz3p5DQ+NGuoMyW5qYSQwFhfhkAvuqJA2no8x9i6VV/FIkc8q/COmR7zredhTtjHsneV00PX0MBLYamBbmZnhM+SD0c"
				+ "boi/oKHv3AS5gXtfXzs14zv4YTaIsTaIsTaIsTaIsTaIsTaIsTaIsTaIsTaIsTaIsTaMufF+j45wAfcMBZG3jqCaIAAAAASUVORK5CYII="
			, defaultRedUp: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAAAoCAYAAACM/rhtAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADs"
				+ "QAAA7EAZUrDhsAAAGjSURBVFhH7Zc7TsNAEIbHQJyEIPFsAqIjlBT03ACJo9BwgHAEDgB3oEJcgxLoU/FoEoIFMv/EXmnjzMZrD69iP+nX7qyd+MusnShRmqbkQxRFPMRIwhOBJ"
				+ "eQT4RNXkBHygTjxubaXYC7H8ER6QXxGtNshOubilej2gugJ0xdEJVkqaMlJLCBNyO00mnQVv9MRLyYtuh+N6QSSzyjh6+y6TrBEbhFpQW4bcpdGzmBJchc5tSS5AyIlcny/tV1y"
				+ "TDym/eUWXZ8SraNc46XJAYF513IKzoHluHNdl5zBktxAyaKNyQEBl6QoOOcTecsZhE7ye4hI163awUpyBktyE+VqtuqHlyDfxJw6cgZLcitf8kJ8iout5nP6UdRJmnRTR86Gn27I"
				+ "Hp4TDfOlKYo+Vba4q5VjuJMYullVjihottTkL/H+LeYtxiB98jZyl01nOEDesukUg36aDqWntujjLegC4nsYHrJqhh5EHvN5Lap+zfw6QVBLENQSBLUEQS1BUEsQ1BIEtQRBLUFQS"
				+ "xDUEgS1fIfgAOk5wsdUqP+4/zT/fIuJvgBHoZAsUDdCRgAAAABJRU5ErkJggg=="
			, defaultGreenDown: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAAAoCAYAAACM/rhtAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAAD"
				+ "sQAAA7EAZUrDhsAAAG5SURBVFhH7Zi/TgJBEIeHQw5ITIzKA1iRWNsYLSTY8Ao+gY0vYIVUvoC1lVFjp5WWNlZWxMKQ4B8abaAyUfC48zfHaE4icnsTE2L2Sy67Mzu792X3gHBk+e"
				+ "+kpFVRrFIg3W80avr1HWknFiuoxQpqsYJarKAWK6jFCmqxglqsoBYrqMUKarGCWiZe0OiP9cIWdd15ciVMRK9Ntw97tCjhWIx2EHJX0k0M1jiWbixMj3g3COhe+sZg7gGaw0EUj7S"
				+ "0sWhfUqtQopvAo1LKoRlJxwJzTlJp2mnUqMnhIDseI0GQhWSzUKZr/50quOG05H/DQ+2+k6FtyLUQ8z39cCQGpm+fuJ4fi6BYpRW/S2dOlmbDkRGg5gg1m5B7QcjzY8sxSV6PsSBf"
				+ "PiRX+690kc5TPhwZAmN1jFUg94SQd46P9s8FGRYM50Jyrf8GyRxNcfwJco/IrUPuTlLGu8ckFWR4LkvxcZf9Hp077mA99NvoL8kzxzneudgfjCgaQYbn53B5kFzudegU/bo7RxuQe+"
				+ "YCIZFcEn76FWHJDK7odyrnvh6DIaJ1YzEqBrxbw3N4dzxpo4w6VoPdJPoA7sRnYF9BfPQAAAAASUVORK5CYII="
			, defaultRedDown: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAAAoCAYAAACM/rhtAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsQA"
				+ "AA7EAZUrDhsAAAGLSURBVFhH7ZjPLgRBEIerkbXWZXFyx9FruPEOPIBHsO4uHkXiDbyBI27CXLAkltlZMX5lWoyd6X9Tm5hDf0mlqzuTqS/Vk0m6VZ7n1Gbm9NhaxB0cKLWMYb2YVUg"
				+ "GeT7SeSNm0UGWuzaESdyb1m9xFJQSBaVEQSlRUEoUlBIFpURBKVFQShSUEgWlREEplYO7Ukpnv/AzlgP6EuKySCtsI96L9A/eB3ovQeaIaAMDH8ZnwSYEb3Ru5V+3mJtRjjpCBJOsS1"
				+ "c6b0y2SBcYkmLmxlvwmGj0ltKuRJLlJmM6CLlQCtriU6IHSO41kfyRO0H3bFs6Teg3+ALJx1DJshymabHqR0XQcV/4gXiG5NBXskaO31HBVLe2gw7JCWIIySeXpK+cDeMWOyQzhLWTJ"
				+ "bl7TPlnbZSz1XJeATs+5g6if0i02uvSWSelLV7UcvuQu8N0jPjk9Tqc9YWCzAJiBZJrfaIdXsA/5Bxyt0i509PwC7+LumozXpfonpI9xCuCXziPMG0pdz3zqUtE9AW9BrJWOPhi4wAAAABJRU5ErkJggg=="
			, defaultLine: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAAAoCAYAAACM/rhtAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAABdSUR"
				+ "BVFhH7dcxCgAxCABBcx8XX+416QJpFoLFThPLhTS6ujsm+/Y7loGUgZSBlIGUgZSBlIHUdR+sqifLYmauPR78YspAykBqfKB3MWUgZSBlIGUgZSBlIGUgE/EDjK0NRWVehfsAAAAASUVORK5CYII="
		},
		//gets the image url string
		//props = renderConfig.properties object
		//kpiValue = the value being visually displayed in the widget
		//compareValue = the value to compare kpiValue with
		//returns either base64 encoded string of an image or the image url from properties
		getIndicatorImage: function (props, kpiValue, compareValue) {

			var imageSrc = '';

			//greater than scenario
			if (kpiValue > compareValue) {
				if (props.indicatorConfiguration.greaterThanImageUrl == 'defaultGreenUp' || props.indicatorConfiguration.greaterThanImageUrl == 'defaultRedUp') {
					//if using default values, use the embedded images
					return props.indicatorConfiguration.greaterThanImageUrl == 'defaultGreenUp' ? kpiSparkline.defaultImages.defaultGreenUp : kpiSparkline.defaultImages.defaultRedUp;
				}
				else {
					//else use the url defined in the property
					return props.indicatorConfiguration.greaterThanImageUrl;
				}
			}

			if (kpiValue < compareValue) {
				if (props.indicatorConfiguration.lessThanImageUrl == 'defaultGreenDown' || props.indicatorConfiguration.lessThanImageUrl == 'defaultRedDown') {
					//if using default values, use the embedded images
					return props.indicatorConfiguration.lessThanImageUrl == 'defaultGreenDown' ? kpiSparkline.defaultImages.defaultGreenDown : kpiSparkline.defaultImages.defaultRedDown;
				}
				else {
					//else use the url defined in the property
					return props.indicatorConfiguration.lessThanImageUrl;
				}
			}

			if (kpiValue == compareValue) {
				if (props.indicatorConfiguration.equalImageUrl == 'defaultLine') {
					//if using default values, use the embedded images
					return kpiSparkline.defaultImages.defaultLine;
				}
				else {
					//else use the url defined in the property
					return props.indicatorConfiguration.equalImageUrl;
				}
			}

			return imageSrc;
		},

		//calculate mean
		//numberOfPoints (int) = number of points to use as part of the calculation
		//points (array of ints) = all the data points sorted in chronological order
		//returns: float = Mean of the last data point to the last data point minus numberOfPoints
		calculateMean: function (numberOfPoints, points) {

			//check to see if there is enougn data points in the points array that is required
			var hasEnoughPoints = numberOfPoints <= points.length;

			//stores the total sum of numberOfPoints
			var total = 0;

			if (hasEnoughPoints) {
				//if there are enough data points to use numberOfPoints
				//add up the last 'numberOfPoints'
				for (var i = 0; i < numberOfPoints; i++) {
					total = total + points[points.length - 1 - i];
				}

			}
			else {
				//if there are not enough data points to use numberOfPoints, take as many as there are available;
				for (var i = 0; i < points.length; i++) {
					total = total + points[i];
				}
			}

			//return the mean
			return total / numberOfPoints;
		},
		//returns the abbreviated number
		//number (float) = number to abbreviate
		//returns: string representation of abbreviated number
		abbreviateNumber: function (number) {
			var SI_POSTFIXES = ["", "k", "M", "B", "T", "P", "E"];
			var tier = Math.log10(Math.abs(number)) / 3 | 0;
			if (tier == 0)
				return number.toFixed(1).replace('.0', '');
			var postfix = SI_POSTFIXES[tier];
			var scale = Math.pow(10, tier * 3);
			var scaled = number / scale;
			var formatted = scaled.toFixed(1) + '';
			if (/\.0$/.test(formatted))
				formatted = formatted.substr(0, formatted.length - 2);
			return formatted.replace('.0', '') + postfix;
		},

		//transforms the data in renderConfig.data
		//to work with the KPI widget.
		//Specifically, it groups the data by the Group dimension, if applicable
		//renderConfig = moonbeam object
		//returns array of data in the structure
		//[
		// 	{
		// 		points: []
		// 		,total: number
		// 		, unitLabel: String
		// 		,
		// 	},
		//  ...
		// ]
		transformData: function (renderConfig) {
			var data = renderConfig.data;

			//stores the array of grouped data by the Group bucket
			var groups = [];

			//individual group to add to the groups array
			var group;

			//track the lastGroup added
			var lastGroup = '';

			//loop through each data point
			data.forEach(function (row, index) {
				if (typeof row.group === 'undefined') {

					//Group bucket is not set, so only the 1 group to deal with

					//init the only group
					if (groups.length == 0)
						groups.push({ total: 0, points: [], xAxisValues: [] });

					//store the measure
					groups[0].points.push(row.measure);
					//cumulative total
					groups[0].total += row.measure;

					//store the unit label if valid
					groups[0].unitLabel = row.unitLabel != undefined ? row.unitLabel : '';

					//store the x axis value
					groups[0].xAxisValues.push(row.xaxis);
				}
				else {

					//Group bucket is set so need to group the data
					//it is assumed the data set is sorted by Group, X Axis
					if (row.group != lastGroup) {
						//if data record has changed groups, so reset the group object
						total = 0;
						group = { group: row.group, total: 0, points: [], xAxisValues: [] };
						groups.push(group);
					}
					groups[groups.length - 1].points.push(row.measure);
					groups[groups.length - 1].total += row.measure;
					groups[groups.length - 1].unitLabel = row.unitLabel != undefined ? row.unitLabel : '';
					groups[groups.length - 1].xAxisValues.push(row.xaxis);
					lastGroup = row.group;
				}
			});

			return groups;
		},

		//main function to call to draw the chart
		//renderConfig = moonbeam object
		drawChart: function (renderConfig) {
			var chart = renderConfig.moonbeamInstance;
			var props = renderConfig.properties;
			var dataBucketObj = renderConfig.dataBuckets;
			var data = renderConfig.data;

			var container = renderConfig.container;

			var measureTitle = dataBucketObj == undefined || dataBucketObj.getBucket == undefined ? '' : dataBucketObj.getBucket('measure') == undefined || dataBucketObj.getBucket('measure').fields == undefined ? ' ' : dataBucketObj.getBucket('measure').fields[0].title;
			var axisTitle = dataBucketObj == undefined || dataBucketObj.getBucket == undefined ? '' : dataBucketObj.getBucket('xaxis') == undefined || dataBucketObj.getBucket('xaxis').fields == undefined ? ' ' : dataBucketObj.getBucket('xaxis').fields[0].title;


			var groups = kpiSparkline.transformData(renderConfig);
			var numberFormat = dataBucketObj == undefined || dataBucketObj.getBucket == undefined ? '' : dataBucketObj.getBucket('measure') == undefined || dataBucketObj.getBucket('measure').fields == undefined ? '' : dataBucketObj.getBucket('measure').fields[0].numberFormat;
			var fn_formatNumber = chart.formatNumber.bind(chart);

			var titleElement = $('foreignObject[class="title"]');

			var titleHeight = titleElement.length == 1 ? titleElement.height() + 5 : 0;

			$(container).closest('body').css('overflow', 'hidden');
			$(container).css('top', titleHeight + 'px').append('<div class="kpi-sparkline-responsive" style="font-size:' + props.generalStyle.fontSize + 'px;color:' + props.generalStyle.color + '; ' + props.generalStyle.extraCSS + '"></div>');

			var groupHeight = 0;
			if (groups.length > 1) {
				$(container).find('.kpi-sparkline-responsive').addClass('multi').append('<div class="kpi-sparkline-responsive-nav" style="' + props.generalStyle.navCSS + '"></div>');
			}

			groups.forEach(function (group, index) {

				if (typeof group.group !== 'undefined')
					$(container).find('.kpi-sparkline-responsive>.kpi-sparkline-responsive-nav').append('<a href="#" class="kpi-sparkline-responsive-nav-pill">' + group.group + '</a>');

				groupHeight = groups.length > 1 ? $('.kpi-sparkline-responsive').outerHeight() : 0;

				var rawNumber = kpiSparkline.getNumberToShow(group.points, props.aggregationType);

				var finalNumber = numberFormat == '' ? kpiSparkline.abbreviateNumber(rawNumber) : fn_formatNumber(rawNumber, numberFormat);

				var slide = [];

				slide.push('<div class="kpi-sparkline-responsive-slide"><table>');

				var dimensions = kpiSparkline.getAutoFitSparklineDimensions(chart.height, chart.width, group.points.length, props);

				//check to see if we need to add the Heading or the KPI Number:

				if (props.headingTitle.show || props.kpiTitle.show) {
					slide.push('<thead>'); //begin thead


					if (props.headingTitle.show) {
						slide.push('<tr>'); //begin title row
						slide.push('<th class="kpi-sparkline-responsive-heading-title" style="font-family:'
							+ props.headingTitle.fontFamily
							+ ';font-size:' + props.headingTitle.fontSize + 'px;color:'

							+ props.headingTitle.color + '; '
							+ ' text-align: ' + props.headingTitle.textAlign + '; '
							+ props.headingTitle.extraCSS

							+ '">' + measureTitle + '</th>');
						slide.push('</tr>'); //end title row
					}

					if (props.kpiTitle.show) {
						var indicatorHTML = [];
						if (props.indicatorConfiguration.show) {


							var compareNumber = kpiSparkline.calculateMean(props.indicatorConfiguration.pointsToCompare, group.points);

							indicatorHTML.push('<img  style="height: ' + props.indicatorConfiguration.size + 'px;" src="');
							indicatorHTML.push(kpiSparkline.getIndicatorImage(props, rawNumber, compareNumber));

							indicatorHTML.push('"/>');
						}

						slide.push('<tr>'); //begin kpi row
						slide.push('<th class="kpi-sparkline-responsive-heading-nbr" style="font-family:' + props.kpiTitle.fontFamily
							+ ';font-size:' + props.kpiTitle.fontSize + 'px;color:' + props.kpiTitle.color + '; '
							+ ' text-align: ' + props.headingTitle.textAlign + '; '
							+ props.kpiTitle.extraCSS + '">' + finalNumber + indicatorHTML.join('') + '</th>');
						slide.push('</tr>'); //end kpi row

						if (props.unitLabelTitle.show) {
							slide.push('<tr>'); //begin unit label row
							slide.push('<th class="kpi-sparkline-responsive-heading-nbr" style="font-family:' + props.unitLabelTitle.fontFamily
								+ ';font-size:' + props.unitLabelTitle.fontSize + 'px;color:' + props.unitLabelTitle.color + '; '
								+ ' text-align: ' + props.headingTitle.textAlign + '; '
								+ props.unitLabelTitle.extraCSS + '">' + group.unitLabel + '</th>');
							slide.push('</tr>'); //end unit label row
						}
					}

					slide.push('</thead>'); //end thead
				}
				slide.push('<tbody><tr><td colspan="2"><div class="kpi-sparkline-responsive-sparkline" style="width: '
					+ (chart.width - 2 * props.generalStyle.margin) + 'px; overflow: auto; margin-left: '
					+ props.generalStyle.margin + 'px; height: ' + (dimensions.chartContainerHeight - groupHeight) + 'px; direction: rtl;"></div></td></tr></tbody>');

				slide.push('</table></div>');

				$(container).find('.kpi-sparkline-responsive').append(slide.join(''));

				if (props.xAxisTitle.show) {
					var xAxisTitleHTML = '<div style="font-family:' + props.xAxisTitle.fontFamily
						+ ';font-size:' + props.xAxisTitle.fontSize + 'px;color:' + props.xAxisTitle.color + '; '
						+ ' text-align: ' + props.headingTitle.textAlign + '; '
						+ props.xAxisTitle.extraCSS + '"><span>' + axisTitle + '</span></div>';
					$(container).find('.kpi-sparkline-responsive-slide:last').append(xAxisTitleHTML);
				}


				//init and draw sparkline chart

				var chartProperties;
				var seriesColor = props.sparklineConfiguration.bar.goodColor;

				chartProperties = {
					type: props.sparklineConfiguration.chartType
					, height: dimensions.chartHeight - groupHeight
					, barColor: seriesColor
					, barSpacing: dimensions.barSpacing,
					width: dimensions.chartWidth
					, barWidth: dimensions.barWidth
					, tooltipFormatter: function (sp, options, fields) {
						if (Array.isArray(fields))
							fields = fields[0];
						if (fields == undefined)
							return '';
						var value = props.sparklineConfiguration.chartType == 'bar' ? fields.value : fields.y;
						var result = numberFormat == '' ? kpiSparkline.abbreviateNumber(value) : fn_formatNumber(value, numberFormat);
						return axisTitle + ":" + group.xAxisValues[fields.offset] + "<br/>" + measureTitle + ": " + result;
					},
					lineColor: props.sparklineConfiguration.line.lineColor
					, fillColor: props.sparklineConfiguration.line.fillColor
				};
				if (props.sparklineConfiguration.show)
					$(container).find('.kpi-sparkline-responsive-slide:last .kpi-sparkline-responsive-sparkline').sparkline(group.points, chartProperties);
			});

			$(container).find('.kpi-sparkline-responsive-nav-pill:first,.kpi-sparkline-responsive-slide:first').addClass('active');

			$(container).find('.kpi-sparkline-responsive-nav-pill').on('touchstart click', function (e) {
				e.stopPropagation();
				e.preventDefault();

				var activeIndex = $(this).parent().children('.active').index();
				var index = $(this).index();
				var prevIndex = index == 0 ? $(this).parent().children().length : index - 1;
				var nextIndex = index == $(this).parent().children().length ? 0 : index + 1;

				$(this).addClass('active').siblings().removeClass('active');

				var $container = $(this).closest('.kpi-sparkline-responsive');
				if (activeIndex < index) {
					$container.find('.kpi-sparkline-responsive-slide:eq(' + activeIndex + ')').animate({ left: '-200%' }, function () { $(this).removeClass('active') });
					$container.find('.kpi-sparkline-responsive-slide:eq(' + index + ')').css('left', '200%').addClass('active').animate({ left: '0' });
				}
				else if (activeIndex > index) {
					$container.find('.kpi-sparkline-responsive-slide:eq(' + activeIndex + ')').animate({ left: '200%' }, function () { $(this).removeClass('active') });
					$container.find('.kpi-sparkline-responsive-slide:eq(' + index + ')').css('left', '-200%').addClass('active').animate({ left: '0' });
				}
			});
		},
		getAutoFitSparklineDimensions: function (containerHeight, containerWidth, numOfDataPoints, props) {
			var margin = props.generalStyle.margin;
			var dimensions = {
				barWidth: 1
				, barSpacing: props.sparklineConfiguration.bar.barSpacing
				, chartWidth: containerWidth
				, chartHeight: containerHeight
				, chartContainerHeight: containerHeight
				, hasScrollbar: false
			}

			//elements that take up height: headingTitle or headingData (they are on the same 'row'), headingSubtitle, margin top, margin bottom
			//elements that take up width: margin-left, margin-right

			//going to pad any text driven heights with a +4 px as spacing occurs in table rows
			var headingTitleHeight = parseInt(props.headingTitle.fontSize);
			var kpiTitleHeight = parseInt(props.kpiTitle.fontSize);
			var unitLabelHeight = parseInt(props.unitLabelTitle.fontSize);
			var axisLabelHeight = parseInt(props.xAxisTitle.fontSize);

			var elementHeights = headingTitleHeight + kpiTitleHeight + unitLabelHeight + axisLabelHeight + margin;

			dimensions.chartHeight = containerHeight - elementHeights - 10;

			dimensions.chartWidth = containerWidth - (4) - margin * 2;
			dimensions.chartContainerHeight = dimensions.chartHeight;
			if (props.sparklineConfiguration.chartType == 'bar') {
				//calculate what the bar width could be. if the barWidth is less than 1, then we know we can't really draw it with autoFit

				var barWidth = Math.floor(dimensions.chartWidth / numOfDataPoints);

				if (barWidth == 0) {
					dimensions.barWidth = 1;
					dimensions.barSpacing = 1;
					dimensions.hasScrollbar = true;

					dimensions.chartHeight = dimensions.chartHeight - 20;
					dimensions.chartContainerHeight = dimensions.chartHeight + 20;
				}
				else {
					//calculate the bar spacing with barSpacing = 1;

					if (barWidth == 1) {
						dimensions.barSpacing = 0;
						dimensions.barWidth = barWidth;
					}
					else {
						//possibly put some more smart math here later
						dimensions.barSpacing = 1;
						dimensions.barWidth = barWidth - 1;
					}
				}

			}

			return dimensions;
		},
		getNumberToShow: function (dataArray, aggregationType) {
			var finalNumber = null;

			switch (aggregationType) {
				case "First":
					return dataArray[0];

				case "Sum":
					var total = 0;
					for (var i = 0; i < dataArray.length; i++) {
						total += dataArray[i];
					}

					return total;
				case "Avg":
					var total = 0;
					for (var i = 0; i < dataArray.length; i++) {
						total += dataArray[i];
					}

					return total / dataArray.length;
				case "Min":
					var min = null;
					for (var i = 0; i < dataArray.length; i++) {
						if (min == null) {
							min = dataArray[i];
						}
						if (dataArray[i] < min) {
							min = dataArray[i];
						};
					}

					return min;
				case "Max":
					var max = null;
					for (var i = 0; i < dataArray.length; i++) {
						if (max == null) {
							max = dataArray[i];
						}
						if (dataArray[i] > max) {
							max = dataArray[i];
						}
					}

					return max;
				case "Last":
				default:
					return dataArray[dataArray.length - 1];

			}
		}
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
		if (typeof renderConfig.data[0].measure !== 'undefined' && typeof renderConfig.data[0].xaxis !== 'undefined') {
			kpiSparkline.drawChart(renderConfig);
		}
		renderConfig.renderComplete();
	}

	function noDataRenderCallback(renderConfig) {
		var container = renderConfig.container;

		renderConfig.data = [{ "group": "2017", "xaxis": "1", "measure": 35861466.38, "_s": 0, "_g": 0 }, { "group": "2017", "xaxis": "2", "measure": 32447335.21, "_s": 0, "_g": 1 }, { "group": "2017", "xaxis": "3", "measure": 35431268.47, "_s": 0, "_g": 2 }, { "group": "2017", "xaxis": "4", "measure": 32401840.77, "_s": 0, "_g": 3 }, { "group": "2017", "xaxis": "5", "measure": 33927910.25, "_s": 0, "_g": 4 }, { "group": "2017", "xaxis": "6", "measure": 32732103.34, "_s": 0, "_g": 5 }, { "group": "2017", "xaxis": "7", "measure": 33867267.96, "_s": 0, "_g": 6 }, { "group": "2017", "xaxis": "8", "measure": 34030687.74, "_s": 0, "_g": 7 }, { "group": "2017", "xaxis": "9", "measure": 33129035.69, "_s": 0, "_g": 8 }, { "group": "2017", "xaxis": "10", "measure": 41468698.51, "_s": 0, "_g": 9 }, { "group": "2017", "xaxis": "11", "measure": 41330631.98, "_s": 0, "_g": 10 }, { "group": "2017", "xaxis": "12", "measure": 45063421.35, "_s": 0, "_g": 11 }, { "group": "2016", "xaxis": "1", "measure": 22177047.24, "_s": 0, "_g": 12 }, { "group": "2016", "xaxis": "2", "measure": 20713191.81, "_s": 0, "_g": 13 }, { "group": "2016", "xaxis": "3", "measure": 22452940.04, "_s": 0, "_g": 14 }, { "group": "2016", "xaxis": "4", "measure": 20640310.85, "_s": 0, "_g": 15 }, { "group": "2016", "xaxis": "5", "measure": 20959571.54, "_s": 0, "_g": 16 }, { "group": "2016", "xaxis": "6", "measure": 20936944.44, "_s": 0, "_g": 17 }, { "group": "2016", "xaxis": "7", "measure": 21603354.91, "_s": 0, "_g": 18 }, { "group": "2016", "xaxis": "8", "measure": 21851731.9, "_s": 0, "_g": 19 }, { "group": "2016", "xaxis": "9", "measure": 21194759.49, "_s": 0, "_g": 20 }, { "group": "2016", "xaxis": "10", "measure": 25734517.06, "_s": 0, "_g": 21 }, { "group": "2016", "xaxis": "11", "measure": 25549323.64, "_s": 0, "_g": 22 }, { "group": "2016", "xaxis": "12", "measure": 26292085.01, "_s": 0, "_g": 23 }, { "group": "2015", "xaxis": "1", "measure": 10194919.22, "_s": 0, "_g": 24 }, { "group": "2015", "xaxis": "2", "measure": 9271678.03, "_s": 0, "_g": 25 }, { "group": "2015", "xaxis": "3", "measure": 10166669.36, "_s": 0, "_g": 26 }, { "group": "2015", "xaxis": "4", "measure": 9176805.13, "_s": 0, "_g": 27 }, { "group": "2015", "xaxis": "5", "measure": 9644014.21, "_s": 0, "_g": 28 }, { "group": "2015", "xaxis": "6", "measure": 9270650.48, "_s": 0, "_g": 29 }, { "group": "2015", "xaxis": "7", "measure": 9823910.8, "_s": 0, "_g": 30 }, { "group": "2015", "xaxis": "8", "measure": 10039632.37, "_s": 0, "_g": 31 }, { "group": "2015", "xaxis": "9", "measure": 9763960.06, "_s": 0, "_g": 32 }, { "group": "2015", "xaxis": "10", "measure": 11932626.45, "_s": 0, "_g": 33 }, { "group": "2015", "xaxis": "11", "measure": 11606727.04, "_s": 0, "_g": 34 }, { "group": "2015", "xaxis": "12", "measure": 12572846.65, "_s": 0, "_g": 35 }, { "group": "2014", "xaxis": "1", "measure": 7298667.22, "_s": 0, "_g": 36 }, { "group": "2014", "xaxis": "2", "measure": 6801359.08, "_s": 0, "_g": 37 }, { "group": "2014", "xaxis": "3", "measure": 7263788.97, "_s": 0, "_g": 38 }, { "group": "2014", "xaxis": "4", "measure": 6611436.62, "_s": 0, "_g": 39 }, { "group": "2014", "xaxis": "5", "measure": 6795189.18, "_s": 0, "_g": 40 }, { "group": "2014", "xaxis": "6", "measure": 6618896, "_s": 0, "_g": 41 }, { "group": "2014", "xaxis": "7", "measure": 6987826.48, "_s": 0, "_g": 42 }, { "group": "2014", "xaxis": "8", "measure": 7024899.82, "_s": 0, "_g": 43 }, { "group": "2014", "xaxis": "9", "measure": 6679889.03, "_s": 0, "_g": 44 }, { "group": "2014", "xaxis": "10", "measure": 8281929.67, "_s": 0, "_g": 45 }, { "group": "2014", "xaxis": "11", "measure": 8037545.37, "_s": 0, "_g": 46 }, { "group": "2014", "xaxis": "12", "measure": 8427240.8, "_s": 0, "_g": 47 }, { "group": "2013", "xaxis": "1", "measure": 4666392.2, "_s": 0, "_g": 48 }, { "group": "2013", "xaxis": "2", "measure": 4400576.8, "_s": 0, "_g": 49 }, { "group": "2013", "xaxis": "3", "measure": 4726378.34, "_s": 0, "_g": 50 }, { "group": "2013", "xaxis": "4", "measure": 4254925.17, "_s": 0, "_g": 51 }, { "group": "2013", "xaxis": "5", "measure": 4412965.72, "_s": 0, "_g": 52 }, { "group": "2013", "xaxis": "6", "measure": 4656829.9, "_s": 0, "_g": 53 }, { "group": "2013", "xaxis": "7", "measure": 4884691.35, "_s": 0, "_g": 54 }, { "group": "2013", "xaxis": "8", "measure": 4957273.31, "_s": 0, "_g": 55 }, { "group": "2013", "xaxis": "9", "measure": 4856841.92, "_s": 0, "_g": 56 }, { "group": "2013", "xaxis": "10", "measure": 5597174.49, "_s": 0, "_g": 57 }, { "group": "2013", "xaxis": "11", "measure": 5583364.73, "_s": 0, "_g": 58 }, { "group": "2013", "xaxis": "12", "measure": 5815484.48, "_s": 0, "_g": 59 }, { "group": "2012", "xaxis": "1", "measure": 3874651.96, "_s": 0, "_g": 60 }, { "group": "2012", "xaxis": "2", "measure": 3592608.63, "_s": 0, "_g": 61 }, { "group": "2012", "xaxis": "3", "measure": 3977546.75, "_s": 0, "_g": 62 }, { "group": "2012", "xaxis": "4", "measure": 3648111.77, "_s": 0, "_g": 63 }, { "group": "2012", "xaxis": "5", "measure": 3704586.77, "_s": 0, "_g": 64 }, { "group": "2012", "xaxis": "6", "measure": 3694435.21, "_s": 0, "_g": 65 }, { "group": "2012", "xaxis": "7", "measure": 4020855.35, "_s": 0, "_g": 66 }, { "group": "2012", "xaxis": "8", "measure": 4126310.8, "_s": 0, "_g": 67 }, { "group": "2012", "xaxis": "9", "measure": 3688054.34, "_s": 0, "_g": 68 }, { "group": "2012", "xaxis": "10", "measure": 4794720.4, "_s": 0, "_g": 69 }, { "group": "2012", "xaxis": "11", "measure": 4574636.32, "_s": 0, "_g": 70 }, { "group": "2012", "xaxis": "12", "measure": 5001973.63, "_s": 0, "_g": 71 }];
		renderConfig.dataBuckets = { "buckets": { "group": { "title": "Sale Year", "count": 1 }, "xaxis": { "title": "Sale Month", "count": 1 }, "measure": { "title": "Revenue", "count": 1 } }, "depth": 1 };
		renderCallback(renderConfig);

		$(container).append('<div class="kpi-sparkline-responsive-placeholder">Add a field to the X-Axis and Key Measure buckets.</div>');
	}

	// Your extension's configuration
	var jqueryPath;
	if (!window.jQuery) {
		var path = tdgchart.getScriptPath();
		jqueryPath = path.substr(0, path.indexOf('tdg')) + 'jquery/js/jquery.js';
	}

	var config = {
		id: 'com.ibi.kpi.sparkline_responsive',     // string that uniquely identifies this extension
		containerType: 'html',  // either 'html' or 'svg' (default)
		renderCallback: renderCallback,  // reference to a function that will draw the actual chart.  Will be passed one 'renderConfig' object, defined below
		noDataPreRenderCallback: noDataPreRenderCallback,
		noDataRenderCallback: noDataRenderCallback,
		resources: {
			script:
				window.jQuery
					? ['lib/jquery.sparkline.min.js']
					: [
						jqueryPath,
						'lib/jquery.sparkline.min.js'
					],
			css: ['css/sparkline.css']
		},
		modules: {
			dataSelection: {
				supported: true,  // Set this true if your extension wants to enable data selection
				needSVGEventPanel: true, // if you're using an HTML container or altering the SVG container, set this to true and the chart engine will insert the necessary SVG elements to capture user interactions
				svgNode: function (arg) { }  // if you're using an HTML container or altering the SVG container, return a reference to your root SVG node here.
			},
			eventHandler: {
				supported: true
			}
		}
	};

	// Required: this call will register your extension with the chart engine
	tdgchart.extensionManager.register(config);
}());
