(function() {
    tdgscatter = typeof tdgscatter !== 'undefined' ? tdgscatter : {};
    tdgscatter.axes = tdgscatter.axes || {};
    tdgscatter.axes.init = axesInit;

    function axesInit(config) {

        var props = {
            x: null,
            y: null
        };

        var innerProps = {};

        if (config && config.constructor === Object) {
            for (var key in config) {
                if (config.hasOwnProperty(key)) {
                    props[key] = config[key];
                }
            }
        }

        return function(d3_container) {
            var axes_group = d3_container.append('g').classed("axes", true);

            renderXAxis(axes_group);
            renderYAxis(axes_group);
        };

        function renderXAxis(axesG) {
            if (!props.x || !props.y) {
                return;
            }

            var axis = d3.svg.axis()
                .scale(props.x)
                .orient('bottom');

            var yrange = props.y.range();
            var xoffset = Math.abs(yrange[1] - yrange[0]);

            axesG.append("g")
                .attr("class", "x-axis")
                .attr("transform", function() {
                    return "translate(" + [0, xoffset] + ")";
                })
                .call(axis);
        }

        function renderYAxis(axesG) {
            if (!props.y) {
                return;
            }

            var axis = d3.svg.axis()
                .scale(props.y)
                .orient('left');

            axesG.append("g")
                .attr("class", "y-axis")
                .call(axis);
        }
    }
})();