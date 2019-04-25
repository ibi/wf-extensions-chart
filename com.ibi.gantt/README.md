#### Extension for WebFocus 8200

# Gantt Chart

For installation instructions please see the [Installing a WebFocus Extension](https://github.com/ibi/wf-extensions-chart/wiki/Installing-a-WebFocus-Extension) page.

## Description

This extension helps visualize a project schedule or list of tasks with start/stop times and milestones.

## Screenshots

![screenshot_1](https://github.com/ibi/wf-extensions-chart/blob/master/com.ibi.gantt/screenshots/1.png)

## Configurations

To configure or customize your extension edit the "properties" object in properties.json file.
	
	"properties": {
		"sort": null,  // One of 'label', 'start_time', 'stop_time' or null (do not sort)
		"fixedAxisPeriod": null, // "year", "month", "day", "hour", Default 'automatic'
		"weekStartsOnMonday": "bool", // Default false --> week starts on Sunday
		"autoAxisPeriodLimits": { // each value from the period will be define when the period is auto calculated
			"year": 5,
			"month": 4,
			"week": 3,
			"day": 1,
			"hour": 2
		},
		"layout": {
			"max_label_width": 0.3  // Max percentage of overall chart width to allocate to task label list
		},
		"todayLine": { // Line to show the actual day
			"enabled": false,
			"color": "red",
			"otherDay": null // other date instead of actual day with YYYY/MM/DD format
		},
		"adaptableSize": false, // The main frame will take whole available space
		"style": {
			"timeAxis": {
				"fill": "white",
				"border": {
					"color": "lightgrey",
					"width": 1
				},
				"dividers": {
					"color": "lightgrey",
					"width": 1,
				},
				"rows": [
					{
						"label": {
							"color": "black",
							"font": "10pt helvetica"
						}
					},
					{
						"label": {
							"color": "black",
							"font": "10pt helvetica"
						}
					},
				]
			},
			"labels": {
				"fill": "white",
				"border": {
					"color": "lightgrey",
					"width": 1
				},
				"dividers": {
					"color": "lightgrey",
					"width": 1,
				},
				"font": "8pt helvetica",
				"color": "black"
			},
			"risers": {
				"inset": 0.25,
				"data": {
					"onlyStart": {
						"color": "green",
						"border": {
							"color": undefined,
							"width": 3
						},
						"marker": {
							"shape": undefined,
							"size": 15
						}
					},
					"onlyStop": {
						"color": "red",
						"border": {
							"color": undefined,
							"width": 3
						},
						"marker": {
							"shape": undefined,
							"size": 15
						}
					},
					"invertedStartStop": {
						"color": "green",
						"border": {
							"color": undefined,
							"width": undefined
						}
					}
				},
				"fill": "white",
				"altRowFill": undefined,
				"border": {
					"color": "lightgrey",
					"width": 1
				},
				"dividers": {
					"color": "lightgrey",
					"width": 1,
				}
			}
		}
	}

## Data Buckets

### Dimensions:

* **label** - Set of task names to visualize.

* **start** - Start time for each task.

* **stop** - End time for each task.

* **milestone** - Set of additional markers to visualize on each task.

* **color** - Color to use for each task bar.  Can be either a color string (eg: "rgb(1,2,3)" or "red"), or an integer series ID, to use the chart engine's series colors.

* **shape** - Shape to use for each task bar.  Can be either a string (either "bar" or "line"), or an integer series ID, to use the chart engine's series riser shapes.

### Measure:

* **drill_down** - Dummy Meassure Bucket for drill set up.

