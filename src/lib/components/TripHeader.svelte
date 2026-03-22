<script>
	export let trip;
	export let onClear;
</script>

<div class="trip-header">
	<h1>{trip.str_name}</h1>
	<p class="dates">
		{trip.date_departure} to {trip.date_return}
	</p>
	<p class="duration">
		{trip.int_duration} {trip.int_duration === 1 ? 'day' : 'days'}
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
