#### Extension for WebFocus 8200

# Ratio Chart

For installation instructions please visit this [link] (https://github.com/ibi/wf-extensions-chart/wiki/Installing-a-WebFocus-Extension "Installing a WebFocus Extension").

## Description

Very simple chart, that can be used to compare numerical ratios of different categories.
## Screenshots

![screenshot_1](https://github.com/ibi/wf-extensions-chart/blob/master/com.ibi.ratio/screenshots/1.png)

![screenshot_2](https://github.com/ibi/wf-extensions-chart/blob/master/com.ibi.ratio/screenshots/2.png)

## Configurations

To configure or customize your extension edit "properties" object in properties.json file.
	
	"properties": {
		"risers": {          
	            "color": "lightblue",
	            "label": {
	                "font": "12px sans-serif",
	                "format": "auto"
	            }
	        },
	        "axes": {
	            "category": {
	                "labels": {
	                    "font": "12px sans-serif",
	                    "color": "black"
	                },
	                "grid": {
	                	"stroke-dasharray" : "2 5",
	                	"width": 1,
	                	"color": "black"
	                }
	            },
	            "ratio": {
	                "labels": {
	                    "font": "14px sans-serif",
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
You can customize category axis ( ordinal axis on the left ), ratio axes ( top and bottom sides of the chart ) and risers. You can also enable/disable the tooltip. `risers.label.format` uses the same format string as Moonbeam.
## Data Buckets

### Measures:
* **Value (MES)** - quantitative representations for your categories (sales, costs, stock).

### Dimensions
* **Category (DIM)** - set of categories (names, brands, types).
