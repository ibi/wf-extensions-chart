#### Extension from WebFocus 8200

# Linear Real Time

For installation instructions please visit this [link] (https://github.com/ibi/wf-extensions-chart/wiki/Installing-a-WebFocus-Extension "Installing a WebFocus Extension").

## Description

The aim for this extension is to provide a visualization that provides a periodic refreshing of the information displayed without the “blink” associated to reloading the whole chart container frame.<br>
This kind of visualization are really helpful in the IoT projects and other real time tracking projects.<br>
This update of the information will be carried out by means of a horizontal "sliding" time axis in such a way that the most recent events will appear on the right and the oldest ones will disappear on the left.<br>
The approach to get this target is to use a second procedure which will be called in an asynchronous  way (AJAX) to update the points in the chart for the newest events. This procedure must be specified in the extension properties as well as the refresh time period.

## Screenshots

![screenshot_1](https://github.com/ibi/wf-extensions-chart/blob/master/com.ibi.linear_real_time/screenshots/real_time.gif)

## Configurations

To configure or customize your extension edit "properties" object in properties.json file. (up to 8207 designer provide "Extension Properties" to change from assistant)

**Any property can be overwritten from a property that is written in the webfocus chart code (GRAPH_JS_FINAL Properties) or in the STY file**
	
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
				"Max": null, // Y1 axis maximun value
				"showTitle": false, // Y1 axis title true/false
				"title": null // Y1 axis title
			},
			"y2axis": {
				"Max": null, // Y2 axis maximun value
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
* **y1axis Bucket (0:1, non required)** - Non required. assigns a numerical value, it will show the values with left Y axis
* **y2axis Bucket (0:1, non required)** - Non required. assigns a numerical value, it will show the values with right Y axis

### Dimensions
* **xaxis Bucket (1, required)** - Required. assigns a date value, it will show the dates in X axis
* **color Bucket (0:1, non required)** - Non required. assigns a dimension, it will show each color in series for each field in Y axis


## Example
As this extension requires a real time datasource, you can find here a complete example simulating this kind of datsource by using a flow aims to insert data periodically in a FOC file which is used as data source by the extension.<br>
As previously mentioned, the linear real time chart loads new data from an ajax request in each time interval. This ajax request must target a procedure having a very similar structure in terms of data extraction as the one used in the extension procedure. This examples also provides this procedure in order to show a complete case of use.


### Data load process:
To have a real time data we have a Process Flow that insert rows in master/foc each minute to provide a real time data
* **Master to read the stores real time data**:<br>
	..\ibi\apps\wf_extensions\real_time_data.mas
* **Master and foc to store real time data**:<br>
	..\ibi\apps\wf_extensions\real_time_data.foc
* **Process Flow to execute inserction of new data each minute**:<br>
	..\ibi\apps\wf_extensions\pf_real_time_data.fex

The example folder contains an cm import that provides components for data and other for visualization<br>
Master and foc "real_time_data" will be loading each minute with new ramdom data from "pf_real_time_data.fex" Process Flow providing us the real time data to show in the visualization<br>
We have to include wf_extensions path in edasprof to allow this Process Flow working
	
### Chart visualization:
To allow the linear real time chart, we need to show that in Page Designer page to provide token for ajax class, the fex for ajax calls to take the new real time data and the own visualization of linear real time chart
* **Real tiem chart visualization**:<br>
	IBFS:/WFC/Repository/wf_extensions/real_time/real_time_chart.fex
* **Fex for ajax call of real time chart** (visualization take from parameter complete path from properties.ajax.folderItem):<br>
	IBFS:/WFC/Repository/wf_extensions/real_time/real_time_ajax.fex
* **Page Designer page to contain real tiem chart and provide the token to allow ajax calls**:<br>
	IBFS:/WFC/Repository/wf_extensions/real_time/page_real_time

Visualization have the components configurated like:
* **Ajax fex real_time_ajax.fex getting last data loaded from real_time_data.mas and with the same structure as linear real time visualization**
* **Linear real time visualization real_time_chart.fex have the same structure as ajax fex showing only the last loaded dates**<br>
	It have configurated the next needed parameter to allow ajax calls:<br>
	properties.ajax.folderItem = "IBFS:/WFC/Repository/wf_extensions/real_time/real_time_ajax.fex"
* **Page designer page_real_time shows the Linear real time visualization real_time_chart.fex providing us the token to allow ajax calls**<br>
	The token is needed beacuse ajax call dosen't works without it, it needs the token to validate the correct login

## notes for use

### Construction **(WARNING)**
* **The visualization need the parameter properties.ajax.folderItem pointing to the ajax fex with the same structure of data as the own visualization**
* **The visualization will not working if isn't under Page Designer because it haven't the token to access to ajax calls correctly**
* **time properties are parameters in properties.ajax.times**<br>
	timeInterval set the time interval of ajax calling in seconds<br>
	timeRange set the range of time of date axis showed in seconds<br>
	timeEffect set the effect duration time in seconds

### Executing
* **We have to execute the page designer, the own visualization will not work**