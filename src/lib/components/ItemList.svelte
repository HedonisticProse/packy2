<script>
	// @ts-nocheck
	import { toggleItem, updateItem, deleteItem } from '$lib/store.js';
	import ItemEditModal from './ItemEditModal.svelte';
	import CriticalConfirmModal from './CriticalConfirmModal.svelte';

	export let items;
	export let categoryId;
	export let categoryBagId;
	export let bags;

	let editingItem = null;
	let confirmingItem = null;

	function handleCheck(item) {
		if (item.bool_critical && !item.bool_packed) {
			confirmingItem = item;
		} else {
			toggleItem(categoryId, item.int_id);
		}
	}

	$: effectiveBagName = (() => {
		if (!confirmingItem) return '';
		const bagId = confirmingItem.int_bag_id ?? categoryBagId;
		if (!bagId) return 'no bag';
		const bag = bags?.find((b) => b.int_id === bagId);
		return bag ? bag.str_name : 'no bag';
	})();

	async function handleConfirmed() {
		await updateItem(confirmingItem.int_id, { bool_packed: true, bool_validated: true });
		confirmingItem = null;
	}
</script>

{#if items && items.length > 0}
	<ul class="items-list">
		{#each items as item (item.int_id)}
			<li class:packed={item.bool_packed}>
				<input
					type="checkbox"
					checked={item.bool_packed}
					on:click={(e) => {
						if (item.bool_critical && !item.bool_packed) {
							e.preventDefault();
							confirmingItem = item;
						} else {
							toggleItem(categoryId, item.int_id);
						}
					}}
				/>
				<button class="item-name" on:click={() => (editingItem = item)}>
					{#if item.bool_critical}<span class="critical-badge">!</span>{/if}{item.str_name}&nbsp;<span class="qty">×{item.int_quantity ?? 1}</span>
				</button>
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
	<ItemEditModal item={editingItem} onClose={() => (editingItem = null)} {bags} />
{/if}

{#if confirmingItem}
	<CriticalConfirmModal
		item={confirmingItem}
		{effectiveBagName}
		onConfirm={handleConfirmed}
		onClose={() => (confirmingItem = null)}
	/>
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

	.critical-badge {
		color: #c00;
		font-weight: bold;
		font-size: 0.85em;
		margin-right: 0.2em;
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

	.qty {
		font-size: 0.8em;
		color: #888;
		font-style: italic;
	}
</style>
