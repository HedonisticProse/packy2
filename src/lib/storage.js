const STORAGE_KEY = 'packy-trip';

export function getTrip() {
	const stored = localStorage.getItem(STORAGE_KEY);
	return stored ? JSON.parse(stored) : null;
}

export function saveTrip(trip) {
	localStorage.setItem(STORAGE_KEY, JSON.stringify(trip));
}

export function clearTrip() {
	localStorage.removeItem(STORAGE_KEY);
}
