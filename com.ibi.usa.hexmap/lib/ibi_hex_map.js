
/*please see jquery plugin authoring to understand this structure
http://learn.jquery.com/plugins/basic-plugin-creation/
http://learn.jquery.com/plugins/advanced-plugin-concepts/
*/
/*
Name: ibi_hex_map
File: ibi_hex_map.js
Dependencies: jquery library 1.8+, chroma.js
Author: Sandy Chiang - Information Builders
Date: Nov 8, 2018
Description: This jquery plugin is used to generate a hex representation of the US states. This is
useful when wanting a more compact, geographic visualization of US state data. 
 
*/
; (function ($) {

    //CSS classes
    var classes = {

    }

    var default_dataset = [
        { state: "AL", color: 25.6 },
        { state: "AK", color: 28.78 },
        { state: "AZ", color: 30.93 },
        { state: "AR", color: 28.27 },
        { state: "CA", color: 38.23 },
        { state: "CO", color: 29.71 },
        { state: "CT", color: 33.03 },
        { state: "DE", color: 39.15 },
        { state: "DC", color: 37.84 },
        { state: "FL", color: 29.19 },
        { state: "GA", color: 35.96 },
        { state: "HI", color: 35.46 },
        { state: "ID", color: 24.18 },
        { state: "IL", color: 31.33 },
        { state: "IN", color: 25.96 },
        { state: "IA", color: 29.43 },
        { state: "KS", color: 27.83 },
        { state: "KY", color: 24.62 },
        { state: "LA", color: 24 },
        { state: "ME", color: 24.81 },
        { state: "MD", color: 36.28 },
        { state: "MA", color: 37.1 },
        { state: "MI", color: 29.21 },
        { state: "MN", color: 31.91 },
        { state: "MS", color: 26.51 },
        { state: "MO", color: 27.71 },
        { state: "MT", color: 23.44 },
        { state: "NE", color: 27.67 },
        { state: "NV", color: 28.26 },
        { state: "NH", color: 26.9 },
        { state: "NJ", color: 33.55 },
        { state: "NM", color: 28.98 },
        { state: "NY", color: 36.15 },
        { state: "NC", color: 30.95 },
        { state: "ND", color: 24.24 },
        { state: "OH", color: 29.44 },
        { state: "OK", color: 25.84 },
        { state: "OR", color: 33.29 },
        { state: "PA", color: 29.67 },
        { state: "RI", color: 33.3 },
        { state: "SC", color: 27.7 },
        { state: "SD", color: 29.82 },
        { state: "TN", color: 27.39 },
        { state: "TX", color: 32.21 },
        { state: "UT", color: 28.12 },
        { state: "VT", color: 31.53 },
        { state: "VA", color: 38.79 },
        { state: "WA", color: 39.62 },
        { state: "WV", color: 20.64 },
        { state: "WI", color: 27.14 },
        { state: "WY", color: 25.06 }
    ];

    var default_metadata = {
        color: { title: "Sales", fieldName: "SALES", count: 1 }
        , state: { title: "State", fieldName: "STATE_ISO2", count: 1 }
        , tooltips: {
            count: 2,
            fieldName: ["CUSTOMERS", "OPPS"],
            title: ["Customers", "Opportunities"]
        }
    };

    //methods
    var methods = {
        /*
        Name: init
        Description: Initializes the control
        Params:
                    a_available_fields (JSON array): JSON in the structure of default_dataset;
                        field_name = the field in the metadata to use
                        field_desc = what to show as a friendly name for the field_name; usually the TITLE property in the metadata
                        field_type = either DIMENSION or MEASURE; this helps determine if a FX function would be relevant to it; i.e. if DIMENSION, then don't show FX drop down.
 
                    s_load_params (string): string representation of the chosen values; the format will depend on whether the s_control_type is set to DIM (BY / SORT) or MEASURE (AGGREGATE / PRINT)
                        If DIM, it should look like this
                            BY [SORT_TYPE] [FIELD_NAME1]; BY [SORT_TYPE] [FIELD_NAME2]; BY [SORT_TYPE] [FIELD_NAME3]; make sure it ends in a ;
                        where [SORT_TYPE] = HIGHEST or LOWEST
                        where [FIELD_NAMEN] = field name
 
                        If MEASURE, it should look like this
                            [AGGREGATE_PREFIX][FIELD_NAME1];[AGGREGATE_PREFIX][FIELD_NAME2];[AGGREGATE_PREFIX][FIELD_NAME3]; make sure it ends in a ;
                        where [AGGREGATE_PREFIX] = SUM , AVE., MIN., MAX.
                        where [FIELD_NAMEN] = field name
                    s_group_by_title (string): Title of the control; by default it is 'Sort By'
 
                    b_enable_sort (boolean) = enable the sort option or not; default is true
 
                    b_enable_fx (boolean) = enable the function option or not; default is false
                    s_sort_asc_icon_url (string): url string for the Sort Ascending option
                    s_sort_desc_icon_url (string): url string for the Sort Descending option
                    s_sort_none_icon_url (string): url string for the Sort None option
                    s_remove_icon_url (string): url string for the delete option
                    s_report_type (string): summary or detail; default is summary (i.e. functions are not relevant if this is for a detail report)
                    s_control_type (string): 'DIM' //DIM (which is equivalent to BY) or MEASURE (which is equivalent to a field in the VERB)
        Return: none
        */
        init: function (options) {
            //var thisMonth = new Date();
            var settings = $.extend(
                {
                    a_data: default_dataset, //
                    a_metadata: default_metadata,
                    s_start_color: '#FF0000',
                    s_end_color: '#00FF00',
                    f_tooltip_callback: null,
                    o_chartContainer: null
                }, options);
            var controlID = $(this).attr('id');
            $(this).data('controlID', controlID);
            $(this).data('settings', settings);
            methods.fn_init_control(controlID);
            methods.fn_init_events(controlID);

        }, //end init

        /*
        Description: Used to create the base HTML for this HTML control
 
        Params
         controlID (string) = id of the parent element without the #
        */
        fn_init_control: function (controlID) {

            //get reference to element
            var controlElement = elements.controlElement(controlID);

            //get data saved in this element
            var data = elements.dataElement(controlID);

            //the current state of the settings
            var settings = data['settings'];
            var metadata = settings.a_metadata;
            //get the available fields to choose from
            var data = settings.a_data;
            // creating base svg
            //var svg = $('svg', controlElement); // document.createElementNS("http://www.w3.org/2000/svg", "svg");
            //svg.addClass('svg');
            //var svg = $('svg',$(settings.o_chartContainer));
            //svg.addClass('svg');

            var svg = $(settings.o_chartContainer);
            var height = settings.i_height;
            var width = settings.i_width;
            // hexagon shape variables
            var hex_di = height / 10,
                // radius
                hex_rad = hex_di / 2,
                // apothem
                hex_apo = hex_rad * Math.cos(Math.PI / 6),
                // matrix defining state placement
                states_grid = methods.usStateMatrix();
            // data

            // rows we'll generate
            rows = states_grid.length,
                // columns we'll generate
                cols = states_grid[0].length,
                // stroke width around hexagon
                stroke = 4,
                // the hover state zoom scale
                scale = 2,
                // initial x
                x = hex_rad * scale / 2 + stroke * scale + (width - hex_di * 12) / 2,
                // initial y
                y = hex_rad * scale + stroke * scale + (height - hex_di * 8) / 2,
                // side length in pixels
                side = Math.sin(Math.PI / 6) * hex_rad,
                // height of map in pixels

                //height = (hex_di - side) * rows + side + hex_rad * scale + stroke * scale,
                // width of map in pixels
                //width = (hex_apo * 2) * cols + hex_rad * scale + stroke * scale;
                //svg.attr("width", "100%");
                //svg.attr("height", "100%");
                svg.attr("viewBox", "0 0 " + width + " " + height);
            // loop variables
            var offset = false,
                // parsing state data
                states = methods.fn_get_states(),

                // initial state index
                state_index = 0;

            // getting range of data defaults
            var scale_min = 0, scale_max = 0;

            // for each data find max and min
            for (var d = 0; d < data.length; d++) {

                scale_max = Math.max(scale_max, data[d].color);
                scale_min = Math.min(scale_min, data[d].color);

            }

            // draw grid
            for (var i = 0; i < states_grid.length; i++) {
                var loop_x = offset ? hex_apo * 2 : hex_apo;

                var loc_x = x;
                for (var s = 0; s < states_grid[i].length; s++) {
                    // grid plot in 0 and 1 array
                    var grid_plot = states_grid[i][s];

                    // if we have a plot in the grid
                    if (grid_plot != 0) {
                        // get the state
                        var state = states[state_index];

                        // lookup data for state
                        for (var d = 0; d < data.length; d++) {
                            if (data[d].state == state.abbr) {
                                state.data = data[d].color;
                                if (data[d].tooltips === undefined) {
                                    state.tooltips = [];
                                    state.metadata = [];

                                }
                                else {
                                    if (typeof data[d].tooltips == 'object') {
                                        state.tooltips = data[d].tooltips;
                                        state.metadata = metadata.tooltips.title;

                                    }
                                    else {
                                        state.tooltips = [data[d]];
                                        state.metadata = [metadata.tooltips.title];
                                    }
                                }
                            }
                        }

                        // create the hex group
                        var hexGroup = methods.fn_create_hex_group(controlID, svg, loc_x + loop_x, y, hex_rad, state, state.data, width, scale_min, scale_max, state.tooltips, state.metadata);


                        //have to reappend element on hover for stacking
                        $('text', hexGroup).on("mouseenter", function (e) {
                            var self = this;
                            
                            var stateIndex = self.getAttribute("_g");
                            if (settings.f_tooltip_callback) {
                                settings.f_tooltip_callback(stateIndex, e.offsetX, e.offsetY, true);
                            }
                        });

                        // append the hex to our svg
                        svg.append(hexGroup);
                        // increase the state index reference
                        state_index++;
                    }

                    // move our x plot to next hex position
                    loc_x += hex_apo * 2;
                }
                // move our y plot to next row position
                y += hex_di * 0.75;
                // toggle offset per row
                offset = !offset;
            }
        }
        /*
        Description: Used to init any control event handlers
 
        Params
         controlID (string) = id of the parent element without the #
        */
        , fn_init_events: function (controlID) {

        }
        , getHexColor: function (s_start_color, s_end_color, i_scale_min, i_scale_max, measure) {

            var legend_colors = chroma.scale([s_start_color, s_end_color]).domain([i_scale_min, i_scale_max]);

            return legend_colors(measure).hex();
        }

        // individual hex calculations
        , fn_create_hex_group: function (controlID, svg, x, y, r, state, measure, width, scale_min, scale_max, tooltips, metadata) {

            var data_element = elements.dataElement(controlID);

            var settings = data_element['settings'];
            var data = settings.a_data;

            var svgNS = "http://www.w3.org/2000/svg", // svgNS for creating svg elements
                group = document.createElementNS(svgNS, "g"),
                hex = document.createElementNS(svgNS, "polygon"),
                abbr = document.createElementNS(svgNS, "text"),
                
                pi_six = Math.PI / 6,
                cos_six = Math.cos(pi_six),
                sin_six = Math.sin(pi_six);

            // hexagon polygon points
            var hex_points = [
                [x, y - r].join(","),
                [x + cos_six * r, y - sin_six * r].join(","),
                [x + cos_six * r, y + sin_six * r].join(","),
                [x, y + r].join(","),
                [x - cos_six * r, y + sin_six * r].join(","),
                [x - cos_six * r, y - sin_six * r].join(",")
            ];

            var state_index = 0;

            for (var i = 0; i < data.length; i++) {
                var stateID = data[i].state;

                if (stateID == state.abbr) {
                    state_index = i;
                    break;
                }
            }
            //var className = settings.buildClassName != null ? settings.buildClassName('riser',0,state_index) : '';
            abbr.setAttribute("_g", state_index);
            hex.setAttribute("_g", state_index);
            // hexagon fill based on ratio
            //var fill = "hsl(180,30%," + ((1 - ratio) * 60 + 20) + "%)";
            var fill = settings.o_color_scale(measure); //methods.getHexColor(settings.s_start_color, settings.s_end_color, scale_min, scale_max, measure);
            hex.setAttribute("points", hex_points.join(" "));
            hex.setAttribute("fill", fill);
            hex.style.webkitTransformOrigin = hex.style.transformOrigin = x + 'px ' + y + 'px';

            abbr.setAttribute("class", "state-abbr");
            abbr.setAttribute("fill", settings.s_font_color);
            abbr.setAttribute("x", x);
            abbr.setAttribute("y", y);
            abbr.textContent = state.abbr;

            group.appendChild(hex);
            group.appendChild(abbr);
            //group.appendChild(name);

            return group;
        }
        , keyToName: function (str) {
            return str.replace(/_/g, ' ')
                .replace(/\w\S*/g, function (txt) {
                    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
                });
        }

        , usStateMatrix: function () {
            return [
                [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0],
                [0, 1, 1, 1, 1, 1, 0, 1, 0, 1, 1, 1],
                [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
                [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
                [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0],
                [0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0],
                [1, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0]
            ]
        }
        , fn_get_states: function () {
            var arr =
                [
                    { abbr: "AK", name: "Alaska" },
                    { abbr: "ME", name: "Maine" },

                    { abbr: "VT", name: "Vermont" },
                    { abbr: "NH", name: "New Hampshire" },

                    { abbr: "WA", name: "Washington" },
                    { abbr: "MT", name: "Montana" },
                    { abbr: "ND", name: "North Dakota" },
                    { abbr: "MN", name: "Minnesota" },
                    { abbr: "WI", name: "Wisconsin" },
                    { abbr: "MI", name: "Michigan" },
                    { abbr: "NY", name: "New York" },
                    { abbr: "MA", name: "Massachusetts" },
                    { abbr: "RI", name: "Rhode Island" },

                    { abbr: "ID", name: "Idaho" },
                    { abbr: "WY", name: "Wyoming" },
                    { abbr: "SD", name: "South Dakota" },
                    { abbr: "IA", name: "Iowa" },
                    { abbr: "IL", name: "Illinois" },
                    { abbr: "IN", name: "Indiana" },
                    { abbr: "OH", name: "Ohio" },
                    { abbr: "PA", name: "Pennsylvania" },
                    { abbr: "NJ", name: "New Jersey" },
                    { abbr: "CT", name: "Connecticut" },

                    { abbr: "OR", name: "Oregon" },
                    { abbr: "NV", name: "Nevada" },
                    { abbr: "CO", name: "Colorado" },
                    { abbr: "NE", name: "Nebraska" },
                    { abbr: "MO", name: "Missouri" },
                    { abbr: "KY", name: "Kentucky" },
                    { abbr: "WV", name: "West Virgina" },
                    { abbr: "VA", name: "Virginia" },
                    { abbr: "MD", name: "Maryland" },
                    { abbr: "DE", name: "Delaware" },

                    { abbr: "CA", name: "California" },
                    { abbr: "UT", name: "Utah" },
                    { abbr: "NM", name: "New Mexico" },
                    { abbr: "KS", name: "Kansas" },
                    { abbr: "AR", name: "Arkansas" },
                    { abbr: "TN", name: "Tennessee" },
                    { abbr: "NC", name: "North Carolina" },
                    { abbr: "SC", name: "South Carolina" },
                    { abbr: "DC", name: "District of Columbia" },

                    { abbr: "AZ", name: "Arizona" },
                    { abbr: "OK", name: "Oklahoma" },
                    { abbr: "LA", name: "Louisiana" },
                    { abbr: "MS", name: "Mississippi" },
                    { abbr: "AL", name: "Alabama" },
                    { abbr: "GA", name: "Georgia" },

                    { abbr: "HI", name: "Hawaii" },
                    { abbr: "TX", name: "Texas" },
                    { abbr: "FL", name: "Florida" }
                ];
            return arr;
        }
    };
    //retrieve various common elements
    var elements = {
        /*
        Name:   controlElement
        Description: the control element
        Params:
        controlID (string): element ID without the #
        Return: selector
        */
        controlElement: function (controlID) {
            return $('#' + controlID);
        },
        /*
        Description: data stored in the control
        Params:
        controlID (string): element ID without the #
        Return: selector
        */
        dataElement: function (controlID) {
            return elements.controlElement(controlID).data();
        }
    };
    $.fn.ibi_hex_map = function (method) {
        // Method calling logic
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist in ibi_hex_map');
        }
    }; //calling methods definition
})(jQuery);