import type { RequestHandler } from '@sveltejs/kit';
import { getStravaClientCredentials } from '$lib/strava/strava-credentials';

// Redirects the user to Strava's OAuth authorization page.
// Docs: https://developers.strava.com/docs/authentication/
export const GET: RequestHandler = async ({ url }) => {
	let STRAVA_CLIENT_ID: string;
	try {
		({ clientId: STRAVA_CLIENT_ID } = getStravaClientCredentials());
	} catch {
		return new Response('STRAVA_CLIENT_ID is not configured on the server', { status: 500 });
	}

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
