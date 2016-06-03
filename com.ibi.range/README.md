#### Extension for WebFocus 8200

# Range (Floating Column) Chart

For installation instructions please visit this [link] (https://github.com/ibi/wf-extensions-chart/wiki/Installing-a-WebFocus-Extension "Installing a WebFocus Extension").

## Description

Simple two dimensional chart that can be used to plot min/max ranges and many series of markers.

![screenshot_1](https://github.com/ibi/wf-extensions-chart/blob/master/com.ibi.range/screenshots/1.png)

![screenshot_2](https://github.com/ibi/wf-extensions-chart/blob/master/com.ibi.range/screenshots/2.png)

## Configurations

To configure or customize your extension edit "properties" object in properties.json file.
	
	"properties": {
		"axes": {
			"invert": true,
			"numerical" : {
				"labels": {
					"format": "auto",
					"font": "12px serif"
				}
			},
			"ordinal": {
				"labels": {
					"format": "auto",
					"font": "12px serif"
				},
				"title": {
					"font": "16px serif",
					"color": "black"
				}
			}
		},
		"canvas": {
			"ranges": {
				"color": "pink",
				"widthRatio": 0.8,
				"tooltip": {
					"enabled": true
				}
			},
			"markers": {
				"size": 10,
				"stroke": "none",
				"strokeWidth": 1,
				"colors": ["#1f77b4", "#ff7f0e", "#2ca02c", "#d62728", "#9467bd", "#8c564b", "#e377c2", "#7f7f7f", "#bcbd22", "#17becf"],
				"symbols": ["circle", "diamond", "square", "cross" , "triangle-down", "triangle-up"],
				"tooltip": {
					"enabled": true
				}
			}
		},
		"legend": {
			"labels": {
				"font": "12px serif",
				"color": "black"
			}
		}
	}

You can customize legend, axes, markers and ranges. You can also enable/disable the tooltip. `numerical.labels.format` uses the same format string as Moonbeam.
## Data Buckets

### Measures:
* **Range Minimum** - set of the minimum values of all the ranges.
* **Range Maximum** - set of the maximum values of all the ranges.
* **Markers** - set of marker values, that is used to position markers on numerical axis.

### Dimensions
* **Group** - is used to position elements on ordinal axis.
