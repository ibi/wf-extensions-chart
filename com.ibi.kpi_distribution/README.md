
#### Extension from WebFocus 8200

# Kpi Distribution

For installation instructions please visit this [link] (https://github.com/ibi/wf-extensions-chart/wiki/Installing-a-WebFocus-Extension "Installing a WebFocus Extension").

## Description

Draw in animated bars the distribution of measure by one dimensions

## Screenshots

![screenshot_1](https://github.com/ibi/wf-extensions-chart/blob/master/com.ibi.kpi_distribution/screenshots/1.png)

![screenshot_2](https://github.com/ibi/wf-extensions-chart/blob/master/com.ibi.kpi_distribution/screenshots/2.png)

![screenshot_3](https://github.com/ibi/wf-extensions-chart/blob/master/com.ibi.kpi_distribution/screenshots/3.png)

![screenshot_4](https://github.com/ibi/wf-extensions-chart/blob/master/com.ibi.kpi_distribution/screenshots/4.png)

## Configurations

To configure or customize your extension edit "properties" object in properties.json file.

**Any property can be overwritten from a property that is written in the webfocus chart code (GRAPH_JS_FINAL Properties) or in the STY file**
	
	"properties": {
		"kpidistributionProperties":{
			"options": {
				"showPercentagesOfTheTotal": true,
				"showValue": true,
				"shortenValue": false,
				"forceSortRows": true,
				"showBarIcons": false
			},
			"sizes": {
				"titlesFont": "15px",
				"marginTop": "10",
				"rowHeight": "50",
				"barHeight": "10",
				"barIconWidth": "40"
			},
			"colors": {
				"minColor": "#912BA7",
				"maxColor": "#036DB2",
				"titlesColor": "#415D6B"
			}
		}		
	},
	
	"propertyAnnotations": {
	
		"kpidistributionProperties": "json"
		
	},


## Data Buckets

### Measures:
* **Value Bucket (1, required)** - Required. KPI value
* **Is Percentage Bucket (0:1, non required)** - Non required. Is Percentage value
* **Max value Bucket (0:1, non required)** - Non required. Max value
* **Min value Bucket (0:1, non required)** - Non required. Min value

### Dimensions
* **Dimension Bucket (1, required)** - Required. Dimension.
