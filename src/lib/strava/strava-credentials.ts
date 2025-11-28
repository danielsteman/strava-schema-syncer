import { Resource } from 'sst';

type StravaResources = {
	STRAVA_CLIENT_ID?: { value: string };
	STRAVA_CLIENT_SECRET?: { value: string };
};

export function getStravaClientCredentials(): { clientId: string; clientSecret: string } {
	let clientId: string | undefined;
	let clientSecret: string | undefined;

	// Use SST Resource (works in both SST functions and SvelteKit routes)
	// Both have access to linked secrets via Resource
	try {
		const resources = Resource as StravaResources;
		clientId = resources.STRAVA_CLIENT_ID?.value;
		clientSecret = resources.STRAVA_CLIENT_SECRET?.value;
	} catch {
		// Resource might not be available in all contexts (eg local scripts)
	}

	if (!clientId || !clientSecret) {
		throw new Error('Missing Strava client credentials');
	}

	return { clientId, clientSecret };
}
