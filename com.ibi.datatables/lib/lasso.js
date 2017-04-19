$.fn.extend({
	lasso: function () {
		return this
		.mousedown(function(e) {
			$(this).find('span.selected,span.selecting').removeClass('selected').removeClass('selecting');
			$(this).append('<div class="lasso-box"></div>');
			$(this).find('.lasso-box').css({'left': e.clientX - $(this).offset().left + 'px', 'top': e.clientY - $(this).offset().top + 'px' });
			$(this).attr('data-lasso-start-x', e.clientX);
			$(this).attr('data-lasso-start-y', e.clientY);
		})
		.mouseup(function(e) {
			$(this).find('.lasso-box').remove();
			$(this).find('span.selecting').removeClass('selecting').addClass('selected');
			$(this).removeAttr('data-lasso-start-y').removeAttr('data-lasso-start-x');
		})
		.mousemove(function(e) {
			var $lassoBox = $(this).find('.lasso-box');
			if ($lassoBox.length>0) {
				var top = Math.min(e.clientY,$(this).attr('data-lasso-start-y')) - $(this).offset().top;
				var left = Math.min(e.clientX,$(this).attr('data-lasso-start-x')) - $(this).offset().left;
				var height = Math.max(e.clientY,$(this).attr('data-lasso-start-y')) - top - $(this).offset().top;
				var width = Math.max(e.clientX,$(this).attr('data-lasso-start-x')) - left - $(this).offset().left;
				
				$lassoBox.css({'left': left + 'px', 'top': top + 'px', 'width': width + 'px', 'height': height + 'px' });
				var boxLeft = $lassoBox.offset().left;
				var boxRight = $lassoBox.offset().left + $lassoBox.outerWidth();
				var boxTop = $lassoBox.offset().top;
				var boxBottom = $lassoBox.offset().top + $lassoBox.outerHeight();
				
				$('span').each(function(index){
					if (($(this).offset().left > boxLeft &&
						$(this).offset().top > boxTop &&
						$(this).offset().left < boxRight &&
						$(this).offset().top < boxBottom) ||
						($(this).offset().left+$(this).outerWidth() > boxLeft &&
						$(this).offset().top+$(this).outerHeight() > boxTop &&
						$(this).offset().left+$(this).outerWidth() < boxRight &&
						$(this).offset().top+$(this).outerHeight() < boxBottom) ||
						($(this).offset().left > boxLeft &&
						$(this).offset().top+$(this).outerHeight() > boxTop &&
						$(this).offset().left < boxRight &&
						$(this).offset().top+$(this).outerHeight() < boxBottom) ||
						($(this).offset().left+$(this).outerWidth() > boxLeft &&
						$(this).offset().top > boxTop &&
						$(this).offset().left+$(this).outerWidth() < boxRight &&
						$(this).offset().top < boxBottom))
						$(this).addClass('selecting');
				});
			}
		});
	}
});
