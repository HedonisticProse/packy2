<script>
	import { toggleItem, deleteItem } from '$lib/store.js';
	import ItemEditModal from './ItemEditModal.svelte';

	export let items;
	export let categoryId;

	let editingItem = null;
</script>

{#if items && items.length > 0}
	<ul class="items-list">
		{#each items as item (item.int_id)}
			<li class:packed={item.bool_packed}>
				<input
					type="checkbox"
					checked={item.bool_packed}
					on:change={() => toggleItem(categoryId, item.int_id)}
				/>
				<button class="item-name" on:click={() => (editingItem = item)}>{item.str_name}</button>
				<button class="delete-btn" on:click={() => deleteItem(categoryId, item.int_id)}>
					Delete
				</button>
			</li>
		{/each}
	</ul>
{:else}
	<p class="empty-items">No items in this category yet.</p>
{/if}

{#if editingItem}
	<ItemEditModal item={editingItem} onClose={() => (editingItem = null)} />
{/if}

<style>
	.items-list {
		list-style: none;
		padding: 0;
		margin: 0;
	}

	.items-list li {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.5rem;
		border-bottom: 1px solid #eee;
	}

	.items-list li.packed .item-name {
		text-decoration: line-through;
		color: #999;
	}

	.item-name {
		flex: 1;
		text-align: left;
		background: none;
		border: none;
		padding: 0;
		font: inherit;
		cursor: pointer;
		color: inherit;
	}

	.delete-btn {
		padding: 0.25rem 0.5rem;
		font-size: 0.875rem;
	}

	.empty-items {
		color: #999;
		font-style: italic;
	}
</style>
