#### Extension for WebFocus 8200

# Choropleth USA map

For installation instructions please visit this [link] (https://github.com/ibi/wf-extensions-chart/wiki/Installing-a-WebFocus-Extension "Installing a WebFocus Extension").

## Description

This extension is used to visualize numeric values that are assigned to states.

## Screenshots

![screenshot_1](https://github.com/ibi/wf-extensions-chart/blob/master/com.ibi.map.usa.choropleth/screenshots/1.png)

![screenshot_2](https://github.com/ibi/wf-extensions-chart/blob/master/com.ibi.map.usa.choropleth/screenshots/2.png)

## Configurations

To configure or customize your extension edit "properties" object in properties.json file.
	
	"properties": {
        "states": {
            "exclude": [],
            "colorRange": ["#d7ebef", "#4a89db"],
            "defaultColor": "lightgrey",
            "borders": {
                "color": "black",
                "width": 1
            }
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

## You can:

* exclude certain states from the map by including them into `properties.states.exclude` array.

* specify more than two heat map range colors in `properties.states.colorRange` array

* configure states borders

* disable/enable or configure color legend (background, border, title, labels)

## Data Buckets

### Measures:
* **Value Bucket** - sets numerical values of states.

### Dimensions:
* **State Bucket** - represent the states. You can use a state name or a state abbreviation. You can also use Washington D.C. (or DC).

