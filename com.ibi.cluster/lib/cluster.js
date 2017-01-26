/* jshint eqnull:true*/
/* globals d3*/

var tdg_cluster = (function() {

    function copyIfExisty(src, trgt) {
        each(src, function(attr, key) {
            if (isObject(attr) && isObject(trgt[key])) {
                copyIfExisty(attr, trgt[key]);
            } else if (trgt[key] != null && !isObject(src[key])) {
                src[key] = trgt[key];
            }
        });
    }

    function isObject(o) {
        return o && o.constructor === Object;
    }

    function each(obj, cb) {
        if (Array.isArray(obj)) {
            for (var i = 0; i < obj.length; i++) {
                cb(obj[i], i, obj);
            }
            obj.forEach(cb);
        } else if (isObject(obj)) {
            for (var key in obj) {
                if (obj.hasOwnProperty(key)) {
                    cb(obj[key], key, obj);
                }
            }
        }
    }
    // this function adds depth, siblingIdx, and a unique id
    function augmentTreeObj ( root ) {
      (function iterate( node, depth, path ) {
        node.depth = depth;

        node.id = path;
        
        if ( !Array.isArray( node.children ) ) {
          node.height = 1;
        } else {
          var height = d3.max( node.children , function( child, idx ){
            child.siblingIdx = idx;
            return iterate(child, depth + 1, node.id + '->' + child.name + idx); 
          });
          
          node.height = height + 1;
        }
        return node.height; 
      })(root, 0, root.name || '');

      return root;
    }

//    function triggerChildrenCollapsAtPosition ( root, depth, siblingIdx ) {
//      function toggleCollapse(node) {
//        if ( Array.isArray(node.children) ) {
//          node._children = node.children;
//          node.children = null;
//        } else if ( Array.isArray(node._children) ) {
//          node.children = node._children;
//          node._children = null;
//        }
//      }
//      
//      if ( depth === 0 ) {
//        toggleCollapse(root); 
//      }
//
//      (function iterate( node ){
//        if ( ( node.depth === depth ) && ( node.siblingIdx === siblingIdx ) ) {
//          toggleCollapse(node);
//          return true;
//        } else if ( Array.isArray(node.children) ) {
//          return node.children.some(function( child, idx ){
//            return iterate(child, depth + 1); 
//          });
//        }
//      })(root);
//
//      return root; 
//    }

    function triggerChildrenCollapsForNodeWithId ( root, id ) {
      function toggleCollapse(node) {
        if ( Array.isArray(node.children) ) {
          node._children = node.children;
          node.children = null;
        } else if ( Array.isArray(node._children) ) {
          node.children = node._children;
          node._children = null;
        }
      }
      
//      if ( depth === 0 ) {
//        toggleCollapse(root); 
//      }

      (function iterate( node ){
        if ( node.id === id ) {
          toggleCollapse(node);
          return true;
        } else if ( Array.isArray(node.children) ) {
          return node.children.some(function( child, idx ){
            return iterate(child); 
          });
        }
      })(root);

      return root; 
    }

    function getHierarchyObj ( data ) {
      var res = [], roots = [];
      data.forEach(function (d) {
        var root,
          levels = Array.isArray(d.levels) ? d.levels : [d.levels],
          idx = roots.indexOf(levels[0]);

        if ( idx >= 0 ) {
          root = res[idx];
        } else {
          root = {};
          res.push(root);
          roots.push(levels[0]);
        }

        (function iterate (obj, val, path, pathIdx, pathLength) {
          obj.name = path[pathIdx];
          if ( pathIdx < pathLength ) {
            if ( !Array.isArray(obj.children) ) {
              obj.children = [];
            }

            var child = {
              children: null,
              childIndex: null
            };

            iterate( child, val, path, pathIdx + 1, pathLength );

            var existingChild = obj.children
              .filter(function(node){ return node.name === child.name; })[0];

            if ( existingChild && existingChild.children ) { // if already have a child with the same name, merge their children
              existingChild.children = existingChild.children.concat(child.children);
            } else if ( !existingChild ) { // new child
              child.childIndex = obj.children.length;
              obj.children[obj.children.length] = child;
            }

          }
        })(
          root,
          d.value,
          levels,
          0,
          levels.length - 1
        );

      });
      
      var tree = ( res.length > 1 )
        ? { children: res }
        : res[0];
    
      augmentTreeObj(tree); 

      return tree;
    }

    function radialProject( angScale ) {
//      var angScale = d3.scale
//          .linear()
//          .domain(xDomain)
//          .range([0, 2 * Math.PI]);

      return function ( x, y ) {
        var angle = angScale(x),
            radius = y;

        return [radius * Math.cos(angle), radius * Math.sin(angle)];
      }
    }

    function radialProjectDiagonal( d ) {
      return "M" + d.pos0
        + "C" + d.pos1
        + " " + d.pos2
        + " " + d.pos3;
    }

    function getNodeTooltip ( label ) {
      if ( !label || !label.length ) return;
      var str = '<div style="padding: 5px">';
      str += '<span><b>label: </b>' + label + '</span>';
      return str + '</div>';
    }

    function buildLayout( root, props, innerProps ) {

      //props.isRadial = true;

      var isRadial = props.isRadial;

      var lblPad = innerProps.labelsPad;

      var cluster = d3.layout.cluster()
        .size([ props.height, props.width ]);

      var nodes = cluster( root );

       // I will not be able to support automatic label rescale
       // because props.measureLabel doesn't take rescale factor 
      var deepestLeafNodes = nodes.filter(function( node ){
        return ( node.depth + 1 ) === root.height; 
      });

      var leafNodesLargestLblWidth = d3.max(deepestLeafNodes, function ( node ){
        return props.measureLabel( node.name, props.nodes.labels.font ).width; 
      });

      var rightOffset = leafNodesLargestLblWidth + props.nodes.size;

      var rootLabelWidth = props.measureLabel(root.name || '', props.nodes.labels.font).width;

      var leftOffset = isRadial
        ? 0
        : rootLabelWidth + props.nodes.size;
      
      var grapthGrowLength = isRadial
        ? Math.min(props.width, props.height) / 2
        : props.width;

      var nodesAreaWidth = grapthGrowLength
        - rightOffset
        - leftOffset;

      var levelOffset = Math.min(
        nodesAreaWidth / ( root.height - 1 ),
        props.nodes.maxLevelOffset
      );
      
      nodes.forEach(function( node ){
        var tmp = node.x;
        // need to swap x and y, because graph need to grow right and not down
        node.x = leftOffset + node.depth * levelOffset;
        node.y = tmp;
      });

      var links = cluster.links(nodes);
      
      if ( isRadial ) {

        var xDomain = [0, props.height];

        var angScale = d3.scale
            .linear()
            .domain(xDomain)
            .range([0, 2 * Math.PI]);

        var project = radialProject(angScale);

        links = links.map(function( link ) {
          return {
            id: link.source.id + '->' + link.target.id,
            pos0: project(link.source.y, link.source.x),
            pos1: project(link.source.y, ( link.source.x + link.target.x ) / 2),
            pos2: project(link.target.y, ( link.source.x + link.target.x ) / 2),
            pos3: project(link.target.y, link.target.x)
          };
        });

        nodes.forEach(function( node ){
          var pheta = angScale( node.y );

          var isLeftHemiSphere = ( pheta > Math.PI / 2 )
            && ( pheta <= 3 * Math.PI / 2 );

          var lblRotate = isLeftHemiSphere
            ? pheta - Math.PI
            : pheta;

          lblRotate = lblRotate * 180 / Math.PI;

          node.label = {
            text: node.name,
            x: isLeftHemiSphere === !node.children
              ? -( lblPad + props.nodes.size )// needs to be node radius
              : lblPad + props.nodes.size,

            anchor: isLeftHemiSphere === !node.children
              ? "end"
              : "start",

            transform: "rotate(" + lblRotate + ")" 
          };

          // graph grows along x axis
          var proj = project( node.y, node.x );
          node.x = proj[0];
          node.y = proj[1];
        });
      } else {
        nodes.forEach(function( node ){
          node.label = {
            text: node.name,
            x: !!node.children
              ? -( lblPad + props.nodes.size )// needs to be node radius
              : lblPad + props.nodes.size,

            anchor: !!node.children
              ? "end"
              : "start"
          }; 
        });

        links = links.map(function( link ) {
          return {
            id: link.source.id + '->' + link.target.id,
            pos0: [link.source.x, link.source.y],
            pos1: [( link.source.x + link.target.x ) * .5, link.source.y ],
            pos2: [( link.source.x + link.target.x ) * .5, link.target.y, ],
            pos3: [link.target.x, link.target.y]
          };
        });

      }

      return {
        labelsOffset: lblPad + props.nodes.size,
        nodeGroups: {
          xDomain: xDomain,
          pos: ( isRadial )
            ? [props.width / 2, props.height / 2]
            : [0, 0],

          nodes: nodes.map(function( node ){
            return {
              pos: [node.x, node.y],
              node: {
                id: node.id,
                clickable: !!node.children || !!node._children,
                tooltip: getNodeTooltip( node.label.text ),
                color: ( !!node._children )
                  ? props.nodes.colors.notEmpty
                  : props.nodes.colors.empty,

                size: props.nodes.size,
                depth: node.depth,
                siblingIdx: node.siblingIdx
              },
              label: node.label
            };
          })
        },

        links: links
      };
    }

    function opacityTransition ( els, opacity ) {
      els.transition('notHover')
        .style('opacity', opacity);
    }

    function buildAndRenderLayout( group_main, root, props, innerProps ) {
      var layout = buildLayout( root, props, innerProps );

      var components = render( group_main, layout, props );
      
//      var circles = components.nodeGroups
//          .select('circle');

      components.nodeGroups
        .on('click', null); // remove all of the click listeners if there are any

      components.nodeGroups
        .on('click', function( nodeGroup ) {
          // modify root (tree) object in place
          triggerChildrenCollapsForNodeWithId( root, nodeGroup.node.id );
          buildAndRenderLayout( group_main, root, props, innerProps );
        });

      components.nodeGroups
        .on('mouseover', null);

      components.nodeGroups
        .on('mouseout', null);

      var notHovered = components.nodeGroups;

      components.nodeGroups
        .on('mouseover', function( hoverNodeGroup ){
          notHovered = components.nodeGroups
            .filter(function( nodeGroup ){
              return nodeGroup !== hoverNodeGroup;
            });

          opacityTransition(notHovered, 0.1);
          opacityTransition(components.links, 0.1);
        });

      components.nodeGroups
        .on('mouseout', function( nodeGroup ) {
          if ( notHovered ) {
            opacityTransition(notHovered, 1);
            opacityTransition(components.links, 1);
          }
        });
    }

    function render( group, layout, props ) {
      var isRadial = props.isRadial;

      var linksGroup = group.select('g.links') 
      
      linksGroup = ( linksGroup.empty() )
        ? group
            .append('g')
            .classed('links', true)
            .attr(
              'transform',
              'translate(' + layout.nodeGroups.pos + ')'
            )

        : linksGroup; 

      var diagonal = d3.svg.diagonal();
      
      if ( !isRadial ) {
        diagonal.projection(function(d) { 
          return [d.x, d.y];
        }); 
      }

      var links = linksGroup
        .selectAll('path.link')
        .data(layout.links, function( link ){
          return link.id;
        });

      var linksEnter = links
        .enter()
        .append('path')
        .classed('link', true)
        .style({
          'stroke-width': props.links.width,
          'stroke': props.links.color
        });

      links
        .attr('d', radialProjectDiagonal);

      var linksExit = links
        .exit()
        .remove();
     
      var nodeGroupsGroup = group.select('g.nodes') 
      
      nodeGroupsGroup = ( nodeGroupsGroup.empty() )
        ? group
            .append('g')
            .classed('nodes', true)
            .attr(
              'transform',
              'translate(' + layout.nodeGroups.pos + ')'
            )

        : nodeGroupsGroup; 

      var nodeGroups = nodeGroupsGroup
        .selectAll('g.node')
        .data(layout.nodeGroups.nodes, function( nodeGroup ){
          return nodeGroup.node.id; 
        });

      var nodeGroupsEnter = nodeGroups.enter()
        .append('g')
        .classed('node', true);

      nodeGroups.attr('transform', function(group) {
        return 'translate(' + group.pos  + ')';
      });

      nodeGroupsEnter.append('circle')
        .datum(function(group){
          return group.node; 
        })
        .attr({
          r: function ( node ) { return node.size; },
          tdgtitle: function ( node ) {
            return node.tooltip;
          }
        })
        .style({
          'stroke-width': props.nodes.border.width,
          'stroke': props.nodes.border.color
        });

      nodeGroups.select('circle')
        .datum(function(group){
          return group.node; 
        })
        .style('cursor', function(node){
          return node.clickable
            ? 'pointer'
            : 'default';
        })
        .attr('fill', function(node) { return node.color; });

      nodeGroupsEnter.append('text')
        .datum(function(group){
          return group.label; 
        })
        .style({
          'pointer-events': 'none',
          cursor: 'default',
          font: props.nodes.labels.font,
          fill: props.nodes.labels.color
        })
        .text(function(lbl) {
          return lbl.text; 
        });

      nodeGroups.select('text')
        .datum(function(group){
          return group.label; 
        })
        .attr({
          fill: 'black',
          'text-anchor': function (lbl) {
            return lbl.anchor; 
          },
          transform: function (lbl) {
            return lbl.transform;
            //return 'scale(' + lbl.rescale + ')';
          },
          x: function (lbl) {
            return lbl.x;
          },
          dy: '.35em'
        });

      var nodeGroupsExit = nodeGroups
        .exit()
        .remove();

      return {
        nodeGroups:  nodeGroupsGroup.selectAll('g.node'),
        links: linksGroup.selectAll('path.link')
      };
    }

    function hover ( opacity, rects ) {
        return function () {
            var that = this;
            rects.filter(function () {
                return this !== that;
            }).transition().style('opacity', function () {
                return opacity;
            });
        };
    }

    function addInteractions ( components ) {
        components.rects.on('mouseover', hover(0.3, components.rects));
        components.rects.on('mouseout', hover(1, components.rects));
    }

    function getOnAllTransitionComplete ( cb ) {
        return function ( transition ) {
            var count = transition.size();
            transition.each('end', function () {
                if ( !(--count && typeof cb === 'function') ) cb();
            });
        };
    }

    function getInvokeAfter (cb, count) {
        if (!count && typeof cb === 'function' ) cb();

        return function () {
            if (!(--count) && typeof cb === 'function') cb();
        };
    }

    // --------------------------------- PUT HERE ALL THE GLOBAL VARIABLES AND FUNCTIONS THAT DON'T NEED TO ACCESS PROPS AND INNERPROPS THROUGH SCOPE (Z1)



    // --------------------------------- END OF Z1
    return function(user_props) {
        var props = {
            width: 300,
            height: 400,
            data: null,
            buckets: null,
            measureLabel: null, // function
            formatNumber: null, // function
            isRadial: false,
            nodes: {
              size: 5,
              maxLevelOffset: 180,
              colors: {
                empty: 'white',
                notEmpty: 'lightblue'
              },
              border: {
                width: 1,
                color: 'blue'
              },
              labels: {
                color: 'black',
                font: '12px serif'
              }
            },
            links: {
              color: 'lightgrey',
              width: 1
            }
        };

        var innerProps = {
            labelsPad: 5
        };

        // ---------------------------------- INTERNAL FUNCTIONS THAT NEED ACCESS TO PROPS AND INNERPROPS THROUGH SCOPE GO HERE (Z2)

        // ---------------------------------- END OF Z2
        copyIfExisty(props, user_props || {});

        function createAccessor(attr) {
            function accessor(value) {
                if (!arguments.length) {
                    return props[attr];
                }
                props[attr] = value;
                return chart;
            }
            return accessor;
        }

        function chart(selection) {
          var group_main = selection
            .append('g')
            .classed('group-main', true);
          
          var cleanData = props.data.filter(function(d) {
            return d.levels != null; 
          })
          .map(function(d) {
            return {
              levels: Array.isArray(d.levels) ? d.levels : [d.levels] 
            };
          }); 

          var initialRoot = getHierarchyObj( cleanData );

          buildAndRenderLayout( group_main, initialRoot, props, innerProps );

//          var layout = buildLayout( root, props, innerProps );
//
//          var components = render( group_main, layout, props );

//          components.nodes.on('click', function( node ) {
//             triggerChildrenCollapsAtPosition(root, node.depth - 1, node.siblingIdx);
//          })


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
