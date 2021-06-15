/*global tdgchart: false, document: false, setTimeout: false, Odometer: false */
/* eslint-disable indent */
/* Copyright (c) 1996-2021 TIBCO Software Inc. All Rights Reserved. */

(function() {

	function noDataRenderCallback(renderConfig) {
		renderConfig.data = [{value: 10010}];
		renderConfig.properties.startValue = 10010;
		renderConfig.properties.theme = 'default';
		renderConfig.properties.fontSize = null;
		renderCallback(renderConfig);
	}

	var animations = ['spin', 'count'];
	var themes = ['car', 'default', 'digital', 'minimal', 'plaza', 'slot-machine', 'train-station'];
	var themeScales = {
		car: [1, 1.7],
		'default': [0.6, 0.85],
		digital: [1.1, 1.3],
		minimal: [0.55, 0.8],
		plaza: [0.7, 1.4],
		'slot-machine': [1.3, 2.3],
		'train-station': [0.85, 1.4]
	};

	function renderCallback(renderConfig) {

		var chart = renderConfig.moonbeamInstance;
		var container = renderConfig.container;
		var value = renderConfig.data[0].value;
		var startValue = renderConfig.properties.startValue;
		var updateSpeed = renderConfig.properties.updateSpeed;
		var duration = Math.abs(value - startValue) * updateSpeed;

		var animation = (renderConfig.properties.animation || 'spin').toLowerCase();
		animation = animations.includes(animation) ? animation : 'spin';

		var theme = (renderConfig.properties.theme || 'default').toLowerCase();
		theme = themes.includes(theme) ? theme : 'default';

		var fontSize = renderConfig.properties.fontSize;
		if (!fontSize) {
			var digitCount = Math.log(Math.max(value, startValue, Math.abs(value + startValue))) * Math.LOG10E + 1 | 0;
			var maxFontWidth = renderConfig.width / digitCount / themeScales[theme][0];
			var maxFontHeight = renderConfig.height / themeScales[theme][1];
			fontSize = Math.floor(Math.max(10, Math.min(maxFontWidth, maxFontHeight)));
		}

		var div = document.createElement('div');
		div.setAttribute('style', 'width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; cursor: default');

		var div2 = document.createElement('div');
		var color = renderConfig.moonbeamInstance.noDataMode ? ' color: #909090;' : '';
		div2.setAttribute('style', 'font-size: ' + fontSize + 'px; flex: none;' + color);
		div2.setAttribute('class', chart.buildClassName('riser', 0, 0, 'bar'));
		renderConfig.modules.tooltip.addDefaultToolTipContent(div2, 0, 0);

		div.appendChild(div2);
		container.appendChild(div);

		var od = new Odometer({
			el: div2,
			value: startValue,
			format: renderConfig.properties.format,
			theme: theme,
			duration: (animation === 'count') ? duration : 1000,
			animation: animation
		});

		if (animation === 'count' || !updateSpeed) {
			od.update(value);
		} else if (updateSpeed) {
			var currentValue = startValue;
			var direction = (startValue < value) ? 1 : -1;
			function update() {
				currentValue += direction;
				od.update(currentValue);
				if ((direction > 0 && currentValue < value) || (direction < 0 && currentValue > value)) {
					setTimeout(update, updateSpeed);
				}
			}
			setTimeout(update, updateSpeed);
		}

		renderConfig.renderComplete();
		renderConfig.modules.tooltip.activate(div);
	}

	var config = {
		id: 'com.ibi.odometer',
		containerType: 'html',  // Either 'html' or 'svg' (default).  Defines the type of container your extension will be passed
		renderCallback: renderCallback,
		noDataRenderCallback: noDataRenderCallback,
		resources: {  // Additional external resources (CSS & JS) required by this extension
			script: ['lib/odometer.js'],
			css: themes.map(function(el) {
				return 'css/odometer-theme-' + el + '.css';
			})
		},
		modules: {
			eventHandler: {
				supported: true
			},
			tooltip: {
				supported: true
			}
		}
	};

	// Required: this call registers your extension with the chart engine
	tdgchart.extensionManager.register(config);

})();
