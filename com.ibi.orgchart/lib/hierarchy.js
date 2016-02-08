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

	return function (user_props) {
    // helper functions ---------------------------------------------------
    function renderHierarchy (main_group) {
      var data = getData();
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

      graph.nodes().forEach(function(v) {
        var node = graph.node(v);
        // Round the corners of the nodes
        node.rx = node.ry = 5;
      });

      // Create the renderer
      var render = new dagreD3.render();

      // Run the renderer. This is what draws the final g.
      render(main_group, graph);

      var node_groups = main_group.selectAll('g.node')
        .filter(function (d) {
          return data.nodeValueMap[d] != null;
        })
        .attr({
          'tdgtitle': function (d) {
            return '<div style="padding: 5px"><b>VALUE: </b>' + data.nodeValueMap[d] + '</div>';
          }
        });
      debugger;

      var colorScale = d3.scale.linear().domain(data.domain).range(props.colorRange);

      node_groups.selectAll('rect')
        .style({
          stroke: function (d) {
            return colorScale(data.nodeValueMap[d]);
          }
        });

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

    function enableZoom (eventContainer, zoomContainer) {
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

      var zoom = d3.behavior.zoom()
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
      colorRange: ['#ff0000', '#008000'],
			data: null
		};

    var innerProps = {
      
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
      var group_main = selection.append('g').classed('group-main', true);
      enableZoom(selection, group_main);
      renderHierarchy(group_main);
		}

		for (var attr in props) {
			if ((!chart[attr]) && (props.hasOwnProperty(attr))) {
				chart[attr] = createAccessor(attr);
			}
		}

		return chart;
	};
})();