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
 * NoitaMap is a OpenSeadragon based viewer for showing captured maps of Noita.
 */
class NoitaMap {
	/** The standard side length of a Noita chunk. */
	static get NOITA_CHUNK_SIZE() { return 512 };

	/** @type {OpenSeadragon.Viewer} */
	#osdViewer;

	/** @type {HTMLDivElement} The HTML element that shows the list of available captures. */
	#uiCapturesList;

	/** @type {HTMLDivElement} The HTML element that shows info about the currently selected overlay object. */
	#uiActiveOverlayObjectInfo;

	/** @type {Map_Capture[]} List of all captures. */
	#captures;

	/** @type {Map_Capture} The currently active capture. */
	#activeCapture;

	/** @type {OverlayObject[]} List of all overlay objects. */
	#overlayObjects;

	/** @type {OverlayObject?} The currently active/selected overlay object. */
	#activeOverlayObject;

	/** @type {boolean} True when we should show the overlays. */
	#overlayEnabled;

	/**
	 * @param {Element} container A HTML container that the viewer will be rendered in.
	 * @param {Map_Capture[]} captures List of map captures.
	 * @param {OverlayObject[]} overlayObjects List of overlay objects.
	 */
	constructor(container, captures, overlayObjects) {
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
			// @ts-ignore: Image exists, openseadragon-index.d.ts is not up to date
			const image = event.item.source.Image;
			event.item.setPosition(new OpenSeadragon.Point(Number(image.TopLeft.X), Number(image.TopLeft.Y)), true);
			event.item.setWidth(Number(image.Size.Width), true);
		});

		// Set first map capture as default/fallback.
		if (captures[0]) {
			this.#activeCapture = captures[0];
		} else {
			throw new Error("Can't set default map capture. Ensure that you have passed a list of valid map captures.");
		}

		// Get some variables from the URL.
		const urlParams = new URLSearchParams(window.location.search);
		let activeCaptureID = urlParams.get("capture");
		this.#overlayEnabled = urlParams.get("overlay") ? urlParams.get("overlay") === "1" : false;

		// Load captures.
		this.#captures = captures;
		this.#osdViewer.world.removeAll();
		for (const [index, capture] of captures.entries()) {
			/** @type {OpenSeadragon.TiledImageOptions} */
			const options = { tileSource: capture.tileSource, index: index };
			if (capture.uniqueID === activeCaptureID) { this.#activeCapture = capture; } else { options.opacity = 0; }
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
					if (this.overlayEnabled) {
						uiButton.classList.add("noita-active");
					}
					uiButton.onclick = () => {
						this.overlayEnabled = !this.overlayEnabled;
						if (this.overlayEnabled) {
							uiButton.classList.add("noita-active");
						} else {
							uiButton.classList.remove("noita-active");
						}
					};
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

		// Generate overlay object info container.
		this.#uiActiveOverlayObjectInfo = document.createElement("div");
		this.#osdViewer.addControl(this.#uiActiveOverlayObjectInfo, {autoFade: false});
		this.#uiActiveOverlayObjectInfo.id = "overlay-object-info";

		// Prepare overlay objects.
		this.#overlayObjects = overlayObjects;
		this.#activeOverlayObject = null;
		for (const overlayObject of overlayObjects) {
			new OpenSeadragon.MouseTracker({
				element: overlayObject.viewportHTMLElement,
				clickHandler: (event) => {
					// @ts-ignore: quick exists, openseadragon-index.d.ts is not up to date
					if (event.quick) {
						this.activeOverlayObject = overlayObject;
					}
				},
			});
		}

		// Deselect overlay objects when we click on the empty canvas.
		this.#osdViewer.addHandler("canvas-click", (event) => {
			if (event.quick) {
				this.activeOverlayObject = null;
			}
		});

		// Open overlays.
		this.#uiUpdateOverlay();
	}

	get activeCaptureID() {
		return this.#activeCapture.uniqueID
	}

	/**
	 * Changes the active capture to the given unique ID.
	 * This will show and hide the needed tiled images.
	 */
	set activeCaptureID(uniqueID) {
		for (const [index, capture] of this.#captures.entries()) {
			const tiledImage = this.#osdViewer.world.getItemAt(index);
			if (capture.uniqueID === uniqueID) {
				this.#activeCapture = capture;
				// Update URL parameter.
				const urlParams = new URLSearchParams(window.location.search);
				urlParams.set("capture", uniqueID);
				window.history.replaceState(null, "", "?" + urlParams.toString());
				this.#uiUpdateCapturesList();
				this.#uiUpdateOverlay();
				this.activeOverlayObject = this.activeOverlayObject; // Refresh the overlay selection.
				// Update opacity of all TiledImages.
				tiledImage.setOpacity(1);
			} else {
				// Update opacity of all TiledImages.
				tiledImage.setOpacity(0);
			}
		}
	}

	get overlayEnabled() {
		return this.#overlayEnabled
	}

	/**
	 * Changes the overlay enabled state.
	 * @param {boolean} state New state. Set to true to show overlays.
	 */
	set overlayEnabled(state) {
		this.#overlayEnabled = state;
		this.#uiUpdateOverlay();
		this.activeOverlayObject = null; // Remove current overlay selection.
		// Update URL parameter.
		const urlParams = new URLSearchParams(window.location.search);
		urlParams.set("overlay", state ? "1" : "0");
		window.history.replaceState(null, "", "?" + urlParams.toString());
	}

	get activeOverlayObject() {
		return this.#activeOverlayObject
	}

	/**
	 * Changes the active overlay object to the given unique ID.
	 */
	set activeOverlayObject(overlayObject) {
		// Clean up UI and remove selected class.
		if (this.#activeOverlayObject) {this.#activeOverlayObject.viewportHTMLElement.classList.remove("overlay-selected");}
		this.#uiActiveOverlayObjectInfo.replaceChildren();

		if (overlayObject && !overlayObject.overlayGroups.some(group => this.#activeCapture.overlayGroups.includes(group))) {
			return
		}

		// Update selected class and info box on the top right.
		this.#activeOverlayObject = overlayObject;
		if (this.#activeOverlayObject) {this.#activeOverlayObject.viewportHTMLElement.classList.add("overlay-selected");}
		if (this.#activeOverlayObject) {
			let container = this.#activeOverlayObject.infoBoxHTMLElement();
			container.classList.add("noita-decoration-9piece0");
			this.#uiActiveOverlayObjectInfo.appendChild(container);
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
		DomSyncList(this.#captures, this.#uiCapturesList, "div", (entry) => entry.uniqueID, (entry, node) => {
			node.classList.add("noita-decoration-9piece0", "noita-hoverable", "captures-list-entry");
			if (entry.uniqueID === this.#activeCapture.uniqueID) {
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

	/**
	* Clears and readds all overlay objects that should be visible on the active capture.
	* @returns {void}
	*/
	#uiUpdateOverlay() {
		this.#osdViewer.clearOverlays();

		// Exit early if overlays are disabled.
		if (!this.overlayEnabled) { return; }

		for (const overlayObject of this.#overlayObjects) {
			// Check if we have at least one overlay group in common.
			if (overlayObject.overlayGroups.some(group => this.#activeCapture.overlayGroups.includes(group))) {
				overlayObject.addOverlay(this.#osdViewer);
			}
		}
	}

}
