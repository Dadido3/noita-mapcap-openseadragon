// Copyright (C) 2024 David Vogel
// 
// This file is part of noita-mapcap-openseadragon.
// 
// noita-mapcap-openseadragon is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
// 
// noita-mapcap-openseadragon is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
// 
// You should have received a copy of the GNU General Public License
// along with noita-mapcap-openseadragon.  If not, see <http://www.gnu.org/licenses/>.

/**
 * @typedef {Object} Map_Capture
 * @property {string} uniqueID The unique ID of the capture.
 * @property {string} name The name of the capture.
 * @property {string?} buildString The build string as it is stored in the Noita executable.
 * @property {Date?} builtAt The point in time when the Noita build was created.
 * @property {"Steam"} platform The used game distribution platform.
 * @property {"main"|"noitabeta"} branch Which branch this build is on.
 * @property {"noita.exe"|"noita_dev.exe"} executable Which Noita executable the capture was made with.
 * @property {"Normal"|"Nightmare"|"Daily Run"|"Purgatory"} gameMode The game-mode of the capture.
 * @property {number} seed The seed that was used for the capture. Must be an integer.
 * @property {number} ngPlusLevel How many times the world was "restarted". A new game starts at 1. Must be an integer.
 * @property {Date} createdAt Point in time when this capture was created.
 * @property {string} createdBy Name or nickname of the person that created this capture.
 * @property {string} tileSource Path to the DZI file.
 */

/**
 * NoitaMap is a OpenSeadragon based viewer for showing captured maps of Noita.
 */
class NoitaMap {
	/** The standard side length of a Noita chunk. */
	static get NOITA_CHUNK_SIZE() { return 512 };

	/** @type {OpenSeadragon.Viewer} */
	#osdViewer;

	/** @type {string} The uniqueID of the currently active capture. */
	#activeCaptureID;

	/** @type {HTMLDivElement} The HTML element that shows the list of available captures. */
	#uiCapturesList;

	/**
	 * @param {Element} container A HTML container that the viewer will be rendered in.
	 * @param {Map_Capture[]} captures List of map captures.
	 */
	constructor(container, captures) {
		this.#osdViewer = OpenSeadragon({
			id: container.id,
			prefixUrl: "vendor/openseadragon-bin-4.1.0/images/",
			maxZoomPixelRatio: 20,
			showNavigationControl: false,
			defaultZoomLevel: 0,
			showNavigator: true,
			navigatorPosition: "BOTTOM_RIGHT",
			navigatorDisplayRegionColor: "#777777",
			navigatorHeight: 285,
			navigatorWidth: 200,
			imageSmoothingEnabled: false,
			subPixelRoundingForTransparency: OpenSeadragon.SUBPIXEL_ROUNDING_OCCURRENCES.ALWAYS,
			gestureSettingsMouse: { clickToZoom: false },
			smoothTileEdgesMinZoom: 1,
			minScrollDeltaTime: 10,
			springStiffness: 50,
			preserveViewport: true,
			imageLoaderLimit: 1,
		});

		// Create hover element that shows the world coordinates near the mouse cursor.
		const uiCoordinatesHover = document.createElement("div");
		uiCoordinatesHover.id = "coordinates-hover";
		this.#osdViewer.addControl(uiCoordinatesHover, {});

		new OpenSeadragon.MouseTracker({
			element: container,
			moveHandler: (event) => {
				if (event.pointerType != "mouse") { return }
				const webPoint = event.position;
				const viewportPoint = this.#osdViewer.viewport.pointFromPixel(webPoint);
				const pixelX = Math.floor(viewportPoint.x).toString();
				const pixelY = Math.floor(viewportPoint.y).toString();
				const chunkX = Math.floor(viewportPoint.x / NoitaMap.NOITA_CHUNK_SIZE).toString();
				const chunkY = Math.floor(viewportPoint.y / NoitaMap.NOITA_CHUNK_SIZE).toString();
				uiCoordinatesHover.innerHTML = `<span>(${pixelX}, ${pixelY})</span><br><span>(${chunkX}, ${chunkY})</span>`;
				uiCoordinatesHover.style.left = `${webPoint.x}px`;
				uiCoordinatesHover.style.top = `calc(${webPoint.y}px + 1em)`;
			},
			enterHandler: (event) => {
				if (event.pointerType != "mouse") { return }
				uiCoordinatesHover.style.visibility = "visible";
			},
			leaveHandler: (event) => {
				if (event.pointerType != "mouse") { return }
				uiCoordinatesHover.style.visibility = "hidden";
			},
		}).setTracking(true);

		// Store and load viewport position and zoom level in URL parameters.
		{
			const urlParams = new URLSearchParams(window.location.search);
			const bounds = new OpenSeadragon.Rect(-150, -350, 1024, 512);;
			if (urlParams.has("x")) {
				bounds.x = Number(urlParams.get("x"));
			}
			if (urlParams.has("y")) {
				bounds.y = Number(urlParams.get("y"));
			}
			if (urlParams.has("width")) {
				bounds.width = Number(urlParams.get("width"));
			}
			if (urlParams.has("height")) {
				bounds.height = Number(urlParams.get("height"));
			}
			this.#osdViewer.viewport.fitBounds(bounds, true);
		}
		this.#osdViewer.addHandler("animation-finish", (event) => {
			// Update URL parameter.
			const bounds = event.eventSource.viewport.getBounds();
			const urlParams = new URLSearchParams(window.location.search);
			urlParams.set("x", bounds.x.toFixed(0));
			urlParams.set("y", bounds.y.toFixed(0));
			urlParams.set("width", bounds.width.toFixed(0));
			urlParams.set("height", bounds.height.toFixed(0));
			window.history.replaceState(null, "", "?" + urlParams.toString());
		});

		// Automatically retrieve additional information for TiledImage from their DZIs.
		// This is used to place images in a way so that the OSD coordinate system aligns with the in-game coordinate system.
		this.#osdViewer.world.addHandler('add-item', (event) => {
			/** @type {{Format: string, Overlap: string, Size: {Width: string, Height: string}, TileSize: string, TopLeft: {X: string, Y: string}}} */
			// @ts-ignore
			const image = event.item.source.Image;
			event.item.setPosition(new OpenSeadragon.Point(Number(image.TopLeft.X), Number(image.TopLeft.Y)), true);
			event.item.setWidth(Number(image.Size.Width), true);
		});

		// The unique ID of the currently shown/active capture.
		const urlParams = new URLSearchParams(window.location.search);
		let activeCapture = urlParams.get("capture");
		if (activeCapture) { this.#activeCaptureID = activeCapture; } else { this.#activeCaptureID = "6a0661b1-96bc-4a8d-94c2-b43d1f1c4cd9"; }

		// Load captures.
		this.#osdViewer.world.removeAll();
		for (const [index, capture] of captures.entries()) {
			/** @type {OpenSeadragon.TiledImageOptions} */
			const options = { tileSource: capture.tileSource, index: index };
			if (capture.uniqueID !== this.#activeCaptureID) { options.opacity = 0; }
			this.#osdViewer.addTiledImage(options);
		}

		// Generate custom UI.
		const uiMenuContainer = document.createElement("div");
		this.#osdViewer.addControl(uiMenuContainer, {});
		uiMenuContainer.id = "menu-container";
		{
			const uiTopMenu = document.createElement("div");
			uiMenuContainer.appendChild(uiTopMenu);
			uiTopMenu.id = "menu-toolbar"; // TODO: Rename to toolbar or something
			{
				const uiToolbarGroup = NoitaMap.#uiCreateInventoryBar();
				uiTopMenu.appendChild(uiToolbarGroup);
				{
					const uiButton = NoitaMap.#uiCreateNoitaInventoryBarItem("img/plus.png");
					uiToolbarGroup.appendChild(uiButton);
					uiButton.onclick = () => { this.#osdViewer.viewport.zoomBy(2) };
				}
				{
					const uiButton = NoitaMap.#uiCreateNoitaInventoryBarItem("img/minus.png");
					uiToolbarGroup.appendChild(uiButton);
					uiButton.onclick = () => { this.#osdViewer.viewport.zoomBy(1 / 2) };
				}
				{
					const uiButton = NoitaMap.#uiCreateNoitaInventoryBarItem("img/home.png", "Reset view");
					uiToolbarGroup.appendChild(uiButton);
					uiButton.onclick = () => { this.#osdViewer.viewport.fitBounds(new OpenSeadragon.Rect(-150, -350, 1024, 512)); };
				}
				{
					const uiButton = NoitaMap.#uiCreateNoitaInventoryBarItem("img/spells/enlarge.png", "Toggle fullscreen");
					uiToolbarGroup.appendChild(uiButton);
					uiButton.onclick = () => {
						const newState = !this.#osdViewer.isFullPage();
						this.#osdViewer.setFullScreen(newState);
						if (newState) {
							uiButton.classList.add("noita-active");
						} else {
							uiButton.classList.remove("noita-active");
						}
					};
				}
			}
			{
				const uiToolbarGroup = NoitaMap.#uiCreateInventoryBar();
				uiTopMenu.appendChild(uiToolbarGroup);
				{
					const uiButton = NoitaMap.#uiCreateNoitaInventoryBarItem("img/map.png", "Toggle overlays");
					uiToolbarGroup.appendChild(uiButton);
				}
				{
					const uiButton = NoitaMap.#uiCreateNoitaInventoryBarItem("img/book.png", "Toggle list");
					uiToolbarGroup.appendChild(uiButton);
					uiButton.onclick = () => {
						if (this.#uiCapturesList.style.display === "none") {
							this.#uiCapturesList.style.removeProperty("display");
							uiButton.classList.add("noita-active");
						} else {
							this.#uiCapturesList.style.display = "none";
							uiButton.classList.remove("noita-active");
						}
					};
				}
			}
		}
		{
			this.#uiCapturesList = document.createElement("div");
			uiMenuContainer.appendChild(this.#uiCapturesList);
			this.#uiCapturesList.id = "captures-list";
			this.#uiCapturesList.style.display = "none";
		}

		// Fill list of captures initially.
		this.#uiUpdateCapturesList();

		// Add some overlays for testing.
		{
			const overlay = document.createElement("div");
			overlay.className = "overlay-highlight";
			this.#osdViewer.addOverlay({
				element: overlay,
				location: new OpenSeadragon.Rect(3 * 512, 1 * 512, 512, 512)
			});
		}
		{
			const e = document.createElement("div");
			e.className = "overlay-highlight";
			e.innerHTML = `<span>The Work (Sky)</span>`;
			this.#osdViewer.addOverlay({
				element: e,
				location: new OpenSeadragon.Rect(1 * 512, -3 * 512, 512, 512)
			});
		}
	}

	get activeCaptureID() {
		return this.#activeCaptureID
	}

	/**
	 * Changes the active capture to the given unique ID.
	 * This will show and hide the needed tiled images.
	 */
	set activeCaptureID(uniqueID) {
		this.#activeCaptureID = uniqueID;
		this.#uiUpdateCapturesList();

		// Update URL parameter.
		const urlParams = new URLSearchParams(window.location.search);
		urlParams.set("capture", uniqueID);
		window.history.replaceState(null, "", "?" + urlParams.toString());

		// Update opacity of all TiledImages.
		for (const [index, capture] of noitaCaptures.entries()) {
			const tiledImage = this.#osdViewer.world.getItemAt(index);
			if (capture.uniqueID === uniqueID) {
				tiledImage.setOpacity(1);
			} else {
				tiledImage.setOpacity(0);
			}
		}
	}

	/**
	 * Creates a simple Noita inventory item, to be placed inside an inventory bar.
	 * Can be used as button.
	 * @param {string} iconPath Path to the icon to use. Should be 16x16 pixels.
	 * @param {string} [tooltipText] Text that is shown when the mouse is hovering over the button.
	 * @returns {HTMLDivElement}
	 */
	static #uiCreateNoitaInventoryBarItem(iconPath, tooltipText) {
		const elem = document.createElement("div");
		elem.classList.add("noita-inventory-box");

		const img = document.createElement("img");
		elem.appendChild(img);
		img.classList.add("noita-icon");
		img.src = iconPath;

		if (tooltipText) {
			const tooltip = document.createElement("span")
			elem.appendChild(tooltip);
			tooltip.classList.add("tooltip", "noita-decoration-9piece0");
			tooltip.textContent = tooltipText;
		}

		return elem
	}

	/**
	 * Creates a simple toolbar in the style of the Noita inventory bar.
	 * @returns {HTMLDivElement}
	 */
	static #uiCreateInventoryBar() {
		const elem = document.createElement("div");
		elem.classList.add("noita-inventory-group-invisible");
		return elem
	}

	/**
	* Updates and re-renders the UI list of available captures.
	* @returns {void}
	*/
	#uiUpdateCapturesList() {
		DomSyncList(noitaCaptures, this.#uiCapturesList, "div", (entry) => entry.uniqueID, (entry, node) => {
			node.classList.add("noita-decoration-9piece0", "noita-hoverable", "captures-list-entry");
			if (entry.uniqueID === this.#activeCaptureID) {
				node.classList.add("noita-active");
			} else {
				node.classList.remove("noita-active");
			}
			node.textContent = "";
			{
				const img = document.createElement("img");
				node.appendChild(img);
				img.className = "captures-list-entry-image";
				switch (entry.gameMode) {
					case "Normal": img.src = "img/gamemodes/normal.png"; img.width = 31 * 2; break;
					case "Daily Run": img.src = "img/gamemodes/dailyrun.png"; img.width = 26 * 2; break;
					case "Nightmare": img.src = "img/gamemodes/nightmare.png"; img.width = 36 * 2; break;
					case "Purgatory": img.src = "img/gamemodes/purgatory.png"; img.width = 46 * 2; break;
					default: img.src = "img/gamemodes/unknown.png"; img.width = 38 * 2; break;
				}
			}
			{
				const details = document.createElement("div");
				node.appendChild(details);
				details.className = "captures-list-entry-description";
				details.innerHTML = [
					`<span>Gamemode</span><span>${entry.gameMode}</span>`,
					`<span>Branch</span><span>${entry.branch}</span>`,
					`<span>Build</span><span>${entry.builtAt?.toLocaleDateString()}</span>`,
				].join("");
			}
			/*{
				const bar = NoitaMap.#uiCreateInventoryBar();
				node.appendChild(bar);
				bar.className = "captures-list-entry-bar";
				if (entry.branch == "noitabeta") {
					const item = NoitaMap.#uiCreateNoitaInventoryBarItem("img/spells/beta.png", "Beta branch");
					bar.appendChild(item);
				}
			}*/

			node.onclick = () => { this.activeCaptureID = entry.uniqueID };
		});
	}

}
