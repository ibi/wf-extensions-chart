// Copyright 1996-2018 Information Builders, Inc. All rights reserved.
// Corona Chart HTML 5 Extension JavaScript
// Written by   : Anthony Alsford
// Date Created : 1st March 2018
// --------------------------------------------------------------------------------
// Modification History
// --------------------------------------------------------------------------------
// Anthony Alsford: 5th March 2018
//   1. Additional property to assign RootName if not provided within properties.
//   2. Move mouseover and mouseout to single functions to reduce code base.
//   3. Additional property to allow either "worse child" or "parent" RAG to be applied.
//      This affects the actual node value as well as the RAG colouration.
// #### Not applied to the root node yet ####
// --------------------------------------------------------------------------------

// Creat global variables to allow passing of properties to any function.
  var RootName = "",
      indRed = 100,
      indAmber = 100,
      useParentRAG = false,
      showSuccess = true,
      tree = ""
      diagonal = "",
      drilldown = "",
      ddtarget = "blank";

  var layers = 0;

  var win = window
    , doc = document
    , ele = doc.documentElement
    , bdy = doc.getElementsByTagName("body")[0];

  var margin = {top: 20, right: 40, bottom: 20, left: 20},
      width = 180 * (3 + 1),
      clientWidth = 180 * (3 + 1),
      height = 800,
      boxWidth = 180;

  var i = 0,
      duration = 750,
      root;

  var svg = "";

function checkData(data,container,width,height,arrBuckets,props) {
    
//  console.log(JSON.stringify(data));
//  console.log(JSON.stringify(arrBuckets));
  
// Assign values to global variables from the properties and buckets
  RootName = !(props.RootName == "") ? props.RootName : Array.isArray(arrBuckets.levels.title) ? arrBuckets.levels.title[0] : arrBuckets.levels.title;
  indRed = props.indRed;
  indAmber = props.indAmber;
  useParentRAG = props.useParentRAG;
  showSuccess = props.showSuccess;
  drilldown = props.drilldown;
  ddtarget = props.ddtarget;
  svg = container;
  height = height;
  width =  boxWidth * ((arrBuckets.levels.count * 2) + 1);
  
  d3.select("body.tooltip").remove();
  
  var divTooltip = d3.select(".chart").append("div")
      .attr("id", "tooltip");
  
  drawChart(data,container,arrBuckets,props);

}
  
function drawChart(data,svgContainer,arrBuckets,props) {

//  alert("Drawing chart");

  var data = getFixedDataSet(data, RootName);

  clientWidth = svgContainer[0].parentNode.clientWidth;

  width = 180 * ((layers * 2) + 1);

  tree = d3.layout.tree()
      .size([height, width])
//      .separation(function(a,b) { return (a.parent == b.parent ? 1 : 1.5); })
      ;

  diagonal = d3.svg.diagonal()
      .projection(function(d) { return [d.y, d.x]; })
      .source(function(d) { return {x: d.source.x, y: d.source.y + boxWidth}; })
      .target(function(d) { return {x: d.target.x, y: d.target.y}; })
      ;

  svgContainer.attr("width", width + margin.right + margin.left)
              .attr("height", height + margin.top + margin.bottom)
              .append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  var tmpCounter = 0;

  function collapse(d) {
    if (d.showchildren) {
      tmpCounter += d.children.length;
      d.children.forEach(collapse);
    } else {
      d._children = d.children;
      d.children = null;
    }
    height = tmpCounter * 30;
    var thissvg = d3.selectAll("svg")
                      .attr("height", height + margin.top + margin.bottom);
  }

  root = data;
  root.x0 = height / 2;
  root.y0 = 0;

  root.children.forEach(collapse);

  update(root);

}

function update(source) {
  var newHeight = tree.nodes(root).reverse().length * 22;

  d3.select("svg")
      .attr("width", width + margin.right + margin.left)
      .attr("height", newHeight + margin.top + margin.bottom)
//      .attr("width", function() {var tmpWidth = (width + margin.right + margin.left);
//                                 var newWidth = (clientWidth < tmpWidth) ? tmpWidth + "px" : "100%";
//                                 console.log(clientWidth + " : " + tmpWidth + " : " + newWidth);
//                                 return newWidth;})
//      .attr("height", "100%")
//      .attr("viewBox", function() {var tmpWwidth = (width + margin.right + margin.left);
//                                   var tmpHeight = (newHeight + margin.top + margin.bottom);
//                                   return ("0 0 " + tmpWwidth + " " + tmpHeight);
//                                  })
      ;

  tree = d3.layout.tree().size([newHeight, width]);

  // Compute the new tree layout.
  var nodes = tree.nodes(root).reverse(),
      links = tree.links(nodes);

  // Normalize for fixed-depth.
  nodes.forEach(function(d) { d.y = d.depth * boxWidth * 2; });

  // Update the nodes
  var node = svg.selectAll("g.node")
      .data(nodes, function(d) {
          return d.id || (d.id = ++i);
        });

  // Enter any new nodes at the parent's previous position.
  var nodeEnter = node.enter().append("g")
      .attr("class", "node")
      .attr("transform", function(d) { return "translate(" + (source.y0) + "," + (source.x0) + ")"; })
      .on("click", click)
      .on("mouseover", mouseover)
      .on("mouseout", mouseout);

  nodeEnter.append("rect")
      .attr("width", boxWidth)
      .attr("height", 18)
      .attr("transform", function(d) { return d.children || d._children ? "translate(0,-9)" : "translate(0,-9)"; })
      .attr("rx", 9).attr("ry", 9)
      .attr("id", function(d,i) { var id = "";
                                  var pparent = (d.parent) ? d.parent : false;
                                  var ppparent = (pparent) ? pparent.parent : false;
                                  var pppparent = (ppparent) ? ppparent.parent : false;
                                  id += (pppparent) ? pppparent.name + " " : "";
                                  id += (ppparent) ? ppparent.name + " " : "";
                                  id += (pparent) ? pparent.name + " " : "";
                                  id += d.name + " ";
                                  return id.replace(/[^A-Z0-9]/ig, "_");})
      .attr("class", function(d) { return "RAG_" + d.colour; })
      ;

  nodeEnter.append("text")
      .attr("x", function(d) { return d.children || d._children ? 5 : 5; })
      .attr("dy", ".35em")
      .attr("transform", function(d) { return d.children || d._children ? "translate(0,0)" : "translate(0,0)"; })
      .attr("text-anchor", function(d) { return d.children || d._children ? "start" : "start"; })
      .text(function(d) { return d.name; })
      .attr("id", function(d,i) { var id = "";
                                  var pparent = (d.parent) ? d.parent : false;
                                  var ppparent = (pparent) ? pparent.parent : false;
                                  var pppparent = (ppparent) ? ppparent.parent : false;
                                  id += (pppparent) ? pppparent.name + " " : "";
                                  id += (ppparent) ? ppparent.name + " " : "";
                                  id += (pparent) ? pparent.name + " " : "";
                                  id += d.name + " ";
                                  return id.replace(/[^A-Z0-9]/ig, "_");})
      .attr("class", function(d) { return "RAG_" + d.colour; })
      .style("fill-opacity", 1e-6)
      ;

  // Resize the rectangle labels to boxWidth or as wide as the text requires
  // unless the depth level is the lowest one - then set it to label text width
  // This gives the user a visual guide when the lowest level is reached
  nodeEnter.selectAll("rect")
             .attr("width", function(d) {var textElement = d3.select(this.parentNode).select("text").node();
                                         var parentElement = d3.select(this.parentNode).node();
                                         var bbox = textElement.getBBox();
                                         var bbwidth = (bbox.width + 12 > boxWidth) ? bbox.width + 12 : boxWidth;
                                             bbwidth = (d.depth == layers) ? bbox.width + 12 : bbwidth;
                                         return bbwidth; });

  // Transition nodes to their new position.
  var nodeUpdate = node.transition()
      .duration(duration)
      .attr("transform", function(d) { return "translate(" + d.y + "," + d.x + ")"; });

  nodeUpdate.select("text")
      .style("fill-opacity", 1);

  // Transition exiting nodes to the parent's new position.
  var nodeExit = node.exit().transition()
      .duration(duration)
      .attr("transform", function(d) { return "translate(" + source.y + "," + source.x + ")"; })
      .remove();

  nodeExit.select("text")
      .style("fill-opacity", 1e-6);

  // Update the links
  var link = svg.selectAll("path.link")
      .data(links, function(d) { return d.target.id; });

  // Enter any new links at the parent's previous position.
  link.enter().insert("path", "g")
      .attr("class", "link")
      .attr("d", function(d) {
        var o = {x: (source.x0 + 100), y: source.y0};
        return diagonal({source: o, target: o});
      });

  // Transition links to their new position.
  link.transition()
      .duration(duration)
      .attr("d", diagonal);

  // Transition exiting nodes to the parent's new position.
  link.exit().transition()
      .duration(duration)
      .attr("d", function(d) {
        var o = {x: (source.x + 150), y: source.y};
        return diagonal({source: o, target: o});
      })
      .remove();

  // Stash the old positions for transition.
  nodes.forEach(function(d) {
    d.x0 = d.x;
    d.y0 = d.y;
  });
}

// Mouseover function.
function mouseover(d) {
  var pparent = (d.parent) ? d.parent : false;
  var ppparent = (pparent) ? pparent.parent : false;
  var pppparent = (ppparent) ? ppparent.parent : false;
  var objId  = (pppparent) ? pppparent.name + " " : "";
      objId += (ppparent) ? ppparent.name + " " : "";
      objId += (pparent) ? pparent.name + " " : "";
      objId += d.name + " ";
      objId  = objId.replace(/[^A-Z0-9]/ig, "_");
  d3.selectAll("rect")
      .call(fade(0.2,objId));
  d3.selectAll("#" + objId)
      .attr("class", function(d) { var collection = d3.selectAll("#" + objId);
                                   return "RAG_" + d.colour + "_hover"; });
  d3.select("#tooltip")
      .html(function() {var list = "";
                        list += (ppparent) ? ppparent.name + "<br>" : "";
                        list += (pparent) ? pparent.name + "<br>" : "";
//                        list +=  d.name + "<br>";
                        return "<span style='font-weight:700;text-decoration:underline;'>"+d.name+"</span><br>"+list+"Node Value: "+d.value;
                       })
      .style("top", function() {var objTooltip = d3.select("#tooltip");
                                var objHeight = objTooltip[0][0].offsetHeight;
                                var clientHeight = (win.innerHeight || ele.clientHeight || bdy.clientHeight);
                                var scrollTop = (win.scrollY || ele.scrollY || bdy.scrollTop);
                                var posTop = (clientHeight + scrollTop > (d3.event.pageY + objHeight + 20)) ? d3.event.pageY + 20 : (d3.event.pageY - objHeight - 20);
                                return (posTop) + "px";
                               })
      .style("left", function() {var objTooltip = d3.select("#tooltip");
                                 var objWidth = objTooltip[0][0].offsetWidth;
                                 var clientWidth = (win.innerWidth || ele.clientWidth || bdy.clientWidth);
                                 var scrollLeft = (win.scrollX || ele.scrollX || bdy.scrollLeft);
                                 var posLeft = (clientWidth + scrollLeft > (d3.event.pageX + objWidth + 20)) ? d3.event.pageX + 20 : (d3.event.pageX - objWidth - 20);
                                 return (posLeft) + "px";
                                })
      .style("visibility", "visible")
      .attr("class", function() {return "RAG_" + d.colour + "_hover";});
}

// Mouseout function.
function mouseout(d) {
  var pparent = (d.parent) ? d.parent : false;
  var ppparent = (pparent) ? pparent.parent : false;
  var pppparent = (ppparent) ? ppparent.parent : false;
  var objId  = (pppparent) ? pppparent.name + " " : "";
      objId += (ppparent) ? ppparent.name + " " : "";
      objId += (pparent) ? pparent.name + " " : "";
      objId += d.name + " ";
      objId  = objId.replace(/[^A-Z0-9]/ig, "_");
  d3.selectAll("rect")
      .call(fade(1,objId));
  d3.selectAll("#" + objId)
      .attr("class", function(d) { var collection = d3.selectAll("#" + objId);
                                   return "RAG_" + d.colour; })
  d3.select("#tooltip")
      .style("visibility", "hidden")
      .html(function() {return "";});
}

// Toggle children on click.
function click(d) {
  if (drilldown != "" && !(d.children || d._children)) {
    var pparent = (d.parent) ? d.parent : false;
    var ppparent = (pparent) ? pparent.parent : false;
    var pppparent = (ppparent) ? ppparent.parent : false;
    var strLevel1 = (pppparent) ? pppparent.name : "_FOC_NULL";
    var strLevel2 = (ppparent) ? ppparent.name : "_FOC_NULL";
    var strLevel3 = (pparent) ? pparent.name : "_FOC_NULL";
    drillto(drilldown,strLevel1,strLevel2,strLevel3,d.fail,d.total,d.value);
    return false;
  }
  if (d.children) {
    d._children = d.children;
    d.children = null;
  } else {
    d.children = d._children;
    d._children = null;
  }
  tree.nodeSize([30, width])
//    .separation(function(a,b) { return (a.parent == b.parent ? 1 : 1.5); })
  ;

  update(d);
}

function drillto(fexName, strLevel1, strLevel2, strLevel3, DataFail, DataTotal, DataValue) {
  // Build the URL required to execute the drill down report
  var _iframeurl =  "/ibi_apps/rs/ibfs"+fexName+"?IBIRS_action=run"
                 +  "&Level1="+strLevel1
                 +  "&Level2="+strLevel2
                 +  "&Level3="+strLevel3
                 +  "&Fail="+DataFail
                 +  "&Total="+DataTotal
                 +  "&Value="+DataValue;
                 
  window.open(_iframeurl, ddtarget, "location=no");
}

function fade(opacity,id) {
  var node_groups = d3.selectAll("rect");
  return function () {
    var that = id;
    node_groups.filter(function () {
      return that !== this.id;
    }).transition()
//        .attr("delay", 2000)
//        .attr("duration", 3500)
        .style('opacity', opacity);
  };
}

  // converts moonbeam hierarchical dataset into a true hierarchy of parent : child recursively
  function getFixedDataSet (data, RootName) {
    var roots , root;
    if ( !Array.isArray(data) ) {
      return;
    }

    var hierarchy = getHierarchyObj(data);

    if ( hierarchy.length > 1 ) {
      var fail = 0,
          total = 0,
          value = 100,
          childvalue = 100,
          curvalue = 0,
          colour = "red";
      for (iter=0; iter < hierarchy.length; iter++) {
          fail += hierarchy[iter].fail;
          total += hierarchy[iter].total;
          childvalue = (hierarchy[iter].childvalue < childvalue) ? Number(hierarchy[iter].childvalue) : Number(childvalue);
      };
      curvalue = calcRatio(fail, total);
      value = !(useParentRAG) ? childvalue : Number(curvalue);
      colour = (value > indAmber) ? "green" : "amber";
      colour = (value <= indRed) ? "red" : colour;
      return {
        name: RootName,
        children: hierarchy,
        fail: fail,
        total: total,
        value: value.toFixed(2),
        childvaluevalue: childvalue.toFixed(2),
        colour: colour
      };
    } else {
      return hierarchy[0];
    }
  }
  
  function getHierarchyObj (data) {
    var res = [], roots = [];
    data.forEach(function (d) {
      var root,
        levels = Array.isArray(d.levels) ? d.levels : [d.levels],
        idx = roots.indexOf(levels[0]);
        layers = d.levels.length;
      if ( idx >= 0 ) {
        root = res[idx];
      } else {
        root = {};
        res.push(root);
        roots.push(levels[0]);
      }

      (function iterate (obj, fail, total, path, idx, len) {
        obj.name = path[idx];
        if ( idx < len ) {
          if ( !Array.isArray(obj.children) ) {
            obj.fail  = 0; // First iteration of building the node so we initialise
            obj.total = 0; // the base components that we wish to use
            obj.value = 100;
            obj.childvalue = 100;
            obj.showchildren = (idx <= (layers - 3)) ? true : false;
            obj.children = [];
          }
          obj.fail  += fail;  // At this point the initialisation should have been actioned
          obj.total += total; // so adding the childrens value to the parent.
          var tmpValue = calcRatio(fail, total);
          var curValue = calcRatio(obj.fail, obj.total);
          obj.childvalue = (tmpValue < obj.childvalue) ? tmpValue : obj.childvalue;
          obj.value = !(useParentRAG) ? obj.childvalue : curValue;
          obj.colour = (obj.value > indAmber) ? "green" : "amber";
          obj.colour = (obj.value < indRed) ? "red" : obj.colour;
          obj.showchildren = (idx <= (layers - 3)) ? true : false;
          var child = {};
          iterate(child, fail, total, path, idx + 1, len);

          var existingChild = obj.children
            .filter(function(node){ return node.name === child.name; })[0];

          if ( existingChild && existingChild.children ) { // if already have a child with the same name, merge their children
            existingChild.children = existingChild.children.concat(child.children);
            existingChild.fail += fail;
            existingChild.total += total;
            var tmpValue = calcRatio(fail, total);
            var curValue = calcRatio(existingChild.fail, existingChild.total);
            existingChild.childvalue = (tmpValue < existingChild.childvalue) ? tmpValue : existingChild.childvalue;
            existingChild.value = !(useParentRAG) ? existingChild.childvalue : curValue;
            existingChild.colour = (existingChild.value > indAmber) ? "green" : "amber";
            existingChild.colour = (existingChild.value <= indRed) ? "red" : existingChild.colour;
            existingChild.showchildren = false;
          } else if ( !existingChild ) { // new child
            obj.children.push(child);
          }
        } else {
          obj.fail  = fail;  // This is assignment for the lowest level within the hierarchy
          obj.total = total; //
          obj.childvalue = calcRatio(obj.fail, obj.total);
          obj.value = calcRatio(obj.fail, obj.total);
          obj.colour = (obj.value > indAmber) ? "green" : "amber";
          obj.colour = (obj.value < indRed) ? "red" : obj.colour;
          obj.showchildren = false;
        }
      })(
        root, d.fail, d.total,
        Array.isArray(d.levels) ? d.levels : [d.levels],
        0, levels.length - 1
      );

    });

    return res;
  }

  function calcRatio(fail, total) {
    if (showSuccess) {
      var ratio = (total - fail) / total * 100;
      return ratio.toFixed(2);
    } else {
      var ratio = fail / total * 100;
      return ratio.toFixed(2);
    }
  }



