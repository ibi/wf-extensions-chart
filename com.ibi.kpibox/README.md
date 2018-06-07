
#### Extension from WebFocus 8200

# Kpibox

For installation instructions please visit this [link] (https://github.com/ibi/wf-extensions-chart/wiki/Installing-a-WebFocus-Extension "Installing a WebFocus Extension").

## Description

This extension displays the value of the KPI, a related icon and if variation is required with respect to a comparison value.

## Screenshots

![screenshot_1](https://github.com/ibi/wf-extensions-chart/blob/master/com.ibi.kpibox/screenshots/1.png)

![screenshot_2](https://github.com/ibi/wf-extensions-chart/blob/master/com.ibi.kpibox/screenshots/2.png)

## Configurations

To configure or customize your extension edit "properties" object in properties.json file.

**Any property can be overwritten from a property that is written in the webfocus chart code (GRAPH_JS_FINAL Properties) or in the STY file**
	
	"properties": {

		"textVertPosition": 0.5,   // The height at which to display the percentage text withing the wave circle. 0 = bottom, 1 = top.
		"textSize": 1,   
		"ibiAppsPath": "/ibi_apps/",          // The relative height of the text to display in the wave circle. 1 = 50%
		"valueCountUp": true,      // If true, the displayed value counts up from 0 to it's final value upon loading. If false, the final value is displayed.
		"displayPercent": true,    // If true, a % symbol is displayed after the value.
		"textColor": "#045681",    // The color of the value text when the wave does not overlap it.
		"colorScale": {
			"colorMode":"discrete",
			"colorBands": [
			{"start": -1000000000000, "stop": 0,"color":"red"},
			{"start": 0, "stop": 1000000000000,"color":"green"}
		]
		},
		"shortenNumbers": true, // If true, The numbers are shortened
		"title_row": false, // If true, The title will fill a complete row
		"shortenNumbersTooltip": false, // If true, The numbers are shortened in tooltip
		"calculateFontSize": false,  // If true, The size of text is calculated automatically
		"fixedFontSizeProp": "26px", // If calculateFontSize is false, the text size will take this value
		"fixedPixelLinesMargin": 20  // If calculateFontSize is false, the text separation will take this value
	},
	
	"propertyAnnotations": {
		"textVertPosition": "number",
		"textSize": "number",
		"ibiAppsPath": "str",
		"valueCountUp": "bool",
		"displayPercent": "bool",
		"textColor": "str",
		"colorScale":"json",
		"shortenNumbers":"bool",
		"title_row": "bool",
		"shortenNumbersTooltip":"bool",
		"calculateFontSize": "bool",
		"fixedFontSizeProp": "str",
		"fixedPixelLinesMargin": "number"	
	}


## Data Buckets

### Measures:
* **Value Bucket (1, required)** - Required. KPI value
* **Compare Value Bucket (1, non required)** - Not required. KPI for comparison.
* **Sign Comparision Bucket (1, non required)** - Not required. Positive or negative value to set comparision direction.

### Dimensions
* **Image Bucket (1, non required)** - Not required. Reference the IBFS path of an image.
