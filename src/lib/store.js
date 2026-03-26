/**
 * Store layer - centralized state management
 * Works with normalized data model (flat arrays with ID references)
 */

import { writable } from 'svelte/store';
import { browser } from '$app/environment';
import {
	createTrip as createTripDB,
	saveTrip as saveTripDB,
	getTrip,
	clearTrip
} from './storage.js';

// Initialize empty - will be loaded async
export const tripStore = writable(null);
export const isStoreReady = writable(false);

// Async initialization function
export async function initializeTripStore() {
	if (!browser) return null;

	const trip = await getTrip();
	tripStore.set(trip);
	isStoreReady.set(true);
	return trip;
}

// Create new trip
export async function createTrip(name, departureDate, returnDate, duration) {
	const newTrip = await createTripDB({
		str_name: name,
		date_departure: departureDate,
		date_return: returnDate,
		int_duration: duration,
		arr_bags: [],
		arr_categories: [],
		arr_items: [],
		arr_tasks: []
	});

	tripStore.set(newTrip);
	return newTrip;
}

// Clear trip
export async function clearTripState() {
	await clearTrip();
	tripStore.set(null);
}

// Helper for async mutations
async function updateAndSave(updater) {
	let updated;

	tripStore.update((trip) => {
		if (!trip) return trip;
		updated = updater(trip);
		return updated;
	});

	if (updated) {
		await saveTripDB(updated);
	}

	return updated;
}

// Add category
export async function addCategory(categoryName) {
	if (!categoryName) return;

	await updateAndSave((trip) => {
		const newCategory = {
			int_id: Date.now(),
			str_name: categoryName,
			int_order: trip.arr_categories.length
		};

		return {
			...trip,
			arr_categories: [...trip.arr_categories, newCategory]
		};
	});
}

// Add item to category
export async function addItem(categoryId, itemName) {
	if (!itemName) return;

	await updateAndSave((trip) => {
		const newItem = {
			int_id: Date.now(), // Item's ID, currently just date now.
			str_name: itemName, // Item's name
			bool_packed: false, // Used by all items
			bool_validated: false, // Valides correct quantity
			int_category_id: categoryId, // Foreign key to category
			int_bag_id: null, // The Bag's ID where the item currently lives
			int_order: trip.arr_items.length, // Where does it sit in the order?
			bool_critical: false // Is this item critical?
		};

		return {
			...trip,
			arr_items: [...trip.arr_items, newItem]
		};
	});
}

// Toggle item packed status
export async function toggleItem(categoryId, itemId) {
	await updateAndSave((trip) => ({
		...trip,
		arr_items: trip.arr_items.map((item) =>
			item.int_id === itemId ? { ...item, bool_packed: !item.bool_packed } : item
		)
	}));
}

// Update item fields (partial — only provided fields are overwritten)
export async function updateItem(/** @type {number} */ itemId, /** @type {object} */ updatedFields) {
	await updateAndSave((trip) => ({
		...trip,
		arr_items: trip.arr_items.map((item) =>
			item.int_id === itemId ? { ...item, ...updatedFields } : item
		)
	}));
}

// Delete item
export async function deleteItem(categoryId, itemId) {
	await updateAndSave((trip) => ({
		...trip,
		arr_items: trip.arr_items.filter((item) => item.int_id !== itemId)
	}));
}

// Delete category (and all its items)
export async function deleteCategory(categoryId) {
	await updateAndSave((trip) => ({
		...trip,
		arr_categories: trip.arr_categories.filter((cat) => cat.int_id !== categoryId),
		arr_items: trip.arr_items.filter((item) => item.int_category_id !== categoryId)
	}));
}
