let osdViewer = OpenSeadragon({
	id: "osd-container",
	prefixUrl: "vendor/openseadragon-bin-4.1.0/images/",
	//minZoomLevel: 0,
	//maxZoomLevel: 100,
	maxZoomPixelRatio: 20,
	defaultZoomLevel: 0,
	showNavigator: true,
	navigatorPosition: "BOTTOM_RIGHT",
	navigatorDisplayRegionColor: "#777777",
	navigatorHeight: 285,
	navigatorWidth: 200,
	imageSmoothingEnabled: false,
	subPixelRoundingForTransparency: OpenSeadragon.SUBPIXEL_ROUNDING_OCCURRENCES.ALWAYS,
	smoothTileEdgesMinZoom: 1,
	minScrollDeltaTime: 10,
	springStiffness: 50,
	//tileSources: source1,
	imageLoaderLimit: 1,
});

// Disable click to zoom
osdViewer.gestureSettingsMouse.clickToZoom = false;

/*let rasterPattern = [{"id":"1","raster_id":"1","label":"Rij 1","top":"620","left":"420","width":"5350","height":"200"},{"id":"19","raster_id":"1","label":"Rij 19","top":"4105","left":"420","width":"5350","height":"200"},{"id":"20","raster_id":"1","label":"Rij 20","top":"4105","left":"420","width":"5350","height":"200"}];
osdViewer.addHandler('open',function(){

	if(rasterPattern.length>0) {

		//prefix is image path of viewer
		let prefix = osdViewer.prefixUrl;

		//create button to add to viewer
		let button = new OpenSeadragon.Button({
			element:    button ? OpenSeadragon.getElement( button ) : null,
			clickTimeThreshold: osdViewer.clickTimeThreshold,
			clickDistThreshold: osdViewer.clickDistThreshold,
			tooltip:    OpenSeadragon.getString('Tooltips.ShowOverlays') || 'Show overlays',
			srcRest:    prefix + 'hotspots_rest.png',
			srcGroup:   prefix + 'hotspots_grouphover.png',
			srcHover:   prefix + 'hotspots_hover.png',
			srcDown:    prefix + 'hotspots_pressed.png',
			onRelease:  function () {
				//hide or show class as defined when adding raster elements
				jQuery('.sd-overlay').toggle();
			}
		});

		//add button to viewer
		osdViewer.buttons.buttons.push(button);
		osdViewer.buttons.element.appendChild(button.element);

		for (let i = 0; i < raster.length; i++) {
			let line = raster[i];
			//console.log(line);

			let elt = document.createElement("div");
			elt.innerHTML = line.label;
			elt.style.cssText = "outline: 1px solid #3F7D96; text-align: center; color: white; font-weight: bold; background-color: rgba(0, 0, 0, 0.2);";
			elt.id = "runtime-overlay" + i;
			elt.className = "sd-overlay";

			let x = Number(line.left);
			let y = Number(line.top);
			let w = Number(line.width);
			let h = Number(line.height);

			let rect = osdViewer.viewport.imageToViewportRectangle(x, y, w, h);

			osdViewer.addOverlay({
				element: elt,
				location: rect
			});

		}
	}
}, rasterPattern);*/

let e = document.createElement("div");
e.className = "overlay-highlight";
osdViewer.addOverlay({
	element: e,
	location: new OpenSeadragon.Rect(512 * 3, 512, 512, 512)
});

let coordinatePixelX = document.getElementById("coordinate-pixel-x");
let coordinatePixelY = document.getElementById("coordinate-pixel-y");
let coordinateChunkX = document.getElementById("coordinate-chunk-x");
let coordinateChunkY = document.getElementById("coordinate-chunk-y");
function onMouseTrackerMove(event) {
	let webPoint = event.position;
	let viewportPoint = osdViewer.viewport.pointFromPixel(webPoint);

	coordinatePixelX.textContent = Math.floor(viewportPoint.x).toString();
	coordinatePixelY.textContent = Math.floor(viewportPoint.y).toString();

	coordinateChunkX.textContent = Math.floor(viewportPoint.x/512).toString();
	coordinateChunkY.textContent = Math.floor(viewportPoint.y/512).toString();
}
let mouseTracker = new OpenSeadragon.MouseTracker({
	element: document.getElementById("osd-container"),
	moveHandler: onMouseTrackerMove
}).setTracking(true);
