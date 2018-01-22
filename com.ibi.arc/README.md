#### Extension for WebFOCUS 8200

# Arc Diagram

For installation instructions please visit this [link] (https://github.com/ibi/wf-extensions-chart/wiki/Installing-a-WebFocus-Extension "Installing a WebFocus Extension").

## Description

This extension shows comparisons among categories.

## Screenshots

![screenshot_1](https://github.com/ibi/wf-extensions-chart/blob/master/com.ibi.arc/screenshots/1.png)

![screenshot_1](https://github.com/ibi/wf-extensions-chart/blob/master/com.ibi.arc/screenshots/2.png)

## Configurations

To configure or customize your extension edit "properties" object in properties.json file.
	
	properties:{
		"type": "regular",
		"arc": {
			"start": 1.5708,
			"extent": 0.75,
			"padding": 0.2,
			"sortBy": "value",
			"sort": {
				"by": "value",
				"ascending": true
			},
			"border": {
				"width": 1,
				"color": "white"
			}
		},
		"axis": {
			"labels": {
				"format": "auto"
			}
		},
		"valueLabel": {
			"fontFamily": "sans-serif",
			"fontSize": "auto",
			"color": "#000000",
			"fontWeight": "bold", // "normal", "bolder" or "bold",
                        "format": "auto"
		},
		"labels": {
			"text": {
				"color": "black",
				"font": "Verdana",
				"weight": "bold",
				"size": "14px"
			},
			"marker": {
				"type": "circle"
			}
		},
                "tooltip": {
                    "enabled": true 
                }
	}

## Data Buckets

### Measures:

* **Value (MES)** - assigns a numerical value to a category.

### Dimensions:

* **Label (DIM)** - defines categories.

