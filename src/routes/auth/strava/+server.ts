import type { RequestHandler } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import { Resource } from 'sst';

// Redirects the user to Strava's OAuth authorization page.
// Docs: https://developers.strava.com/docs/authentication/
export const GET: RequestHandler = async ({ url }) => {
	// Access secrets: try SST Resource object first (for deployed), then env vars (for local dev)
	let STRAVA_CLIENT_ID: string | undefined;
	try {
		STRAVA_CLIENT_ID = Resource.STRAVA_CLIENT_ID?.value;
	} catch {
		// Resource might not be available in all contexts
	}
	STRAVA_CLIENT_ID = STRAVA_CLIENT_ID ?? env.STRAVA_CLIENT_ID;

	if (!STRAVA_CLIENT_ID) {
		return new Response('STRAVA_CLIENT_ID is not configured on the server', { status: 500 });
	}

	const redirectUri = new URL('/auth/strava/callback', url.origin).toString();

	const params = new URLSearchParams({
		client_id: STRAVA_CLIENT_ID,
		redirect_uri: redirectUri,
		response_type: 'code',
		approval_prompt: 'auto',
		// Request read access to all activities so we can display them
		scope: 'activity:read_all'
	});

	const authorizeUrl = `https://www.strava.com/oauth/authorize?${params.toString()}`;

	return Response.redirect(authorizeUrl, 302);
};
