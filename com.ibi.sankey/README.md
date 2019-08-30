##### Extension for WebFOCUS 

# Sankey Flowchart
Sankey Flowchart extension for WebFocus 8200.

Based on the [Sankey d3 plugin]( https://github.com/d3/d3-sankey ).

**Updated to use D3.V4.min.js.**

For installation instructions please visit [Installing a WebFocus Extension]( https://github.com/ibi/wf-extensions-chart/wiki/Installing-a-WebFocus-Extension ).

## Description

This extensions shows and quantifies connections between categorical nodes.

Ideal chart for when you need to visualise a many-to-many relationship between two domains or multiple paths through a set of stages (for instance the stages of energy creation to output).

Properties:
* **chartHeadroom**: The amount of space to leave at the top of the chart.
* **colorMode**: How to colourise the link paths using either the default grey colour, or the colour from the source node, target node or both source and target nodes to form a gradient.
* **nodeWidth**: Sets the width of the nodes. Default 15 but a range of 5 - 50 has potential. Although higher values can make the chart cluttered.
* **nodePadding**: Sets the vertical padding between nodes. Default 18 but a range of 5 - 50 has potential. lower values make the chart cluttered whilst higher values could render the chart unuseable.
* **colors**: An array of colours to use for colouring the nodes and links. If your array has less colours than the number of nodes, the array is concatenated with itself until the length matches or exceeds the number of nodes. Set to false to use internally generated colours.
* **fadeOpacity**: The opacity to render out-of-focus links and nodes on mouse-over (min: 0.01; max: 0.2; default: 0.05).
* **nodeAlign**: Aligns the chart according to the alignment value. Acceptable values are justify, left, right or center.

## Screenshots

![screenshot_1](https://github.com/ibi/wf-extensions-chart/blob/master/com.ibi.sankey/screenshots/sankey1.png)

![screenshot_2](https://github.com/ibi/wf-extensions-chart/blob/master/com.ibi.sankey/screenshots/sankey2.png)

![screenshot_3](https://github.com/ibi/wf-extensions-chart/blob/master/com.ibi.sankey/screenshots/sankey3.png)

![screenshot_4](https://github.com/ibi/wf-extensions-chart/blob/master/com.ibi.sankey/screenshots/sankey4.png)

## Configurations
To configure the default values for this extension, edit "properties" object in properties.json file.
    
    "properties": {
        "chartHeadroom": 50,
        "nodeWidth": 15,
        "nodePadding": 18,
        "colorMode": "none",
        "colors": ["#5388be","#9ed675","#4fa03d","#fcce58","#e1542b"
                  ,"#efcca2","#b0c08f","#2c85ed","#e735d3","#07d6a0"
                  ,"#8167fe","#fcb769","#fede63","#b3cb11","#96a8d0"],
        "fadeOpacity": 0.05,
        "linkGradient": false,
        "nodeAlign": "justify"
    },
    
To configure a change to the extension defaults, add an "extensions" section to the "*GRAPH_JS_FINAL" section of your Focexec procedure. e.g.

```json
*GRAPH_JS_FINAL
"extensions": {
    "com.ibi.divergent": {
        "chartHeadroom": 50,
        "nodeWidth": 15,
        "nodePadding": 18,
        "colorMode": "source",
        "colors": ["#5388be","#9ed675","#4fa03d","#fcce58","#e1542b"
                  ,"#efcca2","#b0c08f","#2c85ed","#e735d3","#07d6a0"
                  ,"#8167fe","#fcb769","#fede63","#b3cb11","#96a8d0"],
        "fadeOpacity": 0.05,
        "linkGradient": false,
        "nodeAlign": "justify"
    }
}
*END
```
## Data Buckets

### Measures:

* **Link Value** - Connects dimension nodes if they have any shared values for the specified measure.

### Dimensions:

* **Source Node** - Dimension whose values will form the start of the link connecting each value to each shared target value. 

* **Target Node** - Dimension whose values will form the end of the link.