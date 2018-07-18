
#### Extension from WebFocus 8200

# Horizontal Comparision Bars

For installation instructions please visit this [link] (https://github.com/ibi/wf-extensions-chart/wiki/Installing-a-WebFocus-Extension "Installing a WebFocus Extension").

## Description

this extension allows you to draw the variation for each of the bars of a horizontal bar chart.

## Screenshots

![screenshot_1](https://github.com/ibi/wf-extensions-chart/blob/master/com.ibi.horizontal_comparison_bars/screenshots/1.png)

## Configurations

To configure or customize your extension edit "properties" object in properties.json file.

**Any property can be overwritten from a property that is written in the graphic code or in the STY file**
	
	"properties": {
	
		"horizontalcomparisonbarsProperties": {
			"chartHeadroom": 50,
			"shorten_numbers": true, //If true, The numbers are shortened
		},
		"external_library": "lib/d3.min.js",
		"colorScale": {
			"colorMode":"discrete",
			"colorBands": [
				{"start": -1000000000000, "stop": 0,"color":"red"},
				{"start": 0, "stop": 1000000000000,"color":"green"}
			]
		}
	},
	
	"propertyAnnotations": {
		"horizontalcomparisonbarsProperties": "json",		
		"external_library": "str",
		"colorScale": "json"
	},


## Data Buckets

### Measures:
* **Value Bucket (1)** - Required. KPI value
* **Comparision Bucket (0-1)** - Not required. KPI for comparison.
* **Sign Comparision Bucket (0-1)** - Not required. Positive or negative value to set comparision direction.

### Dimensions
* **Label Bucket (0-1)** - Not required. BY element.
