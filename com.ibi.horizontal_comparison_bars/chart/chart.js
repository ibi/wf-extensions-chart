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
		
		var originalData = $ib3.config.getData(),	
			data = $(originalData).map(function(i, d) {
				d.originalIndex = i;
				return d;
			}).get().reverse();
			
		var w = $ib3.config.getChartWidth(),
			h = $ib3.config.getChartHeight(),
			hasComparevalue = true,
			shortenNumbers = $ib3.config.getProperty('horizontalcomparisonbarsProperties.shorten_numbers'),
			colorBands = $ib3.config.getProperty('colorScale.colorBands'),
			setInfiniteToZero = $ib3.config.getProperty('horizontalcomparisonbarsProperties.setInfiniteToZero'),
			calculeComparationFunctionParam1 = $ib3.config.getProperty('horizontalcomparisonbarsProperties.calculeComparationFunction.param1'),
			calculeComparationFunctionParam2 = $ib3.config.getProperty('horizontalcomparisonbarsProperties.calculeComparationFunction.param2'),
			calculeComparationFunctionBody = $ib3.config.getProperty('horizontalcomparisonbarsProperties.calculeComparationFunction.body');
			
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
		
		//set up svg using margin conventions - we'll need plenty of room on the left for labels
		var margin = {
			top: 15,
			right: calculateWidth('percentaje') + 25,
			bottom: 15,
			left: calculateWidth('dimension')
		};
		
		var width = w - margin.left - margin.right,
			height = h - margin.top - margin.bottom;
			
		var svg = d3.select($ib3.config.getContainer())
			.attr('class', 'com_ibi_chart')
			.attr("width", width + margin.left + margin.right)
			.attr("height", height + margin.top + margin.bottom)
				.append("g")
					.attr("transform", "translate(" + margin.left + "," + margin.top + ")");
		
		//var x = d3.scale.linear().range([0, width]).domain([0, d3.max(data, function(d) { return d.value; })]);
		
		var max = d3.max(data, function(d) { return d.value; }),
			min = d3.min(data, function(d) { return d.value; });
			
		if(max > 0 && min > 0) {
			min = 0;
		} else if (max < 0 && min < 0) {
			max = 0;
		}
		
		var x = d3.scale.linear()
			.range([0, width])
			.domain([min, max]).nice();
		
		var y = d3.scale.ordinal().rangeRoundBands([height, 0], .1).domain(data.map(function(d, i) {
			return d.originalIndex;
		}));
		
		var barGroups = svg.selectAll(".bar")
			.data(data)
			.enter()
				.append("g")
				.on("mousemove", function(d, i) {
					d3.select(this).selectAll("rect").style("fill-opacity", 0.5);
				}).on("mouseout", function(d) {
					d3.select(this).selectAll("rect").style("fill-opacity", 1);
				});
						
		barGroups.append("rect")
			.attr('class', function(d, g) {
				return $ib3.config.getDrillClass('riser', 0, g, 'bar');
			})
			.attr('fill', $ib3.config.getChart().getSeriesAndGroupProperty(0, null, 'color'))
			.attr("x", function(d) { 
				return x(Math.min(0, d.value)); 
			})
			.attr("y", function(d, i) {
				return y(d.originalIndex);
			})
			.attr("height", y.rangeBand())
			.attr("width", function(d) { 
				return Math.abs(x(d.value) - x(0)); 
			})
			.each(function(d, g) {
				$ib3.utils.setUpTooltip(this, 0, d.originalIndex, d);
			});
		
		if (hasComparevalue) {
			barGroups.append("text")
				.attr("fill", function(d, i) {
					return calculateColor(d, 'percentaje', colorBands, isDummyData);
				})
				.attr("y", function(d, i) {
					return y(d.originalIndex) + y.rangeBand() / 2 + 4;
				})
				.attr("x", function(d) {
					var x = (w - margin.left - margin.right + 20);
					if(Math.sign(d.value) < 0) {
						x = 0 - 10;
					} 
					return x;
				})
				.style('text-anchor', function(d) {
					var x = 'start';
					if(Math.sign(d.value) < 0) {
						x = 'end';
					} 
					return x;
				})
				.text(function(d) {
					if(d.percentaje == 'Infinity' || d.percentaje == '-Infinity'){
						if(setInfiniteToZero) {
							return $ib3.config.formatNumber(0, '#,###.00') + ' %'; 
						} else {
							if(d.percentaje == '-Infinity') {
								return '-' + String.fromCharCode(8734);
							} else {
								return String.fromCharCode(8734);
							}
						}
					}else{
						return $ib3.config.formatNumber(d.percentaje, '#,###.00') + ' %';
					} 
				});
				
			barGroups.append("path")
				.attr("fill", function(d, i) {
					return calculateColor(d, 'percentaje', colorBands, isDummyData);
				}).attr("transform", function(d, dataIndex) {
					var translateX = (w - margin.left - margin.right + 10);
					if(Math.sign(d.value) < 0) {
						translateX = 0;
					}
					
					var rotate = '';
					if(d.percentaje == 0) {
						rotate = ' rotate(90)';
					}
					
					return 'translate(' + translateX + ', ' + (y(d.originalIndex) + y.rangeBand() / 2) + ') ' + rotate;
				}).attr("d", function(d, i) {
					if(d.percentaje != 'Infinity' && d.percentaje != '-Infinity') {
						return d3.svg.symbol().type(getClassVariation(d))();
					}
				});
		}
		
		var yAxis = d3.svg.axis().scale(y)
			.tickSize(0).orient("left")
			.tickFormat(function(dataIndex) { 
				return $(data).filter(function(i, d){return d.originalIndex == dataIndex})[0].dimension;
			});
			
		var yAxisG = svg.append("g")
			.attr("fill", $ib3.config.getProperty('axisList.y1.labels.color'))
			.attr("transform", "translate(" + x(0) + ",0)")
			.call(yAxis);
					
		yAxisG.selectAll("text")
			.attr("fill", $ib3.config.getChart().getSeriesAndGroupProperty(0, null, 'color'))
			.style("text-anchor", function(dataIndex) { 
				var dataElem = $(data).filter(function(i, d){return d.originalIndex == dataIndex})[0];
				if(Math.sign(dataElem.value) == -1) {
					return 'start';
				} else {
					return 'end'
				}
			})
			.attr("x", function(dataIndex) { 
				var dataElem = $(data).filter(function(i, d){return d.originalIndex == dataIndex})[0],
					currentX = parseFloat(d3.select(this).attr('x'));
					
				return Math.sign(dataElem.value) * currentX;
			});
			
		var xAxis = d3.svg.axis()
			.scale(x)
			.orient("bottom");

		var xAxisG = svg.append("g")
			.attr("class", "x axis")
			.attr("transform", "translate(0," + (h - margin.top - margin.bottom) + ")")
			.call(xAxis);
		
		xAxisG.selectAll("text").attr("fill", $ib3.config.getProperty('axisList.y1.labels.color'));
		
		if (shortenNumbers) {
			xAxisG.selectAll("text").text(function(d) {
				if(Math.sign(d) == 0) {
					return 0;
				}
				return Math.sign(d) + $ib3.utils.setShortenNumber(Math.abs(d), false, 0);
			});
		}
		
		svg.selectAll("path.domain")
			.attr("stroke", $ib3.config.getProperty('xaxis.bodyLineStyle.color'));
			
		svg.selectAll(".tick line")
			.attr("stroke", $ib3.config.getProperty('xaxis.bodyLineStyle.color'));
			
		$ib3.config.finishRender();

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

		function calculateWidth(field) {
			var div_widths = d3.select("body").append("div").attr("class", "div_widths"),
				max_width = 0,
				my_width = 0;
			for (var i = 0; i < data.length; i++) {
				div_widths.html(data[i][field]);
				my_width = div_widths.style("width").split('px').join('') * 1;
				if (my_width > max_width) {
					max_width = my_width;
				}
			}
			div_widths.remove();
			return max_width + 10;
		}

		function getClassVariation(d) {
			 
			var the_type = "";
			if (d.percentaje < 0) {
				the_type = "triangle-down";
			} else {
				the_type = "triangle-up";
			} 
			return the_type;
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