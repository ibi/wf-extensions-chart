#### Extension for WebFocus 8200

# Org Chart

For installation instructions please visit this [link] (https://github.com/ibi/wf-extensions-chart/wiki/Installing-a-WebFocus-Extension "Installing a WebFocus Extension").

## Description

This extension helps to visualize a hierarchical structure of a data set.

## Screenshots

![screenshot_1](https://github.com/ibi/wf-extensions-chart/blob/master/com.ibi.orgchart/screenshots/1.png)

![screenshot_1](https://github.com/ibi/wf-extensions-chart/blob/master/com.ibi.orgchart/screenshots/1.png)

## Configurations

To configure or customize your extension edit "properties" object in properties.json file.
	
	"properties": {
		colorRange: ['#ff0000', '#008000']
	}
	
You can only customize a color range of the color scale.
## Data Buckets

### Measures:
* **Size** - sets value of circle quantitative dimension ( radius ).
* **Sort** - enables you to sort by measures (ex. if you sort and size by country, all the larger circles will be closer to the middle).

### Dimensions:
* **Levels Bucket** - dragging dimensions to this bucket creates new levels.

* **Value Bucket** - values in this bucket are used to build a color scale and then color a node according to that colors scale.

