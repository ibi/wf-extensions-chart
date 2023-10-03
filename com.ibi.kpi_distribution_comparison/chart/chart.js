(function () {
    //Set the Global IBI Variable if not exists
    if (typeof window.comIbiKpiDistributionComparisonChartExtension == 'undefined') {
        window.comIbiKpiDistributionComparisonChartExtension = {};
    }

    window.comIbiKpiDistributionComparisonChartExtension = {
        draw: _draw,
    };

    function _draw(ib3SLI, isDummyData) {
        $ib3.checkObject(ib3SLI);

        ib3SLI.config.checkServiceIsInitinalized();

        //Declare main extension vars
        var data = ib3SLI.config.getData(),
            mainContainer = ib3SLI.config.getContainer(),
            chart = ib3SLI.config.getChart(),
            width = ib3SLI.config.getChartWidth(),
            height = ib3SLI.config.getChartHeight(),
            properties = ib3SLI.config.getCustomProperties();

        var valueispercentage = ib3SLI.config.getProperty('valueispercentage'),
            minvalue = ib3SLI.config.getProperty('ticks.minvalue.value'),
            minvalueColor = ib3SLI.config.getProperty('ticks.minvalue.color'),
            minvalueWeight = ib3SLI.config.getProperty('ticks.minvalue.weight'),
            maxvalue = ib3SLI.config.getProperty('ticks.maxvalue.value'),
            maxvalueColor = ib3SLI.config.getProperty('ticks.maxvalue.color'),
            maxvalueWeight = ib3SLI.config.getProperty('ticks.maxvalue.weight'),
            //			value_minColor = isDummyData ? 'grey': ib3SLI.config.getProperty('value_colors.minColor'),
            //			value_maxColor = isDummyData ? '#5a5a5a': ib3SLI.config.getProperty('value_colors.maxColor'),
            // parche para los no actualizados
            value_minColor = ib3SLI.config.getProperty('value_colors.minColor') || 'yelow',
            value_minColor = ib3SLI.config.getProperty('value_color') || value_minColor,
            value_maxColor = value_minColor,
            //			comparison_minColor = isDummyData ? 'grey': ib3SLI.config.getProperty('comparison_colors.minColor'),
            //			comparison_maxColor = isDummyData ? '#5a5a5a': ib3SLI.config.getProperty('comparison_colors.maxColor'),
            comparison_minColor = ib3SLI.config.getProperty('comparison_colors.minColor') || 'blue',
            comparison_minColor = ib3SLI.config.getProperty('comparison_color') || comparison_minColor,
            comparison_maxColor = comparison_minColor,
            textColor = isDummyData ? 'grey' : ib3SLI.config.getProperty('titlesColor'),
            marginTop = parseFloat(ib3SLI.config.getProperty('sizes.marginTop')),
            rowHeight = parseFloat(ib3SLI.config.getProperty('sizes.rowHeight')),
            barHeight = parseFloat(ib3SLI.config.getProperty('sizes.barHeight')),
            animationSeconds = 500,
            fontSize = ib3SLI.config.getProperty('sizes.titlesFont') + 'px',
            showPercentagesOfTheTotal = ib3SLI.config.getProperty('options.showPercentagesOfTheTotal'),
            showValue = ib3SLI.config.getProperty('options.showValue'),
            showBucket = ib3SLI.config.getProperty('options.showBucket'),
            shortenValue = ib3SLI.config.getProperty('options.shortenValue'),
            typeShortenNumber = ib3SLI.config.getProperty('options.typeShortenNumber'),
            forceSortRows = ib3SLI.config.getProperty('options.forceSortRows'),
            showBarIcons = ib3SLI.config.getProperty('options.showBarIcons'),
            barIconWidth = ib3SLI.config.getProperty('sizes.barIconWidth'),
            bodyBackgroundColor = ib3SLI.config.getProperty('bodyBackgroundColor') || 'transparent',
            barWidth = barIconWidth ? width - barIconWidth - 10 : width - 10;

        d3.select('body').style('background-color', bodyBackgroundColor);

        d3.select('rect.eventCatcher').style('fill', bodyBackgroundColor);

        var container = d3.select(mainContainer).attr('class', 'extension_container').append('g');

        var defaultMin = 0,
            auxMax = 0,
            maxDataValues = $(data)
                .map(function (i, d) {
                    var maxdata = d.value;
                    if (d.comparison) {
                        if (d.comparison > maxdata) {
                            maxdata = d.comparison;
                        }
                    }
                    if (d.minpoint) {
                        if (d.minpoint > maxdata) {
                            maxdata = d.minpoint;
                        }
                    }
                    if (d.maxpoint) {
                        if (d.maxpoint > maxdata) {
                            maxdata = d.maxpoint;
                        }
                    }
                    return maxdata;
                })
                .get(),
            /*
			defaultMax = !valueispercentage ? maxDataValues.reduce(function(total, elem) {
				if (elem > auxMax){
					auxMax = elem;
				}
				return auxMax;
//				return total + elem;
			}, 0) : 100;
*/
            defaultMax = !valueispercentage
                ? d3.max(maxDataValues, function (d) {
                      return d;
                  })
                : 100;

        var valueColorDefaultScale = d3.scaleLinear().domain([0, defaultMax]).range([value_minColor, value_maxColor]),
            comparisonColorDefaultScale = d3.scaleLinear().domain([0, defaultMax]).range([comparison_minColor, comparison_maxColor]);

        var widthDefaultScale = d3.scaleLinear().domain([0, defaultMax]).range([0, barWidth]);

        data = $(data).map(function (i, d) {
            //change for control drill index
            d.originalIndex = i;

            //bar width
            var widthScale = widthDefaultScale,
                valueColorScale = valueColorDefaultScale,
                comparisonColorScale = comparisonColorDefaultScale,
                minValue = minvalue ? minvalue : 0,
                maxValue = maxvalue ? maxvalue : defaultMax;

            if (minvalue || maxvalue) {
                widthScale = d3.scaleLinear().domain([minValue, maxValue]).range([0, barWidth]).nice();

                valueColorScale = d3.scaleLinear().domain([minValue, maxValue]).range([value_minColor, value_maxColor]).nice();

                comparisonColorScale = d3.scaleLinear().domain([minValue, maxValue]).range([comparison_minColor, comparison_maxColor]).nice();
            }

            var value = d.value,
                comparison = d.comparison,
                minpoint = d.minpoint,
                maxpoint = d.maxpoint;

            if (valueispercentage) {
                var range = maxValue - minValue;
                value = (range * d.value) / 100 + minValue;
                comparison = (range * d.comparison) / 100 + minValue;
            }
            d.barWidth = widthScale(value);
            d.barComparisonWidth = widthScale(comparison);
            d.barMinWidth = widthScale(minpoint);
            d.barMaxWidth = widthScale(maxpoint);
            d.barValueColor = valueColorScale(value);
            d.barComparisonColor = comparisonColorScale(comparison);

            //bar icon
            if (showBarIcons) {
                var image = ''; //'data:image/png;base64,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';
                if (typeof d.image !== 'undefined' && d.image != '.') {
                    image = _getImagePath(d.image);
                }
                d.imageUrl = image;
            }

            return d;
        });

        if (forceSortRows) {
            data = $(data)
                .sort(function (a, b) {
                    return b.barWidth - a.barWidth;
                })
                .get();
        }

        var groups = container
            .selectAll('g')
            .data(data)
            .enter()
            .append('g')
            .each(function (d, i) {
                ib3SLI.config.setUpTooltip(this, 0, d.originalIndex, d);
            })
            .attr('class', function (d, i) {
                var drillClass = ib3SLI.config.getDrillClass('riser', 0, d.originalIndex);
                return drillClass;
            });

        var valueFormat = ib3SLI.config.getFormatByBucketName('value', 0),
            total = $(data)
                .filter(function (i, d) {
                    return !valueispercentage;
                })
                .map(function (i, d) {
                    return d.value;
                })
                .get()
                .reduce(function (a, b) {
                    return a + b;
                }, 0);

        var xOrigin = 25;

        if (showBarIcons) {
            xOrigin = parseInt(barIconWidth) + 3;
            var imageElem = groups
                .append('svg:image')
                .attr('y', function (d, i) {
                    return i * rowHeight;
                })
                .filter(function (d) {
                    return d.imageUrl && d.imageUrl != '.' ? true : false;
                })
                .attr('class', 'image-container')
                .attr('width', barIconWidth)
                .attr('height', rowHeight)
                .attr('xlink:href', function (d, i) {
                    return d.imageUrl && d.imageUrl != '.' ? d.imageUrl : '#';
                })
                .attr('x', 0);
        }

        if (showPercentagesOfTheTotal) {
            groups
                .append('text')
                .attr('class', 'percentage')
                .attr('fill', textColor)
                .attr('alignment-baseline', 'central')
                .attr('font-size', fontSize)
                .attr('width', 50)
                .attr('x', xOrigin)
                .attr('y', function (d, i) {
                    return i * rowHeight + marginTop;
                })
                .text(function (d) {
                    var percentageFormatted = '';

                    if (valueispercentage) {
                        percentageFormatted = d.value.toFixed(2) + '%';
                    } else {
                        var percentage = (d.value / total) * 100;
                        percentageFormatted = percentage.toFixed(2) + '%';
                    }

                    return percentageFormatted;
                });
        }
        groups
            .append('text')
            .attr('class', 'title')
            .attr('fill', textColor)
            .attr('alignment-baseline', 'central')
            .attr('font-size', fontSize)
            .attr('y', function (d, i) {
                return i * rowHeight + marginTop;
            })
            .attr('x', (showPercentagesOfTheTotal ? 68 : 0) + xOrigin)
            .text(function (d) {
                var number = '',
                    bucket = showBucket == null ? 'value' : showBucket;

                if (showValue) {
                    if (valueispercentage) {
                        number = ' | ' + d[bucket].toFixed(2) + '%';
                    } else {
                        number = ' | ' + $ib3.utils.getFormattedNumber(ib3SLI.config.formatNumber, d[bucket], valueFormat, shortenValue, typeShortenNumber);
                    }
                }

                return (showPercentagesOfTheTotal ? '| ' : '') + d.dimension + '   ' + number;
            });

        groups
            .append('rect')
            .attr('class', 'bg-rect')
            .attr('fill', '#d1d1d1')
            .attr('height', barHeight)
            .attr('width', barWidth)
            .attr('y', function (d, i) {
                return i * rowHeight + rowHeight / 4 + marginTop;
            })
            .attr('x', xOrigin);

        if (ib3SLI.config.getBucket('value')) {
            var progress = groups
                .append('rect')
                .attr('class', 'progress-rect')
                .attr('fill', 'gray')
                .attr('height', barHeight)
                .attr('width', 0)
                .attr('y', function (d, i) {
                    return i * rowHeight + rowHeight / 4 + marginTop;
                })
                .attr('x', xOrigin);

            progress
                .transition()
                .duration(animationSeconds)
                .attr('width', function (d) {
                    return d.barWidth;
                })
                .attr('fill', function (d) {
                    return d.barValueColor;
                });
        }

        if (ib3SLI.config.getBucket('comparison')) {
            var progress2 = groups
                .append('rect')
                .attr('class', 'progress2-rect')
                .attr('fill', 'gray')
                .attr('height', barHeight / 2)
                .attr('width', 0)
                .attr('y', function (d, i) {
                    return i * rowHeight + rowHeight / 4 + marginTop + barHeight / 4;
                })
                .attr('x', xOrigin);

            progress2
                .transition()
                .duration(animationSeconds)
                .attr('width', function (d) {
                    return d.barComparisonWidth;
                })
                .attr('fill', function (d) {
                    return d.barComparisonColor;
                });
        }

        if (ib3SLI.config.getBucket('minpoint')) {
            var pointMin = groups
                .append('rect')
                .attr('class', 'point-min')
                .attr('fill', minvalueColor)
                .attr('height', barHeight + barHeight / 4)
                .attr('width', minvalueWeight)
                .attr('y', function (d, i) {
                    return i * rowHeight + rowHeight / 4 + marginTop - barHeight / 8;
                })
                .attr('x', function (d) {
                    return xOrigin + d.barMinWidth - minvalueWeight / 2;
                });
        }

        if (ib3SLI.config.getBucket('maxpoint')) {
            var pointMax = groups
                .append('rect')
                .attr('class', 'point-max')
                .attr('fill', maxvalueColor)
                .attr('height', barHeight + barHeight / 4)
                .attr('width', maxvalueWeight)
                .attr('y', function (d, i) {
                    return i * rowHeight + rowHeight / 4 + marginTop - barHeight / 8;
                })
                .attr('x', function (d) {
                    return xOrigin + d.barMaxWidth - maxvalueWeight / 2;
                });
        }
        /*
		var legend = groups.append('text')
			.attr('fill','black')
			.attr('y', (rowHeight * data.length) + 20)
			.attr('x', function(d, i) {
				return width / 4 * i;
			})
			.text(function(d){
				console.log(d)
				return d.dimension;
			});
*/
        var buckets = new Array(),
            legendPadding = 30,
            legendWidth = width - legendPadding,
            legendMaxNumLines = 1,
            legendMaxNumCols = 4,
            legendRectWidth = 10,
            text_widths,
            max_width = 0,
            aux_width = 0;

        if (ib3SLI.config.getBucket('value')) buckets.push({ title: ib3SLI.config.getBucketTitle('value'), color: value_minColor });
        if (ib3SLI.config.getBucket('comparison')) buckets.push({ title: ib3SLI.config.getBucketTitle('comparison'), color: comparison_minColor });
        if (ib3SLI.config.getBucket('minpoint')) buckets.push({ title: ib3SLI.config.getBucketTitle('minpoint'), color: minvalueColor });
        if (ib3SLI.config.getBucket('maxpoint')) buckets.push({ title: ib3SLI.config.getBucketTitle('maxpoint'), color: maxvalueColor });

        if (buckets.length > 1) {
            // Calculate the biggest description width
            text_widths = d3.select('svg g').append('text');
            for (var i = 0; i < buckets.length; i++) {
                text_widths.text(buckets[i].title);
                aux_width = text_widths.node().getBBox().width;
                if (aux_width > max_width) {
                    max_width = aux_width;
                }
            }
            text_widths.remove();
            legendMinWidth = max_width + legendRectWidth + 5;
            // Calculate the rows and cols distribution
            if (legendMinWidth > 0) {
                if (legendMinWidth * 4 <= legendWidth) {
                    legendMaxNumLines = 1;
                    legendMaxNumCols = 4;
                } else if (legendMinWidth * 2 <= legendWidth) {
                    legendMaxNumLines = 2;
                    legendMaxNumCols = 2;
                } else {
                    legendMaxNumLines = 4;
                    legendMaxNumCols = 1;
                }
            }
            // legend group
            var legendGroup = container.selectAll('g.legend').data(buckets).enter().append('g').attr('class', 'legend');
            // legend rect
            var legendsRects = legendGroup
                .append('rect')
                .attr('width', legendRectWidth)
                .attr('height', legendRectWidth)
                .attr('y', function (d, i) {
                    return rowHeight * data.length + 5 + getLegendYMargin(i, legendMaxNumLines);
                })
                .attr('x', function (d, i) {
                    return legendPadding / 2 + getLegendindexXMargin(i, legendMaxNumCols);
                })
                .attr('fill', function (d) {
                    return d.color;
                });
            // legend text
            var legends = legendGroup
                .append('text')
                .attr('y', function (d, i) {
                    return rowHeight * data.length + 5 + legendRectWidth / 2 + getLegendYMargin(i, legendMaxNumLines);
                })
                .attr('x', function (d, i) {
                    return legendPadding / 2 + legendRectWidth + 5 + getLegendindexXMargin(i, legendMaxNumCols);
                })
                .attr('dominant-baseline', 'middle')
                .attr('fill', 'black')
                .text(function (d) {
                    return d.title;
                });
        }

        $ib3.utils.createScrolling(d3.select('svg > rect').node(), d3.select(mainContainer), d3.select('svg > rect'), d3.select('svg'));

        function _getImagePath(customImage) {
            var imagePath = '',
                wfPath = typeof WFInstallOption_CGIPath == 'undefined' ? ib3SLI.config.getProperty('ibiAppsPath') : WFInstallOption_CGIPath;

            wfPath = $.trim(wfPath);
            wfPath = wfPath.substring(wfPath.length - 1) == '/' ? wfPath : wfPath + '/';

            customImage = $.trim(customImage);

            if (customImage.substring(0, 4) != 'IBFS') {
                if (customImage.substring(0, 4) == 'http' || customImage.substring(0, 10) == 'data:image' || customImage.substring(0, 2) == '\\') {
                    imagePath = customImage;
                } else if (customImage.substring(0, 1) == '/') {
                    imagePath = wfPath + customImage.substring(1);
                } else {
                    imagePath = wfPath + customImage;
                }
            } else {
                imagePath = wfPath + 'run.bip?BIP_REQUEST_TYPE=BIP_LAUNCH' + '&BIP_folder=' + customImage.substring(0, customImage.lastIndexOf('/')) + '&BIP_item=' + customImage.substring(customImage.lastIndexOf('/') + 1);
            }

            return imagePath;
        }

        function getLegendYMargin(i, legendMaxNumLines) {
            var newLinesMargin = 15,
                rowIndex = 0;
            if (legendMaxNumLines == 2) {
                rowIndex = Math.trunc(i / 2);
            } else if (legendMaxNumLines == 4) {
                rowIndex = i;
            }
            return rowIndex * newLinesMargin;
        }
        function getLegendindexXMargin(i, legendMaxNumCols) {
            var colIndex = 0;
            if (legendMaxNumCols == 2) {
                colIndex = i % 2;
            } else if (legendMaxNumCols == 4) {
                colIndex = i;
            }
            return (legendWidth / legendMaxNumCols) * colIndex;
        }
    }
})();
