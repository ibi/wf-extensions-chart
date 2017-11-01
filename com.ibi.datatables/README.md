#### Extension for WebFocus 8200

# DataTables Grid

For installation instructions please visit this [link] (https://github.com/ibi/wf-extensions-chart/wiki/Installing-a-WebFocus-Extension "Installing a WebFocus Extension").

## Description

This is a custom table/data grid extension using the DataTables jQuery plug-in (datatables.net). It provides many common features associated with a grid such as sorting, filtering and paging.

## Screenshots

![screenshot_1](https://github.com/ibi/wf-extensions-chart/blob/master/com.ibi.datatables/screenshots/1.png)

![screenshot_2](https://github.com/ibi/wf-extensions-chart/blob/master/com.ibi.datatables/screenshots/2.png)

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
		"color": '#555',
		"padding": '8px',
		"border": '1px solid #ddd',
		"fontFamily": '"Helvetica Neue",Helvetica,Arial,sans-serif',
		"fontSize": '14px',
		"title": {
			"fontWeight": 'bold',
			"color": 'inherit',
			"backgroundColor": 'transparent'
		},
		"data": {
			"fontWeight": 'normal',
			"color": 'inherit',
			"backgroundColorOdd": '#f9f9f9',
			"backgroundColorEven": 'transparent',
			"selected": {
				"color": 'inherit',
				"border": '1px solid #99cfff',
				"backgroundColor": '#cde8ff',
			}
		},
		"crossTabs": {
			"fontWeight": 'bold',
			"color": 'inherit',
			"backgroundColorOdd": '#f9f9f9',
			"backgroundColorEven": 'transparent'
		}
	}

## Data Buckets

### Measures:

* **measure** - used for measures

### Dimensions:

* **row** - break data set into rows (group bys)

* **column** - break data set into columns (cross tabs)

