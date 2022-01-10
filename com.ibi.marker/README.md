#### Extension for WebFocus 8200

# Marker

For installation instructions please visit this [link] (https://github.com/ibi/wf-extensions-chart/wiki/Installing-a-WebFocus-Extension "Installing a WebFocus Extension").

## Description

This extension shows quantitative proportions by a single category.

## Screenshots

![screenshot_1](https://github.com/ibi/wf-extensions-chart/blob/master/com.ibi.marker/screenshots/1.png)

![screenshot_2](https://github.com/ibi/wf-extensions-chart/blob/master/com.ibi.marker/screenshots/2.png)

## Configurations

To configure or customize your extension edit "properties" object in properties.json file.
	
	"properties": {
        "extraMarkersColor": '#898989',
        "mode": "proportion",
        "marker": {
            "minNumberOfNodes": 0, // Number of minimun nodes to show when value is too small
            "maxNumberOfNodes": 1000, // Number of maximun nodes to show when value is too large
            "type": 'circle',
            "cellRatio": 0.8,
            "countRange" : [100, 625]
        },
        "label": {
            "enabled": true,
            "format": 'auto',
            "font": {
                "color": 'auto'
            }
        }
    }

This extension can work in two modes: `'proportion'` and `'count'`.  In `'proportion'` mode the total number of nodes that engine renders will be between first and second values of `marker.countRange` array. If you notice that some relatively small data values are not rendered you can try to set second value of `marker.countRange` to a higher number ( warning: that can lower the speed of rendering and animation ). In `'count' mode the total number of the nodes that is rendered will depend on the sum of all values ( warning: if you are dealing with a data set that sums up to a number that is larger than a 1000, you should set extension to `'proportion'` mode ). 

## Data Buckets

### Measures:
* **Number of Markers Bucket** - sets numerical values of categories.

### Dimensions:
* **Labels Bucket** - represent categories.

