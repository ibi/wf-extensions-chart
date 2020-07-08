#### Extension for WebFocus 8200

# Small KPI Widget with deviation and bars

For installation instructions please visit this [link] (https://github.com/ibi/wf-extensions-chart/wiki/Installing-a-WebFocus-Extension "Installing a WebFocus Extension").

## Description

This extension is a small KPI widget, that shows the current value of a measure, the deviation against the previous value of this measure and all measure values as bars.
It is completely flexible, so you can show/hide the deviation, show/hide the bars, choose between two layouts (rectangle/square), switch the deviation between percent/total value, switch between aggregated or non aggregated values and switch between US/Europe number format.

## Screenshots

Rectangle design

![Screenshot1](https://github.com/ibi/wf-extensions-chart/blob/master/com.ibi.kpi_with_sparkline_flexible/screenshots/Screenshot1.PNG)

Square design

![Screenshot2](https://github.com/ibi/wf-extensions-chart/blob/master/com.ibi.kpi_with_sparkline_flexible/screenshots/Screenshot2.PNG)

## Configurations

To configure or customize your extension use the Extension properties panel in the Designer or edit "properties" object in properties.json file.

![Properties](https://github.com/ibi/wf-extensions-chart/blob/master/com.ibi.kpi_with_sparkline_flexible/screenshots/Properties.png)


## Data Buckets

### Measure:
* **Value (MES)** - quantitative representations for values in your date series ( ex. sales ).

### Dimension (Time)
* **Date (DIM)** - a series of date values. (day, month, year or any time frame you have).
