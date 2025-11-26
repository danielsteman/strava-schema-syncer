import { describe, expect, it } from 'vitest';
import type { StravaActivity } from '$lib/strava/strava';
import { buildSafObservations, computeSaf } from './strava/caf';

function makeActivity(
	startDateIso: string,
	distance: number,
	movingTime: number,
	avgHr: number,
	id: number
): StravaActivity {
	return {
		id,
		name: `Run ${id}`,
		distance,
		moving_time: movingTime,
		elapsed_time: movingTime,
		sport_type: 'Run',
		start_date: startDateIso,
		has_heartrate: true,
		average_heartrate: avgHr,
		max_heartrate: avgHr
	};
}

describe('SAF observation building', () => {
	it('builds observations with increasing tDays from activities', () => {
		const base = new Date('2024-01-01T10:00:00Z');
		const act1 = makeActivity(base.toISOString(), 10000, 3600, 140, 1);
		const act2 = makeActivity(
			new Date(base.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(),
			10000,
			3500,
			142,
			2
		);

		const observations = buildSafObservations([act2, act1]);

		expect(observations).toHaveLength(2);
		expect(observations[0]?.tDays).toBeCloseTo(0);
		expect(observations[1]?.tDays).toBeGreaterThan(0);
	});
});

describe('SAF computation', () => {
	it('returns success with positive SAF when speed improves over time at similar HR', () => {
		const base = new Date('2024-01-01T10:00:00Z');

		const activities: StravaActivity[] = [];
		for (let i = 0; i < 5; i += 1) {
			const date = new Date(base.getTime() + i * 7 * 24 * 60 * 60 * 1000);
			// Distance fixed at 10k, moving time decreases over time → speed increases.
			const movingTime = 3800 - i * 100;
			const avgHr = 140 + (i % 2) * 2; // small HR variation to avoid exact collinearity.
			activities.push(makeActivity(date.toISOString(), 10000, movingTime, avgHr, i + 1));
		}

		const observations = buildSafObservations(activities);
		const result = computeSaf(observations, 90);

		if (result.kind !== 'success') {
			throw new Error(`Expected success, got ${result.kind}: ${result.reason}`);
		}

		expect(result.observationCount).toBeGreaterThanOrEqual(3);
		expect(result.safBpm).toBeGreaterThan(0);
	});

	it('returns insufficient_data when there are fewer than 3 observations', () => {
		const base = new Date('2024-01-01T10:00:00Z');
		const act1 = makeActivity(base.toISOString(), 10000, 3600, 140, 1);
		const act2 = makeActivity(
			new Date(base.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(),
			10000,
			3500,
			142,
			2
		);

		const observations = buildSafObservations([act1, act2]);
		const result = computeSaf(observations, 90);

		expect(result.kind).toBe('insufficient_data');
	});
});


