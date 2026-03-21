<script>
	export let trip;
	export let onClear;
</script>

<div class="trip-header">
	<h1>{trip.name}</h1>
	<p class="dates">
		{trip.departureDate} to {trip.returnDate}
	</p>
	<p class="duration">
		{trip.calculatedDays} {trip.calculatedDays === 1 ? 'day' : 'days'}
	</p>
	<button on:click={onClear}>Clear Trip</button>
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
		color: #666;
	}
</style>
