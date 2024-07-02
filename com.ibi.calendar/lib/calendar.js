/* jshint eqnull:true*/
/* globals d3*/

var tdg_calendar = (function () {
    // <---------------------------------------- CHANGE ME

    function copyIfExisty(src, trgt) {
        each(src, function (attr, key) {
            if (isObject(attr) && isObject(trgt[key])) {
                copyIfExisty(attr, trgt[key]);
            } else if (trgt[key] != null && !isObject(src[key])) {
                src[key] = trgt[key];
            }
        });
    }

    var DATE_FORMATS = {
        YMD: 'YMD',
        MDY: 'MDY',
        DMY: 'DMY',
    };

    var DATE_FORMAT = DATE_FORMATS.YMD;

    function isObject(o) {
        return o && o.constructor === Object;
    }

    function each(obj, cb) {
        if (Array.isArray(obj)) {
            for (var i = 0; i < obj.length; i++) {
                cb(obj[i], i, obj);
            }
            obj.forEach(cb);
        } else if (isObject(obj)) {
            for (var key in obj) {
                if (obj.hasOwnProperty(key)) {
                    cb(obj[key], key, obj);
                }
            }
        }
    }

    function ensureValidDate(date) {
        return !isNaN(date.getTime());
    }

    function isDateInMilliseconds(str) {
        return !isNaN(str);
    }

    function parseMillisecondsString(str) {
        var d = new Date(parseInt(str, 10));
        return ensureValidDate(d) ? d : null;
    }

    function fixWFDateFormat(str) {
        return str.slice(0, 2) + '/' + str.slice(2, 4) + '/' + str.slice(4);
    }

    function isOldWFDateFormat(str) {
        return /\d{8}/.test(str);
    }

    function parseFormatedDateString(str) {
        var d;
        if (isOldWFDateFormat(str)) {
            d = new Date(fixWFDateFormat(str));
        } else {
            d = new Date(str);
        }

        return ensureValidDate(d) ? d : null;
    }

    function parseDate(date_str) {
        return parseFormatedDateString(date_str);
    }

    function getFixedDataObject(data) {
        return data
            .map(function (d) {
                return {
                    value: d.value,
                    date: parseDate(d.date),
                    elClassName: d.elClassName,
                };
            })
            .filter(function (d) {
                return d.value != null && d.date != null;
            });
    }

    // --------------------------------- PUT HERE ALL THE GLOBAL VARIABLES AND FUNCTIONS THAT DON'T NEED TO ACCESS PROPS AND INNERPROPS THROUGH SCOPE (Z1)
    //layouts = {
    //         charts: [
    //              {
    //                  transform: 'str',
    //                  labels: {
    //                      year: {
    //                          text: 'year',
    //                          style: {
    //
    //                          },
    //                          attrs: {
    //
    //                          }
    //                      },
    //                      weekDays: [
    //                          {
    //                              text: 'weekday',
    //                              style: {
    //                              },
    //                              attrs: {
    //                              }
    //                          }
    //                      ],
    //                      months: [
    //                          {
    //                          }
    //                      ]
    //                  }
    //                  cells: [
    //                      {
    //                          x: num,
    //                          y: num,
    //
    //                      }
    //                  ],
    //                  monthLines: [
    //                      {
    //
    //                      }
    //                  ]
    //                  cellsSide: num
    //              }
    //         ]
    //      }
    function getMonthNames(language) {
        var month_names = {
            en: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
            es: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
            de: ['Jan', 'Feb', 'Mrz', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'], // VIZ-173
        };
        return month_names[language];
    }

    var day, week;

    function getWeekDaysNames(language) {
        var week_days_names = {
            en: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
            es: ['Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab', 'Dom'],
            de: ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'],
        };
        return week_days_names[language];
    }

    function getTitlesDims(measureLabel, titlesProps) {
        return {
            year: measureLabel('2000', titlesProps.year.font),
            weekday: measureLabel('Wed', titlesProps.weekdays.font),
            month: measureLabel('May', titlesProps.months.font),
        };
    }

    function getCellSideLength(width, height) {
        var horiz = width / 54, // max round number of weeks in a year
            vert = height / 7; // number of days in a week

        return horiz < vert ? horiz : vert;
    }

    function monthPath(t0, cellSize) {
        var t1 = new Date(t0.getFullYear(), t0.getMonth() + 1, 0),
            d0 = +day(t0),
            w0 = +week(t0),
            d1 = +day(t1),
            w1 = +week(t1);
        /*
                d0 = t0.getDay(), w0 = d3.time.weekOfYear(t0),
                d1 = t1.getDay(), w1 = d3.time.weekOfYear(t1);
        */
        return 'M' + (w0 + 1) * cellSize + ',' + d0 * cellSize + 'H' + w0 * cellSize + 'V' + 7 * cellSize + 'H' + w1 * cellSize + 'V' + (d1 + 1) * cellSize + 'H' + (w1 + 1) * cellSize + 'V' + 0 + 'H' + (w0 + 1) * cellSize + 'Z';
    }

    function getDateIdentifier(d) {
        return d.getMonth() + ' ' + d.getDate() + ' ' + d.getYear();
        switch (DATE_FORMAT) {
            case DATE_FORMATS.YMD:
                return d.getMonth() + ' ' + d.getDate() + ' ' + d.getYear();
            case DATE_FORMATS.MDY:
                return d.getMonth() + ' ' + d.getDate() + ' ' + d.getYear();
            default:
                return d.getMonth() + ' ' + d.getDate() + ' ' + d.getYear();
        }
    }

    function buildCellTitle(date, toolTip, language) {
        var str = '<div style="padding:5px;">',
            titleText = language == 'es' ? 'Fecha: ' : 'Date: ';

        str += '<b>' + titleText + '</b>';
        str += getMonthNames(language)[date.getMonth()] + ' ' + date.getDate() + ', ' + (1900 + date.getYear());
        str += '<br/>';
        str += '<b>' + toolTip.key + ': </b>' + toolTip.value;
        str += '</div>';

        return str;
    }

    function buildSingleChartLayout(width, height, titleDims, year, dateToDatumMap, language) {
        if (language == 'es' || language == 'de') {
            day = function (d) {
                return (d.getDay() + 6) % 7;
            };
            //BEGIN Update to d3 V5.x
            //week = d3.time.format("%W");
            week = d3.timeFormat('%W');
            //END Update to d3 V5.x
        } else {
            (day = function (d) {
                return d.getDay();
            }),
                //BEGIN Update to d3 V5.x
                //week = d3.time.format("%U");
                (week = d3.timeFormat('%U'));
            //END Update to d3 V5.x
        }
        var layout = {
            labels: {
                year: null,
                weekDays: null,
                months: null,
            },
            cells: [],
            monthLines: [],
            cellsOffset: null,
        };

        var pad = 8;

        var left = titleDims.year.height + titleDims.weekday.width + 3 * pad;
        var top = titleDims.month.height + pad;
        var canvasWidth = width - left - 5; // 5 is right offset
        var canvasHeight = height - top;

        var cellSize = getCellSideLength(canvasWidth, canvasHeight);

        //BEGIN Update to d3 V5.x
        //var days = d3.time.days( year, d3.time.year.offset(year, 1) ); // get all days of the year
        var days = d3.timeDays(year, d3.timeYear.offset(year, 1));
        //END Update to d3 V5.x

        layout.cells = days.map(function (d) {
            var dId = getDateIdentifier(d);
            return {
                /*
                                x: d3.time.weekOfYear(d) * cellSize,
                                y: d.getDay() * cellSize,
                */
                x: week(d) * cellSize,
                y: day(d) * cellSize,
                width: cellSize,
                height: cellSize,
                fill: dateToDatumMap[dId] && dateToDatumMap[dId].color ? dateToDatumMap[dId].color : 'none',
                class: dateToDatumMap[dId] && dateToDatumMap[dId].elClassName ? dateToDatumMap[dId].elClassName : null,
                tdgtitle: dateToDatumMap[dId] && dateToDatumMap[dId].toolTip ? buildCellTitle(d, dateToDatumMap[dId].toolTip, language) : null,
            };
        });

        var halfCellSize = cellSize / 2;

        layout.labels.weekDays = getWeekDaysNames(language).map(function (text, idx) {
            return {
                text: text,
                x: left - pad,
                y: cellSize * idx + halfCellSize,
            };
        });

        var extent = d3.extent(layout.labels.weekDays, function (d) {
            return d.y;
        });

        layout.labels.year = {
            text: year.getYear() + 1900,
            x: pad,
            y: top + extent[0] + (extent[1] - extent[0]) / 2,
        };

        layout.labels.weekDays = getWeekDaysNames(language).map(function (text, idx) {
            return {
                text: text,
                x: left - pad,
                y: cellSize * idx + halfCellSize,
            };
        });

        //        var sundays = days.filter(function(d){ return d.getDay() === 0; });
        var firstDayOfWeek = days.filter(function (d) {
            return day(d) === 0;
        });

        var sundaysByMonth = d3
            .nest()
            .key(function (d) {
                return +d.getMonth();
            })
            .entries(firstDayOfWeek);

        layout.labels.months = getMonthNames(language).map(function (text, idx) {
            var extent = d3.extent(sundaysByMonth[idx].values);
            //            var x = d3.time.weekOfYear(extent[0]) * cellSize + ( d3.time.weekOfYear(extent[1]) * cellSize + cellSize - d3.time.weekOfYear(extent[0]) * cellSize ) / 2;
            var x = week(extent[0]) * cellSize + (week(extent[1]) * cellSize + cellSize - week(extent[0]) * cellSize) / 2;

            return {
                text: text,
                x: left + x,
                y: 0,
            };
        });
        //BEGIN Update to d3 V5.x
        //var months = d3.time.months(days[0], days[days.length - 1]);
        var months = d3.timeMonths(days[0], days[days.length - 1]);
        //END Update to d3 V5.x

        layout.monthLines = months.map(function (date) {
            return monthPath(date, cellSize);
        });

        layout.cellsOffset = [left, top];

        return layout;
    }

    function buildLayout(props) {
        var chartOffset = 10;

        var layout = {
            charts: [],
        };

        var data = getFixedDataObject(props.data);

        var date_extent = d3.extent(data, function (d) {
            return d.date;
        });

        //BEGIN Update to d3 V5.x
        //var years = d3.time.years(d3.time.year(date_extent[0]), date_extent[1]);
        var years = d3.timeYears(d3.timeYear(date_extent[0]), date_extent[1]);
        //END  Update to d3 V5.x
        if (props.yearsOrder == 'DESC') years.reverse();
        var height = years.length > 1 ? props.height / years.length - chartOffset : props.height;

        var titleDims = getTitlesDims(props.measureLabel, props.titles);

        var minMaxVal = d3.extent(data, function (d) {
            return d.value;
        });

        var formatConfig = {
            min: minMaxVal[0],
            max: minMaxVal[1],
        };

        var dateToDatumMap = data.reduce(function (map, cur) {
            var dId = getDateIdentifier(cur.date);
            map[dId] = {
                color: props.colorScale(cur.value).toString(),
                elClassName: cur.elClassName,
            };

            if (props.toolTip.enabled) {
                map[dId].toolTip = {
                    key: props.buckets.value[0],
                    value: props.formatNumber(cur.value, props.toolTip.value.format, formatConfig),
                };
            }

            return map;
        }, {});

        years.forEach(function (year, idx) {
            var chart = buildSingleChartLayout(props.width, height, titleDims, year, dateToDatumMap, props.language);
            chart.topOffset = (height + chartOffset) * idx;
            layout.charts.push(chart);
        });

        return layout;
    }

    function renderLabels(chart_group, lblProps) {
        var week_lbls_group = chart_group
            .append('g')
            .classed('week-labels', true)
            .attr('transform', function (d) {
                return 'translate(0,' + d.cellsOffset[1] + ')';
            });

        //BEGIN Update to d3 V5.x
        //used mostly chaining to simplify the update
        //any objects used in attr or style has to the function attrs and styles respectively

        week_lbls_group
            .selectAll('text')
            .data(function (d) {
                return d.labels.weekDays;
            })
            .enter()
            .append('text');

        var week_labels = week_lbls_group.selectAll('text');

        week_labels
            .attrs({
                x: function (d) {
                    return d.x;
                },
                y: function (d) {
                    return d.y;
                },
                dy: '.35em',
            })
            .styles({
                font: lblProps.weekdays.font,
                fill: lblProps.weekdays.color,
                'font-weight': lblProps.weekdays['font-weight'],
                'text-anchor': 'end',
            })
            .text(function (d) {
                return d.text;
            });

        chart_group
            .selectAll('text.year')
            .data(function (d) {
                return [d.labels.year];
            })
            .enter()
            .append('text')
            .classed('year', true)
            .attrs({
                dy: '1em',
                transform: function (d) {
                    return 'translate(' + [d.x, d.y] + ') rotate(-90)';
                },
            })
            .styles({
                font: lblProps.year.font,
                fill: lblProps.year.color,
                'font-weight': lblProps.year['font-weight'],
                'text-anchor': 'middle',
            })
            .text(function (d) {
                return d.text;
            });

        chart_group
            .append('g')
            .classed('months-labels', true)
            .selectAll('text')
            .data(function (d) {
                return d.labels.months;
            })
            .enter()
            .append('text')
            .attrs({
                x: function (d) {
                    return d.x;
                },
                y: function (d) {
                    return d.y;
                },
                dy: '1em',
            })
            .styles({
                font: lblProps.months.font,
                fill: lblProps.months.color,
                'font-weight': lblProps.months['font-weight'],
                'text-anchor': 'middle',
            })
            .text(function (d) {
                return d.text;
            });

        //END Update to d3 V5.x
    }

    function isColoredSquare(d) {
        return d.fill != 'none';
    }

    function fade(opacity) {
        return function (d) {
            d3.select(this).style('opacity', opacity);
        };
    }

    //Start Code Prior to CHART-3033
    //function renderCells (chart_group) {
    //End Code Prior to CHART-3033

    //Begin CHART-3033
    function renderCells(chart_group, toolTipFunctions) {
        //End CHART-3033

        var cell_group = chart_group.append('g');

        cell_group.classed('cells', true).attr('transform', function (d) {
            return 'translate(' + d.cellsOffset + ')';
        });

        cell_group
            .selectAll('rect')
            .data(function (d) {
                return d.cells;
            })
            .enter()
            .append('rect');

        var cells = cell_group.selectAll('rect');

        cells.each(function (cell, s, g) {
            d3.select(this).attrs(cell);
            //Begin CHART-3033
            //Follow design pattern in https://github.com/ibi/wf-extensions-chart/blob/master/com.ibi.simple_bar/com.ibi.simple_bar.js
            //'cell' object already has class built with chart.buildClassName(...) method by this point
            toolTipFunctions.addDefaultToolTipContent(this, null, null, null, null);
            //End CHART-3033
        });

        cells.filter(isColoredSquare).on('mouseover', fade(0.6)).on('mouseout', fade(1));
    }

    function renderMonthBorders(chart_group) {
        var month_borders_group = chart_group
            .append('g')
            .classed('month-borders', true)
            .attr('transform', function (d) {
                return 'translate(' + d.cellsOffset + ')';
            });

        var borders = month_borders_group.selectAll('path').data(function (d) {
            return d.monthLines;
        });

        borders
            .enter()
            .append('path')
            .attr('d', function (d) {
                return d;
            });
    }

    function render(main_group, chartLayouts, props) {
        var charts = main_group
            .selectAll('g.chart')
            .data(chartLayouts)
            .enter()
            .append('g')
            .classed('chart', true)
            .attr('transform', function (d) {
                return 'translate(0,' + d.topOffset + ')';
            })
            //Start Code Prior to CHART-3033
            //.call(renderCells, props.toolTipFunctions)
            //End Code Prior to CHART-3033
            //Begin CHART-3033
            .call(renderCells, props.toolTipFunctions) //pass reference to TDG toolTipFunctions as a reference
            //End CHART-3033
            .call(renderMonthBorders)
            .call(renderLabels, props.titles);
    }

    // --------------------------------- END OF Z1
    return function (user_props) {
        var props = {
            width: 300,
            height: 400,
            data: [],
            measureLabel: null,
            colorScale: null,
            formatNumber: null,
            //Begin CHART-3033
            toolTipFunctions: null,
            //End CHART-3033
            buckets: null,
            toolTip: {
                enabled: true,
                value: {
                    format: 'auto',
                },
            },
            titles: {
                year: {
                    font: '14px sans-serif',
                    color: 'black',
                    'font-weight': 'bold',
                },
                weekdays: {
                    font: '12px sans-serif',
                    color: 'black',
                    'font-weight': 'none',
                },
                months: {
                    font: '12px sans-serif',
                    color: 'black',
                    'font-weight': 'none',
                },
            },
            dateFormat: DATE_FORMATS.YMD,
            yearsOrder: 'ASC',
        };

        DATE_FORMAT = user_props.dateFormat;

        var innerProps = {};

        // ---------------------------------- INTERNAL FUNCTIONS THAT NEED ACCESS TO PROPS AND INNERPROPS THROUGH SCOPE GO HERE (Z2)

        // ---------------------------------- END OF Z2
        copyIfExisty(props, user_props || {});

        if (user_props.language) {
            props['language'] = user_props.language;
        } else {
            props['language'] = 'en';
        }

        function createAccessor(attr) {
            function accessor(value) {
                if (!arguments.length) {
                    return props[attr];
                }
                props[attr] = value;
                return chart;
            }
            return accessor;
        }

        function chart(selection) {
            var layout = buildLayout(props);

            var group_main = selection.append('g').classed('group-main', true);

            render(group_main, layout.charts, props);

            // 0. build layout object.
            // 1. find out how many years data set spans by scanning the dataset so canvas can be broken horizontally
            // 2. every canvas need to have space allocated for the year and week days titles on the left and for the months on the top
            // 3. first we render titles and cells
            // 4. second we color cells according to dataset

            //render( group_main );
        }

        for (var attr in props) {
            if (!chart[attr] && props.hasOwnProperty(attr)) {
                chart[attr] = createAccessor(attr);
            }
        }

        /* start-test-block */

        /* end-test-block */

        return chart;
    };
})();
