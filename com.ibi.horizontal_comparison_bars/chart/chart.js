(function() {

  //Set the Global IBI Variable if not exists
  if(typeof window.comIbiHorizontalComparisonBarsChartExtension == 'undefined') {
		window.comIbiHorizontalComparisonBarsChartExtension = {};
	}
	
	window.comIbiHorizontalComparisonBarsChartExtension = {
		draw: _draw
	};
	
	function _draw(ib3SLI, isDummyData) {
		
		$ib3.checkObject(ib3SLI);
		
		ib3SLI.config.checkServiceIsInitinalized();
		
		var originalData = ib3SLI.config.getData(),	
			data = $(originalData).map(function(i, d) {
				d.originalIndex = i;
				return d;
			}).get().reverse();
			
		var w = ib3SLI.config.getChartWidth(),
			h = ib3SLI.config.getChartHeight(),
			hasComparevalue = true,
			shortenNumbers = ib3SLI.config.getProperty('horizontalcomparisonbarsProperties.shorten_numbers'),
			colorBands = ib3SLI.config.getProperty('colorScale.colorBands'),
			setInfiniteToZero = ib3SLI.config.getProperty('horizontalcomparisonbarsProperties.setInfiniteToZero'),
			hideWhenInfinite = ib3SLI.config.getProperty('horizontalcomparisonbarsProperties.hideWhenInfinite'),
			formatComparation = ib3SLI.config.getProperty('horizontalcomparisonbarsProperties.formatComparation'),
			calculeComparationFunctionParam1 = ib3SLI.config.getProperty('horizontalcomparisonbarsProperties.calculeComparationFunction.param1'),
			calculeComparationFunctionParam2 = ib3SLI.config.getProperty('horizontalcomparisonbarsProperties.calculeComparationFunction.param2'),
			calculeComparationFunctionBody = ib3SLI.config.getProperty('horizontalcomparisonbarsProperties.calculeComparationFunction.body'),
			bodyBackgroundColor = ib3SLI.config.getProperty('horizontalcomparisonbarsProperties.bodyBackgroundColor') || "transparent";
			
		d3.select('body')
			.style('background-color', bodyBackgroundColor)
		
		d3.select('rect.eventCatcher')
			.style('fill', bodyBackgroundColor)
			
		// calculate percentajes
		for (var i = 0; i < data.length; i++) {
			if (data[i].kpisign === undefined) {
				data[i].kpisign = 1;
			}
			if (data[i].comparevalue === undefined) {
				hasComparevalue = false;
				data[i]['percentaje'] = 0;
			} else {
				data[i]['percentaje'] = calculatePercentaje(data[i].value, data[i].comparevalue, data[i].kpisign);
			}
		}
		
		var everyDataIsNegative = $(data).filter(function(i, d) { 
			return parseFloat(d.value) >= 0;
		}).get().length == 0;
			
		//set up svg using margin conventions - we'll need plenty of room on the left for labels
		var margin = {
			top: 15,
			right: everyDataIsNegative ? calculateWidth('dimension') : calculateWidth('percentaje',formatComparation) + 25,
			bottom: 15,
			left: everyDataIsNegative ? calculateWidth('percentaje',formatComparation) + 25 : calculateWidth('dimension')
		};
		
		var width = w - margin.left - margin.right,
			height = h - margin.top - margin.bottom;
			
		var svg = d3.select(ib3SLI.config.getContainer())
			.attr('class', 'com_ibi_chart')
			.attr("width", width + margin.left + margin.right)
			.attr("height", height + margin.top + margin.bottom)
				.append("g")
					.attr("transform", "translate(" + margin.left + "," + margin.top + ")");
		
		var max = d3.max(data, function(d) { return d.value; }),
			min = d3.min(data, function(d) { return d.value; });
			
		if(max > 0 && min > 0) {
			min = 0;
		} else if (max < 0 && min < 0) {
			max = 0;
		}
		
		var x = d3.scaleLinear()
			.range([0, width])
			.domain([min, max]).nice();
		
		var y = d3.scaleBand()
			.range([height, 0])
			.round(.1)
			.domain(data.map(function(d, i) {
				return d.originalIndex;
			}));
		
		var barGroups = svg.selectAll(".bar")
			.data(data)
			.enter()
				.append("g")
				.classed('group-bar', true)
				.on("mousemove", function(d, i) {
					d3.select(this).selectAll("rect").style("fill-opacity", 0.5);
				}).on("mouseout", function(d) {
					d3.select(this).selectAll("rect").style("fill-opacity", 1);
				});
						
		barGroups.append("rect")
			.attr('class', function(d, g) {
				return ib3SLI.config.getDrillClass('riser', 0, g, 'bar');
			})
			.attr('fill', ib3SLI.config.getChart().getSeriesAndGroupProperty(0, null, 'color'))
			.attr("x", function(d) { 
				return x(Math.min(0, d.value)); 
			})
			.attr("y", function(d, i) {
				return y(d.originalIndex);
			})
			.attr("height", y.bandwidth() * 0.9)
			.attr("width", function(d) { 
				return Math.abs(x(d.value) - x(0)); 
			})
			.each(function(d, g) {
				ib3SLI.config.setUpTooltip(this, 0, d.originalIndex, d);
			});
		
		if (hasComparevalue) {
			
			barGroups.filter(function(d) {
					if((d.percentaje == 'Infinity' || d.percentaje == '-Infinity')
						&& hideWhenInfinite) {
							return false;
						}
						
					return true;
				}).append("text")
				.attr("fill", function(d, i) {
					return calculateColor(d, 'percentaje', colorBands, isDummyData);
				})
				.attr("y", function(d, i) {
					return y(d.originalIndex) + y.bandwidth() / 2 + 4;
				})
				.attr("x", function(d) {
					var x = (w - margin.left - margin.right + 20);
					if(everyDataIsNegative) {
						x = -20;
					} 
					return x;
				})
				.style('text-anchor', function(d) {
					var x = 'start';
					if(everyDataIsNegative) {
						x = 'end';
					} 
					return x;
				})
				.text(function(d) {
					if(d.percentaje == 'Infinity' || d.percentaje == '-Infinity'){
						if(setInfiniteToZero) {
							return ib3SLI.config.formatNumber(0, formatComparation); 
						} else {
							if(d.percentaje == '-Infinity') {
								return '-' + String.fromCharCode(8734);
							} else {
								return String.fromCharCode(8734);
							}
						}
					}else{
						return ib3SLI.config.formatNumber(d.percentaje, formatComparation);
					} 
				});
				
			barGroups.filter(function(d) {
					if((d.percentaje == 'Infinity' || d.percentaje == '-Infinity')
						&& hideWhenInfinite) {
							return false;
						}
						
					return true;
				}).append("path")
				.attr("fill", function(d, i) {
					return calculateColor(d, 'percentaje', colorBands, isDummyData);
				}).attr("transform", function(d, dataIndex) {
					var translateX = (w - margin.left - margin.right + 10)
					if(everyDataIsNegative) {
						translateX = -10;
					} 
					
					var rotate = '';
					if(d.percentaje == 0) {
						rotate = ' rotate(90)';
					} else {
						rotate = 'rotate(' + ( d.percentaje >= 0 ? 0 : 180) + ')';
					}
					
					return 'translate(' + translateX + ', ' + (y(d.originalIndex) + y.bandwidth() / 2) + ') ' + rotate;
				}).attr("d", function(d, i) {
					if(d.percentaje != 'Infinity' && d.percentaje != '-Infinity') {
						return d3.symbol()
							.size([200])
							.type(d3.symbolTriangle)();
					}
				});	
		}
		
		var yAxis = d3.axisLeft()
			.scale(y)
			.tickSize(0)
			.tickFormat(function(dataIndex) { 
				return $(data).filter(function(i, d){return d.originalIndex == dataIndex})[0].dimension;
			});
			
		var yAxisG = svg.append("g")
			.attr("fill", ib3SLI.config.getProperty('axisList.y1.labels.color'))
			.attr("transform", "translate(" + x(0) + ",0)")
			.call(yAxis);
					
		yAxisG.selectAll("text")
			.attr("fill", ib3SLI.config.getChart().getSeriesAndGroupProperty(0, null, 'color'))
			.style("text-anchor", function(dataIndex) { 
				var dataElem = $(data).filter(function(i, d){return d.originalIndex == dataIndex})[0];
				if(parseFloat(dataElem.value) < 0) {
					return 'start';
				} else {
					return 'end'
				}
			})
			.attr("x", function(dataIndex) { 
				var dataElem = $(data).filter(function(i, d){return d.originalIndex == dataIndex})[0],
					currentX = parseFloat(d3.select(this).attr('x')),
					sign = parseFloat(dataElem.value) >= 0 ? 1 : -1;
					
				return sign * currentX;
			});
		
		var xAxisGWidth = d3.select('.group-bar').node().getBBox().width,
			xAxisMinLabelSpace = 100,
			xAxisNumLabels = parseInt(xAxisGWidth / xAxisMinLabelSpace);
			
		var xAxis = d3.axisBottom()
			.scale(x)
			.ticks(xAxisNumLabels);

		var xAxisG = svg.append("g")
			.attr("class", "x axis")
			.attr("transform", "translate(0," + (h - margin.top - margin.bottom) + ")")
			.call(xAxis);
		
		xAxisG.selectAll("text").attr("fill", ib3SLI.config.getProperty('axisList.y1.labels.color'));
		
		if (shortenNumbers) {
			var arr_shorten = {'':0,'K':0,'M':0,'B':0,'T':0},
				max_shorten = 0,
				selected_shorten_letter = '',
				last_shorten = '';
			xAxisG.selectAll("text").each(function(d) {
				arr_shorten[$ib3.utils.getNumericAbbreviation(d)]++;
			});
			$.each(arr_shorten,function(i,val){
				if (val > max_shorten){
					max_shorten = val;
					selected_shorten_letter = last_shorten;
				}
				last_shorten = i;
			});
			xAxisG.selectAll("text").text(function(d) {
				if(parseFloat(d) == 0) {
					return 0;
				}
				if (selected_shorten_letter != ''){
					return $ib3.utils.setShortenNumber(d, false, 0,selected_shorten_letter);
				}else{
					return d;
				}
			});
		}
		
		svg.selectAll("path.domain")
			.attr("stroke", ib3SLI.config.getProperty('xaxis.bodyLineStyle.color'));
			
		svg.selectAll(".tick line")
			.attr("stroke", ib3SLI.config.getProperty('xaxis.bodyLineStyle.color'));
			
		ib3SLI.config.finishRender();

		function calculatePercentaje(value, comparevalue, kpisign) {
			var change_sign = (kpisign == 0) ? -1 : 1;
			
			var calculeComparationFunction = new Function(calculeComparationFunctionParam1, calculeComparationFunctionParam2, calculeComparationFunctionBody);
			var calculateValue;
			try { calculateValue = calculeComparationFunction(value,comparevalue); }
			catch(e) { 			
				$ib3.utils.showRenderError('Error compare function definition<br>Params names must match the var names used inside the body of the function<br><br> Javascript Error: ' + e.message);			
				return;
			}
			
			return calculateValue;
		}

		function calculateWidth(field, numberFormat) {
			var div_widths = d3.select("svg g")
					.append("text"),
				max_width = 0,
				my_width = 0;
				
			for (var i = 0; i < data.length; i++) {
				var elem = data[i][field];
				if(numberFormat) {
					elem = ib3SLI.config.formatNumber(elem, numberFormat);
				}
				div_widths.text(elem);
				my_width = div_widths.node().getBBox().width;
				if (my_width > max_width) {
					max_width = my_width;
				}
			}
			div_widths.remove();
			return max_width + 10;
		}

		function calculateColor(d, field, colorBands, isDummyData) {
			
			if(isDummyData)
				return 'grey';
			
			var the_fill = 'black';
			for (var a = 0; a < colorBands.length; a++) {
				var my_value = d[field];
				my_value = (d['kpisign'] == 0) ? (d[field] * (-1)) : d[field];
				if ((my_value > colorBands[a].start) && (my_value < colorBands[a].stop)) {
					the_fill = colorBands[a].color;
					break;
				}
			}
			return the_fill;
		}
		
	}
	
}())