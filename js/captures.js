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
 * @property {Overlay_Object_Group[]} overlayGroups List of overlay groups to show.
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
const noitaCaptures = [
	{
		uniqueID: "b3f7cf7f-cdf6-448b-8772-3ce4dc28f238",
		name: "Example capture",
		buildString: "Build Feb  6 2024 15:58:22",
		builtAt: new Date('2024-02-06T15:58:22+02:00'),
		platform: "Steam",
		branch: "noitabeta",
		executable: "noita.exe",
		gameMode: "Normal",
		seed: 786433191,
		ngPlusLevel: 1,
		createdAt: new Date('2024-02-08T19:02:16+01:00'),
		createdBy: "D3",
		tileSource: "captures/example.dzi",
		overlayGroups: ["All"],
	},
	{
		uniqueID: "dfa609d2-3440-4024-84c6-99430a149c94",
		name: "Play capture 2022-08-14",
		buildString: null,
		builtAt: null,
		platform: "Steam",
		branch: "noitabeta",
		executable: "noita.exe",
		gameMode: "Normal",
		seed: 123,
		ngPlusLevel: 1,
		createdAt: new Date('2022-08-14T00:00:00'),
		createdBy: "D3",
		tileSource: "captures/play-2022-08-14.dzi",
		overlayGroups: [],
	},
	{
		uniqueID: "f702768a-5fe0-48e1-828a-b531d9efdb12",
		name: "2024-02-06 15:58:22 NG 78633191",
		buildString: "Build Feb  6 2024 15:58:22",
		builtAt: new Date('2024-02-06T15:58:22+02:00'),
		platform: "Steam",
		branch: "noitabeta",
		executable: "noita.exe",
		gameMode: "Normal",
		seed: 78633191,
		ngPlusLevel: 1,
		createdAt: new Date('2024-02-08T15:27:30+01:00'),
		createdBy: "D3",
		tileSource: "captures/2024-02-06-15-58-22-noita-normal-78633191.dzi",
		overlayGroups: ["All"],
	},
	{
		uniqueID: "6a0661b1-96bc-4a8d-94c2-b43d1f1c4cd9",
		name: "2024-02-06 15:58:22 NG 786433191",
		buildString: "Build Feb  6 2024 15:58:22",
		builtAt: new Date('2024-02-06T15:58:22+02:00'),
		platform: "Steam",
		branch: "noitabeta",
		executable: "noita.exe",
		gameMode: "Normal",
		seed: 786433191,
		ngPlusLevel: 1,
		createdAt: new Date('2024-02-08T19:02:16+01:00'),
		createdBy: "D3",
		tileSource: "captures/2024-02-06-15-58-22-noita-normal-786433191.dzi",
		overlayGroups: ["All"],
	},
	{
		uniqueID: "c9815905-6bb7-49e0-856e-4cf3d126bd92",
		name: "2024-02-14 07:46:57 NG 786433191",
		buildString: "Build Feb 14 2024 07:46:57",
		builtAt: new Date('2024-02-14T07:46:57+02:00'),
		platform: "Steam",
		branch: "main",
		executable: "noita.exe",
		gameMode: "Normal",
		seed: 786433191,
		ngPlusLevel: 1,
		createdAt: new Date('2024-02-20T12:39:52+01:00'),
		createdBy: "D3",
		tileSource: "captures/2024-02-14-07-46-57-noita-normal-786433191.dzi",
		overlayGroups: ["All"],
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
		overlayGroups: ["All"],
	},
	{
		uniqueID: "ce67204f-7f9e-44c9-a64e-cb791e41672f",
		name: "2024-03-25 17:42:49 NG 110638",
		buildString: "Build Mar 25 2024 17:42:49",
		builtAt: new Date('2024-03-25T17:42:49+02:00'),
		platform: "Steam",
		branch: "noitabeta",
		executable: "noita.exe",
		gameMode: "Normal",
		seed: 110638,
		ngPlusLevel: 1,
		createdAt: new Date('2024-03-25T23:06:00+01:00'),
		createdBy: "D3",
		tileSource: "captures/2024-03-25-17-42-49-noita-ng-110638.dzi",
		overlayGroups: ["All"],
	},
];

const overlayImages = [
	{ url: "captures/biome_map.png", opacity: 0.2, xOffset: -17920, yOffset: -7168, width: 17920 + 17920 },
];
