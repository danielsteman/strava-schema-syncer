import { STRAVA_CLIENT_ID, STRAVA_CLIENT_SECRET, STRAVA_REFRESH_TOKEN } from '$env/static/private';

// Minimal shape for the activities we care about from Strava's /athlete/activities endpoint.
// Reference: https://developers.strava.com/docs/reference/#api-Activities-getLoggedInAthleteActivities
export type StravaActivity = {
	id: number;
	name: string;
	distance: number;
	moving_time: number;
	elapsed_time: number;
	sport_type: string;
	start_date: string;
};

export type ActivitiesResult = {
	activities: StravaActivity[] | null;
	needsAuth: boolean;
	errorMessage?: string;
};

type StravaRefreshResponse = {
	access_token: string;
	expires_at: number;
	expires_in: number;
	refresh_token: string;
	token_type: string;
};

// We keep the latest tokens in memory so we don't need a database.
// .env values seed the first tokens when the server starts.
let currentAccessToken: string | null = null;
let currentRefreshToken: string | null = STRAVA_REFRESH_TOKEN ?? null;
let accessTokenExpiresAt: number | null = null;

// Optionally refresh the access token using the stored refresh token.
// Docs: https://developers.strava.com/docs/authentication/
async function refreshAccessToken(): Promise<string> {
	// Seed from env on first use if needed
	if (!currentRefreshToken && STRAVA_REFRESH_TOKEN) {
		currentRefreshToken = STRAVA_REFRESH_TOKEN;
	}

	if (!STRAVA_CLIENT_ID || !STRAVA_CLIENT_SECRET || !currentRefreshToken) {
		throw new Error('Missing Strava client credentials or refresh token');
	}

	const body = new URLSearchParams({
		client_id: STRAVA_CLIENT_ID,
		client_secret: STRAVA_CLIENT_SECRET,
		grant_type: 'refresh_token',
		refresh_token: currentRefreshToken
	});

	const res = await fetch('https://www.strava.com/oauth/token', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded'
		},
		body
	});

	if (!res.ok) {
		const text = await res.text();
		throw new Error(`Failed to refresh Strava access token: ${text}`);
	}

	const json = (await res.json()) as StravaRefreshResponse;

	// NOTE: Strava returns a new refresh_token each time and invalidates the old one.
	// We keep it in memory so subsequent requests use the latest value.
	currentAccessToken = json.access_token;
	currentRefreshToken = json.refresh_token;
	accessTokenExpiresAt = json.expires_at;

	console.info('[strava] New refresh token received (in-memory). Update .env if you restart:', json.refresh_token);

	return currentAccessToken;
}

async function getAccessToken(): Promise<string> {
	const now = Math.floor(Date.now() / 1000);

	// If we have a non-expired access token in memory, use it.
	if (currentAccessToken && accessTokenExpiresAt && accessTokenExpiresAt - 60 > now) {
		return currentAccessToken;
	}

	// Prefer using the refresh token flow whenever we have one.
	if (currentRefreshToken || STRAVA_REFRESH_TOKEN) {
		return refreshAccessToken();
	}

	throw new Error('Missing Strava client credentials or tokens');
}

export async function getRecentActivities(limit = 20): Promise<ActivitiesResult> {
	try {
		const accessToken = await getAccessToken();

		const url = new URL('https://www.strava.com/api/v3/athlete/activities');
		url.searchParams.set('per_page', String(limit));

		const res = await fetch(url, {
			headers: {
				Authorization: `Bearer ${accessToken}`
			}
		});

		if (res.status === 401 || res.status === 403) {
			return {
				activities: null,
				needsAuth: true,
				errorMessage:
					'Strava authorization failed or expired. Please re-authorize via the Connect Strava button.'
			};
		}

		if (!res.ok) {
			const text = await res.text();
			return {
				activities: null,
				needsAuth: false,
				errorMessage: `Failed to fetch activities from Strava: ${text}`
			};
		}

		const data = (await res.json()) as StravaActivity[];

		return {
			activities: data,
			needsAuth: false
		};
	} catch (err) {
		const message = err instanceof Error ? err.message : 'Unknown error';

		if (message.toLowerCase().includes('missing strava client credentials')) {
			return {
				activities: null,
				needsAuth: true,
				errorMessage:
					'Strava credentials are not configured. Set STRAVA_CLIENT_ID, STRAVA_CLIENT_SECRET and STRAVA_ACCESS_TOKEN or STRAVA_REFRESH_TOKEN in your .env.'
			};
		}

		return {
			activities: null,
			needsAuth: false,
			errorMessage: message
		};
	}
}


