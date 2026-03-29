<script>
	// @ts-nocheck
	import { toggleItem, updateItem } from '$lib/store.js';
	import CriticalConfirmModal from './CriticalConfirmModal.svelte';

	export let items;
	export let categories;
	export let bags;

	let confirmingItem = null;

	$: bagGroups = (() => {
		const catMap = Object.fromEntries(categories.map((c) => [c.int_id, c]));

		const slots = new Map();
		for (const bag of bags) slots.set(bag.int_id, []);
		slots.set(null, []);

		for (const item of items) {
			const cat = catMap[item.int_category_id];
			const bagId = item.int_bag_id ?? cat?.int_bag_id ?? null;
			slots.get(slots.has(bagId) ? bagId : null).push({ ...item, _cat: cat });
		}

		return [...slots.entries()]
			.filter(([, bagItems]) => bagItems.length > 0)
			.map(([bagId, bagItems]) => {
				const bag = bags.find((b) => b.int_id === bagId) ?? null;
				const critical = bagItems.filter((i) => i.bool_critical);
				const normal = bagItems.filter((i) => !i.bool_critical);

				const catGroups = new Map();
				for (const item of normal) {
					const name = item._cat?.str_name ?? 'Uncategorized';
					if (!catGroups.has(name)) catGroups.set(name, []);
					catGroups.get(name).push(item);
				}

				return {
					bag,
					critical,
					categoryGroups: [...catGroups.entries()].map(([name, its]) => ({ name, items: its }))
				};
			});
	})();

	$: effectiveBagName = (() => {
		if (!confirmingItem) return '';
		const cat = categories.find((c) => c.int_id === confirmingItem.int_category_id);
		const bagId = confirmingItem.int_bag_id ?? cat?.int_bag_id ?? null;
		if (!bagId) return 'no bag';
		const bag = bags.find((b) => b.int_id === bagId);
		return bag ? bag.str_name : 'no bag';
	})();

	async function handleConfirmed() {
		await updateItem(confirmingItem.int_id, { bool_packed: true, bool_validated: true });
		confirmingItem = null;
	}
</script>

<div class="packing-view">
	{#if bagGroups.length === 0}
		<p class="empty">No items to pack.</p>
	{:else}
		{#each bagGroups as group}
			<section class="bag-group">
				<h2 class="bag-name">{group.bag ? group.bag.str_name : 'Unassigned'}</h2>

				{#if group.critical.length > 0}
					<div class="section-group critical-section">
						<h3 class="section-label">Critical</h3>
						<ul>
							{#each group.critical as item (item.int_id)}
								<li class:packed={item.bool_packed}>
									<input
										type="checkbox"
										checked={item.bool_packed}
										on:click={(e) => {
											if (item.bool_critical && !item.bool_packed) {
												e.preventDefault();
												confirmingItem = item;
											} else {
												toggleItem(item.int_category_id, item.int_id);
											}
										}}
									/>
									<span class="item-name">{item.str_name}{#if item.bool_critical}<span class="critical-badge">⭐</span>{/if}</span>
									<span class="qty">×{item.int_quantity ?? 1}</span>
								</li>
							{/each}
						</ul>
					</div>
				{/if}

				{#each group.categoryGroups as catGroup}
					<div class="section-group">
						<h3 class="section-label">{catGroup.name}</h3>
						<ul>
							{#each catGroup.items as item (item.int_id)}
								<li class:packed={item.bool_packed}>
									<input
										type="checkbox"
										checked={item.bool_packed}
										on:click={(e) => {
											if (item.bool_critical && !item.bool_packed) {
												e.preventDefault();
												confirmingItem = item;
											} else {
												toggleItem(item.int_category_id, item.int_id);
											}
										}}
									/>
									<span class="item-name">{item.str_name}{#if item.bool_critical}<span class="critical-badge">⭐</span>{/if}</span>
									<span class="qty">×{item.int_quantity ?? 1}</span>
								</li>
							{/each}
						</ul>
					</div>
				{/each}
			</section>
		{/each}
	{/if}
</div>

{#if confirmingItem}
	<CriticalConfirmModal
		item={confirmingItem}
		{effectiveBagName}
		onConfirm={handleConfirmed}
		onClose={() => (confirmingItem = null)}
	/>
{/if}

<style>
	.packing-view {
		margin-top: 1rem;
	}

	.empty {
		color: var(--color-text-faint);
		font-style: italic;
	}

	.critical-badge {
		color: var(--color-danger);
		font-weight: bold;
		font-size: 0.85em;
		margin-left: 0.2em;
	}

	.bag-group {
		margin-bottom: 2rem;
		border: 1px solid var(--color-border);
		border-radius: 4px;
		padding: 1rem;
	}

	.bag-name {
		margin: 0 0 0.75rem 0;
		font-size: 1.1rem;
	}

	.section-group {
		margin-bottom: 0.75rem;
	}

	.section-label {
		margin: 0 0 0.25rem 0;
		font-size: 0.8rem;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: var(--color-text-muted);
	}

	.critical-section .section-label {
		color: var(--color-danger);
	}

	ul {
		list-style: none;
		padding: 0;
		margin: 0;
	}

	li {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.4rem 0;
		border-bottom: 1px solid var(--color-border-light);
	}

	li:last-child {
		border-bottom: none;
	}

	li.packed .item-name {
		text-decoration: line-through;
		color: var(--color-text-faint);
	}

	.item-name {
		flex: 1;
		overflow-wrap: break-word;
		word-break: break-word;
		min-width: 0;
	}

	.qty {
		font-size: 0.8em;
		color: var(--color-text-faint);
		font-style: italic;
	}

	@media (max-width: 480px) {
		.bag-group {
			padding: 0.5rem;
		}
	}
</style>
