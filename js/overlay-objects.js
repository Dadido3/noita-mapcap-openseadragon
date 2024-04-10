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

class OverlayObject {

	/**
	 * @typedef {string} Overlay_Object_Group
	 */

	/**
	 * @typedef {"Biome"|"Entity"|"Boss"|"Orb"|"Other"} Overlay_Object_Category
	 */

	/**
	 * @typedef {Object} OverlayObjectOptions
	 * @property {string} uniqueID The unique ID of the overlay.
	 * @property {string} name The name of the overlay.
	 * @property {Overlay_Object_Category[]} categories List of categories.
	 * @property {Overlay_Object_Group[]} overlayGroups List of groups that this overlay object is part of. This is used to associate overlay objects with map captures.
	 * @property {Date} createdAt Point in time when this overlay object was created.
	 * @property {Date} updatedAt Point in time when this overlay object was updated.
	 * @property {string[]} authoredBy Name or nickname of the persons that created/updated this overlay.
	 * @property {string[]} infoBoxHTML HTML that is shown when an overlay object is selected/active.
	 * @property {Map<string, string>} externalURLs List of relevant external resources.
	 */

	/** @type {OverlayObjectOptions} */
	#options;

	/** @type {HTMLElement} The cached HTML element that will be shown in the viewport. */
	#viewportHTMLElement;

	get uniqueID() { return this.#options.uniqueID; }
	get name() { return this.#options.name; }
	get categories() { return this.#options.categories; }
	get overlayGroups() { return this.#options.overlayGroups; }
	get createdAt() { return this.#options.createdAt; }
	get updatedAt() { return this.#options.updatedAt; }
	get authoredBy() { return this.#options.authoredBy; }
	get infoBoxHTML() { return this.#options.infoBoxHTML; }
	get externalURLs() { return this.#options.externalURLs; }

	get viewportHTMLElement() { return this.#viewportHTMLElement; };

	/**
	 * @param {OverlayObjectOptions} options
	 */
	constructor(options) {
		this.#options = options;
		this.#viewportHTMLElement = this.#renderViewportHTMLElement();
	}

	/**
	 * Returns the overlay object as a HTMLElement.
	 * @returns {HTMLElement}
	 */
	#renderViewportHTMLElement() {
		const elem = document.createElement("div");
		elem.className = "overlay-box";
		return elem;
	}

	/**
	 * @returns {HTMLElement} Element that contains content about the overlay object, which will be shown in the info box.
	 */
	infoBoxHTMLElement() {
		const elem = document.createElement("div");
		elem.innerHTML = this.#options.infoBoxHTML.join("");
		{
			const titleElem = document.createElement("div");
			elem.prepend(titleElem);
			titleElem.className = "overlay-object-info-title";
			titleElem.innerText = this.#options.name;
		}
		{
			const linkContainer = document.createElement("div");
			elem.append(linkContainer);
			linkContainer.className = "overlay-object-info-links";
			for (const [name, url] of this.#options.externalURLs) {
				const linkElem = document.createElement("a");
				linkContainer.appendChild(linkElem);
				linkElem.innerText = name;
				linkElem.href = url;
				linkElem.target = "_blank";
			}
		}
		return elem;
	}

	/**
	 * Adds this object as overlay to the given OSD viewer.
	 * @param {OpenSeadragon.Viewer} osdViewer 
	 */
	addOverlay(osdViewer) {
		osdViewer.addOverlay({
			element: this.viewportHTMLElement,
			location: new OpenSeadragon.Point(0, 0),
		});
	}
}

class OverlayBox extends OverlayObject {
	/**
	 * @typedef {Object} OverlayBoxOptions
	 * @property {OpenSeadragon.Rect} location Place of this object as OSD Rect coordinates. This is in world coordinates.
	 */

	/** @type {OverlayBoxOptions} */
	#options;

	/** @type {HTMLElement} The cached HTML element that will be shown in the viewport. */
	#viewportHTMLElement;

	get viewportHTMLElement() { return this.#viewportHTMLElement; };

	/**
	 * @param {OverlayObjectOptions & OverlayBoxOptions} options 
	 */
	constructor(options) {
		super(options);
		this.#options = options;
		this.#viewportHTMLElement = this.#renderViewportHTMLElement();
	}

	/**
	 * Returns the overlay object as a HTMLElement.
	 * @returns {HTMLElement}
	 */
	#renderViewportHTMLElement() {
		const elem = document.createElement("div");
		elem.className = "overlay-box";
		{
			const tooltipElement = document.createElement("span")
			elem.appendChild(tooltipElement);
			tooltipElement.classList.add("tooltip", "overlay-tooltip", "noita-decoration-9piece0");
			tooltipElement.textContent = super.name;
		}
		return elem;
	}

	/**
	 * Adds this object as overlay to the given OSD viewer.
	 * @param {OpenSeadragon.Viewer} osdViewer 
	 */
	addOverlay(osdViewer) {
		osdViewer.addOverlay({
			element: this.viewportHTMLElement,
			location: this.#options.location,
		});
	}
}

class OverlaySymbol extends OverlayObject {
	/**
	 * @typedef {Object} OverlaySymbolOptions
	 * @property {OpenSeadragon.Point} location Place of this object as OSD Point coordinates. This is in world coordinates.
	 * @property {OpenSeadragon.Placement|undefined} placement How to place the overlay at the given location.
	 * @property {string} imageURL URL of the image shown as symbol.
	 */

	/** @type {OverlaySymbolOptions} */
	#options;

	/** @type {HTMLElement} The cached HTML element that will be shown in the viewport. */
	#viewportHTMLElement;

	get viewportHTMLElement() { return this.#viewportHTMLElement; };

	/**
	 * @param {OverlayObjectOptions & OverlaySymbolOptions} options 
	 */
	constructor(options) {
		super(options);
		this.#options = options;
		this.#viewportHTMLElement = this.#renderViewportHTMLElement();
	}

	/**
	 * Returns the overlay object as a HTMLElement.
	 * @returns {HTMLElement}
	 */
	#renderViewportHTMLElement() {
		const elem = document.createElement("div");
		elem.className = "overlay-symbol";
		{
			const tooltipElement = document.createElement("span")
			elem.appendChild(tooltipElement);
			tooltipElement.classList.add("tooltip", "overlay-tooltip", "noita-decoration-9piece0");
			tooltipElement.textContent = this.name;
		}

		const image = document.createElement("img");
		image.src = this.#options.imageURL;
		elem.appendChild(image);

		return elem;
	}

	/**
	 * Adds this object as overlay to the given OSD viewer.
	 * @param {OpenSeadragon.Viewer} osdViewer 
	 */
	addOverlay(osdViewer) {
		osdViewer.addOverlay({
			element: this.viewportHTMLElement,
			location: this.#options.location,
			placement: this.#options.placement,
		});
	}
}

/**
 * Table of available overlay objects.
 * 
 * @type {OverlayObject[]}
 */
const noitaOverlayObjects = [
	new OverlayBox({
		uniqueID: "2e2dd3f9-4e07-452f-a902-49eae05a403c",
		name: "Henkevä Temple",
		categories: ["Biome"],
		overlayGroups: ["Normal"],
		createdAt: new Date('2024-04-03T00:39:34.000+02:00'),
		updatedAt: new Date('2024-04-03T00:39:34.000+02:00'),
		authoredBy: ["D3"],
		location: new OpenSeadragon.Rect(-5 * 512, -11 * 512, 3 * 512, 3 * 512),
		infoBoxHTML: [
			`<p>"Spirited Temple". Potions here require mimicium. Pheromone will aid you. They might also need a little kick.</p>`,
		],
		externalURLs: new Map([
			["wiki.gg", "https://noita.wiki.gg/wiki/Henkev%C3%A4_Temple"],
		]),
	}),
	new OverlayBox({
		uniqueID: "6d238b75-6045-440a-a688-205ce0aeb4d8",
		name: "The Work (Sky)",
		categories: ["Biome"],
		overlayGroups: ["Normal"],
		createdAt: new Date('2024-03-27T15:54:19.000+01:00'),
		updatedAt: new Date('2024-03-27T15:54:19.000+01:00'),
		authoredBy: ["D3"],
		location: new OpenSeadragon.Rect(1 * 512, -3 * 512, 512, 512),
		infoBoxHTML: [
			`<p>The Work (Sky) is one of 3 places in the game bearing the name "<a href="https://noita.wiki.gg/wiki/The_Work" target="_blank" title="The Work">The Work</a>", and is an infinitely looping biome high in the skies above the <a href="https://noita.wiki.gg/wiki/Forest" target="_blank" title="Forest">Forest</a>.</p>`,
		],
		externalURLs: new Map([
			["wiki.gg", "https://noita.wiki.gg/wiki/The_Work_(Sky)"],
		]),
	}),
	new OverlaySymbol({
		uniqueID: "732b3623-27e2-45b8-8544-d99873df8e51",
		name: "Orb: Earthquake",
		categories: ["Entity", "Orb"],
		overlayGroups: ["Normal"],
		createdAt: new Date('2024-04-02T23:46:18.000+02:00'),
		updatedAt: new Date('2024-04-02T23:46:18.000+02:00'),
		authoredBy: ["D3"],
		location: new OpenSeadragon.Point(9983, -1164),
		placement: OpenSeadragon.Placement.BOTTOM,
		imageURL: "img/orbs/earthquake.webp",
		infoBoxHTML: [
			`<p><b>Orbs of True Knowledge</b> are collectibles that can be picked up by you in the world. They are always accompanied by an <a href="https://noita.wiki.gg/wiki/Emerald_Tablet" target="_blank" title="Emerald Tablet">Emerald Tablet</a>, and many are also housed in Orb Rooms, which have <a href="https://noita.wiki.gg/wiki/Game_Lore#Creation_Lore_.28Orb_Room_Glyphs.29" target="_blank" title="Game Lore">hidden messages about the lore of the World</a> when their basins are filled with specific contents.</p>`,
			`<p>Orb ID: 1</p>`,
		],
		externalURLs: new Map([
			["Orb of True Knowledge (wiki.gg)", "https://noita.wiki.gg/wiki/Orb_of_True_Knowledge"],
			["Earthquake (wiki.gg)", "https://noita.wiki.gg/wiki/Earthquake"],
		]),
	}),
	new OverlaySymbol({
		uniqueID: "e4b7dc0d-a60b-4e42-96b2-25f024edc1ea",
		name: "Orb: Sea of Lava",
		categories: ["Entity", "Orb"],
		overlayGroups: ["Normal"],
		createdAt: new Date('2024-03-28T22:09:24.000+01:00'),
		updatedAt: new Date('2024-03-28T22:09:24.000+01:00'),
		authoredBy: ["D3"],
		location: new OpenSeadragon.Point(780, -1070),
		placement: OpenSeadragon.Placement.BOTTOM,
		imageURL: "img/orbs/sea-of-lava.webp",
		infoBoxHTML: [
			`<p><b>Orbs of True Knowledge</b> are collectibles that can be picked up by you in the world. They are always accompanied by an <a href="https://noita.wiki.gg/wiki/Emerald_Tablet" target="_blank" title="Emerald Tablet">Emerald Tablet</a>, and many are also housed in Orb Rooms, which have <a href="https://noita.wiki.gg/wiki/Game_Lore#Creation_Lore_.28Orb_Room_Glyphs.29" target="_blank" title="Game Lore">hidden messages about the lore of the World</a> when their basins are filled with specific contents.</p>`,
			`<p>Orb ID: 0</p>`,
		],
		externalURLs: new Map([
			["Orb of True Knowledge (wiki.gg)", "https://noita.wiki.gg/wiki/Orb_of_True_Knowledge"],
			["Sea of ... spell (wiki.gg)", "https://noita.wiki.gg/wiki/Sea_of"],
		]),
	}),
	new OverlaySymbol({
		uniqueID: "bc986052-7c6d-4810-a400-e2bdaea84cad",
		name: "Orb: Summon Tentacle",
		categories: ["Entity", "Orb"],
		overlayGroups: ["Normal"],
		createdAt: new Date('2024-04-02T23:48:29.000+02:00'),
		updatedAt: new Date('2024-04-02T23:48:29.000+02:00'),
		authoredBy: ["D3"],
		location: new OpenSeadragon.Point(-9985, 2948),
		placement: OpenSeadragon.Placement.BOTTOM,
		imageURL: "img/orbs/tentacle.webp",
		infoBoxHTML: [
			`<p><b>Orbs of True Knowledge</b> are collectibles that can be picked up by you in the world. They are always accompanied by an <a href="https://noita.wiki.gg/wiki/Emerald_Tablet" target="_blank" title="Emerald Tablet">Emerald Tablet</a>, and many are also housed in Orb Rooms, which have <a href="https://noita.wiki.gg/wiki/Game_Lore#Creation_Lore_.28Orb_Room_Glyphs.29" target="_blank" title="Game Lore">hidden messages about the lore of the World</a> when their basins are filled with specific contents.</p>`,
			`<p>Orb ID: 2</p>`,
		],
		externalURLs: new Map([
			["Orb of True Knowledge (wiki.gg)", "https://noita.wiki.gg/wiki/Orb_of_True_Knowledge"],
			["Summon Tentacle (wiki.gg)", "https://noita.wiki.gg/wiki/Summon_Tentacle"],
		]),
	}),
	new OverlaySymbol({
		uniqueID: "1ee8beb9-9583-4004-b25d-eabeba7ce04d",
		name: "Orb: Nuke",
		categories: ["Entity", "Orb"],
		overlayGroups: ["Normal"],
		createdAt: new Date('2024-04-02T23:52:11.000+02:00'),
		updatedAt: new Date('2024-04-02T23:52:11.000+02:00'),
		authoredBy: ["D3"],
		location: new OpenSeadragon.Point(3473, 1912),
		placement: OpenSeadragon.Placement.BOTTOM,
		imageURL: "img/orbs/nuke.webp",
		infoBoxHTML: [
			`<p><b>Orbs of True Knowledge</b> are collectibles that can be picked up by you in the world. They are always accompanied by an <a href="https://noita.wiki.gg/wiki/Emerald_Tablet" target="_blank" title="Emerald Tablet">Emerald Tablet</a>, and many are also housed in Orb Rooms, which have <a href="https://noita.wiki.gg/wiki/Game_Lore#Creation_Lore_.28Orb_Room_Glyphs.29" target="_blank" title="Game Lore">hidden messages about the lore of the World</a> when their basins are filled with specific contents.</p>`,
			`<p>Orb ID: 3</p>`,
		],
		externalURLs: new Map([
			["Orb of True Knowledge (wiki.gg)", "https://noita.wiki.gg/wiki/Orb_of_True_Knowledge"],
			["Nuke (wiki.gg)", "https://noita.wiki.gg/wiki/Nuke"],
		]),
	}),
	new OverlaySymbol({
		uniqueID: "d1f5e7a7-9a8d-4449-9e6c-b6f3ac64b180",
		name: "Orb: Necromancy",
		categories: ["Entity", "Orb"],
		overlayGroups: ["Normal"],
		createdAt: new Date('2024-04-02T23:58:50.000+02:00'),
		updatedAt: new Date('2024-04-02T23:58:50.000+02:00'),
		authoredBy: ["D3"],
		location: new OpenSeadragon.Point(9983, 2948),
		placement: OpenSeadragon.Placement.BOTTOM,
		imageURL: "img/orbs/necromancy.webp",
		infoBoxHTML: [
			`<p><b>Orbs of True Knowledge</b> are collectibles that can be picked up by you in the world. They are always accompanied by an <a href="https://noita.wiki.gg/wiki/Emerald_Tablet" target="_blank" title="Emerald Tablet">Emerald Tablet</a>, and many are also housed in Orb Rooms, which have <a href="https://noita.wiki.gg/wiki/Game_Lore#Creation_Lore_.28Orb_Room_Glyphs.29" target="_blank" title="Game Lore">hidden messages about the lore of the World</a> when their basins are filled with specific contents.</p>`,
			`<p>Orb ID: 4</p>`,
		],
		externalURLs: new Map([
			["Orb of True Knowledge (wiki.gg)", "https://noita.wiki.gg/wiki/Orb_of_True_Knowledge"],
			["Necromancy (wiki.gg)", "https://noita.wiki.gg/wiki/Necromancy"],
		]),
	}),
	new OverlaySymbol({
		uniqueID: "9b3b5eed-5e76-4d7e-8694-127ff69e998b",
		name: "Orb: Holy Bomb",
		categories: ["Entity", "Orb"],
		overlayGroups: ["Normal"],
		createdAt: new Date('2024-04-02T23:58:45.000+02:00'),
		updatedAt: new Date('2024-04-02T23:58:45.000+02:00'),
		authoredBy: ["D3"],
		location: new OpenSeadragon.Point(-4353, 3972),
		placement: OpenSeadragon.Placement.BOTTOM,
		imageURL: "img/orbs/holy-bomb.webp",
		infoBoxHTML: [
			`<p><b>Orbs of True Knowledge</b> are collectibles that can be picked up by you in the world. They are always accompanied by an <a href="https://noita.wiki.gg/wiki/Emerald_Tablet" target="_blank" title="Emerald Tablet">Emerald Tablet</a>, and many are also housed in Orb Rooms, which have <a href="https://noita.wiki.gg/wiki/Game_Lore#Creation_Lore_.28Orb_Room_Glyphs.29" target="_blank" title="Game Lore">hidden messages about the lore of the World</a> when their basins are filled with specific contents.</p>`,
			`<p>Orb ID: 5</p>`,
		],
		externalURLs: new Map([
			["Orb of True Knowledge (wiki.gg)", "https://noita.wiki.gg/wiki/Orb_of_True_Knowledge"],
			["Holy Bomb (wiki.gg)", "https://noita.wiki.gg/wiki/Holy_Bomb"],
		]),
	}),
	new OverlaySymbol({
		uniqueID: "7f3e356d-bb21-4f18-a5b7-610d53a4385a",
		name: "Orb: Holy Bomb",
		categories: ["Entity", "Orb"],
		overlayGroups: ["Normal"],
		createdAt: new Date('2024-04-02T23:58:37.000+02:00'),
		updatedAt: new Date('2024-04-02T23:58:37.000+02:00'),
		authoredBy: ["D3"],
		location: new OpenSeadragon.Point(-3841, 10116),
		placement: OpenSeadragon.Placement.BOTTOM,
		imageURL: "img/orbs/spiral-shot.webp",
		infoBoxHTML: [
			`<p><b>Orbs of True Knowledge</b> are collectibles that can be picked up by you in the world. They are always accompanied by an <a href="https://noita.wiki.gg/wiki/Emerald_Tablet" target="_blank" title="Emerald Tablet">Emerald Tablet</a>, and many are also housed in Orb Rooms, which have <a href="https://noita.wiki.gg/wiki/Game_Lore#Creation_Lore_.28Orb_Room_Glyphs.29" target="_blank" title="Game Lore">hidden messages about the lore of the World</a> when their basins are filled with specific contents.</p>`,
			`<p>Orb ID: 6</p>`,
		],
		externalURLs: new Map([
			["Orb of True Knowledge (wiki.gg)", "https://noita.wiki.gg/wiki/Orb_of_True_Knowledge"],
			["Spiral Shot (wiki.gg)", "https://noita.wiki.gg/wiki/Spiral_Shot"],
		]),
	}),
	new OverlaySymbol({
		uniqueID: "72ec9d20-4eb2-4bf5-b1e6-4222c447ffa9",
		name: "Orb: Thundercloud",
		categories: ["Entity", "Orb"],
		overlayGroups: ["Normal"],
		createdAt: new Date('2024-04-02T16:32:28.000+02:00'),
		updatedAt: new Date('2024-04-02T16:32:28.000+02:00'),
		authoredBy: ["D3"],
		location: new OpenSeadragon.Point(4351, 900),
		placement: OpenSeadragon.Placement.BOTTOM,
		imageURL: "img/orbs/thundercloud.webp",
		infoBoxHTML: [
			`<p><b>Orbs of True Knowledge</b> are collectibles that can be picked up by you in the world. They are always accompanied by an <a href="https://noita.wiki.gg/wiki/Emerald_Tablet" target="_blank" title="Emerald Tablet">Emerald Tablet</a>, and many are also housed in Orb Rooms, which have <a href="https://noita.wiki.gg/wiki/Game_Lore#Creation_Lore_.28Orb_Room_Glyphs.29" target="_blank" title="Game Lore">hidden messages about the lore of the World</a> when their basins are filled with specific contents.</p>`,
			`<p>Orb ID: 7</p>`,
		],
		externalURLs: new Map([
			["Orb of True Knowledge (wiki.gg)", "https://noita.wiki.gg/wiki/Orb_of_True_Knowledge"],
			["Thundercloud (wiki.gg)", "https://noita.wiki.gg/wiki/Thundercloud"],
		]),
	}),
	new OverlaySymbol({
		uniqueID: "caffc1d4-5e61-4b4d-99f9-e73504f23f54",
		name: "Orb: Fireworks!",
		categories: ["Entity", "Orb"],
		overlayGroups: ["Normal"],
		createdAt: new Date('2024-04-03T00:03:53.000+02:00'),
		updatedAt: new Date('2024-04-03T00:03:53.000+02:00'),
		authoredBy: ["D3"],
		location: new OpenSeadragon.Point(-257, 16260),
		placement: OpenSeadragon.Placement.BOTTOM,
		imageURL: "img/orbs/fireworks.webp",
		infoBoxHTML: [
			`<p><b>Orbs of True Knowledge</b> are collectibles that can be picked up by you in the world. They are always accompanied by an <a href="https://noita.wiki.gg/wiki/Emerald_Tablet" target="_blank" title="Emerald Tablet">Emerald Tablet</a>, and many are also housed in Orb Rooms, which have <a href="https://noita.wiki.gg/wiki/Game_Lore#Creation_Lore_.28Orb_Room_Glyphs.29" target="_blank" title="Game Lore">hidden messages about the lore of the World</a> when their basins are filled with specific contents.</p>`,
			`<p>Orb ID: 8</p>`,
		],
		externalURLs: new Map([
			["Orb of True Knowledge (wiki.gg)", "https://noita.wiki.gg/wiki/Orb_of_True_Knowledge"],
			["Fireworks! (wiki.gg)", "https://noita.wiki.gg/wiki/Fireworks!"],
		]),
	}),
	new OverlaySymbol({
		uniqueID: "1b0a73b6-cd11-45ca-ba5f-d8bcd0bcf1bb",
		name: "Orb: Summon Deercoy, Flock of Ducks, and Worm Launcher",
		categories: ["Entity", "Orb"],
		overlayGroups: ["Normal"],
		createdAt: new Date('2024-04-03T00:04:02.000+02:00'),
		updatedAt: new Date('2024-04-03T00:04:02.000+02:00'),
		authoredBy: ["D3"],
		location: new OpenSeadragon.Point(-8961, 14724),
		placement: OpenSeadragon.Placement.BOTTOM,
		imageURL: "img/orbs/exploding-deer.webp",
		infoBoxHTML: [
			`<p><b>Orbs of True Knowledge</b> are collectibles that can be picked up by you in the world. They are always accompanied by an <a href="https://noita.wiki.gg/wiki/Emerald_Tablet" target="_blank" title="Emerald Tablet">Emerald Tablet</a>, and many are also housed in Orb Rooms, which have <a href="https://noita.wiki.gg/wiki/Game_Lore#Creation_Lore_.28Orb_Room_Glyphs.29" target="_blank" title="Game Lore">hidden messages about the lore of the World</a> when their basins are filled with specific contents.</p>`,
			`<p>Orb ID: 9</p>`,
		],
		externalURLs: new Map([
			["Orb of True Knowledge (wiki.gg)", "https://noita.wiki.gg/wiki/Orb_of_True_Knowledge"],
			["Summon Deercoy (wiki.gg)", "https://noita.wiki.gg/wiki/Summon_Deercoy"],
			["Flock of Ducks (wiki.gg)", "https://noita.wiki.gg/wiki/Flock_of_Ducks"],
			["Worm Launcher (wiki.gg)", "https://noita.wiki.gg/wiki/Worm_Launcher"],
		]),
	}),
	new OverlaySymbol({
		uniqueID: "fcd5ce69-cebf-4e32-93d0-986bb474ff22",
		name: "Orb: Cement",
		categories: ["Entity", "Orb"],
		overlayGroups: ["Normal"],
		createdAt: new Date('2024-04-03T00:06:32.000+02:00'),
		updatedAt: new Date('2024-04-03T00:06:32.000+02:00'),
		authoredBy: ["D3"],
		location: new OpenSeadragon.Point(10495, 16260),
		placement: OpenSeadragon.Placement.BOTTOM,
		imageURL: "img/orbs/cement.webp",
		infoBoxHTML: [
			`<p><b>Orbs of True Knowledge</b> are collectibles that can be picked up by you in the world. They are always accompanied by an <a href="https://noita.wiki.gg/wiki/Emerald_Tablet" target="_blank" title="Emerald Tablet">Emerald Tablet</a>, and many are also housed in Orb Rooms, which have <a href="https://noita.wiki.gg/wiki/Game_Lore#Creation_Lore_.28Orb_Room_Glyphs.29" target="_blank" title="Game Lore">hidden messages about the lore of the World</a> when their basins are filled with specific contents.</p>`,
			`<p>Orb ID: 10</p>`,
		],
		externalURLs: new Map([
			["Orb of True Knowledge (wiki.gg)", "https://noita.wiki.gg/wiki/Orb_of_True_Knowledge"],
			["Cement (Spell) (wiki.gg)", "https://noita.wiki.gg/wiki/Cement_(Spell)"],
		]),
	}),
];
