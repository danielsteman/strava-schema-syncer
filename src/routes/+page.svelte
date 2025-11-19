<script lang="ts">
	let { data } = $props<{
		data: {
			activities:
				| {
						id: number;
						name: string;
						distance: number;
						moving_time: number;
						elapsed_time: number;
						sport_type: string;
						start_date: string;
				  }[]
				| null;
			needsAuth: boolean;
			errorMessage?: string;
		};
	}>();

	const formatDistance = (meters: number) => {
		const km = meters / 1000;
		return `${km.toFixed(1)} km`;
	};

	const formatDuration = (seconds: number) => {
		const h = Math.floor(seconds / 3600);
		const m = Math.floor((seconds % 3600) / 60);
		const s = seconds % 60;
		if (h > 0) return `${h}h ${m}m`;
		if (m > 0) return `${m}m ${s}s`;
		return `${s}s`;
	};

	const formatDate = (iso: string) => {
		const d = new Date(iso);
		return d.toLocaleDateString(undefined, {
			year: 'numeric',
			month: 'short',
			day: 'numeric'
		});
	};
</script>

<main class="page">
	<section class="header">
		<div>
			<h1>My Strava activities</h1>
			<p>Single-user view of recent activities fetched from the Strava API.</p>
		</div>
		{#if data.needsAuth}
			<a class="button" href="/auth/strava">Connect / Re-authorize Strava</a>
		{/if}
	</section>

	{#if data.errorMessage}
		<p class="message message-error">{data.errorMessage}</p>
	{/if}

	{#if data.needsAuth}
		<p class="message">
			Strava authorization is required or has expired. Click
			<a href="/auth/strava">Connect / Re-authorize Strava</a>
			to continue.
		</p>
	{:else if data.activities && data.activities.length > 0}
		<section class="activities">
			{#each data.activities as activity}
				<article class="activity-card">
					<header>
						<h2>{activity.name}</h2>
						<span class="badge">{activity.sport_type}</span>
					</header>
					<p class="date">{formatDate(activity.start_date)}</p>
					<div class="metrics">
						<div>
							<span class="label">Distance</span>
							<span>{formatDistance(activity.distance)}</span>
						</div>
						<div>
							<span class="label">Moving time</span>
							<span>{formatDuration(activity.moving_time)}</span>
						</div>
						<div>
							<span class="label">Elapsed</span>
							<span>{formatDuration(activity.elapsed_time)}</span>
						</div>
					</div>
				</article>
			{/each}
		</section>
	{:else}
		<p class="message">No activities found yet. Try a different day or re-authorize Strava.</p>
	{/if}
</main>

<style>
	.page {
		max-width: 900px;
		margin: 0 auto;
		padding: 2rem 1.5rem 3rem;
		font-family:
			system-ui,
			-apple-system,
			BlinkMacSystemFont,
			'Segoe UI',
			sans-serif;
		color: #e5e7eb;
	}

	.header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 1.5rem;
		margin-bottom: 2rem;
	}

	h1 {
		font-size: clamp(2rem, 3vw, 2.4rem);
		margin: 0 0 0.4rem;
	}

	p {
		margin: 0;
		color: #9ca3af;
	}

	.button {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		padding: 0.6rem 1rem;
		border-radius: 999px;
		background: #f97316;
		color: #0b1120;
		text-decoration: none;
		font-weight: 600;
		font-size: 0.95rem;
		box-shadow: 0 10px 25px rgba(248, 113, 22, 0.35);
		white-space: nowrap;
	}

	.button:hover {
		background: #fb923c;
	}

	.message {
		margin-bottom: 1.5rem;
		padding: 0.75rem 1rem;
		border-radius: 0.5rem;
		background: #020617;
		color: #e5e7eb;
	}

	.message-error {
		border: 1px solid #f97316;
	}

	.message a {
		color: #38bdf8;
	}

	.activities {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
		gap: 1rem;
	}

	.activity-card {
		background: #020617;
		border-radius: 0.75rem;
		padding: 1rem 1.1rem;
		border: 1px solid rgba(148, 163, 184, 0.2);
		display: flex;
		flex-direction: column;
		gap: 0.35rem;
	}

	.activity-card header {
		display: flex;
		justify-content: space-between;
		gap: 0.75rem;
		align-items: center;
	}

	.activity-card h2 {
		font-size: 1rem;
		margin: 0;
	}

	.badge {
		font-size: 0.7rem;
		text-transform: uppercase;
		letter-spacing: 0.04em;
		padding: 0.15rem 0.55rem;
		border-radius: 999px;
		background: rgba(56, 189, 248, 0.1);
		color: #38bdf8;
		white-space: nowrap;
	}

	.date {
		font-size: 0.8rem;
		color: #9ca3af;
	}

	.metrics {
		display: flex;
		justify-content: space-between;
		gap: 1rem;
		margin-top: 0.4rem;
		font-size: 0.9rem;
	}

	.metrics .label {
		display: block;
		font-size: 0.75rem;
		color: #9ca3af;
	}
</style>
