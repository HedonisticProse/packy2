<script>
	import BagEditModal from './BagEditModal.svelte';

	export let bag;

	let editOpen = false;
</script>

<div class="bag">
	<div class="bag-header">
		<button class="bag-name" on:click={() => (editOpen = true)}>{bag.str_name}</button>
	</div>
</div>

{#if editOpen}
	<BagEditModal {bag} onClose={() => (editOpen = false)} />
{/if}

<style>
	.bag {
		margin-bottom: 0.5rem;
	}

	.bag-header {
		display: flex;
		align-items: center;
	}

	.bag-name {
		flex: 1;
		text-align: left;
		font-weight: 500;
		background: none;
		border: none;
		padding: 0.4rem 0.25rem;
		font: inherit;
		cursor: pointer;
		color: var(--color-text);
		border-bottom: 1px solid var(--color-border-light);
	}

	.bag-name:hover {
		color: var(--color-primary-dark);
	}
</style>
