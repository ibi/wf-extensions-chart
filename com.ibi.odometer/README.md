#### Extension for WebFocus

# Odometer

For installation instructions please visit this [link] (https://github.com/ibi/wf-extensions-chart/wiki/Installing-a-WebFocus-Extension "Installing a WebFocus Extension").

## Description

This extension shows a simple label with an odometer-style spinning animation.

## Configurations

To configure or customize your extension edit "properties" object in properties.json file.
	
	properties:{
		"startValue": 1,     // Initial value to draw in the odometer; will cycle up (or down) from this value to the bucket driven data set value
		"theme": "default",  // One of 'car', 'default', 'digital', 'minimal', 'plaza', 'slot-machine', 'train-station'
		"animation": "spin", // One of 'spin' or 'count'
		"updateSpeed": 0,    // length of time between each odometer animation update, in ms.  If 0 or null and animation is spin, will spin nicely
		"fontSize": null     // Height of font, in pixels.  If undefined, will pick a font that fills up the container.
	}

## Data Buckets

### Measures:

* **Value** - Define the end value drawn in the odometer label
