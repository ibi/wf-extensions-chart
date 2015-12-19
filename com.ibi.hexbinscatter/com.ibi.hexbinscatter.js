/* Copyright 1996-2015 Information Builders, Inc. All rights reserved. */
/* $Revision: 1.8 $ */

(function() {

    // All extension callback functions are passed a standard 'renderConfig' argument:
    //
    // Properties that are always available:
    //   moonbeamInstance: the chart instance currently being rendered
    //   data: the data set being rendered
    //   properties: the block of your extension's properties, as they've been set by the user
    //   modules: the 'modules' object from your extension's config, along with additional API methods
    //   
    // Properties available during render callback:
    //   width: width of the container your extension renders into, in px
    //   height: height of the container your extension renders into, in px
    //   containerIDPrefix:  the ID of the DOM container your extension renders into.  Prepend this to *all* IDs your extension generates, to ensure multiple copies of your extension work on one page.
    //   container: DOM node for your extension to render into;
    //   rootContainer: DOM node containing the specific chart engine instance being rendered.

    // Required: Invoked during each chart engine draw cycle
    // This is where your extension should be rendered
    // Arguments:
    //  - renderConfig: the standard callback argument object, including additional properties width, height, etc
    function renderCallback(renderConfig) {
        debugger;

        var chart = renderConfig.moonbeamInstance;
        var props = JSON.parse(JSON.stringify(renderConfig.properties));
        
        props.height = renderConfig.height;
        props.width = renderConfig.width;
        props.axes = {
            x: {
                title: renderConfig.dataBuckets.buckets.x.title
            },
            y: {
                title: renderConfig.dataBuckets.buckets.y.title
            }
        };

        var container = d3.select(renderConfig.container)
            .attr('class', 'com_ibi_hexbinscatter');
		
		if ( renderConfig.dataBuckets.buckets.detail ) {
			var temp;
			props.data = JSON.parse(JSON.stringify(chart.data[0]));
			props.data.forEach(function(d){
              temp = {};
              if (!Array.isArray(renderConfig.dataBuckets.buckets.detail.title)) {
                  renderConfig.dataBuckets.buckets.detail.title = [renderConfig.dataBuckets.buckets.detail.title];
              }
              renderConfig.dataBuckets.buckets.detail.title.forEach(function(title, idx) {
                  temp[title] = d.detail[idx];
              });
              d.detail = temp;
              });
		} else {
			props.data = JSON.parse(JSON.stringify(chart.data[0]));
		}

        var scatter = tdgscatter.init(props);
        container.call(scatter);
		renderConfig.modules.tooltip.updateToolTips();
    }

    function noDataRenderCallback(renderConfig) {
        
        var chart = renderConfig.moonbeamInstance;
        var props = JSON.parse(JSON.stringify(renderConfig.properties));

        props.height = renderConfig.height;
        props.width = renderConfig.width;

        var container = d3.select(renderConfig.container)
            .attr('class', 'com_ibi_hexbinscatter');

        props.data = [{"x":657.646238330696,"y":115.26901199606942,"aggregate":35.97005715128034},{"x":844.7449635938638,"y":234.80611321141188,"aggregate":26.557269948534667},{"x":815.3292490237986,"y":142.89590787346646,"aggregate":54.102844558656216},{"x":891.6672222651285,"y":149.8514135515154,"aggregate":0.13693012297153473},{"x":903.3949318633946,"y":179.50722031601015,"aggregate":21.614241902716458},{"x":823.4191931689999,"y":257.78145062777617,"aggregate":37.74820487014949},{"x":1125.3957031421,"y":37.328084031037065,"aggregate":74.4319177698344},{"x":872.6305133684208,"y":202.92400455826163,"aggregate":90.03596464172006},{"x":847.4062310836049,"y":357.47222573318976,"aggregate":89.51293725986034},{"x":909.6397857543553,"y":227.76532266810875,"aggregate":40.459604328498244},{"x":926.2570738754348,"y":195.88155656881278,"aggregate":55.27872825041413},{"x":942.6723303441712,"y":73.3980899442627,"aggregate":66.15421683527529},{"x":865.727185176335,"y":263.8538450993319,"aggregate":44.233290711417794},{"x":825.615144992103,"y":42.76864405157164,"aggregate":49.47087785694748},{"x":1002.226558290477,"y":79.52176161970807,"aggregate":83.36956514976919},{"x":892.8824378037468,"y":291.89837158320597,"aggregate":24.236428667791188},{"x":897.2037902269286,"y":149.9751023389898,"aggregate":45.37745863199234},{"x":1006.7369555667426,"y":150.0646656780102,"aggregate":40.40436786599457},{"x":805.8649084052037,"y":78.02982972414252,"aggregate":85.5540148448199},{"x":829.5775534936913,"y":202.2633397533477,"aggregate":83.06605378165841},{"x":859.2415733666322,"y":114.43422058800431,"aggregate":38.873709412291646},{"x":929.910484323671,"y":190.72589357560292,"aggregate":92.07459958270192},{"x":833.2814209988887,"y":96.96205086577032,"aggregate":24.483081116341054},{"x":679.0257044895341,"y":78.59289162592705,"aggregate":40.23134955205023},{"x":821.434808663312,"y":194.34492027082746,"aggregate":75.87426498066634},{"x":805.5588203042981,"y":15.366703697874357,"aggregate":23.22869549971074},{"x":749.6090065270257,"y":216.30687802978719,"aggregate":12.948649376630783},{"x":887.9534136051022,"y":68.29155765579651,"aggregate":79.68922760337591},{"x":900.3529696393407,"y":118.47709192584182,"aggregate":37.48682904988527},{"x":908.2582249384832,"y":184.8038901820022,"aggregate":60.44771699234843},{"x":915.5266861417024,"y":209.94080810952443,"aggregate":22.69328141119331},{"x":871.0680101116462,"y":245.73041133633723,"aggregate":19.732538633979857},{"x":1005.9359644903259,"y":180.6111038181729,"aggregate":53.33273080177605},{"x":935.0974187378492,"y":203.81200075500917,"aggregate":94.56798345781863},{"x":882.3013559174202,"y":97.2461869882754,"aggregate":69.20553494710475},{"x":881.9224456994885,"y":125.66872359666905,"aggregate":97.53325283527374},{"x":763.3565360743776,"y":92.21629617913958,"aggregate":13.523312890902162},{"x":787.3718577824286,"y":212.14988938793226,"aggregate":88.60687585547566},{"x":696.1254993278877,"y":175.98858844975044,"aggregate":98.7533803563565},{"x":756.6187194102697,"y":97.27075564013167,"aggregate":62.60128295980394},{"x":674.6382257453669,"y":89.12309976590798,"aggregate":89.01853621937335},{"x":773.2540696456506,"y":89.93558810212356,"aggregate":92.865792918019},{"x":980.2567394213017,"y":160.76143981966973,"aggregate":73.26699651312083},{"x":824.9752110126675,"y":217.80201047261113,"aggregate":63.609590637497604},{"x":903.9827894716714,"y":127.81737769295255,"aggregate":94.72284947987646},{"x":729.5860400229219,"y":264.62314513805757,"aggregate":25.189101323485374},{"x":885.8678100531747,"y":255.04158113795802,"aggregate":64.78152631316334},{"x":774.6931851138629,"y":181.43446381726784,"aggregate":67.48365443199873},{"x":739.8831273812995,"y":173.40044609420605,"aggregate":54.25544783938676},{"x":785.9928320074021,"y":201.49286812064838,"aggregate":48.366457712836564},{"x":652.2761506457587,"y":90.84441099890805,"aggregate":22.745909122750163},{"x":825.6289283349851,"y":220.18920671987166,"aggregate":80.50752498675138},{"x":837.1718594298727,"y":29.075999930356545,"aggregate":23.290487355552614},{"x":932.6676527116744,"y":101.7513675097013,"aggregate":59.79139662813395},{"x":735.7046145275041,"y":104.33185027464167,"aggregate":6.410297378897667},{"x":892.1906456753144,"y":130.7191368576178,"aggregate":22.64927364885807},{"x":977.437869667053,"y":148.42222347507456,"aggregate":77.67334671225399},{"x":869.7479254987986,"y":233.86283097456885,"aggregate":71.87225976958871},{"x":879.1030970535624,"y":234.31095472874222,"aggregate":22.973015974275768},{"x":836.4310188648016,"y":273.32091604673656,"aggregate":0.8070463314652443},{"x":856.489796750225,"y":217.48672308827938,"aggregate":59.077419666573405},{"x":921.1466148228493,"y":243.78615824043362,"aggregate":27.95034593436867},{"x":837.866027097866,"y":149.95974346288162,"aggregate":74.87919861450791},{"x":1008.7539466366644,"y":197.91176874326706,"aggregate":3.8154636276885867},{"x":771.2720535255778,"y":81.25900006433339,"aggregate":71.46836114116013},{"x":921.8289307143018,"y":220.0679445265725,"aggregate":63.98342368192971},{"x":775.9833257898339,"y":103.9003041424131,"aggregate":1.8017485970631242},{"x":919.4658219555065,"y":171.74401819021833,"aggregate":90.12682409957051},{"x":792.8631882549759,"y":103.7713163520559,"aggregate":45.377333904616535},{"x":836.2923085176243,"y":212.0987966150677,"aggregate":93.06192249059677},{"x":804.0624682403621,"y":45.385263028672355,"aggregate":3.7146543385460973},{"x":833.8751824000909,"y":214.0905128293196,"aggregate":30.90242121834308},{"x":903.8047584168319,"y":70.2460157082108,"aggregate":48.832663730718195},{"x":831.4128628703041,"y":44.8681262371809,"aggregate":10.664304881356657},{"x":978.8121831089288,"y":180.26155030070225,"aggregate":60.56039133109152},{"x":1071.3251956076813,"y":133.04288728680623,"aggregate":85.15817367006093},{"x":789.7533850153512,"y":191.02683775409716,"aggregate":88.27256029471755},{"x":856.5232406584287,"y":168.1450418016555,"aggregate":34.96116069145501},{"x":920.1537319242693,"y":147.4284807627388,"aggregate":74.88792154472321},{"x":821.9564053651943,"y":268.31023646784615,"aggregate":33.448376413434744},{"x":1011.1551212712677,"y":0.6134035202030645,"aggregate":48.81356409750879},{"x":979.7657068780138,"y":268.8802011512447,"aggregate":85.68185393232852},{"x":851.932911027944,"y":68.81213704316401,"aggregate":11.962564615532756},{"x":939.5411140238666,"y":54.07878070940444,"aggregate":45.8259544800967},{"x":816.0603072515117,"y":199.35322412992548,"aggregate":49.38229841645807},{"x":892.2240424807899,"y":221.64959303728895,"aggregate":36.00767145399004},{"x":786.4054991766932,"y":191.0939993287177,"aggregate":11.954271397553384},{"x":827.7875360238274,"y":273.8335866469608,"aggregate":72.23712150007486},{"x":855.4354839259563,"y":251.87732666872864,"aggregate":11.855045892298222},{"x":867.7439381354029,"y":248.07940891840994,"aggregate":51.89605241175741},{"x":967.6754371985298,"y":260.2820176877317,"aggregate":48.43898711260408},{"x":821.8157835136607,"y":119.51454831532573,"aggregate":63.978412258438766},{"x":855.8810998437912,"y":120.42822736529831,"aggregate":65.07914792746305},{"x":939.3908938917737,"y":176.31663078707962,"aggregate":34.08179860562086},{"x":974.8805172594433,"y":208.61993519129777,"aggregate":2.6042434154078364},{"x":902.3205971657135,"y":175.96733844860074,"aggregate":28.76667350064963},{"x":973.9409916401817,"y":89.5496481763754,"aggregate":39.44142151158303},{"x":857.2040047785117,"y":186.93150861948834,"aggregate":6.592260976321995},{"x":1001.8478156454373,"y":269.1698589174312,"aggregate":52.21238925587386},{"x":984.5878233956425,"y":77.84821100851129,"aggregate":0.22885228972882032}];

        var scatter = tdgscatter.init(props);
        container.call(scatter);

        container.append("rect")
            .attr({
                width: props.width,
                height: props.height
            })
            .style({
                fill: 'white',
                opacity: 0.9
            });
        
        container.append('text')
            .text('Add more measures or dimensions')
            .attr({
                'text-anchor': 'middle',
                y: props.height / 2,
                x: props.width / 2
            })
            .style({
                'font-weight' : 'bold',
                'font-size' : '14',
                dy: '0.35em',
                fill: 'grey'
            });
    }

    // Your extension's configuration
    var config = {
        id: 'com.ibi.hexbinscatter', // string that uniquely identifies this extension
        containerType: 'svg', // either 'html' or 'svg' (default)
        renderCallback: renderCallback, // reference to a function that will draw the actual chart.  Will be passed one 'renderConfig' object, defined below
        noDataRenderCallback: noDataRenderCallback,
        resources: { // Additional external resources (CSS & JS) required by this extension
            script: ['lib/d3.min.js', 'lib/scatter.js', 'lib/axes.js', 'lib/circles.js', 'lib/hexbin.js', 'lib/hexbinbg.js'],
            css: ['css/style.css']
        },
        modules: {
            dataSelection: {
                supported: true, // Set this true if your extension wants to enable data selection
                needSVGEventPanel: false, // if you're using an HTML container or altering the SVG container, set this to true and the chart engine will insert the necessary SVG elements to capture user interactions
                svgNode: function(arg) {} // if you're using an HTML container or altering the SVG container, return a reference to your root SVG node here.
            },
            tooltip: {
                supported: true // Set this true if your extension wants to enable HTML tooltips
            }
            // Not used in this extension; here for documentation purposes.
            //			colorScale: {
            //				supported: true,
            //				minMax: function(arg){}  // Optional: return a {min, max} object to use for the color scale min & max.
            //			}
            //			sizeScale: {
            //				supported: false,
            //				minMax: function(arg){}  // Optional: return a {min, max} object to use for the size scale min & max.
            //			},
            //			legend: {
            //				colorMode: function(arg){}, // Return either 'data' or 'series'.  If implemented, force the chart engine to use this color mode legend
            //				sizeMode: function(arg){},  // return either 'size' or falsey.  If implemented, force the chart engine to use this size legend
            //			}
        }
    };

    // Required: this call will register your extension with the chart engine
    tdgchart.extensionManager.register(config);

}());