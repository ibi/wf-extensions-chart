#### Extension for WebFocus 8200

# Chord Diagram

Based on the chord d3 layout (https://github.com/mbostock/d3/wiki/Chord-Layout#chord).

For installation instructions please visit this [link] (https://github.com/ibi/wf-extensions-chart/wiki/Installing-a-WebFocus-Extension "Installing a WebFocus Extension").

## Description

This interactive extension helps to visualize relationships among a group of entities.

## Screenshots

![screenshot_1](https://github.com/ibi/wf-extensions-chart/blob/master/com.ibi.chord/screenshots/1.png)

![screenshot_1](https://github.com/ibi/wf-extensions-chart/blob/master/com.ibi.chord/screenshots/2.png)

## Configurations

To configure or customize your extension edit "properties" object in properties.json file.
	
	"properties": {
		"inverseData": false,
		"chordSort": "none",
		"groupPadding": 0.05,
		"groupCurves": {
			"radius": {
				"inner": "auto",
				"outer": "auto"
			},
			"title": {
				"font": "12px sans-serif",
				"color": "black",
				"bold": true
			}
		},
		"axis": {
			"preciseCount": false,
			"label": {
				"fontFamily": "sans-serif",
				"fontSize": "10px",
				"format": ".2s",
				"count": 20
			},
			"ticks": {
				"count": 90
			}
		}
	}

## Data Buckets

### Measures:

* **Node Link Values (MES)** - assigns a numerical value to a link.

### Dimensions:

* **Source Nodes (DIM)** - defines source of the link.

* **Target Nodes (DIM)** - defines target of the link.

