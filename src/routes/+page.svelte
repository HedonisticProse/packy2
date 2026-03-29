<script>
	import { onMount } from 'svelte';
	import { flip } from 'svelte/animate';
	import { dndzone, TRIGGERS } from 'svelte-dnd-action';
	import {
		tripStore,
		initializeTripStore,
		createTrip,
		clearTripState,
		addCategory,
		addBag,
		addStage,
		assignCategoryToBag,
		reorderCategories,
		reorderBags,
		reorderStages,
		loadTripById,
		deactivateCurrentTrip,
		deleteTripById
	} from '$lib/store.js';
	import { getAllTrips } from '$lib/storage.js';
	import { saveTrip, saveTemplate } from '$lib/export.js';
	import { importPackyFile } from '$lib/import.js';
	import { migrateFromLocalStorage } from '$lib/storage/migration.js';
	import TripHeader from '$lib/components/TripHeader.svelte';
	import CategorySection from '$lib/components/CategorySection.svelte';
	import BagSection from '$lib/components/BagSection.svelte';
	import PackingView from '$lib/components/PackingView.svelte';
	import StageSection from '$lib/components/StageSection.svelte';

	const TAB_STORAGE_KEY = 'packy-last-tab';
	const TABS = ['tripinfo', 'bags', 'items', 'assignment', 'pack', 'stages'];

	let isLoading = true;
	let activeTab = 'items';

	// Local arrays for dnd (require `id` field; sorted by int_order)
	let localBags = [];
	let localCategories = [];
	let localStages = [];

	$: localBags = [...($tripStore?.arr_bags ?? [])]
		.sort((a, b) => a.int_order - b.int_order)
		.map((b) => ({ ...b, id: b.int_id }));

	$: localCategories = [...($tripStore?.arr_categories ?? [])]
		.sort((a, b) => a.int_order - b.int_order)
		.map((c) => ({ ...c, id: c.int_id }));

	$: localStages = [...($tripStore?.arr_stages ?? [])]
		.sort((a, b) => a.int_order - b.int_order)
		.map((s) => ({ ...s, id: s.int_id }));
	let bagsDragDisabled = true;
	let categoriesDragDisabled = true;
	let stagesDragDisabled = true;
	let allTrips = [];
	let tripHeaderEl;
	let showForm = false;
	let tripName = '';
	let departureDate = '';
	let returnDate = '';
	let newCategoryName = '';
	let newBagName = '';
	let newStageName = '';
	let fileInput;

	$: calculatedDuration =
		departureDate && returnDate ? calculateDays(departureDate, returnDate) : 0;

	function ordinal(n) {
		const s = ['th', 'st', 'nd', 'rd'];
		const v = n % 100;
		return n + (s[(v - 20) % 10] || s[v] || s[0]);
	}

	function formatDate(dateStr) {
		if (!dateStr) return '';
		const d = new Date(dateStr + 'T12:00:00');
		const weekday = d.toLocaleDateString('en-US', { weekday: 'long' });
		const month = d.toLocaleDateString('en-US', { month: 'long' });
		return `${weekday}, ${month} ${ordinal(d.getDate())}`;
	}

	async function refreshTripList() {
		const trips = await getAllTrips();
		allTrips = trips.sort((a, b) => b.createdAt - a.createdAt);
	}

	onMount(async () => {
		const saved = localStorage.getItem(TAB_STORAGE_KEY);
		if (saved && TABS.includes(saved)) activeTab = saved;

		await migrateFromLocalStorage();
		await initializeTripStore();
		await refreshTripList();
		isLoading = false;
	});

	function setTab(tab) {
		activeTab = tab;
		localStorage.setItem(TAB_STORAGE_KEY, tab);
	}

	function calculateDays(departure, returnVal) {
		const start = new Date(departure);
		const end = new Date(returnVal);
		const diffTime = end - start;
		const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
		return diffDays + 1;
	}

	async function handleCreateTrip() {
		if (!tripName || !departureDate || !returnDate) return;
		await createTrip(tripName, departureDate, returnDate, calculateDays(departureDate, returnDate));
		showForm = false;
		tripName = '';
		departureDate = '';
		returnDate = '';
		setTab('items');
	}

	async function handleClearTrip() {
		await clearTripState();
		await refreshTripList();
	}

	async function handleLoadTrip(tripId) {
		await loadTripById(tripId);
	}

	async function handleDeleteTripFromList(tripId) {
		if (!confirm('Delete this trip? This cannot be undone.')) return;
		await deleteTripById(tripId);
		await refreshTripList();
	}

	async function handleImportTrip(e) {
		const file = e.target.files[0];
		if (!file) return;
		try {
			await importPackyFile(file);
			setTab('items');
		} catch (err) {
			console.error('Import failed:', err);
		}
		e.target.value = '';
	}

	function handleSaveTrip() {
		saveTrip($tripStore);
	}

	function handleSaveTemplate() {
		saveTemplate($tripStore);
	}

	async function handleAddCategory() {
		await addCategory(newCategoryName);
		newCategoryName = '';
	}

	async function handleAddBag() {
		if (!newBagName.trim()) return;
		await addBag(newBagName.trim());
		newBagName = '';
	}

	async function handleAddStage() {
		if (!newStageName.trim()) return;
		await addStage(newStageName.trim());
		newStageName = '';
	}

	function handleBagsDndConsider(e) {
		localBags = e.detail.items;
		if (e.detail.info.trigger === TRIGGERS.DRAG_STOPPED) bagsDragDisabled = true;
	}
	function handleBagsDndFinalize(e) {
		localBags = e.detail.items;
		reorderBags(localBags.map((b) => b.int_id));
		bagsDragDisabled = true;
	}

	function handleCategoriesDndConsider(e) {
		localCategories = e.detail.items;
		if (e.detail.info.trigger === TRIGGERS.DRAG_STOPPED) categoriesDragDisabled = true;
	}
	function handleCategoriesDndFinalize(e) {
		localCategories = e.detail.items;
		reorderCategories(localCategories.map((c) => c.int_id));
		categoriesDragDisabled = true;
	}

	function handleStagesDndConsider(e) {
		localStages = e.detail.items;
		if (e.detail.info.trigger === TRIGGERS.DRAG_STOPPED) stagesDragDisabled = true;
	}
	function handleStagesDndFinalize(e) {
		localStages = e.detail.items;
		reorderStages(localStages.map((s) => s.int_id));
		stagesDragDisabled = true;
	}
</script>

<input
	type="file"
	accept=".packy,.trip,.template"
	bind:this={fileInput}
	on:change={handleImportTrip}
	style="display:none"
/>

{#if isLoading}
	<div class="loading-state">
		<p>Loading your trip...</p>
	</div>
{:else if !$tripStore && !showForm}
	<div class="trip-manager">
		<h2 class="trip-manager-title">Your Trips</h2>

		{#if allTrips.length > 0}
			<ul class="trip-list">
				{#each allTrips as trip (trip.int_id)}
					<li class="trip-list-item">
						<div class="trip-list-info">
							<span class="trip-list-name">{trip.str_name}</span>
							<span class="trip-list-dates">
								{formatDate(trip.date_departure)} → {formatDate(trip.date_return)}
							</span>
						</div>
						<div class="trip-list-actions">
							<button on:click={() => handleLoadTrip(trip.int_id)}>Load</button>
							<button class="danger-btn" on:click={() => handleDeleteTripFromList(trip.int_id)}>Delete</button>
						</div>
					</li>
				{/each}
			</ul>
		{:else}
			<p class="empty-msg">No trips saved yet.</p>
		{/if}

		<div class="trip-manager-footer">
			<button on:click={() => (showForm = true)}>+ New Trip</button>
			<button on:click={() => fileInput.click()}>Import Trip</button>
		</div>
	</div>
{:else if !$tripStore && showForm}
	<div class="trip-form">
		<h2>Create New Trip</h2>
		<form on:submit|preventDefault={handleCreateTrip}>
			<div>
				<label for="tripName">Trip Name:</label>
				<input id="tripName" type="text" bind:value={tripName} required />
			</div>
			<div>
				<label for="departureDate">Departure Date:</label>
				<input id="departureDate" type="date" bind:value={departureDate} required />
			</div>
			<div>
				<label for="returnDate">Return Date:</label>
				<input id="returnDate" type="date" bind:value={returnDate} required />
			</div>
			{#if calculatedDuration > 0}
				<p class="duration">
					Duration: {calculatedDuration}
					{calculatedDuration === 1 ? 'day' : 'days'}
				</p>
			{/if}
			<div class="button-group">
				<button type="submit">Create Trip</button>
				<button type="button" on:click={() => (showForm = false)}>Cancel</button>
			</div>
		</form>
	</div>
{:else if $tripStore}
	<div class="trip-display">
		<!-- Tab Bar -->
		<nav class="tabs" aria-label="Trip sections">
			<button class:active={activeTab === 'tripinfo'} on:click={() => setTab('tripinfo')}>Trip</button>
			<button class:active={activeTab === 'bags'} on:click={() => setTab('bags')}>Bags</button>
			<button class:active={activeTab === 'items'} on:click={() => setTab('items')}>Items</button>
			<button class:active={activeTab === 'assignment'} on:click={() => setTab('assignment')}>Assign</button>
			<button class:active={activeTab === 'pack'} on:click={() => setTab('pack')}>Pack</button>
			<button class:active={activeTab === 'stages'} on:click={() => setTab('stages')}>Stages</button>
		</nav>

		<!-- Trip Info Tab -->
		{#if activeTab === 'tripinfo'}
			<div class="tab-content">
				<TripHeader bind:this={tripHeaderEl} trip={$tripStore} />
				<div class="trip-actions">
					<button on:click={deactivateCurrentTrip}>All Trips</button>
					<button on:click={() => tripHeaderEl.startEdit()}>Edit Trip</button>
					<button class="danger-btn" on:click={handleClearTrip}>Delete Trip</button>
					<button on:click={handleSaveTrip}>Save Trip</button>
					<button on:click={handleSaveTemplate}>Save Template</button>
					<button on:click={() => fileInput.click()}>Import Trip</button>
				</div>
			</div>

		<!-- Bags Tab -->
		{:else if activeTab === 'bags'}
			<div class="tab-content">
				<div class="add-row">
					<input
						type="text"
						bind:value={newBagName}
						placeholder="Bag name (e.g., Carry-on)"
						on:keydown={(e) => e.key === 'Enter' && handleAddBag()}
					/>
					<button on:click={handleAddBag}>Add Bag</button>
				</div>

				{#if localBags.length > 0}
					<div
						class="dnd-list"
						use:dndzone={{ items: localBags, flipDurationMs: 200, dragDisabled: bagsDragDisabled }}
						on:consider={handleBagsDndConsider}
						on:finalize={handleBagsDndFinalize}
					>
						{#each localBags as bag (bag.id)}
							<div animate:flip={{ duration: 200 }} class="section-dnd-row">
								<span
									role="button" tabindex="-1" aria-label="Drag to reorder" class="section-drag-handle"
									on:mousedown={() => (bagsDragDisabled = false)}
									on:touchstart|preventDefault={() => (bagsDragDisabled = false)}
								>⠿</span>
								<div class="section-dnd-content"><BagSection {bag} /></div>
							</div>
						{/each}
					</div>
				{:else}
					<p class="empty-msg">No bags yet.</p>
				{/if}
			</div>

		<!-- Items Tab -->
		{:else if activeTab === 'items'}
			<div class="tab-content">
				<div class="add-row">
					<input
						type="text"
						bind:value={newCategoryName}
						placeholder="Category name (e.g., Clothing)"
						on:keydown={(e) => e.key === 'Enter' && handleAddCategory()}
					/>
					<button on:click={handleAddCategory}>Add Category</button>
				</div>

				{#if localCategories.length > 0}
					<div
						class="dnd-list"
						use:dndzone={{ items: localCategories, flipDurationMs: 200, dragDisabled: categoriesDragDisabled }}
						on:consider={handleCategoriesDndConsider}
						on:finalize={handleCategoriesDndFinalize}
					>
						{#each localCategories as category (category.id)}
							<div animate:flip={{ duration: 200 }} class="section-dnd-row">
								<span
									role="button" tabindex="-1" aria-label="Drag to reorder" class="section-drag-handle"
									on:mousedown={() => (categoriesDragDisabled = false)}
									on:touchstart|preventDefault={() => (categoriesDragDisabled = false)}
								>⠿</span>
								<div class="section-dnd-content">
									<CategorySection
										{category}
										items={$tripStore.arr_items}
										bags={$tripStore.arr_bags}
									/>
								</div>
							</div>
						{/each}
					</div>
				{:else}
					<p class="empty-msg">No categories yet. Add a category to start organizing your items.</p>
				{/if}
			</div>

		<!-- Assignment Tab -->
		{:else if activeTab === 'assignment'}
			<div class="tab-content">
				{#if !$tripStore.arr_bags || $tripStore.arr_bags.length === 0}
					<p class="empty-msg">Add bags first, then assign categories to them.</p>
				{:else if !$tripStore.arr_categories || $tripStore.arr_categories.length === 0}
					<p class="empty-msg">No categories yet. Add categories in the Items tab.</p>
				{:else}
					<p class="assignment-hint">Assign each category to a bag.</p>
					<ul class="assignment-list">
						{#each $tripStore.arr_categories as category (category.int_id)}
							<li class="assignment-row">
								<span class="assignment-cat">{category.str_name}</span>
								<select
									value={category.int_bag_id ?? ''}
									on:change={(e) =>
										assignCategoryToBag(
											category.int_id,
											e.target.value ? Number(e.target.value) : null
										)}
								>
									<option value="">No bag</option>
									{#each $tripStore.arr_bags as bag (bag.int_id)}
										<option value={bag.int_id}>{bag.str_name}</option>
									{/each}
								</select>
							</li>
						{/each}
					</ul>
				{/if}
			</div>

		<!-- Pack Tab -->
		{:else if activeTab === 'pack'}
			<div class="tab-content">
				<PackingView
					items={$tripStore.arr_items}
					categories={$tripStore.arr_categories}
					bags={$tripStore.arr_bags}
				/>
			</div>

		<!-- Stages Tab -->
		{:else if activeTab === 'stages'}
			<div class="tab-content">
				<div class="add-row">
					<input
						type="text"
						bind:value={newStageName}
						placeholder="Stage name (e.g., Departure)"
						on:keydown={(e) => e.key === 'Enter' && handleAddStage()}
					/>
					<button on:click={handleAddStage}>Add Stage</button>
				</div>

				{#if localStages.length > 0}
					<div
						class="dnd-list"
						use:dndzone={{ items: localStages, flipDurationMs: 200, dragDisabled: stagesDragDisabled }}
						on:consider={handleStagesDndConsider}
						on:finalize={handleStagesDndFinalize}
					>
						{#each localStages as stage (stage.id)}
							<div animate:flip={{ duration: 200 }} class="section-dnd-row">
								<span
									role="button" tabindex="-1" aria-label="Drag to reorder" class="section-drag-handle"
									on:mousedown={() => (stagesDragDisabled = false)}
									on:touchstart|preventDefault={() => (stagesDragDisabled = false)}
								>⠿</span>
								<div class="section-dnd-content"><StageSection {stage} tasks={$tripStore.arr_tasks} /></div>
							</div>
						{/each}
					</div>
				{:else}
					<p class="empty-msg">No stages yet.</p>
				{/if}
			</div>
		{/if}
	</div>
{/if}

<style>
	.loading-state {
		display: flex;
		justify-content: center;
		align-items: center;
		padding: 4rem 0;
		color: var(--color-text-muted);
		font-style: italic;
	}

	/* Trip manager (empty state / trip list) */
	.trip-manager {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		padding: 0.5rem 0;
	}

	.trip-manager-title {
		margin: 0;
		font-size: 1.1rem;
		color: var(--color-text);
	}

	.trip-list {
		list-style: none;
		padding: 0;
		margin: 0;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.trip-list-item {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.75rem;
		padding: 0.65rem 0.75rem;
		border: 1px solid var(--color-border);
		border-radius: 6px;
		background: var(--color-surface);
	}

	.trip-list-info {
		display: flex;
		flex-direction: column;
		gap: 0.15rem;
		min-width: 0;
	}

	.trip-list-name {
		font-weight: 600;
		color: var(--color-text);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.trip-list-dates {
		font-size: 0.8rem;
		color: var(--color-text-muted);
		overflow-wrap: break-word;
		word-break: break-word;
	}

	.trip-list-actions {
		display: flex;
		gap: 0.4rem;
		flex-shrink: 0;
	}

	.trip-manager-footer {
		display: flex;
		gap: 0.5rem;
		padding-top: 0.5rem;
		border-top: 1px solid var(--color-border-light);
	}

	.trip-form {
		max-width: 400px;
		margin: 1rem auto;
	}

	.trip-form form {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.trip-form input {
		width: 100%;
		padding: 0.5rem;
		margin-top: 0.25rem;
		border: 1px solid var(--color-border);
		border-radius: 4px;
	}

	.trip-form label {
		display: block;
		font-weight: 500;
	}

	.duration {
		color: var(--color-text-muted);
	}

	.button-group {
		display: flex;
		gap: 0.5rem;
	}

	button {
		padding: 0.5rem 1rem;
		cursor: pointer;
		border: 1px solid var(--color-border);
		background: var(--color-btn-bg);
		border-radius: 4px;
		font-size: 0.9rem;
	}

	button:hover {
		background: var(--color-btn-hover);
	}

	/* Tab bar */
	.tabs {
		display: flex;
		gap: 0.25rem;
		margin-bottom: 1rem;
		flex-wrap: wrap;
	}

	.tabs button {
		padding: 0.4rem 0.75rem;
		font-size: 0.85rem;
	}

	.tabs button.active {
		background: var(--color-primary-dark);
		color: var(--color-header-text);
		border-color: var(--color-primary-dark);
	}

	.tab-content {
		text-align: left;
	}

	/* Trip info action buttons */
	.trip-actions {
		display: flex;
		gap: 0.5rem;
		margin-top: 1.25rem;
		flex-wrap: wrap;
		justify-content: center;
	}

	.danger-btn {
		border-color: var(--color-danger);
		color: var(--color-danger);
	}

	.danger-btn:hover {
		background: var(--color-danger-light);
	}

	/* Add row (shared by bags / items / stages tabs) */
	.add-row {
		display: flex;
		gap: 0.5rem;
		margin-bottom: 1.5rem;
	}

	.add-row input {
		flex: 1;
		padding: 0.5rem;
		border: 1px solid var(--color-border);
		border-radius: 4px;
		font-size: 0.9rem;
	}

	/* DnD list container */
	.dnd-list {
		display: flex;
		flex-direction: column;
		gap: 0;
		outline: none;
	}

	/* Empty messages */
	.empty-msg {
		color: var(--color-text-faint);
		font-style: italic;
		margin-top: 0.5rem;
	}

	/* Assignment tab */
	.assignment-hint {
		color: var(--color-text-muted);
		font-size: 0.875rem;
		margin-bottom: 0.75rem;
	}

	.assignment-list {
		list-style: none;
		padding: 0;
		margin: 0;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.assignment-row {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding: 0.5rem 0.75rem;
		border: 1px solid var(--color-border);
		border-radius: 4px;
		background: var(--color-surface);
	}

	.assignment-cat {
		flex: 1;
		font-weight: 500;
		min-width: 0;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.assignment-row select {
		padding: 0.3rem 0.5rem;
		border: 1px solid var(--color-border);
		border-radius: 4px;
		font-size: 0.875rem;
		flex-shrink: 0;
		max-width: 45%;
	}

	/* Section-level drag handles (bags, categories, stages) */
	.section-dnd-row {
		display: flex;
		align-items: flex-start;
	}

	.section-drag-handle {
		padding-top: 0.6rem;
		padding-right: 0.25rem;
		color: var(--color-text-faint);
		cursor: grab;
		font-size: 1rem;
		flex-shrink: 0;
		touch-action: none;
		user-select: none;
	}

	.section-drag-handle:active {
		cursor: grabbing;
	}

	.section-dnd-content {
		flex: 1;
		min-width: 0;
	}
</style>
