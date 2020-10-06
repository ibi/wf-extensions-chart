#### Extension from WebFocus 8200

# Kpi Distribution Comparison

For installation instructions please visit this [link] (https://github.com/ibi/wf-extensions-chart/wiki/Installing-a-WebFocus-Extension "Installing a WebFocus Extension").

## Description

This extension is an enhanced type of horizontal bar chart. Its main features are:
* multiple line for each series for comparison purposes
* up to two threshol marks for each bar in order to clearly shows when exceeding specific key values per serie
* image associated to each bar for high visual impact
* completely customizable (colors, sizes, shorthen etc..)

## Screenshots

![screenshot_1](https://github.com/ibi/wf-extensions-chart/blob/master/com.ibi.kpi_distribution_comparison/screenshots/kpi_distribution_comparison.png)

## Configurations

To configure or customize your extension edit "properties" object in properties.json file. (up to 8207 designer provide "Extension Properties" to change from assistant)

**Any property can be overwritten from a property that is written in the webfocus chart code (GRAPH_JS_FINAL Properties) or in the STY file**
	
	"properties": {
		"ibiAppsPath": "/ibi_apps/", // location of apps, if it need other name of apps folder
		"valueispercentage": false, // if value is a percentaje value true/false
		"titlesColor": "#415D6B", // tile color
		"bodyBackgroundColor": "transparent", // background color
		"options": {
			"showPercentagesOfTheTotal": false, // bars in percentaje of total true/false
			"showValue": true, // show values true/false
			"shortenValue": false, // shorten numbers true/false
			"typeShortenNumber": null, // type of shorten number "short scale"/"long scale"
			"forceSortRows": false, // force recieved order from max to min true/false
			"showBarIcons": true // show icons true/false
		},
		"sizes": {
			"titlesFont": "15", // title font size
			"marginTop": "10", // margin top
			"rowHeight": "50", // row height
			"barHeight": "10", // bar height
			"barIconWidth": "40" // bar icon width
		},
		"value_color": "blue", // value color
		"comparison_color": "yellow", // comparison color
		"ticks": {
			"minvalue": {
				"value": null, // value for min marker if we want to apply a static value
				"color": "green", // color for min marker
				"weight": "4" // weight for min marker
			},
			"maxvalue": {
				"value": null, // value for max marker if we want to apply a static value
				"color": "red", // color for max marker
				"weight": "4" // weight for max marker
			}
		}
	}


## Data Buckets

### Measures:
* **Value Bucket (1, required)** - Required. assigns a numerical value, it will set the size of value bars
* **comparison Bucket (0:1, non required)** - Non required. assigns a numerical value, it will set the size of comparison bars
* **minpoint Bucket (0:1, non required)** - Non required. assigns a numerical value, it will set the point of to show the minimum marker in bars
* **maxpoint Bucket (0:1, non required)** - Non required. assigns a numerical value, it will set the point of to show the maximum marker in bars

### Dimensions
* **Dimension Bucket (1, required)** - Required. assigns a dimension, it will show each dimension as instance of chart
* **image Bucket (0:1, non required)** - Non required. assigns a "directory of image in content", it will show the correspondent image to each instance of dimension bucket.