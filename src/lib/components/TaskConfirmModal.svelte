<script>
	export let task;
	export let onConfirm;
	export let onClose;

	let progress = 0;
	let interval = null;

	function startHold() {
		if (interval) return;
		interval = setInterval(() => {
			progress += 100 / (2000 / 50);
			if (progress >= 100) {
				progress = 100;
				stopHold();
				onConfirm();
			}
		}, 50);
	}

	function stopHold() {
		clearInterval(interval);
		interval = null;
		if (progress < 100) progress = 0;
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
	<div class="box">
		<p class="prompt">Completing: <strong>{task.str_description}</strong>?</p>

		<button
			class="hold-btn"
			on:mousedown={startHold}
			on:mouseup={stopHold}
			on:mouseleave={stopHold}
			on:touchstart|preventDefault={startHold}
			on:touchend={stopHold}
		>
			<span class="fill" style="width: {progress}%"></span>
			<span class="label">Confirm</span>
		</button>

		<button class="cancel" on:click={onClose}>Cancel</button>
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
		z-index: 200;
	}

	.box {
		background: #fff;
		padding: 1.5rem;
		border-radius: 6px;
		min-width: 280px;
		display: flex;
		flex-direction: column;
		gap: 1rem;
		text-align: center;
	}

	.prompt {
		margin: 0;
		font-size: 1rem;
	}

	.hold-btn {
		position: relative;
		overflow: hidden;
		padding: 0.75rem 1.5rem;
		border: 2px solid #c00;
		border-radius: 4px;
		background: #fff;
		cursor: pointer;
		font-size: 1rem;
		user-select: none;
	}

	.fill {
		position: absolute;
		left: 0;
		top: 0;
		height: 100%;
		background: #fcc;
		transition: width 50ms linear;
		pointer-events: none;
	}

	.label {
		position: relative;
		z-index: 1;
	}

	.cancel {
		background: none;
		border: 1px solid #ccc;
		padding: 0.5rem;
		border-radius: 4px;
		cursor: pointer;
	}
</style>
