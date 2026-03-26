<script>
	import { renameBag, deleteBag } from '$lib/store.js';

	export let bag;

	let isRenaming = false;
	let draftName = '';

	function startRename() {
		draftName = bag.str_name;
		isRenaming = true;
	}

	async function handleRename() {
		if (!draftName.trim()) return;
		await renameBag(bag.int_id, draftName.trim());
		isRenaming = false;
	}

	function cancelRename() {
		isRenaming = false;
	}

	async function handleDelete() {
		await deleteBag(bag.int_id);
	}
</script>

<div class="bag">
	<div class="bag-header">
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
			<span class="bag-name">{bag.str_name}</span>
			<button on:click={startRename}>Rename</button>
			<button class="delete-btn" on:click={handleDelete}>Delete</button>
		{/if}
	</div>
</div>

<style>
	.bag {
		margin-bottom: 0.5rem;
	}
	.bag-header {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}
	.bag-name {
		font-weight: 500;
		flex: 1;
	}
	.rename-input {
		flex: 1;
	}
	.delete-btn {
		margin-left: auto;
	}
</style>
