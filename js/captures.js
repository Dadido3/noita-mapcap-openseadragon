// Table of available captures.
// Each with additional metadata like their width, height, top left (in-game) coordinate, game-mode, seed and more.
const builds = [
	{
		name: "2023-12-01",
		buildString: "Build Dec 19 2023 18:34:31",
		platform: "steam",
		beta: "noitabeta",
		type: "dev",
		captures: [
			{ name: "Regular 110638 #1", mode: "Regular", seed: 110638, capturedAt: new Date('2023-12-23T18:56:00'), capturedBy: "D3", tileSource: "maps/noita-2023-12-19-110638.dzi", x: -25600, y: -31744, width: 25600 + 25600 },
			{ name: "Regular 123 #2", mode: "Regular", seed: 123, capturedAt: new Date('2023-12-23T09:25:00'), capturedBy: "D3", tileSource: "maps/example.dzi", x: -4096, y: -4096, width: 8192 },
		],
	},
];

const overlayImages = [
	{ tiled: false, url: "maps/biome_map.png", opacity: 0.2, x: -17920, y: -7168, width: 17920 + 17920 },
];

let buildSelector = document.getElementById("build-selector");
let captureSelector = document.getElementById("capture-selector");

// Load all map captures into OSD and populate the UI list of available builds.
function loadMaps(builds) {
	let osdIndexCounter = 0;

	// Clean stuff first.
	osdViewer.world.removeAll();
	buildSelector.textContent = "";

	builds.forEach(function (build, index) {

		let option = document.createElement("option");
		option.value = index;
		option.innerText = build.name;
		buildSelector.appendChild(option);

		updateCaptures(build.captures);

		build.captures.forEach(function (capture, index) {
			osdViewer.addTiledImage(capture);
			capture.osdIndex = osdIndexCounter;
			osdIndexCounter++;
		});
	});
}

// Update the UI list of available captures for the given build.
function updateCaptures(captures) {
	// Clean stuff first.
	captureSelector.textContent = "";

	captures.forEach(function (capture, index) {

		let option = document.createElement("option");
		option.value = index;
		option.innerText = capture.name;
		captureSelector.appendChild(option);
	});
}

// Sets the opacity of the TiledImage at osdIndex to 1, and the opacity of all the other TiledImages to 0.
function showCaptureByOSDIndex(osdIndex) {
	let osdItemCount = osdViewer.world.getItemCount();
	for (let i = 0; i < osdItemCount; i++) {
		let tiledImage = osdViewer.world.getItemAt(i);
		if (i === osdIndex) {
			tiledImage.setOpacity(1);
		} else {
			tiledImage.setOpacity(0);
		}
	}
}

loadMaps(builds);
showCaptureByOSDIndex(0);

captureSelector.addEventListener("change", (event) => {
	let buildIndex = buildSelector.value
	let captureIndex = event.target.value
	let capture = builds[buildIndex].captures[captureIndex]

	showCaptureByOSDIndex(capture.osdIndex);
});