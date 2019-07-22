/* Copyright 1996-2015 Information Builders, Inc. All rights reserved. */
/* $Revision: 1.0 $ */

(function () {
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
        chart.title.text = "";  // contrived example
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

        //var container = renderConfig.container;
        var container = $('#' + renderConfig.rootContainer.id + ' .chartHolder_relative_container');

        var data = prep_data(renderConfig);
        var dataBuckets = renderConfig.dataBuckets.buckets;
        var titleJSON = [];
        var acrossJSON = [];
        var numberOfBys = 0;
        var numberOfMeasures = 0;
        var numberOfAcross = 0;
        var groupIds = [];
        var dataJSON = [];

        /* Format JSON Data */
        if (typeof data[0].measure !== 'undefined' || typeof data[0].row !== 'undefined') {

            //console.log('Start rendering extension:', new Date());

            for (var i = 0; i < data.length; i++) {
                var row = {};
                var columnIndex = 0;
                var acrossIndex = -1;
                var newRow = true;

                /* Process Groups */
                if (typeof data[i].row !== 'undefined') {
                    if (typeof data[i].row === 'string') {
                        row["col" + columnIndex] = data[i].row;
                        columnIndex++;
                    }
                    else {
                        for (var j = 0; j < data[i].row.length; j++) {
                            row["col" + columnIndex] = data[i].row[j];
                            columnIndex++;
                        }
                    }
                }
                /* Process Measures */
                if (typeof data[i].measure !== 'undefined') {

                    if (typeof data[i].measure === 'number') {
                        row["col" + columnIndex] = data[i].measure;
                        groupIds.push(i);
                        columnIndex++;
                    }
                    else {
                        for (var j = 0; j < data[i].measure.length; j++) {
                            row["col" + columnIndex] = data[i].measure[j];
                            groupIds.push(i);
                            columnIndex++;
                        }
                    }
                }

                /* Check for Sparklines */
                if (typeof data[i].sparkline_dates !== 'undefined') {
                    row["col" + columnIndex] = 'Load';
                    columnIndex++;
                }

                if (newRow)
                    dataJSON.push(row);
                else {
                    Object.keys(row).forEach(function (key, index) {
                        if (typeof dataJSON[dataJSON.length - 1][key] === 'undefined')
                            dataJSON[dataJSON.length - 1][key] = row[key];
                    });
                }
            }


            /* Process Titles */
            columnIndex = 0;
            if (typeof dataBuckets.row !== 'undefined') {
                if (typeof dataBuckets.row.title === 'string') {
                    titleJSON.push({ mData: "col" + columnIndex, title: dataBuckets.row.title, className: "dt-left dt-by" });
                    columnIndex++;
                }
                else {
                    for (var i = 0; i < dataBuckets.row.title.length; i++) {
                        titleJSON.push({ mData: "col" + columnIndex, title: dataBuckets.row.title[i], className: "dt-left dt-by" });
                        columnIndex++;
                    }
                }
                numberOfBys = columnIndex;
            }
            if (typeof dataBuckets.measure !== 'undefined') {
                if (acrossJSON.length == 0) {
                    if (typeof dataBuckets.measure.title === 'string') {
                        titleJSON.push({ mData: "col" + columnIndex, title: dataBuckets.measure.title, className: "dt-right", render: $.fn.dataTable.render.number(',', '.', 2, ''), defaultContent: '0.00' });
                        columnIndex++;
                    }
                    else {
                        for (var i = 0; i < dataBuckets.measure.title.length; i++) {
                            titleJSON.push({ mData: "col" + columnIndex, title: dataBuckets.measure.title[i], className: "dt-right", render: $.fn.dataTable.render.number(',', '.', 2, ''), defaultContent: '0.00' });
                            columnIndex++;
                        }
                    }
                }
                else {
                    numberOfAcross = typeof dataBuckets.column.title === 'string' ? 1 : dataBuckets.column.title.length;
                    for (var k = 0; k < acrossJSON.length; k++) {
                        columnIndex = 0;
                        if (typeof dataBuckets.measure.title === 'string') {
                            titleJSON.push({ mData: "col" + (acrossJSON[k].index + '_') + columnIndex, title: dataBuckets.measure.title, className: "dt-right", render: $.fn.dataTable.render.number(',', '.', 2, ''), defaultContent: '0.00' });
                            columnIndex++;
                        }
                        else {
                            for (var i = 0; i < dataBuckets.measure.title.length; i++) {
                                titleJSON.push({ mData: "col" + (acrossJSON[k].index + '_') + columnIndex, title: dataBuckets.measure.title[i], className: "dt-right", render: $.fn.dataTable.render.number(',', '.', 2, ''), defaultContent: '0.00' });
                                columnIndex++;
                            }
                        }
                    }
                }
                numberOfMeasures = typeof dataBuckets.measure.title === 'string' ? 1 : dataBuckets.measure.title.length;
            }

            //add sparkline column
            if (typeof dataBuckets.sparkline_date !== 'undefined') {
                titleJSON.push({
                    mData: "col" + columnIndex, title: ' ', className: "dt-right dt-by sparkline-col-title", width: "110px", title: dataBuckets.sparkline_value.title
                });
                //titleJSON.push({ mData: "col" + columnIndex, title: ' ', className: "dt-right dt-by sparkline-col-title", render: $.fn.dataTable.render.number(',', '.', 2, ''), defaultContent: '0.00' });
                numberOfBys++;

            }
            //console.log('Finished Creating JSON files:', new Date());
        }

        /* Create Grid */
        if (dataJSON.length > 0) {
            /* Add Inline Style */
            $(container).html('');
            $(container).append('<style id="ib-inline-style"></style>')

            /* Table Style */
            $(container).find('#ib-inline-style').append('.dataTables_wrapper{color:' + props.color + 'font-family:' + props.fontFamily + ';font-size:' + props.fontSize + '}\n');

            /* Border Style */
            $(container).find('#ib-inline-style').append('.col-sm-12>.table.table-striped{' + props.border + '}\n');
            $(container).find('#ib-inline-style').append('.table>tbody>tr>td,.table>tbody>tr>th,.table>thead>tr>td,.table>thead>tr>th{border-top:' + props.border + '}\n');
            $(container).find('#ib-inline-style').append('.table>tfoot>tr>td,.table>tfoot>tr>th{border-top:none}\n');
            $(container).find('#ib-inline-style').append('.table>thead>tr:last-of-type>th{border-top:' + props.border + ';border-bottom:' + props.border + '}\n');
            //$(container).find('#ib-inline-style').append('th.dt-by+th:not(.dt-by),td.dt-by+td:not(.dt-by){border-left:'+props.border+'}\n');
            $(container).find('#ib-inline-style').append('.table>thead>tr>th.cross-tab{border-left:' + props.border + ';border-top:' + props.border + '}\n');
            $(container).find('#ib-inline-style').append('.table>thead>tr:first-child>th.cross-tab{border-top:' + props.border + '}\n');
            $(container).find('#ib-inline-style').append('.dataTables_scrollHead{border:' + props.border + '!important;border-bottom:0!important}\n');
            $(container).find('#ib-inline-style').append('.dataTables_scrollBody{border-left:' + props.border + ';border-bottom:' + props.border + ';border-right:' + props.border + '}\n');
            $(container).find('#ib-inline-style').append('.dataTables_scrollFoot{border-left:' + props.border + '!important;border-bottom:' + props.border + '!important;border-right:' + props.border + '!important}\n');
            $(container).find('#ib-inline-style').append('.DTFC_LeftHeadWrapper,.DTFC_LeftBodyWrapper,.DTFC_RightHeadWrapper{left:1px!important}\n');
            $(container).find('#ib-inline-style').append('.DTFC_LeftHeadWrapper table,.DTFC_LeftBodyWrapper table,.DTFC_RightHeadWrapper table{border-right:' + props.border + '}\n');
            $(container).find('#ib-inline-style').append('.DTFC_LeftHeadWrapper table>thead>tr:first-child>th:first-child{border-top:' + props.border + '!important}\n');
            //$(container).find('#ib-inline-style').append('.DTFC_LeftHeadWrapper table .dt-by:first-child,.DTFC_LeftBodyWrapper table .dt-by:first-child,.DTFC_RightHeadWrapper table .dt-by:first-child{border-left:'+props.border+'}\n');
            //$(container).find('#ib-inline-style').append('.DTFC_LeftHeadWrapper table .dt-by:last-child,.DTFC_LeftBodyWrapper table .dt-by:last-child,.DTFC_RightHeadWrapper table .dt-by:last-child{border-right:'+props.border+'}\n');

            /* Title Style */
            $(container).find('#ib-inline-style').append('.table>thead>tr>th{font-weight:' + props.title.fontWeight + ';color:' + props.title.color + ';background-color:' + props.data.backgroundColor + '}\n');

            /* Data Row Style */
            $(container).find('#ib-inline-style').append('.table>thead>tr>td{font-weight:' + props.data.fontWeight + ';color:' + props.data.color + '}\n');
            $(container).find('#ib-inline-style').append('.table>thead>tr:nth-of-type(odd)>td{background-color:' + props.data.backgroundColorOdd + '}\n');
            $(container).find('#ib-inline-style').append('.table>thead>tr:nth-of-type(even)>td{background-color:' + props.data.backgroundColorEven + '}\n');

            /* Selected Row Style */
            $(container).find('#ib-inline-style').append('table.dataTable tbody>tr.selected,table.dataTable tbody>tr>.selected{background-color:' + props.data.selected.backgroundColor + '}\n');
            $(container).find('#ib-inline-style').append('.table>tbody>tr.selected>td{border-top:' + props.data.selected.border + '}\n');
            $(container).find('#ib-inline-style').append('.table>tbody>tr.selected+tr>td{border-top:' + props.data.selected.border + '}\n');

            /* Cross Tab Style */
            $(container).find('#ib-inline-style').append('.table-striped>thead>tr:nth-of-type>th.cross-tab{color:' + props.crossTabs.color + ';font-weight:' + props.crossTabs.fontWeight + '}\n');
            $(container).find('#ib-inline-style').append('.table-striped>thead>tr:nth-of-type(odd)>th.cross-tab{background-color:' + props.crossTabs.backgroundColorOdd + '}\n');
            $(container).find('#ib-inline-style').append('.table-striped>thead>tr:nth-of-type(even)>th.cross-tab{background-color:' + props.crossTabs.backgroundColorEven + '}\n');

            $(container).append('<table class="table table-striped" style="width:100%"><thead></thead></table>');


            /* Add Heading */
            $(container).find('.table.table-striped:first thead').append('<tr></tr>');
            Object.keys(titleJSON).forEach(function (key, index) {
                var cls = typeof titleJSON[key].className === 'undefined' ? '' : ' class="' + titleJSON[key].className + '"';
                $(container).find('.table.table-striped:first thead tr:last').append('<th' + cls + '>' + titleJSON[key].title + '</th>');
            });

            /* Add Footer */
            if (props.showTotal) {
                $(container).find('.table.table-striped:first').append('<tfoot><tr></tr></tfoot>');
                Object.keys(titleJSON).forEach(function (key, index) {
                    var cls = typeof titleJSON[key].className === 'undefined' ? '' : ' class="' + titleJSON[key].className + '"';
                    $(container).find('.table.table-striped:first tfoot tr').append('<th' + cls + '>&nbsp;</th>');
                });
            }

            /* Load Datatables */
            var m = 0;
            var fixedColumns = { leftColumns: numberOfBys };

            var data_table = $(container).children('.table.table-striped').dataTable(
                {
                    "data": dataJSON,
                    "columns": titleJSON,
                    "paging": props.paging,
                    "pageLength": props.pageLength,
                    "lengthMenu": JSON.parse(props.lengthMenu),
                    "ordering": props.ordering,
                    "info": props.info,
                    "searching": props.searching,
                    "lengthChange": props.lengthChange,
                    //"responsive": numberOfAcross > 0 ? false : props.responsive,
                    "responsive": {
                        details: {
                            display: $.fn.dataTable.Responsive.display.childRowImmediate,
                            type: ''
                        }
                    },
                    "scrollX": numberOfAcross == 0 ? false : true,
                    "colReorder": numberOfAcross > 0 ? false : props.colReorder,
                    "select": false,
                    "scrollY": props.scrollY,
                    "deferRender": dataJSON.length <= 10 ? false : props.scroller,
                    "scroller": dataJSON.length <= 10 ? false : props.scroller,
                    "processing": true,
                    "fixedColumns": fixedColumns,
                    "initComplete": function (settings, json) {
                        //console.log('Datatables completed rendering:', new Date());
                    },
                    "footerCallback": !props.showTotal ? false : function (row, data, start, end, display) {
                        var api = this.api(), data;
                        var numFormat = $.fn.dataTable.render.number(',', '.', 2, '').display;

                        // Remove the formatting to get integer data for summation
                        var intVal = function (i) {
                            return typeof i === 'string' ? i.replace(/[\$,]/g, '') * 1 : typeof i === 'number' ? i : 0;
                        };

                        $(row).find('th.dt-right').each(function () {
                            var columnIndex = $(this).index();
                            var total = api.column(columnIndex).data().reduce(function (a, b) {
                                return intVal(a) + intVal(b);
                            }, 0);

                            $(api.column(columnIndex).footer()).html(numFormat(total));
                        });
                    },
                    "createdRow": function (row, data, dataIndex) {
                        for (var i = 0; i < titleJSON.length; i++) {
                            if (i >= numberOfBys) {
                                if (typeof data[titleJSON[i].mData] !== 'undefined') {
                                    var className = 'riser!s0!g' + groupIds[m] + '!datatable!r' + dataIndex + '!c' + (i - numberOfBys) + '!';
                                    $(row).children(':eq(' + i + ')').html('<span class="' + className + '">' + $(row).children(':eq(' + i + ')').text() + '</span>');
                                    m++;
                                }
                            }
                        }
                    },
                    "drawCallback": function () {


                        $('.dataTables_scrollBody tbody td:last-child', container).each(function (index) {
                            var row_id = $('td:nth-child(' + (numberOfBys - 1) + ')', $(this).parent()).html();
                            var data_row = Enumerable.From(data).Select(
                                function (x) {
                                    if (numberOfBys <= 2) {
                                        var data_object = {
                                            "sparkline_values": x["sparkline_values"],
                                            "row": x["row"]
                                        }
                                        return data_object;
                                    }
                                    var data_object = {
                                        "sparkline_values": x["sparkline_values"],
                                        "row": x["row"][numberOfBys - 2]
                                    }
                                    return data_object;
                                })
                                .Where("x => x['row'] =='" + row_id + "'")
                                .ToArray();
                            $(this).html('<div id="sparkline-' + index + '" class="sparkline-container" style="display: block; height: 30px;"></div>');
                            generate_sparkline("#sparkline-" + index, data_row[0].sparkline_values, props.sparkline);
                        });
                    }
                }
            );

 
        }

        $(container).children('.table.table-striped').on('responsive-display', function (e, datatable, row, showHide, update) {
            console.log('Details for row ' + row.index() + ' ' + (showHide ? 'shown' : 'hidden'));
        });
        /*

        var targetNodes = $('.dataTables_scrollBody tbody', data_table);

        var MutationObserver = window.MutationObserver || window.WebKitMutationObserver;
        var myObserver = new MutationObserver(function (mutationRecords) {
            console.log('mutated');
            return;
            $('.dataTables_scrollBody tbody td:last-child', container).each(function (index) {
                var row_id = $('td:nth-child(' + (numberOfBys - 1) + ')', $(this).parent()).html();
                var data_row = Enumerable.From(data)
                    //x => { A: x['A'], X: x['C'] }
                    .Select(function (x) {
                        return {
                            'sparkline_values': x['sparkline_values'],
                            'row': x['row'][numberOfBys - 2]
                        };
                    })
                    .Where("x => x['row'] =='" + row_id + "'")
                    .ToArray();
                $(this).html('<div id="sparkline-' + index + '" class="sparkline-container" style="display: block; height: 30px;"></div>');
                generate_sparkline("#sparkline-" + index, data_row[0].sparkline_values, props.sparkline);
            });
        });
        var obsConfig = { childList: true, characterData: false, attributes: true, subtree: true };

        //--- Add a target node to the observer. Can only add one node at a time.
        targetNodes.each(function () {
            myObserver.observe(this, obsConfig);
        });
        /*
        function mutationHandler(mutationRecords) {

            $('.dataTables_scrollBody tbody td:last-child', container).each(function (index) {
                var row_id = $('td:nth-child(' + (numberOfBys - 1) + ')', $(this).parent()).html();
                var data_row = Enumerable.From(data)
                    //x => { A: x['A'], X: x['C'] }
                    .Select(function (x) {
                        return {
                            'sparkline_values': x['sparkline_values'],
                            'row': x['row'][numberOfBys - 2]
                        };
                    })
                    .Where("x => x['row'] =='" + row_id + "'")
                    .ToArray();
                $(this).html('<div id="sparkline-' + index + '" class="sparkline-container" style="display: block; height: 30px;"></div>');
                generate_sparkline("#sparkline-" + index, data_row[0].sparkline_values, props.sparkline);
            });
        }
        */
        renderConfig.renderComplete();
    }

    function generate_sparkline(container_id, data, spark_props) {

        $(container_id).sparkline(data, {
            width: 100,
            height: 30,
            fillColor: false,
            lineColor: spark_props.color,
            spotColor: '',
            minSpotColor: null,
            maxSpotColor: null,
            disableTooltips: true,
            disableHighlight: true
        });
    }

    function findIndex(arr, comparator) {
        var index = -1;
        arr.forEach(function (item, i) {
            var match = true;
            Object.keys(comparator).forEach(function (key) {
                if (item[key] != comparator[key]) {
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

        sorted.sort(function (a, b) {
            var retCode = 0;
            Object.keys(columns).forEach(function (key) {
                if (a[key] < b[key]) {
                    retCode = -1;
                    return false;
                }
                else if (a[key] > b[key]) {
                    retCode = 1;
                    return false;
                }
            });
            return retCode;
        });

        return sorted;
    }

    function noDataRenderCallback(renderConfig) {
        var container = renderConfig.container;
        var grey = renderConfig.baseColor;
        renderConfig.data = [
            { "row": "1", "measure": 10, "_s": 0, "_g": 0, "sparkline_date": "2018/01/01", "sparkline_value": 100 },
            { "row": "1", "measure": 20, "_s": 0, "_g": 1, "sparkline_date": "2018/01/02", "sparkline_value": 110 },
            { "row": "1", "measure": 30, "_s": 0, "_g": 2, "sparkline_date": "2018/01/03", "sparkline_value": 120 },
            { "row": "2", "measure": 40, "_s": 0, "_g": 3, "sparkline_date": "2018/01/01", "sparkline_value": 200 },
            { "row": "2", "measure": 50, "_s": 0, "_g": 4, "sparkline_date": "2018/01/02", "sparkline_value": 210 },
            { "row": "2", "measure": 50, "_s": 0, "_g": 4, "sparkline_date": "2018/01/03", "sparkline_value": 220 }];
        renderConfig.dataBuckets = {
            "buckets": {
                "row": { "title": "A", "fieldName":"A","count": 1 },
                "measure": { "title": "B","fieldName":"B", "count": 1 },
                "sparkline_date": { "title": "Spark Date", "fieldName":"SPARK_DATE", "count": 1 },
                "sparkline_value": { "title": "Spark Value", "fieldName":"SPARK_VALUE","count": 1 }
            }, "depth": 1
        };
        renderCallback(renderConfig);

        $(container).append('<div class="placeholder">Add measures or dimensions</div>');
        $(container).find('.placeholder').height($(container).height());
    }

    function prep_data(renderConfig) {

        //generate row syntax
        var dataArray = renderConfig.data;
        var dataBuckets = renderConfig.dataBuckets.buckets;
        var row_syntax = '';
        var group_syntax = '';
        var row_levels = 1;
        if (dataBuckets.row !== undefined) {

            var number_of_rows = dataBuckets.row.fieldName.constructor === Array ? dataBuckets.row.fieldName.length : 1;

            switch (number_of_rows) {
                case 0:
                    break;
                case 1:
                    row_syntax = 'row: $.row, ';
                    group_syntax = '$.row';
                    break;
                default:
                    row_levels = dataArray[0].row.length;
                    row_syntax = 'row:[';
                    //group_syntax = '$.row';
                   // group_syntax = '$.row[' + (row_levels - 1) + ']'; //this one works with 1 grouping
                    //group_syntax = 'row:[';
                    //group_syntax = '{ ';
                    for (var row_index = 0; row_index < dataArray[0].row.length; row_index++) {

                        if (row_index == dataArray[0].row.length - 1) {
                            row_syntax = row_syntax + '$.row[' + row_index + '] ],';
                            
                            
                        }
                        else {
                            row_syntax = row_syntax + '$.row[' + row_index + '],';
                            

                        }
                        
                        if(row_index == 0)
                        {
                            group_syntax = group_syntax + "$.row[" + (row_index) + "]";
                        }
                        else{
                            group_syntax = group_syntax + " + ' ' + $.row[" + (row_index) + "]";
                        }
                        
                    }

            }
        }


        //generate measure syntax
        var measures_syntax = '';

        //console.log(dataArray[0].measures.length);

        if (dataBuckets.measure !== undefined) {

            var number_of_cols = dataBuckets.measure.fieldName.constructor === Array ? dataBuckets.measure.fieldName.length : 1;

            switch (number_of_cols) {
                case 0:
                    break;
                case 1:
                    var measure_field = dataBuckets.measure.fieldName;
                    var function_syntax = measure_field.indexOf("MIN.") == 0 ? 'Min' : measure_field.indexOf("MAX.") == 0 ? 'Max' : measure_field.indexOf("AVE.") == 0 ? 'Average' : 'Sum';
                    measures_syntax = "measure: $$." + function_syntax + "('$.measure'), ";

                    break;
                default:
                    measures_syntax = 'measure:[';
                    for (var measures_index = 0; measures_index < dataArray[0].measure.length; measures_index++) {
                        var measure_field = dataBuckets.measure.fieldName[measures_index];
                        var function_syntax = measure_field.indexOf("MIN.") == 0 ? 'Min' : measure_field.indexOf("MAX.") == 0 ? 'Max' : 'Sum';

                        if (measures_index == dataArray[0].measure.length - 1) {
                            measures_syntax = measures_syntax + "$$." + function_syntax + "('$.measure[" + measures_index + "]') ], ";

                        }
                        else {
                            measures_syntax = measures_syntax + "$$." + function_syntax + "('$.measure[" + measures_index + "]'),";
                        }

                    }
            }
        }

        //console.log(measures_syntax);

        var aggregatedObject = Enumerable.From(dataArray)
            .GroupBy(null, null,
            "{ " + row_syntax + measures_syntax + " sparkline_dates: [], sparkline_values: [] }",
            group_syntax)
            .OrderBy(group_syntax)
            //.OrderBy('$.row[' + (row_levels-1)+']')
            .ToArray();

        ///console.log(aggregatedObject);

        var distinct_lowest_row = [];
        
        //get unique lowest level row
        if (row_levels == 1) {

            distinct_lowest_row = Enumerable.From(aggregatedObject)
                .GroupBy(null, null,
                "{ row:$.row}",
                "$.row")
                .OrderBy('$.row')
                .ToArray();
        }
        else {
            var lowest_level = row_levels - 1;
            //var syntax = "{ row:$.row[" + lowest_level + "]}";
            var syntax = "{ row:$.row}";
            distinct_lowest_row = Enumerable.From(aggregatedObject)
                .GroupBy(null, null,
                syntax,
                group_syntax)
                .OrderBy('$.row')
                .ToArray();
        }
        //console.log(distinct_lowest_row); 
        
        var spark_values = [];

        for (var distinct_row_index = 0; distinct_row_index < distinct_lowest_row.length; distinct_row_index++) {
            var distinct_val = distinct_lowest_row[distinct_row_index].row;

            var spark_record = {
                key: '',
                dates: [],
                values: []
            }

            spark_record.key = distinct_val;
            var dates = [];
            var values = [];

            var spark_records = [];

            if (row_levels == 1) {

                spark_records = Enumerable.From(dataArray)
                    .Select(function (x) {
                        return {
                            'sparkline_date': x['sparkline_date'],
                            'sparkline_value': x['sparkline_value'],
                            'row': x['row']
                        };
                    })
                    // .GroupBy(null, null,
                    // "{ sparkline_date:$.sparkline_date, sparkline_value: $.sparkline_value}",
                    // "$.sparkline_date")
                    .Where("x => x['row'] =='" + distinct_val + "'")
                    .OrderBy('$.sparkline_date')
                    .ToArray();
            }
            else {
                var lowest_level = row_levels - 1;

                spark_records = Enumerable.From(dataArray)
                    //x => { A: x['A'], X: x['C'] }
                    .Select(function (x) {
                        return {
                            'sparkline_date': x['sparkline_date'],
                            'sparkline_value': x['sparkline_value'],
                            //'row': x['row'][lowest_level]
                            'row': x['row']
                        };
                    })
                    // .GroupBy(null, null,
                    // "{ sparkline_date:$.sparkline_date, sparkline_value: $.sparkline_value}",
                    // "$.sparkline_date")
                    .Where("x => x['row'] =='" + distinct_val + "'")
                    .OrderBy('$.sparkline_date')
                    .ToArray();
            }
            spark_records.forEach(function (i) {

                dates.push(i.sparkline_date);
                values.push(i.sparkline_value);
            });
            
            aggregatedObject[distinct_row_index].sparkline_dates = dates;
            aggregatedObject[distinct_row_index].sparkline_values = values;
        }

        return aggregatedObject;
    }

    // Your extension's configuration
    var config = {
        id: 'com.ibi.sparktables',     // string that uniquely identifies this extension
        containerType: 'html',  // either 'html' or 'svg' (default)
        initCallback: initCallback,
        preRenderCallback: preRenderCallback,  // reference to a function that is called right *before* your extension is rendered.  Will be passed one 'preRenderConfig' object, defined below.  Use this to configure a Monbeam instance as needed
        renderCallback: renderCallback,  // reference to a function that will draw the actual chart.  Will be passed one 'renderConfig' object, defined below
        noDataPreRenderCallback: noDataPreRenderCallback,
        noDataRenderCallback: noDataRenderCallback,
        resources: {
            script: window.jQuery ? ['lib/jquery.sparkline.js', 'lib/datatables.min.js', 'lib/lasso.js', 'lib/linq.js'] : ['lib/jquery-latest.js', 'lib/jquery.sparkline.js', 'lib/datatables.min.js', 'lib/lasso.js', 'lib/linq.js'],
            
            css: ['css/datatables.min.css', 'css/symbol.css']
        },
        modules: {
            dataSelection: {
                supported: true,  // Set this true if your extension wants to enable data selection
                needSVGEventPanel: true, // if you're using an HTML container or altering the SVG container, set this to true and the chart engine will insert the necessary SVG elements to capture user interactions
                svgNode: function (arg) { }  // if you're using an HTML container or altering the SVG container, return a reference to your root SVG node here.
            },
            eventHandler: {
                supported: true
            },
            tooltip: {
                supported: true  // Set this true if your extension wants to enable HTML tooltips
                // This callback is called when no default tooltip content is passed into the chart.
                // Use this to define 'nice' default tooltips for the given target, ids & data.
                // Return value can be a string (including HTML), or HTML nodes, or any Moonbeam tooltip API object.
            }
        }
    };

    // Required: this call will register your extension with the chart engine
    tdgchart.extensionManager.register(config);
}());

