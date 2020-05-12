
#### Extension from WebFocus 8200

# calendar_traditional

For installation instructions please visit this [link] (https://github.com/ibi/wf-extensions-chart/wiki/Installing-a-WebFocus-Extension "Installing a WebFocus Extension").

## Description

This extension generates a simple calendar view by month and days, just as any office calendar.

## Screenshots

![screenshot_1](/screenshots/1.png)

## Configurations

To configure or customize your extension edit "properties" object in properties.json file.

**Any property can be overwritten from a property that is written in the graphic code or in the STY file**
	
	"properties": {
## Define whether the first day of the week starts on monday or sunday
		"initialDOW": "Sunday",
## Display language of the calendar		
		"language_var": "es_ES",
## Background color. Leave as it is to improve compatibility		
		"bodyBackgroundColor": "transparent"
	},


## Data Buckets

### Measures:
* **Value Bucket (1)** - Required. KPI value

### Dimensions
* **Date (dd/mm/yyyy)** - Required. Date value must be in dd/mm/yyyy format
