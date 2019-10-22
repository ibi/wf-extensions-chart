#### Extension for WebFocus 8200

# World Choropleth and Bubble Map

For installation instructions please visit this [link](https://github.com/ibi/wf-extensions-chart/wiki/Installing-a-WebFocus-Extension "Installing a WebFocus Extension").

## Description

This extension is used to visualize numeric values that are assigned to countries or to geographic coordinates.

## Screenshots

### Bubble Mode

![screenshot_1](https://github.com/ibi/wf-extensions-chart/blob/master/com.ibi.map.world/screenshots/1.png)

### Bubble Mode with Value Labels

![screenshot_1](https://github.com/ibi/wf-extensions-chart/blob/master/com.ibi.map.world/screenshots/1.5.png)

### Choropleth Mode

![screenshot_2](https://github.com/ibi/wf-extensions-chart/blob/master/com.ibi.map.world/screenshots/2.png)

## Configurations

To configure or customize your extension edit "properties" object in properties.json file.
	
	"properties": {
          "countries": {
            "exclude": ["Antarctica"],
            "defaultColor": "lightgrey",
            "borders": {
              "color": "black",
              "width": 1
            }
          },
          "colorScale": {
            "range": ['#d7ebef', '#4a89db']
          },
          "choropleth": {
            "border": {
              "color": "black",
              "width": 1 
            }
          },
          "bubbles": {
            "border": {
              "color": "black",
              "width": 1 
            },
            "labels": {
              "enabled": false,
              "format": "auto",
              "color": "black",
              "fontFamily": "sans-serif",
              "fontWeight": "bolder",
              "toBubbleSizeRatio": 0.5	
            },
            "defaultColor": "auto",
            "bubbleSizeRange": [7, 20]
          },
          "colorLegend": {
            "enabled": true,
            "background": {
              "color": 'none'
            },
            "border": {
              "color": 'black',
              "width": 1,
              "round": 2
            },
            "title": {
              "font": '16px serif',
              "color": 'black'
            },
            "rows": {
              "count": 'auto',
              "labels": {
                "font": '10px serif',
                "color": 'black',
                "format": 'auto'
              }
            }
          },
          "sizeLegend": {
            "enabled": true,
            "background": {
              "color": 'none'
            },
            "border": {
              "color": 'black',
              "width": 1,
              "round": 2
            },
            "title": {
              "font": '16px serif',
              "color": 'black'
            },
            "rows": {
              "count": 'auto',
              "labels": {
                "font": '10px serif',
                "color": 'black',
                "format": 'auto'
              }
            }
          }
        }

## You can:

* Exclude certain countries from the map by including them into `properties.countries.exclude` array.

* Specify more than two heat map range colors in `properties.states.colorRange` array

* Configure country borders

* Disable/enable or configure color legend (background, border, title, labels)

## Data Buckets

### Measures:
* **Value (MES)** - sets numerical values of countries or geographic coordinates.

### Dimensions:
* **Name (DIM)** - official country names. Please use `data/countryName_to_id_map.js` file to look up names of the countries that you can use.

* **Longitude (DIM)** - longitude value of the coordinate.

* **Latitude (DIM)** - latitude value of the coordinate.
