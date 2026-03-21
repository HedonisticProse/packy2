<script>
	import { onMount } from 'svelte';
	import { getTrip, saveTrip, clearTrip } from '$lib/storage.js';

	let trip = null;
	let showForm = false;
	let tripName = '';
	let departureDate = '';
	let returnDate = '';
	let newItemNames = {};  // Object keyed by category.id
	let newCategoryName = '';

	$: calculatedDuration = departureDate && returnDate
		? calculateDays(departureDate, returnDate)
		: 0;

	onMount(() => {
		trip = getTrip();

		// Migration: Convert PLAN_02 trips (with items) to PLAN_03 (with categories)
		if (trip && trip.items && !trip.categories) {
			trip.categories = [{
				id: Date.now().toString(),
				name: 'General',
				items: trip.items
			}];
			delete trip.items;
			saveTrip(trip);
		}

		// Ensure categories array exists for trips created before PLAN_03
		if (trip && !trip.categories) {
			trip.categories = [];
		}
	});

	function calculateDays(departure, returnVal) {
		const start = new Date(departure);
		const end = new Date(returnVal);
		const diffTime = end - start;
		const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
		return diffDays + 1; // Inclusive (same day = 1 day)
	}

	function handleCreateTrip() {
		if (!tripName || !departureDate || !returnDate) {
			return;
		}

		const newTrip = {
			name: tripName,
			departureDate,
			returnDate,
			calculatedDays: calculateDays(departureDate, returnDate),
			categories: []
		};

		saveTrip(newTrip);
		trip = newTrip;
		showForm = false;
		tripName = '';
		departureDate = '';
		returnDate = '';
	}

	function handleClearTrip() {
		clearTrip();
		trip = null;
	}

	function addCategory() {
		if (!newCategoryName) return;

		const category = {
			id: Date.now().toString(),
			name: newCategoryName,
			items: []
		};

		trip.categories = [...trip.categories, category];
		trip = { ...trip };

		saveTrip(trip);
		newCategoryName = '';
	}

	function addItem(categoryId) {
		const itemName = newItemNames[categoryId];
		if (!itemName) return;

		trip.categories = trip.categories.map((cat) => {
			if (cat.id === categoryId) {
				return {
					...cat,
					items: [
						...cat.items,
						{
							id: Date.now().toString(),
							name: itemName,
							packed: false
						}
					]
				};
			}
			return cat;
		});

		trip = { ...trip };
		saveTrip(trip);
		newItemNames[categoryId] = '';  // Clear only this category's input
	}

	function toggleItem(categoryId, itemId) {
		trip.categories = trip.categories.map((cat) => {
			if (cat.id === categoryId) {
				return {
					...cat,
					items: cat.items.map((item) =>
						item.id === itemId ? { ...item, packed: !item.packed } : item
					)
				};
			}
			return cat;
		});

		trip = { ...trip };
		saveTrip(trip);
	}

	function deleteItem(categoryId, itemId) {
		trip.categories = trip.categories.map((cat) => {
			if (cat.id === categoryId) {
				return {
					...cat,
					items: cat.items.filter((item) => item.id !== itemId)
				};
			}
			return cat;
		});

		trip = { ...trip };
		saveTrip(trip);
	}
</script>

{#if !trip && !showForm}
	<div class="empty-state">
		<p>No trip yet</p>
		<button on:click={() => (showForm = true)}>Start New Trip</button>
	</div>
{/if}

{#if !trip && showForm}
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
{/if}

{#if trip}
	<div class="trip-display">
		<h1>{trip.name}</h1>
		<p class="dates">
			{trip.departureDate} to {trip.returnDate}
		</p>
		<p class="duration">
			{trip.calculatedDays} {trip.calculatedDays === 1 ? 'day' : 'days'}
		</p>
		<button on:click={handleClearTrip}>Clear Trip</button>

		<div class="categories-section">
			<h2>Packing List</h2>

			<div class="add-category">
				<input
					type="text"
					bind:value={newCategoryName}
					placeholder="Category name (e.g., Clothing)"
					on:keydown={(e) => e.key === 'Enter' && addCategory()}
				/>
				<button on:click={addCategory}>Add Category</button>
			</div>

			{#if trip.categories && trip.categories.length > 0}
				{#each trip.categories as category (category.id)}
					<div class="category">
						<h3>{category.name}</h3>

						<div class="add-item">
							<input
								type="text"
								bind:value={newItemNames[category.id]}
								placeholder="Add item to {category.name}"
								on:keydown={(e) => e.key === 'Enter' && addItem(category.id)}
							/>
							<button on:click={() => addItem(category.id)}>Add Item</button>
						</div>

						{#if category.items && category.items.length > 0}
							<ul class="items-list">
								{#each category.items as item (item.id)}
									<li class:packed={item.packed}>
										<input
											type="checkbox"
											checked={item.packed}
											on:change={() => toggleItem(category.id, item.id)}
										/>
										<span class="item-name">{item.name}</span>
										<button class="delete-btn" on:click={() => deleteItem(category.id, item.id)}>
											Delete
										</button>
									</li>
								{/each}
							</ul>
						{:else}
							<p class="empty-items">No items in this category yet.</p>
						{/if}
					</div>
				{/each}
			{:else}
				<p class="empty-categories">No categories yet. Add a category to start organizing your items.</p>
			{/if}
		</div>
	</div>
{/if}

<style>
	.empty-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		min-height: 50vh;
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
		margin: 2rem auto;
		padding: 2rem;
		text-align: center;
	}

	.trip-display h1 {
		margin-bottom: 1rem;
	}

	.trip-display .dates {
		font-size: 1.1rem;
		margin: 0.5rem 0;
	}

	.trip-display .duration {
		font-weight: 500;
		margin: 1rem 0;
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

	.categories-section {
		margin-top: 2rem;
		text-align: left;
	}

	.categories-section h2 {
		margin-bottom: 1rem;
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

	.category {
		margin-bottom: 2rem;
		padding: 1rem;
		border: 1px solid #ddd;
		border-radius: 4px;
	}

	.category h3 {
		margin-top: 0;
		margin-bottom: 1rem;
	}

	.add-item {
		display: flex;
		gap: 0.5rem;
		margin-bottom: 1rem;
	}

	.add-item input {
		flex: 1;
		padding: 0.5rem;
	}

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

	.empty-categories {
		color: #999;
		font-style: italic;
		margin-top: 1rem;
	}
</style>
