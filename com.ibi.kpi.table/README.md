#### Extension for WebFocus 8200

# KPI Table

For installation instructions please see the [Installing a WebFocus Extension](https://github.com/ibi/wf-extensions-chart/wiki/Installing-a-WebFocus-Extension) page.

## Description

This extension creates a widget that allows you to scroll through dimension field values to see selected measure values.

## Screenshots

![screenshot_1](https://github.com/ibi/wf-extensions-chart/blob/master/com.ibi.kpi.table/screenshots/1.PNG)

![screenshot_2](https://github.com/ibi/wf-extensions-chart/blob/master/com.ibi.kpi.table/screenshots/2.PNG)

## Configurations

To configure or customize your extension, edit the "properties" object in properties.json file.
	
	"properties": {
		
		"color": "#666",
		
		"shortenNumbers": true,
		
		"fontFamily": "'Open Sans'",
		
		"fontSize": "12px",
		
		"headingTitle": {
			
			"fontWeight": "400",
			
			"color": "inherit",
			
			"fontSize": "16px"	},
		
		"headingData": {
			
			"fontWeight": "700",
			
			"color": "inherit",
			
			"fontSize": "24px"
	},
		
		"columnTitle": {
			
			"fontWeight": "400",
			
			"color": "inherit",
			
			"fontSize": "14px"
	},
		
		"columnData": {
			
			"fontWeight": "700",
			
			"color": "inherit",
			
			"fontSize": "16px"
	} },

## Data Buckets

### Dimensions:

* **Key Measure** - Primary measure field that appears in the middle of the table.

* **Supporting Measures** - Additional measure values to show on the table.

* **Group** - Sort field whose values will be available for selection at the top of the table.
