/* globals _*/
(function() {
  // Optional: if defined, is invoked once at the very beginning of each Moonbeam draw cycle
  // Use this to configure a specific Moonbeam instance before rendering.
  // Arguments:
  //  - preRenderConfig: the standard callback argument object
  function preRenderCallback(preRenderConfig) {
    preRenderConfig.moonbeamInstance.legend.visible = false;

          /*preRenderConfig.moonbeamInstance.eventDispatcher = { // testing drilling capability
  events: [
    { event: 'setURL', object: 'riser', series: 0, group: 0, url: 'http://google.com' ,target: '_blank' }
  ]
          };*/
  }

  function getFormatedBuckets ( renderConfig ) {
    if ( !renderConfig.dataBuckets || !renderConfig.dataBuckets.buckets ) {
      return;
    }

    var bkts = renderConfig.dataBuckets.buckets,
      modif_bkts = {};

    for ( var bkt in bkts ) {
      if ( bkts.hasOwnProperty( bkt ) ) {
        modif_bkts[bkt] = Array.isArray( bkts[bkt].title ) ? bkts[bkt].title : [bkts[bkt].title];
      }
    }

    return modif_bkts;
  }

  function jsonCpy( el ) {
    return JSON.parse(JSON.stringify(el));
  }

  // Required: Is invoked in the middle of each Moonbeam draw cycle
  // This is where your extension should be rendered
  // Arguments:
  //  - renderConfig: the standard callback argument object, including additional properties width, height, etc
  function renderCallback(renderConfig) {
    var chart = renderConfig.moonbeamInstance;
    var props = JSON.parse(JSON.stringify(renderConfig.properties));

    props.width = renderConfig.width;
    props.height = renderConfig.height;

    props.data = (renderConfig.data || []).map(function(datum){
      var datumCpy = jsonCpy(datum);
      // drill down can't be supported because single datum describes a relationship, not a  node
      datumCpy.elClassName = chart.buildClassName('riser', datum._s, datum._g, 'bar');
      return datumCpy;
    });

    //props.data = renderConfig.data;
    props.measureLabel = chart.measureLabel;
    props.formatNumber = chart.formatNumber;

    props.buckets = getFormatedBuckets(renderConfig);

    props.isInteractionDisabled = renderConfig.disableInteraction;

    //props.onRenderComplete = renderConfig.renderComplete.bind(renderConfig);

    var container = d3.select(renderConfig.container)
            .attr('class', 'com_tdg_cluster');

    // ---------------- INIT YOUR EXTENSION HERE

    var tdg_cluster_chart = tdg_cluster(props);
    tdg_cluster_chart(container);

    // ---------------- END ( INIT YOUR EXTENSION HERE )

    // ---------------- CALL updateToolTips IF YOU USE MOONBEAM TOOLTIP
    renderConfig.renderComplete();
    //renderConfig.modules.tooltip.updateToolTips();
  }

  function getInvokeAfter (cb, count) {
    if (!count && typeof cb === 'function' ) cb();

    return function () {
        if (!(--count) && typeof cb === 'function') cb();
    };
  }

  function noDataRenderCallback (renderConfig) {
    var chart = renderConfig.moonbeamInstance;
    var props = renderConfig.properties;

    chart.legend.visible = false;

    props.width = renderConfig.width;
    props.height = renderConfig.height;
    props.data = [{"levels":["ENGLAND","JAGUAR","V12XKE AUTO","CONVERTIBLE"],"_s":0,"_g":0},{"levels":["ENGLAND","JAGUAR","XJ12L AUTO","SEDAN"],"_s":0,"_g":1},{"levels":["ENGLAND","JENSEN","INTERCEPTOR III","SEDAN"],"_s":0,"_g":2},{"levels":["ENGLAND","TRIUMPH","TR7","HARDTOP"],"_s":0,"_g":3},{"levels":["FRANCE","PEUGEOT","504 4 DOOR","SEDAN"],"_s":0,"_g":4},{"levels":["ITALY","ALFA ROMEO","2000 4 DOOR BERLINA","SEDAN"],"_s":0,"_g":5},{"levels":["ITALY","ALFA ROMEO","2000 GT VELOCE","COUPE"],"_s":0,"_g":6},{"levels":["ITALY","ALFA ROMEO","2000 SPIDER VELOCE","ROADSTER"],"_s":0,"_g":7},{"levels":["ITALY","MASERATI","DORA 2 DOOR","COUPE"],"_s":0,"_g":8},{"levels":["JAPAN","DATSUN","B210 2 DOOR AUTO","SEDAN"],"_s":0,"_g":9},{"levels":["JAPAN","TOYOTA","COROLLA 4 DOOR DIX AUTO","SEDAN"],"_s":0,"_g":10},{"levels":["W GERMANY","AUDI","100 LS 2 DOOR AUTO","SEDAN"],"_s":0,"_g":11},{"levels":["W GERMANY","BMW","2002 2 DOOR","SEDAN"],"_s":0,"_g":12},{"levels":["W GERMANY","BMW","2002 2 DOOR AUTO","SEDAN"],"_s":0,"_g":13},{"levels":["W GERMANY","BMW","3.0 SI 4 DOOR","SEDAN"],"_s":0,"_g":14},{"levels":["W GERMANY","BMW","3.0 SI 4 DOOR AUTO","SEDAN"],"_s":0,"_g":15},{"levels":["W GERMANY","BMW","530I 4 DOOR","SEDAN"],"_s":0,"_g":16},{"levels":["W GERMANY","BMW","530I 4 DOOR AUTO","SEDAN"],"_s":0,"_g":17}];
    props.measureLabel = chart.measureLabel;
    props.formatNumber = chart.formatNumber;

    props.buckets = {"levels":["COUNTRY","CAR","MODEL","BODYTYPE"]};

    props.isInteractionDisabled = renderConfig.disableInteraction;

    //var invokeAfterTwo = getInvokeAfter(renderConfig.renderComplete.bind(renderConfig), 2);

    //props.onRenderComplete = invokeAfterTwo;

    var container = d3.select(renderConfig.container)
            .attr('class', 'com_tdg_cluster');

    // ---------------- INIT YOUR EXTENSION HERE

    var tdg_cluster_chart = tdg_cluster(props);
    tdg_cluster_chart(container);

    // ---------------- END ( INIT YOUR EXTENSION HERE )

    // ---------------- CALL updateToolTips IF YOU USE MOONBEAM TOOLTIP
    //renderConfig.modules.tooltip.updateToolTips();

    // ADD TRANSPARENT SCREEN

    container.append("rect")
      .attr({
        width: props.width,
        height: props.height
      })
      .style({
        fill: 'white',
        opacity: 0.3
      });

          // ADD NO DATA TEXT

      container.append('text')
        .text('Add more measures or dimensions')
        .attr({
          'text-anchor': 'middle',
          y: props.height / 2,
          x: props.width / 2
        })
        .style({
          'font-weight' : 'bold',
          'font-size' : '14px',
          dy: '0.35em',
          fill: 'grey'
        });

    //invokeAfterTwo();
  }

	// Your extension's configuration
  var config = {
    id: 'com.ibi.cluster',  // string that uniquely identifies this extension
    preRenderCallback: preRenderCallback,  // reference to a function that is called right *before* your extension is rendered.  Will be passed one 'preRenderConfig' object, defined below.  Use this to configure a Monbeam instance as needed
    renderCallback: renderCallback,  // reference to a function that will draw the actual chart.  Will be passed one 'renderConfig' object, defined below
    noDataRenderCallback: noDataRenderCallback,
    resources:  {  // Additional external resources (CSS & JS) required by this extension
      script: ['lib/d3.min.js', 'lib/cluster.js'],
      css: []
    },
    modules: {
      eventHandler: {
        supported: true
      },
      /*dataSelection: {
              supported: true,  // Set this true if your extension wants to enable data selection
              needSVGEventPanel: false, // if you're using an HTML container or altering the SVG container, set this to true and Moonbeam will insert the necessary SVG elements to capture user interactions
              svgNode: function(arg){}  // if you're using an HTML container or altering the SVG container, return a reference to your root SVG node here.
      },*/
      tooltip: {
        supported: true  // Set this true if your extension wants to enable HTML tooltips
      }
    }
  };

	// Required: this call will register your extension with Moonbeam
  tdgchart.extensionManager.register(config);

}());
