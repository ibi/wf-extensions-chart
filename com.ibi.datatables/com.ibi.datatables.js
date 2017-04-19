/* Copyright 1996-2015 Information Builders, Inc. All rights reserved. */
/* $Revision: 1.0 $ */

(function() {
	var dataJSON = [];

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
		chart.title.visible = false;
		chart.title.text = "My DataGrid";  // contrived example
		chart.footnote.visible = false;
		chart.footnote.text = "footnote";
		chart.footnote.align = 'right';
	}
	
	function noDataPreRenderCallback(preRenderConfig) {
		var chart = preRenderConfig.moonbeamInstance;
		chart.legend.visible = false;
		chart.dataArrayMap = undefined;
		chart.dataSelection.enabled = false;
	}

	// Required: Invoked during each chart engine draw cycle
	// This is where your extension should be rendered
	// Arguments:
	//  - renderConfig: the standard callback argument object, including additional properties width, height, etc
	function renderCallback(renderConfig) {

		var chart = renderConfig.moonbeamInstance;
		var props = renderConfig.properties;
		
		var container = renderConfig.container;
		var data = renderConfig.data;
		var dataBuckets = renderConfig.dataBuckets.buckets;
		var titleJSON = [];
		var acrossJSON = [];
		var numberOfBys = 0;
		var numberOfMeasures = 0;
		var numberOfAcross = 0;
		var groupIds = [];
		
		/* Format JSON Data */
		if (typeof data[0].measure !== 'undefined'||typeof data[0].row !== 'undefined'||typeof data[0].column !== 'undefined') {

			console.log('Start rendering extension:', new Date());

			for (var i=0; i<data.length; i++) {
				var row = {};
				var columnIndex = 0;
				var acrossIndex = -1;
				var newRow = true;

				/* Process Groups */
				if (typeof data[i].row !== 'undefined') {
					if (typeof data[i].row === 'string') {
						row["col"+columnIndex]=data[i].row;
						columnIndex++;
					}
					else {
						for (var j=0; j<data[i].row.length; j++) {
							row["col"+columnIndex]=data[i].row[j];
							columnIndex++;
						}
					}
				}
				
				/* Check for Columns */
				if (typeof data[i].column !== 'undefined') {
					var across = {};
					if (typeof data[i].column === 'string') {
						across = {};
						across["acol0"]=data[i].column;
						if (findIndex(acrossJSON, across)==-1)
							acrossJSON.push(across);
					}
					else {
						across = {};
						for (var j=0; j<data[i].column.length; j++) {
							across["acol"+j]=data[i].column[j];
						}
						if (findIndex(acrossJSON, across)==-1)
							acrossJSON.push(across);
					}
					acrossIndex = findIndex(acrossJSON, across);

					/* Is this a new Row */
					if (i>0) {
						newRow = false;
						Object.keys(row).forEach(function(key,index) {
							if (row[key]!=dataJSON[dataJSON.length-1][key]) {
								newRow = true;
								return false;
							}
						});
					}
				}
				
				/* Process Measures */
				if (typeof data[i].measure !== 'undefined') {					
					columnIndex = acrossIndex==-1? columnIndex : 0;
					if (typeof data[i].measure === 'number') {
						row["col"+(acrossIndex==-1?'':acrossIndex+'_')+columnIndex]=data[i].measure;
						groupIds.push(i);
						columnIndex++;					
					}
					else {
						for (var j=0; j<data[i].measure.length; j++) {
							row["col"+(acrossIndex==-1?'':acrossIndex+'_')+columnIndex]=data[i].measure[j];
							groupIds.push(i);
							columnIndex++;
						}
					}
				}
				
				if (newRow)
					dataJSON.push(row);
				else {
					Object.keys(row).forEach(function(key,index) {
						if (typeof dataJSON[dataJSON.length-1][key]==='undefined')
								dataJSON[dataJSON.length-1][key]=row[key];
					});
				}
			}
			
			/* Re-order the Across JSON */
			if (acrossJSON.length>0) {
				/* Add Index */
				for (var i=0; i<acrossJSON.length; i++)
					acrossJSON[i]["index"]=i;
			
				/* Get Keys */
				var acrossColumns = [];
				Object.keys(acrossJSON[0]).forEach(function(key,index) {
					acrossColumns.push(key);
				});

				/* Re-order */
				acrossJSON = orderBy(acrossJSON,acrossColumns);
			}
			
			/* Process Titles */
			columnIndex=0;
			if (typeof dataBuckets.row !== 'undefined'){
				if (typeof dataBuckets.row.title === 'string') {
					titleJSON.push({ mData: "col"+columnIndex, title: dataBuckets.row.title, className: "dt-left dt-by" });
					columnIndex++;
				}
				else {
					for (var i=0; i<dataBuckets.row.title.length; i++) {
						titleJSON.push({ mData: "col"+columnIndex, title: dataBuckets.row.title[i], className: "dt-left dt-by" });
						columnIndex++;
					}
				}
				numberOfBys = columnIndex;
			}
			if (typeof dataBuckets.measure !== 'undefined') {
				if (acrossJSON.length==0) {
					if (typeof dataBuckets.measure.title === 'string') {
						titleJSON.push({ mData: "col"+columnIndex, title: dataBuckets.measure.title, className: "dt-right", render: $.fn.dataTable.render.number(',', '.', 2, ''), defaultContent: '0.00' });
						columnIndex++;
					}
					else {
						for (var i=0; i<dataBuckets.measure.title.length; i++){
							titleJSON.push({ mData: "col"+columnIndex, title: dataBuckets.measure.title[i], className: "dt-right", render: $.fn.dataTable.render.number(',', '.', 2, ''), defaultContent: '0.00' });
							columnIndex++;
						}
					}
				}
				else {
					numberOfAcross = typeof dataBuckets.column.title === 'string'? 1 : dataBuckets.column.title.length;
					for (var k=0; k<acrossJSON.length; k++){
						columnIndex=0;
						if (typeof dataBuckets.measure.title === 'string') {
							titleJSON.push({ mData: "col"+(acrossJSON[k].index+'_')+columnIndex, title: dataBuckets.measure.title, className: "dt-right", render: $.fn.dataTable.render.number(',', '.', 2, ''), defaultContent: '0.00' });
							columnIndex++;
						}
						else {
							for (var i=0; i<dataBuckets.measure.title.length; i++){
								titleJSON.push({ mData: "col"+(acrossJSON[k].index+'_')+columnIndex, title: dataBuckets.measure.title[i], className: "dt-right", render: $.fn.dataTable.render.number(',', '.', 2, ''), defaultContent: '0.00' });
								columnIndex++;
							}
						}
					}					
				}
				numberOfMeasures = typeof dataBuckets.measure.title === 'string'? 1 : dataBuckets.measure.title.length;
			}
			console.log('Finished Creating JSON files:', new Date());
		}
	
		/* Create Grid */
		if (dataJSON.length>0){
			/* Add Inline Style */
			$(container).append('<style id="ib-inline-style"></style>')

			/* Table Style */
			$(container).find('#ib-inline-style').append('.dataTables_wrapper{color:'+props.color+'font-family:'+props.fontFamily+';font-size:'+props.fontSize+'}\n');
			
			/* Border Style */
			$(container).find('#ib-inline-style').append('.col-sm-12>.table.table-striped{'+props.border+'}\n');
			$(container).find('#ib-inline-style').append('.table>tbody>tr>td,.table>tbody>tr>th,.table>thead>tr>td,.table>thead>tr>th{border-top:'+props.border+'}\n');
			$(container).find('#ib-inline-style').append('.table>tfoot>tr>td,.table>tfoot>tr>th{border-top:none}\n');
			$(container).find('#ib-inline-style').append('.table>thead>tr:last-of-type>th{border-top:'+props.border+';border-bottom:'+props.border+'}\n');
			//$(container).find('#ib-inline-style').append('th.dt-by+th:not(.dt-by),td.dt-by+td:not(.dt-by){border-left:'+props.border+'}\n');
			$(container).find('#ib-inline-style').append('.table>thead>tr>th.cross-tab{border-left:'+props.border+';border-top:'+props.border+'}\n');
			$(container).find('#ib-inline-style').append('.table>thead>tr:first-child>th.cross-tab{border-top:'+props.border+'}\n');
			$(container).find('#ib-inline-style').append('.dataTables_scrollHead{border:'+props.border+'!important;border-bottom:0!important}\n');
			$(container).find('#ib-inline-style').append('.dataTables_scrollBody{border-left:'+props.border+';border-bottom:'+props.border+';border-right:'+props.border+'}\n');
			$(container).find('#ib-inline-style').append('.dataTables_scrollFoot{border-left:'+props.border+'!important;border-bottom:'+props.border+'!important;border-right:'+props.border+'!important}\n');
			$(container).find('#ib-inline-style').append('.DTFC_LeftHeadWrapper,.DTFC_LeftBodyWrapper,.DTFC_RightHeadWrapper{left:1px!important}\n');
			$(container).find('#ib-inline-style').append('.DTFC_LeftHeadWrapper table,.DTFC_LeftBodyWrapper table,.DTFC_RightHeadWrapper table{border-right:'+props.border+'}\n');
			$(container).find('#ib-inline-style').append('.DTFC_LeftHeadWrapper table>thead>tr:first-child>th:first-child{border-top:'+props.border+'!important}\n');
			//$(container).find('#ib-inline-style').append('.DTFC_LeftHeadWrapper table .dt-by:first-child,.DTFC_LeftBodyWrapper table .dt-by:first-child,.DTFC_RightHeadWrapper table .dt-by:first-child{border-left:'+props.border+'}\n');
			//$(container).find('#ib-inline-style').append('.DTFC_LeftHeadWrapper table .dt-by:last-child,.DTFC_LeftBodyWrapper table .dt-by:last-child,.DTFC_RightHeadWrapper table .dt-by:last-child{border-right:'+props.border+'}\n');

			/* Title Style */
			$(container).find('#ib-inline-style').append('.table>thead>tr>th{font-weight:'+props.title.fontWeight+';color:'+props.title.color+';background-color:'+props.data.backgroundColor+'}\n');
			
			/* Data Row Style */
			$(container).find('#ib-inline-style').append('.table>thead>tr>td{font-weight:'+props.data.fontWeight+';color:'+props.data.color+'}\n');
			$(container).find('#ib-inline-style').append('.table>thead>tr:nth-of-type(odd)>td{background-color:'+props.data.backgroundColorOdd+'}\n');
			$(container).find('#ib-inline-style').append('.table>thead>tr:nth-of-type(even)>td{background-color:'+props.data.backgroundColorEven+'}\n');
			
			/* Selected Row Style */
			$(container).find('#ib-inline-style').append('table.dataTable tbody>tr.selected,table.dataTable tbody>tr>.selected{background-color:'+props.data.selected.backgroundColor+'}\n');
			$(container).find('#ib-inline-style').append('.table>tbody>tr.selected>td{border-top:'+props.data.selected.border+'}\n');
			$(container).find('#ib-inline-style').append('.table>tbody>tr.selected+tr>td{border-top:'+props.data.selected.border+'}\n');
			
			/* Cross Tab Style */
			$(container).find('#ib-inline-style').append('.table-striped>thead>tr:nth-of-type>th.cross-tab{color:'+props.crossTabs.color+';font-weight:'+props.crossTabs.fontWeight+'}\n');
			$(container).find('#ib-inline-style').append('.table-striped>thead>tr:nth-of-type(odd)>th.cross-tab{background-color:'+props.crossTabs.backgroundColorOdd+'}\n');
			$(container).find('#ib-inline-style').append('.table-striped>thead>tr:nth-of-type(even)>th.cross-tab{background-color:'+props.crossTabs.backgroundColorEven+'}\n');		
			
			$(container).append('<table class="table table-striped" style="width:100%"><thead></thead></table>');
			
			/* Add Across Heading */
			for (var i=0; i<numberOfAcross; i++) {
				/* Add New Heading Line */
				var $line = $('<tr role="row"></tr>');
				if (numberOfBys>0 && i==0)
					$line.append('<th rowspan="'+numberOfAcross+'" colspan="'+numberOfBys+'">&nbsp;</th>');
				for (var j=0; j<acrossJSON.length; j++) {
					var acrossParent = '', prevAcrossParent = '';
					Object.keys(acrossJSON[j]).forEach(function(key,index) {
						if (index>=numberOfAcross)
							return false;
						if (index==i) {
							if (j>0&&i!=numberOfAcross-1){
								if (acrossJSON[j][key]==acrossJSON[j-1][key] && acrossParent==prevAcrossParent)
									$line.find('th:last').attr('colspan', parseInt($line.find('th:last').attr('colspan'))+numberOfMeasures);
								else
									$line.append('<th class="cross-tab dt-center" colspan="'+numberOfMeasures+'">'+acrossJSON[j][key]+'</th>');
							}
							else
								$line.append('<th class="cross-tab dt-center" colspan="'+numberOfMeasures+'">'+acrossJSON[j][key]+'</th>');
						}
						acrossParent += acrossJSON[j][key] + ';';
						prevAcrossParent += j>0? acrossJSON[j-1][key] + ';' : '';
					});
				}
				$(container).find('.table.table-striped:first thead').append($line);
			}

			/* Add Heading */
			$(container).find('.table.table-striped:first thead').append('<tr></tr>');
			Object.keys(titleJSON).forEach(function(key,index) {
				var cls = typeof titleJSON[key].className==='undefined'? '' : ' class="'+titleJSON[key].className+'"';
				$(container).find('.table.table-striped:first thead tr:last').append( '<th'+cls+'>'+titleJSON[key].title+'</th>' );
			});
			
			/* Add Footer */
			if (props.showTotal){
				$(container).find('.table.table-striped:first').append('<tfoot><tr></tr></tfoot>');
				Object.keys(titleJSON).forEach(function(key,index) {
					var cls = typeof titleJSON[key].className==='undefined'? '' : ' class="'+titleJSON[key].className+'"';
					$(container).find('.table.table-striped:first tfoot tr').append( '<th'+cls+'>&nbsp;</th>' );
				});				
			}

			/* Load Datatables */
			var m = 0;
			$(container).children('.table.table-striped').dataTable({
				"data": dataJSON,
				"columns": titleJSON,
				"paging": props.paging,
				"ordering": props.ordering,
				"info": props.info,
				"searching": props.searching,
				"lengthChange": props.lengthChange,
				"responsive": numberOfAcross>0? false : props.responsive,
				"scrollX": numberOfAcross==0? false : true,
				"colReorder": numberOfAcross>0? false : props.colReorder,
				"select": false,
				"scrollY": props.scrollY,
				"deferRender": dataJSON.length<=10? false : props.scroller,
				"scroller": dataJSON.length<=10? false : props.scroller,
				"processing": true,
				"fixedColumns": {
					leftColumns: numberOfBys
				},
				"initComplete": function(settings, json) {
					console.log('Datatables completed rendering:', new Date());
				},
				"footerCallback": !props.showTotal? false : function(row, data, start, end, display) {
					var api = this.api(), data;
					var numFormat = $.fn.dataTable.render.number(',', '.', 2, '').display;
 
					// Remove the formatting to get integer data for summation
					var intVal = function (i) {
						return typeof i === 'string'? i.replace(/[\$,]/g, '')*1 : typeof i === 'number' ? i : 0;
					};

					$(row).find('th.dt-right').each(function(){
						var columnIndex = $(this).index();
						var total = api.column(columnIndex).data().reduce( function (a, b) {
							console.log(a,b)
							return intVal(a) + intVal(b);
						}, 0);
						console.log(columnIndex, total)

						$(api.column(columnIndex).footer() ).html( numFormat(total) );
					});
				},
				"createdRow": function(row, data, dataIndex) {
					for (var i=0; i<titleJSON.length; i++) {
						if (i>=numberOfBys) {
							if (typeof data[titleJSON[i].mData] !== 'undefined') {
								var className = 'riser!s0!g'+groupIds[m]+'!datatable!r'+dataIndex+'!c'+(i-numberOfBys)+'!';
								$(row).children(':eq('+i+')').html('<span class="'+className+'">'+$(row).children(':eq('+i+')').text()+'</span>');
								m++;
							}							
						}
					}
				}
			})
			.on('select.dt', function(e, dt, type, indexes) {
				/* To implement Drilldown */
				var selected = dt.rows(indexes).data();
				var target = e.target;
			});
			$('.dataTables_scrollBody table').lasso();
		}

		renderConfig.renderComplete();	
	}
	
	function findIndex(arr, comparator) {
		var index = -1;
		arr.forEach(function(item, i){
			var match = true;
			Object.keys(comparator).forEach(function(key) {
				if (item[key]!=comparator[key]) {
					match = false;
					return false;
				}
			});
			if (match) {
				index = i;
				return false;				
			}
		});
		return index;
	}
	
	function orderBy(arr, columns) {
		var sorted = arr.slice(0);

		sorted.sort(function(a,b){
			var retCode = 0;
			Object.keys(columns).forEach(function(key) {
				if (a[key]<b[key]) {
					retCode = -1;
					return false;
				}
				else if (a[key]>b[key]) {
					retCode = 1;
					return false;
				}
			});
			return retCode;
		});

		return sorted;
	}
	
	function noDataRenderCallback(renderConfig) {
		var grey = renderConfig.baseColor;
		renderConfig.data = [{value: [3, 3]}, {value: [4, 4]}, {value: [5, 5]}, {value: [6, 6]}, {value: [7, 7]}];
		renderConfig.moonbeamInstance.getSeries(0).color = grey;
		renderConfig.moonbeamInstance.getSeries(1).color = pv.color(grey).lighter(0.18).color;
		renderCallback(renderConfig);
	}

	// Your extension's configuration
	var config = {
		id: 'com.ibi.datatables',     // string that uniquely identifies this extension
		containerType: 'html',  // either 'html' or 'svg' (default)
		initCallback: initCallback,
		preRenderCallback: preRenderCallback,  // reference to a function that is called right *before* your extension is rendered.  Will be passed one 'preRenderConfig' object, defined below.  Use this to configure a Monbeam instance as needed
		renderCallback: renderCallback,  // reference to a function that will draw the actual chart.  Will be passed one 'renderConfig' object, defined below
		noDataPreRenderCallback: noDataPreRenderCallback, 
		noDataRenderCallback: noDataRenderCallback,
		resources:  {  // Additional external resources (CSS & JS) required by this extension
			script: ['lib/datatables.min.js','lib/lasso.js'],
			css: ['css/datatables.min.css','css/symbol.css']
		},
		modules: {
			dataSelection: {
				supported: true,  // Set this true if your extension wants to enable data selection
				needSVGEventPanel: true, // if you're using an HTML container or altering the SVG container, set this to true and the chart engine will insert the necessary SVG elements to capture user interactions
				svgNode: function(arg){}  // if you're using an HTML container or altering the SVG container, return a reference to your root SVG node here.
			},
			eventHandler: {
				supported: true
			},
			tooltip: {
				supported: false,  // Set this true if your extension wants to enable HTML tooltips
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
		}
	};

	// Required: this call will register your extension with the chart engine
	tdgchart.extensionManager.register(config);
}());

