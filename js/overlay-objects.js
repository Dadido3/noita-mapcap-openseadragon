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
 * Table of available overlay objects.
 * 
 * @type {Overlay_Object[]}
 */
const noitaOverlayObjects = [
	{
		uniqueID: "6d238b75-6045-440a-a688-205ce0aeb4d8",
		name: "Test",
		overlayGroups: ["All"],
		createdAt: new Date('2024-03-27T15:54:19.000+01:00'),
		updatedAt: new Date('2024-03-27T15:54:19.000+01:00'),
		authoredBy: ["D3"],
		location: new OpenSeadragon.Rect(1 * 512, -3 * 512, 512, 512),
		placement: undefined,
		viewportElement: NewViewportElementBox("TestA"),//[`<a href="test">Link</a><span>The Work asd (Sky)</span>`],
		modalHTML: [`<div>test</div>`],
	},
	{
		uniqueID: "1130ac20-fad8-4595-9dbb-db32fef7ceec",
		name: "Test2",
		overlayGroups: ["All"],
		createdAt: new Date('2024-03-28T13:30:02.000+01:00'),
		updatedAt: new Date('2024-03-28T13:30:02.000+01:00'),
		authoredBy: ["D3"],
		location: new OpenSeadragon.Rect(2 * 512, -3 * 512, 512, 512),
		placement: undefined,
		viewportElement: NewViewportElementBox("TestB"),
		modalHTML: [`<div>test</div>`],
	},
	{
		uniqueID: "e4b7dc0d-a60b-4e42-96b2-25f024edc1ea",
		name: "Orb: Sea of Lava",
		overlayGroups: ["All"],
		createdAt: new Date('2024-03-28T22:09:24.000+01:00'),
		updatedAt: new Date('2024-03-28T22:09:24.000+01:00'),
		authoredBy: ["D3"],
		location: new OpenSeadragon.Point(780, -1073),
		placement: OpenSeadragon.Placement.BOTTOM,
		viewportElement: NewViewportElementSymbol("Orb: Sea of Lava", "img/orbs/sea-of-lava.webp"),
		modalHTML: [
			`<div>Orb: Sea of Lava</div>`,
			`<p>test</p>`,
			`<div><a href="https://noita.wiki.gg/wiki/Orb_of_True_Knowledge" target="_blank">wiki.gg: Orb of True Knowledge</a></div>`,
			`<div><a href="https://noita.wiki.gg/wiki/Sea_of" target="_blank">wiki.gg: Sea of ...</a></div>`,
		],
	},
];

/**
 * @param {string?} tooltip 
 * @returns {HTMLElement}
 */
function NewViewportElementBox(tooltip) {
	const element = document.createElement("div");
	element.className = "overlay-box";
	if (tooltip) {
		const tooltipElement = document.createElement("span")
		element.appendChild(tooltipElement);
		tooltipElement.classList.add("tooltip", "overlay-tooltip", "noita-decoration-9piece0");
		tooltipElement.textContent = tooltip;
	}

	return element;
}

/**
 * @param {string?} tooltip 
 * @param {string} imagePath 
 * @returns {HTMLElement}
 */
function NewViewportElementSymbol(tooltip, imagePath) {
	const element = document.createElement("div");
	element.className = "overlay-symbol";

	if (tooltip) {
		const tooltipElement = document.createElement("span")
		element.appendChild(tooltipElement);
		tooltipElement.classList.add("tooltip", "overlay-tooltip", "noita-decoration-9piece0");
		tooltipElement.textContent = tooltip;
	}

	const image = document.createElement("img");
	image.src = imagePath;
	element.appendChild(image);

	return element;
}