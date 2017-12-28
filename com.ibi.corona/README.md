#### Extension for WebFocus 8200
# Corona Chart
For installation instructions please visit this [link] (https://github.com/ibi/wf-extensions-chart/wiki/Installing-a-WebFocus-Extension "Installing a WebFocus Extension").
## Description
This extension shows comparisons among series within groups. It allows a quick comparison between groups when the cursor is moved over data points.
## Screenshots
![screenshot_1](https://github.com/ibi/wf-extensions-chart/tree/master/com.ibi.corona/screenshots/1.png)
![screenshot_2](https://github.com/ibi/wf-extensions-chart/tree/master/com.ibi.corona/screenshots/2.png)
## Configurations
To configure the default values for this extension, edit "properties" object in properties.json file.
	
	properties: {		
		"title": {
			"visible": true,			// Boolean value to trigger the display or not of the title text.
			"text": "",				// If provided, this will form the title rendered within the chart.
			"align": "centre",			// The alignment of the chart title, left or right else defaults to centre.
			"color": "rgb(102,30,117)"		// The font colour of the title text.
		},
		"datarange": {
			"inc_zero": true,			// Boolean value to trigger the chart range to begin at a zero value.
		},
		"ringreference": {
			"visible": true,			// Boolean to trigger the display or not of the reference ring on mouseover.
		},
		"ringlabels": {
			"visible": true,			// Boolean to trigger the display or not of the labels for the grid rings.
			"angle": 345				// The angle at which the grid ring labels should be shown. 0 is the 12 o'clock position
		},
		"backcolors": {
			"stopcolor1": "rgb(255,255,255)",	// The background colour is a gradient which goes from color1 though color2
			"stopcolor2": "rgb(255,255,255)"	// and then back to color1 again. Resulting in equal transitions across the chart background.
		},
		"radialcolor": {
			"stopcolor1": "rgb(102,30,117)",	// The series shapes are subjected to a radial gradient from the central point
			"stopopacity1": 1,			// to the outermost portion of the shape.
			"stopcolor2": "rgb(145,43,167)",	// The first values are for the central colour and opacity for the shape
			"stopopacity2": 0.25			// which radiates to a less opaque rendering.
		},
		"labels": {
			"radial": {
				"color": "rgb(102,30,117)"	// The colour applied to the Radial labels.
			},
			"centre": {
				"color": "rgb(102,30,117)"	// The colour applied to the central labels.
			}
		}
	}
To configure a change to the extension defaults, add an "extensions" section to the "*GRAPH_JS_FINAL" section of your Focexec procedure. e.g.

```json
*GRAPH_JS_FINAL
"extensions": {
	"com.ibi.corona": {
		"title": {
			"visible": true,
			"text": "D3 Corona Chart - Developed by IB(UK)",
			"align": "centre",
			"color": "rgb(255,255,255)" 
		},
		"datarange": {
			"inc_zero": false
		},
		"ringreference": {
			"visible": true,
		},
		"ringlabels": {
			"visible": true,
			"angle": 165
		},
		"backcolors": {
			"stopcolor1": "rgb(200,72,72)",
			"stopcolor2": "rgb(200,64,64)"
		},
		"radialcolor": {
			"stopcolor1": "rgb(255,255,255)",
			"stopopacity1": 1,
			"stopcolor2": "rgb(255,255,255)",
			"stopopacity2": 0.35,
		},
		"labels": {
			"radial": {
				"color": "rgb(255,255,255)"
			},
			"centre": {
				"color": "rgb(255,255,255)"
			}
		}
	}
}
*END
```
## Data Buckets
### Measures:
* **value (MES)** - assigns a numerical value to a radial category within a series.
### Dimensions:
* **radial (DIM)** - defines the field used for the radial points around the circular chart.
* **series (DIM)** - defines the field used for the series grouping depicted within the coronal (amoeba-like) area.
