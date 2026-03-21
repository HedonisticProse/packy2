import { writable } from 'svelte/store';
import { browser } from '$app/environment';
import { getTrip, saveTrip, clearTrip } from './storage.js';

const initial = browser ? getTrip() : null;

export const tripStore = writable(initial);

export function createTrip(name, departureDate, returnDate, calculatedDays) {
	const newTrip = {
		name,
		departureDate,
		returnDate,
		calculatedDays,
		categories: []
	};

	tripStore.set(newTrip);
	saveTrip(newTrip);
}

export function clearTripState() {
	tripStore.set(null);
	clearTrip();
}

export function addCategory(categoryName) {
	if (!categoryName) return;

	tripStore.update((trip) => {
		if (!trip) return trip;

		const category = {
			id: Date.now().toString(),
			name: categoryName,
			items: []
		};

		const updated = {
			...trip,
			categories: [...trip.categories, category]
		};

		saveTrip(updated);
		return updated;
	});
}

export function addItem(categoryId, itemName) {
	if (!itemName) return;

	tripStore.update((trip) => {
		if (!trip) return trip;

		const updated = {
			...trip,
			categories: trip.categories.map((cat) => {
				if (cat.id === categoryId) {
					return {
						...cat,
						items: [
							...cat.items,
							{
								id: Date.now().toString(),
								name: itemName,
								packed: false
							}
						]
					};
				}
				return cat;
			})
		};

		saveTrip(updated);
		return updated;
	});
}

export function toggleItem(categoryId, itemId) {
	tripStore.update((trip) => {
		if (!trip) return trip;

		const updated = {
			...trip,
			categories: trip.categories.map((cat) => {
				if (cat.id === categoryId) {
					return {
						...cat,
						items: cat.items.map((item) =>
							item.id === itemId ? { ...item, packed: !item.packed } : item
						)
					};
				}
				return cat;
			})
		};

		saveTrip(updated);
		return updated;
	});
}

export function deleteItem(categoryId, itemId) {
	tripStore.update((trip) => {
		if (!trip) return trip;

		const updated = {
			...trip,
			categories: trip.categories.map((cat) => {
				if (cat.id === categoryId) {
					return {
						...cat,
						items: cat.items.filter((item) => item.id !== itemId)
					};
				}
				return cat;
			})
		};

		saveTrip(updated);
		return updated;
	});
}
