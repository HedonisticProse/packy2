import { writable } from 'svelte/store';

const STORAGE_KEY = 'packy-theme';
const DEFAULT = 'packy-blue';
const VALID = ['packy-blue', 'mrs-packy'];

function createThemeStore() {
	const initial =
		(typeof localStorage !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null) ?? DEFAULT;

	const { subscribe, set } = writable(VALID.includes(initial) ? initial : DEFAULT);

	return {
		subscribe,
		set(value) {
			if (!VALID.includes(value)) return;
			if (typeof localStorage !== 'undefined') localStorage.setItem(STORAGE_KEY, value);
			if (typeof document !== 'undefined')
				document.documentElement.setAttribute('data-theme', value);
			set(value);
		},
		init(value) {
			if (typeof document !== 'undefined')
				document.documentElement.setAttribute('data-theme', value);
		}
	};
}

export const themeStore = createThemeStore();
