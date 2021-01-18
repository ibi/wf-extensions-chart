(function() { 

  //Set the Global IBI Variable if not exists
  if(typeof window.comIbiHorizontal_2kpiChartExtension == 'undefined') {
		window.comIbiHorizontal_2kpiChartExtension = {};
	}
	
	window.comIbiHorizontal_2kpiChartExtension = {
		draw: _draw
	};
	
	function _draw(ib3SLI, isDummyData) {
		
		$ib3.checkObject(ib3SLI);
		
		ib3SLI.config.checkServiceIsInitinalized();
		/*ordenar datos por bucket*/
		function sortAlphanumetic(a,b){
			return a.order.localeCompare(b.order, 'en', { numeric: true }) 
		}
		var originalData = ib3SLI.config.getData();

		//if (ib3SLI.config.getBucket('order') != null) originalData=originalData.sort(sortAlphanumetic)
		/* */


		var data = $(originalData).map(function(i, d) {
				d.originalIndex = i;
				return d;
		}).get().reverse();
			
		var w = ib3SLI.config.getChartWidth(),
			h = ib3SLI.config.getChartHeight(), 
			hasComparevalue = true,
			shortenNumbers = ib3SLI.config.getProperty('horizontal2kpiProperties.shorten_numbers'),
			imageSize = ib3SLI.config.getProperty('horizontal2kpiProperties.imageSize'),
			typeShortenNumber = ib3SLI.config.getProperty('horizontal2kpiProperties.typeShortenNumber'),
			shortenLeyendDescription = ib3SLI.config.getProperty('horizontal2kpiProperties.shortenLeyendDescription'),
			colorBands = ib3SLI.config.getProperty('colorScale.colorBands'),
			setInfiniteToZero = ib3SLI.config.getProperty('horizontal2kpiProperties.setInfiniteToZero'),
			hideWhenInfinite = ib3SLI.config.getProperty('horizontal2kpiProperties.hideWhenInfinite'),
			valueComparation = ib3SLI.config.getProperty('horizontal2kpiProperties.valueComparation'),
		//	formatComparation = ib3SLI.config.getProperty('horizontal2kpiProperties.formatComparation'),
		//	dataLabel = ib3SLI.config.getProperty('horizontal2kpiProperties.dataLabel'),
			dataLabels = ib3SLI.config.getChart().dataLabels,
			calculeComparationFunctionParam1 = ib3SLI.config.getProperty('horizontal2kpiProperties.calculeComparationFunction.param1'),
			calculeComparationFunctionParam2 = ib3SLI.config.getProperty('horizontal2kpiProperties.calculeComparationFunction.param2'),
			calculeComparationFunctionBody = ib3SLI.config.getProperty('horizontal2kpiProperties.calculeComparationFunction.body'),
			bodyBackgroundColor = ib3SLI.config.getProperty('horizontal2kpiProperties.bodyBackgroundColor') || "transparent",
			numberTicks = ib3SLI.config.getProperty('horizontal2kpiProperties.numberTicks') || 2,
			showXaxis = ib3SLI.config.getProperty('horizontal2kpiProperties.showXaxis') ,
			yAxisProperties=ib3SLI.config.getProperty('horizontal2kpiProperties.yAxis') ,
			xAxisProperties=ib3SLI.config.getProperty('horizontal2kpiProperties.xAxis') ,
			drillBarColor=ib3SLI.config.getProperty('horizontal2kpiProperties.drillBarColor') ,
			negativeBarColor = ib3SLI.config.getProperty('horizontal2kpiProperties.negativeBarColor') || "#eb0f0f";

			//ib3SLI.config.getChart().fill
			//$0.chart.dataLabels

		
		d3.select('body')
			.style('background-color', ib3SLI.config.getChart().fill)
		
		d3.select('rect.eventCatcher')
			.style('fill', ib3SLI.config.getChart().fill)
			
		// calculate percentajes
		for (var i = 0; i < data.length; i++) {
			if (data[i].kpisign === undefined) {
				data[i].kpisign = 1;
			}
			if (data[i].drillCondition === undefined) {
				data[i].drillCondition = '0';
			}
			if (data[i].comparevalue === undefined) {
				hasComparevalue = false;
				data[i]['percentaje'] = 0;
			} else {
				data[i]['percentaje'] = calculatePercentaje(data[i].value, data[i].comparevalue, data[i].kpisign);
			}
			if (data[i].image !== undefined) {
				var image = ''; //'data:image/png;base64,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';
				if(typeof data[i].image !== 'undefined' && data[i].image != '.') {
					image = _getImagePath(data[i].image);
				}
				data[i].imageUrl = image;
			}
		}
		
		var anyDataIsNegative = $(data).filter(function(i, d) { 
			return parseFloat(d.value) < 0;
		}).get().length != 0;

		var anyDataDrill = $(data).filter(function(i, d) { 
			return (d.drillCondition) == "1";
		}).get().length != 0;

	
		var _copyEvent=[];
		if (ib3SLI.config.getChartProperty('eventDispatcher') != undefined){
			if ((ib3SLI.config.getChartProperty('eventDispatcher').events.length != 0)){
				_copyEvent=	JSON.parse(JSON.stringify(ib3SLI.config.getChartProperty('eventDispatcher'))).events;
				ib3SLI.config.getChartProperty('eventDispatcher.events').shift();
			}
		}
		
	
	
		//set up svg using margin conventions - we'll need plenty of room on the left for labels
		var margin = {
			top: 15,		
			bottom: 15
		};
		/****************************************************************************************/
		var height = h - margin.top - margin.bottom;

		var y = d3.scaleBand()
			.range([height, 0])
			.round(.1)
			.domain(data.map(function(d, i) {
				return d.originalIndex;
			}));
		//margin['right']= everyDataIsNegative ? calculateWidth('dimension') : calculateWidth('percentaje',formatComparation) + y.bandwidth()*0.9;
		margin['left']=calculateWidth('dimension','',yAxisProperties.font)
		//margin['left']= everyDataIsNegative ? calculateWidth('percentaje',formatComparation) + y.bandwidth()*0.9 : calculateWidth('dimension')
		margin['right']=calculateWidth('percentaje',valueComparation.formatComparation,'') + y.bandwidth()*0.9;
		var width = w - margin.left - margin.right
		/****************************************************************************************/
			
		var svg = d3.select(ib3SLI.config.getContainer())
			.attr('class', 'com_ibi_chart')
			.attr("width", width + margin.left + margin.right)
			.attr("height", height + margin.top + margin.bottom)
				.append("g")
					.attr("transform", "translate(" + 0 + "," + margin.top + ")");
		
		var max = d3.max(data, function(d) { return d.value; }),
			min = d3.min(data, function(d) { return d.value; });
			
		if(max > 0 && min > 0) {
			min = 0;
		} else if (max < 0 && min < 0) {
			max = 0;
		}

	//	var absMas=Math.max(Math.abs(min), Math.abs(max));
		var difMaxMin=max-(min);
		newMin= (min >= 0 ) ? 0 : min-(difMaxMin/(numberTicks  ));
		newMax= (max <= 0 ) ? 0 : max+(difMaxMin/(numberTicks ));
		if (xAxisProperties.min != 'auto'){
			newMin=xAxisProperties.min;
		}
		if (xAxisProperties.max != 'auto'){
			newMax=xAxisProperties.max;
		}
		var x = d3.scaleLinear()
			.range([0, width])
			.domain([newMin,newMax]);
		
		if (anyDataIsNegative == true){
			svg.append('line')
				.attr('y1',0)
				.attr('y2',height)
				.attr('x1',x(0)+margin.left)
				.attr('x2',x(0)+margin.left)
				.style('stroke-width',1)
				.style('stroke','#BABABA');
		}
			 
			
		var barGroups = svg.selectAll(".bar")
			.data(data)
			.enter()
				.append("g")
				.attr("transform", "translate(" +margin.left + "," + 0 + ")")
				.classed('group-bar', true)
				.on("mousemove", function(d, i) {
					d3.select(this).selectAll("rect").style("fill-opacity", 0.5);
				}).on("mouseout", function(d) {
					d3.select(this).selectAll("rect").style("fill-opacity", 1);
				});
						
		barGroups.append("rect")
			.attr('class', function(d, g) {
				return ib3SLI.config.getDrillClass('riser', 0, d._g, 'bar');
			})
			.attr('fill',function(d,i){
		
				if ((d.drillCondition=='1') && (_copyEvent.length !=0)) {
				 
					var _drill1=JSON.parse(JSON.stringify(_copyEvent[0]));
					_drill1.group=d._g
					var arr_events=ib3SLI.config.getChartProperty('eventDispatcher.events')
					arr_events.push(_drill1)
				}
				if ((d.value >= 0)  && (d.kpisign == 1) && (d.drillCondition==1)) return drillBarColor;
				if ((d.value >= 0)  && (d.kpisign == 0) && (d.drillCondition==1)) return negativeBarColor;
				if ((d.value <= 0)  && (d.kpisign == 0) && (d.drillCondition==1)) return drillBarColor;
				if ((d.value <= 0)  && (d.kpisign == 1) && (d.drillCondition==1)) return negativeBarColor;
				if ((d.value >= 0)  && (d.kpisign == 1)) return ib3SLI.config.getChart().getSeriesAndGroupProperty(d._s, d._g, 'color')
				if ((d.value >= 0)  && (d.kpisign == 0)) return negativeBarColor
				if ((d.value < 0)  && (d.kpisign == 1)) return negativeBarColor
				if ((d.value < 0)  && (d.kpisign == 0)) return ib3SLI.config.getChart().getSeriesAndGroupProperty(d._s, d._g, 'color')

				else return 'grey';
				
			}) 
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

			//if (dataLabels.visible){
					barGroups.append("text")
					.text(function(d,index) { 
						var _dataLabel=dataLabels ;
						if ((_dataLabel.visible == false)  || (_dataLabel.visible == undefined )) return ''
						if ((_dataLabel.displayZero == false ) && (d.value==0)) return ''
						return ib3SLI.config.formatNumber( d.value, _dataLabel.numberFormat); 
					})
					.attr('fill',function(d,index){
						var _dataLabel=dataLabels ;
						var _color = ( typeof _dataLabel.color != 'string') ? 'black' : _dataLabel.color ;
						if ((_dataLabel.useNegativeColor == true) && (d.value < 0) ) _color =  _dataLabel.negativeColor

						return _color
						if ((d.value >= 0)  && (d.kpisign == 1)) return ib3SLI.config.getChart().getSeriesAndGroupProperty(0, null, 'color')
						if ((d.value >= 0)  && (d.kpisign == 0)) return negativeBarColor
						if ((d.value < 0)  && (d.kpisign == 1)) return negativeBarColor
						if ((d.value < 0)  && (d.kpisign == 0)) return ib3SLI.config.getChart().getSeriesAndGroupProperty(0, null, 'color')

						else return 'grey';
						
					}) 
					.attr("x", function(d,index) { 
						var _dataLabel=dataLabels;
						console.log(_dataLabel.position)
						var addSubt=1;
						if (d.value < 0) addSubt=-1;

						if ((_dataLabel.position=='top')){
							return x(d.value)+5*addSubt; 
						}else if (_dataLabel.position=="insideBottom"){
							return  x(0)+2*addSubt;
						}else if (_dataLabel.position=="center"){
							return   x(d.value/2)
						}else if (_dataLabel.position=="insideTop"){
							return   x(d.value)+5*addSubt*-1;
						}
					})
					.attr("y", function(d, i) {
						return y(d.originalIndex) + y.bandwidth() / 2 + 4;
					})
					.style('font',function(d,index){
						var _dataLabel=dataLabels;
						return _dataLabel.font
					})
					.style('text-anchor', function(d,index) {
						var _dataLabel=dataLabels;

						var defaultAnchor='start';
						if (_dataLabel.position=="center") return 'middle'
						if ((_dataLabel.position=="insideTop")  && ( d.value < 0)) return 'start'
						if ((_dataLabel.position=="insideTop")  && ( d.value > 0)) return 'end'
						if ((_dataLabel.position=="top")  && ( d.value > 0)) return 'start'
						if ((_dataLabel.position=="top")  && ( d.value < 0)) return 'end'
						if ((_dataLabel.position=="insideBottom")  && ( d.value > 0)) return 'start'
						if ((_dataLabel.position=="insideBottom")  && ( d.value < 0)) return 'end'
						if( d.value < 0){
							defaultAnchor= 'end';
						}
					//	return 'middle'
						return defaultAnchor
						
					})
			//	}
			//.style('font-size', y.bandwidth()/2 +'px')
			 	
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
				.style('font',function(d,index){				 
					return valueComparation.font
				})
				.attr("y", function(d, i) {
					return y(d.originalIndex) + y.bandwidth() / 2 + 4;
				})
				.attr("x", function(d) {
					var x = (w - margin.left - margin.right + y.bandwidth() * 0.9);
				//	if(everyDataIsNegative) {
				//		x = -y.bandwidth() * 0.9;
				//	} 
					 
					return x;
				})
				.style('text-anchor', function(d) {
					var x = 'start';
				//	if(everyDataIsNegative) {
				//		x = 'end';
				//	} 
					return x;
				})
				.text(function(d) {
					if(d.percentaje == 'Infinity' || d.percentaje == '-Infinity'){
						if(setInfiniteToZero) {
							return ib3SLI.config.formatNumber(0, valueComparation.formatComparation); 
						} else {
							if(d.percentaje == '-Infinity') {
								return '-' + String.fromCharCode(8734);
							} else {
								return String.fromCharCode(8734);
							}
						}
					}else{
						return ib3SLI.config.formatNumber(d.percentaje, valueComparation.formatComparation);
					} 
				});
				
		/*	barGroups.filter(function(d) {
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
							.size([50])
							.type(d3.symbolTriangle)();
					}
				})*/
				barGroups.append("image").attr("transform", function(d, dataIndex) {
					var translateX = (w - margin.left - margin.right + (y.bandwidth() * 0.9)/2)
				//	if(everyDataIsNegative) {
				//		translateX = -(y.bandwidth() * 0.9)/2;
				//	} 
					
					var rotate = '';
					if(d.percentaje == 0) {
						rotate = ' rotate(90)';
					} else {
						rotate = 'rotate(' + ( d.percentaje >= 0 ? 0 : 180) + ')';
					}
					
					return 'translate(' + translateX + ', ' + (y(d.originalIndex) + y.bandwidth() / 2) + ') ';
				})
			.attr("xlink:href",  function(d, dataIndex) {
					return d.imageUrl

			} )
           .attr("x", -(y.bandwidth() * 0.9)/2)
           .attr("y", -(y.bandwidth() * 0.9)/2)
           .attr("width", y.bandwidth() * 0.9)
           .attr("height", y.bandwidth() * 0.9)
           .style("stroke", "black")
           .style("stroke-width", "1px");
	
		}
		
		var yAxis = d3.axisLeft()
			.scale(y)
			.tickSize(0)
			.tickFormat(function(dataIndex){
				return $(data).filter(function(i, d){
					return d.originalIndex == dataIndex;
				})[0].dimension;
			});
		
		var rectBackGroundYaxis=svg.append("rect")
				.attr('height',height)
				.attr('width',margin.left)
				.attr('fill',ib3SLI.config.getChart().fill);	
					
		var yAxisG = svg.append("g")	
			.attr("fill", ib3SLI.config.getProperty('axisList.y1.labels.color'))
			.attr("transform", "translate(" + margin.left + ",0)")
			.call(yAxis)
			
				 
		yAxisG.selectAll("text")
			.attr("fill", yAxisProperties.color)
			.style('font',yAxisProperties.font)
			.style("text-anchor", function(dataIndex) { 
				var dataElem = $(data).filter(function(i, d){return d.originalIndex == dataIndex})[0];
			/*	if(everyDataIsNegative) {
					return 'start';
				}else{
					return 'end'
				}*/
				return 'end';
				if ((parseFloat(dataElem.value) <= 0)  )   {
					return 'start';
				} else {
					return 'end'
				}
			})
			.attr("x", function(dataIndex) { 
				var dataElem = $(data).filter(function(i, d){return d.originalIndex == dataIndex})[0],
					currentX = parseFloat(d3.select(this).attr('x')),
					 sign = ((parseFloat(dataElem.value) <= 0)) ? -1 : 1;
					 currentX=-5;
					return currentX
				//return sign * currentX;
			});
		
		var xAxisGWidth = d3.select('.group-bar').node().getBBox().width,
			xAxisMinLabelSpace = 100,
			xAxisNumLabels = parseInt(xAxisGWidth / xAxisMinLabelSpace);
		if (xAxisProperties.showXaxis){	
			var xAxis = d3.axisBottom()
				.scale(x)
				.ticks(numberTicks*1);

			var xAxisG = svg.append("g")
				.attr("class", "x axis")
				.attr("transform", "translate("+ margin.left +"," + (h - margin.top - margin.bottom) + ")")
				.call(xAxis);
		//	xAxisG.selectAll("text").attr("fill", ib3SLI.config.getProperty('axisList.y1.labels.color'));
			xAxisG.selectAll("text")
				.attr("fill",xAxisProperties.color)
				.style("font",xAxisProperties.font);
		} 
	
		
		 	
		if (shortenNumbers) {
			var arr_shorten = {},
				max_shorten = 0,
				selected_shorten_letter = '';
			if (typeShortenNumber == 'short scale'){
				arr_shorten = {'':0,'K':0,'M':0,'B':0};
			}else{
				arr_shorten = {'':0,'K':0,'M':0,'B':0,'T':0};
			}
			if (xAxisProperties.showXaxis){	
				xAxisG.selectAll("text").each(function(d) {
					arr_shorten[$ib3.utils.getNumericAbbreviation(d, typeShortenNumber)]++;
				});
			}	
			$.each(arr_shorten,function(i,val){
				if (val > max_shorten){
					max_shorten = val;
					selected_shorten_letter = i;
				}
			});
			
			if (shortenLeyendDescription.enabled){
				var shortenLegendG = svg.append("g")
					.attr("transform", "translate(0," + (h - margin.top) + ")");
				shortenLegendG.append("text")
					.attr("x", "-10")
					.style("text-anchor", "end")
//					.attr("alignment-baseline", "hanging")
					.attr('fill', ib3SLI.config.getProperty('axisList.y1.labels.color'))
					.text(function(){
						// to incrementate with currency's
						var currency = '',
							numberFormat = ib3SLI.config.getFormatByBucketName('value', 0),
							lastCharValueFormat = numberFormat.substring(numberFormat.length - 1),
							shortenDecode = (selected_shorten_letter == '') ? 'U' : selected_shorten_letter,
							aurReturn = '';
						if (lastCharValueFormat == '€'){
							currency = lastCharValueFormat;
						}
						if (shortenDecode != 'U'){
							aurReturn += '* (' + selected_shorten_letter + ') = '
						}
						aurReturn += shortenLeyendDescription[shortenDecode] + ' ' + currency;
						return aurReturn;
					});
			}
			
			if (xAxisProperties.showXaxis){	
				xAxisG.selectAll("text").text(function(d) {
					var formatNumber = ib3SLI.config.formatNumber,
						valueFormat = ib3SLI.config.getFormatByBucketName('value', 0);
					if(parseFloat(d) == 0) {
						return 0;
					}
					if (selected_shorten_letter != ''){
						return $ib3.utils.setShortenNumber(d, false, 0,selected_shorten_letter, formatNumber, valueFormat, typeShortenNumber);
					}else{
						if ((formatNumber) && (valueFormat)){
							valueFormat = valueFormat.split('.')[0];
							return $ib3.utils.getFormattedNumber(formatNumber, d, valueFormat, false, typeShortenNumber);
						}else{
							return d;
						}
					}
				});
			}
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

		function calculateWidth(field, numberFormat,style) {
			var div_widths = d3.select("svg g")
					.append("text"),
				max_width = 0,
				my_width = 0;
				if (style != ''){
					div_widths.style('font',style)
				}	
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
		 
				var my_value = d[field];
				my_value = (d['kpisign'] == 0) ? (d[field] * (-1)) : d[field];
			/*	if ((d[field] >= 0)  && (d.kpisign*1 == 1)) the_fill = ib3SLI.config.getChart().getSeriesAndGroupProperty(0, null, 'color')
				if ((d[field] >= 0)  && (d.kpisign*1 == 0)) the_fill = negativeBarColor
				if ((d[field] < 0)  && (d.kpisign*1 == 1)) the_fill = negativeBarColor
				if ((d[field] < 0)  && (d.kpisign*1 == 0)) the_fill = ib3SLI.config.getChart().getSeriesAndGroupProperty(0, null, 'color')*/

				if ((d[field] >= 0)  && (d.kpisign*1 == 1)) the_fill = valueComparation.positiveColor;
				if ((d[field] >= 0)  && (d.kpisign*1 == 0)) the_fill = valueComparation.negativeColor
				if ((d[field] < 0)  && (d.kpisign*1 == 1)) the_fill = valueComparation.negativeColor;
				if ((d[field] < 0)  && (d.kpisign*1 == 0)) the_fill = valueComparation.positiveColor;
			 
			 
			return the_fill;
		}
		function _getImagePath(customImage) {
			
			var imagePath = '',
				wfPath = (typeof WFInstallOption_CGIPath == 'undefined' ? ib3SLI.config.getProperty('horizontal2kpiProperties.ibiAppsPath') : WFInstallOption_CGIPath);
			
			wfPath = $.trim(wfPath);
			wfPath = wfPath.substring(wfPath.length - 1) == '/'
				? wfPath
				: wfPath + '/';
				
			customImage = $.trim(customImage);
			
			if (customImage.substring(0, 4) != "IBFS") {
				if(customImage.substring(0, 4) == "http" || 
					customImage.substring(0, 10) == "data:image" ||
					customImage.substring(0,2) == '\\') {
					imagePath = customImage;
				} else if (customImage.substring(0, 1) == "/") {
					imagePath = wfPath + customImage.substring(1);
				} else {
					imagePath = wfPath + customImage;
				}
				
			} else {
				imagePath = wfPath + 'run.bip?BIP_REQUEST_TYPE=BIP_LAUNCH' +
					'&BIP_folder=' + customImage.substring(0, customImage.lastIndexOf("/")) +
					'&BIP_item=' + customImage.substring(customImage.lastIndexOf("/") + 1);
			}
			
			return imagePath;		
			
		}
	 
		
	}
	
}())