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
		
		//Remove kpising bucket from tooltip
		if($ib3.config.getBucket('kpising')) {
			var tooltipObjects = $ib3.config.getChartTooltipObjects();
			$ib3.config.setChartTooltipObjects($(tooltipObjects).filter(function(i, tooltip){
				return $ib3.config.getBucketTitle('kpising') != tooltip.name;
			}).get());
		}
		
		var originalData = $ib3.config.getData();
		
		originalData = $(originalData).map(function(i, d) {
			d.originalIndex = i;
			return d;
		}).get();
		
		var	data = originalData.reverse(),
			w = $ib3.config.getChartWidth(),
			h = $ib3.config.getChartHeight(),
			max_width_dimension = 0,
			max_width_percentaje = 0,
			has_comparevalue = true,
			shorten_numbers = $ib3.config.getProperty('horizontalcomparisonbarsProperties.shorten_numbers'),
			the_colorBands = $ib3.config.getProperty('colorScale.colorBands');
			
		// calculate percentajes
		for (var i = 0; i < data.length; i++) {
			if (data[i].kpisign === undefined) {
				data[i].kpisign = 1;
			}
			if (data[i].comparevalue === undefined) {
				has_comparevalue = false;
				data[i]['percentaje'] = 0;
			} else {
				data[i]['percentaje'] = calculate_percentaje(data[i].value, data[i].comparevalue, data[i].kpisign);
			}
		}
		//set up svg using margin conventions - we'll need plenty of room on the left for labels
		var margin = {
			top: 15,
			right: calculate_width('percentaje') + 25,
			bottom: 15,
			left: calculate_width('dimension')
		};
		var width = w - margin.left - margin.right,
			height = h - margin.top - margin.bottom;
			
		var svg = d3.select($ib3.config.getContainer())
			.attr('class', 'com_ibi_chart')
			.attr("width", width + margin.left + margin.right)
			.attr("height", height + margin.top + margin.bottom)
				.append("g")
					.attr("transform", "translate(" + margin.left + "," + margin.top + ")");
		
		var x = d3.scale.linear().range([0, width]).domain([0, d3.max(data, function(d) {
			return d.value;
		})]);
		
		var y = d3.scale.ordinal().rangeRoundBands([height, 0], .1).domain(data.map(function(d) {
			return d.dimension;
		}));
		
		//make y axis to show bar names
		var yAxis = d3.svg.axis().scale(y)
			//no tick marks
			.tickSize(0).orient("left");
			
		var gy = svg.append("g")
			.attr("fill", $ib3.config.getProperty('axisList.y1.labels.color'))
			.call(yAxis);
		
		var bars = svg.selectAll(".bar")
			.data(data)
			.enter()
				.append("g");
				
		//append rects
		bars.append("rect")
			.attr('class', function(d, g) {
				
			return $ib3.config.getDrillClass('riser', 0, g, 'bar');
		}).attr('fill', $ib3.config.getChart().getSeriesAndGroupProperty(0, null, 'color')).attr("x", 0).attr("y", function(d) {
			return y(d.dimension);
		}).attr("height", y.rangeBand()).attr("width", function(d) {
			return x(d.value);
		}).each(function(d, g) {
			$ib3.utils.setUpTooltip(this, 0, d.originalIndex, d);
		})
		
		//add a value label to the right of each bar
		if (has_comparevalue) {
			bars.append("text").attr("fill", function(d, i) {
					return calculate_color(d, 'percentaje', isDummyData);
				})
				//y position of the label is halfway down the bar
				.attr("y", function(d) {
					return y(d.dimension) + y.rangeBand() / 2 + 4;
				})
				//x position is 3 pixels to the right of the bar
				.attr("x", function(d) {
					return w - margin.left;
				}).text(function(d) {
					return $ib3.config.formatNumber(d.percentaje, '#,###.00') + ' %';
				});
			bars.append("path").attr("fill", function(d, i) {
				return calculate_color(d, 'percentaje', isDummyData);
			}).attr("transform", function(d, i) {
				return 'translate(' + (w - margin.left - margin.right + 10) + ', ' + (y(d.dimension) + y.rangeBand() / 2) + ')';
			}).attr("d", function(d, i) {
				return d3.svg.symbol().type(calculate_up_down(d))();
			});
		}
		//Create the Axis
		var xAxis = d3.svg.axis().scale(x);
		//Create an SVG group Element for the Axis elements and call the xAxis function
		var xAxisGroup = svg.append("g").attr("transform", "translate(0," + (h - margin.top - margin.bottom) + ")").call(xAxis);
		xAxisGroup.selectAll("text").attr("fill", $ib3.config.getProperty('axisList.y1.labels.color'));
		
		if (shorten_numbers) {
			xAxisGroup.selectAll("text").text(function(d) {
				return $ib3.utils.setShortenNumber(d, false, 0)
			});
		}
		
		bars.on("mousemove", function(d, i) {
			d3.select(this).selectAll("rect").style("fill-opacity", 0.5);
		}).on("mouseout", function(d) {
			d3.select(this).selectAll("rect").style("fill-opacity", 1);
		});
		//
		svg.selectAll("path.domain")
			.attr("stroke", $ib3.config.getProperty('xaxis.bodyLineStyle.color'));
			
		svg.selectAll(".tick line")
			.attr("stroke", $ib3.config.getProperty('xaxis.bodyLineStyle.color'));
			
		$ib3.config.finishRender();

		function calculate_percentaje(value, comparevalue, kpisign) {
			var change_sign = (kpisign == 0) ? -1 : 1;
			//return (100 * (value - comparevalue) / comparevalue).toFixed(2) * change_sign;
			return (100 * (value - comparevalue) / comparevalue).toFixed(2);
		}

		function calculate_width(field) {
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

		function calculate_up_down(d) {
			var the_type = "";
			if (d.percentaje < 0) {
				the_type = "triangle-down";
			} else {
				the_type = "triangle-up";
			}
			return the_type;
		}

		function calculate_color(d, field, isDummyData) {
			
			if(isDummyData)
				return 'grey';
			
			var the_fill = 'black';
			for (var a = 0; a < the_colorBands.length; a++) {
				var my_value = d[field];
				my_value = (d['kpisign'] == 0) ? (d[field] * (-1)) : d[field];
				if ((my_value > the_colorBands[a].start) && (my_value < the_colorBands[a].stop)) {
					the_fill = the_colorBands[a].color;
					break;
				}
			}
			return the_fill;
		}
		
	}
	
}())