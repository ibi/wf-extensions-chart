#### Extension from WebFocus 8200

# Linear Real Time

For installation instructions please visit this [link](https://github.com/ibi/wf-extensions-chart/wiki/Installing-a-WebFocus-Extension "Installing a WebFocus Extension").

## Description

The aim for this extension is to provide a visualization that provides a periodic refresh of the information displayed without the “blink” associated with reloading the whole chart container frame.<br>
This kind of visualization is useful in IoT projects and other real time tracking projects.<br>
Information updates will be carried out by means of a horizontal "sliding" time axis in such a way that the most recent events will appear on the right and the oldest ones will disappear on the left.<br>
The approach to get this target is to use a second procedure that will be called in an asynchronous way (AJAX) to update the points in the chart for the newest events. This procedure, as well as the refresh time period, must be specified in the extension properties.

## Screenshots

![screenshot_1](https://github.com/ibi/wf-extensions-chart/blob/master/com.ibi.linear_real_time/screenshots/real_time.gif)

## Configurations

To configure or customize your extension, edit the "properties" object in the properties.json file. In Release 8206 and higher, WebFOCUS Designer provides an Extension Properties option to make changes from the user interface.

**Any property can be overwritten by specifying property values in the WebFOCUS chart code (GRAPH_JS_FINAL Properties) or in an .sty StyleSheet file referenced by the chart procedure.**
	
	"properties": {
		"ajax":{
			"folderItem": null  // Ajax call complete path (Ajax is called with parameters: &LAST_DATE = "contains the last loaded date" and &DATE = "contains the new date to load")
		},
		"times":{
			"timeInterval": "30", // Ajax call interval in seconds
			"timeRange": "300", // Date axis range in seconds
			"timeEffect": "1" // Time effect duration in seconds
		},
		"bodyBackgroundColor": "transparent", // background color
		"shorten": {
			"shortenNumber": true, // Shorten number true/false
			"typeShortenNumber": "short scale" // type of shorten number "short scale"/"long scale"
		},
		"markers": {
			"showMarkers": false, // Markers true/false
			"radius": "3" // radius of markers
		},
		"dataLabels": {
			"show": false // Data Labels true/false
		},
		"yaxisOptions": {
			"y1axis": {
				"Max": null, // Y1 axis maximum value
				"showTitle": false, // Y1 axis title true/false
				"title": null // Y1 axis title
			},
			"y2axis": {
				"Max": null, // Y2 axis maximum value
				"showTitle": false, // Y2 axis title true/false
				"title": null // Y2 axis title
			}
		},
		"xaxisOptions": {
			"showTitle": false, // X axis title true/false
			"title": null // X axis title
		}
	}


## Data Buckets

### Measures:
* **y1axis Bucket (0:1, not required)** - Not required. Assigns a numeric value, it will show the values with the left Y axis
* **y2axis Bucket (0:1, not required)** - Not required. Assigns a numeric value, it will show the values with the right Y axis

### Dimensions
* **xaxis Bucket (1, required)** - Required. Assigns a date value, it will show the dates in X axis
* **color Bucket (0:1, non required)** - Not required. Assigns a dimension, which generates series colors for each value along the Y axis


## Example
As this extension requires a real time data source, you can find here a complete example simulating this kind of data source by using a flow that inserts data periodically in a FOC file, which is used as data source by the extension.<br>
As previously mentioned, the linear real time chart loads new data from an AJAX request in each time interval. This AJAX request must target a procedure having a very similar structure in terms of data extraction as the one used in the extension procedure. This example also provides this procedure in order to show a complete use case.


### Data load process:
To have real time data, we have created a Process Flow that insert rows in a .foc file each minute to provide real time data accessible through the Master File
* **Master to read the stores real time data**:<br>
	..\ibi\apps\wf_extensions\real_time_data.mas
* **Master and foc to store real time data**:<br>
	..\ibi\apps\wf_extensions\real_time_data.foc
* **Process Flow to execute inserction of new data each minute**:<br>
	..\ibi\apps\wf_extensions\pf_real_time_data.fex

The example folder contains a Change Management import that provides components for data and visualization.<br>
The real_time_data Master File and .foc file will reload each minute with new random data from the pf_real_time_data.fex Process Flow, providing us the real time data to show in the visualization.<br>
We have to include the wf_extensions path in edasprof to allow this Process Flow to work.
	
### Chart visualization:
To allow the linear real time chart to function properly, we need to include it in a Designer page to provide a token for the AJAX class. It should include the fex for AJAX calls to take the new real time data, and the actual visualization of the linear real time chart.
* **Real time chart visualization**:<br>
	IBFS:/WFC/Repository/wf_extensions/real_time/real_time_chart.fex
* **Fex for AJAX call of real time chart** (the visualization takes from parameter the complete path from properties.ajax.folderItem):<br>
	IBFS:/WFC/Repository/wf_extensions/real_time/real_time_ajax.fex
* **Page Designer page to contain real time chart and provide the token to allow ajax calls**:<br>
	IBFS:/WFC/Repository/wf_extensions/real_time/page_real_time

The visualization and page have components configured in the following manner:
* **Ajax fex real_time_ajax.fex getting last data loaded from real_time_data.mas and with the same structure as linear real time visualization**
* **Linear real time visualization real_time_chart.fex has the same structure as AJAX fex showing only the last loaded dates**<br>
	It has the next needed parameter configured to allow AJAX calls:<br>
	properties.ajax.folderItem = "IBFS:/WFC/Repository/wf_extensions/real_time/real_time_ajax.fex"
* **The Designer page page_real_time shows the Linear real time visualization real_time_chart.fex, providing us the token to allow AJAX calls**<br>
	The token is needed because the AJAX call doesn't work without it. It needs the token to validate the correct login.

## notes for use

### Construction **(WARNING)**
* **The visualization needs the parameter properties.ajax.folderItem pointing to the AJAX fex with the same structure of data as the actual visualization.**
* **The visualization will not work if isn't in a Designer page because otherwise it doesn't have the token to access to AJAX calls correctly.**
* **time properties are parameters in properties.ajax.times**<br>
	**timeInterval**: Set the time interval of AJAX calling in seconds.<br>
	**timeRange**: Set the range of the time or date axis showed in seconds.<br>
	**timeEffect**: Set the effect duration time in seconds.

### Executing
* **You have to execute the page containing the visualization. The visualization will not work on its own.**