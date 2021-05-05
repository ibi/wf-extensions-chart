#### Extension for WebFocus 8200

# KPI with Sparkline Large

For installation instructions please see the [Installing a WebFocus Extension](https://github.com/ibi/wf-extensions-chart/wiki/Installing-a-WebFocus-Extension) page.

## Description

This extension creates a widget that shows the total value and a simple bar chart for a selected measure field. The information is sorted by an additional dimension field whose values can be selected at the top of the widget.

## Screenshots

![screenshot_1](https://github.com/ibi/wf-extensions-chart/blob/master/com.ibi.kpi.sparkline2/screenshots/1.png)

![screenshot_2](https://github.com/ibi/wf-extensions-chart/blob/master/com.ibi.kpi.sparkline2/screenshots/2.png)

## Configurations

To configure or customize your extension, edit the "properties" object in properties.json file.
	
	"properties": {
		"type": "bar",
		"color": "#666",
		"fontFamily": "'Open Sans'",
		"fontSize": "12px",
		"headingTitle": {
			"fontWeight": "400",
			"color": "inherit",
			"fontSize": "16px"
		},
		"headingSubtitle": {
			"fontWeight": "400",
			"color": "inherit",
			"fontSize": "11px"
		},
		"headingData": {
			"fontWeight": "700",
			"color": "inherit",
			"fontSize": "24px"
		},
		"barProperties": {
			"height": 40,
			"width": 8,
			"goodColor": "#37BF54",
			"badColor": "#F53554"
		},
		"autoFit": true,
		"aggregationType": "First",
		"maxWidth": 280
	},

## Data Buckets

### Dimensions:

* **Key Measure** - Measure field whose values are represented in the widget.

* **Group** - Sort field whose values are available for selection at the top of the widget.

* **X-Axis** - Dimension field used as the x-axis on the bar chart in the widget.
