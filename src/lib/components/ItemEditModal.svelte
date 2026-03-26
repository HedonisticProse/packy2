<script>
	import { updateItem, deleteItem } from '$lib/store.js';

	export let item;
	export let onClose;

	let draftName = item.str_name;
	let draftQuantity = item.str_quantity ?? '';
	let draftCritical = item.bool_critical;

	async function handleSave() {
		if (!draftName.trim()) return;
		await updateItem(item.int_id, {
			str_name: draftName.trim(),
			str_quantity: draftQuantity,
			bool_critical: draftCritical
		});
		onClose();
	}

	async function handleDelete() {
		await deleteItem(item.int_category_id, item.int_id);
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
		<h3>Edit Item</h3>

		<label>
			Name
			<input
				type="text"
				bind:value={draftName}
				on:keydown={(e) => e.key === 'Enter' && handleSave()}
			/>
		</label>

		<label>
			Quantity
			<input
				type="text"
				bind:value={draftQuantity}
				placeholder="e.g. 3 or (2d+1)"
				on:keydown={(e) => e.key === 'Enter' && handleSave()}
			/>
		</label>

		<label class="checkbox-label">
			<input type="checkbox" bind:checked={draftCritical} />
			Critical
		</label>

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
		background: rgba(0, 0, 0, 0.4);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 100;
	}

	.modal-box {
		background: #fff;
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

	.checkbox-label {
		flex-direction: row;
		align-items: center;
		gap: 0.5rem;
	}

	.modal-actions {
		display: flex;
		gap: 0.5rem;
	}

	.delete-btn {
		margin-left: auto;
	}
</style>
