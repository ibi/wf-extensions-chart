(function() {

  //Set the Global IBI Variable if not exists
  if(typeof window.comIbiLinearRealTimeChartExtension == 'undefined') {
		window.comIbiLinearRealTimeChartExtension = {};
	}
	
	window.comIbiLinearRealTimeChartExtension = {
		draw: _draw
	};
	
	function _draw(ib3SLI, isDummyData) {
		
		$ib3.checkObject(ib3SLI);
		
		ib3SLI.config.checkServiceIsInitinalized();
		
		var editing = $ib3.utils.isEditing();
		//Declare main extension vars
		var data = ib3SLI.config.getData(),
			mainContainer = ib3SLI.config.getContainer(),
			chart = ib3SLI.config.getChart(),
			totalWidth = ib3SLI.config.getChartWidth(),
			totalHeight = ib3SLI.config.getChartHeight(),
			properties = ib3SLI.config.getCustomProperties();
// get properties
		var ajaxFolderItem = ib3SLI.config.getProperty('ajax.folderItem'),
			timeInterval = ib3SLI.config.getProperty('times.timeInterval'),
			timeRange = ib3SLI.config.getProperty('times.timeRange'),
			timeEffect = ib3SLI.config.getProperty('times.timeEffect'),
			bodyBackgroundColor = ib3SLI.config.getProperty('bodyBackgroundColor') || "transparent",
			shortenNumber = ib3SLI.config.getProperty('shorten.shortenNumber'),
			typeShortenNumber = ib3SLI.config.getProperty('shorten.typeShortenNumber'),
			showMarkers = ib3SLI.config.getProperty('markers.showMarkers'),
			markerRaius = ib3SLI.config.getProperty('markers.radius'),
			showDataLabels = ib3SLI.config.getProperty('dataLabels.show'),
			y1axisMax = ib3SLI.config.getProperty('yaxisOptions.y1axis.Max'),
			y2axisMax = ib3SLI.config.getProperty('yaxisOptions.y2axis.Max'),
			titleY1 = ib3SLI.config.getProperty('yaxisOptions.y1axis.title'),
			showTitleY1 = ib3SLI.config.getProperty('yaxisOptions.y1axis.showTitle'),
			titleY2 = ib3SLI.config.getProperty('yaxisOptions.y2axis.title'),
			showTitleY2 = ib3SLI.config.getProperty('yaxisOptions.y2axis.showTitle'),
			titleX = ib3SLI.config.getProperty('xaxisOptions.title'),
			showTitleX = ib3SLI.config.getProperty('xaxisOptions.showTitle');

		var auxFolderItem = ajaxFolderItem.split('/'),
			ajaxItem = auxFolderItem.pop(),
			ajaxFolder = auxFolderItem.join('/');
			
// set background color
		d3.select('body')
			.style('background-color', bodyBackgroundColor);
		
		d3.select('rect.eventCatcher')
			.style('fill', bodyBackgroundColor);
			
// vars
		var lastDateJS = null,
			Y1minDataValue = 0,
			Y1maxDataValue = 0,
			Y2minDataValue = 0,
			Y2maxDataValue = 0,
			legendMaxWidth = 0,
			legendMaxHeight = 0,
			dta = [],
			bucket,
			auxName,
			auxLegendDimensions,
			idColorSeparator = "_;_";
// re-order data dates
		data.sort(function(a,b){
			if (a.xaxis > b.xaxis) {
				return 1;
			}
			if (a.xaxis < b.xaxis) {
				return -1;
			}
			return 0;
		});
		var bucketY1 = ib3SLI.config.getBucket('y1axis') || null,
			bucketY2 = ib3SLI.config.getBucket('y2axis') || null,
			bucketX = ib3SLI.config.getBucket('xaxis') || null,
			bucketColor = ib3SLI.config.getBucket('color') || null,
			arrBucketColors = new Array();
		
		if (bucketY1){
			if (!titleY1){
				titleY1 = '';
				for (var i = 0; i < bucketY1.fields.length; i++){
					if (i > 0) titleY1 += ', ';
					titleY1 += ib3SLI.config.getBucketTitle('y1axis',i);
				}
			}
		}
		
		if (bucketY2){
			if (!titleY2){
				titleY2 = '';
				for (var i = 0; i < bucketY2.fields.length; i++){
					if (i > 0) titleY2 += ', ';
					titleY2 += ib3SLI.config.getBucketTitle('y2axis',i);
				}
			}
		}
		
		if (bucketX){
			if (!titleX){
				titleX = ib3SLI.config.getBucketTitle('xaxis');
			}
		}
			
		var numYSeries = 0;
		if (bucketY1) numYSeries += bucketY1.fields.length;
		if (bucketY2) numYSeries += bucketY2.fields.length;
			
		for (var i = 0; i < data.length; i++){
			data[i]._g = i;
			if (bucketColor){
				if (!arrBucketColors.includes(data[i].color)){
					arrBucketColors.push(data[i].color);
				}
			}
		}
/*
		$('.chart')[0].chart._internalData = data;
		$('.chart')[0].chart.data = data;
*/
// generate dta structure

		if (bucketY1){
			for (var i = 0; i < bucketY1.fields.length; i++){
				auxName = bucketY1.fields[i].fieldName.split('.');
				auxName = auxName[auxName.length-1];
				if (bucketColor){
					for (var a = 0; a < arrBucketColors.length; a++){
						dta.push({
							id: auxName + idColorSeparator + arrBucketColors[a],
							index: dta.length,
							title: (numYSeries > 1) ? bucketY1.fields[i].title + " - " + arrBucketColors[a] : arrBucketColors[a],
							format: bucketY1.fields[i].numberFormat,
							axis: 'y1',
							values: []
						});
						auxLegendDimensions = calculateSizesOfText(dta[dta.length-1].title,"legend");
						legendMaxWidth = d3.max([legendMaxWidth, auxLegendDimensions.width]);
						legendMaxHeight = d3.max([legendMaxHeight, auxLegendDimensions.height]);
					}						
				}else{
					dta.push({
						id: auxName,
						index: dta.length,
						title: bucketY1.fields[i].title,
						format: bucketY1.fields[i].numberFormat,
						axis: 'y1',
						values: []
					});
					auxLegendDimensions = calculateSizesOfText(dta[dta.length-1].title,"legend");
					legendMaxWidth = d3.max([legendMaxWidth, auxLegendDimensions.width]);
					legendMaxHeight = d3.max([legendMaxHeight, auxLegendDimensions.height]);
				}
			}
		}
		if (bucketY2){
			for (var i = 0; i < bucketY2.fields.length; i++){
				auxName = bucketY2.fields[i].fieldName.split('.');
				auxName = auxName[auxName.length-1];
				if (bucketColor){
					for (var a = 0; a < arrBucketColors.length; a++){
						dta.push({
							id: auxName + idColorSeparator + arrBucketColors[a],
							index: dta.length,
							title: (numYSeries > 1) ? bucketY2.fields[i].title + " - " + arrBucketColors[a] : arrBucketColors[a],
							format: bucketY2.fields[i].numberFormat,
							axis: 'y2',
							values: []
						});
						auxLegendDimensions = calculateSizesOfText(dta[dta.length-1].title,"legend");
						legendMaxWidth = d3.max([legendMaxWidth, auxLegendDimensions.width]);
						legendMaxHeight = d3.max([legendMaxHeight, auxLegendDimensions.height]);
					}						
				}else{
					dta.push({
						id: auxName,
						index: dta.length,
						title: bucketY2.fields[i].title,
						format: bucketY2.fields[i].numberFormat,
						axis: 'y2',
						values: []
					});
					auxLegendDimensions = calculateSizesOfText(dta[dta.length-1].title,"legend");
					legendMaxWidth = d3.max([legendMaxWidth, auxLegendDimensions.width]);
					legendMaxHeight = d3.max([legendMaxHeight, auxLegendDimensions.height]);
				}
			}
		}
		$.each(data,function(i,d){
			var dateJS,
				auxArrAxis,
				auxId;
			if (bucketY1){
				if (d.y1axis){
					if (typeof d.y1axis == "object"){
						auxArrAxis = d.y1axis;
					}else{
						auxArrAxis = [d.y1axis];
					}
// fill dta with data
					for (var y1 = 0; y1 < auxArrAxis.length; y1++){
						if (bucketColor){
							auxId = bucketY1.fields[y1].title + idColorSeparator + d.color;
						}else{
							auxId = bucketY1.fields[y1].title;
						}
						dateJS = new Date(d.xaxis);
						lastDateJS = d3.max([lastDateJS,dateJS]);
						for (var contIndex = 0; contIndex < dta.length; contIndex++){
							if (dta[contIndex].id == auxId){
								dta[contIndex].values.push({
									date: dateJS,
									index: dta[contIndex].index,
									axis: dta[contIndex].axis,
									value: auxArrAxis[y1]
								});
							}
						}
							
					}
// search the max and min values
					Y1minDataValue = d3.min([d3.min(auxArrAxis),Y1minDataValue]);
					Y1maxDataValue = d3.max([d3.max(auxArrAxis),Y1maxDataValue]);
				}
			}
			if (bucketY2){
				if (d.y2axis){
					if (typeof d.y2axis == "object"){
						auxArrAxis = d.y2axis;
					}else{
						auxArrAxis = [d.y2axis];
					}
// fill dta with data
					for (var y2 = 0; y2 < auxArrAxis.length; y2++){
						if (bucketColor){
							auxId = bucketY2.fields[y2].title + idColorSeparator + d.color;
						}else{
							auxId = bucketY2.fields[y2].title;
						}
						dateJS = new Date(d.xaxis);
						lastDateJS = d3.max([lastDateJS,dateJS]);
						for (var contIndex = 0; contIndex < dta.length; contIndex++){
							if (dta[contIndex].id == auxId){
								dta[contIndex].values.push({
									date: dateJS,
									index: dta[contIndex].index,
									axis: dta[contIndex].axis,
									value: auxArrAxis[y2]
								});
							}
						}
					}
// search the max and min values
					Y2minDataValue = d3.min([d3.min(auxArrAxis),Y2minDataValue]);
					Y2maxDataValue = d3.max([d3.max(auxArrAxis),Y2maxDataValue]);
				}
			}

//
			
		});
		
		if (bucketY1){
			if (y1axisMax) Y1maxDataValue = d3.max([y1axisMax,Y1maxDataValue]);
		}
		if (bucketY2){
			if (y2axisMax) Y2maxDataValue = d3.max([y2axisMax,Y2maxDataValue]);
		}
// Painting svg
		var svg =  d3.select(mainContainer).attr('class', 'extension_container'),
			legendRowMargin = 10,
			legendTriangle = 20,
// legendRowMargin por que el texto se desplaza del circulo:
			legendRowWidth = legendMaxWidth + legendRowMargin + legendTriangle,
// distancia extra entre textos:
			legendRowHeight = legendMaxHeight + legendRowMargin,
			y1axisWidth = (bucketY1) ? calculateSizesOfText($ib3.utils.getFormattedNumber(ib3SLI.config.formatNumber, Y1maxDataValue, ib3SLI.config.getFormatByBucketName('y1axis', 0), shortenNumber, typeShortenNumber)).width + 10 : 10,
			y2axisWidth = (bucketY2) ? calculateSizesOfText($ib3.utils.getFormattedNumber(ib3SLI.config.formatNumber, Y2maxDataValue, ib3SLI.config.getFormatByBucketName('y2axis', 0), shortenNumber, typeShortenNumber)).width + 10 : 10,
			y1TitleWidth = ((bucketY1) && (showTitleY1)) ? calculateSizesOfText(titleY1,"titles").height : 0,
			y2TitleWidth = ((bucketY2) && (showTitleY2)) ? calculateSizesOfText(titleY2,"titles").height : 0,
			
			margin = {
				top: 5,
				right: y2axisWidth + legendRowWidth + y2TitleWidth,
				bottom: 50,
				left: y1axisWidth + y1TitleWidth
			},
			width = Math.floor(totalWidth - margin.left - margin.right),
			widthWithOutLegend = Math.floor(totalWidth - margin.left - margin.right + legendMaxWidth + legendRowMargin)
			height = Math.floor(totalHeight - margin.top - margin.bottom);
	
		var container = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");
	
		var clipPath = container.append("defs").append("clipPath")
			.attr("id", "clip2")
			.append("rect")
			.attr("x", 0)
			.attr("y", 0)
			.attr("width", width)
			.attr("height", height);
	
		var parseTime = d3.timeParse("%Y%m%d");
	
		var x = d3.scaleTime().range([0, width]),
			z = d3.scaleOrdinal(d3.schemeCategory10);
		if (bucketY1){
			var y1 = d3.scaleLinear()
				.range([height, 0]).nice()
				.domain([Y1minDataValue, Y1maxDataValue]);
		}
		if (bucketY2){
			var y2 = d3.scaleLinear()
				.range([height, 0]).nice()
				.domain([Y2minDataValue, Y2maxDataValue]);
		}
		var line = d3.line()
//			.curve(d3.curveBasis)
			.x(function(d) {
				return x(d.date);
			})
			.y(function(d) {
				return axisControl(d);
			});
		
		function axisControl(d){
			if (d.axis == 'y1'){
				return y1(d.value);
			}
			if (d.axis == 'y2'){
				return y2(d.value);
			}
		}
		
		function colorControl(d){
			var theColor;
			try {
				theColor = ib3SLI.config.getChart().getSeriesAndGroupProperty(d.index, null, 'color');
			}catch(o){
				theColor = z(d.id);
			}
			return theColor;
		}
		
		function deleteDecimalsFromFormat(theFormat){
			var _format = theFormat.split(';');
			for (var i = 0; i < _format.length; i++){
				_format[i] = _format[i].split('.')[0];
			}
			return _format.join(';');
		}

		z.domain(dta.map(function(c) {
			return c.id;
		}));
	
		var x_axis = d3.axisBottom()
			.scale(x);
		var x_axis_svg = container.append("g")
			.attr("class", "axis axis--x")
			.attr("transform", "translate(0," + height + ")");
		x_axis_svg.call(x_axis);
		
		var tooltip = d3.select(".chart")
			.append("div")
			.style("position", "absolute")
			.style("visibility", "hidden")
			.attr("class","tooltip")
			.style("background-color","white");
		
		var legendHeight = dta.length * legendRowHeight;
		container.append("g")
			.attr("class", "legend")
			.attr("transform", "translate(" + (totalWidth - legendRowWidth - margin.left) + "," + ((height/2) - (legendHeight/2)) + ")");
		
		d3.select("g.legend").append("path")
			.attr("fill","#D1D1D1")
			.attr("transform","translate(0," + (legendHeight/2) + ")rotate(90)")
			.attr("class","legendTriangle")
			.attr("d",function(d,i){
				return d3.symbol()
					.size([20])
					.type(d3.symbolTriangle)();
			})
			.on("click", function(d,i){
				return legendCtrl();
			});
		
		d3.select("g.legend").append("rect")
			.attr("fill","transparent")
			.attr("transform","translate(" + (-1*legendTriangle/2) + "," + ((legendHeight/2) - (legendTriangle/2)) + ")")
			.attr("width", legendTriangle)
			.attr("height", legendTriangle)
			.on("click", function(d,i){
				return legendCtrl();
			});
		var legendShowed = true;
		function legendCtrl(){
			if (legendShowed){
				d3.select("g.legend").transition()
					.duration(transitionTime)
					.ease(d3.easeLinear, 2)
					.attr("transform", "translate(" + (totalWidth - margin.left - (legendTriangle/2)) + "," + ((height/2) - (legendHeight/2)) + ")");
				d3.select("path.legendTriangle").transition()
					.duration(transitionTime)
					.ease(d3.easeLinear, 2)
					.attr("transform","translate(0," + (legendHeight/2) + ")rotate(-90)");
				
				x.range([0, widthWithOutLegend]);
				x_axis.scale(x);
				x_axis_svg.transition()
					.duration(transitionTime)
					.ease(d3.easeLinear, 2)
					.call(x_axis);
					
				if (bucketY2){
					y2_axis_svg.transition()
						.duration(transitionTime)
						.ease(d3.easeLinear, 2)
						.attr("transform", "translate( " + widthWithOutLegend + ", 0 )");
				}
				
				clipPath.transition()
						.duration(transitionTime)
						.ease(d3.easeLinear, 2)
						.attr("width", widthWithOutLegend);
				
				if (showTitleY2){
					d3.select("#y2title").transition()
						.duration(transitionTime)
						.ease(d3.easeLinear, 2)
						.attr("transform","translate(" + (totalWidth - legendRowMargin - 10) + "," + (height/2) + ")rotate(90)");
				}
				if (showTitleX){
					d3.select("#xtitle").transition()
						.duration(transitionTime)
						.ease(d3.easeLinear, 2)
						.attr("transform","translate(" + (margin.left + (widthWithOutLegend/2)) + "," + (height + margin.top + 25) + ")");
				}
				legendShowed = false;
			}else{
				d3.select("g.legend").transition()
					.duration(transitionTime)
					.ease(d3.easeLinear, 2)
					.attr("transform", "translate(" + (totalWidth - legendRowWidth - margin.left) + "," + ((height/2) - (legendHeight/2)) + ")");
				d3.select("path.legendTriangle").transition()
					.duration(transitionTime)
					.ease(d3.easeLinear, 2)
					.attr("transform","translate(0," + (legendHeight/2) + ")rotate(90)");
				
				x.range([0, width]);
				x_axis.scale(x);
				x_axis_svg.transition()
					.duration(transitionTime)
					.ease(d3.easeLinear, 2)
					.call(x_axis);
				
				if (bucketY2){
					y2_axis_svg.transition()
						.duration(transitionTime)
						.ease(d3.easeLinear, 2)
						.attr("transform", "translate( " + width + ", 0 )");
				}
				
				clipPath.transition()
						.duration(transitionTime)
						.attr("width", width);
						
				if (showTitleY2){
					d3.select("#y2title").transition()
						.duration(transitionTime)
						.ease(d3.easeLinear, 2)
						.attr("transform","translate(" + (totalWidth - legendRowWidth - 10) + "," + (height/2) + ")rotate(90)");
				}
				if (showTitleX){
					d3.select("#xtitle").transition()
						.duration(transitionTime)
						.ease(d3.easeLinear, 2)
						.attr("transform","translate(" + (margin.left + (width/2)) + "," + (height + margin.top + 25) + ")");
				}
				legendShowed = true;
			}
			drawChart(false);
		}
							
		var legendG = d3.select("g.legend")
			.selectAll("g")
			.data(dta)
			.enter()
			.append("g")
			.attr("transform", function(d,i){
				return "translate(" + legendTriangle + "," + legendRowHeight * i + ")";
			});
		
		var legendCircleRaius = 5,
			legendCircle = legendG.append("circle")
			.attr("class", "legendCircle")
			.style("r", legendCircleRaius)
			.style("fill", function(d) {
				return colorControl(d);
			})
			.attr("transform", function(d,i){
				return "translate(0," + (legendRowHeight/2) + ")";
			});
			
		
		var legendText = legendG.append("text")
			.attr("class", "legendText")
			.attr("dominant-baseline","middle")
			.text(function(d) {
				return d.title;
			})
			.attr("transform", function(d,i){
				return "translate(10," + (legendRowHeight/2) + ")";
			});
		
// titles
		if (showTitleY1){
			svg.append("text")
				.attr("transform","translate(10," + (height/2) + ")rotate(-90)")
				.attr("id","y1title")
				.attr("class","titles")
				.attr("text-anchor","middle")
				.attr("dominant-baseline","hanging")
				.text(titleY1)
		}
		if (showTitleY2){
			svg.append("text")
				.attr("transform","translate(" + (totalWidth - legendRowWidth - 10) + "," + (height/2) + ")rotate(90)")
				.attr("id","y2title")
				.attr("class","titles")
				.attr("text-anchor","middle")
				.attr("dominant-baseline","hanging")
				.text(titleY2)
		}
		if (showTitleX){
			svg.append("text")
				.attr("transform","translate(" + (margin.left + (width/2)) + "," + (height + margin.top + 25) + ")")
				.attr("id","xtitle")
				.attr("class","titles")
				.attr("text-anchor","middle")
				.attr("dominant-baseline","hanging")
				.text(titleX)
		}
		
		if (bucketY1){
			var y1_axis = d3.axisLeft()
				.scale(y1);
			var y1_axis_svg = container.append("g")
				.attr("class", "axis axis-y1");
			y1_axis_svg.call(y1_axis);
		}
		if (bucketY2){
			var y2_axis = d3.axisRight()
				.scale(y2);
			var y2_axis_svg = container.append("g")
				.attr("class", "axis axis-y2")
				.attr("transform", "translate( " + width + ", 0 )");
			y2_axis_svg.call(y2_axis);
		}
		
		var risersG = container.append("g").attr("id", "risers").attr("class", "risers")
			.attr("clip-path", "url(#clip2)");
			
		var markersG = container.append("g").attr("id", "markers").attr("class", "markers")
			.attr("clip-path", "url(#clip2)");
		
		var dataLabelsG = container.append("g").attr("id", "datalabels").attr("class", "datalabels")
//			.attr("clip-path", "url(#clip2)");
	
		var timeIntervalMilliseconds = timeInterval * 1000,
			transitionTime = timeEffect * 1000,
			limit = timeRange;
		function getAjaxData(){
			var nextDateJS = new Date(lastDateJS);
			nextDateJS.setSeconds(nextDateJS.getSeconds() + timeInterval);
			var auxJson={
					BIDenv:false,
					BIP_REQUEST_TYPE: 'BIP_LAUNCH',
					BIP_folder: ajaxFolder,
					BIP_item: ajaxItem,
					LAST_DATE: lastDateJS,
					DATE: nextDateJS,
					IBI_random:Math.random()
				};
			auxJson[parent.WFGlobals.ses_auth_parm]=parent.WFGlobals.ses_auth_val;
			$.ajax({
				type:"POST",
				url:'/ibi_apps/run.bip',
				dataType:"json",
				data:auxJson,
				success: function(ajaxJSON){
					updateChart(ajaxJSON.records);
				},error:function (xhr, ajaxOptions, thrownError){
					alert("Something happens with Asynchronous Query, please revise it and try again");
					console.error(xhr, ajaxOptions, thrownError);
					clearInterval(t);
				}
			});
		}
		
		function updateChart(ajaxJSON){
			var dateJS,
				auxSplit,
				auxField,
				auxColor;
			$.each(ajaxJSON,function(i,d){
				dta.forEach((e) => {
					var auxName = bucketX.fields[0].fieldName.split('.');
					auxName = auxName[auxName.length-1];
					dateJS = new Date(d[auxName]);
					lastDateJS = d3.max([lastDateJS,dateJS]);
					if (bucketColor){
						auxSplit = e.id.split(idColorSeparator);
						auxField = auxSplit[0];
						auxColor = auxSplit[1];
						auxName = bucketColor.fields[0].fieldName.split('.');
						auxName = auxName[auxName.length-1];
						if (d[auxName] == auxColor){
							if (e.axis == 'y1'){
								Y1minDataValue = d3.min([d[auxField],Y1minDataValue]);
								Y1maxDataValue = d3.max([d[auxField],Y1maxDataValue]);
							}
							if (e.axis == 'y2'){
								Y2minDataValue = d3.min([d[auxField],Y2minDataValue]);
								Y2maxDataValue = d3.max([d[auxField],Y2maxDataValue]);
							}
							e.values.push({
								date: dateJS,
								index: e.index,
								axis: e.axis,
								value: d[auxField]
							});
						}
					}else{
						if (e.axis == 'y1'){
							Y1minDataValue = d3.min([d[e.id],Y1minDataValue]);
							Y1maxDataValue = d3.max([d[e.id],Y1maxDataValue]);
						}
						if (e.axis == 'y2'){
							Y2minDataValue = d3.min([d[e.id],Y2minDataValue]);
							Y2maxDataValue = d3.max([d[e.id],Y2maxDataValue]);
						}
						e.values.push({
							date: dateJS,
							index: e.index,
							axis: e.axis,
							value: d[e.id]
						});
					}
				});
			});
			drawChart();
		}
		function drawChart(firstTime){
			if (bucketY1){
				y1.domain([Y1minDataValue, Y1maxDataValue]).nice();
				y1_axis_svg.call(y1_axis)
					.selectAll("text").text(function(d,i) {
						return $ib3.utils.getFormattedNumber(ib3SLI.config.formatNumber, d, deleteDecimalsFromFormat(ib3SLI.config.getFormatByBucketName('y1axis', 0)), shortenNumber, typeShortenNumber);
					});
			}
			if (bucketY2){
				y2.domain([Y2minDataValue, Y2maxDataValue]).nice();
				y2_axis_svg.call(y2_axis)
					.selectAll("text").text(function(d,i) {
						return $ib3.utils.getFormattedNumber(ib3SLI.config.formatNumber, d, deleteDecimalsFromFormat(ib3SLI.config.getFormatByBucketName('y2axis', 0)), shortenNumber, typeShortenNumber);
					});
			}
			// Shift domain
//			x.domain([lastDateJS - ((limit - 2) * 1000), lastDateJS - timeIntervalMilliseconds]).nice();
			x.domain([lastDateJS - (limit * 1000), lastDateJS]).nice();
			if (firstTime){
				x_axis_svg.call(x_axis);
			}else{
// Slide x-axis left
				x_axis_svg.transition()
					.duration(transitionTime)
					.ease(d3.easeLinear, 2)
					.call(x_axis);
			}
			
		
			//Join
			var minerLineG = risersG.selectAll(".minerLine").data(dta);
			var minerLineGEnter = minerLineG.enter()
				//Enter
				.append("g")
				.attr("class", "minerLine")
				.merge(minerLineG);

			//Join
			var minerLineSVG = minerLineGEnter.selectAll("path").data(function(d,i) {
				return [d];
			});
			var minerLineSVGenter = minerLineSVG.enter()
				//Enter
				.append("path").attr("class", "line")
				.style("stroke", function(d,i) {
					return colorControl(d);
				})
				.merge(minerLineSVG)
				//Update
				.transition()
				.duration(transitionTime)
				.ease(d3.easeLinear, 2)
				.attr("d", function(d) {
					return line(d.values)
				})
				.attr("transform", null)
				
			var minerMarkerG = markersG.selectAll(".minerMarker").data(dta);
			
			var minerMarkerGEnter = minerMarkerG.enter()
				//Enter
				.append("g")
				.attr("class", "minerMarker")
				.merge(minerMarkerG);
				
			var minerMarkerCircles = minerMarkerGEnter.selectAll("circle").data(function(d,i) {
				return d.values;
			});
			
			var minerMarkerCirclesEnter = minerMarkerCircles.enter()
//Enter
				.append("circle")
				.attr("class", "Marker")
				.on("mouseover", function(d,i){
					return tooltip.style("visibility", "visible");
				})
				.on("mousemove", function(d,i){
					moment.locale('es');
					tooltip.html(
						"<b>Fecha:</b> " + moment(d.date).format('dddd') + ", " +moment(d.date).format('LL') + " " + moment(d.date).format('LTS') + "<br>" +
						"<b>" + dta[d.index].title +":</b> "+ $ib3.utils.getFormattedNumber(ib3SLI.config.formatNumber, d.value, dta[d.index].format, false)
// long scale / short scale
					);
					var tooltipWidth = Math.round(Number(tooltip.style('width').slice(0,-2))),
						tooltipHeight = Math.round(Number(tooltip.style('height').slice(0,-2))),
						mouseMoveSpace = 20
						positionX = 0,
						positionY = 0;
					if (event.pageX + tooltipWidth + mouseMoveSpace >= totalWidth){
						positionX = event.pageX - tooltipWidth - mouseMoveSpace;
					}else{
						positionX = event.pageX + mouseMoveSpace;
					}
					if (event.pageY + tooltipHeight + mouseMoveSpace >= totalHeight){
						positionY = event.pageY - tooltipHeight - mouseMoveSpace;
					}else{
						positionY = event.pageY + mouseMoveSpace;
					}
					return tooltip.style("top", positionY+"px").style("left",positionX+"px");
				})
				.on("mouseout", function(d,i){
					return tooltip.style("visibility", "hidden");
				})
				.attr("cx", function(d) {
					return x(d.date);
				})
				.attr("cy", function(d) {
					return axisControl(d);
				})
/*
				.attr("class", function(d, i) {
					return ib3SLI.config.getDrillClass('riser', d.index, i, 'marker');
				})
				.each(function(d, i) {
					ib3SLI.config.setUpTooltip(this, d.index, i, data[0]);
				})
*/
				.style("stroke-width", "1")
				.style("r", markerRaius)
				.style("fill", function(d,i){
					return (!showMarkers) ? "transparent" : colorControl(d);
				})
				.merge(minerMarkerCircles)
//Update
				.transition()
				.duration(transitionTime)
				.ease(d3.easeLinear, 2)
				.attr("cx", function(d) {
					return x(d.date);
				})
				.attr("cy", function(d) {
					return axisControl(d);
				})
				.attr("transform", null);
			
			
			if (showDataLabels){
				var minerDataLabelsG = dataLabelsG.selectAll(".minerDataLabels").data(dta);
				
				var minerDataLabelsGEnter = minerDataLabelsG.enter()
					//Enter
					.append("g")
					.attr("class", "minerDataLabels")
					.merge(minerDataLabelsG);
					
				var minerDataLabels = minerDataLabelsGEnter.selectAll("text").data(function(d,i) {
					return d.values;
				});
				
				var minerDataLabelsEnter = minerDataLabels.enter()
//Enter	
					.append("text")
					.attr("class", "dataLabel")
					.attr("dominant-baseline","baseline")
					.attr("text-anchor","middle")
					.attr("transform","translate(0,-5)")
					.text(function(d,i){
// no uso el de series por que no veo que el asistente sea capaz de otorgrlo
//						ib3SLI.config.getChart().series
						return $ib3.utils.getFormattedNumber(ib3SLI.config.formatNumber, d.value, dta[d.index].format, shortenNumber, typeShortenNumber);
						
					})
					.attr("x", function(d) {
						return x(d.date);
					})
					.attr("y", function(d) {
						return axisControl(d);
					})
					.style("fill", function(d,i){
						return colorControl(d);
					})
					.merge(minerDataLabels)
//Update	
					.transition()
					.duration(transitionTime)
					.ease(d3.easeLinear, 2)
					.attr("x", function(d) {
						return x(d.date);
					})
					.attr("y", function(d) {
						return axisControl(d);
					});
			}
				
		}
		if (!editing){
			if (ajaxFolder && ajaxItem){
				try{
					var a = [parent.WFGlobals.ses_auth_parm,parent.WFGlobals.ses_auth_val];
					t = setInterval(getAjaxData, timeIntervalMilliseconds);
				}catch(o){
					alert("You need a context like PD or Portal to take the token");
					return;
				}
			}else{
				alert("The Asynchronous Query Folder & Item parameters must be selecteds");
				return;
			}
		}else{
			console.log("Ajax not available in edit mode");
		}
		drawChart(true);
		
		function calculateSizesOfText(theText,_class){
			var _class = _class || '',
				_text = d3.select("svg g").append("text").attr("class",_class).text(theText),
				_width = Math.round(Number(_text.node().getBBox().width)),
				_height = Math.round(Number(_text.node().getBBox().height));
			_text.remove();
		return {"width": _width, "height": _height};
		}
//	
	}
	
}())