/*global tdgchart: false, pv: false, d3: false */
/* Copyright (c) 1996-2021 TIBCO Software Inc. All Rights Reserved. */

(function () {
  var chartVersion = '1.2';

  //start VIZ-391
  //supporting helper functions and properties
  var utils = {
    checkDateFormat: function (sampleDateString, expectedDateFormat) {
      var regexYMD =
        /^\d{4}[\/\-](0?[1-9]|1[012])[\/\-](0?[1-9]|[12][0-9]|3[01])$/;
      var regexDMY =
        /^(0?[1-9]|[12][0-9]|3[01])[\/\-](0?[1-9]|1[012])[\/\-]\d{4}$/;
      var regexMDY =
        /^(0?[1-9]|1[012])[\/\-](0?[1-9]|[12][0-9]|3[01])[\/\-]\d{4}$/;

      var formatType = null;

      var toCompareFormat = expectedDateFormat.toLowerCase();

      if (
        toCompareFormat == '%d/%m/%y' ||
        toCompareFormat == '%d-%m-%y' ||
        toCompareFormat == '%d.%m.%y'
      ) {
        formatType = regexDMY.test(sampleDateString) ? 'DMY' : null;
        return formatType == 'DMY';
      }

      if (
        toCompareFormat == '%m/%d/%y' ||
        toCompareFormat == '%m-%d-%y' ||
        toCompareFormat == '%m.%d.%y'
      ) {
        formatType = regexMDY.test(sampleDateString) ? 'MDY' : null;
        return formatType == 'MDY';
      }

      if (
        toCompareFormat == '%y/%m/%d' ||
        toCompareFormat == '%y-%m-%d' ||
        toCompareFormat == '%y.%d.%d'
      ) {
        formatType = regexYMD.test(sampleDateString) ? 'YMD' : null;
        return formatType == 'YMD';
      }

      return false;
    },
    labels: {
      en: {
        errorMsgLine1: 'Invalid Date format. Expecting date in the format: ',
        errorMsgLine2:
          "Change your date field format or change the extension's date format property.",
      },
    },
  };
  //end VIZ-391
  // Optional: if defined, is called exactly *once* during chart engine initialization
  // Arguments:
  //  - successCallback: a function that you must call when your extension is fully
  //     initialized - pass in true if init is successful, false otherwise.
  // - initConfig: the standard callback argument object (moonbeamInstance, data, properties, etc)
  function initCallback(successCallback, initConfig) {
    successCallback(true);
  }

  // Optional: if defined, is called once before each draw that does not include any data
  // Arguments:
  //  - preRenderConfig: the standard callback argument object (moonbeamInstance, data, properties, etc)
  function noDataPreRenderCallback(preRenderConfig) {
    var chart = preRenderConfig.moonbeamInstance;
    chart.legend.visible = true;
    chart.dataArrayMap = undefined;
    chart.dataSelection.enabled = false;
  }

  // Optional: if defined, is called whenever this extension must be drawn but doesn't yet have any data.
  // Use this to define the extensions' initial 'grey state' appearance.
  // Arguments:
  //  - renderConfig: the standard callback argument object (moonbeamInstance, data, properties, etc)
  function noDataRenderCallback(renderConfig) {
    renderConfig.testData = true;

    var grey = renderConfig.baseColor;
    renderConfig.data = JSON.parse(
      '[{"dimension":"01/01/2020","value":89753898,"comparevalue":39854440.529977,"_s":0,"_g":0},{"dimension":"02/01/2020","value":104866857,"comparevalue":49598845.239997,"_s":0,"_g":1},{"dimension":"03/01/2020","value":69807664,"comparevalue":33508818.119933,"_s":0,"_g":2},{"dimension":"04/01/2020","value":190240481,"comparevalue":55832578.359965,"_s":0,"_g":3},{"dimension":"05/01/2020","value":205113863,"comparevalue":86181070.519796,"_s":0,"_g":4},{"dimension":"06/01/2020","value":61551109,"comparevalue":16830023.810008,"_s":0,"_g":5},{"dimension":"07/01/2020","value":40105657,"comparevalue":17947619.620011,"_s":0,"_g":6}]',
    );
    //renderConfig.dataBuckets.depth = 2;
    renderConfig.moonbeamInstance.dataBuckets = JSON.parse(
      '{"buckets":{"dimension":{"title":"01/01/2020","count":1},"value":{"title":"02/01/2020","count":1},"comparevalue":{"title":"03/01/2020","count":1}},"depth":1}',
    );
    renderConfig.moonbeamInstance.getSeries(0).color = grey;
    renderConfig.moonbeamInstance.getSeries(1).color = pv
      .color(grey)
      .lighter(0.18).color;
    renderCallback(renderConfig);
  }

  // Required: Invoked during each chart engine draw cycle
  // This is where your extension should be rendered
  // Arguments:
  //  - renderConfig: the standard callback argument object, including additional properties width, height, etc
  // This simple bar extension supports:
  //  - multiple measure entries in a generic 'value' bucket.  Each value will be drawn on its own split-y axis.
  //  - one dimension entry in a generic 'labels' bucket.  This bucket defines the set of labels on the ordinal axis.
  //  - one dimension entry in the built-in 'series_break' bucket.  This will split each value entry into multiple similar colors.
  function renderCallback(renderConfig) {
    var data = renderConfig.data;
    var colorScale = renderConfig.modules.colorScale.getColorScale();

    //start VIZ-391
    //test to see if the date format of the data adheres to the extension's date format
    var testDate = utils.checkDateFormat(
      data[0].dimension,
      renderConfig.properties.calendarConfig.dateFormat,
    );

    if (!testDate) {
      //if not, then show an error message
      var messageHTML = [];
      messageHTML.push(
        '<div id="' + renderConfig.rootContainer.id + '-messageContainer">',
      );
      messageHTML.push(
        '<div style="display: table-cell; vertical-align: middle; text-align: center;">',
      );
      messageHTML.push(
        utils.labels.en.errorMsgLine1 +
          renderConfig.properties.calendarConfig.dateFormat +
          '<br/>',
      );
      messageHTML.push(utils.labels.en.errorMsgLine2 + '<br/>');
      messageHTML.push('</div>'); //end content container
      messageHTML.push('</div>'); //end container root
      $(renderConfig.rootContainer).html(messageHTML.join(''));

      var msgContainer = $(
        '#' + renderConfig.rootContainer.id + '-messageContainer',
      );
      msgContainer.css('display', 'table');
      msgContainer.css('height', renderConfig.height + 'px');
      msgContainer.css('width', renderConfig.width + 'px');
      return;
    }
    //END VIZ-391
    var isDummyData = renderConfig.testData;
    //IMPORTANT: Setup the renderConfig to custom $ib3

    var ib3SLI = $ib3(renderConfig, {
      tooltip: {
        hiddenBuckets: ['kpisign'],
      },
    });

    window.comIbicalendar_traditionalChartExtension.draw(ib3SLI, isDummyData);
  }

  // Your extension's configuration
  var config = {
    id: 'com.ibi.calendar_traditional', // string that uniquely identifies this extension
    containerType: 'svg', // either 'html' or 'svg' (default)
    initCallback: initCallback,
    renderCallback: renderCallback, // reference to a function that will draw the actual chart.  Will be passed one 'renderConfig' object, defined below
    noDataPreRenderCallback: noDataPreRenderCallback,
    noDataRenderCallback: noDataRenderCallback,
    resources: {
      // Additional external resources (CSS & JS) required by this extension
      script: (function () {
        var scripts = [];
        if (!window.jQuery) {
          var tdgchartPath = tdgchart.getScriptPath();
          jqueryPath =
            tdgchartPath.substr(0, tdgchartPath.indexOf('tdg')) +
            'jquery/js/jquery.js';

          scripts.push(jqueryPath);
        }

        var customScripts = [
          'lib/d3.v5.min.js?' + chartVersion,
          'services/config-service.min.js?' + chartVersion,
          'services/utils-service.min.js?' + chartVersion,
          'chart/chart.js?' + chartVersion,
        ];

        return scripts.concat(customScripts);
      })(),
      css: ['css/calendar_traditional.css?' + chartVersion],
    },
    modules: {
      dataSelection: {
        supported: false, // Set this true if your extension wants to enable data selection
        needSVGEventPanel: false, // if you're using an HTML container or altering the SVG container, set this to true and the chart engine will insert the necessary SVG elements to capture user interactions
        svgNode: function () {}, // if you're using an HTML container or altering the SVG container, return a reference to your root SVG node here.
      },
      eventHandler: {
        supported: true,
      },
      tooltip: {
        supported: true, // Set this true if your extension wants to enable HTML tooltips
        // This callback is called when no default tooltip content is passed into the chart.
        // Use this to define 'nice' default tooltips for the given target, ids & data.
        // Return value can be a string (including HTML), or HTML nodes, or any Moonbeam tooltip API object.
        autoContent: function (target, s, g, d) {
          if (d.hasOwnProperty('color')) {
            return 'Bar Size: ' + d.value + '<br />Bar Color: ' + d.color;
          }
          return 'Bar Size: ' + d.value;
        },
      },
      //			sizeScale: {
      //				supported: false,  // This must be true to enable size scale support
      //
      //				// Use this to manually define the diameter of the largest marker.  Can be a function callbacl.
      //				// Should return a number representing the diameter of the shape in pixels.  If undefined,
      //				// the chart engine will pick a 'nice' max diameter based on the current chart size.
      //				maxDiameter: null,
      //
      //				// Return a {min, max} object that defines the axis min and max values for this size scale
      //				minMax: function(renderConfig) {
      //					// If there's nothing in the size bucket, the min / max code below will fail because 'd.size' is null.
      //					// But this minMax callback must return valid numbers for min & max, otherwise the generated
      //					// sizeScale() will be ill-defined.  Setting min = max = 1 gives a sizeScale that always returns 1.
      //					debugger
      //					if (renderConfig.dataBuckets.getBucket('size') == null) {
      //						return {min: 1, max: 1};
      //					}
      //					return {
      //						min: 25,
      //						max: 10000,
      //					};
      //				}
      //			},
      dataLabels: {
        supported: false, // This must be true to enable data label support
        defaultDataArrayEntry: function (arg) {
          // Return the name of the 'default' bucket that should be used to define data label content,
          // if a more specific data label content lookup is not found.
          return 'value';
        },
      },
      colorScale: {
        supported: true, // This must be true to enable color scale support
        minMax: function (renderConfig) {
          var forceMax = false,
            forceMin = false,
            chart = renderConfig.moonbeamInstance;

          if (chart.colorScale.min == 'min') {
            chart.colorScale.min = d3.min(renderConfig.data, function (d) {
              return d.value;
            });
          } else {
            forceMin = true;
          }

          if (chart.colorScale.max == 'max') {
            chart.colorScale.max = d3.max(renderConfig.data, function (d) {
              return d.value;
            });
          } else {
            forceMax = true;
          }

          var virtualAxis = d3
            .scaleLinear()
            .domain([chart.colorScale.min, chart.colorScale.max])
            .nice(chart.colorScale.colors.length)
            .ticks(chart.colorScale.colors.length);
          if (!forceMin) chart.colorScale.min = virtualAxis[0];
          if (!forceMax)
            chart.colorScale.max = virtualAxis[virtualAxis.length - 1];

          //return {
          //	min: 25,
          //	max: 10000,
          //	colors: ['blue','red']
          //}
        },
      },

      legend: {
        colorMode: 'data', // Return 'data' to always draw a color scale in the legend
      },
    },
  };

  // Required: this call will register your extension with the chart engine
  tdgchart.extensionManager.register(config);
})();
