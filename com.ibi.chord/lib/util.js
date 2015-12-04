/* jshint eqnull:true*/
/* globals _ d3*/

var com_tdg_util = (function () {
	function isNumeric (v) {
		return !isNaN(v);
	}

	// this function only copies attributes values if it is present on src and it's not null or undefined on trgt
	function copyIfExisty (src, trgt) {
		_.each(src, function (attr, key) {
			if ( _.isObject(attr) && _.isObject(trgt[key]) ) {
				copyIfExisty(attr, trgt[key]);
			} else if (trgt[key] != null && !_.isObject(src[key])) {
				src[key] = trgt[key];
			}
		});
	}

	function getTextBBox (text, font_family, font_size, selection) {
		var textSelection = selection.append('text')
			.attr({
				opacity: 0,
				'font-family': font_family,
				'font-size': font_size
			})
			.text(text);

		var bBox = textSelection.node().getBBox();
		textSelection.remove();
		return bBox();
	}

	return {
		copyIfExisty: copyIfExisty,
		isNumeric: isNumeric
	};
})();