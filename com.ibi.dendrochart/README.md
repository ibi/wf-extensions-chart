#### Extension for WebFocus 8200
# Dendro RAG Chart
For installation instructions please visit this [link] (https://github.com/ibi/wf-extensions-chart/wiki/Installing-a-WebFocus-Extension "Installing a WebFocus Extension").
## Description
This extension displays a horizontal dendro chart with nodes containing the data value within a lozenge.
Up to three levels can be added together with "fail" and "total" values.
The lowest level is not expanded at runtime, but can be expanded by clicking on the parent node. Clicking on a parent node will expand or collapse the child node(s).
The "total" and "fail" values are accumulated from the lowest level through to the highest and are used to calculate a success percentage using "((total - fail) / total) * 100". The precentage is then used to evaluate how the node should be coloured. The thresholds are set within the "properties" section of the extensions "properties.json" file. Tooltips are automatic and are colour coded per the node to which it applies.
A main node is added when two or more nodes exist within the level[0] attribute. The main node data value can be set within the "properties" section of the extensions "properties.json" file. The default is "".
A drill down can be applied to the lowest node within the complete dendro chart by specifying the RS style path within the "properties" section of the extensions "properties.json" file. The default is "" for no drill down. Examples of both the Applications and Content folders are given within the "properties.json" file.
## Screenshots
![screenshot_1](https://github.com/ibi/wf-extensions-chart/blob/add-dendrorag-extension/com.ibi.dendrorag/screenshots/1.png)
![screenshot_2](https://github.com/ibi/wf-extensions-chart/blob/add-dendrorag-extension/com.ibi.dendrorag/screenshots/2.png)
## Configurations
To configure the default values for this extension, edit "properties" object in properties.json file.
	
	"properties": {
        "RootName": "",
        "indRed": 50,
        "indAmber": 70,
        "drilldown": "",
//        "drilldown": "/EDA/EDASERVE/ibisamp/carinst.fex",
//        "drilldown": "/WFC/Repository/Public/carinst.fex",
        "ddtarget": "_blank"
	}
    
To configure a change to the extension defaults, add an "extensions" section to the "*GRAPH_JS_FINAL" section of your Focexec procedure. e.g.

```json
*GRAPH_JS_FINAL
"extensions": {
	"com.ibi.dendrorag": {
        "RootName": "",
        "indRed": 50,
        "indAmber": 70,
        "drilldown": "/EDA/EDASERVE/ibisamp/carinst.fex",
        "ddtarget": "_blank"
	}
}
*END
```
## Data Buckets
### Measures:
* **fail (MES)** - a numerical value to be used within a calculation to derive the percentage ratio of the "total" value.
* **total (MES)** - a numerical value to be used within a calculation.
### Dimensions:
* **levels (DIM)** - defines the field used for the nodes within the collapsible dendro chart. Maximum of 3 can be included.
