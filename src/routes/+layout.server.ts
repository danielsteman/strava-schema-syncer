import type { LayoutServerLoad } from './$types';
import { getTokensForAthlete } from '$lib/strava/strava-tokens.ts';

export const load: LayoutServerLoad = async ({ cookies }) => {
	const athleteId = cookies.get('strava_athlete_id') ?? undefined;

	if (!athleteId) {
		return {
			user: null
		};
	}

	const row = await getTokensForAthlete(athleteId);

	if (!row) {
		return {
			user: null
		};
	}

	const firstName = row.athleteFirstName;
	const initial =
		firstName && firstName.trim().length > 0
			? firstName.trim().charAt(0).toUpperCase()
			: 'S';

	return {
		user: {
			athleteId,
			firstName: firstName ?? null,
			initial
		}
	};
};


