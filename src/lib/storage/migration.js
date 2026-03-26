/**
 * Migration logic for PLAN_06
 * Handles two migrations:
 * 1. localStorage → IndexedDB
 * 2. Nested data structure → Flat/normalized structure
 */

import { browser } from '$app/environment';
import { saveTrip } from '../storage.js';

const LOCALSTORAGE_KEY = 'packy-trip';
const MIGRATION_FLAG_KEY = 'packy-migration-done';

/**
 * Transform nested data model to flat data model
 */
function transformToFlatModel(oldTrip) {
	const categories = [];
	const items = [];

	let categoryOrder = 0;
	let itemOrder = 0;

	// Extract categories and items from nested structure
	if (oldTrip.categories && Array.isArray(oldTrip.categories)) {
		oldTrip.categories.forEach((category) => {
			// Add category to flat array
			const categoryId = parseInt(category.id) || Date.now() + categoryOrder;
			categories.push({
				int_id: categoryId,
				str_name: category.name,
				int_order: categoryOrder++
			});

			// Extract items from this category
			if (category.items && Array.isArray(category.items)) {
				category.items.forEach((item) => {
					const itemId = parseInt(item.id) || Date.now() + itemOrder;
					items.push({
						int_id: itemId,
						str_name: item.name,
						bool_packed: item.packed || false,
						bool_validated: item.validated || false,
						int_category_id: categoryId, // Foreign key to category
						int_bag_id: null, // Future: bag assignment
						int_order: itemOrder++,
						bool_critical: false // Future feature
					});
				});
			}
		});
	}

	// Return normalized trip object
	return {
		int_id: oldTrip.int_id || Date.now(),
		str_name: oldTrip.name || 'Untitled Trip',
		date_departure: oldTrip.departureDate || null,
		date_return: oldTrip.returnDate || null,
		int_duration: oldTrip.calculatedDays || 0,
		createdAt: oldTrip.createdAt || Date.now(),
		updatedAt: Date.now(),

		// Flat arrays (normalized)
		arr_bags: [],
		arr_categories: categories,
		arr_items: items,
		arr_tasks: []
	};
}

export async function migrateFromLocalStorage() {
	if (!browser) return false;

	// Check if already migrated
	if (localStorage.getItem(MIGRATION_FLAG_KEY) === 'true') {
		return false;
	}

	// Check for localStorage data
	const oldData = localStorage.getItem(LOCALSTORAGE_KEY);
	if (!oldData) {
		localStorage.setItem(MIGRATION_FLAG_KEY, 'true');
		return false;
	}

	try {
		const oldTrip = JSON.parse(oldData);

		// Transform nested structure to flat structure
		const migratedTrip = transformToFlatModel(oldTrip);

		// Save to IndexedDB
		await saveTrip(migratedTrip);

		// Set as current trip in metadata
		const request = indexedDB.open('packy-db', 1);
		await new Promise((resolve) => {
			request.onsuccess = () => {
				const db = request.result;
				const transaction = db.transaction(['metadata'], 'readwrite');
				const metadataStore = transaction.objectStore('metadata');
				metadataStore.put({ key: 'currentTripId', value: migratedTrip.int_id });
				transaction.oncomplete = resolve;
			};
		});

		// Mark migration complete
		localStorage.setItem(MIGRATION_FLAG_KEY, 'true');

		console.log('✅ Migration successful:', migratedTrip.int_id);
		console.log('  - Categories migrated:', migratedTrip.arr_categories.length);
		console.log('  - Items migrated:', migratedTrip.arr_items.length);
		return true;
	} catch (error) {
		console.error('❌ Migration failed:', error);
		return false;
	}
}
