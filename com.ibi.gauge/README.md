#### Extension for WebFocus 8200

# Gauge Chart

For installation instructions please visit this [link](https://github.com/ibi/wf-extensions-chart/wiki/Installing-a-WebFocus-Extension "Installing a WebFocus Extension").

## Description

This is a 180 degree arc gauge that displays a color state based on threshold values.

## Screenshots

![screenshot_1](https://github.com/ibi/wf-extensions-chart/blob/master/com.ibi.gauge/screenshots/1.png)

![screenshot_1](https://github.com/ibi/wf-extensions-chart/blob/master/com.ibi.gauge/screenshots/2.png)

## Configurations

To configure or customize your extension edit "properties" object in properties.json file.
	
	"properties": {
		"min": 0
		,"max": 100
		,"arc_width": 25
		,"label_type": "actual"
		,"color_states":  ["#FF0000", "#F97600", "#F6C600", "#60B044"]
		,"thresholds": [30,60,90,100]
		,"show_label": true
		,"show_endpoints": true
	},

## Data Buckets

### Measures:

* **Gauge Value (actual)** - Defines the value displayed by the gauge.

* **Min Gauge Value (min)** - Assigns the starting value for the gauge.

* **Max Gauge Value (max)** - Assigns the the end value for the gauge. 

