const osdViewer = OpenSeadragon({
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
	preserveViewport: true,
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

{
	const e = document.createElement("div");
	e.className = "overlay-highlight";
	osdViewer.addOverlay({
		element: e,
		location: new OpenSeadragon.Rect(3 * 512, 1 * 512, 512, 512)
	});
}

{
	const e = document.createElement("div");
	e.className = "overlay-highlight";
	e.innerHTML = `<span>The Work (Sky)</span>`;
	osdViewer.addOverlay({
		element: e,
		location: new OpenSeadragon.Rect(1 * 512, -3 * 512, 512, 512)
	});
}

// Update hover element that shows the world coordinates near the mouse cursor.
const coordinatesHover = document.getElementById("coordinates-hover");
const mouseTracker = new OpenSeadragon.MouseTracker({
	element: document.getElementById("osd-container"),
	moveHandler: function (event) {
		if (event.pointerType != "mouse") { return }
		const webPoint = event.position;
		const viewportPoint = osdViewer.viewport.pointFromPixel(webPoint);

		const pixelX = Math.floor(viewportPoint.x).toString();
		const pixelY = Math.floor(viewportPoint.y).toString();
		const chunkX = Math.floor(pixelX / 512).toString();
		const chunkY = Math.floor(pixelY / 512).toString();
		coordinatesHover.innerHTML = `<span>(${pixelX}, ${pixelY})</span><br><span>(${chunkX}, ${chunkY})</span>`;

		coordinatesHover.style.left = `${webPoint.x}px`;
		coordinatesHover.style.top = `calc(${webPoint.y}px + 1em)`;
	},
	enterHandler: function onMouseTrackerMove(event) {
		if (event.pointerType != "mouse") { return }
		coordinatesHover.style.visibility = "visible";
	},
	leaveHandler: function onMouseTrackerMove(event) {
		if (event.pointerType != "mouse") { return }
		coordinatesHover.style.visibility = "hidden";
	},
}).setTracking(true);

// Store and load viewport position and zoom level in URL parameters.
{
	const urlParams = new URLSearchParams(window.location.search);
	let bounds;
	if (urlParams.has("x") && urlParams.has("y") && urlParams.has("width") && urlParams.has("height")) {
		const viewportX = Number(urlParams.get("x"));
		const viewportY = Number(urlParams.get("y"));
		const viewportWidth = Number(urlParams.get("width"));
		const viewportHeight = Number(urlParams.get("height"));
		bounds = new OpenSeadragon.Rect(viewportX, viewportY, viewportWidth, viewportHeight);
	} else {
		bounds = new OpenSeadragon.Rect(-150, -350, 1024, 512);
	}
	osdViewer.viewport.fitBounds(bounds, true);
}
osdViewer.addHandler("animation-finish", function (event) {
	// Update URL parameter.
	const bounds = event.eventSource.viewport.getBounds();
	const urlParams = new URLSearchParams(window.location.search);
	urlParams.set("x", bounds.x.toFixed(0));
	urlParams.set("y", bounds.y.toFixed(0));
	urlParams.set("width", bounds.width.toFixed(0));
	urlParams.set("height", bounds.height.toFixed(0));
	window.history.replaceState(null, null, "?" + urlParams.toString());
});

// Get additional DZI information from every loaded TiledImage.
// This is used to place images in a way so that the OSD coordinate system aligns with the in-game coordinate system.
osdViewer.world.addHandler('add-item', (event) => {
	/** @type {{Format: string, Overlap: string, Size: {Width: string, Height: string}, TileSize: string, TopLeft: {X: string, Y: string}}} */
	// @ts-ignore
	const image = event.item.source.Image;
	event.item.setPosition(new OpenSeadragon.Point(Number(image.TopLeft.X), Number(image.TopLeft.Y)), true);
	event.item.setWidth(Number(image.Size.Width), true);
});