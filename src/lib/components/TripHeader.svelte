<script>
	import { updateTrip } from '$lib/store.js';

	export let trip;
	export let onClear;

	let isEditing = false;
	let draftName = '';
	let draftDeparture = '';
	let draftReturn = '';

	$: draftDuration =
		draftDeparture && draftReturn
			? Math.ceil((new Date(draftReturn) - new Date(draftDeparture)) / (1000 * 60 * 60 * 24)) + 1
			: 0;

	function startEdit() {
		draftName = trip.str_name;
		draftDeparture = trip.date_departure ?? '';
		draftReturn = trip.date_return ?? '';
		isEditing = true;
	}

	async function handleSave() {
		if (!draftName.trim()) return;
		await updateTrip({
			str_name: draftName.trim(),
			date_departure: draftDeparture,
			date_return: draftReturn
		});
		isEditing = false;
	}

	function cancelEdit() {
		isEditing = false;
	}
</script>

<div class="trip-header">
	{#if isEditing}
		<div class="edit-form">
			<div>
				<label for="editTripName">Trip Name:</label>
				<input id="editTripName" type="text" bind:value={draftName} />
			</div>
			<div>
				<label for="editDeparture">Departure:</label>
				<input id="editDeparture" type="date" bind:value={draftDeparture} />
			</div>
			<div>
				<label for="editReturn">Return:</label>
				<input id="editReturn" type="date" bind:value={draftReturn} />
			</div>
			{#if draftDuration > 0}
				<p class="duration">Duration: {draftDuration} {draftDuration === 1 ? 'day' : 'days'}</p>
			{/if}
			<div class="button-group">
				<button on:click={handleSave} disabled={!draftName.trim()}>Save</button>
				<button on:click={cancelEdit}>Cancel</button>
			</div>
		</div>
	{:else}
		<h1>{trip.str_name}</h1>
		<p class="dates">{trip.date_departure} to {trip.date_return}</p>
		<p class="duration">{trip.int_duration} {trip.int_duration === 1 ? 'day' : 'days'}</p>
		<div class="button-group">
			<button on:click={startEdit}>Edit Trip</button>
			<button on:click={onClear}>Clear Trip</button>
		</div>
	{/if}
</div>

<style>
	.trip-header {
		text-align: center;
	}

	.trip-header h1 {
		margin-bottom: 1rem;
	}

	.trip-header .dates {
		font-size: 1.1rem;
		margin: 0.5rem 0;
	}

	.trip-header .duration {
		font-weight: 500;
		margin: 1rem 0;
		color: var(--color-text-muted);
	}

	.edit-form {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
		max-width: 320px;
		margin: 0 auto;
		text-align: left;
	}

	.edit-form label {
		display: block;
		font-weight: 500;
		margin-bottom: 0.25rem;
	}

	.edit-form input {
		width: 100%;
		padding: 0.5rem;
	}

	.button-group {
		display: flex;
		gap: 0.5rem;
		justify-content: center;
	}
</style>
