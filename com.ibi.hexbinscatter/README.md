#### Extension for WebFocus 8200

# Hexbin Scatter

For installation instructions please visit this [link] (https://github.com/ibi/wf-extensions-chart/wiki/Installing-a-WebFocus-Extension "Installing a WebFocus Extension").

## Description

This extension helps to visualize relationships ( that can be quantified ) between different objects on the US map. You can use Source and Source Size buckets to make a bubble map chart or you can use Source, Destination, Link Width and Link Color buckets to make a network map chart.

## Screenshots

![screenshot_1](https://github.com/ibi/wf-extensions-chart/blob/master/com.ibi.hexbinscatter/screenshots/1.png)

![screenshot_2](https://github.com/ibi/wf-extensions-chart/blob/master/com.ibi.hexbinscatter/screenshots/2.png)

## Configurations

To configure or customize your extension edit "properties" object in properties.json file.
	
	"properties": {
		"circles": {
			"hide": false,
			"radius": 3,
			"opacity": 0.8,
			"color": "#849eb2"
		},
		"hexbin": {
			"mesh": false,
			"radius": 20,
			"colors": ["red", "yellow", "green"]
		},
		"colorLegend": {
            "enabled": true,
            "background": {
                "color": "none"
            },
            "border": {
                "color": "black",
                "width": 1,
                "round": 2
            },
            "title": {
                "font": "16px serif",
                "color": "black"
            },
            "rows": {
                "count": "auto",
                "labels": {
                    "font": "10px serif",
                    "color": "black",
                    "format": "auto"
                }
            }
        }
	}

## Data Buckets

### Measures:

* **X Axis (MES)** - used to set a horizontal position of data point on a chart.

* **Y Axis (MES)** - used to set a vertical position of data point on a chart.

* **Aggregate Value (MES)** - by default we count a number of circles in a bin to build bin's color scale, but if you drag a measure to this bucket, then values of all data points in a bucket will be summed up and used to build bin's color scale.

### Dimensions:

* **Detail (DIM)** - break data set by category ( if has no dimension, WebFocus just sums up all the values ).

