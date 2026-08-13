/*global window: false, document: false */
// Copyright (C) 2026. Cloud Software Group, Inc. All rights reserved. Confidential & Proprietary.
//
// CD-8144: shared no-data placeholder for chart extensions -- draws the
// `ds-icon-drag-drop` icon + "Drop measures & dimensions here" label, and (with
// fadeBackdrop) fades/blurs whatever the extension drew. Dependency-free DOM
// (works without d3) and window-guarded so extensions can share it.

(function(global) {
	if (global.tdgExtEmptyState) { return; }

	var SVG_NS = 'http://www.w3.org/2000/svg';
	var XHTML_NS = 'http://www.w3.org/1999/xhtml';

	var DEFAULTS = {
		text: 'Drop measures & dimensions here',
		color: '#37474F',
		iconSize: 56,
		textGap: 20,
		fontSize: '16px',
		fontFamily: 'Sans-Serif',
		iconClass: 'ds-icon-drag-drop',
		backdropOpacity: 0.5,
		backdropBlur: 'blur(8px)'
	};

	function render(renderConfig, options) {
		if (!renderConfig || !renderConfig.container) { return; }

		var opts = options || {};
		var text = opts.text != null ? opts.text : DEFAULTS.text;
		var color = opts.color || DEFAULTS.color;
		var iconSize = opts.iconSize || DEFAULTS.iconSize;
		var textGap = opts.textGap || DEFAULTS.textGap;
		var fontSize = opts.fontSize || DEFAULTS.fontSize;
		var fontFamily = opts.fontFamily || DEFAULTS.fontFamily;
		var iconClass = opts.iconClass || DEFAULTS.iconClass;

		var chart = renderConfig.moonbeamInstance;
		if (chart && chart.title) { chart.title.visible = false; }

		var container = renderConfig.container;
		if (opts.containerClass) { container.setAttribute('class', opts.containerClass); }

		// Fade + blur the existing children (the drawn chart) before appending the
		// overlay, so the placeholder stays crisp over a blurred backdrop.
		if (opts.fadeBackdrop) {
			for (var i = 0; i < container.childNodes.length; i++) {
				var child = container.childNodes[i];
				if (child.nodeType === 1 && child.style) {
					child.style.opacity = DEFAULTS.backdropOpacity;
					child.style.filter = DEFAULTS.backdropBlur;
					child.style.pointerEvents = 'none';
				}
			}
		}

		var cx = renderConfig.width / 2;
		var cy = renderConfig.height / 2;

		// Icon via foreignObject so the Designer's icon font applies.
		var fo = document.createElementNS(SVG_NS, 'foreignObject');
		fo.setAttribute('x', cx - iconSize / 2);
		fo.setAttribute('y', cy - iconSize - textGap / 2);
		fo.setAttribute('width', iconSize);
		fo.setAttribute('height', iconSize);

		var icon = document.createElementNS(XHTML_NS, 'i');
		icon.setAttribute('class', iconClass);
		icon.style.fontSize = iconSize + 'px';
		icon.style.lineHeight = iconSize + 'px';
		icon.style.color = color;
		fo.appendChild(icon);
		container.appendChild(fo);

		var label = document.createElementNS(SVG_NS, 'text');
		label.setAttribute('x', cx);
		label.setAttribute('y', cy + textGap / 2);
		label.setAttribute('text-anchor', 'middle');
		label.setAttribute('dominant-baseline', 'central');
		label.setAttribute('font-size', fontSize);
		label.setAttribute('font-family', fontFamily);
		label.setAttribute('fill', color);
		label.textContent = text;
		container.appendChild(label);
	}

	global.tdgExtEmptyState = { render: render };
}(window));
