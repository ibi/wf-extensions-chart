renderConfig.modules.tooltip.addDefaultToolTipContent = function (target, s, g, d, data) {
    var ids = { object: 'riser', misc: 'bar' };
    if (target.hasAttribute('class')) ids = chart.classNameToIds(target.getAttribute('class'));
    if (s == null || g == null) {
        s = s == null ? ids.series || 0 : s;
        g = g == null ? ids.group || 0 : g;
    }
    ids.series = s;
    ids.group = g;
    var datum = chart.getDataFromIds(ids);
    d = d == null ? datum.d : d;
    data = data == null ? datum.data : data;
    debuger;
    d = tdg.merge(datum.d, tdg.clone(d));
    var res = chart.getSeriesAndGroupProperty(s, g, 'tooltip');
    if (res === 'auto' && typeof this.autoContent === 'function') res = this.autoContent(target, s, g, d, data);
    if (!(res instanceof HTMLElement)) res = chart.resolveToolTipSeriesContent(res, d, data, ids);
    this.setToolTipContent(target, res);
};
