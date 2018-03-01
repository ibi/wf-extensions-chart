#### Extension for WebFocus 8200
# Dygraph Chart
For installation instructions please visit this [link] (https://github.com/ibi/wf-extensions-chart/wiki/Installing-a-WebFocus-Extension "Installing a WebFocus Extension").
## Description
This extension exposes the DyGraph (version 2.1.0) which shows multiple series of data across a Date Range.
## Screenshots
![screenshot_1](https://github.com/ibi/wf-extensions-chart/blob/add-dygraph-extension/com.ibi.dygraph/screenshots/1.png)
## Configurations
To configure the default values for this extension, edit "properties" object in properties.json file.
	
	"properties": {
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
        labelsKMB: "K",
        labelsSeparateLines: true,
        legend: "always",
        customBars: false,
        errorBars: false,
        showRoller: false,
        rollPeriod: 14,
        gridLineWidth: 0.15,
        title: "DyGraph Extension",
        ylabel: "Sales",
        xlabel: "Date",
        maxNumberWidth: 12,
        displayAnnotations: true,
        xAxisHeight: 40,
        drawAxesAtZero: true
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
