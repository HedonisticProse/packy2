// @ts-nocheck
/**
 * Export utilities — generates and downloads .packy files
 */

function pad2(n) {
	return String(n).padStart(2, '0');
}

function formatDate(dateStr) {
	// YYYY-MM-DD → YYYYMMDD
	return dateStr.replace(/-/g, '');
}

function formatSaveDate(date) {
	return `${date.getFullYear()}${pad2(date.getMonth() + 1)}${pad2(date.getDate())}`;
}

function formatSaveTime(date) {
	return `${pad2(date.getHours())}${pad2(date.getMinutes())}${pad2(date.getSeconds())}`;
}

function sanitizeName(name) {
	return name.replace(/[^a-zA-Z0-9_-]/g, '_');
}

export function generateFilename(trip, type = 'trip') {
	const now = new Date();
	const saveDate = formatSaveDate(now);
	const saveTime = formatSaveTime(now);
	const name = sanitizeName(trip.str_name);
	const dep = formatDate(trip.date_departure);
	const ret = formatDate(trip.date_return);
	return `${saveDate}-${saveTime}_${name}_${dep}-to-${ret}.${type}`;
}

export function buildTripExport(trip, type = 'trip') {
	return { format: 'packy', version: 1, type, trip };
}

export function buildTemplateExport(trip) {
	const clone = {
		...trip,
		arr_items: trip.arr_items.map((item) => ({
			...item,
			bool_packed: false,
			bool_validated: false
		})),
		arr_tasks: trip.arr_tasks.map((task) => ({
			...task,
			bool_verified: false,
			bool_done: false
		}))
	};
	return buildTripExport(clone, 'template');
}

function downloadPackyFile(payload, filename) {
	const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
	const url = URL.createObjectURL(blob);
	const a = document.createElement('a');
	a.href = url;
	a.download = filename;
	a.click();
	URL.revokeObjectURL(url);
}

export function saveTrip(trip) {
	downloadPackyFile(buildTripExport(trip, 'trip'), generateFilename(trip, 'trip'));
}

export function saveTemplate(trip) {
	downloadPackyFile(buildTemplateExport(trip), generateFilename(trip, 'template'));
}
