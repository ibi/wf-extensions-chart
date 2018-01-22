#### Extension for WebFocus 8200

# Force Directed Chart

Originally developed by Mike Bostock. See https://bl.ocks.org/mbostock/4062045

For installation instructions please visit this [link](https://github.com/ibi/wf-extensions-chart/wiki/Installing-a-WebFocus-Extension "Installing a WebFocus Extension").

## Description

This extension shows connections between categories.

## Screenshots

![screenshot_1](https://github.com/ibi/wf-extensions-chart/blob/master/com.ibi.forcedirected/screenshots/forcedirected1.png)

![screenshot_1](https://github.com/ibi/wf-extensions-chart/blob/master/com.ibi.forcedirected/screenshots/forcedirected2.png)

## Configurations

To configure or customize your extension edit "properties" object in properties.json file.
	
	"properties": {
		"chartHeadroom": 50
	},	

## Data Buckets

### Measures:

* **Thickness** - Connects dimension nodes if the measure has a value where they intersect.

### Dimensions:

* **From** - First dimension to provide nodes.
* **To** - Second dimension to provide nodes.  If the measure value exists when the From and To values overlap, they will be connected.