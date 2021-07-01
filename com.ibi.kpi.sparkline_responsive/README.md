#### Extension for WebFocus 8200

# KPI Sparkline - Responsive

For installation instructions please see the [Installing a WebFocus Extension](https://github.com/ibi/wf-extensions-chart/wiki/Installing-a-WebFocus-Extension) page.

## Description

This extension creates a widget that shows the aggregration of the  dataset's measures (KPI Number) and a simple bar / line chart for a selected measure field. This is an enhancement of the [com.ibi.kpi.sparkline extension](https://github.com/ibi/wf-extensions-chart/tree/master/com.ibi.kpi.sparkline) .

This widget is responsive and it will resize the bar / line chart, if enabled, to fill the space.


## Screenshots

![screenshot_1](https://github.com/ibi/wf-extensions-chart/blob/master/com.ibi.kpi.sparkline_responsive/screenshots/1.png)


## Configurations

To configure or customize your extension, here are the available extension properties.
```javascript
	"properties": {
        "aggregationType": "Last"
            /*
            This is the calculation that will be applied to the entire dataset's measures and 
            it will be displayed as the text number (the KPI Number)
            
            default: "Last"
            Valid Values: 
                "First", // The left-most data point in the series
				"Last", // The right-most data point in the series
				"Sum", // Add all the measure values up
				"Avg", // Take the average of measures - SUM(measure) / # of data points
				"Min", // The smallest number in the measures
                "Max" // The largest number in the measures
            */
        "generalStyle":  //overall styling properties
        {
			"fontFamily": "'Arial'",
			"color": "#505050",
			"textAlign": "left",
			"fontSize": 12,
			"extraCSS": "display: block; margin: auto; text-align: center; padding: 10px;", //additional CSS properties that will override other css properties
			"margin": 10,
			"navCSS": "font-family: 'Arial'; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; text-align: center;" //top navigation CSS when the group bucket is used
		},
        "indicatorConfiguration": //configuration for the image indicator (up / down arrow that's displayed beside the KPI Number when enabled)
        //the image indicator is driven by comparing the KPI Number with the average of the last N measures in the dataset (Target Number), where N = pointsToCompare configuration
        //Embedded in the extension are 5 images
        // defaultGreenUp = a green arrow that points upwards
        // defaultGreenDown = a green arrow that points downwards
        // defaultRedUp = a red arrow that points upwards
        // defaultRedDown = a red arrow that points downwards
        // defaultLine = a gray horizontal line
        {
			"greaterThanImageUrl": "defaultGreenUp" // if the KPI Number is greater than the Target Number, use this image. This image can be a url or one of the five embedded images
			,"lessThanImageUrl":  "defaultRedDown" // if the KPI Number is less than the Target Number, use this image. This image can be a url or one of the five embedded images
			,"equalImageUrl":  "defaultLine" // if the KPI Number is equal to Target Number, use this image. This image can be a url or one of the five embedded images
			,"size": 10
			,"pointsToCompare": 3  // the number of data points to take the average from
			,"extraCSS": "padding-left: 10px;" //additional CSS properties that will override other css properties
			,"show":true //show or hide the indicator
		},
        "sparklineConfiguration": //chart configuration
        {
			"chartType": "bar", //bar or line
			"bar": {
				"barSpacing": 1, //spacing between bars in pixels
				"goodColor": "#37BF54", // bar color that's above zero
				"badColor": "#F53554" //bar color that's below zero
			},
			"line": {
				"lineColor": "#505050", //color of the line
				"fillColor": "#FFFFFF" //color below the line
			},"show":true //show the chart or not
		},
		"headingTitle": { //the top most title
			"fontFamily": "'Arial'",
			"color": "#505050",
			"textAlign": "left",
			"fontSize": 16,
			"extraCSS": "font-weight:400;" //additional CSS properties that will override other css properties
			,"show":true //show or hide the title
		},
		"kpiTitle": { //the KPI Number
			"fontFamily": "'Arial'",
			"color": "#505050",
			"textAlign": "left",
			"fontSize": 12,
			"extraCSS": "font-weight:700;" //additional CSS properties that will override other css properties
			,"show":true //show or hide the KPI Number
		},
		"xAxisTitle": { //the X Axis title below the chart
			"fontFamily": "'Arial'",
			"color": "#505050",
			"textAlign": "center",
			"fontSize": 11,
			"extraCSS": "font-weight:400; text-align: center; padding-top: 5px;" //additional CSS properties that will override other css properties
			,"show":true //show or hide the X Axis title
		},
		"unitLabelTitle": { //the unit label that shows below the KPI Number
			"fontFamily": "'Arial'",
			"color": "#505050",
			"textAlign": "left",
			"fontSize": 12,
			"extraCSS": "font-weight:400; padding-top: 5px;" //additional CSS properties that will override other css properties
			,"show": true //show or hide the unit label
		}
	}
```

## Data Buckets

### Dimensions:

* **Measure** - Primary measure field whose values are represented in the widget. The aggregationType property is applied to the values in this field

* **Compare Group** - Dimension field whose trend displays in the widget. This is used to split the data set into different cards and enables the navigation 

* **X-Axis** - Dimension field used as the x-axis on the bar chart in the widget. This should be date field

* **Unit Label** - Dimension field used to show the Unit Label.
