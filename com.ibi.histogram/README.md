#### Extension for WebFocus 8200

# Histogram Chart

For installation instructions please visit this [link] (https://github.com/ibi/wf-extensions-chart/wiki/Installing-a-WebFocus-Extension "Installing a WebFocus Extension").

## Description

Very simple histogram that can be used for a graphical representation of the distribution of numerical data.

## Screenshots

![screenshot_1](https://github.com/ibi/wf-extensions-chart/blob/master/com.ibi.histogram/screenshots/1.png)

![screenshot_2](https://github.com/ibi/wf-extensions-chart/blob/master/com.ibi.histogram/screenshots/2.png)

## Configurations

To configure or customize your extension edit "properties" object in properties.json file.
	
	"properties": {
		"bins": {
			"count": "auto",
			"thresholds": [],
			"color": "steelblue"
		},
		"xaxis": {
			"labels": {
				"format": "auto",
				"font": "12px sans-serif",
				"color": "black"
			}
		},
		"yaxis": {
			"title": {
				"font": "24px sans-serif",
				"color": "black"
			},
			"labels": {
				"format": "auto",
				"font": "12px sans-serif",
				"color": "black"
			}
		},
		"tooltips": {
			"enabled": true
		}
	}

You can customize yaxis ( vertical axis on the left ), xaxes ( horizontal axis at the bottom ) and risers. You can also enable/disable the tooltip. `format` uses the same format string as Moonbeam.

## Data Buckets

### Measures:
* **Value (MES)** - set of numerical values.

