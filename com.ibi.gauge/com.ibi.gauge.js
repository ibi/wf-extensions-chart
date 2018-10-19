/* Copyright 1996-2015 Information Builders, Inc. All rights reserved. */
/* $Revision: 1.8 $ */

(function() {

	// All extension callback functions are passed a standard 'renderConfig' argument:
	//
	// Properties that are always available:
	//   moonbeamInstance: the chart instance currently being rendered
	//   data: the data set being rendered
	//   properties: the block of your extension's properties, as they've been set by the user
	//   modules: the 'modules' object from your extension's config, along with additional API methods
	//   
	// Properties available during render callback:
	//   width: width of the container your extension renders into, in px
	//   height: height of the container your extension renders into, in px
	//   containerIDPrefix:  the ID of the DOM container your extension renders into.  Prepend this to *all* IDs your extension generates, to ensure multiple copies of your extension work on one page.
	//   container: DOM node for your extension to render into;
	//   rootContainer: DOM node containing the specific chart engine instance being rendered.

	

	// Optional: if defined, is called exactly *once* during chart engine initialization
	// Arguments:
	//  - successCallback: a function that you must call when your extension is fully
	//     initialized - pass in true if init is successful, false otherwise.
	// - initConfig: the standard callback argument object (moonbeamInstance, data, properties, etc)
	function initCallback(successCallback, initConfig) {
		successCallback(true);
	}
	
	// Optional: if defined, is invoked once at the very beginning of each chart engine draw cycle
	// Use this to configure a specific chart engine instance before rendering.
	// Arguments: 
	//  - preRenderConfig: the standard callback argument object
	function preRenderCallback(preRenderConfig) {
		var chart = preRenderConfig.moonbeamInstance;
		/*
		chart.title.visible = true;
		chart.title.text = "My Custom Chart Title";  // contrived example
		chart.footnote.visible = true;
		chart.footnote.text = "footnote";
		chart.footnote.align = 'right';
		*/
	}
	
	function noDataPreRenderCallback(preRenderConfig) {
		var chart = preRenderConfig.moonbeamInstance;
		/*
		chart.legend.visible = false;
		chart.dataArrayMap = undefined;
		chart.dataSelection.enabled = false;
		*/
	}

	// Required: Invoked during each chart engine draw cycle
	// This is where your extension should be rendered
	// Arguments:
	//  - renderConfig: the standard callback argument object, including additional properties width, height, etc
	function renderCallback(renderConfig) {

		var chart = renderConfig.moonbeamInstance;
		var props = renderConfig.properties;
        var root_container = $('#' + renderConfig.rootContainer.id);

        var w = renderConfig.width;
        var h = root_container.height();

        var data = renderConfig.data;
        var min_value = data[0].min;
        var max_value = data[0].max;    
        var target = null;
        if (renderConfig.dataBuckets.buckets.tgt !== undefined) {
            target = data[0].tgt;
        }
        
        root_container.css('background-color', chart.fill.color);
        
        var container = $('#' + renderConfig.rootContainer.id + ' .chartHolder_relative_container');
        container.css('display', 'block').css('height',renderConfig.height+'px');
        var chart = c3.generate({
            bindto: '#' + renderConfig.rootContainer.id + ' .chartHolder_relative_container',
            data: {
                columns: [
                    ['data', data[0].actual]
                ],
                type: 'gauge',
                onclick: function (d, i) { console.log("onclick", d, i); },
                onmouseover: function (d, i) { console.log("onmouseover", d, i); },
                onmouseout: function (d, i) { console.log("onmouseout", d, i); }
            },
            legend: {
                hide: true
            },
            gauge: {
                label: {
                    format: function(value, ratio) {
                        return value;
                    },
                    show: renderConfig.properties.show_label // to turn off the min/max labels.
                },
                expand: false,
                min: min_value, // 0 is default, //can handle negative min e.g. vacuum / voltage / current flow / rate of change
                max: max_value, // 100 is default
                units: '',
                width: renderConfig.properties.arc_width // for adjusting arc thickness
            },
            color: {
                pattern: renderConfig.properties.color_states, // the three color levels for the percentage values.
                threshold: {
                    //            unit: 'value', // percentage is default
                    //            max: 200, // 100 is default
                    values: renderConfig.properties.thresholds
                }
            },
            size: {
                height: h-40
                //,width: w
            },
            onrendered: function () {
                if (target != null) {
                    var min = this.config.gauge_min;
                    var max = this.config.gauge_max;
                    var arc_width = this.config.gauge_width;

                    //set the length of the scale
                    var full_scale = (max - min) * 1.0;

                    //set the length of the target relative to the min value
                    var relative_target = target - min;

                    //set the width of the containg box for the arc
                    var bounding_box = d3.select('#' + renderConfig.rootContainer.id + ' svg').select('.c3-chart-arcs-background path').node().getBBox();

                    //set the radius of the inner arc
                    var radius = (bounding_box.width / 2) - arc_width;

                    //calculate the degrees that the relative target length represents
                    var degree_offset = -180;
                    var target_degrees = (relative_target * 180 / full_scale) + degree_offset;
                    var target_radians = target_degrees * Math.PI / 180;

                    //use math to solve for where the x and y coordinates of where the target line would go relative to 
                    //the mid point of the gauge.
                    var target_x = radius * Math.cos(target_radians);
                    var target_y = (radius * Math.sin(target_radians));

                    d3.select('#' + renderConfig.rootContainer.id + ' svg').select('.c3-chart-arcs').append("line")
                        .attr("x1", 0)
                        .attr("y1", 0)
                        .attr("x2", (-1.0 * (arc_width)))
                        .attr("y2", 0)
                        .attr("stroke-width", props.target_width)
                        .attr("style", "stroke: " + props.target_color)
                        .attr("transform", "translate(" + target_x + ", " + target_y + ") rotate(" + (target_degrees - 180) + ")");
                }
            }
        });
		
		if(renderConfig.properties.show_legend)
		{

			var legend_html = [];
			var color_states = renderConfig.properties.color_states;
			if (color_states.length > 1) {

				var thresholds = renderConfig.properties.thresholds;

				legend_html.push('<table class="com_ibi_gauge_table">');
				legend_html.push('<tbody>');
				legend_html.push('<tr>');

				for (var index = 0; index < color_states.length; index++) {
					legend_html.push('<td>');
					legend_html.push('<div style="width: 12px; height: 12px; display: inline-block; background-color: ' + color_states[index] + '"></div>');
					legend_html.push('</td>');
					legend_html.push('<td>');
					switch (index) {
						case 0:
							var end_point = thresholds[index];
							legend_html.push('< ' + end_point);
							break;
						case color_states.length - 1:
							var start_point = thresholds[index];
							legend_html.push(start_point + '+');
							break;
						default:
							var start_point = thresholds[index - 1];
							var end_point = thresholds[index];
							legend_html.push(start_point + ' - ' + end_point);
							break;
					}

					legend_html.push('</td>');
				}
				legend_html.push('</tr>');
				legend_html.push('</tbody>');
				legend_html.push('</table>');

				container.append(legend_html.join(''));
				var table_width = $('.com_ibi_gauge_table').width();
				$('.com_ibi_gauge_table').css('margin-left', 'calc((100% - ' + table_width + 'px)/2)');
			}
				
		}
        container.css('max-height', '');

        container.css('height', h+'px');


		renderConfig.renderComplete();
	}
	
    function noDataRenderCallback(renderConfig) {
        /*
		var grey = renderConfig.baseColor;
		renderConfig.data = [{value: [3, 3]}, {value: [4, 4]}, {value: [5, 5]}, {value: [6, 6]}, {value: [7, 7]}];
		renderConfig.moonbeamInstance.getSeries(0).color = grey;
		renderConfig.moonbeamInstance.getSeries(1).color = pv.color(grey).lighter(0.18).color;
        */
		renderCallback(renderConfig);
	}

	// Your extension's configuration
	var config = {
		id: 'com.ibi.gauge',     // string that uniquely identifies this extension
		containerType: 'html',  // either 'html' or 'svg' (default)
		initCallback: initCallback,
		preRenderCallback: preRenderCallback,  // reference to a function that is called right *before* your extension is rendered.  Will be passed one 'preRenderConfig' object, defined below.  Use this to configure a Monbeam instance as needed
		renderCallback: renderCallback,  // reference to a function that will draw the actual chart.  Will be passed one 'renderConfig' object, defined below
		noDataPreRenderCallback: noDataPreRenderCallback, 
		noDataRenderCallback: noDataRenderCallback,
		resources:  {  // Additional external resources (CSS & JS) required by this extension
			script: ['/ibi_apps/jquery/js/jquery.min.js','lib/d3.js','lib/c3.js'],
			css: ['css/extension.css', 'css/c3.css']
		},
		modules: {
			dataSelection: {
				supported: true,  // Set this true if your extension wants to enable data selection
				needSVGEventPanel: false, // if you're using an HTML container or altering the SVG container, set this to true and the chart engine will insert the necessary SVG elements to capture user interactions
				svgNode: function(arg){}  // if you're using an HTML container or altering the SVG container, return a reference to your root SVG node here.
			},
			eventHandler: {
				supported: true
			},
			tooltip: {
				supported: true,  // Set this true if your extension wants to enable HTML tooltips
				// This callback is called when no default tooltip content is passed into the chart.
				// Use this to define 'nice' default tooltips for the given target, ids & data.
				// Return value can be a string (including HTML), or HTML nodes, or any Moonbeam tooltip API object.
				autoContent: function(target, s, g, d, data) {
					if (d.hasOwnProperty('color')) {
						return 'Bar Size: ' + d.value + '<br />Bar Color: ' + d.color;
					}
					return 'Bar Size: ' + d.value;
				}
			}
			// Not used in this extension; here for documentation purposes.
//			colorScale: {
//				supported: true,
//				minMax: function(arg){}  // Optional: return a {min, max} object to use for the color scale min & max.
//			}
//			sizeScale: {
//				supported: false,
//				minMax: function(arg){}  // Optional: return a {min, max} object to use for the size scale min & max.
//			},
//			legend: {
//				colorMode: function(arg){}, // Return either 'data' or 'series'.  If implemented, force the chart engine to use this color mode legend
//				sizeMode: function(arg){},  // return either 'size' or falsey.  If implemented, force the chart engine to use this size legend
//			}
		}
	};

	// Required: this call will register your extension with the chart engine
	tdgchart.extensionManager.register(config);
  
}());