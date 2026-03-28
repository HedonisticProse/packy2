<script>
	// @ts-nocheck
	import { updateTask, deleteTask } from '$lib/store.js';

	export let task;
	export let onClose;

	let draftDescription = task.str_description;
	let draftCritical = task.bool_critical;

	async function handleSave() {
		if (!draftDescription.trim()) return;
		await updateTask(task.int_id, {
			str_description: draftDescription.trim(),
			bool_critical: draftCritical
		});
		onClose();
	}

	async function handleDelete() {
		await deleteTask(task.int_id);
		onClose();
	}

	function handleBackdrop(e) {
		if (e.target === e.currentTarget) onClose();
	}
</script>

<!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
<div
	class="overlay"
	role="dialog"
	aria-modal="true"
	on:click={handleBackdrop}
	on:keydown={(e) => e.key === 'Escape' && onClose()}
>
	<div class="modal">
		<h2>Edit Task</h2>

		<label>
			Description
			<input
				type="text"
				bind:value={draftDescription}
				on:keydown={(e) => e.key === 'Enter' && handleSave()}
			/>
		</label>

		<label class="checkbox-label">
			<input type="checkbox" bind:checked={draftCritical} />
			Critical
		</label>

		<div class="actions">
			<button on:click={handleSave} disabled={!draftDescription.trim()}>Save</button>
			<button on:click={onClose}>Cancel</button>
			<button class="delete-btn" on:click={handleDelete}>Delete</button>
		</div>
	</div>
</div>

<style>
	.overlay {
		position: fixed;
		inset: 0;
		background: rgba(0, 0, 0, 0.5);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 100;
	}

	.modal {
		background: #fff;
		padding: 1.5rem;
		border-radius: 6px;
		min-width: 320px;
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.modal h2 {
		margin: 0;
		font-size: 1.1rem;
	}

	label {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
		font-size: 0.9rem;
	}

	label input[type='text'] {
		padding: 0.5rem;
		font-size: 1rem;
		border: 1px solid #ccc;
		border-radius: 4px;
	}

	.checkbox-label {
		flex-direction: row;
		align-items: center;
		gap: 0.5rem;
	}

	.actions {
		display: flex;
		gap: 0.5rem;
	}

	.delete-btn {
		margin-left: auto;
	}
</style>
