/* globals _*/
(function() {
	// Optional: if defined, is invoked once at the very beginning of each Moonbeam draw cycle
	// Use this to configure a specific Moonbeam instance before rendering.
	// Arguments:
	//  - preRenderConfig: the standard callback argument object
	function preRenderCallback(preRenderConfig) {

		/*preRenderConfig.moonbeamInstance.eventDispatcher = { // testing drilling capability
        events: [
          { event: 'setURL', object: 'riser', series: 0, group: 0, url: 'http://google.com' ,target: '_blank' }
        ]
		};*/

		var buck = preRenderConfig.dataBuckets.buckets;
		if ( !buck.date || !buck.value ) {
			preRenderConfig.moonbeamInstance.legend.visible = false;
		}
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

	function isDatumConvertableToDate(datum) {
		return !isNaN((new Date(datum)).getTime());
	}

	function isNumber(number) {
		return !isNaN(number);
	}

	function isValidDatum (datum) {
		return isDatumConvertableToDate(datum.date) && isNumber(datum.value);
	}

	// Required: Is invoked in the middle of each Moonbeam draw cycle
	// This is where your extension should be rendered
	// Arguments:
	//  - renderConfig: the standard callback argument object, including additional properties width, height, etc
	function renderCallback(renderConfig) {
		var chart = renderConfig.moonbeamInstance;
		var props = renderConfig.properties;

		props.width = renderConfig.width;
		props.height = renderConfig.height;

		props.data = (renderConfig.data || []).map(function(datum){
			var datumCpy = jsonCpy(datum);
			datumCpy.elClassName = chart.buildClassName('riser', datum._s, datum._g, 'bar');
			return datumCpy;
		}).filter(isValidDatum);

		//props.data = JSON.parse(JSON.stringify(renderConfig.data || [])).map(d);
		props.measureLabel = chart.measureLabel;
		props.colorScale = renderConfig.modules.colorScale.getColorScale();
		props.formatNumber = chart.formatNumber;

		props.buckets = getFormatedBuckets(renderConfig);

		var container = d3.select(renderConfig.container)
			.attr('class', 'com_tdg_calendar');

		// ---------------- INIT YOUR EXTENSION HERE

		var tdg_calendar_chart = tdg_calendar(props);
		tdg_calendar_chart(container);

		// ---------------- END ( INIT YOUR EXTENSION HERE )

		// ---------------- CALL updateToolTips IF YOU USE MOONBEAM TOOLTIP
		renderConfig.modules.tooltip.updateToolTips();

		renderConfig.renderComplete();
	}

	function noDataRenderCallback (renderConfig) {
		var chart = renderConfig.moonbeamInstance;
		var props = renderConfig.properties;

		chart.legend.visible = false;

		props.width = renderConfig.width;
		props.height = renderConfig.height;

		var localData = [{"date":"06102010","value":81292,"_s":0,"_g":0},{"date":"06112010","value":70013,"_s":0,"_g":1},{"date":"06122010","value":92196,"_s":0,"_g":2},{"date":"06142010","value":91936,"_s":0,"_g":3},{"date":"06152010","value":98841,"_s":0,"_g":4},{"date":"06192010","value":7074,"_s":0,"_g":5},{"date":"06292010","value":8831,"_s":0,"_g":6},{"date":"06302010","value":22524,"_s":0,"_g":7},{"date":"07012010","value":85303,"_s":0,"_g":8},{"date":"07062010","value":29853,"_s":0,"_g":9},{"date":"07082010","value":72972,"_s":0,"_g":10},{"date":"07112010","value":43092,"_s":0,"_g":11},{"date":"07162010","value":76260,"_s":0,"_g":12},{"date":"07182010","value":25007,"_s":0,"_g":13},{"date":"07212010","value":45078,"_s":0,"_g":14},{"date":"07232010","value":30525,"_s":0,"_g":15},{"date":"07272010","value":4351,"_s":0,"_g":16},{"date":"07282010","value":115527,"_s":0,"_g":17},{"date":"07302010","value":6271,"_s":0,"_g":18},{"date":"08012010","value":69681,"_s":0,"_g":19},{"date":"08022010","value":65712,"_s":0,"_g":20},{"date":"08072010","value":92917,"_s":0,"_g":21},{"date":"08122010","value":15675,"_s":0,"_g":22},{"date":"08162010","value":128079,"_s":0,"_g":23},{"date":"08272010","value":56999,"_s":0,"_g":24},{"date":"08312010","value":21303,"_s":0,"_g":25},{"date":"09012010","value":27659,"_s":0,"_g":26},{"date":"09032010","value":84156,"_s":0,"_g":27},{"date":"09042010","value":30061,"_s":0,"_g":28},{"date":"09062010","value":27566,"_s":0,"_g":29},{"date":"09072010","value":58798,"_s":0,"_g":30},{"date":"09112010","value":32100,"_s":0,"_g":31},{"date":"09142010","value":53969,"_s":0,"_g":32},{"date":"09162010","value":8985,"_s":0,"_g":33},{"date":"09232010","value":91081,"_s":0,"_g":34},{"date":"10012010","value":74737,"_s":0,"_g":35},{"date":"10062010","value":99952,"_s":0,"_g":36},{"date":"10122010","value":41608,"_s":0,"_g":37},{"date":"10182010","value":29558,"_s":0,"_g":38},{"date":"10222010","value":2979,"_s":0,"_g":39},{"date":"11022010","value":86784,"_s":0,"_g":40},{"date":"11052010","value":34770,"_s":0,"_g":41},{"date":"11222010","value":85696,"_s":0,"_g":42},{"date":"11292010","value":29265,"_s":0,"_g":43},{"date":"12022010","value":65195,"_s":0,"_g":44},{"date":"12032010","value":161262,"_s":0,"_g":45},{"date":"12102010","value":24183,"_s":0,"_g":46},{"date":"12112010","value":49981,"_s":0,"_g":47},{"date":"12122010","value":30930,"_s":0,"_g":48},{"date":"12132010","value":37900,"_s":0,"_g":49},{"date":"12142010","value":84872,"_s":0,"_g":50},{"date":"12182010","value":99241,"_s":0,"_g":51},{"date":"12232010","value":126344,"_s":0,"_g":52},{"date":"12312010","value":86966,"_s":0,"_g":53},{"date":"01012011","value":135282,"_s":0,"_g":54},{"date":"01022011","value":69642,"_s":0,"_g":55},{"date":"01052011","value":54109,"_s":0,"_g":56},{"date":"01062011","value":60727,"_s":0,"_g":57},{"date":"01072011","value":65049,"_s":0,"_g":58},{"date":"01102011","value":13379,"_s":0,"_g":59},{"date":"01132011","value":44574,"_s":0,"_g":60},{"date":"01192011","value":10538,"_s":0,"_g":61},{"date":"01202011","value":91962,"_s":0,"_g":62},{"date":"01242011","value":43145,"_s":0,"_g":63},{"date":"01312011","value":76469,"_s":0,"_g":64},{"date":"02042011","value":77631,"_s":0,"_g":65},{"date":"02052011","value":19891,"_s":0,"_g":66},{"date":"02062011","value":64504,"_s":0,"_g":67},{"date":"02152011","value":36953,"_s":0,"_g":68},{"date":"02182011","value":50218,"_s":0,"_g":69},{"date":"02212011","value":30857,"_s":0,"_g":70},{"date":"02222011","value":83436,"_s":0,"_g":71},{"date":"02242011","value":89705,"_s":0,"_g":72},{"date":"02252011","value":78398,"_s":0,"_g":73},{"date":"03032011","value":35611,"_s":0,"_g":74},{"date":"03052011","value":65890,"_s":0,"_g":75},{"date":"03132011","value":32949,"_s":0,"_g":76},{"date":"03142011","value":58838,"_s":0,"_g":77},{"date":"03172011","value":44115,"_s":0,"_g":78},{"date":"03212011","value":9781,"_s":0,"_g":79},{"date":"03222011","value":72282,"_s":0,"_g":80},{"date":"03282011","value":32017,"_s":0,"_g":81},{"date":"03292011","value":62621,"_s":0,"_g":82},{"date":"04092011","value":22962,"_s":0,"_g":83},{"date":"04102011","value":87689,"_s":0,"_g":84},{"date":"04112011","value":71862,"_s":0,"_g":85},{"date":"04172011","value":87368,"_s":0,"_g":86},{"date":"04182011","value":63609,"_s":0,"_g":87},{"date":"04202011","value":123195,"_s":0,"_g":88},{"date":"04272011","value":23495,"_s":0,"_g":89},{"date":"05062011","value":70768,"_s":0,"_g":90},{"date":"05072011","value":52607,"_s":0,"_g":91},{"date":"05092011","value":92511,"_s":0,"_g":92},{"date":"05102011","value":5105,"_s":0,"_g":93},{"date":"05112011","value":15565,"_s":0,"_g":94},{"date":"05122011","value":62458,"_s":0,"_g":95},{"date":"05192011","value":103768,"_s":0,"_g":96},{"date":"05252011","value":23885,"_s":0,"_g":97},{"date":"06032011","value":53805,"_s":0,"_g":98},{"date":"06042011","value":12325,"_s":0,"_g":99},{"date":"06222011","value":83736,"_s":0,"_g":100},{"date":"06232011","value":25085,"_s":0,"_g":101},{"date":"06242011","value":30616,"_s":0,"_g":102},{"date":"06282011","value":21124,"_s":0,"_g":103},{"date":"07012011","value":76519,"_s":0,"_g":104},{"date":"07072011","value":40592,"_s":0,"_g":105},{"date":"07102011","value":176798,"_s":0,"_g":106},{"date":"07182011","value":60969,"_s":0,"_g":107},{"date":"07212011","value":57346,"_s":0,"_g":108},{"date":"07232011","value":5973,"_s":0,"_g":109},{"date":"07262011","value":5354,"_s":0,"_g":110},{"date":"07302011","value":40926,"_s":0,"_g":111},{"date":"08042011","value":63390,"_s":0,"_g":112},{"date":"08052011","value":16820,"_s":0,"_g":113},{"date":"08102011","value":71585,"_s":0,"_g":114},{"date":"08132011","value":64818,"_s":0,"_g":115},{"date":"08232011","value":72970,"_s":0,"_g":116},{"date":"08282011","value":65517,"_s":0,"_g":117},{"date":"09192011","value":21921,"_s":0,"_g":118},{"date":"09272011","value":17109,"_s":0,"_g":119},{"date":"09282011","value":15936,"_s":0,"_g":120},{"date":"10152011","value":96935,"_s":0,"_g":121},{"date":"10162011","value":19685,"_s":0,"_g":122},{"date":"10172011","value":2326,"_s":0,"_g":123},{"date":"10192011","value":28971,"_s":0,"_g":124},{"date":"10202011","value":64210,"_s":0,"_g":125},{"date":"10212011","value":83938,"_s":0,"_g":126},{"date":"10222011","value":103206,"_s":0,"_g":127},{"date":"10292011","value":73877,"_s":0,"_g":128},{"date":"10312011","value":146602,"_s":0,"_g":129},{"date":"11052011","value":18557,"_s":0,"_g":130},{"date":"11062011","value":80479,"_s":0,"_g":131},{"date":"11162011","value":59190,"_s":0,"_g":132},{"date":"11172011","value":74286,"_s":0,"_g":133},{"date":"11242011","value":83214,"_s":0,"_g":134},{"date":"11272011","value":67518,"_s":0,"_g":135},{"date":"11292011","value":26502,"_s":0,"_g":136},{"date":"11302011","value":98783,"_s":0,"_g":137},{"date":"12022011","value":18778,"_s":0,"_g":138},{"date":"12052011","value":60885,"_s":0,"_g":139},{"date":"12132011","value":144497,"_s":0,"_g":140},{"date":"12142011","value":42160,"_s":0,"_g":141},{"date":"12152011","value":80629,"_s":0,"_g":142},{"date":"12162011","value":67255,"_s":0,"_g":143},{"date":"12302011","value":87915,"_s":0,"_g":144},{"date":"12312011","value":62000,"_s":0,"_g":145},{"date":"01022012","value":70448,"_s":0,"_g":146},{"date":"01102012","value":26992,"_s":0,"_g":147},{"date":"01142012","value":1523,"_s":0,"_g":148},{"date":"01192012","value":90659,"_s":0,"_g":149},{"date":"01202012","value":56732,"_s":0,"_g":150},{"date":"01222012","value":47306,"_s":0,"_g":151},{"date":"01252012","value":59565,"_s":0,"_g":152},{"date":"02112012","value":48969,"_s":0,"_g":153},{"date":"02142012","value":57529,"_s":0,"_g":154},{"date":"02252012","value":17735,"_s":0,"_g":155},{"date":"02262012","value":87844,"_s":0,"_g":156},{"date":"02282012","value":84996,"_s":0,"_g":157},{"date":"02292012","value":107372,"_s":0,"_g":158},{"date":"03092012","value":3097,"_s":0,"_g":159},{"date":"03102012","value":84619,"_s":0,"_g":160},{"date":"03112012","value":291,"_s":0,"_g":161},{"date":"03152012","value":41740,"_s":0,"_g":162},{"date":"03192012","value":6856,"_s":0,"_g":163},{"date":"03242012","value":20779,"_s":0,"_g":164},{"date":"03282012","value":591,"_s":0,"_g":165},{"date":"03302012","value":87234,"_s":0,"_g":166},{"date":"04092012","value":66063,"_s":0,"_g":167},{"date":"04162012","value":55997,"_s":0,"_g":168},{"date":"04212012","value":87987,"_s":0,"_g":169},{"date":"04272012","value":87745,"_s":0,"_g":170},{"date":"05072012","value":127623,"_s":0,"_g":171},{"date":"05112012","value":4151,"_s":0,"_g":172},{"date":"05172012","value":87682,"_s":0,"_g":173},{"date":"05202012","value":93751,"_s":0,"_g":174},{"date":"05242012","value":90183,"_s":0,"_g":175},{"date":"05282012","value":42558,"_s":0,"_g":176},{"date":"06052012","value":95275,"_s":0,"_g":177},{"date":"06102012","value":66355,"_s":0,"_g":178},{"date":"06132012","value":20502,"_s":0,"_g":179},{"date":"06142012","value":63309,"_s":0,"_g":180},{"date":"06162012","value":55555,"_s":0,"_g":181},{"date":"06182012","value":37475,"_s":0,"_g":182},{"date":"07032012","value":58674,"_s":0,"_g":183},{"date":"07072012","value":24092,"_s":0,"_g":184},{"date":"07122012","value":81881,"_s":0,"_g":185},{"date":"07142012","value":43431,"_s":0,"_g":186},{"date":"07232012","value":136887,"_s":0,"_g":187},{"date":"07262012","value":68231,"_s":0,"_g":188},{"date":"07292012","value":98027,"_s":0,"_g":189},{"date":"08012012","value":73476,"_s":0,"_g":190},{"date":"08042012","value":73601,"_s":0,"_g":191},{"date":"08182012","value":47726,"_s":0,"_g":192},{"date":"08202012","value":7344,"_s":0,"_g":193},{"date":"08212012","value":15567,"_s":0,"_g":194},{"date":"08282012","value":51696,"_s":0,"_g":195},{"date":"09092012","value":80819,"_s":0,"_g":196},{"date":"09102012","value":83431,"_s":0,"_g":197},{"date":"09132012","value":28209,"_s":0,"_g":198},{"date":"09142012","value":72631,"_s":0,"_g":199},{"date":"09152012","value":27650,"_s":0,"_g":200},{"date":"09212012","value":57808,"_s":0,"_g":201},{"date":"09272012","value":6991,"_s":0,"_g":202},{"date":"09302012","value":16268,"_s":0,"_g":203},{"date":"10042012","value":917,"_s":0,"_g":204},{"date":"10112012","value":62216,"_s":0,"_g":205},{"date":"10132012","value":35889,"_s":0,"_g":206},{"date":"10142012","value":90527,"_s":0,"_g":207},{"date":"10222012","value":93590,"_s":0,"_g":208},{"date":"11022012","value":11666,"_s":0,"_g":209},{"date":"11052012","value":73708,"_s":0,"_g":210},{"date":"11072012","value":18682,"_s":0,"_g":211},{"date":"11082012","value":97015,"_s":0,"_g":212},{"date":"11162012","value":76411,"_s":0,"_g":213},{"date":"11202012","value":40505,"_s":0,"_g":214},{"date":"11212012","value":91906,"_s":0,"_g":215},{"date":"11222012","value":31919,"_s":0,"_g":216},{"date":"11252012","value":55816,"_s":0,"_g":217},{"date":"11282012","value":46265,"_s":0,"_g":218},{"date":"11292012","value":90712,"_s":0,"_g":219},{"date":"11302012","value":40249,"_s":0,"_g":220},{"date":"12032012","value":18907,"_s":0,"_g":221},{"date":"12042012","value":86926,"_s":0,"_g":222},{"date":"12052012","value":65414,"_s":0,"_g":223},{"date":"12112012","value":23082,"_s":0,"_g":224},{"date":"12142012","value":78584,"_s":0,"_g":225},{"date":"12182012","value":11660,"_s":0,"_g":226},{"date":"12272012","value":44389,"_s":0,"_g":227},{"date":"12282012","value":113778,"_s":0,"_g":228},{"date":"01012013","value":8142,"_s":0,"_g":229},{"date":"01052013","value":97592,"_s":0,"_g":230},{"date":"01112013","value":39853,"_s":0,"_g":231},{"date":"01182013","value":42051,"_s":0,"_g":232},{"date":"01212013","value":9461,"_s":0,"_g":233},{"date":"02022013","value":49703,"_s":0,"_g":234},{"date":"02072013","value":47243,"_s":0,"_g":235},{"date":"02122013","value":83322,"_s":0,"_g":236},{"date":"02152013","value":32599,"_s":0,"_g":237},{"date":"02182013","value":35274,"_s":0,"_g":238},{"date":"02202013","value":183768,"_s":0,"_g":239},{"date":"02212013","value":91278,"_s":0,"_g":240},{"date":"02232013","value":66839,"_s":0,"_g":241},{"date":"02242013","value":86778,"_s":0,"_g":242},{"date":"03102013","value":86095,"_s":0,"_g":243},{"date":"03112013","value":91558,"_s":0,"_g":244},{"date":"03122013","value":14573,"_s":0,"_g":245},{"date":"03292013","value":80932,"_s":0,"_g":246},{"date":"04042013","value":14345,"_s":0,"_g":247},{"date":"04052013","value":50815,"_s":0,"_g":248},{"date":"04202013","value":20151,"_s":0,"_g":249},{"date":"04242013","value":147143,"_s":0,"_g":250},{"date":"04262013","value":97311,"_s":0,"_g":251},{"date":"04282013","value":133951,"_s":0,"_g":252},{"date":"04292013","value":49525,"_s":0,"_g":253},{"date":"05082013","value":13963,"_s":0,"_g":254},{"date":"05092013","value":57149,"_s":0,"_g":255},{"date":"05232013","value":49207,"_s":0,"_g":256},{"date":"05242013","value":36917,"_s":0,"_g":257},{"date":"05292013","value":95558,"_s":0,"_g":258},{"date":"06072013","value":63400,"_s":0,"_g":259},{"date":"06162013","value":29744,"_s":0,"_g":260},{"date":"06232013","value":48193,"_s":0,"_g":261},{"date":"06262013","value":80549,"_s":0,"_g":262},{"date":"06282013","value":86510,"_s":0,"_g":263},{"date":"07042013","value":61555,"_s":0,"_g":264},{"date":"07162013","value":118047,"_s":0,"_g":265},{"date":"07192013","value":24768,"_s":0,"_g":266},{"date":"07222013","value":75070,"_s":0,"_g":267},{"date":"08012013","value":53294,"_s":0,"_g":268},{"date":"08032013","value":86279,"_s":0,"_g":269},{"date":"08052013","value":152897,"_s":0,"_g":270},{"date":"08072013","value":5913,"_s":0,"_g":271},{"date":"08142013","value":87181,"_s":0,"_g":272},{"date":"08222013","value":112758,"_s":0,"_g":273},{"date":"08292013","value":89115,"_s":0,"_g":274},{"date":"08302013","value":53268,"_s":0,"_g":275},{"date":"09012013","value":39986,"_s":0,"_g":276},{"date":"09022013","value":84251,"_s":0,"_g":277},{"date":"09072013","value":63203,"_s":0,"_g":278},{"date":"09112013","value":82565,"_s":0,"_g":279},{"date":"09122013","value":73899,"_s":0,"_g":280},{"date":"09152013","value":33284,"_s":0,"_g":281},{"date":"09202013","value":99141,"_s":0,"_g":282},{"date":"09212013","value":39395,"_s":0,"_g":283},{"date":"09222013","value":120044,"_s":0,"_g":284},{"date":"09232013","value":34415,"_s":0,"_g":285},{"date":"09252013","value":50512,"_s":0,"_g":286},{"date":"10082013","value":3491,"_s":0,"_g":287},{"date":"10102013","value":58214,"_s":0,"_g":288},{"date":"10132013","value":32014,"_s":0,"_g":289},{"date":"10162013","value":69860,"_s":0,"_g":290},{"date":"10182013","value":19189,"_s":0,"_g":291},{"date":"10202013","value":16209,"_s":0,"_g":292},{"date":"10232013","value":43395,"_s":0,"_g":293},{"date":"11102013","value":45092,"_s":0,"_g":294},{"date":"11112013","value":75598,"_s":0,"_g":295},{"date":"11122013","value":74177,"_s":0,"_g":296},{"date":"11132013","value":92349,"_s":0,"_g":297},{"date":"11162013","value":42124,"_s":0,"_g":298},{"date":"11222013","value":42589,"_s":0,"_g":299},{"date":"11232013","value":35242,"_s":0,"_g":300},{"date":"11242013","value":39906,"_s":0,"_g":301},{"date":"11262013","value":21895,"_s":0,"_g":302},{"date":"12022013","value":30544,"_s":0,"_g":303},{"date":"12072013","value":40434,"_s":0,"_g":304},{"date":"12102013","value":56445,"_s":0,"_g":305},{"date":"12242013","value":46322,"_s":0,"_g":306},{"date":"12272013","value":33129,"_s":0,"_g":307},{"date":"01062014","value":65020,"_s":0,"_g":308},{"date":"01092014","value":40795,"_s":0,"_g":309},{"date":"01112014","value":36827,"_s":0,"_g":310},{"date":"01202014","value":89907,"_s":0,"_g":311},{"date":"01212014","value":65137,"_s":0,"_g":312},{"date":"01232014","value":49997,"_s":0,"_g":313},{"date":"01242014","value":25412,"_s":0,"_g":314},{"date":"01282014","value":28966,"_s":0,"_g":315},{"date":"01302014","value":78245,"_s":0,"_g":316},{"date":"02062014","value":110227,"_s":0,"_g":317},{"date":"02102014","value":77464,"_s":0,"_g":318},{"date":"02162014","value":27535,"_s":0,"_g":319},{"date":"02172014","value":27188,"_s":0,"_g":320},{"date":"02182014","value":44565,"_s":0,"_g":321},{"date":"02202014","value":61591,"_s":0,"_g":322},{"date":"02212014","value":46427,"_s":0,"_g":323},{"date":"02222014","value":70498,"_s":0,"_g":324},{"date":"02272014","value":37482,"_s":0,"_g":325},{"date":"03072014","value":44896,"_s":0,"_g":326},{"date":"03102014","value":78,"_s":0,"_g":327},{"date":"03112014","value":50934,"_s":0,"_g":328},{"date":"03182014","value":81719,"_s":0,"_g":329},{"date":"03292014","value":87592,"_s":0,"_g":330},{"date":"03302014","value":40271,"_s":0,"_g":331},{"date":"03312014","value":39385,"_s":0,"_g":332},{"date":"04062014","value":27893,"_s":0,"_g":333},{"date":"04092014","value":30970,"_s":0,"_g":334},{"date":"04172014","value":87319,"_s":0,"_g":335},{"date":"04232014","value":98580,"_s":0,"_g":336},{"date":"05012014","value":67389,"_s":0,"_g":337},{"date":"05042014","value":36114,"_s":0,"_g":338},{"date":"05072014","value":9711,"_s":0,"_g":339},{"date":"05102014","value":54820,"_s":0,"_g":340},{"date":"05202014","value":34942,"_s":0,"_g":341},{"date":"05262014","value":29594,"_s":0,"_g":342},{"date":"05312014","value":98012,"_s":0,"_g":343},{"date":"06112014","value":129801,"_s":0,"_g":344},{"date":"06122014","value":89137,"_s":0,"_g":345},{"date":"06132014","value":82221,"_s":0,"_g":346},{"date":"06262014","value":48452,"_s":0,"_g":347},{"date":"06282014","value":85626,"_s":0,"_g":348},{"date":"07032014","value":99791,"_s":0,"_g":349},{"date":"07042014","value":150021,"_s":0,"_g":350},{"date":"07052014","value":20603,"_s":0,"_g":351},{"date":"07122014","value":46076,"_s":0,"_g":352},{"date":"07142014","value":27070,"_s":0,"_g":353},{"date":"07272014","value":73824,"_s":0,"_g":354},{"date":"07312014","value":11814,"_s":0,"_g":355},{"date":"08022014","value":59744,"_s":0,"_g":356},{"date":"08102014","value":64148,"_s":0,"_g":357},{"date":"08132014","value":50061,"_s":0,"_g":358},{"date":"08152014","value":26044,"_s":0,"_g":359},{"date":"08202014","value":65903,"_s":0,"_g":360},{"date":"08302014","value":89317,"_s":0,"_g":361},{"date":"09022014","value":26931,"_s":0,"_g":362},{"date":"09042014","value":93299,"_s":0,"_g":363},{"date":"09102014","value":9891,"_s":0,"_g":364},{"date":"09122014","value":1687,"_s":0,"_g":365},{"date":"09132014","value":13847,"_s":0,"_g":366},{"date":"09142014","value":56755,"_s":0,"_g":367},{"date":"09152014","value":38823,"_s":0,"_g":368},{"date":"09242014","value":59132,"_s":0,"_g":369},{"date":"09282014","value":5283,"_s":0,"_g":370},{"date":"10072014","value":69530,"_s":0,"_g":371},{"date":"10092014","value":11943,"_s":0,"_g":372},{"date":"10112014","value":95091,"_s":0,"_g":373},{"date":"10132014","value":61362,"_s":0,"_g":374},{"date":"10242014","value":289,"_s":0,"_g":375},{"date":"10282014","value":15903,"_s":0,"_g":376},{"date":"10292014","value":50576,"_s":0,"_g":377},{"date":"11052014","value":45565,"_s":0,"_g":378},{"date":"11092014","value":112966,"_s":0,"_g":379},{"date":"11142014","value":96760,"_s":0,"_g":380},{"date":"11172014","value":57304,"_s":0,"_g":381},{"date":"11182014","value":49358,"_s":0,"_g":382},{"date":"11212014","value":4286,"_s":0,"_g":383},{"date":"11242014","value":90041,"_s":0,"_g":384},{"date":"11272014","value":7548,"_s":0,"_g":385},{"date":"12012014","value":74012,"_s":0,"_g":386},{"date":"12022014","value":23984,"_s":0,"_g":387},{"date":"12092014","value":86851,"_s":0,"_g":388},{"date":"12202014","value":70438,"_s":0,"_g":389},{"date":"12232014","value":81816,"_s":0,"_g":390},{"date":"12252014","value":76249,"_s":0,"_g":391},{"date":"12272014","value":75501,"_s":0,"_g":392},{"date":"12302014","value":44939,"_s":0,"_g":393},{"date":"01022015","value":19295,"_s":0,"_g":394},{"date":"01032015","value":71639,"_s":0,"_g":395},{"date":"01062015","value":70798,"_s":0,"_g":396},{"date":"01072015","value":73011,"_s":0,"_g":397},{"date":"01112015","value":35386,"_s":0,"_g":398},{"date":"01132015","value":992,"_s":0,"_g":399},{"date":"01142015","value":85762,"_s":0,"_g":400},{"date":"01152015","value":135513,"_s":0,"_g":401},{"date":"01172015","value":62531,"_s":0,"_g":402},{"date":"01202015","value":74709,"_s":0,"_g":403},{"date":"01222015","value":62197,"_s":0,"_g":404},{"date":"01272015","value":80465,"_s":0,"_g":405},{"date":"01282015","value":3848,"_s":0,"_g":406},{"date":"01312015","value":39427,"_s":0,"_g":407},{"date":"02132015","value":13209,"_s":0,"_g":408},{"date":"02142015","value":80032,"_s":0,"_g":409},{"date":"02212015","value":114655,"_s":0,"_g":410},{"date":"02232015","value":99282,"_s":0,"_g":411},{"date":"02252015","value":51933,"_s":0,"_g":412},{"date":"03022015","value":25593,"_s":0,"_g":413},{"date":"03042015","value":63802,"_s":0,"_g":414},{"date":"03062015","value":8434,"_s":0,"_g":415},{"date":"03102015","value":19472,"_s":0,"_g":416},{"date":"03132015","value":69273,"_s":0,"_g":417},{"date":"03192015","value":71172,"_s":0,"_g":418},{"date":"03222015","value":85968,"_s":0,"_g":419},{"date":"03252015","value":26103,"_s":0,"_g":420},{"date":"03312015","value":44639,"_s":0,"_g":421},{"date":"04042015","value":3859,"_s":0,"_g":422},{"date":"04092015","value":45926,"_s":0,"_g":423},{"date":"04122015","value":97554,"_s":0,"_g":424},{"date":"04212015","value":36140,"_s":0,"_g":425},{"date":"05052015","value":95241,"_s":0,"_g":426},{"date":"05092015","value":122502,"_s":0,"_g":427},{"date":"05182015","value":10587,"_s":0,"_g":428},{"date":"05202015","value":79249,"_s":0,"_g":429},{"date":"05262015","value":39544,"_s":0,"_g":430},{"date":"05282015","value":15814,"_s":0,"_g":431},{"date":"05312015","value":48404,"_s":0,"_g":432},{"date":"06052015","value":31749,"_s":0,"_g":433}];

		props.data = localData.map(function(datum){
			var datumCpy = jsonCpy(datum);
			datumCpy.elClassName = chart.buildClassName('riser', datum._s, datum._g, 'bar');
			return datumCpy;
		});

		props.measureLabel = chart.measureLabel;
		props.colorScale = renderConfig.modules.colorScale.getColorScale();
		props.formatNumber = chart.formatNumber;

		props.buckets = {"date":["date"],"value":["value"]};

		var container = d3.select(renderConfig.container)
			.attr('class', 'com_tdg_calendar');

		// ---------------- INIT YOUR EXTENSION HERE

		var tdg_calendar_chart = tdg_calendar(props);
		tdg_calendar_chart(container);

		// ---------------- END ( INIT YOUR EXTENSION HERE )

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
				'font-size' : '14',
				dy: '0.35em',
				fill: 'grey'
			});

			renderConfig.modules.tooltip.updateToolTips();
			renderConfig.renderComplete();
	}

	// Your extension's configuration
	var config = {
		id: 'com.ibi.calendar',  // string that uniquely identifies this extension
		preRenderCallback: preRenderCallback,  // reference to a function that is called right *before* your extension is rendered.  Will be passed one 'preRenderConfig' object, defined below.  Use this to configure a Monbeam instance as needed
		renderCallback: renderCallback,  // reference to a function that will draw the actual chart.  Will be passed one 'renderConfig' object, defined below
		noDataRenderCallback: noDataRenderCallback,
		resources:  {  // Additional external resources (CSS & JS) required by this extension
			script: ['lib/d3.min.js', 'lib/calendar.js'],
			css: ['css/styles.css']
		},
		modules: {
			/*dataSelection: {
				supported: true,  // Set this true if your extension wants to enable data selection
				needSVGEventPanel: false, // if you're using an HTML container or altering the SVG container, set this to true and Moonbeam will insert the necessary SVG elements to capture user interactions
				svgNode: function(arg){}  // if you're using an HTML container or altering the SVG container, return a reference to your root SVG node here.
			},*/
			eventHandler: {
				supported: true
			},
			colorScale: {
				supported: true,
				minMax: function(props){
					var extent = d3.extent(props.data, function (d) { return d.value; });
					return {min: extent[0], max: extent[1]};
				}
			},
			tooltip: {
				supported: true  // Set this true if your extension wants to enable HTML tooltips
			},
			legend: {
				colorMode: function(props){
					return 'data';
				},
			}
		}
	};

	// Required: this call will register your extension with Moonbeam
	tdgchart.extensionManager.register(config);

}());
