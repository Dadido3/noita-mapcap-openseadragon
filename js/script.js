var os = OpenSeadragon({
	id: "os-container",
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
	minScrollDeltaTime: 50,
	springStiffness: 30,
	tileSources: "maps/example.dzi"
});
