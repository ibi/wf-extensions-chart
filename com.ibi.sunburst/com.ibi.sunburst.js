/* globals _*/
(function() {
	// Optional: if defined, is invoked once at the very beginning of each Moonbeam draw cycle
	// Use this to configure a specific Moonbeam instance before rendering.
	// Arguments: 
	//  - preRenderConfig: the standard callback argument object
	function preRenderCallback(preRenderConfig) {
		preRenderConfig.moonbeamInstance.legend.visible = false;
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
		props.data = [{"levels":["Accessories","Charger","B00D7MOHDO"],"value":1303511.5},{"levels":["Accessories","Charger","BCG34HRE4KN"],"value":666612.41},{"levels":["Accessories","Headphones","Audio Technica ATHW5000"],"value":2354397.65},{"levels":["Accessories","Headphones","Denon AHD5000"],"value":2477303.77},{"levels":["Accessories","Headphones","Grado RS1"],"value":2208713.25},{"levels":["Accessories","Headphones","Pioneer HDJ1000"],"value":4049178.25},{"levels":["Accessories","Headphones","Sennheiser HD650"],"value":2754941.62},{"levels":["Accessories","Headphones","Sennheiser HD800"],"value":3034715.58},{"levels":["Accessories","Headphones","Sennheiser SET830S"],"value":3765517.05},{"levels":["Accessories","Headphones","Sony MDRV900HD"],"value":3878256.8},{"levels":["Accessories","Universal Remote Controls","Logitech 1100"],"value":1518520.89},{"levels":["Accessories","Universal Remote Controls","Logitech 900"],"value":4401161.310003},{"levels":["Accessories","Universal Remote Controls","Niles Audio RCAHT2"],"value":4825372.75},{"levels":["Accessories","Universal Remote Controls","Niles Audio RCATT2"],"value":2616237.7},{"levels":["Camcorder","Handheld","JVC GCFM2BUS"],"value":4446963.35},{"levels":["Camcorder","Handheld","Panasonic HMTA1PPR"],"value":3521664.990001},{"levels":["Camcorder","Handheld","Sanyo VPCCG20BK"],"value":4120263.760003},{"levels":["Camcorder","Handheld","Sanyo VPCPD2BK"],"value":5073983.220004},{"levels":["Camcorder","Handheld","Sony MHSCM5V"],"value":4230779.65},{"levels":["Camcorder","Professional","Canon XHA1S"],"value":1892638.8},{"levels":["Camcorder","Professional","JVC GYHD200U"],"value":2715862.8},{"levels":["Camcorder","Professional","Sony HDRAX2000"],"value":1541488.8},{"levels":["Camcorder","Professional","Sony HXRNX5U"],"value":2685532.35},{"levels":["Camcorder","Standard","Canon FS300"],"value":4361353.100003},{"levels":["Camcorder","Standard","Canon HFR11"],"value":2383118.35},{"levels":["Camcorder","Standard","JVC GZHD620B"],"value":1829180.37},{"levels":["Camcorder","Standard","Sony DCRDVD650"],"value":4003524.9},{"levels":["Camcorder","Standard","Sony DCRSX63"],"value":4837549.7},{"levels":["Camcorder","Standard","Sony HDRCX150"],"value":1954941.1},{"levels":["Computers","Smartphone","C6506B"],"value":960078.03},{"levels":["Computers","Smartphone","C6506S"],"value":946702.93},{"levels":["Computers","Smartphone","C6506W"],"value":948377.35},{"levels":["Computers","Smartphone","GS4B"],"value":653286.26},{"levels":["Computers","Smartphone","GS4S"],"value":669029.82},{"levels":["Computers","Smartphone","GS4W"],"value":679738.79},{"levels":["Computers","Smartphone","LT22i-SLB"],"value":2921395},{"levels":["Computers","Smartphone","LT22i-SLW"],"value":2997508},{"levels":["Computers","Smartphone","i897B"],"value":2496151.22},{"levels":["Computers","Smartphone","i898W"],"value":2562434.75},{"levels":["Computers","Tablet","GLXYT10716"],"value":3239903.700001},{"levels":["Computers","Tablet","GLXYT10732"],"value":3778232.140001},{"levels":["Computers","Tablet","GLXYT3B"],"value":1233116.25},{"levels":["Computers","Tablet","GLXYT3W"],"value":1285257.87},{"levels":["Computers","Tablet","GLXYT70"],"value":380445.49},{"levels":["Computers","Tablet","SGP311U1/B"],"value":1177040.95},{"levels":["Computers","Tablet","SGP312U1/B"],"value":2312221.58},{"levels":["Computers","Tablet","SGPT121US/S"],"value":2381341.3},{"levels":["Computers","Tablet","SGPT122US/S"],"value":957193.75},{"levels":["Computers","Tablet","SGPT123US/S"],"value":929362.94},{"levels":["Media Player","Blu Ray","JVC XV-BP1"],"value":3838325.390002},{"levels":["Media Player","Blu Ray","JVC XV-BP10"],"value":2871820.710001},{"levels":["Media Player","Blu Ray","JVC XV-BP11"],"value":2621977.430001},{"levels":["Media Player","Blu Ray","Panasonic DMP-BD30"],"value":1765385.66},{"levels":["Media Player","Blu Ray","Panasonic DMP-BD60"],"value":2339781.64},{"levels":["Media Player","Blu Ray","Panasonic DMP-BD70V"],"value":2420922.04},{"levels":["Media Player","Blu Ray","Panasonic DMP-BD80"],"value":3690261.380001},{"levels":["Media Player","Blu Ray","Pioneer BDP-120"],"value":4056906.240002},{"levels":["Media Player","Blu Ray","Pioneer BDP-320"],"value":1382714.99},{"levels":["Media Player","Blu Ray","Pioneer BDP-330"],"value":3034747.210001},{"levels":["Media Player","Blu Ray","Pioneer BDP-51"],"value":1740160.44},{"levels":["Media Player","Blu Ray","SAMSUNG BD-C6500"],"value":2493847.59},{"levels":["Media Player","Blu Ray","SHARP BD-HP70U"],"value":1118479.2},{"levels":["Media Player","Blu Ray","Samsung BD-C5500"],"value":1749743.25},{"levels":["Media Player","Blu Ray","Samsung BD-P1600"],"value":2545602.79},{"levels":["Media Player","Blu Ray","Samsung BD-P3600"],"value":2024835.92},{"levels":["Media Player","Blu Ray","Sharp BD-HP24U"],"value":4235989.430003},{"levels":["Media Player","Blu Ray","Sony BDP-S360"],"value":2182601.26},{"levels":["Media Player","Blu Ray","Sony BDP-S370"],"value":2267735.31},{"levels":["Media Player","Blu Ray","Sony BDP-S470"],"value":2190821.76},{"levels":["Media Player","Blu Ray","Sony BDP-S570"],"value":1198535.49},{"levels":["Media Player","DVD Players","JVC DR-MV150B"],"value":234391.87},{"levels":["Media Player","DVD Players","JVC DR-MV80B"],"value":250104.03},{"levels":["Media Player","DVD Players","LG DVRK898"],"value":145717.09},{"levels":["Media Player","DVD Players","LG RC389H"],"value":129114.88},{"levels":["Media Player","DVD Players","LG RC897T"],"value":212373.45},{"levels":["Media Player","DVD Players","LG Zenith XBR-716"],"value":151740.05},{"levels":["Media Player","DVD Players","Panasonic DMR-EH59"],"value":117572.01},{"levels":["Media Player","DVD Players","Panasonic DMR-ES18"],"value":439.94},{"levels":["Media Player","DVD Players","Pioneer DVR-560H"],"value":122730.89},{"levels":["Media Player","DVD Players","Sony RDR-GX257"],"value":338.97},{"levels":["Media Player","DVD Players","Toshiba DR570"],"value":261657.81},{"levels":["Media Player","DVD Players","Toshiba DVR40"],"value":123034.41},{"levels":["Media Player","DVD Players","Toshiba R420"],"value":734.93},{"levels":["Media Player","DVD Players","Toshiba R420A"],"value":109695.48},{"levels":["Media Player","DVD Players - Portable","AudioVox D1788PN"],"value":80759.05},{"levels":["Media Player","DVD Players - Portable","Magnavox MDP845"],"value":55774.53},{"levels":["Media Player","DVD Players - Portable","Philips 7 LD741"],"value":57041.28},{"levels":["Media Player","DVD Players - Portable","Polaroid PD-M0722"],"value":71575.91},{"levels":["Media Player","Streaming","2100"],"value":1139264.45},{"levels":["Media Player","Streaming","4200"],"value":535822.64},{"levels":["Media Player","Streaming","N1000"],"value":124915.61},{"levels":["Media Player","Streaming","N1050"],"value":136583.95},{"levels":["Stereo Systems","Boom Box","LG LPC-D1000A"],"value":34676.44},{"levels":["Stereo Systems","Boom Box","LG MDD72"],"value":67291.66},{"levels":["Stereo Systems","Boom Box","Magnavox MCD-UB685M"],"value":42467.16},{"levels":["Stereo Systems","Boom Box","Panasonic rx-es23"],"value":35059.88},{"levels":["Stereo Systems","Boom Box","Philips CD Radio"],"value":32762.29},{"levels":["Stereo Systems","Boom Box","SONY CD Radio"],"value":34176.88},{"levels":["Stereo Systems","Boom Box","Sanyo DC-UB1470"],"value":48270.07},{"levels":["Stereo Systems","Boom Box","Sanyo DC-UB1471"],"value":37747.54},{"levels":["Stereo Systems","Boom Box","Sharp CD-E200T"],"value":42918.07},{"levels":["Stereo Systems","Boom Box","Sony CMT-DF1"],"value":54661.09},{"levels":["Stereo Systems","Boom Box","Sony CMT-EH15"],"value":41490.18},{"levels":["Stereo Systems","Boom Box","Sony MHC-RG170"],"value":74902.73},{"levels":["Stereo Systems","Home Theater Systems","LG MDD72"],"value":4418959.920003},{"levels":["Stereo Systems","Home Theater Systems","LG XD63"],"value":2973207.020001},{"levels":["Stereo Systems","Home Theater Systems","Panasonic"],"value":4237920.220002},{"levels":["Stereo Systems","Home Theater Systems","Panasonic SC-PT160"],"value":2283306.85},{"levels":["Stereo Systems","Home Theater Systems","Pioneer HTZ-170"],"value":3359095.570002},{"levels":["Stereo Systems","Home Theater Systems","Samsung HT-Z120"],"value":3413471.540002},{"levels":["Stereo Systems","Home Theater Systems","Sharp HT-CN550"],"value":3472110.140002},{"levels":["Stereo Systems","Home Theater Systems","Sony DAV-DZ30"],"value":3773024.960002},{"levels":["Stereo Systems","Receivers","Onkyo TXSR876B"],"value":2897512.77},{"levels":["Stereo Systems","Receivers","Sony STRDA1500"],"value":1896335.01},{"levels":["Stereo Systems","Receivers","Sony STRDH810"],"value":2605808.71},{"levels":["Stereo Systems","Receivers","Yamaha RXV2065"],"value":2703701.97},{"levels":["Stereo Systems","Receivers","Yamaha RXV3900"],"value":2837135.7},{"levels":["Stereo Systems","Receivers","Yamaha RXV465"],"value":3615341.4},{"levels":["Stereo Systems","Speaker Kits","BOSE AM10IV"],"value":3916555.65},{"levels":["Stereo Systems","Speaker Kits","BOSE AM16II"],"value":2683039.35},{"levels":["Stereo Systems","Speaker Kits","Harman Kardon HKTS20BQ"],"value":1808885.05},{"levels":["Stereo Systems","Speaker Kits","Harman Kardon HKTS30BQ"],"value":2751154.15},{"levels":["Stereo Systems","Speaker Kits","Onkyo SKSHT540"],"value":2095881.7},{"levels":["Stereo Systems","Speaker Kits","Onkyo SKSHT750B"],"value":1946240.85},{"levels":["Stereo Systems","Speaker Kits","Onkyo SKSHT870"],"value":4579406.15},{"levels":["Stereo Systems","Speaker Kits","Polk Audio LSIFX"],"value":1480052.45},{"levels":["Stereo Systems","Speaker Kits","Polk Audio RM705"],"value":2972081.090001},{"levels":["Stereo Systems","Speaker Kits","Yamaha NSSP1800"],"value":1585945.25},{"levels":["Stereo Systems","iPod Docking Station","DC390/37"],"value":1944251.89},{"levels":["Stereo Systems","iPod Docking Station","DMP-692"],"value":2563512.430001},{"levels":["Stereo Systems","iPod Docking Station","DS1155/37"],"value":1332939.07},{"levels":["Stereo Systems","iPod Docking Station","DS3205/37"],"value":2232401.19},{"levels":["Stereo Systems","iPod Docking Station","ND8520"],"value":5425264.540004},{"levels":["Stereo Systems","iPod Docking Station","RDPX200iP"],"value":1830103.939999},{"levels":["Televisions","CRT TV","LG 19LE5300 19-CRT"],"value":98469.07},{"levels":["Televisions","CRT TV","LG 32LE5300 32-CRT"],"value":80403.54},{"levels":["Televisions","CRT TV","Panasonic 58TV25BNDL-CRT"],"value":98012.2},{"levels":["Televisions","CRT TV","Panasonic TCP46G25-CRT"],"value":103248.84},{"levels":["Televisions","CRT TV","Sony KDL19EX400-CRT"],"value":88422.1},{"levels":["Televisions","CRT TV","Sony KDL27HX800-CRT"],"value":51154.46},{"levels":["Televisions","CRT TV","Sony KDL32EX500-CRT"],"value":82709.44},{"levels":["Televisions","Flat Panel TV","LG 19LE5300 19"],"value":1665266.62},{"levels":["Televisions","Flat Panel TV","LG 32LE5300 32"],"value":2504441.25},{"levels":["Televisions","Flat Panel TV","Panasonic 58TV25BNDL"],"value":1815491.96},{"levels":["Televisions","Flat Panel TV","Panasonic TCP46G25"],"value":2034667.44},{"levels":["Televisions","Flat Panel TV","Sony KDL32EX400"],"value":3158772.45},{"levels":["Televisions","Flat Panel TV","Sony KDL46HX800"],"value":3405114.6},{"levels":["Televisions","Flat Panel TV","Sony KDL60EX500"],"value":1301744.39},{"levels":["Televisions","Portable TV","Audiovox VE727"],"value":111324.46},{"levels":["Televisions","Portable TV","GPX TL709 7"],"value":75992.4},{"levels":["Televisions","Portable TV","SuperSonic SC491 7"],"value":92170.25},{"levels":["Televisions","Portable TV","Tivax MiTV 3.5"],"value":62618.34},{"levels":["Video Production","Video Editing","BOSE V-S2"],"value":4752677.9},{"levels":["Video Production","Video Editing","BOSE V-S2-P"],"value":4214026.95},{"levels":["Video Production","Video Editing","JVC SR-DVM700"],"value":2033578.8},{"levels":["Video Production","Video Editing","Thomson Grass Valley ADVC110"],"value":2251948.54},{"levels":["Video Production","Video Editing","Thomson Grass Valley ADVC55"],"value":4002094.630002},{"levels":["Video Production","Video Editing","Thomson Grass Valley SFX-11"],"value":693292.8}];
		props.formatNumber = chart.formatNumber.bind(chart);
		
		var container = d3.select(renderConfig.container)
			.attr('class', 'com_tdg_sunburst');

		var tdg_sunburst_chart = tdg_sunburst(props);
		
		tdg_sunburst_chart(container);

		renderConfig.modules.tooltip.updateToolTips();
	}

	function noDataRenderCallback (renderConfig) {
		var chart = renderConfig.moonbeamInstance;
		var props = renderConfig.properties;
		
		chart.legend.visible = false;

		props.width = renderConfig.width;
		props.height = renderConfig.height;
		props.data = [{"levels":["ENGLAND","JAGUAR","CONVERTIBLE","V12XKE AUTO"],"value":0,"_s":0,"_g":0},{"levels":["ENGLAND","JAGUAR","SEDAN","XJ12L AUTO"],"value":12000,"_s":0,"_g":1},{"levels":["ENGLAND","JENSEN","SEDAN","INTERCEPTOR III"],"value":0,"_s":0,"_g":2},{"levels":["ENGLAND","TRIUMPH","HARDTOP","TR7"],"value":0,"_s":0,"_g":3},{"levels":["FRANCE","PEUGEOT","SEDAN","504 4 DOOR"],"value":0,"_s":0,"_g":4},{"levels":["ITALY","ALFA ROMEO","COUPE","2000 GT VELOCE"],"value":12400,"_s":0,"_g":5},{"levels":["ITALY","ALFA ROMEO","ROADSTER","2000 SPIDER VELOCE"],"value":13000,"_s":0,"_g":6},{"levels":["ITALY","ALFA ROMEO","SEDAN","2000 4 DOOR BERLINA"],"value":4800,"_s":0,"_g":7},{"levels":["ITALY","MASERATI","COUPE","DORA 2 DOOR"],"value":0,"_s":0,"_g":8},{"levels":["JAPAN","DATSUN","SEDAN","B210 2 DOOR AUTO"],"value":43000,"_s":0,"_g":9},{"levels":["JAPAN","TOYOTA","SEDAN","COROLLA 4 DOOR DIX AUTO"],"value":35030,"_s":0,"_g":10},{"levels":["W GERMANY","AUDI","SEDAN","100 LS 2 DOOR AUTO"],"value":7800,"_s":0,"_g":11},{"levels":["W GERMANY","BMW","SEDAN","2002 2 DOOR"],"value":8950,"_s":0,"_g":12},{"levels":["W GERMANY","BMW","SEDAN","2002 2 DOOR AUTO"],"value":8900,"_s":0,"_g":13},{"levels":["W GERMANY","BMW","SEDAN","3.0 SI 4 DOOR"],"value":14000,"_s":0,"_g":14},{"levels":["W GERMANY","BMW","SEDAN","3.0 SI 4 DOOR AUTO"],"value":18940,"_s":0,"_g":15},{"levels":["W GERMANY","BMW","SEDAN","530I 4 DOOR"],"value":14000,"_s":0,"_g":16},{"levels":["W GERMANY","BMW","SEDAN","530I 4 DOOR AUTO"],"value":15600,"_s":0,"_g":17}];

		var container = d3.select(renderConfig.container)
			.attr('class', 'com_tdg_sunburst');

		var tdg_sunburst_chart = tdg_sunburst(props);
		
		tdg_sunburst_chart(container);

		renderConfig.modules.tooltip.updateToolTips();
		
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
		id: 'com.ibi.sunburst',  // string that uniquely identifies this extension
		preRenderCallback: preRenderCallback,  // reference to a function that is called right *before* your extension is rendered.  Will be passed one 'preRenderConfig' object, defined below.  Use this to configure a Monbeam instance as needed
		renderCallback: renderCallback,  // reference to a function that will draw the actual chart.  Will be passed one 'renderConfig' object, defined below
		noDataRenderCallback: noDataRenderCallback,
		resources:  {  // Additional external resources (CSS & JS) required by this extension
			script: ['lib/d3.min.js', 'lib/sunburst.js'],
			css: []
		},
		modules: {
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