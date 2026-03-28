<script>
	import { renameCategory, deleteCategory, assignCategoryToBag } from '$lib/store.js';

	export let category;
	export let bags;
	export let onClose;

	let draftName = category.str_name;
	let draftBagId = category.int_bag_id ?? '';

	async function handleSave() {
		if (!draftName.trim()) return;
		await renameCategory(category.int_id, draftName.trim());
		await assignCategoryToBag(category.int_id, draftBagId === '' ? null : Number(draftBagId));
		onClose();
	}

	async function handleDelete() {
		await deleteCategory(category.int_id);
		onClose();
	}

	function handleBackdrop(e) {
		if (e.target === e.currentTarget) onClose();
	}
</script>

<!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
<div
	class="modal-overlay"
	role="dialog"
	aria-modal="true"
	on:click={handleBackdrop}
	on:keydown={(e) => e.key === 'Escape' && onClose()}
>
	<div class="modal-box">
		<h3>Edit Category</h3>

		<label>
			Name
			<input
				type="text"
				bind:value={draftName}
				on:keydown={(e) => e.key === 'Enter' && handleSave()}
			/>
		</label>

		{#if bags && bags.length > 0}
			<label>
				Bag
				<select bind:value={draftBagId}>
					<option value="">No bag</option>
					{#each bags as bag (bag.int_id)}
						<option value={bag.int_id}>{bag.str_name}</option>
					{/each}
				</select>
			</label>
		{/if}

		<div class="modal-actions">
			<button on:click={handleSave} disabled={!draftName.trim()}>Save</button>
			<button on:click={onClose}>Cancel</button>
			<button class="delete-btn" on:click={handleDelete}>Delete</button>
		</div>
	</div>
</div>

<style>
	.modal-overlay {
		position: fixed;
		inset: 0;
		background: var(--color-overlay);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 100;
	}

	.modal-box {
		background: var(--color-surface);
		padding: 1.5rem;
		border-radius: 6px;
		min-width: 300px;
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.modal-box h3 {
		margin: 0;
	}

	label {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
		font-size: 0.875rem;
	}

	label input,
	label select {
		padding: 0.5rem;
		border: 1px solid var(--color-border);
		border-radius: 4px;
		font-size: 1rem;
	}

	.modal-actions {
		display: flex;
		gap: 0.5rem;
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

	button:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.delete-btn {
		margin-left: auto;
		border-color: var(--color-danger);
		color: var(--color-danger);
		background: transparent;
	}

	.delete-btn:hover {
		background: var(--color-danger-light);
	}
</style>
