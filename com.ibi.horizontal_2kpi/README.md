
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
			"setInfiniteToZero": false,
			"chartHeadroom": 50,
			"shorten_numbers": true, // true/false
			"typeShortenNumber": null, // "long scale" (default)/ "short scale"
										// "long scale": K: 10^3, M: 10^6, B: 10^9, T: 10^12
										// "short scale": K: 10^3, M: 10^6, B: 10^12
			"shortenLeyendDescription": { // legend to explain shorten letter
				"enabled": false, // visualization true/false
				"K": "Thousands", // descriptions of each letter
				"M": "Millions",
				"B": "Billions",
				"T": "trillions"
			},
			"calculeComparationFunction": {
				"param1": "valueKpi", 
				"param2": "compareValue", 
				"body": "if(valueKpi == 0 && compareValue == 0) { return 0; } var result = (valueKpi - compareValue) / Math.abs(compareValue);  return result;"
			},
			"formatComparation": "#,###.00%", // comparation result format
			"bodyBackgroundColor": "transparent"
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
* **Order Bucket (0-1)** - Not required. BY element.
* **Dimension Bucket (0-1)** - Not required. BY element.
* **Image Bucket (0-1)** - Not required. BY element.