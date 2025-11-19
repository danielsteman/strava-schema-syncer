import type { PageServerLoad } from './$types';
import { getRecentActivities } from '$lib/strava';

export const load: PageServerLoad = async () => {
	const { activities, needsAuth, errorMessage } = await getRecentActivities(20);

	return {
		activities,
		needsAuth,
		errorMessage
	};
};


