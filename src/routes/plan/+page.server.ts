import type { PageServerLoad } from './$types';
import rawSchema from '../../data/marathon-schema.json' with { type: 'json' };
import { getRecentActivities } from '$lib/strava';
import type { EnrichedActivity } from '$lib/strava';

type MarathonWeek = {
	week_begin: string;
	week_end: string;
	training1: string;
	training2: string;
	training3: string;
};

type PlannedSession = {
	label: string;
	plannedDistanceKm: number;
	completed: boolean;
	matchedActivityId?: number;
	matchedActivityName?: string;
	matchedDistanceKm?: number;
};

type WeekWithStats = MarathonWeek & {
	scheduledDistanceKm: number;
	actualDistanceKm: number;
	completionRatio: number;
	actualCount: number;
	sessions: PlannedSession[];
};

const marathonSchema = rawSchema as MarathonWeek[];

const parseDmy = (dmy: string): Date => {
	const [d, m, y] = dmy.split('/').map(Number);
	// Local midnight for the given date
	return new Date(y, m - 1, d);
};

const extractKm = (text: string): number => {
	const match = text.match(/(\d+(?:\.\d+)?)\s*km/i);
	return match ? Number.parseFloat(match[1]) : 0;
};

const mapWeeks = (weeks: MarathonWeek[], activities: EnrichedActivity[]): WeekWithStats[] => {
	return weeks.map((week) => {
		const begin = parseDmy(week.week_begin);
		const end = parseDmy(week.week_end);

		const weekActivities = activities
			.filter((activity) => {
				const d = new Date(activity.start_date);
				return d >= begin && d <= end && activity.sport_type === 'Run';
			})
			.sort((a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime());

		const remainingActivities = [...weekActivities];

		const makeSession = (label: string): PlannedSession => {
			const plannedDistanceKm = extractKm(label);

			if (plannedDistanceKm <= 0 || remainingActivities.length === 0) {
				return {
					label,
					plannedDistanceKm,
					completed: false
				};
			}

			// Greedy assignment: match this planned session to the remaining activity
			// whose distance is closest to the planned distance. Each activity can
			// only be used once.
			let bestIndex = -1;
			let bestDiff = Number.POSITIVE_INFINITY;

			for (let i = 0; i < remainingActivities.length; i += 1) {
				const candidate = remainingActivities[i];
				const candidateKm = candidate.distance / 1000;
				const diff = Math.abs(candidateKm - plannedDistanceKm);
				if (diff < bestDiff) {
					bestDiff = diff;
					bestIndex = i;
				}
			}

			if (bestIndex === -1) {
				return {
					label,
					plannedDistanceKm,
					completed: false
				};
			}

			const matched = remainingActivities.splice(bestIndex, 1)[0];
			const matchedKm = matched.distance / 1000;

			return {
				label,
				plannedDistanceKm,
				completed: true,
				matchedActivityId: matched.id,
				matchedActivityName: matched.name,
				matchedDistanceKm: matchedKm
			};
		};

		const sessions: PlannedSession[] = [
			makeSession(week.training1),
			makeSession(week.training2),
			makeSession(week.training3)
		];

		const scheduledDistanceKm =
			extractKm(week.training1) + extractKm(week.training2) + extractKm(week.training3);

		const actualDistanceKm =
			weekActivities.reduce((sum, a) => {
				return sum + a.distance;
			}, 0) / 1000;

		const completionRatio =
			scheduledDistanceKm > 0 ? Math.min(actualDistanceKm / scheduledDistanceKm, 1) : 0;

		return {
			...week,
			scheduledDistanceKm,
			actualDistanceKm,
			completionRatio,
			actualCount: weekActivities.length,
			sessions
		};
	});
};

export const load: PageServerLoad = async ({ cookies }) => {
	const athleteId = cookies.get('strava_athlete_id') ?? undefined;
	const { activities, needsAuth, errorMessage } = await getRecentActivities(200, athleteId);

	const liveActivities = activities ?? [];
	const marathonWeeks = mapWeeks(marathonSchema, liveActivities);

	// Example / mocked activities to visualise the plan before real data exists.
	const mockActivities: EnrichedActivity[] = [
		{
			id: 1,
			name: 'Mock easy run',
			distance: 7000,
			moving_time: 2100,
			elapsed_time: 2200,
			sport_type: 'Run',
			start_date: new Date(2025, 10, 25, 7, 0, 0).toISOString()
		},
		{
			id: 2,
			name: 'Mock steady run',
			distance: 8000,
			moving_time: 2400,
			elapsed_time: 2500,
			sport_type: 'Run',
			start_date: new Date(2025, 10, 27, 7, 0, 0).toISOString()
		},
		{
			id: 3,
			name: 'Mock long run',
			distance: 10000,
			moving_time: 3600,
			elapsed_time: 3700,
			sport_type: 'Run',
			start_date: new Date(2025, 10, 29, 8, 0, 0).toISOString()
		}
	];

	const marathonWeeksExample = mapWeeks(marathonSchema, mockActivities);

	return {
		marathonWeeks,
		marathonWeeksExample,
		needsAuth,
		errorMessage
	};
};
