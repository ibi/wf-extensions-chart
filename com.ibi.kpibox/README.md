
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
	
		"kpiboxProperties": { 
			"ibiAppsPath": "/ibi_apps/",	
			"calculeComparationFunction": {
				"param1": "valueKpi", 
				"param2": "compareValue", 
				"body": "if(valueKpi == 0 && compareValue == 0) { return 0; } var result = (valueKpi - compareValue) / Math.abs(compareValue);  return result;"
			},	
			"formatComparation": "#,###.00%",
			"customCompareIcon": {
				"active": false,	
				"iconUp": "",
				"iconDown": "",
			},
			"shortenNumber": true, 
			"setInfiniteToZero": false,
			"titleRow": false,
			"calculateFontSize": false, 
			"fixedFontSizeProp": "18px",
			"fixedPixelLinesMargin": 20,
			"imagePercentageWidth": 40
		},
		"colorScale": {
			"colorMode":"discrete",
			"colorBands": [
				{"start": -1000000000000, "stop": 0, "color":"red"},
				{"start": 0, "stop": 1000000000000, "color":"green"}
			]
		}
		
	},
	 
	"propertyAnnotations": {
	
		"kpiboxProperties": "json",		
		"colorScale": "json"
		
	}


## Data Buckets

### Measures:
* **Value Bucket (1, required)** - Required. KPI value
* **Compare Value Bucket (1, non required)** - Not required. KPI for comparison.
* **Sign Comparision Bucket (1, non required)** - Not required. Positive or negative value to set comparision direction.

### Dimensions
* **Image Bucket (1, non required)** - Not required. Reference the IBFS path of an image.
