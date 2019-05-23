#### Extension for WebFocus 8200

# Calendar Heat Map

For installation instructions please visit this [link] (https://github.com/ibi/wf-extensions-chart/wiki/Installing-a-WebFocus-Extension "Installing a WebFocus Extension").

## Description

This extension is a heat map chart that helps better visualize a series of date values.

## Screenshots

![screenshot_1](https://github.com/ibi/wf-extensions-chart/blob/master/com.ibi.calendar/screenshots/1.png)

## Configurations

To configure or customize your extension edit "properties" object in properties.json file.
	
	"properties": {
		"language": null, // "en", "es" to set language and first day of week (by the moment only "en" & "es")
		"titles": {
			"year": {
				"font": "14px sans-serif",
				"color": "black",
				"font-weight": "bold"
			},
			"weekdays": {
				"font": "12px sans-serif",
				"color": "black",
				"font-weight": "none"
			},
			"months": {
				"font": "12px sans-serif",
				"color": "black",
				"font-weight": "none"
			}
		},
	    "toolTip": {
	      "enabled": true,
	      "value": {
	      	"format": "auto"
	      }
	    }
	}
	
## Data Buckets

### Measures:
* **Value (MES)** - quantitative representations for values in your date series ( ex. sales ).

### Dimensions
* **Date (DIM)** - a series of date values. Make sure you use full dates ( day, month, year ).
