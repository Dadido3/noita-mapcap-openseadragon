/**
 * @typedef {Object} Map_Capture
 * @property {string} uniqueID The unique ID of the capture.
 * @property {string} name The name of the capture.
 * @property {string?} buildString The build string as it is stored in the Noita executable.
 * @property {Date?} builtAt The point in time when the Noita build was created.
 * @property {"Steam"} platform The used game distribution platform.
 * @property {"main"|"noitabeta"} branch Which branch this build is on.
 * @property {"noita.exe"|"noita_dev.exe"} executable Which Noita executable the capture was made with.
 * @property {"New Game"|"Nightmare"|"Daily Run"|"Purgatory"} gameMode The game-mode of the capture.
 * @property {number} seed The seed that was used for the capture. Must be an integer.
 * @property {number} ngPlusLevel How many times the world was "restarted". A new game starts at 1. Must be an integer.
 * @property {Date} createdAt Point in time when this capture was created.
 * @property {string} createdBy Name or nickname of the person that created this capture.
 * @property {string} tileSource Path to the DZI file.
 */

/**
 * Table of available captures.
 * Each with additional metadata like their width, height, top left (in-game) coordinate, game-mode, seed and more.
 * 
 * The index of this list has to be in sync with the internal list of TiledImages inside of OpenSeadragon.
 * This means one shouldn't delete or add TiledImages after loadCaptures has been called.
 * TODO: Find a way to store user data inside of the TiledImages
 * @type {Map_Capture[]}
 */
const captures = [
	{
		uniqueID: "b3f7cf7f-cdf6-448b-8772-3ce4dc28f238",
		name: "Example capture",
		buildString: "Build Feb  6 2024 15:58:22",
		builtAt: new Date('2024-02-06T15:58:22+02:00'),
		platform: "Steam",
		branch: "noitabeta",
		executable: "noita.exe",
		gameMode: "New Game",
		seed: 786433191,
		ngPlusLevel: 1,
		createdAt: new Date('2024-02-08T19:02:16+01:00'),
		createdBy: "D3",
		tileSource: "captures/example.dzi",
	},
	{
		uniqueID: "dfa609d2-3440-4024-84c6-99430a149c94",
		name: "Play capture 2022-08-14",
		buildString: null,
		builtAt: null,
		platform: "Steam",
		branch: "noitabeta",
		executable: "noita.exe",
		gameMode: "New Game",
		seed: 123,
		ngPlusLevel: 1,
		createdAt: new Date('2022-08-14T00:00:00'),
		createdBy: "D3",
		tileSource: "captures/play-2022-08-14.dzi",
	},
	{
		uniqueID: "f702768a-5fe0-48e1-828a-b531d9efdb12",
		name: "2024-02-06 15:58:22 NG 78633191",
		buildString: "Build Feb  6 2024 15:58:22",
		builtAt: new Date('2024-02-06T15:58:22+02:00'),
		platform: "Steam",
		branch: "noitabeta",
		executable: "noita.exe",
		gameMode: "New Game",
		seed: 78633191,
		ngPlusLevel: 1,
		createdAt: new Date('2024-02-08T15:27:30+01:00'),
		createdBy: "D3",
		tileSource: "captures/2024-02-06-15-58-22-noita-ng-78633191.dzi",
	},
	{
		uniqueID: "6a0661b1-96bc-4a8d-94c2-b43d1f1c4cd9",
		name: "2024-02-06 15:58:22 NG 786433191",
		buildString: "Build Feb  6 2024 15:58:22",
		builtAt: new Date('2024-02-06T15:58:22+02:00'),
		platform: "Steam",
		branch: "noitabeta",
		executable: "noita.exe",
		gameMode: "New Game",
		seed: 786433191,
		ngPlusLevel: 1,
		createdAt: new Date('2024-02-08T19:02:16+01:00'),
		createdBy: "D3",
		tileSource: "captures/2024-02-06-15-58-22-noita-ng-786433191.dzi",
	},
	{
		uniqueID: "c9815905-6bb7-49e0-856e-4cf3d126bd92",
		name: "2024-02-14 07:46:57 NG 786433191",
		buildString: "Build Feb 14 2024 07:46:57",
		builtAt: new Date('2024-02-14T07:46:57+02:00'),
		platform: "Steam",
		branch: "main",
		executable: "noita.exe",
		gameMode: "New Game",
		seed: 786433191,
		ngPlusLevel: 1,
		createdAt: new Date('2024-02-20T12:39:52+01:00'),
		createdBy: "D3",
		tileSource: "captures/2024-02-14-07-46-57-noita-ng-786433191.dzi",
	},
	{
		uniqueID: "91adc4b2-70dd-4649-904a-5ab8dd5ed4c4",
		name: "2024-02-14 07:46:57 Purgatory 786433191",
		buildString: "Build Feb 14 2024 07:46:57",
		builtAt: new Date('2024-02-14T07:46:57+02:00'),
		platform: "Steam",
		branch: "main",
		executable: "noita.exe",
		gameMode: "Purgatory",
		seed: 786433191,
		ngPlusLevel: 1,
		createdAt: new Date('2024-02-17T14:53:54+01:00'),
		createdBy: "D3",
		tileSource: "captures/2024-02-14-07-46-57-noita-purgatory-786433191.dzi",
	},
];

const overlayImages = [
	{ url: "captures/biome_map.png", opacity: 0.2, xOffset: -17920, yOffset: -7168, width: 17920 + 17920 },
];

// The unique ID of the currently shown/active capture.
const urlParams = new URLSearchParams(window.location.search);
let activeCapture = urlParams.get("capture");
if (activeCapture == null) { activeCapture = "6a0661b1-96bc-4a8d-94c2-b43d1f1c4cd9"; }

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

/**
 * Loads all captures and other things into OSD.
 * @returns {void}
 */
function loadCaptures() {
	// Clean stuff first.
	osdViewer.world.removeAll();

	for (const [index, capture] of captures.entries()) {
		/** @type {OpenSeadragon.TiledImageOptions} */
		const options = { tileSource: capture.tileSource, index: index };
		if (capture.uniqueID !== activeCapture) { options.opacity = 0; }
		osdViewer.addTiledImage(options);
	}

	//osdViewer.addSimpleImage({ url: overlayImages[0].url, x: overlayImages[0].xOffset, y: overlayImages[0].yOffset, width: overlayImages[0].width, opacity: 0.25});
}

// Test menu stuff.
const uiMenuContainer = document.createElement("div");
uiMenuContainer.id = "menu-container";
const uiTopMenu = document.createElement("div");
uiTopMenu.id = "top-menu";
uiTopMenu.innerHTML = 
`<div class="noita-inventory-group-invisible">
	<div id="button-zoom-in" class="noita-inventory-box">
		<img src="img/plus.png" class="noita-icon">
	</div>
	<div id="button-zoom-out" class="noita-inventory-box">
		<img src="img/minus.png" class="noita-icon">
	</div>
	<div id="button-home" class="noita-inventory-box">
		<img src="img/home.png" class="noita-icon">
		<span class="tooltip noita-decoration-9piece0">Reset view</span>
	</div>
	<div id="button-toggle-fullscreen" class="noita-inventory-box">
		<img src="img/enlarge.png" class="noita-icon">
		<span class="tooltip noita-decoration-9piece0">Toggle fullscreen</span>
	</div>
</div>
<div class="noita-inventory-group-invisible">
	<div class="noita-inventory-box">
		<img src="img/beta.png" class="noita-icon">
		<span class="tooltip noita-decoration-9piece0">Beta</span>
	</div>
	<div id="button-toggle-overlays" class="noita-inventory-box">
		<img src="img/map.png" class="noita-icon">
		<span class="tooltip noita-decoration-9piece0">Toggle overlays</span>
	</div>
	<div id="button-toggle-captures" class="noita-inventory-box">
		<img src="img/book.png" class="noita-icon">
		<span class="tooltip noita-decoration-9piece0">Toggle map list</span>
	</div>
</div>`;
const uiCapturesList = document.createElement("div");
uiCapturesList.id = "captures-list";
uiCapturesList.style.display = "none";
uiMenuContainer.appendChild(uiTopMenu);
uiMenuContainer.appendChild(uiCapturesList);

osdViewer.addControl(uiMenuContainer, {});
//osdContainer?.appendChild(uiMenuContainer);

const uiButtonZoomIn = document.getElementById("button-zoom-in");
if (uiButtonZoomIn && osdViewer) { uiButtonZoomIn.onclick = () => { osdViewer.viewport.zoomBy(2) }; }

const uiButtonZoomOut = document.getElementById("button-zoom-out");
if (uiButtonZoomOut && osdViewer) { uiButtonZoomOut.onclick = () => { osdViewer.viewport.zoomBy(1 / 2) }; }

const uiButtonHome = document.getElementById("button-home");
if (uiButtonHome && osdViewer) { uiButtonHome.onclick = () => { osdViewer.viewport.fitBounds(new OpenSeadragon.Rect(-150, -350, 1024, 512)); }; }

const uiButtonToggleFullscreen = document.getElementById("button-toggle-fullscreen");
if (uiButtonToggleFullscreen && osdViewer) {
	uiButtonToggleFullscreen.onclick = () => {
		const newState = !osdViewer.isFullPage();
		osdViewer.setFullScreen(newState);
		if (newState) {
			uiButtonToggleFullscreen.classList.add("noita-active");
		} else {
			uiButtonToggleFullscreen.classList.remove("noita-active");
		}
	};
}

const uiButtonToggleCaptures = document.getElementById("button-toggle-captures");
if (uiButtonToggleCaptures && osdViewer) { uiButtonToggleCaptures.onclick = () => {
	if (uiCapturesList.style.display === "none") {
		uiCapturesList.style.removeProperty("display");
		uiButtonToggleCaptures.classList.add("noita-active");
	} else {
		uiCapturesList.style.display = "none";
		uiButtonToggleCaptures.classList.remove("noita-active");
	}
}; }

/**
 * Updates the UI list of available captures.
 * @returns {void}
 */
function updateUICaptures() {
	if (!uiCapturesList) {
		return;
	}

	DomSyncList(captures, uiCapturesList, "div", (entry) => entry.uniqueID, (entry, node) => {
		node.classList.add("noita-decoration-9piece0", "noita-hoverable");
		if (entry.uniqueID === activeCapture) {
			node.classList.add("noita-active");
		} else {
			node.classList.remove("noita-active");
		}
		node.innerHTML = `<span>${entry.name}</span><br><span>${entry.seed}</span>`;
		node.onclick = () => setActiveCaptureUUID(entry.uniqueID);
	});
}

/**
 * Changes the currently active capture.
 * @param {string} uniqueID
 * @returns {void}
 */
function setActiveCaptureUUID(uniqueID) {
	activeCapture = uniqueID;
	updateUICaptures();

	// Update URL parameter.
	const urlParams = new URLSearchParams(window.location.search);
	urlParams.set("capture", uniqueID);
	window.history.replaceState(null, "", "?" + urlParams.toString());

	// Update opacity of all TiledImages.
	for (const [index, capture] of captures.entries()) {
		const tiledImage = osdViewer.world.getItemAt(index);
		if (capture.uniqueID === uniqueID) {
			tiledImage.setOpacity(1);
		} else {
			tiledImage.setOpacity(0);
		}
	}
}

loadCaptures();
updateUICaptures();
