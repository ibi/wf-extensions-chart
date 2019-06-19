#### Extension for WebFocus 8200
# Divergent Bar Chart
For installation instructions please visit this [link] (https://github.com/ibi/wf-extensions-chart/wiki/Installing-a-WebFocus-Extension "Installing a WebFocus Extension").
## Description
This extension displays a horizontal stacked bar chart with series representing survey type question results.
A single dimension representing the Question and exactly 5 measures representing the answers to the questions, are required.
The series titles within the Legend are taken from the title attribute from within WebFOCUS e.g. DATACOLUMN AS 'Title'.
Within the configurable section, the colour array can be defined, together with a true/false indicator on whether to use the JSCHART series colours or those from the properties section.
If long text is used in the question then tha first 70 chars will be displayed if the chart size has sapce to do so. When the chart falls below a set height, the question text is changed to "Question #" where the hash (#) reflects the order of the question within the data.


## Screenshots
![screenshot_1](https://github.com/ibi/wf-extensions-chart/blob/add-dendrorag-extension/com.ibi.divergent/screenshots/1.png)
![screenshot_2](https://github.com/ibi/wf-extensions-chart/blob/add-dendrorag-extension/com.ibi.divergent/screenshots/2.png)
## Configurations
To configure the default values for this extension, edit "properties" object in properties.json file.
	
	"properties": {
        "useSeriesColours": false,             // This will determine whether the colours set within "series" of the CHART_JS properties are used.
        "colors": ["#c7001e", "#f6a580", "#cccccc", "#92c6db", "#086fad"] // If "useSeriesColours" is false, these are the colours that are used.
	},
	
To configure a change to the extension defaults, add an "extensions" section to the "*GRAPH_JS_FINAL" section of your Focexec procedure. e.g.

```json
*GRAPH_JS_FINAL
"extensions": {
	"com.ibi.divergent": {
        "useSeriesColours": false,
        "colors": ["#c7001e", "#f6a580", "#cccccc", "#92c6db", "#086fad"]
	}
}
*END
```
## Data Buckets
### Measures:
* **replies (MES)** - a numerical value representing the number of replies to the question used in the dimension bucket. Exactly 5 must be supplied.
### Dimensions:
* **Question (DIM)** - the field used for the question dimension. Only 1 can be included.
