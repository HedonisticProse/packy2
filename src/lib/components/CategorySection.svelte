<script>
	import ItemList from './ItemList.svelte';
	import { addItem, renameCategory, deleteCategory, assignCategoryToBag } from '$lib/store.js';

	export let category;
	export let items; // All items from parent
	export let bags; // All bags from parent

	// Filter items for this category
	$: categoryItems = items.filter((item) => item.int_category_id === category.int_id);

	let newItemName = '';
	let isRenaming = false;
	let draftName = '';

	function startRename() {
		draftName = category.str_name;
		isRenaming = true;
	}

	async function handleRename() {
		if (!draftName.trim()) return;
		await renameCategory(category.int_id, draftName.trim());
		isRenaming = false;
	}

	function cancelRename() {
		isRenaming = false;
	}

	async function handleDelete() {
		await deleteCategory(category.int_id);
	}

	async function handleAddItem() {
		if (!newItemName) return;
		await addItem(category.int_id, newItemName);
		newItemName = '';
	}
</script>

<div class="category">
	<div class="category-header">
		{#if isRenaming}
			<input
				class="rename-input"
				type="text"
				bind:value={draftName}
				on:keydown={(e) => e.key === 'Enter' && handleRename()}
				on:keydown={(e) => e.key === 'Escape' && cancelRename()}
			/>
			<button on:click={handleRename}>Save</button>
			<button on:click={cancelRename}>Cancel</button>
		{:else}
			<h3>{category.str_name}</h3>
			{#if bags && bags.length > 0}
				<select
					value={category.int_bag_id ?? ''}
					on:change={(e) => assignCategoryToBag(category.int_id, e.target.value ? Number(e.target.value) : null)}
				>
					<option value="">No bag</option>
					{#each bags as bag (bag.int_id)}
						<option value={bag.int_id}>{bag.str_name}</option>
					{/each}
				</select>
			{/if}
			<button on:click={startRename}>Rename</button>
			<button class="delete-btn" on:click={handleDelete}>Delete</button>
		{/if}
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

<style>
	.category {
		margin-bottom: 2rem;
		padding: 1rem;
		border: 1px solid #ddd;
		border-radius: 4px;
	}

	.category-header {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		margin-bottom: 1rem;
	}

	.category-header h3 {
		margin: 0;
		flex: 1;
	}

	.rename-input {
		flex: 1;
		padding: 0.25rem 0.5rem;
		font-size: 1rem;
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

	.delete-btn {
		margin-left: auto;
	}
</style>
