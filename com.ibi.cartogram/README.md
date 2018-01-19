#### Extension for WebFocus 8200

# Cartogram

WebFOCUS Plug In for USA Map as a Cartogram developed by Mario Delgado-Information Builders, Inc.
Implements Cartogram as developed by Shawn Allen.  See: http://prag.ma/code/d3-cartogram/

CartogramPrototype.html is a simplified prototype of the technique on http://prag.ma/code/d3-cartogram/ with randomly generated numbers.

## Description

Cartogram for U.S. states.

##Screenshots

![screenshot_1](https://github.com/ibi/wf-extensions-chart/blob/master/com.ibi.cartogram/screenshots/cartogram1.png)

![screenshot_1](https://github.com/ibi/wf-extensions-chart/blob/master/com.ibi.cartogram/screenshots/cartogram2.png)


## Configurations

To configure or customize your extension edit "properties" object in properties.json file.

	"properties": {
		"chartHeadroom": 50
	},

## Data Buckets

### Measures:

* **Value Bucket** - assigns a numeric value to a category.

### Dimensions:

* **State** - field containing U.S. state values for the chart.