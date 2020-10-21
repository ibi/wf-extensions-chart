
#### Extension from WebFocus 8200

# Horizontal Comparision Bars

For installation instructions please visit this [link] (https://github.com/ibi/wf-extensions-chart/wiki/Installing-a-WebFocus-Extension "Installing a WebFocus Extension").

## Description

This extension is a variation on the "Horizontal Bar Comparison" (https://github.com/ibi/wf-extensions-chart/tree/master/com.ibi.horizontal_comparison_bars) but without the automatic calculation between the  two involved KPIs.In this extension the chart shows the main KPI as bar, the second KPI as direct data value positioned to the right of the icon (no calculation).
The chart also allows to customize per serie (bucket) the icon and the "type of mesure" (example: profit is positive KPI and cost is negative KPI).

## Screenshots

![screenshot_1](https://github.com/ibi/wf-extensions-chart/blob/master/com.ibi.horizontal_2kpi/screenshots/1.png)


## Data Buckets

### Measures:
* **Value Bucket (1)** - Required. KPI value
* **Comparision Bucket (0-1)** - Not required. KPI for comparison.
* **Sign Comparision Bucket (0-1)** - Not required. Positive or negative value to set comparision direction.
* **Kpi sign Bucket (0-1)** - Not required. BY element.

### Dimensions
* **Dimension Bucket (0-1)** - Not required. BY element.
* **Image Bucket (0-1)** - Not required. BY element.