<script lang="ts">
	import '../app.css';
	import { onMount } from 'svelte';
	import { themeStore } from '$lib/theme.js';
	import favicon from '$lib/assets/favicon.svg';

	let { children } = $props();
	let currentTheme = $state('packy-blue');

	const unsubscribe = themeStore.subscribe((v) => (currentTheme = v));

	onMount(() => {
		themeStore.init(currentTheme);
		return unsubscribe;
	});

	function toggleTheme() {
		themeStore.set(currentTheme === 'packy-blue' ? 'mrs-packy' : 'packy-blue');
	}
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<header class="app-header">
	<span class="app-title">Packy2</span>
	<button class="theme-toggle" onclick={toggleTheme}>
		{currentTheme === 'packy-blue' ? '🩵 Packy Blue' : '💜 Mrs. Packy'}
	</button>
</header>

<main class="app-main">
	<div class="app-body">
		{@render children()}
	</div>
</main>

<footer class="app-footer">
	Packy2 &middot; Pre-release &mdash; not for production use
</footer>

<style>
	.app-header {
		position: sticky;
		top: 0;
		z-index: 500;
		background: var(--color-header-bg);
		color: var(--color-header-text);
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0.75rem 1rem;
	}

	.app-title {
		font-size: 1.2rem;
		font-weight: 700;
		letter-spacing: 0.02em;
	}

	.theme-toggle {
		background: transparent;
		border: 1px solid rgba(255, 255, 255, 0.4);
		color: var(--color-header-text);
		border-radius: 4px;
		padding: 0.25rem 0.6rem;
		cursor: pointer;
		font-size: 0.8rem;
	}

	.theme-toggle:hover {
		background: rgba(255, 255, 255, 0.15);
	}

	.app-main {
		min-height: calc(100dvh - 120px);
		padding: 1rem;
	}

	.app-body {
		max-width: 640px;
		margin: 0 auto;
		background: var(--color-surface-semi);
		border-radius: 8px;
		padding: 1rem;
	}

	.app-footer {
		text-align: center;
		padding: 1rem;
		font-size: 0.75rem;
		color: var(--color-text-muted);
		border-top: 1px solid var(--color-border);
	}
</style>
