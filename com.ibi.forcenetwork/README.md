
#### Extension for WebFocus 8200
# Force networks Chart

Based on an original example developed by Mike Bostock. See https://bl.ocks.org/mbostock/4062045

For installation instructions please visit this [link](https://github.com/ibi/wf-extensions-chart/wiki/Installing-a-WebFocus-Extension "Installing a WebFocus Extension").

## Description

This extension shows the relationship(s) between items, which are displayed as the nodes.

* The extension requires that the minimum of the "From" and "To" buckets are populated.
* All buckets (with the exception of "Tooltip") accept only 1 field.
* The chart will cope with up to and including 3 different relationship values between 2 nodes.
* Dragging a node to a new location in the chart will make that node inactive from the "force" and it will be annotated with a "pin" or outer "ring" to show that it is in a "locked" condition. The type of lock can be set in properties (default: pin).
* Double-clicking a "locked" node will release the lock and the node will, once again, be affected by the "force".
* Tooltips can be disabled in properties. If the Tooltip bucket is populated, this property is overridden to true.
* Source Nodes, that have multiple links, will have any tooltip text appended to form multiple lines.
* Target node tooltips are derived from the node type and value.
* Each "nodeTypes" color should have a contrasting color in "textTypes" to allow the text to be readable within the node object.

An example procedure, with dynamic data, is contained within the "code_and_data" subfolder.

As the various settings of D3.Force can vary the resultant chart and each chart really requires settings to be custom for the chart output required, the most important settings from D3.V3 are included within the properties.

## Screenshots

![screenshot_1](https://github.com/ibi/wf-extensions-chart/blob/master/com.ibi.forcenetwork/screenshots/forcenetwork1.png)

![screenshot_2](https://github.com/ibi/wf-extensions-chart/blob/master/com.ibi.forcenetwork/screenshots/forcenetwork2.png)

## Configurations

To configure the **default** values for this extension, edit the "properties" object in properties.json file.

Some properties, such as "nodeTypes" are arrays of colors. Please note that, in early versions of the GUI, arrays are not able to be modified.

	"properties": {
		"chartHeadroom": 50,
		"colorLinks": false,
		"colors": {
			"pinhead": "#c00",
			"nodeTypes": ["#f2d68a","#c990c0","#f79767","#57c7e3","#f37171","#d9c8ae","#8dcc93","#ecb5c9","#4c8eda","#ff4c54","#da7194","#569480"],
			"textTypes": ["#604a0e","#ffffff","#ffffff","#ffffff","#ffffff","#604a0e","#604a0e","#604a0e","#ffffff","#604a0e","#ffffff","#ffffff"],
			"links": "rgb(160,160,160)"
		},
		"lockType": "pin",
		"linkDistance": 100,
		"linkCharge": -400,
		"linkStrength": 0.5,
		"chargeDistance": 1000,
		"gravity": 0.1,
		"friction": 0.9
	}
    
To configure a change to the extension defaults, add an "extensions" section to the "*GRAPH_JS_FINAL" section of your Focexec procedure. e.g.

```json
*GRAPH_JS_FINAL
"extensions": {
	"com.ibi.forcenetwork": {
		"chartHeadroom": 50,
		"colorLinks": true,
		"colors": {
			"pinhead": "#c00",
			"nodeTypes": ["#f2d68a","#c990c0","#f79767","#57c7e3","#f37171","#d9c8ae","#8dcc93","#ecb5c9","#4c8eda","#ff4c54","#da7194","#569480"],
			"textTypes": ["#604a0e","#ffffff","#ffffff","#ffffff","#ffffff","#604a0e","#604a0e","#604a0e","#ffffff","#604a0e","#ffffff","#ffffff"],
			"links": "rgb(160,160,160)"
		},
		"lockType": "pin",
		"linkDistance": 100,
		"linkCharge": -400,
		"linkStrength": 0.5,
		"chargeDistance": 1000,
		"gravity": 0.1,
		"friction": 0.9
	}
}
*END
```
## Data Buckets
### Dimensions:
* **From (source)** - First dimension to provide nodes.
* **To (target)** - Second dimension to provide nodes.  If the measure value exists when the From and To values overlap, they will be connected.
* **Relationship** - A field containing a word (only 8 chars shown) of description that represents the relationship between the source and target nodes. A maximum of 3 different values are supported.
* **Source Type** - A field containing a word of description that represents the source node.
* **Target Type** - A field containing a word of description that represents the target node.
* **Tooltip** - Up to 4 fields that will be used for tooltips.
### Measures:
* **Size** - Affects the size of the nodes to show impact to node.
* **Thickness** - Affects the link line thickness to show greater connectivity.