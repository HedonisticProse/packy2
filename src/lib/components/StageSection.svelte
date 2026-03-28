<script>
	// @ts-nocheck
	import { addTask, renameStage, deleteStage, toggleTask, updateTask } from '$lib/store.js';
	import TaskEditModal from './TaskEditModal.svelte';
	import TaskConfirmModal from './TaskConfirmModal.svelte';

	export let stage;
	export let tasks;

	$: stageTasks = tasks
		.filter((t) => t.int_stage_id === stage.int_id)
		.sort((a, b) => a.int_order - b.int_order);

	let newTaskDescription = '';
	let isRenaming = false;
	let draftName = '';
	let editingTask = null;
	let confirmingTask = null;

	function startRename() {
		draftName = stage.str_name;
		isRenaming = true;
	}

	async function handleRename() {
		if (!draftName.trim()) return;
		await renameStage(stage.int_id, draftName.trim());
		isRenaming = false;
	}

	function cancelRename() {
		isRenaming = false;
	}

	async function handleDeleteStage() {
		await deleteStage(stage.int_id);
	}

	async function handleAddTask() {
		if (!newTaskDescription.trim()) return;
		await addTask(stage.int_id, newTaskDescription.trim());
		newTaskDescription = '';
	}

	async function handleConfirmed() {
		await updateTask(confirmingTask.int_id, { bool_done: true, bool_verified: true });
		confirmingTask = null;
	}
</script>

<div class="stage">
	<div class="stage-header">
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
			<h3>{stage.str_name}</h3>
			<button on:click={startRename}>Rename</button>
			<button class="delete-btn" on:click={handleDeleteStage}>Delete</button>
		{/if}
	</div>

	<div class="add-task">
		<input
			type="text"
			bind:value={newTaskDescription}
			placeholder="Add task to {stage.str_name}"
			on:keydown={(e) => e.key === 'Enter' && handleAddTask()}
		/>
		<button on:click={handleAddTask}>Add Task</button>
	</div>

	{#if stageTasks.length > 0}
		<ul class="task-list">
			{#each stageTasks as task (task.int_id)}
				<li class:done={task.bool_done}>
					<input
						type="checkbox"
						checked={task.bool_done}
						on:click={(e) => {
							if (task.bool_critical && !task.bool_done) {
								e.preventDefault();
								confirmingTask = task;
							} else {
								toggleTask(task.int_id);
							}
						}}
					/>
					<button class="task-description" on:click={() => (editingTask = task)}>
						{task.str_description}{#if task.bool_critical}<span class="critical-badge">⭐</span>{/if}
					</button>
				</li>
			{/each}
		</ul>
	{:else}
		<p class="empty-tasks">No tasks yet.</p>
	{/if}
</div>

{#if editingTask}
	<TaskEditModal task={editingTask} onClose={() => (editingTask = null)} />
{/if}

{#if confirmingTask}
	<TaskConfirmModal
		task={confirmingTask}
		onConfirm={handleConfirmed}
		onClose={() => (confirmingTask = null)}
	/>
{/if}

<style>
	.stage {
		margin-bottom: 2rem;
		padding: 1rem;
		border: 1px solid #ddd;
		border-radius: 4px;
	}

	.stage-header {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		margin-bottom: 1rem;
	}

	.stage-header h3 {
		margin: 0;
		flex: 1;
	}

	.rename-input {
		flex: 1;
		padding: 0.25rem 0.5rem;
		font-size: 1rem;
	}

	.delete-btn {
		margin-left: auto;
	}

	.add-task {
		display: flex;
		gap: 0.5rem;
		margin-bottom: 1rem;
	}

	.add-task input {
		flex: 1;
		padding: 0.5rem;
	}

	.task-list {
		list-style: none;
		padding: 0;
		margin: 0;
	}

	.task-list li {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.4rem 0;
		border-bottom: 1px solid #eee;
	}

	.task-list li:last-child {
		border-bottom: none;
	}

	.task-list li.done .task-description {
		text-decoration: line-through;
		color: #999;
	}

	.task-description {
		flex: 1;
		text-align: left;
		background: none;
		border: none;
		padding: 0;
		font: inherit;
		cursor: pointer;
		color: inherit;
	}

	.critical-badge {
		display: inline-block;
		margin-left: 0.4rem;
		color: #c00;
		font-weight: bold;
		font-size: 0.85em;
	}

	.empty-tasks {
		color: #999;
		font-style: italic;
	}
</style>
