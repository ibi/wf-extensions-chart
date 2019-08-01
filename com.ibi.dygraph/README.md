#### Extension for WebFocus 8200
# Dygraph Chart
For installation instructions please visit this [link] (https://github.com/ibi/wf-extensions-chart/wiki/Installing-a-WebFocus-Extension "Installing a WebFocus Extension").
## Description
This extension exposes the DyGraph (version 2.1.0) which shows multiple series of data across a Date Range.
## Screenshots
![screenshot_1](https://github.com/ibi/wf-extensions-chart/blob/master/com.ibi.dygraph/screenshots/1.png)
## Configurations
To configure the default values for this extension, edit "properties" object in properties.json file.

Note that some properties have been moved (e.g. xAxisLabel) to a more relevant location in the hierarchy to make it easier to locate them within the GUI.

Some properties, such as "colors" have been changed to allow arrays to be selected within the GUI as, currently, arrays are not able to be modified in the GUI.
These are reassigned within the JavaScript as necessary.

	"properties": {
      "axes": {
        "x": {
          "pixelsPerLabel": 70,
          "axisLabelHeight": 18,
          "axisLabelWidth": 60,
          "axisLabel": "x Axis Label",
          "axisLineColor": "rgb(0,0,0)",
          "axisLabelFontSize": 14,
          "axisLineWidth": 0.15,
          "axisTickSize": 3.0,
          "drawGrid": true,
          "gridLineColor": "#999999",
          "gridLineWidth": 0.1,
          "drawAxis": true,
          "independentTicks": true,
        },
        "y": {
          "pixelsPerLabel": 30,
          "axisLabelHeight": 18,
          "axisLabelWidth": 50,
          "axisLabel": "y Axis Label",
          "axisLineColor": "rgb(0,0,0)",
          "axisLabelFontSize": 14,
          "axisLineWidth": 0.15,
          "axisTickSize": 3.0,
          "drawGrid": true,
          "gridLineColor": "#999999",
          "gridLineWidth": 0.1,
          "drawAxis": true,
          "independentTicks": true
        }
      },
      "colors": {
        "color0": "rgb(102,128,0)",
        "color1": "rgb(102,0,128)",
        "color2": "rgb(0,51,128)",
        "color3": "rgb(0,128,51)",
        "color4": "rgb(51,0,128)",
        "color5": "rgb(0,102,128)",
        "color6": "rgb(128,102,0)",
        "color7": "rgb(0,128,51)",
        "color8": "rgb(0,128,102)",
        "color9": "rgb(102,128,51)"
      },
      "titleHeight": 28,
      "labelsKMB": false,
      "labelsSeparateLines": true,
      "legend": "always",
      "title": "DyGraphs.com",
      "errorBars": false,
      "showRoller": false,
      "rollPeriod": 14,
      "maxNumberWidth": 12,
      "includeZero": false,
      "logscale": false,
      "panEdgeFraction": 0.01,
      "connectSeparatedPoints": false,
      "drawGapEdgePoints": false,
      "animatedZooms": false,
      "stackedGraph": false,
      "fillGraph": false,
      "stepPlot": false,
      "displayAnnotations": false,
      "drawAxesAtZero": true,
// When true, this shows the range selector at the lower edge of the chart
      "showRangeSelector": false,
      "rangeSelectorAlpha": 0.6,
      "rangeSelectorHeight": 40,
      "rangeSelectorPlotFillColor": "#a7b1c4",
      "rangeSelectorPlotFillGradientColor": "white",
      "rangeSelectorPlotLineWidth": 1.5,
      "rangeSelectorPlotStrokeColor": "#808fab",
      "rangeSelectorForegroundLineWidth": 1,
      "rangeSelectorForegroundStrokeColor": "black",
      "rangeSelectorBackgroundLineWidth": 1,
      "rangeSelectorBackgroundStrokeColor": "gray"
	}
    
To configure a change to the extension defaults, add an "extensions" section to the "*GRAPH_JS_FINAL" section of your Focexec procedure. e.g.

```json
*GRAPH_JS_FINAL
"extensions": {
	"com.ibi.dygraph": {
        axes: {
            x: {
                pixelsPerLabel: 70,
                axisLabelWidth: 60,
                axisLineColor: "rgb(0,0,0)",
                axisLabelFontSize: 14,
                axisLineWidth: 0.3,
                axisTickSize: 3.0,
                drawGrid: true,
                drawAxis: true,
                independentTicks: true,
            },
            y: {
                pixelsPerLabel: 30,
                axisLabelWidth: 50,
                axisLineColor: "rgb(0,0,0)",
                axisLabelFontSize: 14,
                axisLineWidth: 0.3,
                axisTickSize: 3.0,
                drawGrid: true,
                drawAxis: true,
                independentTicks: true
            }
        },
        colors: ["rgb(102,128,0)","rgb(102,0,128)","rgb(0,51,128)","rgb(0,128,51)"],
	}
}
*END
```
## Data Buckets
### Measures:
* **value (MES)** - assigns a numerical value to a date within a series.
### Dimensions:
* **datetime (DIM)** - defines the field used for the date grouping shown on the X axis.
