#### Extension for WebFocus 8200

# Gauge Chart

For installation instructions please visit this [link](https://github.com/ibi/wf-extensions-chart/wiki/Installing-a-WebFocus-Extension "Installing a WebFocus Extension").

## Description

This is a 180 degree arc gauge that displays a color state based on threshold values.

## Screenshots

![screenshot_1](https://github.com/ibi/wf-extensions-chart/blob/master/com.ibi.gauge/screenshots/1.PNG)

![screenshot_1](https://github.com/ibi/wf-extensions-chart/blob/master/com.ibi.gauge/screenshots/2.PNG)

## Configurations

To configure or customize your extension edit "properties" object in properties.json file.
	
"properties": {

    
	"arc_width": 25,
    
	"label_type": "actual",
    
	"color_states": [ "#FF0000", "#F97600", "#F6C600", "#60B044" ],
   
	"thresholds": [ 30, 60, 90, 100 ],
	
	"show_label": true,
    
	"show_endpoints": true,
    
	"show_legend": true,
    
	"target_width": 2,
    
	"target_color": "#505050"
	
		},

To apply changes to these properties in a chart, add the "extensions": {"com.ibi.gauge":{ }} block to the GRAPH_JS section of your request, and add the properties that you want to modify within the brackets after the extension name.

## Data Buckets

### Measures:

* **Gauge Value (actual)** - Defines the value displayed by the gauge.

* **Min Gauge Value (min)** - Assigns the starting value for the gauge. Optional with default of 0.

* **Max Gauge Value (max)** - Assigns the the end value for the gauge. Optional with default of 100. 

* **Target Gauge Value (tgt)** - Assigns a target line on the gauge. Optional

