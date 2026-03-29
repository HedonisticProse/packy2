<script>
	// @ts-nocheck
	import { flip } from 'svelte/animate';
	import { dndzone, TRIGGERS } from 'svelte-dnd-action';
	import { addTask, toggleTask, updateTask, reorderTasks } from '$lib/store.js';
	import StageEditModal from './StageEditModal.svelte';
	import TaskEditModal from './TaskEditModal.svelte';
	import TaskConfirmModal from './TaskConfirmModal.svelte';

	export let stage;
	export let tasks;

	$: localTasks = tasks
		.filter((t) => t.int_stage_id === stage.int_id)
		.sort((a, b) => a.int_order - b.int_order)
		.map((t) => ({ ...t, id: t.int_id }));

	let dragDisabled = true;
	let newTaskDescription = '';
	let editOpen = false;
	let editingTask = null;
	let confirmingTask = null;

	function handleDndConsider(e) {
		localTasks = e.detail.items;
		if (e.detail.info.trigger === TRIGGERS.DRAG_STOPPED) dragDisabled = true;
	}

	function handleDndFinalize(e) {
		localTasks = e.detail.items;
		reorderTasks(stage.int_id, localTasks.map((t) => t.int_id));
		dragDisabled = true;
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
		<button class="stage-name" on:click={() => (editOpen = true)}>{stage.str_name}</button>
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

	{#if localTasks.length > 0}
		<ul
			class="task-list"
			use:dndzone={{ items: localTasks, flipDurationMs: 200, dragDisabled }}
			on:consider={handleDndConsider}
			on:finalize={handleDndFinalize}
		>
			{#each localTasks as task (task.id)}
				<li class:done={task.bool_done} animate:flip={{ duration: 200 }}>
					<span
					role="button"
					tabindex="-1"
					aria-label="Drag to reorder"
					class="drag-handle"
					on:mousedown={() => (dragDisabled = false)}
					on:touchstart|preventDefault={() => (dragDisabled = false)}
				>⠿</span>
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

{#if editOpen}
	<StageEditModal {stage} onClose={() => (editOpen = false)} />
{/if}

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
		border: 1px solid var(--color-border);
		border-radius: 4px;
	}

	.stage-header {
		margin-bottom: 1rem;
	}

	.stage-name {
		font-size: 1rem;
		font-weight: 600;
		background: none;
		border: none;
		padding: 0;
		font: inherit;
		font-weight: 600;
		cursor: pointer;
		color: var(--color-text);
	}

	.stage-name:hover {
		color: var(--color-primary-dark);
	}

	.add-task {
		display: flex;
		gap: 0.5rem;
		margin-bottom: 1rem;
	}

	.add-task input {
		flex: 1;
		padding: 0.5rem;
		border: 1px solid var(--color-border);
		border-radius: 4px;
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

	.task-list {
		list-style: none;
		padding: 0;
		margin: 0;
	}

	.drag-handle {
		color: var(--color-text-faint);
		cursor: grab;
		font-size: 1rem;
		flex-shrink: 0;
		touch-action: none;
		user-select: none;
	}

	.drag-handle:active {
		cursor: grabbing;
	}

	.task-list li {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.4rem 0;
		border-bottom: 1px solid var(--color-border-light);
	}

	.task-list li:last-child {
		border-bottom: none;
	}

	.task-list li.done .task-description {
		text-decoration: line-through;
		color: var(--color-text-faint);
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
		color: var(--color-danger);
		font-weight: bold;
		font-size: 0.85em;
	}

	.empty-tasks {
		color: var(--color-text-faint);
		font-style: italic;
	}

	@media (max-width: 480px) {
		.stage {
			padding: 0.5rem;
		}
	}
</style>
