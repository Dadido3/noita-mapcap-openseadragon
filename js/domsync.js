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

// Collection of simple helpers for doing data binding between DOM and JS objects.

/**
 * DomSyncList helps to update the children of some DOM node with the content of srcList.
 * This is done by intelligently inserting, removing, rearranging or updating DOM nodes inside dstContainer.
 * @template A
 * @param {A[]} srcList A list of some object.
 * @param {HTMLElement} dstContainer The destination DOM node which's content should be updated.
 * @param {string} tagName The tag name of all child nodes.
 * @param {function (A): any} keyFunc A function that returns a unique key for every srcList entry.
 * @param {function (A, HTMLElement): void} updateFunc A function that updates a DOM element for some srcList entry.
 */
function DomSyncList(srcList, dstContainer, tagName, keyFunc, updateFunc) {
	const keyProperty = "domSyncKey";

	// Stupid linear search.
	// Should be good enough for the number of elements we will use on this.
	for (const [i, srcEntry] of srcList.entries()) {
		const key = keyFunc(srcEntry);
		const dstElement = dstContainer.children[i];
		if (dstElement instanceof HTMLElement && /** @type {HTMLElement & {[keyProperty]: any}}} */(dstElement)[keyProperty] === key) {
			// The element keys are the same, we just have to update it.
			updateFunc(srcEntry, dstElement);
		} else {
			// The element keys are not the same, or it's a completely different type altogether.
			// We have to try to find the key in dst.
			let found = false;
			for (const dstElement2 of dstContainer.children) {
				if (dstElement instanceof HTMLElement && /** @type {HTMLElement & {[keyProperty]: any}}} */(dstElement2)[keyProperty] === key) {
					// We have found it, so we just have to rearrange and update it.
					dstElement.before(dstElement2);
					updateFunc(srcEntry, dstElement);
					found = true;
					break;
				}
			}
			if (!found) {
				// We have not found a pair with the same keys, so create and insert it manually.
				const newElement = document.createElement(tagName);
				/** @type {HTMLElement & {[keyProperty]: any}}} */(newElement)[keyProperty] = keyFunc(srcEntry);
				if (dstElement === undefined) {
					dstContainer.append(newElement);
				} else {
					dstElement.before(newElement);
				}
				updateFunc(srcEntry, newElement);
			}
		}
	}

	// As last step we need to remove any additional elements in dst.
	while (srcList.length < dstContainer.children.length) {
		if (!dstContainer.lastElementChild) {
			return;
		}
		dstContainer.lastElementChild.remove();
	}
}