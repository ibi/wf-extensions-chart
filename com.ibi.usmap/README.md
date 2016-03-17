
#### Extension for WebFocus 8200

# USMAP

For installation instructions please visit this [link] (https://github.com/ibi/wf-extensions-chart/wiki/Installing-a-WebFocus-Extension "Installing a WebFocus Extension").

## Description

This extension helps to visualize relationships ( that can be quantified ) between different objects on the US map. You can use Source and Source Size buckets to make a bubble map chart or you can use Source, Destination, Link Width and Link Color buckets to make a network map chart.

## Screenshots

![screenshot_1](https://github.com/ibi/wf-extensions-chart/blob/master/com.ibi.usmap/screenshots/1.png)

![screenshot_2](https://github.com/ibi/wf-extensions-chart/blob/master/com.ibi.usmap/screenshots/2.png)

![screenshot_2](https://github.com/ibi/wf-extensions-chart/blob/master/com.ibi.usmap/screenshots/3.png)

## Configurations

To configure or customize your extension edit "properties" object in properties.json file.
	
	"properties": {
	    "toolTip": {
	      "enabled": true
	    },
	    "legends": {
	    	"enabled": true,
	    	"linkWidth": {
	    		"enabled": true,
	    		"color": "#e0e0e0"
	    	},
	    	"linkColor": {
	    		"enabled": true,
	    		"color": "#e0e0e0"
	    	},
	    	"nodeSize": {
	    		"enabled": true,
	    		"color": "#e0e0e0"
	    	}
	    },
	    "links": {
	    	"defaultWidth": 1,
	    	"defaultColor": "#000",
	    	"widthRange": [1, 10],
	    	"colorRange": ["#bdbdbd", "#000"]
	    },
	    "nodes": {
	    	"dataSeparator": ";",
	    	"defaultSize": 4,
	    	"defaultColor": "lightblue",
	    	"sizeRange": [4, 15]
	    },
	    "colorStates": true
	}
	
You can customize legends, links and nodes. You can also enable/disable tooltip and make states to be colored.
## Data Buckets

### Measures:
* **Link Width** - the thicker the link the larger the value, the thinner the link the smaller the value.
* **Link Color** - you can set link color range by changing `properties.links.colorRange` in properties.json file.
* **Source Size** - you can set node size range by changing `properties.nodes.sizeRange` in properties.json file.

### Dimensions
* **Source** - represents an object on a map or the beginning of the link. There are two formatting options for the source values. **First option**, you provide a name of the city or an official airport name abbreviation, given that you can find it in the **./data/airports.js** file. This way extension engine can lookup the coordinates of your city/airport in the **./data/airports.js** file and render a dot on the map. **Second option**, you provide a string with three values: Label, Longitude and Latitude. These three values in the sting must be separated by a character that you can set in properties.json file. To change this character open the file and change `properties.nodes.dataSeparator` value. By default it is set to ';'. For example, your data string can look like this `"Los Angeles;-118.4079971;33.94250107"`.

* **Destination** - represents the end of the link. Uses same formatting rules as Source bucket.
