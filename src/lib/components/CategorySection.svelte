<script>
	import ItemList from './ItemList.svelte';
	import { addItem } from '$lib/store.js';

	export let category;
	export let items; // All items from parent

	// Filter items for this category
	$: categoryItems = items.filter((item) => item.int_category_id === category.int_id);

	let newItemName = '';

	async function handleAddItem() {
		if (!newItemName) return;
		await addItem(category.int_id, newItemName);
		newItemName = '';
	}
</script>

<div class="category">
	<h3>{category.str_name}</h3>

	<div class="add-item">
		<input
			type="text"
			bind:value={newItemName}
			placeholder="Add item to {category.str_name}"
			on:keydown={(e) => e.key === 'Enter' && handleAddItem()}
		/>
		<button on:click={handleAddItem}>Add Item</button>
	</div>

	<ItemList items={categoryItems} categoryId={category.int_id} />
</div>

<style>
	.category {
		margin-bottom: 2rem;
		padding: 1rem;
		border: 1px solid #ddd;
		border-radius: 4px;
	}

	.category h3 {
		margin-top: 0;
		margin-bottom: 1rem;
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
</style>
