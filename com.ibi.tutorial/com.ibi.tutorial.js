/*global tdgchart: false,  d3: false */
/* Copyright 1996-2015 Information Builders, Inc. All rights reserved. */

(function() {

// key = ext id, value = extension info
var tutorialExtensions = {};
var tutorialList = [
	'tooltips',
	'drilldown',
	'color_scale_legend',
	'series_break',
];
var currentExtension;

var tdg = tdgchart.util, isArray = Array.isArray;

function initCallback(successCallback, renderConfig) {

//	tdgchart.d3.select(document).on('mousedown.tdg_global', function(d, data, e) {
//		if (e && e.target && e.target instanceof HTMLSelectElement && e.target.getAttribute('class') === 'extension_selector') {
//			console.log("click");
//		}
//	});

	var loaded = (function() {
		var loadedCount = 0;
		var originalRegister = tdgchart.extensionManager.register;
		return function() {
			loadedCount += 1;
			if (loadedCount >= tutorialList.length) {
				tdgchart.extensionManager.register = originalRegister;
				successCallback(true);
			}
		};
	})();

	tdgchart.extensionManager.register = function(ext) {
		ext.properties = tdg.ajax(renderConfig.loadPath + ext.id + '/properties.json', {asJSON: true});
		tutorialExtensions[ext.id] = ext;
		if (currentExtension == null) {
			currentExtension = ext;
		}
		if (ext.id === renderConfig.properties.selectedExtension) {
			currentExtension = ext;
		}
		loaded();
	};

	var realInitModules = tdgchart.extensionManager.initModules;
	tdgchart.extensionManager.initModules = function(chart) {
		var ext = tdgchart.extensionManager.__extensionList[chart.chartType];
		ext.modules = tdg.clone(currentExtension.modules);
		realInitModules(chart);
	};

	tutorialList.forEach(function(extID) {
		extID = 'com.ibi.tutorial_' + extID;
		tdg.loadScriptFile(renderConfig.loadPath + extID + '/' + extID + '.js', null, function() {
			loaded();
		});
	});
}

function noDataPreRenderCallback(renderConfig) {}

function noDataRenderCallback(renderConfig) {}

function initModules(ext, renderConfig) {
	if (!ext || !ext.modules) {
		return;
	}
	var chart = renderConfig.moonbeamInstance;
	chart.legend.visible = ext.modules.legend != null;
}

function preRenderCallback(renderConfig) {
	initModules(currentExtension, renderConfig);
}

function titlecase(s) {
	return (s + '').replace(/([^\W_]+[^\s-]*) */g, function(el) {
		return el.charAt(0).toUpperCase() + el.substr(1).toLowerCase();
	});
}

function renderCallback(renderConfig) {

	var chart = renderConfig.moonbeamInstance;
	var w = renderConfig.width;
	var h = renderConfig.height;

	var container = d3.select(renderConfig.container)
		.attr('class', 'com_ibi_chart');

	var selectBox = container.append('select')
		.attr('class', 'extension_selector')
		.style('margin-left', '10px')
		.on('change', function() {
			currentExtension = tutorialExtensions[this.value];
			chart.redraw();
		});

	selectBox.selectAll('option')
		.data(tdgchart.util.keys(tutorialExtensions))
		.enter().append('option')
		.attr('value', function(d) {return d;})
		.text(function(d) {return titlecase(d.replace('com.ibi.tutorial_', '').replace(/_/g, ' '));});

	var extContainer = container.append('div')
			.attr('style', 'position: absolute; top: 25px; left: 0px;')
		.append('svg:svg')
			.attr('width', w - 2)
			.attr('height', h - 25)
			.attr('id', renderConfig.containerIDPrefix + '_subContainer')
			.attr('style', 'border: 1px solid black;');

	if (renderConfig.modules.tooltip) {
		renderConfig.modules.tooltip.activate = function() {
			chart.addHTMLToolTips(tdgchart.d3.select(extContainer.node()));
		};
	}

	if (currentExtension) {
		selectBox.node().value = currentExtension.id;
	}
	var ext = tutorialExtensions[selectBox.node().value];
	drawExtension(ext, extContainer, renderConfig);
}

function drawExtension(ext, container, renderConfig) {
	renderConfig = tdg.clone(renderConfig);
	initModules(ext, renderConfig);
	renderConfig.data = sanitizeData(ext, renderConfig);
	renderConfig.containerIDPrefix = container.attr('id');
	renderConfig.container = container.node();
	renderConfig.loadPath = renderConfig.loadPath + ext.id + '/';
	renderConfig.width = parseInt(container.attr('width'), 10);
	renderConfig.height = parseInt(container.attr('height'), 10);
	ext.renderCallback(renderConfig);
}

function sanitizeData(ext, renderConfig) {
	if (renderConfig.dataBuckets.series_break && !ext.properties.dataBuckets.series_break) {
		if (isArray(renderConfig.data) && isArray(renderConfig.data[0])) {
			// TODO: aggregrate split data across group IDs
			renderConfig.data = renderConfig.data[0];
			renderConfig.dataBuckets.depth = 1;
			delete renderConfig.dataBuckets.series_break;
		}
	}
	return renderConfig.data;
}

function resolveModuleLookup(prop) {
	return function(renderConfig) {
		var v = tdg.get(prop, currentExtension, 'DNE');
		if (typeof v === 'function') {
			renderConfig = tdg.clone(renderConfig);
			renderConfig.data = sanitizeData(currentExtension, renderConfig);
			return v(renderConfig);
		} else if (v !== 'DNE') {
			return v;
		}
		return null;
	};
}

// Your extension's configuration
var config = {
	id: 'com.ibi.tutorial',     // string that uniquely identifies this extension
	containerType: 'html',  // either 'html' or 'svg' (default)
	initCallback: initCallback,
	preRenderCallback: preRenderCallback,  // reference to a function that is called right *before* your extension is rendered.  Will be passed one 'preRenderConfig' object, defined below.  Use this to configure a Monbeam instance as needed
	renderCallback: renderCallback,  // reference to a function that will draw the actual chart.  Will be passed one 'renderConfig' object, defined below
	noDataPreRenderCallback: noDataPreRenderCallback,
	noDataRenderCallback: noDataRenderCallback,
	resources: {  // Additional external resources (CSS & JS) required by this extension
		script: ['lib/d3.min.js'],
		css: ['lib/style.css']
	}
};

// Required: this call will register your extension with the chart engine
tdgchart.extensionManager.register(config);

})();
