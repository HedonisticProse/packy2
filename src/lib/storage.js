/**
 * Storage layer using IndexedDB
 * Stores trips with normalized data model (flat arrays)
 *
 * IMPORTANT:
 * Do not use IndexedDB outside this file.
 * All functions are async and must be awaited.
 */

import { browser } from '$app/environment';

const DB_NAME = 'packy-db';
const DB_VERSION = 1;

let dbInstance = null;

// Internal: Get database connection
async function getDB() {
	if (!browser) {
		throw new Error('IndexedDB is not available in SSR context');
	}

	if (dbInstance) return dbInstance;

	return new Promise((resolve, reject) => {
		const request = indexedDB.open(DB_NAME, DB_VERSION);

		request.onerror = () => reject(request.error);
		request.onsuccess = () => {
			dbInstance = request.result;
			resolve(dbInstance);
		};

		request.onupgradeneeded = (event) => {
			const db = event.target.result;

			// Create trips object store
			if (!db.objectStoreNames.contains('trips')) {
				db.createObjectStore('trips', { keyPath: 'int_id' });
			}

			// Create metadata object store for app state
			if (!db.objectStoreNames.contains('metadata')) {
				db.createObjectStore('metadata', { keyPath: 'key' });
			}
		};
	});
}

// Create new trip and set as current
export async function createTrip(trip) {
	if (!browser) return null;

	const tripWithMetadata = {
		...trip,
		int_id: Date.now(),
		createdAt: Date.now(),
		updatedAt: Date.now()
	};

	const db = await getDB();

	return new Promise((resolve, reject) => {
		const transaction = db.transaction(['trips', 'metadata'], 'readwrite');
		const tripsStore = transaction.objectStore('trips');
		const metadataStore = transaction.objectStore('metadata');

		tripsStore.add(tripWithMetadata);
		metadataStore.put({ key: 'currentTripId', value: tripWithMetadata.int_id });

		transaction.oncomplete = () => resolve(tripWithMetadata);
		transaction.onerror = () => reject(transaction.error);
	});
}

// Get current trip
export async function getTrip() {
	if (!browser) return null;

	const db = await getDB();

	return new Promise((resolve, reject) => {
		const transaction = db.transaction(['metadata', 'trips'], 'readonly');
		const metadataStore = transaction.objectStore('metadata');
		const tripsStore = transaction.objectStore('trips');

		const metadataRequest = metadataStore.get('currentTripId');

		metadataRequest.onsuccess = () => {
			const currentTripId = metadataRequest.result?.value;

			if (!currentTripId) {
				resolve(null);
				return;
			}

			const tripRequest = tripsStore.get(currentTripId);
			tripRequest.onsuccess = () => resolve(tripRequest.result || null);
			tripRequest.onerror = () => reject(tripRequest.error);
		};

		metadataRequest.onerror = () => reject(metadataRequest.error);
	});
}

// Save/update trip
export async function saveTrip(trip) {
	if (!browser) return null;

	const updatedTrip = {
		...trip,
		updatedAt: Date.now()
	};

	const db = await getDB();

	return new Promise((resolve, reject) => {
		const transaction = db.transaction(['trips'], 'readwrite');
		const store = transaction.objectStore('trips');
		store.put(updatedTrip);

		transaction.oncomplete = () => resolve(updatedTrip);
		transaction.onerror = () => reject(transaction.error);
	});
}

// Clear current trip
export async function clearTrip() {
	if (!browser) return;

	const currentTrip = await getTrip();

	if (!currentTrip) return;

	const db = await getDB();

	return new Promise((resolve, reject) => {
		const transaction = db.transaction(['trips', 'metadata'], 'readwrite');
		const tripsStore = transaction.objectStore('trips');
		const metadataStore = transaction.objectStore('metadata');

		tripsStore.delete(currentTrip.int_id);
		metadataStore.delete('currentTripId');

		transaction.oncomplete = () => resolve();
		transaction.onerror = () => reject(transaction.error);
	});
}

// Get all trips (future multi-trip support)
export async function getAllTrips() {
	if (!browser) return [];

	const db = await getDB();

	return new Promise((resolve, reject) => {
		const transaction = db.transaction(['trips'], 'readonly');
		const store = transaction.objectStore('trips');
		const request = store.getAll();

		request.onsuccess = () => resolve(request.result || []);
		request.onerror = () => reject(request.error);
	});
}

// Set a trip as the active trip by ID; returns the trip object
export async function setActiveTrip(tripId) {
	if (!browser) return null;

	const db = await getDB();

	return new Promise((resolve, reject) => {
		const tx = db.transaction(['metadata', 'trips'], 'readwrite');
		tx.objectStore('metadata').put({ key: 'currentTripId', value: tripId });
		const req = tx.objectStore('trips').get(tripId);
		tx.oncomplete = () => resolve(req.result || null);
		tx.onerror = () => reject(tx.error);
	});
}

// Clear currentTripId without deleting the trip data (deactivate without destroying)
export async function deactivateTrip() {
	if (!browser) return;

	const db = await getDB();

	return new Promise((resolve, reject) => {
		const tx = db.transaction(['metadata'], 'readwrite');
		tx.objectStore('metadata').delete('currentTripId');
		tx.oncomplete = () => resolve();
		tx.onerror = () => reject(tx.error);
	});
}

// Delete any trip by ID; also clears currentTripId if it matches
export async function deleteTripById(tripId) {
	if (!browser) return;

	const db = await getDB();

	return new Promise((resolve, reject) => {
		const tx = db.transaction(['trips', 'metadata'], 'readwrite');
		tx.objectStore('trips').delete(tripId);
		const req = tx.objectStore('metadata').get('currentTripId');
		req.onsuccess = () => {
			if (req.result?.value === tripId) {
				tx.objectStore('metadata').delete('currentTripId');
			}
		};
		tx.oncomplete = () => resolve();
		tx.onerror = () => reject(tx.error);
	});
}
