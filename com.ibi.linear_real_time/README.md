#### Extension from WebFocus 8200

# Linear Real Time

For installation instructions please visit this [link] (https://github.com/ibi/wf-extensions-chart/wiki/Installing-a-WebFocus-Extension "Installing a WebFocus Extension").

## Description

This extension exposes the Linear Real Time chart which shows multiple series of pre loaded data and retrieve more new data interval

## Screenshots

![screenshot_1](https://github.com/ibi/wf-extensions-chart/blob/master/com.ibi.linear_real_time/screenshots/screenshot1.png)

![screenshot_2](https://github.com/ibi/wf-extensions-chart/blob/master/com.ibi.linear_real_time/screenshots/screenshot2.png)

![screenshot_3](https://github.com/ibi/wf-extensions-chart/blob/master/com.ibi.linear_real_time/screenshots/screenshot3.png)

## Configurations

To configure or customize your extension edit "properties" object in properties.json file. (up to 8207 designer provide "Extension Properties" to change from assistant)

**Any property can be overwritten from a property that is written in the webfocus chart code (GRAPH_JS_FINAL Properties) or in the STY file**
	
	"properties": {
		"ajax":{
			"folderItem": null  // Ajax call complete path (Ajax is called with parameters: &LAST_DATE = "contains the last loaded date" and &DATE = "contains the new date to load")
		},
		"times":{
			"timeInterval": "30", // Ajax call interval in seconds
			"timeRange": "300", // Date axis range in seconds
			"timeEffect": "1" // Time effect duration in seconds
		},
		"bodyBackgroundColor": "transparent", // background color
		"shorten": {
			"shortenNumber": true, // Shorten number true/false
			"typeShortenNumber": "short scale" // type of shorten number "short scale"/"long scale"
		},
		"markers": {
			"showMarkers": false, // Markers true/false
			"radius": "3" // radius of markers
		},
		"dataLabels": {
			"show": false // Data Labels true/false
		},
		"yaxisOptions": {
			"y1axis": {
				"Max": null, // Y1 axis maximun value
				"showTitle": false, // Y1 axis title true/false
				"title": null // Y1 axis title
			},
			"y2axis": {
				"Max": null, // Y2 axis maximun value
				"showTitle": false, // Y2 axis title true/false
				"title": null // Y2 axis title
			}
		},
		"xaxisOptions": {
			"showTitle": false, // X axis title true/false
			"title": null // X axis title
		}
	}


## Data Buckets

### Measures:
* **y1axis Bucket (0:1, non required)** - Non required. assigns a numerical value
* **y2axis Bucket (0:1, non required)** - Non required. assigns a numerical value

### Dimensions
* **xaxis Bucket (1, required)** - Required. assigns a date value
* **color Bucket (0:1, non required)** - Non required. assigns a dimension


## Example
In the example folder we have a import file to run a real time example
* **Master, FOC & PF files for 1 minute load interval data
* **PD, ajax.fex & visualization to show the real time chart

## Runing visualization
* **The extension needs WFGlobals to take toke, so, we need PD or Page or something to take it. the visualization must be run under PD or Page like in the example
* **The extension needs a procedure to call with ajax that it needs to have the same structure as the visualization