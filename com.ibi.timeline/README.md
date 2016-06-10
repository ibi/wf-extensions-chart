
#### Extension for WebFocus 8200

# Timeline

For installation instructions please visit this [link] (https://github.com/ibi/wf-extensions-chart/wiki/Installing-a-WebFocus-Extension "Installing a WebFocus Extension").

## Description

This extension helps to display a list of events in chronological order. It consist of two elements: focus and context. Focus is the upper part that contains timeline chart that reacts on changes in the context.
Context is the lower part that also contains a timeline chart. User can interact with the context ( lower part ) to change the range of time axis in the focus ( upper part ).

## Screenshots

![screenshot_1](https://github.com/ibi/wf-extensions-chart/blob/master/com.ibi.timeline/screenshots/1.png)

![screenshot_2](https://github.com/ibi/wf-extensions-chart/blob/master/com.ibi.timeline/screenshots/2.png)


## Configurations

To configure or customize your extension edit "properties" object in properties.json file.
	
	"properties": {
		"focus": {
            "rows": {
                "labels": {
                    "font": "12px sans-serif",
                    "color": "black"
                }
            },
            "timeAxis": {
                "labels": {
                    "font": "12px sans-serif",
                    "color": "black"
                }
            },
            "risers": {
                "labels": {
                    "font": "12px sans-serif"
                },
                "toolTip": {
                	"enabled": true
                }
            }
        },
        "context": {
            "heightToTotalHeightRatio": 0.3,
            "rows": {
                "labels": {
                    "font": "10px sans-serif",
                    "color": "black"
                }
            },
            "timeAxis": {
                "labels": {
                    "font": "10px sans-serif"
                }
            },
            "risers": {
                "labels": {
                    "font": "10px sans-serif"
                }
            }
        },
	    "toolTip": {
	      "enabled": true
	    }
	}
	

## Data Buckets

### Measures:
This extension doesn't use measure buckets.


### Dimensions:
* **Task** - a series of tasks that will be use to break the chart by rows.

* **Subtask** - a series of subtasks within each task.

* **Start** - a series of values that represent when subtasks start.

* **End** - a series of values that represent when subtasks end.
