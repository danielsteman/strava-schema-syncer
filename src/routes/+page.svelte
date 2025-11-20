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
						heartRateStats?: {
							min: number;
							max: number;
							avg: number;
							p25: number;
							p50: number;
							p75: number;
							sampleCount: number;
							bins: {
								label: string;
								percentage: number;
							}[];
						} | null;
				  }[]
				| null;
			needsAuth: boolean;
			errorMessage?: string;
		};
	}>();

	const isRun = (activity: { sport_type: string }) =>
		activity.sport_type?.toLowerCase().includes('run');

	const runActivities =
		data.activities && Array.isArray(data.activities)
			? data.activities.filter(isRun)
			: data.activities;

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
	{#if data.needsAuth}
		<section class="hero">
			<div class="hero-card">
				<h1>Connect Strava</h1>
				<p>
					Authorize access to your Strava account so we can pull in recent runs and map them onto
					your training plan.
				</p>
				<a class="button hero-button" href="/auth/strava">Connect Strava</a>
			</div>
		</section>
	{:else}
		<section class="header">
			<div>
				<h1>My Strava activities</h1>
				<p>
					Recent activities fetched from the Strava API. Connect your account once and we will keep
					tokens refreshed for you.
				</p>
			</div>
			<a class="button" href="/auth/strava">Reconnect / Switch Strava account</a>
		</section>
	{/if}

	{#if data.errorMessage}
		<p class="message message-error">{data.errorMessage}</p>
	{/if}

	{#if !data.needsAuth && runActivities && runActivities.length > 0}
		<section class="activities">
			{#each runActivities as activity}
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

					{#if activity.heartRateStats}
						<section class="hr">
							<div class="hr-summary">
								<div>
									<span class="label">Avg HR</span>
									<span>{Math.round(activity.heartRateStats.avg)} bpm</span>
								</div>
								<div>
									<span class="label">Range</span>
									<span
										>{Math.round(activity.heartRateStats.min)}–{Math.round(
											activity.heartRateStats.max
										)} bpm</span
									>
								</div>
								<div>
									<span class="label">Median</span>
									<span>{Math.round(activity.heartRateStats.p50)} bpm</span>
								</div>
							</div>

							<div class="hr-distribution" aria-label="Heart rate distribution">
								{#each activity.heartRateStats.bins as bin}
									<div class="hr-row">
										<div class="hr-bar">
											<div
												class="hr-bar-fill"
												style={`width: ${bin.percentage.toFixed(1)}%;`}
											></div>
										</div>
										<div class="hr-row-meta">
											<span class="hr-bin-label">{bin.label}</span>
											<span class="hr-bin-value">{bin.percentage.toFixed(0)}%</span>
										</div>
									</div>
								{/each}
							</div>
						</section>
					{/if}
				</article>
			{/each}
		</section>
	{:else if !data.needsAuth}
		<p class="message">
			No running activities found yet. Try a different day or re-authorize Strava.
		</p>
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
		position: relative;
		z-index: 1;
	}

	.hero {
		min-height: calc(100vh - 7rem);
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.hero-card {
		max-width: 520px;
		padding: 2.25rem 2.5rem;
		border-radius: 1.25rem;
		background:
			linear-gradient(145deg, rgba(15, 23, 42, 0.96), rgba(15, 23, 42, 0.86)),
			radial-gradient(circle at top right, rgba(56, 189, 248, 0.22), transparent 60%);
		border: 1px solid rgba(148, 163, 184, 0.7);
		box-shadow:
			0 26px 70px rgba(15, 23, 42, 0.98),
			0 0 0 1px rgba(15, 23, 42, 0.9);
		backdrop-filter: blur(26px);
		-webkit-backdrop-filter: blur(26px);
		text-align: center;
	}

	.hero-card h1 {
		margin: 0 0 0.6rem;
		font-size: clamp(2.2rem, 3.2vw, 2.6rem);
	}

	.hero-card p {
		margin: 0 0 1.6rem;
		color: #9ca3af;
	}

	.hero-button {
		min-width: 180px;
		justify-content: center;
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
		background: radial-gradient(circle at 0% 0%, #fed7aa, #f97316);
		color: #0b1120;
		text-decoration: none;
		font-weight: 600;
		font-size: 0.95rem;
		box-shadow:
			0 14px 40px rgba(248, 113, 22, 0.45),
			0 0 0 1px rgba(15, 23, 42, 0.6);
		white-space: nowrap;
		transition:
			transform 140ms ease-out,
			box-shadow 140ms ease-out,
			background 140ms ease-out;
	}

	.button:hover {
		background: radial-gradient(circle at 0% 0%, #fed7aa, #fb923c);
		transform: translateY(-1px);
		box-shadow:
			0 18px 50px rgba(248, 113, 22, 0.55),
			0 0 0 1px rgba(15, 23, 42, 0.7);
	}

	.message {
		margin-bottom: 1.5rem;
		padding: 0.75rem 1rem;
		border-radius: 0.5rem;
		background:
			linear-gradient(135deg, rgba(15, 23, 42, 0.96), rgba(15, 23, 42, 0.82)),
			radial-gradient(circle at top left, rgba(248, 113, 22, 0.18), transparent 55%);
		color: #e5e7eb;
		border: 1px solid rgba(148, 163, 184, 0.6);
		box-shadow:
			0 18px 45px rgba(15, 23, 42, 0.95),
			0 0 0 1px rgba(15, 23, 42, 0.7);
		backdrop-filter: blur(20px);
		-webkit-backdrop-filter: blur(20px);
	}

	.message-error {
		border: 1px solid rgba(248, 113, 22, 0.85);
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
		background:
			linear-gradient(145deg, rgba(15, 23, 42, 0.96), rgba(15, 23, 42, 0.82)),
			radial-gradient(circle at top right, rgba(56, 189, 248, 0.22), transparent 55%);
		border-radius: 0.75rem;
		padding: 1rem 1.1rem;
		border: 1px solid rgba(148, 163, 184, 0.55);
		display: flex;
		flex-direction: column;
		gap: 0.35rem;
		box-shadow:
			0 22px 55px rgba(15, 23, 42, 0.98),
			0 0 0 1px rgba(15, 23, 42, 0.85);
		backdrop-filter: blur(26px);
		-webkit-backdrop-filter: blur(26px);
		transition:
			transform 140ms ease-out,
			box-shadow 140ms ease-out,
			border-color 140ms ease-out,
			background 140ms ease-out;
	}

	.activity-card:hover {
		transform: translateY(-1px);
		border-color: rgba(248, 113, 22, 0.8);
		box-shadow:
			0 28px 70px rgba(15, 23, 42, 0.98),
			0 0 0 1px rgba(15, 23, 42, 0.9);
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

	.hr {
		margin-top: 0.75rem;
		padding-top: 0.6rem;
		border-top: 1px solid rgba(148, 163, 184, 0.35);
		display: flex;
		flex-direction: column;
		gap: 0.6rem;
	}

	.hr-summary {
		display: flex;
		flex-wrap: wrap;
		gap: 0.75rem;
		justify-content: space-between;
		font-size: 0.85rem;
	}

	.hr-summary > div {
		display: flex;
		flex-direction: column;
		gap: 0.1rem;
	}

	.hr-distribution {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.hr-row {
		display: grid;
		grid-template-columns: minmax(0, 1fr) auto;
		align-items: center;
		gap: 0.4rem;
	}

	.hr-bar {
		position: relative;
		height: 0.4rem;
		border-radius: 999px;
		background: rgba(15, 23, 42, 0.95);
		overflow: hidden;
	}

	.hr-bar-fill {
		height: 100%;
		border-radius: inherit;
		background: linear-gradient(90deg, #22c55e, #f97316, #ef4444);
	}

	.hr-row-meta {
		display: flex;
		flex-direction: column;
		align-items: flex-end;
		gap: 0.05rem;
		font-size: 0.7rem;
		color: #9ca3af;
		min-width: 70px;
	}

	.hr-bin-label {
		font-variant-numeric: tabular-nums;
	}

	.hr-bin-value {
		font-variant-numeric: tabular-nums;
		color: #e5e7eb;
	}
</style>
