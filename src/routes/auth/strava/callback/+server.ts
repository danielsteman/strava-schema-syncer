import { redirect, type RequestHandler } from '@sveltejs/kit';
import { putTokensForAthlete } from '$lib/strava/strava-tokens';
import { getStravaClientCredentials } from '$lib/strava/strava-credentials';

type StravaTokenResponse = {
	token_type: string;
	access_token: string;
	expires_at: number;
	expires_in: number;
	refresh_token: string;
	athlete?: unknown;
};

type StravaAthlete = {
	id: number;
	firstname?: string;
	[key: string]: unknown;
};

// Handles the OAuth callback from Strava and exchanges the authorization code for tokens.
// Docs: https://developers.strava.com/docs/authentication/
export const GET: RequestHandler = async ({ url, cookies }) => {
	const error = url.searchParams.get('error');
	if (error) {
		return new Response(`Authorization error from provider: ${error}`, { status: 400 });
	}

	const code = url.searchParams.get('code');
	if (!code) {
		return new Response('Missing authorization code from provider', { status: 400 });
	}

	let STRAVA_CLIENT_ID: string;
	let STRAVA_CLIENT_SECRET: string;
	try {
		({ clientId: STRAVA_CLIENT_ID, clientSecret: STRAVA_CLIENT_SECRET } =
			getStravaClientCredentials());
	} catch {
		return new Response('Client credentials are not configured on the server', {
			status: 500
		});
	}

	if (!STRAVA_CLIENT_ID || !STRAVA_CLIENT_SECRET) {
		return new Response('Client credentials are not configured on the server', {
			status: 500
		});
	}

	const body = new URLSearchParams({
		client_id: STRAVA_CLIENT_ID,
		client_secret: STRAVA_CLIENT_SECRET,
		code,
		grant_type: 'authorization_code'
	});

	const tokenRes = await fetch('https://www.strava.com/oauth/token', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded'
		},
		body
	});

	if (!tokenRes.ok) {
		const text = await tokenRes.text();
		return new Response(`Failed to exchange code for tokens: ${text}`, { status: 500 });
	}

	const tokenJson = (await tokenRes.json()) as StravaTokenResponse;

	const athlete = tokenJson.athlete as StravaAthlete | undefined;
	const athleteId = athlete?.id?.toString();

	if (!athleteId) {
		return new Response('Missing athlete information in provider response', { status: 500 });
	}

	const nowIso = new Date().toISOString();

	// Persist tokens for this athlete so future requests can refresh as needed.
	await putTokensForAthlete({
		athleteId,
		accessToken: tokenJson.access_token,
		refreshToken: tokenJson.refresh_token,
		expiresAt: tokenJson.expires_at,
		scope: 'activity:read_all',
		athleteFirstName: athlete?.firstname,
		createdAt: nowIso,
		updatedAt: nowIso
	});

	// Remember the currently connected athlete in a cookie so subsequent
	// requests can resolve the right tokens.
	const isHttps = url.protocol === 'https:';

	cookies.set('strava_athlete_id', athleteId, {
		path: '/',
		httpOnly: true,
		secure: isHttps,
		sameSite: 'lax',
		maxAge: 60 * 60 * 24 * 365 // 1 year
	});

	// Redirect back into the main app; both the home and plan pages will now use
	// the stored tokens for this athlete.
	throw redirect(302, '/');
};
