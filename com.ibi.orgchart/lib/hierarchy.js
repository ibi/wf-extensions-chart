/* jshint eqnull:true*/
/* globals d3*/

window.tdghierarchy = window.tdghierarchy || {};

window.tdghierarchy.init = (function () {

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

  function getColorScale (extent, colorRange) {
      var ratio = d3.scale.ordinal().domain(colorRange).rangePoints(extent, 0);

      var domain = colorRange.map(function (color) {
          return ratio(color);
      });

      return d3.scale.linear().domain(domain).range(colorRange);
  }

  function getClrLegendLayout (data, props, innerProps) {
      var pad = innerProps.pad;

      var titleText = props.buckets.value[0];

      var titleDim = props.measureLabel(titleText, props.colorLegend.title.font);

      var clrScale = getColorScale(data.domain, props.node.colorRange).nice();

      var ticksCount = typeof props.colorLegend.rows.count === 'number'
          ? props.colorLegend.rows.count
          : null;

      var extent = data.domain;

      var values = d3.scale.linear()
          .domain(extent)
          .nice()
          .ticks(ticksCount);

      var frmtCnfg = { min: extent[0], max: extent[1] };

      var lblsDims = values.map(function (lbl) {
          var lbl = props.formatNumber( lbl, props.colorLegend.rows.labels.format, frmtCnfg );
          return props.measureLabel(lbl, props.colorLegend.rows.label);
      });

      var lblsHorizSpace = d3.max(lblsDims, function(dim){ return dim.width; });

      var lgndVertSpace = Math.min(props.height, innerProps.colorLegend.maxHeight);

      var rowsTopOffset = titleDim.height + 2 * pad;

      var rowsVertSpace = lgndVertSpace - rowsTopOffset - pad;

      var rowsPosScale = d3.scale.ordinal()
          .domain(values)
          .rangeBands([rowsVertSpace, 0], 0);

      var band = rowsPosScale.rangeBand();

      var rows = values.map(function (value) {
          
          return {
              translate: [ pad, rowsTopOffset + rowsPosScale(value) ],
              marker: {
                  width: band,
                  height: band,
                  color: clrScale(value)
              },
              label: {
                  x: band + pad,
                  y: band / 2,
                  text: props.formatNumber(
                          value,
                          props.colorLegend.rows.labels.format,
                          frmtCnfg )
              }
          };
      });

      var lgndWidth = Math.max(band + lblsHorizSpace + 3 * pad, titleDim.width + 2 * pad);

      return {
          width: lgndWidth,
          height: lgndVertSpace,
          title: {
              text: titleText,
              translate: [lgndWidth / 2, pad + titleDim.height / 2]
          },
          rows: rows
      };
  }

  function renderLegend (group_legend, legendLayout, props) {
      var bg = group_legend
          .append('rect')
          .attr({
              width: legendLayout.width,
              height: legendLayout.height,
              rx: props.colorLegend.border.round,
              ry: props.colorLegend.border.round
          })
          .style({
              fill: props.colorLegend.background.color,
              stroke: props.colorLegend.border.color,
              'stroke-width': props.colorLegend.border.width
          });

      group_legend
          .append('g')
          .classed('title', true)
          .attr('transform', 'translate(' + legendLayout.title.translate + ')')
          .append('text')
          .attr('dy', '.35em')
          .style({
              font: props.colorLegend.title.font,
              fill: props.colorLegend.title.color,
              'text-anchor': 'middle'
          })
          .text(legendLayout.title.text);

      var group_rows = group_legend
          .append('g')
          .classed('rows', true);

      var rows = group_rows.selectAll('g.row')
          .data(legendLayout.rows);

      var rows_enter = rows.enter().append('g')
          .classed('row', true)
          .attr('transform', function (d) {
              return 'translate(' + d.translate + ')';
          });

      rows_enter.append('rect')
          .datum(function (d) {
              return d.marker;
          })
          .each(function (d) {
              d3.select(this).attr({
                  width: d.width,
                  height: d.height,
                  fill: d.color
              });
          });

      rows_enter.append('text')
          .datum(function (d) {
              return d.label;
          })
          .each(function (d) {
              d3.select(this).attr({
                  x: d.x,
                  y: d.y,
                  dy: '.35em'
              })
              .style({
                  font: props.colorLegend.rows.labels.font,
                  fill: props.colorLegend.rows.labels.color
              })
              .text(d.text);
          });
  }

  function getParentsHashStr (edges, label) {
    return edges.filter(function(e){ return e[1] === label; })
      .reduce(function (str, cur) {
        return str += cur[0];
      }, '');
  }

  function contrast (r, g, b) {
      var rgb = [ r/255, g/255, b/255 ];
      for ( var i = 0; i < rgb.length; ++i ) {
          if ( rgb[i] <= 0.03928 ) {
              rgb[i] = rgb[i] / 12.92;
          } else {
              rgb[i] = Math.pow( ( rgb[i] + 0.055 ) / 1.055, 2.4);
          }
      }
      var l = 0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2];
      return (l > 0.179) ? "#000" : "#FFF";
  }

  function getBGColorByParent ( edges, label ) {
    var prntHash = getParentsHashStr(data.edges, node.label);    
  }

  function getElementAttrsMaps ( graph, data, props ) {
    var maps = {
        labelToBGColor: {},
        labelToFontColor: {}
      };

    var hasDataDrivenColor = ( data.domain[0] !== Infinity && data.domain[1] !== -Infinity );

    var color = ( hasDataDrivenColor )
      ? getColorScale(data.domain, props.node.colorRange)
      : d3.scale.category20();

    var bgColor, rgb;

    graph.nodes().forEach(function(v) {
      var node = graph.node(v);

      if ( Array.isArray(data.edges) && data.edges.length ) {

        if (hasDataDrivenColor) {
          bgColor = color(data.nodeValueMap[node.label]);
        } else {
          bgColor = color(getParentsHashStr(data.edges, node.label));
        }

        maps.labelToBGColor[node.label] = bgColor;

        rgb = d3.rgb(bgColor);

        maps.labelToFontColor[node.label] = contrast(rgb.r, rgb.g, rgb.b);
      } else {
        bgColor = maps.labelToBGColor[node.label] = color(data.nodeValueMap[node.label]);
        rgb = d3.rgb(bgColor);
        maps.labelToFontColor[node.label] = contrast(rgb.r, rgb.g, rgb.b);
      }
    });

    return maps;
  }

  function centerGroup (groupBBox, width, height, scale) {

    // this is the original offset of zoomPanel with respect to svg contaner before it gets resized
    var originOffset = {
      x: 0,
      y: 0
    };

    // this the offset of the the zoomPanel with respect to svg contaner after it was resized
    originOffset.x = originOffset.x * scale;
    originOffset.y = originOffset.y * scale;

    // lengths of the zoomPanel after it was resized
    var finHorizLength = groupBBox.width * scale;
    var finVertLength = groupBBox.height * scale;

    var newCenter = {
      x:  originOffset.x + finHorizLength / 2,
      y: originOffset.y + finVertLength / 2
    };

    return [width / 2 - newCenter.x, height / 2 - newCenter.y];
  }

  function getInitScale (groupBBox, width, height) {
    var horiz_ratio = width / groupBBox.width;
    var vert_ratio = height / groupBBox.height;
    
    // we need to resize zoomPanel so that all the nodes are seen in the viewport 
    // for that we need to compare horizontal and vertical ratious and pick smallest number
    var init_scale = Math.min(horiz_ratio, vert_ratio);

    init_scale *= 0.8; // make scale even smaller so we have some extra space 
    return init_scale;
  }

	return function (user_props) {


    // helper functions ---------------------------------------------------
    


    function renderHierarchy (main_group, data, props) {
      // Create the input graph
      var graph = new dagreD3.graphlib.Graph()
        .setGraph({})
        .setDefaultEdgeLabel(function() { return {}; });


      data.nodes.forEach(function (nodeName) {
        graph.setNode(nodeName,  { label: nodeName, class: nodeName });
      });

      data.edges.forEach(function (edge) {
        graph.setEdge(edge[0], edge[1]);
      });

      maps = getElementAttrsMaps(graph, data, props);

      // Create the renderer
      var render = new dagreD3.render();

      // Run the renderer. This is what draws the final g.
      render(main_group, graph);

      var node_groups = main_group.selectAll('g.node');

      var frmtCnfg = {
        min: data.domain[0],
        max: data.domain[1]
      };

      node_groups
        .filter(function (d) {
          return data.nodeValueMap[d] != null;
        })
        .attr({
          'tdgtitle': function (d) {
            return '<div style="padding: 5px"><b>VALUE: </b>' + props.formatNumber(data.nodeValueMap[d], props.node.toolTip.format, frmtCnfg ) + '</div>';
          }
        });

      node_groups.selectAll('rect')
        .attr({
          'rx' : props.node.border.round,
          'ry' : props.node.border.round
        })
        .style({
          fill: function (d) {
            return maps.labelToBGColor[d];
          },
          stroke : props.node.border.color || 'grey',
          'stroke-width' : props.node.border.width || 5
        });

      node_groups.selectAll('text')
        .style({
          fill: function (d) {
            return maps.labelToFontColor[d];
          },
          font: props.node.label.font
        });

      function fade (opacity) {
        return function () {
          var that = this;
          node_groups.filter(function () {
            return that !== this;
          }).transition().style('opacity', opacity);
        };
      }

      node_groups.on('mouseover', fade(0.3) );
      node_groups.on('mouseout', fade(1) );

    }

    function getData () {
      var data = props.data,
        allNodes = [], allEdges = [], nodeValueMap = {},
        nodes;

      var uniqueEdgesMap = {};

      data.forEach(function (d) {
        if ( !Array.isArray(d.levels) ) {
          nodes = [d.levels];
        } else {
          nodes = d.levels.slice();
        }

        nodes.reduce(function (prev, cur) { // populate unique edges
          if ( typeof prev === 'string' && typeof cur === 'string' && !uniqueEdgesMap[prev+cur]) {
            uniqueEdgesMap[prev+cur] = true;
            allEdges.push([prev, cur]);
          }
          return cur;
        });

        nodes.forEach(function (node) {
          if ( typeof node === 'string' && allNodes.indexOf(node) < 0 ) {
            allNodes.push(node);
          }
        });

        if (d.value != null) {
          nodes.forEach(function (node) {
            if (nodeValueMap[node] == null) {
              nodeValueMap[node] = 0;
            }
            nodeValueMap[node] += d.value;
          });
          //nodeValueMap[nodes[nodes.length - 1]] = d.value;
        }

      });

      var domain = [Infinity, -Infinity];

      for (var key in nodeValueMap) {
        if (nodeValueMap.hasOwnProperty(key)) {
          if ( nodeValueMap[key] < domain[0] ) {
            domain[0] = nodeValueMap[key];
          }
          if ( nodeValueMap[key] > domain[1] ) {
            domain[1] = nodeValueMap[key];
          }
        }
      }

      return {
        nodes : allNodes,
        edges : allEdges,
        nodeValueMap: nodeValueMap,
        domain: domain
      };
    }

    function enableZoom (eventContainer, zoomContainer, props) {
      eventContainer.insert('rect', ':first-child')
        .classed('event-background', true)
        .attr({
          width: props.width,
          height: props.height
        })
        .style({
          fill: 'none',
          'pointer-events': 'all'
        });

      var groupBBox = zoomContainer.node().getBBox();

      var initScale = getInitScale(groupBBox, props.width, props.height);
      var initTranslate = centerGroup(groupBBox, props.width, props.height, initScale);

      zoomContainer.attr('transform', 'translate(' + initTranslate + ') scale(' + initScale + ')');

      var zoom = d3.behavior.zoom()
        .scale(initScale)
        .translate(initTranslate)
        .scaleExtent([initScale, initScale + 5])
        .on('zoom', function () {
          zoomContainer.attr(
            'transform',
            'translate(' + d3.event.translate + ')' + ' scale(' + d3.event.scale + ')'
          );
        });

        eventContainer.call(zoom);
    }
    // helper functions end -----------------------------------------------


    // functions declared here will have access to props and innerProps object
		var props = {
			width: 300,
			height: 400,
      node : {
        colorRange: ["red", "yellow", "green"],
        label: {
          font : "14px serif"
        },
        border: {
          width: 1,
          color: "grey",
          round: 5
        },
        toolTip: {
          format : "auto"
        }
      },

			data: null,
      buckets: null,

      measureLabel: null,
      formatNumber: null,

      colorLegend: {
          enabled: true,
          background: {
              color: 'white'
          },
          border: {
              color: 'black',
              width: 1,
              round: 2
          },
          title: {
              font: '16px serif',
              color: 'black'
          },
          rows: {
              count: 'auto',
              labels: {
                  font: '10px serif',
                  color: 'black',
                  format: 'auto'
              }
          }
      }

		};

    var innerProps = {
        pad: 5,
        colorLegend: {
            maxHeight: 200
        }
    };

		copyIfExisty(props, user_props || {});

		function createAccessor (attr) {
			function accessor (value) {
				if (!arguments.length) { return props[attr]; }
				props[attr] = value;
				return chart;
			}
			return accessor;
		}

		function chart (selection) {

      var hasClrLegend = props.buckets && Array.isArray(props.buckets.value) && props.buckets.value.length;

      var data = getData();

      var group_main = selection.append('g').classed('group-main', true);

      renderHierarchy(group_main, data, props);

      enableZoom(selection, group_main, props);
      
      if (hasClrLegend) {
        // render color legend
        var legendLayout = getClrLegendLayout(data, props, innerProps);

        legendLayout.x = props.width - legendLayout.width - innerProps.pad;
        legendLayout.y = ( props.height - legendLayout.height ) / 2;

        var group_legend = selection.append('g').classed('group-legend', true)
          .attr('transform', 'translate(' + [ legendLayout.x, legendLayout.y ] + ')');

        renderLegend (group_legend, legendLayout, props);
        // render color legend ends
      }

		}

		for (var attr in props) {
			if ((!chart[attr]) && (props.hasOwnProperty(attr))) {
				chart[attr] = createAccessor(attr);
			}
		}

		return chart;
	};
})();