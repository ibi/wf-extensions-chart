/*global tdgscatter: true */

(function() {
tdgscatter = typeof tdgscatter !== 'undefined' ? tdgscatter : {};
tdgscatter.circles = tdgscatter.circles || {};
tdgscatter.circles.init = circlesInit;

function circlesInit(config) {

	var props = {
		x: null,
		y: null,
		data: [],
		radius: 2,
		opacity: 1,
		color: 'grey'
	};

	if (config && config.constructor === Object) {
		for (var key in config) {
			if (config.hasOwnProperty(key)) {
				props[key] = config[key];
			}
		}
	}

	return function(d3_container) {
		var circles_group = d3_container.append('g')
              .classed('circles', true);

		var circles = circles_group
              .selectAll('circle')
              .data(props.data);

		circles.enter().append('circle')
			.style({
				opacity: props.opacity,
				fill: props.color
			})
			.attr({
				'class': function(d) {
					return d.elClassName;
				},
				cx: function(d) {
					return props.x(d.x);
				},
				cy: function(d) {
					return props.y(d.y);
				},
				r: props.radius
			}).filter(function(d) {
				return d.detail != null;
			}).each(function(d) {
				d.setDetail(this, d.detail);
			});
	};
}
})();
