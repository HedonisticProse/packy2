// @ts-nocheck
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

// Update trip fields and recompute duration
export async function updateTrip(fields) {
	await updateAndSave((trip) => {
		const updated = { ...trip, ...fields };
		const dep = updated.date_departure;
		const ret = updated.date_return;
		if (dep && ret) {
			updated.int_duration =
				Math.ceil((new Date(ret) - new Date(dep)) / (1000 * 60 * 60 * 24)) + 1;
		}
		return updated;
	});
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
			int_order: trip.arr_categories.length,
			int_bag_id: null
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

// Rename category
export async function renameCategory(/** @type {number} */ categoryId, /** @type {string} */ newName) {
	await updateAndSave((trip) => ({
		...trip,
		arr_categories: trip.arr_categories.map((/** @type {any} */ cat) =>
			cat.int_id === categoryId ? { ...cat, str_name: newName } : cat
		)
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

// Assign (or unassign) a category to a bag
export async function assignCategoryToBag(categoryId, bagId) {
	await updateAndSave((trip) => ({
		...trip,
		arr_categories: trip.arr_categories.map((cat) =>
			cat.int_id === categoryId ? { ...cat, int_bag_id: bagId } : cat
		)
	}));
}

// Add bag
export async function addBag(bagName) {
	if (!bagName) return;
	await updateAndSave((trip) => {
		const newBag = {
			int_id: Date.now(),
			str_name: bagName,
			int_order: trip.arr_bags.length
		};
		return { ...trip, arr_bags: [...trip.arr_bags, newBag] };
	});
}

// Rename bag
export async function renameBag(bagId, newName) {
	await updateAndSave((trip) => ({
		...trip,
		arr_bags: trip.arr_bags.map((bag) =>
			bag.int_id === bagId ? { ...bag, str_name: newName } : bag
		)
	}));
}

// Delete bag (nulls out int_bag_id on any categories or items referencing it)
export async function deleteBag(bagId) {
	await updateAndSave((trip) => ({
		...trip,
		arr_bags: trip.arr_bags.filter((bag) => bag.int_id !== bagId),
		arr_categories: trip.arr_categories.map((cat) =>
			cat.int_bag_id === bagId ? { ...cat, int_bag_id: null } : cat
		),
		arr_items: trip.arr_items.map((item) =>
			item.int_bag_id === bagId ? { ...item, int_bag_id: null } : item
		)
	}));
}
