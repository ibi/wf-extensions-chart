#### Extension for WebFocus 8200

# Population Pyramid

For installation instructions please visit this [link] (https://github.com/ibi/wf-extensions-chart/wiki/Installing-a-WebFocus-Extension "Installing a WebFocus Extension").

## Description

This extension helps to visualize the distribution of various age groups in a population. No more than two types can be displayed at the time.

## Screenshots

![screenshot_1](https://github.com/ibi/wf-extensions-chart/blob/master/com.ibi.population/screenshots/1.png)

![screenshot_2](https://github.com/ibi/wf-extensions-chart/blob/master/com.ibi.population/screenshots/2.png)

## Configurations

To configure or customize your extension edit "properties" object in properties.json file.
	
	"properties": {
		"colorBySeries": ["#ffafbf", "#cce9f8"],
        "typeLabels": {
            "font": "bold 14px sans-serif",
            "color": "black"
        },
        "axes": {
            "x": {
                "labels": {
                    "font": "12px sans-serif",
                    "color": "black"
                },
                "base": {
                	"color": "black"
                },
                "grid": {
                	"stroke-dasharray" : "2 5",
                	"width": 1,
                	"color": "black"
                }
            },
            "y": {
                "labels": {
                    "font": "12px sans-serif",
                    "format": "auto",
                    "color": "black"
                },
                "base": {
                	"color": "black"
                }
            }
        },
	    "toolTip": {
	      "enabled": true
	    }
	}
	
You can customize x axis ( category axis on the left ), y axis ( value axis in the bottom ) type labels ( labels in the top ), and riser colors. You can also enable/disable the tooltip. `axes.y.labels.format` uses the same format string as Moonbeam ( WebFocus internal charting library ).
## Data Buckets

### Measures:
* **Value** - quantitative representations for your categories ( ex. population ).

### Dimensions
* **Category** - set of categories ( ex. age groups ).
* **Type** - types of categories ( ex. gender ).
