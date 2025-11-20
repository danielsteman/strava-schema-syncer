import type { PageServerLoad } from './$types';
import { getRecentActivities } from '$lib/strava';

export const load: PageServerLoad = async ({ cookies }) => {
	const athleteId = cookies.get('strava_athlete_id') ?? undefined;
	const { activities, needsAuth, errorMessage } = await getRecentActivities(20, athleteId);

	return {
		activities,
		needsAuth,
		errorMessage
	};
};
