<script>
	import ItemList from './ItemList.svelte';
	import CategoryEditModal from './CategoryEditModal.svelte';
	import { addItem } from '$lib/store.js';

	export let category;
	export let items; // All items from parent
	export let bags; // All bags from parent

	// Filter items for this category
	$: categoryItems = items.filter((item) => item.int_category_id === category.int_id);

	let newItemName = '';
	let editOpen = false;

	async function handleAddItem() {
		if (!newItemName) return;
		await addItem(category.int_id, newItemName);
		newItemName = '';
	}
</script>

<div class="category">
	<div class="category-header">
		<button class="category-name" on:click={() => (editOpen = true)}>{category.str_name}</button>
	</div>

	<div class="add-item">
		<input
			type="text"
			bind:value={newItemName}
			placeholder="Add item to {category.str_name}"
			on:keydown={(e) => e.key === 'Enter' && handleAddItem()}
		/>
		<button on:click={handleAddItem}>Add Item</button>
	</div>

	<ItemList items={categoryItems} categoryId={category.int_id} categoryBagId={category.int_bag_id} {bags} />
</div>

{#if editOpen}
	<CategoryEditModal {category} {bags} onClose={() => (editOpen = false)} />
{/if}

<style>
	.category {
		margin-bottom: 2rem;
		padding: 1rem;
		border: 1px solid var(--color-border);
		border-radius: 4px;
	}

	.category-header {
		margin-bottom: 1rem;
	}

	.category-name {
		font-size: 1rem;
		font-weight: 600;
		background: none;
		border: none;
		padding: 0;
		font: inherit;
		font-weight: 600;
		cursor: pointer;
		color: var(--color-text);
	}

	.category-name:hover {
		color: var(--color-primary-dark);
	}

	.add-item {
		display: flex;
		gap: 0.5rem;
		margin-bottom: 1rem;
	}

	.add-item input {
		flex: 1;
		padding: 0.5rem;
	}

	button {
		padding: 0.4rem 0.9rem;
		cursor: pointer;
		border: 1px solid var(--color-border);
		background: var(--color-btn-bg);
		border-radius: 4px;
		font-size: 0.875rem;
	}

	button:hover {
		background: var(--color-btn-hover);
	}

	@media (max-width: 480px) {
		.category {
			padding: 0.5rem;
		}
	}
</style>
