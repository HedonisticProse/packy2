// STORAGE LAYER
// This file abstracts all data persistence.
// Currently uses localStorage.
// Designed to be replaced with IndexedDB later.
//
// IMPORTANT:
// Do not use localStorage outside this file.

const KEY = 'packy-trip';

export function getTrip() {
	const stored = localStorage.getItem(KEY);
	return stored ? JSON.parse(stored) : null;
}

export function saveTrip(trip) {
	localStorage.setItem(KEY, JSON.stringify(trip));
}

export function clearTrip() {
	localStorage.removeItem(KEY);
}
