
#### Extension from WebFocus 8200

# Kpibox

For installation instructions please visit this [link] (https://github.com/ibi/wf-extensions-chart/wiki/Installing-a-WebFocus-Extension "Installing a WebFocus Extension").

## Description

This extension displays the value of the KPI and comparations, a related icons and percentajes of changes to a comparison values.

## Screenshots

![screenshot_1](https://github.com/ibi/wf-extensions-chart/blob/master/com.ibi.kpibox/screenshots/image.png)

## Configurations

To configure or customize your extension edit "properties" object in properties.json file.

**Any property can be overwritten from a property that is written in the webfocus chart code (GRAPH_JS_FINAL Properties) or in the STY file**
	
	"properties": {
	
		"kpiboxProperties": {   
			"ibiAppsPath": "/ibi_apps/",	// Ibi path context
			"calculateComparationFunction": { // personalization of first compare function
				"param1": "valueKpi", // comparation first parameter
				"param2": "compareValue", // comparation second parameter
				"body": "if(valueKpi == 0 && compareValue == 0) { return 0; } var result = (valueKpi - compareValue) / Math.abs(compareValue);  return result;" // function of comparation
			},	
			"calculateComparationFunction2": { // personalization of second compare function
				"param1": "valueKpi", // comparation first parameter
				"param2": "compareValue2", // comparation second parameter
				"body": "if(valueKpi == 0 && compareValue2 == 0) { return 0; } var result = (valueKpi - compareValue2) / Math.abs(compareValue2);  return result;" // function of comparation
			},
			"formatComparation": "#,###.00%", // comparation result show format
			"customCompareIcon": { // custom comparation icons
				"active": false, // true/false
				"iconUp": " ", // path of image for positive result
				"iconDown": " " // path of image for negative result
			},
			"shortenNumber": false, // shorten number apply true/false
			"typeShortenNumber": null, // long scale/short scale "type of shorten to show"
			"setInfiniteToZero": false, // true/false "change infinte to 0"
			"titleRow": false, // true/false "show title as a independent row up to the image"
			"calculateFontSize": false,  // true/false "auto calculate font sizes"
			"fixedFontSizeProp": "18px", // font size for all text if they havent specified any one
			"fixedPixelLinesMargin": 20, // margin betwen lines
			"imagePercentageWidth": 30, // image width in percentaje
			"comparationTitle":false, // true/false "show title of comparation"
			"comparationValue":false, // true/false "show value of comparation"
			"textAlign":false, // true/false "alignt to center"
			"titleFont":{ // title customization options
			    "size":"14px", // title font size
			    "color":"grey", // title font color
			    "family":"Arial" // title fon family
			},
			"measureFont":{ // measure customization options
			    "size":"22px", // measure font size
			    "color":"grey", // measure font color
			    "family":"Arial" // measure fon family
			},
			"variationFont":{ // comparation value customization options
			    "size":"14px", // comparation value font size
			    "color":"grey", // comparation value font color
			    "family":"Arial" // comparation value fon family
			},
			"variationTitle":{ // comparation title customization options
			    "size":"14px", // comparation title font size
			    "color":"grey", // comparation title font color
			    "family":"Arial" // comparation title fon family
			},
			"bodyBackgroundColor": "#f4f4f4" // background-color
		},
		"colorScale": { // customization of color
			"colorBands": [ // range of value for colors as array
				{"start": -1000000000000, "stop": 0, "color":"#c00000"},
				{"start": 0, "stop": 1000000000000, "color":"#409c87"}
			]
		}
		
	}


## Data Buckets

### Measures:
* **value - Value Bucket (1, required)** - Required. KPI value
* **comparevalue - Compare Value Bucket (1, non required)** - Not required. KPI for comparison.
* **comparevalue2 - Compare Value 2 Bucket (1, non required)** - Not required. KPI for comparison.
* **kpisign - Sign Comparision Bucket (1, non required)** - Not required. Positive or negative value to set comparision direction.

### Dimensions
* **image - Image Bucket (1, non required)** - Not required. Reference the IBFS path of an image.
