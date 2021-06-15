/*global tdgchart: false, d3: false */
/* Copyright (c) 1996-2021 TIBCO Software Inc. All Rights Reserved. */

(function() {

	function renderCallback(renderConfig) {

		var data = renderConfig.data;
		var w = renderConfig.width;
		var h = renderConfig.height;
		var pad = 10;

		var labels = data.map(function(el) {return el.labels;});
		var x = d3.scale.ordinal().domain(labels).rangeRoundBands([pad, w - pad], 0.2);
		var ymax = d3.max(data, function(d) {return d.value;});
		var y = d3.scale.linear().domain([0, ymax]).range([h - pad, pad]);

		var container = d3.select(renderConfig.container).attr('class', 'extension_container').append('g');

		// Draw axis divider line
		container.append('path')
			.attr('d', 'M' + pad + ',' + (y(0) + 1) + 'l' + (w - pad - pad) + ',0');

		// Draw risers
		container.selectAll('rect')
			.data(data)
			.enter().append('rect')
			.attr('x', function(d) {return x(d.labels);})
			.attr('y', function(d) {return y(d.value);})
			.attr('width', x.rangeBand())
			.attr('height', function(d) {return Math.abs(y(d.value) - y(0));})
			.attr('fill', renderConfig.moonbeamInstance.getSeriesAndGroupProperty(0, null, 'color'))
			.each(function(d, g, s) {

				// The first step in drawing data labels is to retrieve the content and position of the label
				// to be drawn on this riser.  getDataLabelProperties() does this.  Arguments are the typical
				// 'd' (single riser datum), 'data' (array of data for this series) and series / group ID object.
				// This returns an object describing the content, style and position of the label to be drawn.
				var lbl = renderConfig.modules.dataLabels.getDataLabelProperties(d, data, {series: 0, group: g});
				
				//Start CHART-3189
				
				/* lbl is returned as and object in the following format:  { content: string, position: string, font: string, color: string}
				   The 'content' property can be further enriched with the 'numberFormat' property available with API 2.0 via the dataBuckets object
				   as documented here: 'Data bucket field names and number formats': https://github.com/ibi/wf-extensions-chart/wiki/Extension-Data-Interface
				   
				   If the 'numberFormat' property has been propagated from WebFOCUS, it can be used with the renderConfig.moonbeamInstance.formatNumber helper function 
				   to re-format a numeric value.
				   
				   The renderConfig.moonbeamInstance.formatNumber helper function takes two parameters:
					
					renderConfig.moonbeamInstance.formatNumber(parm1,parm2):
					
						parm1: 	number 				is the number to be formatted
						parm2: 	string  			is the string format; typically retrieved from the data bucket's field's 'numberFormat' property. Euro Currency Example: "€#,###.00;-€#,###.00" 
						return: string 				parm1 formatted in parm2 format 
				
				*/ 

				var valueBucket =  renderConfig.dataBuckets.getBucket("value");  	//Reference to the 'value' data bucket
				var field =  valueBucket.fields[0]; 								//Since the 'value' bucket has a maximum of 1 entry (via properties.json), .fields[0] can be referenced directly.
				var numberFormat = field.numberFormat; 								//Reference the number format; if it exists.
				lbl.content = numberFormat ? 										//Number format may-or-may-not have been assigned in WebFOCUS.  For example, 'I6' format is not assigned.
					renderConfig.moonbeamInstance.formatNumber(d.value,numberFormat) :	//If numberFormat exists (not undefined), re-format the value for display with the renderConfig.moonbeamInstance.formatNumber helper function	
                    lbl.content;							  							//If not, leave the 'content'  un-changed.
				
				//End CHART-3189
				

				// The second step is to draw the label in the right spot.  An extension can do this itself
				// manually, by reading the necessary info from 'lbl' above.  Or an extension can use the built in
				// 'addDataLabelToRiser' method.  This takes two arguments: a reference to the DOM node that
				// contains the current riser, and a reference to a label properties object returned from 
				// getDataLabelProperties().
				renderConfig.modules.dataLabels.addDataLabelToRiser(this, lbl);
			});

		renderConfig.renderComplete();
	}

	var config = {
		id: 'com.ibi.tutorial_data_labels',
		containerType: 'svg',
		renderCallback: renderCallback,
		resources: {
			script: ['../lib/d3.js'],
			css: ['../lib/style.css']
		},
		modules: {
			dataLabels: {
				supported: true,  // This must be true to enable data label support
				defaultDataArrayEntry: function(arg) {
					// Return the name of the 'default' bucket that should be used to define data label content,
					// if a more specific data label content lookup is not found.
					return 'value'
				}
			}
		}
	};

	tdgchart.extensionManager.register(config);
})();
