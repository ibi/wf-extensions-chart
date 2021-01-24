# USA Hexmap

For installation instructions please see the [Installing a WebFocus Extension](https://github.com/ibi/wf-extensions-chart/wiki/Installing-a-WebFocus-Extension) page.

## Description

This extension displays US State data using hexagons instead of standard geographic State boundaries. By doing this, small states like Maine, Connecticut, and Rhode Island are easier to locate and place a mouse pointer over to interact with.

## Extension Properities

* font_color - color of the font that shows the 2 letter state code in the polygon - default is "#000000"

## Other Configuration Options:

* Color Scale - you can use the standard WebFOCUS chart configuration to set the color scale. See the following for more [details](https://webfocusinfocenter.informationbuilders.com/wfappent/TL4s/TL_js/source/special131.htm). 

Example (need to open FEX text editor to add):
*GRAPH_JS_FINAL
"colorScale": {
    "colors": ["limegreen", "cyan", "teal", "green"]
    ,"labels":{
        "color": "#505050"
    }
},
*END
## Data Buckets

* state - field that contains the 2 letter ISO code of the US State
* color - numeric field you want the visualize as a color on the state
* tooltips - additional numeric fields you want to show in the tooltip