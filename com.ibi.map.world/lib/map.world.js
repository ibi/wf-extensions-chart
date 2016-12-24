/* jshint eqnull:true*/
/* globals d3*/

window.COM_IBI_MAP_WORLD = window.COM_IBI_MAP_WORLD || {};
window.COM_IBI_MAP_WORLD.init = (function() {

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

    // --------------------------------- PUT HERE ALL THE GLOBAL VARIABLES AND FUNCTIONS THAT DON'T NEED TO ACCESS PROPS AND INNERPROPS THROUGH SCOPE (Z1)

    function getProjection(countries, width, height) {
        var projection = d3.geo.equirectangular();

        projection.scale(1)
            .translate([0, 0]);

        var path = d3.geo.path()
		.projection(projection);

        var b = path.bounds(countries),
            s = 0.98 / Math.max((b[1][0] - b[0][0]) / width, (b[1][1] - b[0][1]) / height),
            t = [
		(width - s * (b[1][0] + b[0][0])) / 2,
		(height - s * (b[1][1] + b[0][1])) / 2
	    ];

        projection
            .scale(s)
            .translate(t);

        return projection;
    }
    
    //remove empty spaces, special characters and change all leters to lowercase 
    function getCleanCountryName( countryName ) {
      return countryName.replace(/[^A-z0-9]/g,'').toLowerCase();
    }

    
    function isNumeric ( val ) {
      return typeof val === 'number'
        && !isNaN(val); 
    }

    // get clean data for choropleth map
    function getCleanedData ( data, exclude ) {

      var res = data.map( function( datum ){
        var cpy = JSON.parse(JSON.stringify( datum ))
        cpy.value = (Array.isArray(datum.value)
          ? datum.value
          : [datum.value]
        ).filter(function(val){ return isNumeric( val ); });
        return cpy;  
      });

      exclude = exclude.map(function( name ){ return getCleanCountryName( name ); }); 

      var res = res.filter( function( datum ) {
        return typeof datum.name === 'string'
          && exclude.indexOf( getCleanCountryName(datum.name) ) === -1
          && datum.value.length > 0;
      });

      return res;
    }


    function getColorScaleForValueAtIdx ( data, colorRange, idx ) {
        var extent = d3.extent(data, function (d) { 
          return d.value[idx];
        });

        var ratio = d3.scale.ordinal()
          .domain(colorRange)
          .rangePoints(extent, 0);

        var domain = colorRange.map(function (color) {
            return ratio(color);
        });

        return d3.scale.linear()
          .domain(domain)
          .range(colorRange);
    }

    function getToolTipFn ( buckets, formatValueAtIdx ) {
        return function (d) {
          var toolTip = [],
            values;
          
          ['name', 'longitude', 'latitude'].forEach( function(bucketName) {
            if ( !Array.isArray( buckets[bucketName] ) ) return;

            toolTip.push({
                key: buckets[bucketName][0],
                formatedValue: d[bucketName]
            });
          });

          if ( Array.isArray( buckets.value ) ) {
            var values = Array.isArray(d.value) ? d.value : [d.value];
            
            toolTip = toolTip.concat(buckets.value.reduce( function( tooltip, key, idx ){
              return tooltip.concat({
                key: key,
                formatedValue: formatValueAtIdx[idx]( values[idx] ) // need to format this value
              }); 
              }, []));
          }

          return toolTip;
        };
    }

    function getTDGTitle (tooltip /*, formatNumber, extent, formatType */) {
      return tooltip.reduce(function (str, cur, idx) {
        if ( idx ) {
            str += '<br/>';
        }

        str += '<b>' + cur.key + ': </b>';
          
        str += cur.formatedValue; 

        return str;
      }, '<div style="padding: 5px">').concat('</div>');
    }

    function getClrLegendLayout ( data, props, innerProps ) {
      var pad = innerProps.pad;

      var titleText = ( getIsBubbleMode( data ) )
        ? props.buckets.value[1]
        : props.buckets.value[0];

      var titleDim = props.measureLabel(titleText, props.colorLegend.title.font);
      
      var clrScale = getColorScaleForValueAtIdx(
        data,
        props.colorScale.range,
        0
      ).nice();

      var ticksCount = typeof props.colorLegend.rows.count === 'number'
        ? props.colorLegend.rows.count
        : null;

      var extent = d3.extent(data, function(d){ return d.value[0]; });

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

      var lgndVertSpace = Math.min(
        props.height,
        innerProps.colorLegend.maxHeight
      );

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
                    frmtCnfg
                  )
          }
        };
      });

      var lgndWidth = Math.max(
        band + lblsHorizSpace + 3 * pad,
        titleDim.width + 2 * pad
      );

      return {
        width: lgndWidth,
        height: lgndVertSpace,
        title: {
          text: titleText,
          translate: [
            lgndWidth / 2,
            pad + titleDim.height / 2
          ]
        },
        rows: rows
      };
    }

    function getSizeLegendLayout( data, props, innerProps ) {
      var layout = {}; 

      var pad = innerProps.pad;

      var titleText = props.buckets.value[0];

      var titleDim = props.measureLabel(titleText, props.sizeLegend.title.font);

      var range = props.bubbles.bubbleSizeRange;

      var largetsHalfArcSize = range[1];

      var lgndHeight = 3 * pad + titleDim.height + largetsHalfArcSize;
      
      var sizeScale = getSizeScale(data, range);
      var extent = sizeScale.domain(); 

      var labels = (extent || []).map( function (val) {
        return props.formatNumber( val, props.sizeLegend.rows.labels.format, { min: extent[0], max: extent[1] });
      });

      var largestLblWidth = d3.max(labels, function() {
        return (
          props.measureLabel(titleText, props.sizeLegend.rows.labels.font)
          || { width: 0 }
        ).width;
      });

      //largest halfarc + largestLabel + padding between them
      var halfArcsGroupWidth = largetsHalfArcSize + largestLblWidth + pad; 

      var lgndWidth = Math.max(
        halfArcsGroupWidth,
        titleDim.width 
      ) + 2 * pad;

      var halfArcsGroupTopOffset = 2 * pad + titleDim.height + largetsHalfArcSize;
      var halfArcsGroupLeftOffset =  ( titleDim.width > halfArcsGroupWidth )
        ? ( lgndWidth - pad ) / 2
        : pad + largetsHalfArcSize;

      return {
        width: lgndWidth,
        height: lgndHeight,
        halfArcsGroup: {
          translate: [
            halfArcsGroupLeftOffset,
            halfArcsGroupTopOffset
          ],
          halfArcs: range.map(function( size ){
            return {
              size: size,
              x: 0,
              y: 0
            }; 
          }),
          labels: labels.map(function( label, idx ){
            return {
              text: label,
              x: pad,
              y: -range[idx]
            }; 
          })
        },
        title: {
          text: titleText,
          translate: [
            lgndWidth / 2,
            pad + titleDim.height / 2
          ]
        }
      };
    }

    function getHasColorLegend ( data, props ) {
      
      var isBubbleMode = getIsBubbleMode(data);
     
      var valueBacketLength = ( Array.isArray(props.buckets.value) )
        ? props.buckets.value.length
        : 0;

      return ( !isBubbleMode && valueBacketLength > 0 )
        || ( isBubbleMode && valueBacketLength > 1 );
    }
    
    function getIsBubbleMode( data ) {
      return data.some(function(d){
        return d.latitude != null && d.longitude != null; 
      });
    }

    function getHasSizeLegend( data ) {
      return getIsBubbleMode(data);
    }
    
    function getSizeScale( cleanData, range ) {
      var extent = d3.extent(cleanData, function(d){ return d.value[0]; });       
      return d3.scale.sqrt()
        .domain(extent)
        .range( range || [5, 15] );
    }

    function getBubblesLayout( cleanData, projection, props ) {

      var range = props.bubbles.bubbleSizeRange,
          defaultColor = props.bubbles.defaultColor;

      var sizeScale = getSizeScale(cleanData, range);
      
      var hasColorScale = cleanData.some(function(data){
        return data.value[1]; 
      });

      var colorScale = ( hasColorScale )
        ? getColorScaleForValueAtIdx( 
            cleanData,
            props.colorScale.range,
            1 
          )
        : null;

      var formatValueAtIdx = getFormatValueAtIdx(cleanData, props);

      var tooltipFn = getToolTipFn ( props.buckets, formatValueAtIdx );

      return cleanData.map( function( datum ) {
        return {
          size: sizeScale( datum.value[0] ),
          color: colorScale ? colorScale(datum.value[1]) : defaultColor,
          tooltip: getTDGTitle( tooltipFn(datum) ),
          pos: projection([
            +datum.longitude,
            +datum.latitude
          ]) 
        }; 
      }); 
    }

    function getLayout ( cleanData, props, innerProps ) {
        
        var layout = {
          colorLegend: null,
          sizeLegend: null,
          countries: null,
          choropleths: null,
          bubbles: null 
        };

        var hasColorLegend = getHasColorLegend( cleanData, props );
        var hasSizeLegend = getHasSizeLegend(cleanData);

        if ( hasSizeLegend ) {
          layout.sizeLegend = getSizeLegendLayout( cleanData, props, innerProps );
        }

        if ( hasColorLegend ) {
          layout.colorLegend = getClrLegendLayout( cleanData, props, innerProps );
        }

        var mapDim = {
          width: props.width, //width changes if chart has a legend
          height: props.height
        };
        
        
        var legends = [],
          pad = innerProps.pad;

        if ( layout.sizeLegend ) {
          legends.push( layout.sizeLegend );
        }

        if ( layout.colorLegend ) {
          legends.push( layout.colorLegend );
        }

        var legendsTotalHeight = d3.sum(legends, function(legend) {
          return legend.height; 
        }) || 0;

        if ( legendsTotalHeight > 0 ) {
          legendsTotalHeight += ( legends.length - 1 ) * pad;
        }

        var legendsMaxWidth = d3.max(legends, function(legend) {
          return legend.width; 
        }) || 0;

        var topOffset = ( props.height - legendsTotalHeight ) / 2;

        mapDim.width = props.width - legendsMaxWidth - 2 * innerProps.pad;
        
        legends.reduce(function ( offset, legend ) {
          legend.translate = [
            mapDim.width,
            offset
          ];

          return offset + legend.height + pad;
        }, topOffset);
	
        var projection = getProjection(
          COM_IBI_MAP_WORLD.topojson_countries,
          mapDim.width,
          mapDim.height
	);

        var path = d3.geo.path()
          .projection(projection);

	layout.countries = COM_IBI_MAP_WORLD.topojson_countries
          .geometries.map(function( geom ) {
             return {
               path: path(geom)	
             };	
          }); 
        
        var isBubbleMode = getIsBubbleMode( cleanData );

        if ( isBubbleMode ) {
          layout.bubbles = getBubblesLayout(
            cleanData,
            projection,
            props
          );
        } else {
          layout.choropleths = getChoroplethLayout( cleanData, path, props );
        }

        return layout;
    }

    function halfArcPath (x, y, rad) {
      return  "M"
       + (x - rad)
       + ' '
       + y
       + ' A '
       + rad
       + ' '
       + rad
       + ', 0, 0, 1, '
       + x
       + ' '
       + ( y - rad );
    }
    
    function getFormatValueAtIdx ( cleanData, props ) {
      return (props.buckets.value || []).reduce(function( arr, name, idx ){
        var extent = d3.extent( cleanData, function(datum){
          return datum.value[idx]; 
        });
        
        return arr.concat( function(d){
          return props.formatNumber( d, 'auto', { min: extent[0], max: extent[1] });
        } );

      }, []);
    }

    function getChoroplethLayout( cleanData, pathFn, props ){
      var colorScale = getColorScaleForValueAtIdx( 
          cleanData,
          props.colorScale.range,
          0
        );

      var idAtPositionList = COM_IBI_MAP_WORLD.topojson_countries
        .geometries.map(function(geom){ 
          return geom.id; 
        });
      
      var countryName_to_id_map = {};

      for ( var key in COM_IBI_MAP_WORLD.countryName_to_id_map ) {
       if ( COM_IBI_MAP_WORLD.countryName_to_id_map.hasOwnProperty(key) ) {
        countryName_to_id_map[getCleanCountryName(key)] = COM_IBI_MAP_WORLD.countryName_to_id_map[key];
       } 
      }

      var nameToTopoGeom = cleanData.reduce(function(map, datum){

        var cleanCountryName = getCleanCountryName( datum.name );
        var countryId = countryName_to_id_map[cleanCountryName];
        
        map[cleanCountryName] = COM_IBI_MAP_WORLD.topojson_countries
          .geometries[idAtPositionList.indexOf(+countryId)];

        return map;
      }, {}); 

      var formatValueAtIdx = getFormatValueAtIdx(cleanData, props);

      var tooltipFn = getToolTipFn ( props.buckets, formatValueAtIdx );

      return cleanData.map(function( datum ){
        return {
          d : pathFn( nameToTopoGeom[getCleanCountryName( datum.name )] ),
          color : colorScale( datum.value[0] ),
          tooltip: getTDGTitle(tooltipFn(datum))
        }; 
      }); 	
    }
    
//    function objForEach(obj, cb) {
//      var counter = 0;
//      for (var key in obj) {
//        if (obj.hasOwnProperty(key)) {
//          cb(obj[key], key, obj, counter++); 
//        } 
//      } 
//    }

    function renderColorLegend ( group_legend, legendLayout, props ) {
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

    function render ( group_main, layout, props, innerProps ) {

        var renderedDataElements = {
          bubbles: null,
          choropleths: null 
        };

        var group_countries = group_main
          .append('g')
          .classed('countries', true);

        var countries_enter = group_countries.selectAll("path")
          .data(layout.countries)
          .enter().append("path")
          .attr({
            d : function (d) {
              return d.path;
            }
          })
          .style({
              stroke : props.countries.borders.color,
              'stroke-width' : props.countries.borders.width,
              fill: function (d) {
                return props.countries.defaultColor;
              }
          });
            

        if ( layout.choropleths ) {

          var group_colored_countries = group_main
            .append('g')
            .classed('colored_countries', true);

          renderedDataElements.choropleths = group_colored_countries
            .selectAll("path")
            .data(layout.choropleths)
            .enter()
            .append("path")
            .attr({
              class : function (datum) {
                return datum.class;
              },
              d : function (datum) {
                return datum.d;
              },
              fill: function (datum) {
                return datum.color;
              },
              tdgtitle : function (datum) {
                return datum.tooltip;
              }
            })
            .style({
              stroke: props.choropleth.border.color,
              'stroke-width': props.choropleth.border.width 
            });
        }

        if ( layout.bubbles ) {
          var group_bubbles = group_main
            .append('g')
            .classed('bubbles', true);
 
          renderedDataElements.bubbles = group_bubbles
            .selectAll("circle")
            .data( layout.bubbles )
            .enter()
            .append("circle")
            .attr({
              r: function( datum ){
                return datum.size; 
              },
              cx: function( datum ){
                return datum.pos[0]; 
              },
              cy: function( datum ){
                return datum.pos[1]; 
              },
              fill: function (datum) {
                return datum.color;
              },
              tdgtitle : function (datum) {
                return datum.tooltip;
              }
            })
            .style({
              stroke: props.bubbles.border.color,
              'stroke-width': props.bubbles.border.width 
            });
        }

        if ( layout.colorLegend ) {
            var group_legend = group_main
              .append('g')
              .classed('legend-color', true)
              .attr(
                'transform',
                'translate(' + layout.colorLegend.translate + ')'
              );

            renderColorLegend(group_legend, layout.colorLegend, props);
        }

	if ( layout.sizeLegend ) {
          var group_legend = group_main
            .append('g')
            .classed('legend-color', true)
            .attr(
              'transform',
              'translate(' + layout.sizeLegend.translate + ')'
            );
          
          renderSizeLegend(
            group_legend,
            layout.sizeLegend,
            props
          );
	}

        return renderedDataElements;
    }

    function renderSizeLegend(group_legend, legendLayout, props) {
      var bg = group_legend
        .append('rect')
        .attr({
          width: legendLayout.width,
          height: legendLayout.height,
          rx: props.sizeLegend.border.round,
          ry: props.sizeLegend.border.round
        })
        .style({
          fill: props.sizeLegend.background.color,
          stroke: props.sizeLegend.border.color,
          'stroke-width': props.sizeLegend.border.width
        });

      group_legend
        .append('g')
        .classed('title', true)
        .attr(
          'transform',
          'translate(' + legendLayout.title.translate + ')'
        )
        .append('text')
        .attr('dy', '.35em')
        .style({
          font: props.sizeLegend.title.font,
          fill: props.sizeLegend.title.color,
          'text-anchor': 'middle'
        })
        .text(legendLayout.title.text);

      var halfArcsGroup = group_legend
        .append('g')
        .classed('halfArcs', true)
        .attr(
          'transform',
          'translate(' + legendLayout.halfArcsGroup.translate + ')'
        );

      halfArcsGroup.selectAll('path.arc')
        .data(legendLayout.halfArcsGroup.halfArcs)
        .enter()
        .append('path')
        .classed('arc', true)
        .attr('d', function(d){
          return halfArcPath( d.x, d.y, d.size );
        })
        .attr('stroke', 'black');

      halfArcsGroup.selectAll('text.label')
        .data(legendLayout.halfArcsGroup.labels)
        .enter()
        .append('text')
        .classed('label', true)
        .attr('x', function(d){
          return d.x;
        })
        .attr('y', function(d){
          return d.y;
        })
        .text(function(d){
          return d.text;
        })
        .attr('dy', '.35em')
        .attr('fill', 'black');
    }
    
    function fade ( opacity, elements ) {
      return function ( d ) {

        var chageOpacityElements = elements.filter(function (el_d) {
          return el_d !== d;
        }); 

        chageOpacityElements
          .transition('fade')
          .duration(400)
          .style('opacity', opacity);
      };
    }
    
    function enableDataElsInteractions ( elements ) {
      elements
        .on('mouseover', fade(0.3, elements))
        .on('mouseout', fade(1, elements));
    }

    // --------------------------------- END OF Z1
    return function(user_props) {
      var props = {
          width: 300,
          height: 400,
          data: [],
          buckets: null,
          isInteractionDisabled: false,
          onRenderComplete: function() { throw new Error('onRenderComplete is not implemented');},

          countries: {
            exclude: [],
            defaultColor: 'lightgrey',
            borders: {
              color: 'black',
              width: 1
            }
          },

          colorScale: {
            range: ['#d7ebef', '#4a89db'],
          },
          
          choropleth: {
            border: {
              color: 'black',
              width: 1 
            }
          },

          bubbles: {
            border: {
              color: 'black',
              width: 1 
            },
            defaultColor: '#4a89db',
            bubbleSizeRange: [7, 17]
          },

          colorLegend: {
            enabled: true,
            background: {
              color: 'none'
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
          },
          sizeLegend: { // add to properties.json
            enabled: true,
            background: {
              color: 'none'
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
          },
          measureLabel: function(){ throw new Error('need measureLabel function');},
          formatNumber: function(){ throw new Error('need formatNumber function');}
        };

        var innerProps = {
            pad: 5,
            colorLegend: {
                maxHeight: 200
            }
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

        function getIsBubbleMode (data){
          return cleanData.every(function(datum){
           return datum.latitude != null
            && datum.longitude != null; 
          }); 
        }

        function chart(selection) {

            var data = getCleanedData( props.data, props.countries.exclude );
            
            var group_main = selection.append('g')
              .classed('group-main', true);
            
            var l = getLayout(data, props, innerProps);


            var renderedDataEls = render( group_main, l, props, innerProps );
            
            enableDataElsInteractions(
             renderedDataEls.bubbles ? renderedDataEls.bubbles : renderedDataEls.choropleths
            );
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
