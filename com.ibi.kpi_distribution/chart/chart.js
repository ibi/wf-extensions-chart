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
			mainContainer = $ib3.config.getContainer(),
			chart = $ib3.config.getChart(),
			width = $ib3.config.getChartWidth(),
			height = $ib3.config.getChartHeight(),
			properties = $ib3.config.getCustomProperties();
			
		var barWidth = width,
			minColor = isDummyData ? 'grey': $ib3.config.getProperty('kpidistributionProperties.colors.minColor'),
			maxColor = isDummyData ? '#5a5a5a': $ib3.config.getProperty('kpidistributionProperties.colors.maxColor'),
			textColor = isDummyData ? 'grey': $ib3.config.getProperty('kpidistributionProperties.colors.titlesColor'),
			marginTop = parseFloat($ib3.config.getProperty('kpidistributionProperties.sizes.marginTop')),
			rowHeight = parseFloat($ib3.config.getProperty('kpidistributionProperties.sizes.rowHeight')),
			barHeight = parseFloat($ib3.config.getProperty('kpidistributionProperties.sizes.barHeight')),
			animationSeconds = 500,
			fontSize = $ib3.config.getProperty('kpidistributionProperties.sizes.titlesFont'),
			showPercentagesOfTheTotal = $ib3.config.getProperty('kpidistributionProperties.options.showPercentagesOfTheTotal'),
			showValue = $ib3.config.getProperty('kpidistributionProperties.options.showValue'),
			shortenValue = $ib3.config.getProperty('kpidistributionProperties.options.shortenValue'),
			forceSortRows = $ib3.config.getProperty('kpidistributionProperties.options.forceSortRows');
					
		var container = d3.select(mainContainer).attr('class', 'extension_container').append('g');
				
		//change for control drill index
		data = $(data).map(function(i, d) {
				d.originalIndex = i;
				return d;
			})
			
		if(forceSortRows) {
			
			data = $(data).sort(function(a,b) { return b.value - a.value }).get();
			
		}

		var groups = container.selectAll('g')
			.data(data)
			.enter()
				.append('g')
				.each(function(d, i) {
					$ib3.utils.setUpTooltip(this, 0, d.originalIndex, d);
				})
				.attr("class", function(d, i) {
					var drillClass = $ib3.config.getDrillClass(0, d.originalIndex);
					return drillClass;
				});

		var valueFormat = $ib3.config.getFormatByBucketName('value', 0),
			total = $(data).map(function(i, d) { return d.value; }).get().reduce(function(a,b) { return a + b }, 0);
			
		if(showPercentagesOfTheTotal) {
			groups.append('text')
				.attr('class', 'percentage')
				.attr('fill', textColor)
				.attr('alignment-baseline', 'central')
				.attr('font-size', fontSize)
				.attr('width', 50)
				.attr('y', function(d, i) { 
					return i * rowHeight + marginTop;
				})
				.text(function(d) { 
				
					var percentage = d.value / total * 100,
						percentageFormatted = percentage.toFixed(2) + '%';
								
					return percentageFormatted;
				});
		}
		
		groups.append('text')
			.attr('class', 'title')
			.attr('fill', textColor)
			.attr('alignment-baseline', 'central')
			.attr('font-size', fontSize)
			.attr('y', function(d, i) { 
				return i * rowHeight + marginTop;
			})
			.attr('x', showPercentagesOfTheTotal ? 68 : 0)
			.text(function(d) { 
				var number = '';
				
				if(showValue) {
					
					if(shortenValue) {
				
						var abbr = $ib3.utils.getNumericAbbreviation(d.value),
							shortenNumber = $ib3.utils.getShortenNumberByAbbreviation(d.value, abbr),
							valueFormatApplied = valueFormat;
							
						var lastCharValueFormat = valueFormatApplied.substring(valueFormatApplied.length - 1);
						if(lastCharValueFormat == '%') {
							valueFormatApplied += abbr;								
						} else if(lastCharValueFormat == '€') {
							valueFormatApplied = valueFormatApplied.substring(0, valueFormatApplied.length - 2) + abbr + lastCharValueFormat;
						} else {
							valueFormatApplied += abbr;
						}
						
						number = ' | ' + $ib3.config.formatNumber(shortenNumber, valueFormatApplied);
						
					} else {
						
						number = ' | ' + $ib3.config.formatNumber(d.value, valueFormat); 
						
					} 
				
				}
							
				return (showPercentagesOfTheTotal ? '| ' : '') + d.dimension + '   ' + number;
			});

		groups.append('rect')
			.attr('class', 'bg-rect')
			.attr('fill', '#d1d1d1')
			.attr('height', barHeight)
			.attr('width', barWidth)
			.attr('y', function(d, i) { 
				return i * rowHeight + rowHeight / 4 + marginTop;
			});

		var progress = groups.append('rect')
			.attr('class', 'progress-rect')
			.attr('fill', 'gray')
			.attr('height', barHeight)
			.attr('width', 0)
			.attr('y', function(d, i) {
				return i * rowHeight + rowHeight / 4 + marginTop;
			})
			.attr('x', 0);
		
		var defaultMin = 0,
			defaultMax = $(data).map(function(i,d) { return d.value }).get().reduce(function(total, elem) { return total + elem }),
			bucketMinValue = $ib3.config.getBucket('minvalue'),
			bucketMaxValue = $ib3.config.getBucket('maxvalue');

		var colorDefaultScale = d3.scaleLinear()
			.domain([0, defaultMax])
			.range([minColor, maxColor]);

		var widthDefaultScale = d3.scaleLinear()
			.domain([0, defaultMax])
			.range([0, barWidth]);
		
		progress
			.transition()
			.duration(animationSeconds)
			.attr('width', function(d) { 
				var widthScale = widthDefaultScale,
					hasMinValue = typeof d.minvalue != 'undefined',
					hasMaxValue = typeof d.maxvalue != 'undefined';
					
				if (hasMinValue || hasMaxValue) {
					
					widthScale = d3.scaleLinear()
						.domain([hasMinValue ? d.minvalue : 0, hasMaxValue ? d.maxvalue : defaultMax])
						.range([0, barWidth]);
						
				}
				
				return widthScale(d.value) 
			})
			.attr('fill', function(d) { 
			
				var colorScale = colorDefaultScale,
					hasMinValue = typeof d.minvalue != 'undefined',
					hasMaxValue = typeof d.maxvalue != 'undefined';
					
				if (hasMinValue || hasMaxValue) {
					
					colorScale = d3.scaleLinear()
						.domain([hasMinValue ? d.minvalue : 0, hasMaxValue ? d.maxvalue : defaultMax])
						.range([minColor, maxColor]);
						
				}
				
				return colorScale(d.value) 
			})
						
		$ib3.utils.createScrolling(d3.select(mainContainer), d3.select('svg > rect'), d3.select('svg'));
	}
	
}())