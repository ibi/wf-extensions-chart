(function() {
	var selectedYear;
  //Set the Global IBI Variable if not exists
  if(typeof window.comIbicalendar_traditionalChartExtension == 'undefined') {
		window.comIbicalendar_traditionalChartExtension = {};
	}
	
	window.comIbicalendar_traditionalChartExtension = {
		draw: _draw
	};
	
	function _draw(ib3SLI, isDummyData) {
		
		$ib3.checkObject(ib3SLI);
		
		ib3SLI.config.checkServiceIsInitinalized();
		
		var w = ib3SLI.config.getChartWidth(),
			h = ib3SLI.config.getChartHeight(),
			colorScale = ib3SLI.config.getColorScale(),
			charBuckets = ib3SLI.config.getDataBuckets(),
			x_title = ib3SLI.config.getBucketTitle('dimension', 0),
			y_title = ib3SLI.config.getBucketTitle('value', 0),
			x_format = ib3SLI.config.getFormatByBucketName('dimension', 0),
			y_format = ib3SLI.config.getFormatByBucketName('value', 0),
			x_bucket = ib3SLI.config.getBucket('dimension'),
			hasComparevalue = false,
			shortenNumbers = ib3SLI.config.getProperty('scales.shorten_numbers'),
			typeShortenNumber = ib3SLI.config.getProperty('scales.typeShortenNumber'),
			shortenLeyendDescription = ib3SLI.config.getProperty('shortenLeyendDescription'),
			bodyBackgroundColor = ib3SLI.config.getProperty('chartConfig.bodyBackgroundColor') || "transparent",	
//
			initialDOW = ib3SLI.config.getProperty('calendarConfig.initialDOW'),
			dateFormat = ib3SLI.config.getProperty('calendarConfig.dateFormat'),			
			language_var = ib3SLI.config.getProperty('calendarConfig.language_var'),			
			showSelectYears = ib3SLI.config.getProperty('chartConfig.showSelectYears'),
//
			monthsColor = ib3SLI.config.getProperty('colors.months') || 'black',
			weeksColor = ib3SLI.config.getProperty('colors.weeks') || 'grey',
			daysColor = ib3SLI.config.getProperty('colors.days') || 'black';
	
		var originalData = ib3SLI.config.getData(),
		    data = $(originalData).map(function(i, d) {
				d.originalIndex = i;
				return d;
		}).get().reverse();
			
		d3.select('body')
			.style('background-color', bodyBackgroundColor)
		
		d3.select('rect.eventCatcher')
			.style('fill', bodyBackgroundColor)
		
		var margin = {
//			top: Math.round(CELL_SIZE*3.5),
			top: 40,
			right: 25,
			bottom: 5,
			left: 25
		};
		
		var width = w - margin.left - margin.right,
			height = h - margin.top - margin.bottom;
		
		var CELL_SIZE = {};
		CELL_SIZE.width = Math.round(width/31);
		CELL_SIZE.height = Math.round(height/23);

		var svg = d3.select(ib3SLI.config.getContainer())
			.attr('class', 'com_ibi_chart')
			.attr("width", width + margin.left + margin.right)
			.attr("height", height + margin.top + margin.bottom )
			.append("g")
			.attr("id","calendarContainer")
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

			
///////////////////////////////
// Define language_vars
	
var ru_RU = {
    "decimal": ",",
        "thousands": "\xa0",
        "grouping": [3],
        "currency": ["", " руб."],
        "dateTime": "%A, %e %B %Y г. %X",
        "date": "%d.%m.%Y",
        "time": "%H:%M:%S",
        "periods": ["AM", "PM"],
        "days": ["воскресенье", "понедельник", "вторник", "среда", "четверг", "пятница", "суббота"],
        "shortDays": ["вс", "пн", "вт", "ср", "чт", "пт", "сб"],
        "months": ["Январь", "Февраль", "Март", "Апрель", "Май", "Июнь", "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"],
        "shortMonths": ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
};

var en_US = {
    "decimal": ".",
    "thousands": ",",
    "grouping": [3],
    "currency": ["$", ""],
    "dateTime": "%a %b %e %X %Y",
    "date": "%m/%d/%Y",
    "time": "%H:%M:%S",
    "periods": ["AM", "PM"],
    "days": ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday",   "Saturday"],
    "shortDays": ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
    "months": ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
    "shortMonths": ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
};
	
var ja_JP = {
	"decimal": ".",
	"thousands": ",",
	"grouping": [3],
	"currency": ["", "円"],
	"dateTime": "%Y %b %e %a %X",
	"date": "%Y/%m/%d",
	"time": "%H:%M:%S",
	"periods": ["AM", "PM"],
	"days": ["日曜日", "月曜日", "火曜日", "水曜日", "木曜日", "金曜日", "土曜日"],
	"shortDays": ["日", "月", "火", "水", "木", "金", "土"],
	"months": ["睦月", "如月", "弥生", "卯月", "皐月", "水無月", "文月", "葉月", "長月", "神無月", "霜月", "師走"],
	"shortMonths": ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"]
};	
	
var fr_FR = {
	"decimal": ",",
	"thousands": ".",
	"grouping": [3],
	"currency": ["", " €"],
	"dateTime": "%A, le %e %B %Y, %X",
	"date": "%d/%m/%Y",
	"time": "%H:%M:%S",
	"periods": ["AM", "PM"], 
	"days": ["dimanche", "lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi"],
	"shortDays": ["dim.", "lun.", "mar.", "mer.", "jeu.", "ven.", "sam."],
	"months": ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"],
	"shortMonths": ["janv.", "févr.", "mars", "avr.", "mai", "juin", "juil.", "août", "sept.", "oct.", "nov.", "déc."]
};

var es_ES = {
	"decimal": ",",
	"thousands": ".",
	"grouping": [3],
	"currency": ["€", ""],
	"dateTime": "%a %b %e %X %Y",
	"date": "%d/%m/%Y",
	"time": "%H:%M:%S",
	"periods": ["AM", "PM"],
	"days": ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"],
	"shortDays": ["Dom", "Lun", "Mar", "Mi", "Jue", "Vie", "Sab"],
	"months": ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"],
	"shortMonths": ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"]
};	

var pt_BR = {
  "decimal": ',',
  "thousands": '.',
  "grouping": [3],
  "currency": ['R$', ''],
  "dateTime": '%A, %e de %B de %Y. %X',
  "date": '%d/%m/%Y',
  "time": '%H:%M:%S',
  "periods": ['AM', 'PM'],
  "days": ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'],
  "shortDays": ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'],
  "months": ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'],
  "shortMonths": ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
};

var es_MX = {
	"decimal": ".",
	"thousands": ",",
	"grouping": [3],
	"currency": ["$", ""],
	"dateTime": "%a %b %e %X %Y",
	"date": "%d/%m/%Y",
	"time": "%H:%M:%S",
	"periods": ["AM", "PM"],
	"days": ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"],
	"shortDays": ["Dom", "Lun", "Mar", "Mi", "Jue", "Vie", "Sab"],
	"months": ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"],
	"shortMonths": ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"]
};	

///////////////////////////////	



///////////////////////////////
// Definitions	

			if (language_var == "es_ES" ) 	
			{	var lenguaje = d3.timeFormatDefaultLocale(es_ES);	   }
			else if (language_var == "en_US" )
			{   var lenguaje = d3.timeFormatDefaultLocale(en_US);	   }
			else if (language_var == "fr_FR" )
			{   var lenguaje = d3.timeFormatDefaultLocale(fr_FR);	   }
			else if (language_var == "ja_JP" )
			{   var lenguaje = d3.timeFormatDefaultLocale(ja_JP);	   }
			else if (language_var == "ru_RU" )
			{   var lenguaje = d3.timeFormatDefaultLocale(ru_RU);	   }
			else if (language_var == "pt_BR" )
			{   var lenguaje = d3.timeFormatDefaultLocale(pt_BR);	   }
			else if (language_var == "es_MX" )
			{   var lenguaje = d3.timeFormatDefaultLocale(es_MX);	   }
			else
			{   var lenguaje = d3.timeFormatDefaultLocale(en_US);	   }


		var parseDate  = d3.timeParse(dateFormat);

		var max_date = d3.max(data, function(d) { return parseDate(d.dimension); }),
			min_date = d3.min(data, function(d) { return parseDate(d.dimension); });
					
			if (initialDOW == "Sunday" ) 	
			{	var f_daynumber = d3.timeFormat("%w");   }
			else
			{   var f_daynumber = d3.timeFormat("%u");   }
		var f_weeknumber = d3.timeFormat("%U");		
		var f_month = d3.timeFormat("%m");	
		var f_monthname = d3.timeFormat("%B");			
		var f_dayyear = d3.timeFormat("%j");	
		var f_dia = d3.timeFormat("%d");
		var f_wday = d3.timeFormat("%a");
		var f_year = d3.timeFormat("%Y");


		
		
///////////////////////////////
// Crear combo anios
// falla habeces, por ejemplo: d3.utcYears(new Date(2015, 01, 01), new Date(2015, 12, 12), 1);  devuelve 2016
//	var allGroup = d3.timeYears(d3.min(data, function(d) { return parseDate(d.dimension); }), d3.max(data, function(d) { return parseDate(d.dimension); }) ,1);
	var allGroup = new Array(),
		maxYear = f_year(d3.max(data, function(d) { return parseDate(d.dimension); })) * 1,
		minYear = f_year(d3.min(data, function(d) { return parseDate(d.dimension); })) * 1;
	for (var i = minYear; i <= maxYear; i++){
		allGroup.push(i);
	}
	if (!selectedYear){
//		selectedYear = f_year(d3.max(allGroup));
		selectedYear = d3.max(allGroup);
	}
	if (showSelectYears){
		d3.select(".chart").append("select").lower()
			.attr("class", "selectYears")
			.attr("id", "selectYears")
			.on("change", function(d){	   
					selectedYear = this.value;
					d3.select("#calendarContainer").selectAll("*").remove();
					generate_calendar_traditional(selectedYear);
					ib3SLI.config.finishRender();
			})
			.selectAll("select")
			.data(allGroup)
			.enter()
			.append('option')
//			.text(function (d) { return f_year(d); }) // text showed in the menu
			.text(function (d) { return d; }) // text showed in the menu
//			.attr("value", function (d) { return f_year(d); }); // corresponding value returned by the button
			.attr("value", function (d) { return d; }); // corresponding value returned by the button
		d3.select("#selectYears").property("value",selectedYear);
	}
	
		
///////////////////////////////

		
			
		function generate_calendar_traditional (year) {
			year = year * 1;
///////////////////////////////
// filter data
			var filteredData = data.filter(function(d){ return f_year(parseDate(d.dimension)) == year });
	
///////////////////////////////					
//	Drawing calendar background color for each day with value
        var dias = svg.selectAll(".day_valores").data(filteredData);
		dias.enter()
		.append('rect')
		.attr('fill', function(d) {
				return colorScale(d.value);
			})
//		.attr('fill', function (d){ return colorLineal(d.value); })
		.attr('stroke', '#fef7e7')
		.attr('stroke-width', '1px')
		.attr('width', CELL_SIZE.width)
		.attr('height', CELL_SIZE.height)
		.attr("class", function(d, i){ return ib3SLI.config.getDrillClass('riser', 0, d.originalIndex); })
		.each(function(d, g) {ib3SLI.config.setUpTooltip(this, 0, d.originalIndex,d); })
		.attr("x", function(d,i) {
			var monthNumber = f_month(parseDate(d.dimension)),
				resto4 = monthNumber % 4,
				auxIndex = ((resto4 == 0) ? 4 : resto4) - 1;
			return Math.round( ((f_daynumber(parseDate(d.dimension))-1) * CELL_SIZE.width) + (auxIndex * 8 * CELL_SIZE.width));
		})  
		.attr("y", function(d,i) {
			var monthNumber = f_month(parseDate(d.dimension)),
				functionToApply = (initialDOW == "Sunday" ) ? d3.timeSunday : d3.timeMonday,
				auxIndex = (monthNumber < 5) ? 1 : (monthNumber < 9) ? 9 : 17;
			return  Math.round( functionToApply.count(d3.timeMonth(parseDate(d.dimension)), parseDate(d.dimension)) * CELL_SIZE.height + auxIndex * CELL_SIZE.height)
		})
	;  
///////////////////////////////	
		
	

///////////////////////////////		
// Create month names titles
     var months = d3.timeMonths(new Date(year, 0), new Date(year + 1, 0),1);
     var mesestext = svg.selectAll(".text_meses")
        .data(months)
        .enter()
		.append("text")
		.attr('fill', monthsColor)
		.style("font-weight", "bold")
		.attr("text-anchor", "left")
		.attr("y", function (d,i) {
			var auxIndex = Math.trunc(i / 4) * 8;
			return Math.round( CELL_SIZE.height * auxIndex);
		})
		.attr("x", function (d,i) { 
			var auxIndex = i % 4;
			return Math.round(  CELL_SIZE.width * (8 * auxIndex));
		})
		.style("font-size", Math.round(  CELL_SIZE.height*2/3   )+"px")
		.text(f_monthname);		
	
///////////////////////////////			
// Create text for each day
     var days = d3.timeDays(new Date(year, 0), new Date(year + 1, 0),1);
     var daystext = svg.selectAll(".text_days")
        .data(days)
        .enter()
		.append("text")
/*
		.attr("class", function(d, i){
			return ib3SLI.config.getDrillClass('riser', 0, d.originalIndex);
		})
		.each(function(d, g){
			ib3SLI.config.setUpTooltip(this, 0, d.originalIndex,d);
		})
*/
		.style("font-size", Math.round(  CELL_SIZE.height/2   )+"px")
		.attr("x", function(d,i) {
			var monthNumber = f_month(d),
			resto4 = monthNumber % 4,
			auxIndex = ((resto4 == 0) ? 4 : resto4) - 1;
			return Math.round( (f_daynumber(d)*CELL_SIZE.width) + (auxIndex * 8 * CELL_SIZE.width) - (CELL_SIZE.width/2) );
		})
		.attr("y", function(d,i) {
			var monthNumber = f_month(d),
				functionToApply = (initialDOW == "Sunday" ) ? d3.timeSunday : d3.timeMonday,
				auxIndex = (monthNumber < 5) ? 1 : (monthNumber < 9) ? 9 : 17;
			return  Math.round( functionToApply.count(d3.timeMonth(d), d) * CELL_SIZE.height + auxIndex * CELL_SIZE.height + (CELL_SIZE.height/2));
		})				
		.attr('fill', daysColor)
		.attr("text-anchor", "middle")
		.attr("dominant-baseline",  "central")
		.text(f_dia);	
///////////////////////////////		  



///////////////////////////////
// Create titles for day of the week
     var days = d3.timeDays(new Date(year, 0), new Date(year + 1, 0),1);
     var daystext = svg.selectAll(".text_wday")
        .data(days)
        .enter()
		.append("text")
		.style("font-size", Math.round(  CELL_SIZE.height/2   )+"px")
		.attr("x", function(d,i) { 
			var monthNumber = f_month(d),
				resto4 = monthNumber % 4,
				auxIndex = ((resto4 == 0) ? 4 : resto4) - 1;
			return Math.round(  ((f_daynumber(d)-1)*CELL_SIZE.width) + (CELL_SIZE.width/2) + (auxIndex * 8 * CELL_SIZE.width) );
		})
		.attr("y", function(d,i) {
			var monthNumber = f_month(d),
				auxIndex = (monthNumber < 5) ? 1 : (monthNumber < 9) ? 9 : 17;
			return  auxIndex * CELL_SIZE.height - (CELL_SIZE.height/2);
		})						
		.attr('fill', weeksColor)
		.attr("text-anchor", "middle")
		.attr("dominant-baseline",  "central")
		.text(f_wday);
///////////////////////////////	 

var myLegend= d3.selectAll(".legend")
	.selectAll("text");
//$ib3.utils.getFormattedNumber(ib3SLI.config.formatNumber, d.value, valueFormat, shortenValue, typeShortenNumber);

///////////////////////////////
// Transform scale label
/*
var escaleSuffix= typeShortenNumber;
	if (typeShortenNumber=="U") 
			{
				var divisor= 1;
				var escaleSuffix= "";
			}
	if (typeShortenNumber=="K") 
			{
				var divisor= 1000;
			}
	else if (typeShortenNumber=="M") 
			{
				var divisor= 1000000;
			}
	else if (typeShortenNumber=="B") 
			{
				var divisor= 1000000000;
			}	
	else if (typeShortenNumber=="T") 
			{
				var divisor= 1000000000000;
			}
	else 
			{
				var divisor= 1;
			}			
function parseNumber(value, locale2 = navigator.language) {
  const exampleNumber = '1,1';	
  const example = Intl.NumberFormat(locale2).format(exampleNumber);
  const cleanPattern = new RegExp(`[^-+0-9${ example.charAt( 1 ) }]`, 'g');
  const cleaned = value.replace(cleanPattern, '');
  const normalized = cleaned.replace(example.charAt(1), '.');
  return parseFloat(normalized);
}
var myLegend= d3.selectAll(".legend")
	.selectAll("text")
	});
			if (shortenNumbers){				
				myLegend.each(function(d, i) {
				  d3.select(this).text( Math.round(parseNumber(d3.select(this).text())/divisor) + escaleSuffix);
				});
			} else if ( max < 10 )
			{				
				myLegend.each(function(d, i) {
				  d3.select(this).text( Math.round(parseNumber(d3.select(this).text())/1)*1);
				});
				
			} else if ( max < 100 )
			{				
				myLegend.each(function(d, i) {
				  d3.select(this).text( Math.round(parseNumber(d3.select(this).text())/10)*10);
				});
				
			} else if ( max < 1000 )
			{				
				myLegend.each(function(d, i) {
				  d3.select(this).text( Math.round(parseNumber(d3.select(this).text())/100)*100);
				});
				
			} else if ( max < 10000 )
			{				
				myLegend.each(function(d, i) {
				  d3.select(this).text( Math.round(parseNumber(d3.select(this).text())/1000)*1000);
				});
				
			} else if ( max < 10000 )
			{				
				myLegend.each(function(d, i) {
				  d3.select(this).text( Math.round(parseNumber(d3.select(this).text())/1000)*1000);
				});
				
			} else if ( max < 100000 )
			{				
				myLegend.each(function(d, i) {
				  d3.select(this).text( Math.round(parseNumber(d3.select(this).text())/10000)*10000);
				});
				
			} else if ( max < 1000000 )
			{				
				myLegend.each(function(d, i) {
				  d3.select(this).text( Math.round(parseNumber(d3.select(this).text())/100000)*100000);
				});
				
			} else 
			{				
				myLegend.each(function(d, i) {
				  d3.select(this).text( Math.round(parseNumber(d3.select(this).text())));
				});
				
			}
*/
///////////////////////////////
 
		

		}

			
		generate_calendar_traditional(selectedYear);
		ib3SLI.config.finishRender();
	
	}
	
}())
