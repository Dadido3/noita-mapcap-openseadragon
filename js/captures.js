// Table of available captures.
// Each with additional metadata like their width, height, top left (in-game) coordinate, game-mode, seed and more.
//
// The index of this list has to be in sync with the internal list of TiledImages inside of OpenSeadragon.
// This means one shouldn't delete or add TiledImages after loadCaptures has been called.
// TODO: Find a way to store user data inside of the TiledImages
const captures = [
	{
		uuid: "b3f7cf7f-cdf6-448b-8772-3ce4dc28f238",
		name: "Example capture",
		buildString: "Build Feb  6 2024 15:58:22",
		builtAt: new Date('2024-02-06T15:58:22+02:00'),
		platform: "steam",
		branch: "noitabeta",
		type: "noita.exe",
		mode: "New Game",
		seed: 786433191,
		ngPlusLevel: 1,
		createdAt: new Date('2024-02-08T19:02:16+01:00'),
		createdBy: "D3",
		tileSource: "captures/example.dzi",
		xOffset: -5120, yOffset: -5120, width: 5120 * 2,
	},
	/*{
		uuid: "dfa609d2-3440-4024-84c6-99430a149c94",
		name: "Play capture 2022-08-14",
		//buildString: "Build Feb  6 2024 15:58:22",
		//builtAt: new Date('2024-02-06T15:58:22+02:00'),
		platform: "steam",
		branch: "noitabeta",
		type: "noita.exe",
		mode: "New Game",
		//seed: 786433191,
		ngPlusLevel: 1,
		createdAt: new Date('2022-08-14T00:00:00'),
		createdBy: "D3",
		tileSource: "captures/play-2022-08-14.dzi",
		xOffset: -4000 - 898 + 711, yOffset: -100 + 29 - 191, width: 8923,
	},
	{
		uuid: "f702768a-5fe0-48e1-828a-b531d9efdb12",
		name: "2024-02-06 15:58:22 NG 78633191",
		buildString: "Build Feb  6 2024 15:58:22",
		builtAt: new Date('2024-02-06T15:58:22+02:00'),
		platform: "steam",
		branch: "noitabeta",
		type: "noita.exe",
		mode: "New Game",
		seed: 78633191,
		ngPlusLevel: 1,
		createdAt: new Date('2024-02-08T15:27:30+01:00'),
		createdBy: "D3",
		tileSource: "captures/2024-02-06-15-58-22-noita-ng-78633191.dzi",
		xOffset: -25600, yOffset: -31744, width: 51200,
	},
	{
		uuid: "6a0661b1-96bc-4a8d-94c2-b43d1f1c4cd9",
		name: "2024-02-06 15:58:22 NG 786433191",
		buildString: "Build Feb  6 2024 15:58:22",
		builtAt: new Date('2024-02-06T15:58:22+02:00'),
		platform: "steam",
		branch: "noitabeta",
		type: "noita.exe",
		mode: "New Game",
		seed: 786433191,
		ngPlusLevel: 1,
		createdAt: new Date('2024-02-08T19:02:16+01:00'),
		createdBy: "D3",
		tileSource: "captures/2024-02-06-15-58-22-noita-ng-786433191.dzi",
		xOffset: -25600, yOffset: -31744, width: 51200,
	},*/
];

// The UUID of the currently shown capture.
const urlParams = new URLSearchParams(window.location.search);
let activeCaptureUUID = urlParams.get("capture");
if (activeCaptureUUID == null) { activeCaptureUUID = "6a0661b1-96bc-4a8d-94c2-b43d1f1c4cd9"; }

const overlayImages = [
	{ tiled: false, url: "captures/biome_map.png", opacity: 0.2, xOffset: -17920, yOffset: -7168, width: 17920 + 17920 },
];

// Load all map captures into OSD.
function loadCaptures() {
	// Clean stuff first.
	osdViewer.world.removeAll();

	captures.forEach(function (capture, index) {
		const tileInfo = { uuid: capture.uuid, tileSource: capture.tileSource, x: capture.xOffset, y: capture.yOffset, width: capture.width }

		if (tileInfo.uuid !== activeCaptureUUID) { tileInfo.opacity = 0; }

		osdViewer.addTiledImage(tileInfo);
	});

	//osdViewer.addSimpleImage({ url: overlayImages[0].url, x: overlayImages[0].xOffset, y: overlayImages[0].yOffset, width: overlayImages[0].width, opacity: 0.25});
}

// Update UI list of available captures.
const uiCapturesList = document.getElementById("captures-list");
function updateUICaptures() {
	DomSyncList(captures, uiCapturesList, "div", (entry) => entry.uuid, (entry, node) => {
		node.classList.add("noita-decoration-9piece0", "noita-hoverable");
		if (entry.uuid === activeCaptureUUID) {
			node.classList.add("noita-active");
		} else {
			node.classList.remove("noita-active");
		}
		node.noitaCaptureUUID = entry.uuid;
		node.innerHTML = `<span>${entry.name}</span><br><span>${entry.seed}</span>`;
		node.onclick = (event) => setActiveCaptureUUID(entry.uuid);
	});
}

function setActiveCaptureUUID(uuid) {
	activeCaptureUUID = uuid;
	updateUICaptures();

	// Update URL parameter.
	const urlParams = new URLSearchParams(window.location.search);
	urlParams.set("capture", uuid);
	window.history.replaceState(null, null, "?" + urlParams.toString());

	// Update opacity of all TiledImages.
	const osdItemCount = osdViewer.world.getItemCount();
	for (let i = 0; i < osdItemCount; i++) {
		let tiledImage = osdViewer.world.getItemAt(i);
		if (captures[i].uuid === uuid) {
			tiledImage.setOpacity(1);
		} else {
			tiledImage.setOpacity(0);
		}
	}
}

loadCaptures();
updateUICaptures();
