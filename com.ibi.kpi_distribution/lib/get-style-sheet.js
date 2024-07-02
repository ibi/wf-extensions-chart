$.getStylesheet = function (href) {
  var $d = $.Deferred();
  var $link = $('<link/>', {
    rel: 'stylesheet',
    type: 'text/css',
    href: href,
  }).appendTo('head');
  $d.resolve($link);
  return $d.promise();
};
