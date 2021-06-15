/* Copyright (c) 1996-2021 TIBCO Software Inc. All Rights Reserved. */
/* $Revision: 1.4 $ */

(function () {

	function abbreviateNumber(number) {
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
	}

	// All extension callback functions are passed a standard 'renderConfig' argument:
	//
	// Properties that are always available:
	//   moonbeamInstance: the chart instance currently being rendered
	//   data: the data set being rendered
	//   properties: the block of your extension's properties, as they've been set by the user
	//   modules: the 'modules' object from your extension's config, along with additional API methods
	//   
	// Properties available during render callback:
	//   width: width of the container your extension renders into, in px
	//   height: height of the container your extension renders into, in px
	//   containerIDPrefix:  the ID of the DOM container your extension renders into.  Prepend this to *all* IDs your extension generates, to ensure multiple copies of your extension work on one page.
	//   container: DOM node for your extension to render into;
	//   rootContainer: DOM node containing the specific chart engine instance being rendered.

	// Optional: if defined, is called exactly *once* during chart engine initialization
	// Arguments:
	//  - successCallback: a function that you must call when your extension is fully
	//     initialized - pass in true if init is successful, false otherwise.
	// - initConfig: the standard callback argument object (moonbeamInstance, data, properties, etc)
	function initCallback(successCallback, initConfig) {
		successCallback(true);
	}

	// Optional: if defined, is invoked once at the very beginning of each chart engine draw cycle
	// Use this to configure a specific chart engine instance before rendering.
	// Arguments: 
	//  - preRenderConfig: the standard callback argument object
	function preRenderCallback(preRenderConfig) {

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

		var chart = renderConfig.moonbeamInstance;
		var props = renderConfig.properties;

		var container = renderConfig.container;
		var data = renderConfig.data;
		var dataBuckets = renderConfig.dataBuckets.buckets;

		/* Set Background Color */
		//$(renderConfig.rootContainer).parent().css('backgroundColor',props.backgroundColor);

		/* Format JSON Data */
		if (typeof data[0].measure !== 'undefined' && typeof data[0].xaxis !== 'undefined') {
			var total = 0;
			var groups = [];

			var group;
			var lastGroup = '';



			data.forEach(function (row, index) {
				if (typeof row.group === 'undefined') {
					if (groups.length == 0)
						groups.push({ total: 0, points: [] });
					groups[0].points.push(row.measure);
					groups[0].total += row.measure;
				}
				else {
					if (row.group != lastGroup) {
						total = 0;
						group = { group: row.group, total: 0, points: [] };
						groups.push(group);
					}
					groups[groups.length - 1].points.push(row.measure);
					groups[groups.length - 1].total += row.measure;
					lastGroup = row.group;
				}
			});

			var titleElement = $('foreignObject[class="title"]');

			var titleHeight = titleElement.length == 1 ? titleElement.height() + 5 : 0;

			$(container).closest('body').css('overflow', 'hidden');
			$(container).css('top', titleHeight + 'px').append('<div class="kpi-table-container" style="font-size:' + props.fontSize + ';color:' + props.color + '"></div>');

			if (groups.length > 1)
				$(container).find('.kpi-table-container').addClass('multi').append('<div class="kpi-table-nav"></div>');

			groups.forEach(function (group, index) {
				if (typeof group.group !== 'undefined')
					$(container).find('.kpi-table-container>.kpi-table-nav').append('<a href="#" class="kpi-table-nav-pill">' + group.group + '</a>');

				//VIZ-573 BEGIN
				var finalNumber = getNumberToShow(group.points, props.aggregationType);
				//VIZ-573 END
				var slide = '<div class="kpi-table-slide"><table>'
					+ '<thead>'
					+ '<tr><th class="kpi-table-heading-title" style="font-weight:' + props.headingTitle.fontWeight + ';font-size:' + props.headingTitle.fontSize + ';color:' + props.headingTitle.color + '">' + dataBuckets.measure.title + ' <span style="font-weight:' + props.headingSubtitle.fontWeight + ';font-size:' + props.headingSubtitle.fontSize + ';color:' + props.headingSubtitle.color + '">' + dataBuckets.xaxis.title + '</span></th>'
					+ '<th class="kpi-table-heading-nbr" style="font-weight:' + props.headingData.fontWeight + ';font-size:' + props.headingData.fontSize + ';color:' + props.headingData.color + '">' + abbreviateNumber(finalNumber) + '</th></tr>'
					+ '</thead>'
					+ '<tbody><tr><td colspan="2" class="kpi-table-sparkline"></td></tr></tbody></table></div>'
				$(container).find('.kpi-table-container').append(slide);

				var chartProperties;
				var seriesColor = props.barProperties.goodColor;
				//BEGIN VIZ-493 - new extension property autoFit 
				if (props.type == 'bar')
					chartProperties = { type: props.type, barWidth: props.autoFit ? undefined : props.barProperties.width, height: props.barProperties.height, barColor: seriesColor, barSpacing: 3 };
				else
					chartProperties = { type: props.type, width: props.autoFit ? props.maxWidth : props.barProperties.width * (group.points.length - 1), height: props.barProperties.height, lineColor: seriesColor, lineWidth: 2, fillColor: 'rgba(0,0,0,0)', spotColor: 'rgba(0,0,0,0)', minSpotColor: 'rgba(0,0,0,0)', maxSpotColor: 'rgba(0,0,0,0)', highlightLineColor: 'rgba(0,0,0,0)' };
				//END VIZ-493
				$(container).find('.kpi-table-slide:last .kpi-table-sparkline').sparkline(group.points, chartProperties);
			});

			$(container).find('.kpi-table-nav-pill:first,.kpi-table-slide:first').addClass('active');

			$(container).find('.kpi-table-nav-pill').on('touchstart click', function (e) {
				e.stopPropagation();
				e.preventDefault();

				var activeIndex = $(this).parent().children('.active').index();
				var index = $(this).index();
				var prevIndex = index == 0 ? $(this).parent().children().length : index - 1;
				var nextIndex = index == $(this).parent().children().length ? 0 : index + 1;
				console.log('index:', index, 'next:', nextIndex, 'prev:', prevIndex);

				$(this).addClass('active').siblings().removeClass('active');

				var $container = $(this).closest('.kpi-table-container');
				if (activeIndex < index) {
					$container.find('.kpi-table-slide:eq(' + activeIndex + ')').animate({ left: '-200%' }, function () { $(this).removeClass('active') });
					$container.find('.kpi-table-slide:eq(' + index + ')').css('left', '200%').addClass('active').animate({ left: '0' });
				}
				else if (activeIndex > index) {
					$container.find('.kpi-table-slide:eq(' + activeIndex + ')').animate({ left: '200%' }, function () { $(this).removeClass('active') });
					$container.find('.kpi-table-slide:eq(' + index + ')').css('left', '-200%').addClass('active').animate({ left: '0' });
				}
			})

		}

		renderConfig.renderComplete();
	}
	//VIZ-573 BEGIN
	function getNumberToShow(dataArray, aggregationType) {
		var finalNumber = null;

		switch (aggregationType) {
			case "First":
				return dataArray[dataArray.length - 1];

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
				return dataArray[0];
		}
	}
	//VIZ-573 END

	function noDataRenderCallback(renderConfig) {
		var container = renderConfig.container;
		var grey = renderConfig.baseColor;
		renderConfig.data = [{ "group": "2017", "xaxis": "1", "measure": 35861466.38, "_s": 0, "_g": 0 }, { "group": "2017", "xaxis": "2", "measure": 32447335.21, "_s": 0, "_g": 1 }, { "group": "2017", "xaxis": "3", "measure": 35431268.47, "_s": 0, "_g": 2 }, { "group": "2017", "xaxis": "4", "measure": 32401840.77, "_s": 0, "_g": 3 }, { "group": "2017", "xaxis": "5", "measure": 33927910.25, "_s": 0, "_g": 4 }, { "group": "2017", "xaxis": "6", "measure": 32732103.34, "_s": 0, "_g": 5 }, { "group": "2017", "xaxis": "7", "measure": 33867267.96, "_s": 0, "_g": 6 }, { "group": "2017", "xaxis": "8", "measure": 34030687.74, "_s": 0, "_g": 7 }, { "group": "2017", "xaxis": "9", "measure": 33129035.69, "_s": 0, "_g": 8 }, { "group": "2017", "xaxis": "10", "measure": 41468698.51, "_s": 0, "_g": 9 }, { "group": "2017", "xaxis": "11", "measure": 41330631.98, "_s": 0, "_g": 10 }, { "group": "2017", "xaxis": "12", "measure": 45063421.35, "_s": 0, "_g": 11 }, { "group": "2016", "xaxis": "1", "measure": 22177047.24, "_s": 0, "_g": 12 }, { "group": "2016", "xaxis": "2", "measure": 20713191.81, "_s": 0, "_g": 13 }, { "group": "2016", "xaxis": "3", "measure": 22452940.04, "_s": 0, "_g": 14 }, { "group": "2016", "xaxis": "4", "measure": 20640310.85, "_s": 0, "_g": 15 }, { "group": "2016", "xaxis": "5", "measure": 20959571.54, "_s": 0, "_g": 16 }, { "group": "2016", "xaxis": "6", "measure": 20936944.44, "_s": 0, "_g": 17 }, { "group": "2016", "xaxis": "7", "measure": 21603354.91, "_s": 0, "_g": 18 }, { "group": "2016", "xaxis": "8", "measure": 21851731.9, "_s": 0, "_g": 19 }, { "group": "2016", "xaxis": "9", "measure": 21194759.49, "_s": 0, "_g": 20 }, { "group": "2016", "xaxis": "10", "measure": 25734517.06, "_s": 0, "_g": 21 }, { "group": "2016", "xaxis": "11", "measure": 25549323.64, "_s": 0, "_g": 22 }, { "group": "2016", "xaxis": "12", "measure": 26292085.01, "_s": 0, "_g": 23 }, { "group": "2015", "xaxis": "1", "measure": 10194919.22, "_s": 0, "_g": 24 }, { "group": "2015", "xaxis": "2", "measure": 9271678.03, "_s": 0, "_g": 25 }, { "group": "2015", "xaxis": "3", "measure": 10166669.36, "_s": 0, "_g": 26 }, { "group": "2015", "xaxis": "4", "measure": 9176805.13, "_s": 0, "_g": 27 }, { "group": "2015", "xaxis": "5", "measure": 9644014.21, "_s": 0, "_g": 28 }, { "group": "2015", "xaxis": "6", "measure": 9270650.48, "_s": 0, "_g": 29 }, { "group": "2015", "xaxis": "7", "measure": 9823910.8, "_s": 0, "_g": 30 }, { "group": "2015", "xaxis": "8", "measure": 10039632.37, "_s": 0, "_g": 31 }, { "group": "2015", "xaxis": "9", "measure": 9763960.06, "_s": 0, "_g": 32 }, { "group": "2015", "xaxis": "10", "measure": 11932626.45, "_s": 0, "_g": 33 }, { "group": "2015", "xaxis": "11", "measure": 11606727.04, "_s": 0, "_g": 34 }, { "group": "2015", "xaxis": "12", "measure": 12572846.65, "_s": 0, "_g": 35 }, { "group": "2014", "xaxis": "1", "measure": 7298667.22, "_s": 0, "_g": 36 }, { "group": "2014", "xaxis": "2", "measure": 6801359.08, "_s": 0, "_g": 37 }, { "group": "2014", "xaxis": "3", "measure": 7263788.97, "_s": 0, "_g": 38 }, { "group": "2014", "xaxis": "4", "measure": 6611436.62, "_s": 0, "_g": 39 }, { "group": "2014", "xaxis": "5", "measure": 6795189.18, "_s": 0, "_g": 40 }, { "group": "2014", "xaxis": "6", "measure": 6618896, "_s": 0, "_g": 41 }, { "group": "2014", "xaxis": "7", "measure": 6987826.48, "_s": 0, "_g": 42 }, { "group": "2014", "xaxis": "8", "measure": 7024899.82, "_s": 0, "_g": 43 }, { "group": "2014", "xaxis": "9", "measure": 6679889.03, "_s": 0, "_g": 44 }, { "group": "2014", "xaxis": "10", "measure": 8281929.67, "_s": 0, "_g": 45 }, { "group": "2014", "xaxis": "11", "measure": 8037545.37, "_s": 0, "_g": 46 }, { "group": "2014", "xaxis": "12", "measure": 8427240.8, "_s": 0, "_g": 47 }, { "group": "2013", "xaxis": "1", "measure": 4666392.2, "_s": 0, "_g": 48 }, { "group": "2013", "xaxis": "2", "measure": 4400576.8, "_s": 0, "_g": 49 }, { "group": "2013", "xaxis": "3", "measure": 4726378.34, "_s": 0, "_g": 50 }, { "group": "2013", "xaxis": "4", "measure": 4254925.17, "_s": 0, "_g": 51 }, { "group": "2013", "xaxis": "5", "measure": 4412965.72, "_s": 0, "_g": 52 }, { "group": "2013", "xaxis": "6", "measure": 4656829.9, "_s": 0, "_g": 53 }, { "group": "2013", "xaxis": "7", "measure": 4884691.35, "_s": 0, "_g": 54 }, { "group": "2013", "xaxis": "8", "measure": 4957273.31, "_s": 0, "_g": 55 }, { "group": "2013", "xaxis": "9", "measure": 4856841.92, "_s": 0, "_g": 56 }, { "group": "2013", "xaxis": "10", "measure": 5597174.49, "_s": 0, "_g": 57 }, { "group": "2013", "xaxis": "11", "measure": 5583364.73, "_s": 0, "_g": 58 }, { "group": "2013", "xaxis": "12", "measure": 5815484.48, "_s": 0, "_g": 59 }, { "group": "2012", "xaxis": "1", "measure": 3874651.96, "_s": 0, "_g": 60 }, { "group": "2012", "xaxis": "2", "measure": 3592608.63, "_s": 0, "_g": 61 }, { "group": "2012", "xaxis": "3", "measure": 3977546.75, "_s": 0, "_g": 62 }, { "group": "2012", "xaxis": "4", "measure": 3648111.77, "_s": 0, "_g": 63 }, { "group": "2012", "xaxis": "5", "measure": 3704586.77, "_s": 0, "_g": 64 }, { "group": "2012", "xaxis": "6", "measure": 3694435.21, "_s": 0, "_g": 65 }, { "group": "2012", "xaxis": "7", "measure": 4020855.35, "_s": 0, "_g": 66 }, { "group": "2012", "xaxis": "8", "measure": 4126310.8, "_s": 0, "_g": 67 }, { "group": "2012", "xaxis": "9", "measure": 3688054.34, "_s": 0, "_g": 68 }, { "group": "2012", "xaxis": "10", "measure": 4794720.4, "_s": 0, "_g": 69 }, { "group": "2012", "xaxis": "11", "measure": 4574636.32, "_s": 0, "_g": 70 }, { "group": "2012", "xaxis": "12", "measure": 5001973.63, "_s": 0, "_g": 71 }];
		renderConfig.dataBuckets = { "buckets": { "group": { "title": "Sale Year", "count": 1 }, "xaxis": { "title": "Sale Month", "count": 1 }, "measure": { "title": "Revenue", "count": 1 } }, "depth": 1 };
		renderCallback(renderConfig);

		$(container).append('<div class="placeholder">Add measures or dimensions</div>');
	}

	// Your extension's configuration
	var config = {
		id: 'com.ibi.kpi.sparkline2',     // string that uniquely identifies this extension
		containerType: 'html',  // either 'html' or 'svg' (default)
		initCallback: initCallback,
		preRenderCallback: preRenderCallback,  // reference to a function that is called right *before* your extension is rendered.  Will be passed one 'preRenderConfig' object, defined below.  Use this to configure a Monbeam instance as needed
		renderCallback: renderCallback,  // reference to a function that will draw the actual chart.  Will be passed one 'renderConfig' object, defined below
		noDataPreRenderCallback: noDataPreRenderCallback,
		noDataRenderCallback: noDataRenderCallback,
		resources: {
			script:
				window.jQuery
					? ['lib/jquery.sparkline.min.js']
					: [
						['', tdgchart.getScriptPath().split('/')[1], 'jquery/js/jquery.js'].join('/'),
						'lib/jquery.sparkline.min.js'
					],
			css: ['css/open-sans.css', 'css/sparkline.css']
		},
		modules: {
			dataSelection: {
				supported: true,  // Set this true if your extension wants to enable data selection
				needSVGEventPanel: true, // if you're using an HTML container or altering the SVG container, set this to true and the chart engine will insert the necessary SVG elements to capture user interactions
				svgNode: function (arg) { }  // if you're using an HTML container or altering the SVG container, return a reference to your root SVG node here.
			},
			eventHandler: {
				supported: true
			},
			tooltip: {
				supported: false,  // Set this true if your extension wants to enable HTML tooltips
				// This callback is called when no default tooltip content is passed into the chart.
				// Use this to define 'nice' default tooltips for the given target, ids & data.
				// Return value can be a string (including HTML), or HTML nodes, or any Moonbeam tooltip API object.
				autoContent: function (target, s, g, d, data) {
					if (d.hasOwnProperty('color')) {
						return 'Bar Size: ' + d.value + '<br />Bar Color: ' + d.color;
					}
					return 'Bar Size: ' + d.value;
				}
			}
		}
	};

	// Required: this call will register your extension with the chart engine
	tdgchart.extensionManager.register(config);
}());
