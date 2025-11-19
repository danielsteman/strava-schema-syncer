<script lang="ts">
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	const weeksLive = data.marathonWeeks;
	const weeksExample = data.marathonWeeksExample;

	const hasLiveData = weeksLive.some((w) => w.actualCount > 0);
	let showExample = $state(!hasLiveData);

	const visibleWeeks = () => (showExample ? weeksExample : weeksLive);

	const formatKm = (km: number) => `${km.toFixed(1)} km`;

	const statusLabel = (ratio: number, actualKm: number) => {
		if (actualKm === 0) return 'Not started';
		if (ratio >= 0.9) return 'On track';
		if (ratio >= 0.5) return 'In progress';
		return 'Behind';
	};
</script>

<main class="page">
	<header class="header">
		<div>
			<h1>Marathon training overview</h1>
			<p>
				Plan vs. completed distance per week, based on your Strava activities mapped onto the
				marathon training schema.
			</p>
		</div>

		<button
			type="button"
			class="toggle"
			onclick={() => (showExample = !showExample)}
			aria-pressed={showExample}
		>
			{#if showExample}
				View live Strava data
			{:else}
				View example data
			{/if}
		</button>
	</header>

	{#if data.errorMessage}
		<p class="message message-error">{data.errorMessage}</p>
	{/if}

	{#if data.needsAuth}
		<p class="message">
			Strava authorization is required to show live progress. Authorize on the home page and then
			return here to see your plan vs. actual distance.
		</p>
	{/if}

	{#if showExample}
		<p class="message info">
			Showing <strong>example data</strong> mapped onto your marathon schema to preview how this view
			will look once training starts.
		</p>
	{:else if !hasLiveData}
		<p class="message info">
			No Strava runs fall into the plan dates yet, so all weeks show as <em>Not started</em>. You
			can switch to example data to preview the layout.
		</p>
	{/if}

	<section class="weeks">
		{#each visibleWeeks() as week}
			<article class="week-card">
				<header>
					<div>
						<h2>
							{week.week_begin}
							<span class="dash">–</span>
							{week.week_end}
						</h2>
						<p class="status">
							<span class="status-label"
								>{statusLabel(week.completionRatio, week.actualDistanceKm)}</span
							>
							<span class="status-meta">
								{formatKm(week.actualDistanceKm)}
								/
								{formatKm(week.scheduledDistanceKm)}
							</span>
						</p>
					</div>
					<div class="ratio">
						<div class="ratio-bar">
							<div
								class="ratio-fill"
								style={`width: ${(week.completionRatio * 100).toFixed(0)}%;`}
							></div>
						</div>
						<span class="ratio-text">{Math.round(week.completionRatio * 100)}%</span>
					</div>
				</header>

				<section class="trainings">
					<h3>Planned sessions</h3>
					<ul class="sessions">
						{#each week.sessions as session}
							<li class="session">
								<label>
									<input type="checkbox" checked={session.completed} disabled />
									<span class="session-main">
										<span class="session-label">{session.label}</span>
										{#if session.completed && session.matchedActivityName}
											<span class="session-meta">
												Matched to: {session.matchedActivityName}
												{#if session.matchedDistanceKm !== undefined}
													· {formatKm(session.matchedDistanceKm)}
												{/if}
											</span>
										{/if}
									</span>
								</label>
							</li>
						{/each}
					</ul>
				</section>

				<p class="runs-meta">
					{week.actualCount === 0
						? 'No runs mapped to this week yet.'
						: `${week.actualCount} run${week.actualCount === 1 ? '' : 's'} mapped to this week.`}
				</p>
			</article>
		{/each}
	</section>
</main>

<style>
	.page {
		max-width: 960px;
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
		align-items: flex-start;
		gap: 1.5rem;
		margin-bottom: 1.75rem;
	}

	h1 {
		margin: 0 0 0.4rem;
		font-size: clamp(2rem, 3vw, 2.4rem);
	}

	p {
		margin: 0;
		color: #9ca3af;
	}

	.toggle {
		padding: 0.5rem 0.9rem;
		border-radius: 999px;
		border: 1px solid rgba(148, 163, 184, 0.6);
		background: rgba(15, 23, 42, 0.9);
		color: #e5e7eb;
		font-size: 0.85rem;
		cursor: pointer;
	}

	.toggle:hover {
		border-color: #f97316;
	}

	.message {
		margin-bottom: 1.2rem;
		padding: 0.75rem 1rem;
		border-radius: 0.5rem;
		background: #020617;
		color: #e5e7eb;
	}

	.message-error {
		border: 1px solid #f97316;
	}

	.message.info {
		border: 1px solid rgba(56, 189, 248, 0.4);
	}

	.weeks {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.week-card {
		background: #020617;
		border-radius: 0.75rem;
		padding: 1rem 1.1rem;
		border: 1px solid rgba(148, 163, 184, 0.25);
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.week-card header {
		display: flex;
		justify-content: space-between;
		gap: 1rem;
		align-items: center;
	}

	h2 {
		margin: 0 0 0.35rem;
		font-size: 1rem;
	}

	.dash {
		margin: 0 0.25rem;
	}

	.status {
		display: flex;
		gap: 0.5rem;
		align-items: baseline;
		font-size: 0.85rem;
	}

	.status-label {
		font-weight: 600;
	}

	.status-meta {
		color: #9ca3af;
		font-variant-numeric: tabular-nums;
	}

	.ratio {
		display: flex;
		flex-direction: column;
		align-items: flex-end;
		gap: 0.25rem;
		min-width: 120px;
	}

	.ratio-bar {
		width: 100%;
		height: 0.45rem;
		border-radius: 999px;
		background: rgba(15, 23, 42, 0.9);
		overflow: hidden;
	}

	.ratio-fill {
		height: 100%;
		border-radius: inherit;
		background: linear-gradient(90deg, #22c55e, #f97316, #ef4444);
	}

	.ratio-text {
		font-size: 0.8rem;
		color: #9ca3af;
		font-variant-numeric: tabular-nums;
	}

	.trainings h3 {
		margin: 0 0 0.3rem;
		font-size: 0.9rem;
		color: #e5e7eb;
	}

	.runs-meta {
		font-size: 0.8rem;
		color: #9ca3af;
	}

	.sessions {
		list-style: none;
		padding: 0;
		margin: 0;
		display: flex;
		flex-direction: column;
		gap: 0.35rem;
	}

	.session label {
		display: flex;
		gap: 0.5rem;
		align-items: flex-start;
		font-size: 0.85rem;
		color: #cbd5f5;
		cursor: default;
	}

	.session input[type='checkbox'] {
		margin-top: 0.15rem;
		accent-color: #22c55e;
	}

	.session-main {
		display: flex;
		flex-direction: column;
		gap: 0.1rem;
	}

	.session-meta {
		font-size: 0.75rem;
		color: #9ca3af;
	}

	@media (max-width: 640px) {
		.header {
			flex-direction: column;
			align-items: stretch;
		}

		.week-card header {
			flex-direction: column;
			align-items: flex-start;
		}

		.ratio {
			align-items: flex-start;
			width: 100%;
		}
	}
</style>
