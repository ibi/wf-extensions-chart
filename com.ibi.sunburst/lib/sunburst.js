/* jshint eqnull:true*/
/* globals d3*/

var tdg_sunburst = (function () {

  function copyIfExisty(src, trgt) {
    each(src, function (attr, key) {
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

  function getOnAllTransitionComplete(cb) {
    return function (transition) {
      var count = transition.size();
      transition.on('end', function () {
        if (!(--count && typeof cb === 'function')) cb();
      });
    };
  }

  function getInvokeAfter(cb, count) {
    if (!count && typeof cb === 'function') cb();

    return function () {
      if (!(--count) && typeof cb === 'function') cb();
    };
  }

  function getHierarchyObj(data) {
    var res = [], roots = [];
    data.forEach(function (d, i) { //CHART-3304 adds i for offset
      var root,
        levels = Array.isArray(d.levels) ? d.levels : [d.levels],
        idx = roots.indexOf(levels[0]);
      if (idx >= 0) {
        root = res[idx];
      } else {
        root = {};
        res.push(root);
        roots.push(levels[0]);
      }

      (function iterate(obj, val, offset, path, idx, len) {
        obj.name = path[idx];
        if (idx < len) {
          if (!Array.isArray(obj.children)) {
            obj.children = [];
          }
          var child = {};
          iterate(child, val, offset, path, idx + 1, len); //CHART-3304

          var existingChild = obj.children
            .filter(function (node) { return node.name === child.name; })[0];

          if (existingChild && existingChild.children) { // if already have a child with the same name, merge their children
            existingChild.children = existingChild.children.concat(child.children);
          } else if (!existingChild) { // new child
            obj.children.push(child);
          }
        } else {
          obj.size = val;
          obj.offset = offset;  //CHART-3304
        }
      })(
        root, d.value, i,      //CHART-3304 adds i
        Array.isArray(d.levels) ? d.levels : [d.levels],
        0, levels.length - 1
      );

    });

    return res;
  }

  function getDataHelper(data) {
    var allNodes = [], allEdges = [], nodeValueMap = {},
      nodes;

    var uniqueEdgesMap = {};

    data.forEach(function (d) {
      if (!Array.isArray(d.levels)) {
        nodes = [d.levels];
      } else {
        nodes = d.levels.slice();
      }

      nodes.reduce(function (prev, cur) { // populate unique edges
        if (typeof prev === 'string' && typeof cur === 'string' && !uniqueEdgesMap[prev + cur]) {
          uniqueEdgesMap[prev + cur] = true;
          allEdges.push([prev, cur]);
        }
        return cur;
      });

      nodes.forEach(function (node) {
        if (typeof node === 'string' && allNodes.indexOf(node) < 0) {
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
      }

    });

    var domain = [Infinity, -Infinity];

    for (var key in nodeValueMap) {
      if (nodeValueMap.hasOwnProperty(key)) {
        if (nodeValueMap[key] < domain[0]) {
          domain[0] = nodeValueMap[key];
        }
        if (nodeValueMap[key] > domain[1]) {
          domain[1] = nodeValueMap[key];
        }
      }
    }

    return {
      nodes: allNodes,
      edges: allEdges,
      nodeValueMap: nodeValueMap,
      domain: domain
    };
  }

  // converts moonbeam hierarchical dataset into the one that d3.layout.partition requires
  function getFixedDataSet(data, fakeRootName) {
    var roots, root;
    if (!Array.isArray(data)) {
      return;
    }

    var hierarchy = getHierarchyObj(data);

    /* Logic prior to CHART-2425 
      if ( hierarchy.length > 1 ) {
        return {
          name: fakeRootName,
          children: hierarchy
        };
      } else {
        return hierarchy[0];
      }
    */

    return {				//CHART-2425...always create a fakeRootName to handle single element charts
      name: fakeRootName,
      children: hierarchy
    };

  }

  return function (user_props) {
    // functions declared here will have access to props and innerProps object
    var props = {
      width: 300,
      height: 400,
      data: null,
      formatNumber: null,
      isInteractionDisabled: false,
      //Begin CHART-3304
      chart: null,   //member referencing chart that will be used with new tooltip logic
      //End CHART-3304
      onRenderComplete: function () { },
      customColors: false,   //VIZ-70	
      node: {
        colors: ["#4087b8", "#e31a1c", "#9ebcda", "#c994c7", "#41b6c4", "#49006a", "#ec7014", "#a6bddb", "#67001f", "#800026", "#addd8e", "#e0ecf4", "#fcc5c0", "#238b45", "#081d58", "#d4b9da", "#2b8cbe", "#74a9cf", "#41ab5d", "#fed976", "#ce1256", "#7f0000", "#a6bddb", "#ffffcc", "#e7e1ef", "#016c59", "#f7fcfd", "#99d8c9", "#fff7fb", "#ffffe5", "#fdd49e", "#ffffd9", "#fe9929", "#8c96c6", "#810f7c", "#993404", "#c7e9b4", "#bfd3e6", "#e7298a", "#7fcdbb", "#3690c0", "#ae017e", "#d9f0a3", "#ece2f0", "#014636", "#f7fcb9", "#66c2a4", "#fff7bc", "#f7fcf0", "#e5f5f9", "#fdbb84", "#fa9fb5", "#4d004b", "#fff7fb", "#cc4c02", "#78c679", "#1d91c0", "#ccebc5", "#feb24c", "#b30000", "#8c6bb1", "#fec44f", "#d0d1e6", "#084081", "#0868ac", "#f7fcfd", "#0570b0", "#ef6548", "#fff7ec", "#006837", "#f768a1", "#edf8b1", "#fee391", "#238443", "#ffffe5", "#023858", "#7a0177", "#67a9cf", "#dd3497", "#980043", "#88419d", "#d0d1e6", "#fc8d59", "#4eb3d3", "#fd8d3c", "#fff7f3", "#fc4e2a", "#ccece6", "#ece7f2", "#a8ddb5", "#41ae76", "#bd0026", "#e0f3db", "#045a8d", "#ffeda0", "#253494", "#7bccc4", "#fde0dd", "#00441b", "#225ea8", "#006d2c", "#02818a", "#f7f4f9", "#d7301f", "#df65b0", "#662506", "#3690c0", "#004529", "#fee8c8"],
        colorBy: 'evenodd', // 'parent', 'node', 'evenodd'
        border: {
          color: 'white',
          width: 2
        }
      },
      toolTip: {
        enabled: true,
        valueFormat: 'auto',
        elements: [
          {
            name: 'name'
          },
          {
            name: 'value',
            format: 'd'
          },
          {
            name: 'ratio',
            format: '%',
            hideForRoot: true
          }
        ]
      }
    };

    var innerProps = {
      radiusRatio: 0.95,
      fakeRootName: '<__FaKe_rOOt__>'
    };

    copyIfExisty(props, user_props || {});

    function createAccessor(attr) {
      function accessor(value) {
        if (!arguments.length) { return props[attr]; }
        props[attr] = value;
        return chart;
      }
      return accessor;
    }

    function getData() {
      return props.data;
    }

    function getRandomInRange(start, end) {
      var r = end - start;
      return Math.round(start + Math.random() * r);
    }

    function getRandomColor() {
      return d3.rgb(getRandomInRange(0, 255), getRandomInRange(0, 255), getRandomInRange(0, 255)).toString();
    }

    function getColors(num) {
      var colors = props.node.colors;
      if (num < colors.length) {
        return colors.slice(0, num);
      } else {
        var restCount = num - colors.length;

        for (var i = 0; i < restCount; i++) {
          colors.push(getRandomColor());
        }
        return colors.slice(0, num);
      }
    }

    function getEvenOddDiscreteColorScale(sunburstData, fakeRootName) {
      var colorScale = getDiscreteColorScale(sunburstData, fakeRootName);

      var domain = colorScale.domain(),
        range = colorScale.range();

      var range = domain.reduce(function (range, group, idx, domain) {
        return (group.indexOf('-odd') !== -1 && range[idx - 1] != null)
          ? range.slice(0, idx)
            .concat(d3.hsl(range[idx - 1])
              .darker()
              .darker()
              .toString()
            )
            .concat(range.slice(idx + 1))

          : range;

      }, range.slice());

      return colorScale.range(range);
    }

    function getDiscreteColorScale(sunburstData, fakeRootName) {

      var groups = sunburstData.map(function (d) {
        return getGroup(d, fakeRootName);
      })
        .filter(function (d) { return !!d; })
        .reduce(function (uniq, nodeId) {
          return (uniq.indexOf(nodeId) < 0) ? uniq.concat(nodeId) : uniq;
        }, []);

      return d3.scaleOrdinal()
        .domain(groups)
        .range(getColors(groups.length));
    }

    function isRootNode(node, fakeRootName) {
      return node.parent == null || node.parent.name === fakeRootName;
    }

    function getNodeDepth(node, fakeRootName) {
      return (function depth(node) {
        if (isRootNode(node, fakeRootName)) return 0;
        return depth(node.parent) + 1;
      })(node);
    }

    function getRoot(node, fakeRootName) {
      if (isRootNode(node, fakeRootName)) return node;
      return getRoot(node.parent, fakeRootName);
    }

    function isEvenOddColorMode() {
      return getColorType() === 'evenodd';
    }

    function getColorType() {
      return props.node.colorBy;
    }

    function getGroup(d, fakeRootName) {

      // props.node.colorBy = 'level';
      // need to track depth and root
      // rootName-even, rootName-odd
      // if is even then select color
      // if is odd then darken even color

      var groupByParent = props.node.colorBy === 'parent'
        && !!d.parent;

      if (groupByParent && d.parent.name === fakeRootName) {
        return d.parent.data.name + d.parent.children
          .reduce(function (idx, child, curIdx) { return (d.data.name === child.data.name) ? curIdx : idx; }, -1);
      } else if (groupByParent) {
        return d.parent.data.name;
      } else if (props.node.colorBy === 'node') {
        return d.data.name;
      } else if (isEvenOddColorMode() && d.data.name !== fakeRootName) {
        var root = getRoot(d, fakeRootName),
          depth = getNodeDepth(d, fakeRootName);

        return root.name + ((depth % 2) ? '-odd' : '-even');
      }
    }

    function getToolTipBuilder(root) {
      var formatMap = {};
      props.toolTip.elements.filter(function (el) {
        return typeof el.format === 'string';
      }).forEach(function (el) {
        formatMap[el.name] = d3.format(el.format);
      });

      var maxValue = root.value;
      var minValue = maxValue;

      (function recurse(node) {
        minValue = (minValue < node.value) ? minValue : node.value;
        if (Array.isArray(node.children)) {
          node.children.forEach(function (node) {
            recurse(node);
          });
        }
      })(root);

      return function (d) {
        var str = '<div style="padding:5px">';

        //Start CHART-3304
        var toolTipContent = {};
        toolTipContent.node = d; //Need to propagte node for drill downs that might reference levels as a parameter; also can determine raw unformatted value and ratio if needed
        //End CHART-3304

        props.toolTip.elements.forEach(function (el, idx) {

          if (!d.parent) {
            return;
          }
          // if ( el.hideForRoot && d === findRoot(d)) {
          //   return;
          // }
          if (idx) {
            str += '<br/>';
          }
          str += '<b>' + el.name + ': </b>';

          if (el.name === 'ratio') {
            var ratio = d.value / d.parent.value;
            str += (formatMap.ratio) ? formatMap.ratio(ratio) : ratio;
            //Start CHART-3304
            toolTipContent['ratio'] = (formatMap.ratio) ? formatMap.ratio(ratio) : ratio;
            //End CHART-3304
          } else if (el.name === 'value' && props.toolTip.valueFormat && props.formatNumber) {
            str += props.formatNumber(
              d.value,
              props.toolTip.valueFormat,
              {
                min: minValue,
                max: maxValue
              }
            );
            //Start CHART-3304
            toolTipContent[el.name] = props.formatNumber(
              d.value,
              props.toolTip.valueFormat,
              {
                min: minValue,
                max: maxValue
              }
            );
            //End CHART-3304			
          } else {
            str += (formatMap[el.name]) ? formatMap[el.name](d[el.name]) : d[el.name];
            //Start CHART-3304
            toolTipContent[el.name] = (formatMap[el.name]) ? formatMap[el.name](d[el.name]) : d[el.name];
            //End CHART-3304			
          }
        });

        // str += "<br> color: " + d.fillColor.toLocaleString();   //Remove line comment to see color in tooltip...for debugging

        str += '</div>';

        //Begin Code Prior to CHART-3304	
        // return str;
        //End Code Prior to CHART-3304

        //Start CHART-3304

        toolTipContent.str = str;

        return toolTipContent;  //{str: ..., [ratio: ..., elm.name: ... ]}

        //End CHART-3304

      };
    }

    function getRatio(d) {
      var root = findRoot(d);
      return d.value / root.value;
    }

    function findRoot(d) {
      var root;
      (function iterate(node) {
        if (node.parent && node.parent.name !== innerProps.fakeRootName) {
          iterate(node.parent);
        } else {
          root = node;
        }
      })(d);
      return root;
    }

    function renderSunburst(group_main, onRenderComplete) {

      var data = getFixedDataSet(getData(), innerProps.fakeRootName);

      var radius = Math.min(props.width, props.height) / 2 * innerProps.radiusRatio;

      var x = d3.scaleLinear().range([0, 2 * Math.PI]);

      var y = d3.scaleSqrt().range([0, radius]);

      var group_chart = group_main.append('g').classed('group-chart', true)
        .attr('transform', 'translate(' + props.width / 2 + ',' + props.height / 2 + ')');

      var partition = d3.partition();

      var root = d3.hierarchy(data)
        .sum(function (d) {
          return d.size;
        });




      var sunburstData = partition(root).descendants();

      sunburstData.forEach(function (d) {
        d.ratio = getRatio(d);
      });
      /*
      var partition = d3.partition()
        .value(function(d) { return d.size; });

      var sunburstData = partition.nodes(data);

      sunburstData.forEach(function (d) {
        d.ratio = getRatio(d);
      });
      */
      /*  Logic prior to CHART-2004 NFR
       var colorScale = ( isEvenOddColorMode() ) 
         ? getEvenOddDiscreteColorScale( sunburstData, innerProps.fakeRootName )
         : getDiscreteColorScale( sunburstData, innerProps.fakeRootName );
    */

      //START VIZ-70	
      if (props.customColors) {

        var colorScale = (isEvenOddColorMode())
          ? getEvenOddDiscreteColorScale(sunburstData, innerProps.fakeRootName)
          : getDiscreteColorScale(sunburstData, innerProps.fakeRootName);

      } //if	

      else {
        //Start logic for CHART-2004 NFR. Parent Child color scheme similar to https://codepen.io/johnwun/pen/htJEn and  //https://bl.ocks.org/mbostock/4348373	  
        //var newColor = d3.scale.category20b();	//https://github.com/d3/d3-3.x-api-reference/blob/master/Ordinal-Scales.md#category20b
        var schemeCategory20b = ["#393b79", "#5254a3", "#6b6ecf", "#9c9ede", "#637939", "#8ca252", "#b5cf6b", "#cedb9c", "#8c6d31", "#bd9e39", "#e7ba52", "#e7cb94", "#843c39", "#ad494a", "#d6616b", "#e7969c", "#7b4173", "#a55194", "#ce6dbd", "#de9ed6"];
        var newColor = d3.scaleOrdinal(schemeCategory20b);
        sunburstData.forEach(function (d) {
          function fnShiftColor(color) {
            var hsl = d3.hsl(d3.rgb(color.brighter(.1)));
            var rnd = Math.round((Math.random() + 1) * 40);
            var colorshift = Math.min(hsl.h + rnd, 360);
            return d3.hsl(colorshift, Math.min(hsl.s, 50), Math.min(hsl.l, 40));
          }

          if (d.depth == 0) {
            d.fillColor = "#ffffff";     //White	
          }
          else if (d.depth == 1) {
            d.fillColor = d3.hsl(newColor(d.data.name));  //Assign a new color to roots
          }
          else {
            d.fillColor = fnShiftColor(d.parent.fillColor);  //shiftcolors of children
          }
        });
        //End logic for CHART-2004 NFR

      }//else
      //End VIZ-70 	

      var arc = d3.arc()
        .startAngle(function (d) { return Math.max(0, Math.min(2 * Math.PI, x(d.x0))); })
        .endAngle(function (d) { return Math.max(0, Math.min(2 * Math.PI, x(d.x1))); })
        .innerRadius(function (d) { return Math.max(0, y(d.y0)); })
        .outerRadius(function (d) { return Math.max(0, y(d.y1)); });

      /*
        var arc = d3.arc()
          .startAngle(function(d) {
            return Math.max(0, Math.min(2 * Math.PI, x(d.x)));
          })
          .endAngle(function(d) {
            return Math.max(0, Math.min(2 * Math.PI, x(d.x + d.dx)));
          })
          .innerRadius(function(d) {
            return Math.max(0, y(d.y));
          })
          .outerRadius(function(d) {
            return Math.max(0, y(d.y + d.dy));
          });
          */

      group_chart.selectAll('path.node')
        .data(sunburstData)
        .enter().append('path').classed('node', true);

      var paths = group_chart.selectAll('path.node');

      paths.attrs({
        d: function (d) {
          return arc(d);
        }
      })
        .styles({
          fill: function (d) {
            return (d.data.name !== innerProps.fakeRootName)
              //? colorScale(getGroup(d, innerProps.fakeRootName))     //Logic prior to CHART-2004 NFR. 
              //? d.fillColor                                            //Logic for CHART-2004. Color is pre-calculated...overriden by VIZ-70
              ? (props.customColors) ? colorScale(getGroup(d, innerProps.fakeRootName)) : d.fillColor                    //Logic for VIZ-70
              : 'none';
          },
          stroke: props.node.border.color,
          'stroke-width': props.node.border.width,
          opacity: 0
        });


      //Start CHART-3304

      //The outerArc/outerPath will fire onmouse over events to hide the tooltip
      var outerArc = d3.arc()
        .startAngle(0)
        .endAngle(2 * Math.PI)
        .innerRadius(y(1))
        .outerRadius(y(1) + 2)

      var outerPath = group_chart
        .append('path')
        .classed('node', true)
        .attrs({ d: outerArc })
        .attr('pointer-events', 'all')
        .styles({ fill: 'none', opacity: 0 });

      // Scenarios:
      // (1) No drill and no developer supplied tooltip: show original tooltip using 'tdgtitle' attribute for path
      // (2) No Drill with developer supplied tooltip: Show read only tooltip; overriding orginal tooltip 
      // (3) Single Drill with no developer supplied tooltip: Enable the drill down and show original tooltip 
      // (4) Single Drill with developer supplied tooltip: Enable the drill down and show read only tooltip; overriding original tooltip 
      // (5) Multi Drill with no developer supplied tooltip: Enable the drill downs and show interactive tooltip; overriding original tooltip 
      // (6) Multi Drill with developer supplied tooltip: Enable the drill downs and show interactive tooltip; overriding origial tooltip 



      paths.filter(function (d) {
        return d.name !== innerProps.fakeRootName;
      }).each(function (d) {
        d.orignalToolTipContent = getToolTipBuilder(d)(d)
      });  //Get Original ToolTip Content	and assign as a member to path data {str:..., name:..., value:..., ratio:...}


      var chart = props.chart;

      function findFirstOffset(obj) {    //Traverse hierarchy and find first offset
        if (obj.data.hasOwnProperty("offset")) return obj.data.offset;
        return obj.data.children[0].hasOwnProperty("offset") ? obj.data.children[0].offset : findFirstOffset(obj.data.children[0]);
      } //function		


      if (chart.eventDispatcher == undefined) { 				//IA development environment does not have access to drill downs

        var scenario = 1;										//So display default/original tooltip in IA

      } //if

      else {

        var bSingleDrill = (chart.eventDispatcher.events.length != 0); //Possibly scenarios (3) or (4)

        //Because moudules.tooltip is enabled, chart.series will always have at least one object with 'tooltip' sub-property.  
        // If there's more than original data buckets, then developer added some tooltip fields.
        aToolTips = chart.series.find(function (obj) { return "tooltip" in obj }).tooltip;

        var numFields = 0;
        chart.dataBuckets.buckets.forEach(function (bucket) { numFields += bucket.fields.length; })

        // //Possibly scenarios (2), (4), (6) or (5)
        var bNewTooltipColumns = aToolTips.filter(function (tipLine) { return tipLine.hasOwnProperty("value") })
          .filter(function (tipLine) { return tipLine.value.indexOf("{{tooltip") != -1 }).length > 0

        //Check aToolTips.tooltip, this time looking for 'url' sub-property in the multi drill scenarios
        var bMultiDrill = aToolTips.find(function (obj) { return (obj.hasOwnProperty("entry") && obj.hasOwnProperty("url")) }) != undefined // Possibly scenarios (5) or (6)

        var bNoDrills = !bSingleDrill && !bMultiDrill;  //Possibly scenarios (1) or (2)


        var scenario =
          [false,
            (bNoDrills && !bNewTooltipColumns),        //scenario = 1
            (bNoDrills && bNewTooltipColumns), 	    //scenario = 2
            (bSingleDrill && !bNewTooltipColumns),  	//scenario = 3
            (bSingleDrill && bNewTooltipColumns),		//scenario = 4				
            (bMultiDrill && !bNewTooltipColumns),		//scenario = 5 
            (bMultiDrill && bNewTooltipColumns)		//scenario = 6 
          ].findIndex(function (element) { return element == true });

      } //else	

      bNewToolTip = (scenario == 2 || scenario == 4 || scenario == 5 || scenario == 6); //Overrides original tooltip

      function fnSingleDrillDown(chart, offset, data) {
        var dispatcher = chart.eventDispatcher.events.find(function (obj) { return obj.series == 0 });
        var ids = { series: 0, group: offset };
        var localURL = chart.parseTemplate(dispatcher.url, data[offset], data, ids);
        return { url: localURL, target: dispatcher.target ? dispatcher.target : "_self" };
      } // fnSingleDrillDown		

      //Create a generic base tooltip template for scenarios 1 and 3
      var contentCopy = chart.dataBuckets.buckets[0].fields.map(
        function (level, i) {
          return { type: "nameValue", name: level.title, value: '{{extension_bucket(\"levels\",' + i + ')}}' }
        });
      contentCopy.push({ type: "nameValue", name: chart.dataBuckets.buckets[1].fields[0].title, value: null });

      var chart = props.chart;

      switch (scenario) {
        case 4: //Single drill, with developer supplied tooltip										
        case 2: //No drill, with developer supplied tooltip
        case 5: //Multidrill, no developer supplied tooltip 
        case 6: //Multidrill with developer supplied tooltip

          //Use moonbeam tooltip layout as a template
          var contentCopy = chart.getSeries(0).tooltip.slice(0);    //Make an exact copy of the base tootip content array.					

        case 3:	//Build tooltip and fnSingleDrillDown	
          if (scenario == 3 || scenario == 4) {
            contentCopy.push({ type: "separator" });
            contentCopy.push({ entry: "Drill Down", url: null, target: null });
          } //if
        case 1: //Original tooltip, no drills, no added developer side tooltips	

          separatorIndex = contentCopy.findIndex(function (elem) { return elem.type == "separator" })

          //Value for ratio will be replaced when tooltip is built.  It either before the separator or last entry of tooltip	
          if (separatorIndex != -1) {
            contentCopy.splice(separatorIndex, 0, { type: "nameValue", name: "ratio", value: null }); //http://www.javascripttutorial.net/javascript-array-splice/
          } //if
          else {
            contentCopy.push({ type: "nameValue", name: "ratio", value: null });
          } //else

          // Code fix VIZ-131: if (d3.select("#sunburstTooltipId").node() == null) {    //re-sizing of window calls renderCallback; so only create tooltip once

          //Start VIZ-131		
          d3.select("#divSunburstTooltipId").remove();  //Removes Tooltip div if it already exists
          //End VIZ-131

          d3.select(".chart")   //Add a div to chart's container
            .append("div")
            .attr("id", "divSunburstTooltipId")

          var tooltip = tdgchart.createExternalToolTip("divSunburstTooltipId", "sunburstTooltipId");

          var tooltip_style = {
            background: 'lightgrey',
            borderWidth: '5px',
            borderStyle: 'solid',
            borderColor: 'grey',
            borderRadius: '5px'
          };

          var tooltip_properties = {
            fill: 'lightgrey',
            border: {},
            cascadeMenuStyle: {
              hover: { labelColor: '#000000', fill: '#D8BFD8' }
            }
          };

          tooltip
            .style(tooltip_style)
            .properties(tooltip_properties)
            .autoHide(true);

          // Code Fix VIZ-131: } // if ((d3.select("#sunburstTooltipId").node() == null) 		

          break;
      } //switch

      //Hide tooltip when user hovers over innner or outer paths	
      paths
        .filter(function (d) { return d.data.name == innerProps.fakeRootName; })
        .on('mouseover', function (d) { tooltip.hide() });

      outerPath
        .on('mouseover', function (d) { tooltip.hide() });


      //End CHART-3304



      if (!props.isInteractionDisabled) {
        paths

          .on('click', click)

          .filter(function (d) { // get all the nodes besides root
            return d.data.name !== innerProps.fakeRootName;
          })
          //Start Code Prior to CHART-3304
          //.on('mouseover', fade(0.2))
          //.on('mouseout',  fade(1));
          //End Code Prior to CHART-3304
          //Begin CHART-3304
          .on('mouseover', function (d) {

            fade(0.2)(d);


            //if (d3.select("#sunburstTooltipId").node().style.visibility == "visible") return;

            //The value field in databuckets is assigned the value calcualted for the appropriate level
            contentCopy[contentCopy.findIndex(function (tipLine) {
              return tipLine.type == "nameValue" && tipLine.name == chart.dataBuckets.buckets[1].fields[0].title;
            })].value = d.orignalToolTipContent.value;
            //Use original value for calculated ratio
            contentCopy[contentCopy.findIndex(function (tipLine) {
              return tipLine.type == "nameValue" && tipLine.name == "ratio";
            })].value = d.orignalToolTipContent.ratio;

            var offset = findFirstOffset(d);	//Find the original data associated with the outer ring or inner derived rings

            if (scenario == 3 || scenario == 4) { // Single Drill Down using oriignal tooltip 
              var urlTarget = fnSingleDrillDown(chart, offset, chart.data[0]);
              var urlIndex = contentCopy.findIndex(function (tipLine) { return tipLine.hasOwnProperty("url"); });
              contentCopy[urlIndex].url = urlTarget.url;
              contentCopy[urlIndex].target = urlTarget.target;

            } //if											


            if (!d.data.hasOwnProperty("offset")) { //user is on an innner ring

              //list of name values to remove based on the depth/level to user is mousing overriding
              var removeLevels = chart.dataBuckets.buckets[0].fields.slice(d.depth);
              var filteredLevelsContent = contentCopy.filter(function (tipLine) {
                var bRemove = false;
                if (tipLine.hasOwnProperty("name")) {
                  bRemove = removeLevels.some(function (level) { return level.title == tipLine.name });
                } //if
                return !bRemove;
              });

              var filteredUrlConternt = filteredLevelsContent.filter(function (tipLine) {
                return !tipLine.hasOwnProperty("url")
              });

              var filteredToolTipContent = filteredUrlConternt.filter(function (tipLine) {
                var bTooltip = false;
                if (tipLine.hasOwnProperty("value")) {
                  var bTooltip = tipLine.value.indexOf("{{tooltip") == 0;
                } //if	
                return !bTooltip;
              });
            } //if
            else {
              filteredToolTipContent = contentCopy;
            } //else

            var ids = { series: 0, group: offset };
            //if (tooltip.dom.style.visibility ==  "hidden") {	
            tooltip
              .content(filteredToolTipContent, props.data[offset], props.data, ids)
              // Code prior to VIZ-131: .position(event.clientX, event.clientY)
              .position(d3.event.clientX, d3.event.clientY)
              .autoHide(false);

            tooltip.show();
            //}			

          } //function			
          ) //on
          .on('mouseout', function (d) {
            fade(1)(d);
            if (!tooltip._autoHideEnabled) {
              //tooltip.hide(); //If not using moonbeam's autoHide
            }
          } //function
          );	//carefull with ';' here
        //End CHART-3304		
      } //if 

      paths.filter(function (d) {
        return d.data.name === innerProps.fakeRootName;
      }).attr('pointer-events', 'all');

      var invokeAfterTwo = getInvokeAfter(onRenderComplete, 2);

      if (props.isInteractionDisabled) {
        paths.style('opacity', 1);
        invokeAfterTwo();
      } else {
        paths
          .transition().delay(function (d, i) {
            return 10 * (paths.nodes().length - i);
          })
          .duration(600)
          .style('opacity', 1)
          .call(getOnAllTransitionComplete(invokeAfterTwo));
      }

      //Start Code Prior to CHART-3304 	
      /*
      if ( props.toolTip.enabled ) {	   
          paths
            .filter(function (d) { // get all the nodes besides root
              return d.name !== innerProps.fakeRootName;
            })
        .attr('tdgtitle', getToolTipBuilder(data));
      } //if
      */
      //End Code Prior to CHART-3304

      function click(d) {

        //Begin Code prior to CHART-3304
        //paths.transition('zooming_in')
        // .duration(750)
        // .attrTween("d", arcTween(d));
        //End Code prior to CHART-3304

        //Start CHART-3304
        if (!d.data.hasOwnProperty("offset") || scenario == 1 || scenario == 2) { //Always allow sunburst 'drill down' animation on inner rings, or scenarios with no developer drilldowns	
          paths.transition('zooming_in')
            .duration(750)
            .attrTween("d", arcTween(d));
        } //if	
        //End CHART-3304 
      }

      function fade(opacity) {
        return function (select_d) {
          var filteredPaths = paths.filter(function (path_d) {
            return select_d !== path_d;
          });

          filteredPaths.transition().style('opacity', opacity);
        };
      }

      function arcTween(d) {
        // var xd = d3.interpolate(x.domain(), [d.x0, d.x0 + d.x1]),
        //   yd = d3.interpolate(y.domain(), [d.y0, 1]),
        //   yr = d3.interpolate(y.range(), [d.y0 ? 20 : 0, radius]);
        var xd = d3.interpolate(x.domain(), [d.x0, d.x1]),
          yd = d3.interpolate(y.domain(), [d.y0, 1]),
          yr = d3.interpolate(y.range(), [d.y0 ? 20 : 0, radius]);

        return function (d, i) {
          if (i) {
            return function (t) {
              return arc(d);
            };
          } else {
            return function (t) {
              x.domain(xd(t));
              y.domain(yd(t)).range(yr(t));
              return arc(d);
            }
          }
        }
      }

      invokeAfterTwo();
    }

    function chart(selection) {

      var group_main = selection.append('g').classed('group-main', true);

      renderSunburst(group_main, props.onRenderComplete);
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
