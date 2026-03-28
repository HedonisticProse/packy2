// @ts-nocheck
/**
 * Import utilities — reads and loads .packy / .trip / .template files
 */

import { createTrip } from './storage.js';
import { tripStore } from './store.js';

function normalizeItem(item, isTemplate) {
	return {
		int_order: 0,
		int_bag_id: null,
		int_quantity: 1,
		bool_critical: false,
		bool_validated: false,
		bool_packed: false,
		...item,
		...(isTemplate ? { bool_packed: false, bool_validated: false } : {})
	};
}

function normalizeTask(task, isTemplate) {
	return {
		int_order: 0,
		bool_critical: false,
		bool_verified: false,
		bool_done: false,
		...task,
		...(isTemplate ? { bool_verified: false, bool_done: false } : {})
	};
}

function normalizeTrip(tripData, type) {
	const isTemplate = type === 'template';
	return {
		int_duration: 0,
		...tripData,
		arr_bags: tripData.arr_bags ?? [],
		arr_categories: tripData.arr_categories ?? [],
		arr_stages: tripData.arr_stages ?? [],
		arr_items: (tripData.arr_items ?? []).map((item) => normalizeItem(item, isTemplate)),
		arr_tasks: (tripData.arr_tasks ?? []).map((task) => normalizeTask(task, isTemplate))
	};
}

export async function importPackyFile(file) {
	const text = await file.text();
	const data = JSON.parse(text);

	if (!data.trip) {
		throw new Error('Invalid file: missing trip data');
	}

	const type = data.type ?? 'trip';
	const normalized = normalizeTrip(data.trip, type);

	// Strip imported int_id so createTrip assigns a fresh one
	delete normalized.int_id;

	const saved = await createTrip(normalized);
	tripStore.set(saved);
	return saved;
}
