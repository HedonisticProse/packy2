<script>
	// @ts-nocheck
	import { flip } from 'svelte/animate';
	import { dndzone } from 'svelte-dnd-action';
	import { toggleItem, updateItem, deleteItem, reorderItems } from '$lib/store.js';
	import ItemEditModal from './ItemEditModal.svelte';
	import CriticalConfirmModal from './CriticalConfirmModal.svelte';

	export let items;
	export let categoryId;
	export let categoryBagId;
	export let bags;

	let editingItem = null;
	let confirmingItem = null;

	// Local sorted+mapped array for dndzone (requires `id` field)
	$: localItems = [...items]
		.sort((a, b) => a.int_order - b.int_order)
		.map((i) => ({ ...i, id: i.int_id }));

	function handleDndConsider(e) {
		localItems = e.detail.items;
	}

	function handleDndFinalize(e) {
		localItems = e.detail.items;
		reorderItems(categoryId, localItems.map((i) => i.int_id));
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
	<ul
		class="items-list"
		use:dndzone={{ items: localItems, flipDurationMs: 200 }}
		on:consider={handleDndConsider}
		on:finalize={handleDndFinalize}
	>
		{#each localItems as item (item.id)}
			<li class:packed={item.bool_packed} animate:flip={{ duration: 200 }}>
				<span class="drag-handle">⠿</span>
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
					{item.str_name}{#if item.bool_critical}<span class="critical-badge">⭐</span>{/if}&nbsp;<span class="qty">×{item.int_quantity ?? 1}</span>
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
		border-bottom: 1px solid var(--color-border-light);
	}

	.items-list li.packed .item-name {
		text-decoration: line-through;
		color: var(--color-text-faint);
	}

	.critical-badge {
		color: var(--color-danger);
		font-weight: bold;
		font-size: 0.85em;
		margin-left: 0.2em;
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

	.drag-handle {
		color: var(--color-text-faint);
		cursor: grab;
		font-size: 1rem;
		flex-shrink: 0;
	}

	.drag-handle:active {
		cursor: grabbing;
	}

	.empty-items {
		color: var(--color-text-faint);
		font-style: italic;
	}

	.qty {
		font-size: 0.8em;
		color: var(--color-text-faint);
		font-style: italic;
	}
</style>
