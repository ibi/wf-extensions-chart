#### Extension from WebFocus 8200

# Kpi Distribution

For installation instructions please visit this [link] (https://github.com/ibi/wf-extensions-chart/wiki/Installing-a-WebFocus-Extension "Installing a WebFocus Extension").

## Description

Draw in animated bars the distribution of measures by one dimensions

## Screenshots

![screenshot_1](https://github.com/ibi/wf-extensions-chart/blob/master/com.ibi.kpi_distribution_comparison/screenshots/1.png)

## Configurations

To configure or customize your extension edit "properties" object in properties.json file. (up to 8207 designer provide "Extension Properties" to change from assistant)

**Any property can be overwritten from a property that is written in the webfocus chart code (GRAPH_JS_FINAL Properties) or in the STY file**
	
	"properties": {
		"ibiAppsPath": "/ibi_apps/", // location of apps, 
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
		"value_colors": {
			"minColor": "#912BA7", // value min color (if both are diferents we apply degraded)
			"maxColor": "#036DB2" // value max color (if both are diferents we apply degraded)
		},
		"comparison_colors": {
			"minColor": "yellow", // comparison min color (if both are diferents we apply degraded)
			"maxColor": "Blue" // comparison max color (if both are diferents we apply degraded)
		},
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
* **Value Bucket (1, required)** - Required. Measure
* **comparison Bucket (0:1, non required)** - Non required. Measure
* **minpoint Bucket (0:1, non required)** - Non required. Measure
* **maxpoint Bucket (0:1, non required)** - Non required. Measure

### Dimensions
* **Dimension Bucket (1, required)** - Required. Dimension.
* **image Bucket (0:1, non required)** - Non required. Dimension.