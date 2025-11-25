import { describe, expect, it, vi } from 'vitest';
import type { StravaSafEvent } from './strava-caf';

vi.mock('../lib/db.ts', () => {
	return {
		ensureSchema: vi.fn().mockResolvedValue(undefined),
		query: vi.fn().mockResolvedValue({ rows: [] })
	};
});

vi.mock('../lib/strava.ts', () => {
	return {
		getActivitiesForPeriod: vi.fn().mockResolvedValue({
			activities: [
				{
					id: 1,
					name: 'Run 1',
					distance: 10000,
					moving_time: 3600,
					elapsed_time: 3600,
					sport_type: 'Run',
					start_date: new Date('2024-01-01T10:00:00Z').toISOString(),
					has_heartrate: true,
					average_heartrate: 140,
					max_heartrate: 150
				},
				{
					id: 2,
					name: 'Run 2',
					distance: 11000,
					moving_time: 3600,
					elapsed_time: 3600,
					sport_type: 'Run',
					start_date: new Date('2024-01-08T10:00:00Z').toISOString(),
					has_heartrate: true,
					average_heartrate: 142,
					max_heartrate: 152
				},
				{
					id: 3,
					name: 'Run 3',
					distance: 12000,
					moving_time: 3600,
					elapsed_time: 3600,
					sport_type: 'Run',
					start_date: new Date('2024-01-15T10:00:00Z').toISOString(),
					has_heartrate: true,
					average_heartrate: 144,
					max_heartrate: 154
				}
			],
			needsAuth: false
		})
	};
});
import { handler } from './strava-caf';
import { query } from '../lib/db.ts';
import { getActivitiesForPeriod } from '../lib/strava.ts';

describe('strava-saf handler', () => {
	it('computes SAF and writes points and a summary', async () => {
		const event: StravaSafEvent = {
			athleteId: 'athlete-123',
			horizonDays: 30
		};

		const result = await handler(event);

		expect(result.ok).toBe(true);
		expect(result.athleteId).toBe('athlete-123');
		expect(result.observationCount).toBeGreaterThanOrEqual(3);
		expect(result.safBpm).toBeGreaterThan(0);

		const queryMock = vi.mocked(query);
		const calls = queryMock.mock.calls;

		// At least one insert into points table and one into summaries.
		expect(calls.some(([sql]) => (sql as string).includes('strava_saf_points'))).toBe(true);
		expect(calls.some(([sql]) => (sql as string).includes('strava_saf_summaries'))).toBe(true);

		const getActivitiesMock = vi.mocked(getActivitiesForPeriod);
		expect(getActivitiesMock).toHaveBeenCalled();
	});

	it('fails gracefully when athleteId is missing', async () => {
		const result = await handler({} as StravaSafEvent);
		expect(result.ok).toBe(false);
		expect(result.message).toContain('athleteId');
	});
});
