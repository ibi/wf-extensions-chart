#### Extension for WebFocus 8200

# Datatables Grid with Sparklines

For installation instructions please visit this [link](https://github.com/ibi/wf-extensions-chart/wiki/Installing-a-WebFocus-Extension "Installing a WebFocus Extension").

## Description

This is a custom table/data grid extension using the DataTables jQuery plug-in (datatables.net), with a sparkline column added. It provides many common features associated with a grid such as sorting, filtering, and paging.

**Note:** MIN. and MAX. aggregations are supported for WebFOCUS Release 8203 and higher.

## Screenshots

![screenshot_1](https://github.com/ibi/wf-extensions-chart/blob/master/com.ibi.sparktables/screenshots/1.png)

![screenshot_2](https://github.com/ibi/wf-extensions-chart/blob/master/com.ibi.sparktables/screenshots/2.png)

## Configurations

To configure or customize your extension edit "properties" object in properties.json file.
	
	"properties": {
		"paging": true,
		"pageLength": 10,
		"lengthMenu": "[ 10, 25, 50, 100 ]",
		"ordering": true,
		"info": true,
		"searching": true,
		"lengthChange": false,
		"colReorder": true,
		"responsive": true,
		"scroller": false,
		"scrollY": 370,
		"showTotal": false,
		"color": "#555",
		"padding": "8px",
		"border": "1px solid #ddd",
		"fontFamily": '"Helvetica Neue",Helvetica,Arial,sans-serif',
		"fontSize": "14px",
		"title": {
			"fontWeight": "bold",
			"color": "inherit",
			"backgroundColor": "transparent"
		},
		"data": {
			"fontWeight": "normal",
			"color": "inherit",
			"backgroundColorOdd": "#f9f9f9",
			"backgroundColorEven": "transparent",
			"selected": {
				"color": "inherit",
				"border": "1px solid #99cfff",
				"backgroundColor": "#cde8ff",
			}
		},
		"crossTabs": {
			"fontWeight": "bold",
			"color": "inherit",
			"backgroundColorOdd": "#f9f9f9",
			"backgroundColorEven": "transparent"
		},
		"sparkline": {
			"color": "#505050",
			"show_min": false,
			"show_max": false,
			"type":  "line" // can be either "line" or "bar"
     
		}
	}
		
	
## Data Buckets

### Measures:

* **Measures** - Measure columns for the data table.

* **Sparkline Value** - Measure field to use for the sparkline.

### Dimensions:

* **Rows** - Sort fields to break the data table into rows (group bys).

* **Sparkline Dates** - Date field to define the horizontal axis of the sparklines.

