#### Extension for WebFocus 8200

# Org Chart

For installation instructions please visit this [link] (https://github.com/ibi/wf-extensions-chart/wiki/Installing-a-WebFocus-Extension "Installing a WebFocus Extension").

## Description

This extension helps to visualize a hierarchical structure of a data set.

## Screenshots

![screenshot_1](https://github.com/ibi/wf-extensions-chart/blob/master/com.ibi.orgchart/screenshots/1.png)
![screenshot_2](https://github.com/ibi/wf-extensions-chart/blob/master/com.ibi.orgchart/screenshots/2.png)
![screenshot_3](https://github.com/ibi/wf-extensions-chart/blob/master/com.ibi.orgchart/screenshots/3.png)

## Configurations

To configure or customize your extension edit "properties" object in properties.json file.
	
	
	"properties": {
		"node" : {
			"colorRange": ["red", "yellow", "green"],
			"label": {
				"font" : "14px serif"
			},
			"toolTip": {
				"format" : "auto"
			},
			"border": {
				"width": 1,
				"color": "grey",
				"round": 5
			}
		},
		"colorLegend": {
            "enabled": true,
            "background": {
                "color": "white"
            },
            "border": {
                "color": "black",
                "width": 1,
                "round": 2
            },
            "title": {
                "font": "16px serif",
                "color": "black"
            },
            "rows": {
                "count": "auto",
                "labels": {
                    "font": "10px serif",
                    "color": "black",
                    "format": "auto"
                }
            }
        }
	}
	
You can customize nodes and a color legend.
## Data Buckets

### Measures:
* **Value Bucket** - values in this bucket are used to build a color scale and then color nodes according to that colors scale.

### Dimensions:
* **Levels (DIM)** - dragging dimensions to this bucket creates new levels.

