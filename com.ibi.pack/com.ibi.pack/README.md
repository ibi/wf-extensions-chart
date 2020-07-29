
#### Extension for WebFocus 8200

# Pack

For installation instructions please visit this [link] (https://github.com/ibi/wf-extensions-chart/wiki/Installing-a-WebFocus-Extension "Installing a WebFocus Extension").

## Description

This extension helps to visualize quantitative dimension of all data point in the data set.

## Screenshots

![screenshot_1](https://github.com/ibi/wf-extensions-chart/blob/master/com.ibi.pack/screenshots/1.png)

## Configurations

To configure or customize your extension edit "properties" object in properties.json file.
	
	"properties": {
		"circles": {
			"colors": ["#4087b8","#e31a1c","#9ebcda","#c994c7","#41b6c4","#49006a","#ec7014","#a6bddb","#67001f","#800026","#addd8e","#e0ecf4","#fcc5c0","#238b45","#081d58","#d4b9da","#2b8cbe","#74a9cf","#41ab5d","#fed976","#ce1256","#7f0000","#a6bddb","#ffffcc","#e7e1ef","#016c59","#f7fcfd","#99d8c9","#fff7fb","#ffffe5","#fdd49e","#ffffd9","#fe9929","#8c96c6","#810f7c","#993404","#c7e9b4","#bfd3e6","#e7298a","#7fcdbb","#3690c0","#ae017e","#d9f0a3","#ece2f0","#014636","#f7fcb9","#66c2a4","#fff7bc","#f7fcf0","#e5f5f9","#fdbb84","#fa9fb5","#4d004b","#fff7fb","#cc4c02","#78c679","#1d91c0","#ccebc5","#feb24c","#b30000","#8c6bb1","#fec44f","#d0d1e6","#084081","#0868ac","#f7fcfd","#0570b0","#ef6548","#fff7ec","#006837","#f768a1","#edf8b1","#fee391","#238443","#ffffe5","#023858","#7a0177","#67a9cf","#dd3497","#980043","#88419d","#d0d1e6","#fc8d59","#4eb3d3","#fd8d3c","#fff7f3","#fc4e2a","#ccece6","#ece7f2","#a8ddb5","#41ae76","#bd0026","#e0f3db","#045a8d","#ffeda0","#253494","#7bccc4","#fde0dd","#00441b","#225ea8","#006d2c","#02818a","#f7f4f9","#d7301f","#df65b0","#662506","#3690c0","#004529","#fee8c8"],
			"labels": {
				"font" : "12px sans-serif"
			},
			"padding": 3
		},
		"legend": {
			"enabeld": false,
			"title": {
				"font": "14px sans-serif"
			},
			"labels": {
				"font": "12px sans-serif"
			}
		},
		"hover": {
			"stroke": "grey",
			"stroke-width": 3
		},
	    "toolTip": {
	      "enabled": true
	    }
	}
	
You can customize circles, circles hover animation and legend. You can also enable/disable tooltip.
## Data Buckets

### Measures:
* **Size (MES)** - sets value of circle quantitative dimension ( radius ).
* **Sort (MES)** - enables you to sort by measures (ex. if you sort and size by country, all the larger circles will be closer to the middle).

### Dimensions:
* **Labels (DIM)** - represent different categories.

* **Color (DIM)** - enables you to create a color grouping.

* **Sort (DIM)** - enables you to sort by dimensions (ex. if you sort and color by country, all the circles with the same color will be closer together).

