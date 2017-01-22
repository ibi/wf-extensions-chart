#### Extension for WebFocus 8200

# Cluster Diagram

For installation instructions please visit this [link] (https://github.com/ibi/wf-extensions-chart/wiki/Installing-a-WebFocus-Extension "Installing a WebFocus Extension").

## Description

This extension helps to visualize hierarchical data sets.

## Screenshots

![screenshot_1](https://github.com/ibi/wf-extensions-chart/blob/master/com.ibi.cluster/screenshots/1.png)

![screenshot_2](https://github.com/ibi/wf-extensions-chart/blob/master/com.ibi.cluster/screenshots/2.png)

![screenshot_3](https://github.com/ibi/wf-extensions-chart/blob/master/com.ibi.cluster/screenshots/3.png)

![screenshot_4](https://github.com/ibi/wf-extensions-chart/blob/master/com.ibi.cluster/screenshots/4.png)

## Configurations

To configure or customize your extension edit "properties" object in properties.json file.
	
	"properties": {
          "isRadial": false,
          "nodes": {
            "size": 5,
            "maxLevelOffset": 180,
            "colors": {
              "empty": "white",
              "notEmpty": "lightblue"
            },
            "border": {
              "width": 1,
              "color": "blue"
            },
            "labels": {
              "color": "black",
              "font": "10px sans-serif"
            }
          },
          "links": {
            "color": "lightgrey",
            "width": 1
          }
        }
	
You can customize nodes, labels and links. Also, you can switch between radial and horizontal modes.

## Data Buckets

### Dimensions
* **Levels (DIM)** - set of dimensions that form levels.
