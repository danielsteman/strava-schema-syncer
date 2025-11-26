import { env } from '$env/dynamic/private';
import { Resource } from 'sst';

type StravaResources = {
	STRAVA_CLIENT_ID?: { value: string };
	STRAVA_CLIENT_SECRET?: { value: string };
};

export function getStravaClientCredentials(): { clientId: string; clientSecret: string } {
	let clientId: string | undefined;
	let clientSecret: string | undefined;

	try {
		const resources = Resource as StravaResources;
		clientId = resources.STRAVA_CLIENT_ID?.value;
		clientSecret = resources.STRAVA_CLIENT_SECRET?.value;
	} catch {
		// Resource might not be available in all contexts (eg local scripts)
	}

	clientId = clientId ?? env.STRAVA_CLIENT_ID;
	clientSecret = clientSecret ?? env.STRAVA_CLIENT_SECRET;

	if (!clientId || !clientSecret) {
		throw new Error('Missing Strava client credentials');
	}

	return { clientId, clientSecret };
}
