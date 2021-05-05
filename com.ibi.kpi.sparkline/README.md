#### Extension for WebFocus 8200

# KPI Sparkline

For installation instructions please see the [Installing a WebFocus Extension](https://github.com/ibi/wf-extensions-chart/wiki/Installing-a-WebFocus-Extension) page.

## Description

This extension creates a widget that shows the total value and a simple bar chart for a selected measure field.

## Screenshots

![screenshot_1](https://github.com/ibi/wf-extensions-chart/blob/master/com.ibi.kpi.sparkline/screenshots/1.png)

![screenshot_2](https://github.com/ibi/wf-extensions-chart/blob/master/com.ibi.kpi.sparkline/screenshots/2.png)

## Configurations

To configure or customize your extension, edit the "properties" object in properties.json file.
	
	"properties": {
		"type": "bar",
		"color": "#666",
		"fontFamily": "'Open Sans'",
		"fontSize": "12px",
		"measureName": {
			"fontWeight": "bold",
			"color": "inherit",
			"fontSize": "12px"
		},
		"percentChange": {
			"color": "inherit",
			"fontSize": "12px"
		},
		"total": {
			"fontWeight": "inherit",
			"color": "inherit",
			"fontSize": "20px"	
		},
		"barProperties": {
			"height": 20,
			"width": 5,
			"goodColor": "#37BF54",
			"badColor": "#F53554",
			"goodIs": ">=0"
		}
	},

## Data Buckets

### Dimensions:

* **Measure** - Primary measure field whose values are represented in the widget.

* **Compare Group** - Dimension field whose trend displays in the widget.

* **X-Axis** - Dimension field used as the x-axis on the bar chart in the widget.
