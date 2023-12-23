var os = OpenSeadragon({
	id: "os-container",
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
	minScrollDeltaTime: 50,
	springStiffness: 30,
	tileSources: {
		Image: {
			xmlns:    "http://schemas.microsoft.com/deepzoom/2008",
			Url:      "maps/noita-2023-12-21/",
			Format:   "png",
			Overlap:  "1",
			TileSize: "512",
			Size: {
				Width:  "51712",
				Height: "74240"
			}
		}
	}
});
