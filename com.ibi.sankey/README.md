##### Extension for WebFOCUS 

# Sankey Flowchart

Sankey Flowchart extension for WebFocus 8200.

Based on the [Sankey d3 plugin](https://github.com/d3/d3-sankey).

## Description

This extensions shows and quantifies connections between categorical nodes.

## Screenshots

![screenshot_1](https://github.com/ibi/wf-extensions-chart/blob/master/com.ibi.sankey/screenshots/sankey1.png)

![screenshot_1](https://github.com/ibi/wf-extensions-chart/blob/master/com.ibi.sankey/screenshots/sankey2.png)

## Configurations

To configure or customize your extension, edit the "properties" object in the properties.json file.

	"properties": {
		"chartHeadroom": 50
	},

## Data Buckets

### Measures:

* **Link Value** - Connects dimension nodes if they have any shared values for the specified measure.

### Dimensions:

* **Source Node** - Dimension whose values will form the start of the link connecting each value to each shared target value. 

* **Target Node** - Dimension whose values will form the end of the link.