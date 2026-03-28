<script>
	import { base } from '$app/paths';
	import { onMount } from 'svelte';
	import { tripStore, initializeTripStore, createTrip, clearTripState, addCategory, addBag, addStage } from '$lib/store.js';
	import { migrateFromLocalStorage } from '$lib/storage/migration.js';
	import TripHeader from '$lib/components/TripHeader.svelte';
	import CategorySection from '$lib/components/CategorySection.svelte';
	import BagSection from '$lib/components/BagSection.svelte';
	import PackingView from '$lib/components/PackingView.svelte';
	import StageSection from '$lib/components/StageSection.svelte';

	let isLoading = true;
	let activeTab = 'list';
	let showForm = false;
	let tripName = '';
	let departureDate = '';
	let returnDate = '';
	let newCategoryName = '';
	let newBagName = '';
	let newStageName = '';

	$: calculatedDuration = departureDate && returnDate
		? calculateDays(departureDate, returnDate)
		: 0;

	onMount(async () => {
		// Step 1: Migrate from localStorage (transforms nested → flat)
		await migrateFromLocalStorage();

		// Step 2: Initialize store from IndexedDB
		await initializeTripStore();

		isLoading = false;
	});

	function calculateDays(departure, returnVal) {
		const start = new Date(departure);
		const end = new Date(returnVal);
		const diffTime = end - start;
		const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
		return diffDays + 1; // Inclusive (same day = 1 day)
	}

	async function handleCreateTrip() {
		if (!tripName || !departureDate || !returnDate) {
			return;
		}

		await createTrip(tripName, departureDate, returnDate, calculateDays(departureDate, returnDate));
		showForm = false;
		tripName = '';
		departureDate = '';
		returnDate = '';
	}

	async function handleClearTrip() {
		await clearTripState();
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
</script>

<div class="logo-container">
	<img src={base + '/logo.png'} alt="Packy2 Logo" />
</div>

{#if isLoading}
	<div class="loading-state">
		<p>Loading your trip...</p>
	</div>
{:else if !$tripStore && !showForm}
	<div class="empty-state">
		<p>No trip yet</p>
		<button on:click={() => (showForm = true)}>Start New Trip</button>
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
				<p class="duration">Duration: {calculatedDuration} {calculatedDuration === 1 ? 'day' : 'days'}</p>
			{/if}
			<div class="button-group">
				<button type="submit">Create Trip</button>
				<button type="button" on:click={() => (showForm = false)}>Cancel</button>
			</div>
		</form>
	</div>
{:else if $tripStore}
	<div class="trip-display">
		<TripHeader trip={$tripStore} onClear={handleClearTrip} />

		<div class="bags-section">
			<h2>Bags</h2>

			{#if $tripStore.arr_bags && $tripStore.arr_bags.length > 0}
				{#each $tripStore.arr_bags as bag (bag.int_id)}
					<BagSection {bag} />
				{/each}
			{:else}
				<p class="empty-bags">No bags yet.</p>
			{/if}

			<div class="add-bag">
				<input
					type="text"
					bind:value={newBagName}
					placeholder="Bag name (e.g., Carry-on)"
					on:keydown={(e) => e.key === 'Enter' && handleAddBag()}
				/>
				<button on:click={handleAddBag}>Add Bag</button>
			</div>
		</div>

		<div class="packing-section">
			<div class="tabs">
				<button class:active={activeTab === 'list'} on:click={() => (activeTab = 'list')}>List</button>
				<button class:active={activeTab === 'tasks'} on:click={() => (activeTab = 'tasks')}>Tasks</button>
				<button class:active={activeTab === 'pack'} on:click={() => (activeTab = 'pack')}>Pack</button>
			</div>

			{#if activeTab === 'list'}
				<div class="categories-section">
					<div class="add-category">
						<input
							type="text"
							bind:value={newCategoryName}
							placeholder="Category name (e.g., Clothing)"
							on:keydown={(e) => e.key === 'Enter' && handleAddCategory()}
						/>
						<button on:click={handleAddCategory}>Add Category</button>
					</div>

					{#if $tripStore.arr_categories && $tripStore.arr_categories.length > 0}
						{#each $tripStore.arr_categories as category (category.int_id)}
							<CategorySection {category} items={$tripStore.arr_items} bags={$tripStore.arr_bags} />
						{/each}
					{:else}
						<p class="empty-categories">No categories yet. Add a category to start organizing your items.</p>
					{/if}
				</div>
			{:else if activeTab === 'tasks'}
				<div class="stages-section">
					<div class="add-stage">
						<input
							type="text"
							bind:value={newStageName}
							placeholder="Stage name (e.g., Departure)"
							on:keydown={(e) => e.key === 'Enter' && handleAddStage()}
						/>
						<button on:click={handleAddStage}>Add Stage</button>
					</div>

					{#if $tripStore.arr_stages && $tripStore.arr_stages.length > 0}
						{#each $tripStore.arr_stages as stage (stage.int_id)}
							<StageSection {stage} tasks={$tripStore.arr_tasks} />
						{/each}
					{:else}
						<p class="empty-stages">No stages yet.</p>
					{/if}
				</div>
			{:else}
				<PackingView
					items={$tripStore.arr_items}
					categories={$tripStore.arr_categories}
					bags={$tripStore.arr_bags}
				/>
			{/if}
		</div>
	</div>
{/if}

<style>
	.logo-container {
		display: flex;
		justify-content: center;
		padding: 2rem 0 1rem 0;
	}

	.logo-container img {
		max-width: 300px;
		height: auto;
	}

	.loading-state {
		display: flex;
		justify-content: center;
		align-items: center;
		padding: 4rem 0;
		color: #666;
		font-style: italic;
	}

	.empty-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 1rem;
	}

	.trip-form {
		max-width: 400px;
		margin: 2rem auto;
		padding: 1rem;
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
	}

	.trip-form label {
		display: block;
		font-weight: 500;
	}

	.button-group {
		display: flex;
		gap: 0.5rem;
	}

	.trip-display {
		max-width: 600px;
		margin: 0 auto;
		padding: 0 2rem 2rem 2rem;
		text-align: center;
	}

	button {
		padding: 0.5rem 1rem;
		cursor: pointer;
		border: 1px solid #ccc;
		background: #f0f0f0;
		border-radius: 4px;
	}

	button:hover {
		background: #e0e0e0;
	}

	.duration {
		color: #666;
	}

	.bags-section {
		margin-top: 2rem;
		text-align: left;
	}

	.bags-section h2 {
		margin-bottom: 1rem;
	}

	.add-bag {
		display: flex;
		gap: 0.5rem;
		margin-top: 1rem;
	}

	.add-bag input {
		flex: 1;
		padding: 0.5rem;
	}

	.empty-bags {
		color: #999;
		font-style: italic;
		margin-top: 1rem;
	}

	.packing-section {
		margin-top: 2rem;
		text-align: left;
	}

	.tabs {
		display: flex;
		gap: 0.5rem;
		margin-bottom: 1rem;
	}

	.tabs button.active {
		background: #333;
		color: #fff;
		border-color: #333;
	}

	.categories-section {
		text-align: left;
	}

	.stages-section {
		text-align: left;
	}

	.add-stage {
		display: flex;
		gap: 0.5rem;
		margin-bottom: 2rem;
	}

	.add-stage input {
		flex: 1;
		padding: 0.5rem;
	}

	.empty-stages {
		color: #999;
		font-style: italic;
		margin-top: 1rem;
	}

	.add-category {
		display: flex;
		gap: 0.5rem;
		margin-bottom: 2rem;
	}

	.add-category input {
		flex: 1;
		padding: 0.5rem;
	}

	.empty-categories {
		color: #999;
		font-style: italic;
		margin-top: 1rem;
	}
</style>
