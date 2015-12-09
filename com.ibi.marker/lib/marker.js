/* jshint eqnull:true, laxbreak:true*/
/* globals d3*/

var tdg_marker = (function () {

  // this function only copies attributes values if it is present on src and it's not null or undefined on trgt
  function copyIfExisty (src, trgt) {
    each(src, function (attr, key) {
      if ( isObject(attr) && isObject(trgt[key]) ) {
        copyIfExisty(attr, trgt[key]);
      } else if (trgt[key] != null && !isObject(src[key])) {
        src[key] = trgt[key];
      }
    });
  }

  function isObject (o) {
    return o && o.constructor === Object;
  }

  function each (obj, cb) {
    if ( Array.isArray(obj) ) {
      for (var i = 0; i < obj.length; i++) {
        cb(obj[i], i, obj);
      }
      obj.forEach(cb);
    } else if ( isObject(obj) ) {
      for (var key in obj) {
        if ( obj.hasOwnProperty(key) ) {
          cb(obj[key], key, obj);
        }
      }
    }
  }

  var pathMarker = {
    star: getStarMarker,
    square: getSquire,
    circle: getCircle
  }

  function getStarMarker (r) {
    var t36 = 0.7265, t72 = 3.0777, c72 = 0.309, s72 = 0.951, c36 = 0.809, s36 = 0.588;
    var h = r, b = h / 3.236, hp = b / c36;
    return "M0," + -h
      + "L" + (b*t36) + "," + -b 
      + "L" + (b*t72) + "," + -b 
      + "L" + (hp*s72) + "," + (hp*c72)
      + "L" + (h*s36) + "," + (h*c36)
      + "L0," + hp 
      + "L" + -(h*s36) + "," + (h*c36)
      + "L" + -(hp*s72) + "," + (hp*c72)
      + "L" + -(b*t72) + "," + -b 
      + "L" + -(b*t36) + "," + -b 
      + "Z";
  }

  function getCircle (r) {
    return "M0,0" + " m" + -r + ',0' + 'a' + [r, r] + ' 0 1, 0 ' + (r * 2) + ',0' + 'a' + [r, r] + ' 0 1, 0 ' + (-r * 2) + ',0';
  }

  function getSquire (r) {
    return "M" + -r + "," + -r
      + "L" + r + "," + -r
      + " " + r + "," + r
      + " " + -r + "," + r
      + "Z";
  }

  function addGroupGroup (mainGroup, className) {
    return mainGroup.append('g')
      .classed(className, true);
  }

  function renderMarkers (markers, markerType) {
    markers.enter()
      .append('path')
      .classed('marker', true)
      .attr({
        transform: function (d) {
          return 'translate(' + [d.x, d.y] + ')';
        }
      })
      .style({
        fill: function (d) {
          return d.color;
        }
      });

    markers.transition()
      .delay(function (d, i) {
        return ( d.r + d.c ) * 8;
      })
      .duration(1000)
      .ease('elastic')
      .attrTween('d', function (d) {
        var range = d3.interpolate(0, d.radius);
        return function (t) {
          return pathMarker[markerType || 'circle'](range(t));
        }
      })
  }

	return function (user_props) {
    // here we put all the function that need to access props or innerProps objects
		var props = {
			width: 300,
			height: 400,
			data: null,
      markerSize: 8,
      selectedColor: '#ff7272',
      disselectedColor: '#83c1fc',
      markerType: 'circle',
      label: {
        enabled: true,
        format: '%', // this format string will be passed to d3.format function
        ratio: 0.3,
        fontFamily: 'sans-serif',
        color: '#ff7272'
      }
		};

    var innerProps = {
      verticalPadding: 5,
      horizontalPadding: 5
    };
	
	function fixValue (val) {
		return val / 100;
	}
	
    function getMarkerData (value, width) {
	  value = fixValue(value);
	
      width = width - 2 * innerProps.horizontalPadding;
      var height = props.height - 2 * innerProps.verticalPadding;

      if ( props.markerSize === 'auto' ) {
        props.markerSize = Math.min(width, height) * 0.03;
      }

      if ( isNaN(props.markerSize) ) {
        throw new Error('props.markerSize must be a number');
      }

      var markerPadding = Math.ceil(props.markerSize * 0.4),
        blockSize = props.markerSize + markerPadding,
        rowsCount = Math.floor(height / blockSize),
        colsCount = Math.floor(width / blockSize),
        coloredMarkersCount = Math.floor(value * ( rowsCount * colsCount )),
        r, c,
        coloredSoFar = 0,
        radius = props.markerSize / 2,
        data = [];

      for ( r = 0; r < rowsCount; r++ ) {
          for ( c = 0; c < colsCount; c++ ) {
            data.push({
              color: (coloredSoFar++ < coloredMarkersCount) ? props.selectedColor : props.disselectedColor,
              x: c * blockSize + markerPadding,
              y: r * blockSize + markerPadding,
              r: r,
              c: c,
              radius: radius
            });
          }
        }
      

      data.markersGroupDim = {
        width: colsCount * blockSize,
        height: rowsCount * blockSize
      };

      return data;
    }

    function renderLabel (labelGroup, width, horizontalMarkerGroupPadding) {

      width = width - innerProps.horizontalPadding * 2;
      var height = props.height - innerProps.verticalPadding * 2;

      var label = labelGroup.selectAll('text.label')
          .data([fixValue(props.data[0].value)]);

      label.enter()
          .append('text')
          .classed('label', true)
          .style({
            'font-family': props.label.fontFamily,
            'fill': props.label.color,
            opacity: 0
          })
          .text(function (d) {
            return d3.format(props.label.format)(d);
          });

      var lblNode = label.node();
      var lblNodeDim = lblNode.getBBox();
      var scale = 1;

      if ( width < height ) {
        scale = width / lblNodeDim.width;
      } else {
        scale = height / lblNodeDim.width;
      }

      label
        .attr('transform', 'scale(' + scale + ')')
        .transition()        
        .duration(1000)
        .style('opacity', 1);
      
      lblNodeDim = lblNode.getBoundingClientRect();

      labelGroup.attr('transform', 'translate(' + [ (width - lblNodeDim.width) / 2 + horizontalMarkerGroupPadding, height - innerProps.verticalPadding] + ')');
    }

		copyIfExisty(props, user_props || {});

		function createAccessor (attr) {
			function accessor (value) {
				if (!arguments.length) { return props[attr]; }
				props[attr] = value;
				return chart;
			}
			return accessor;
		}

    function getLabelRatio () {
      var ratio = props.label.ratio;
      if (ratio != null && !isNaN(ratio) && ratio > 0 && ratio <= 1) {
        return ratio;
      } else {
        console.warn('props.label.ration: wrong format. Automaticaly set to 0.3');
        return 0.3
      }
    }

		function chart (selection) {
      var mainGroup = selection.append('g').classed('group-main', true);

      var labelWidth = 0;

      if ( props.label.enabled ) {
        labelWidth = props.width * getLabelRatio();
      }

      //var labelWidth = ( props.label.enabled ) ? props.width * 0.3 : 0;

      if ( !props.data[0] || props.data[0].value == null || isNaN(props.data[0].value) ) {
        throw new Error('Wrong data set format');
      }

      var markersGroup = addGroupGroup(mainGroup, 'group-markers');
      var labelGroup = addGroupGroup(mainGroup, 'group-label');

      // -------------- MARKERS RENDERING LOGIC STARTS
      var markerData = getMarkerData(props.data[0].value, props.width - labelWidth);

      var markers = markersGroup.selectAll('path.marker')
        .data(markerData);

      renderMarkers(markers, props.markerType);

      var verticalMarkerGroupPadding = ( props.height - markerData.markersGroupDim.height ) / 2,
        horizontalMarkerGroupPadding = ( props.width - labelWidth - markerData.markersGroupDim.width ) / 2;

      markersGroup.attr('transform', 'translate(' + [labelWidth + horizontalMarkerGroupPadding, verticalMarkerGroupPadding] + ')');
      // -------------- MARKERS RENDERING LOGIC ENDS
      
      // -------------- LABEL RENDERING LOGIC STARTS
      if ( props.label.enabled ) {
        renderLabel(labelGroup, labelWidth, horizontalMarkerGroupPadding);
      }
      // -------------- LABEL RENDERING LOGIC ENDS
		}

		for (var attr in props) {
			if ((!chart[attr]) && (props.hasOwnProperty(attr))) {
				chart[attr] = createAccessor(attr);
			}
		}

		/* start-test-block */
		
		/* end-test-block */

		return chart;
	};
})();