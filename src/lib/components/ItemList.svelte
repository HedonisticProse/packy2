<script>
	import { toggleItem, deleteItem } from '$lib/store.js';

	export let items;
	export let categoryId;
</script>

{#if items && items.length > 0}
	<ul class="items-list">
		{#each items as item (item.id)}
			<li class:packed={item.packed}>
				<input
					type="checkbox"
					checked={item.packed}
					on:change={() => toggleItem(categoryId, item.id)}
				/>
				<span class="item-name">{item.name}</span>
				<button class="delete-btn" on:click={() => deleteItem(categoryId, item.id)}>
					Delete
				</button>
			</li>
		{/each}
	</ul>
{:else}
	<p class="empty-items">No items in this category yet.</p>
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
