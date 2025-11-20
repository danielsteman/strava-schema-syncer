import { STRAVA_CLIENT_ID, STRAVA_CLIENT_SECRET, STRAVA_REFRESH_TOKEN } from '$env/static/private';
import { getTokensForAthlete, putTokensForAthlete } from './strava-tokens.ts';

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
	// Optional heart rate summary fields that Strava includes when available.
	has_heartrate?: boolean;
	average_heartrate?: number;
	max_heartrate?: number;
};

export type HeartRateBin = {
	label: string;
	percentage: number;
};

export type HeartRateStats = {
	min: number;
	max: number;
	avg: number;
	p25: number;
	p50: number;
	p75: number;
	sampleCount: number;
	bins: HeartRateBin[];
};

export type EnrichedActivity = StravaActivity & {
	heartRateStats?: HeartRateStats | null;
};

export type ActivitiesResult = {
	activities: EnrichedActivity[] | null;
	needsAuth: boolean;
	errorMessage?: string;
};

type StravaRefreshResponse = {
	access_token: string;
	expires_at: number;
	expires_in: number;
	refresh_token: string;
	token_type: string;
	scope?: string;
};

// Multi-user token handling:
// - When an athlete has connected via the OAuth flow, their tokens are stored
//   in DynamoDB via `strava-tokens.ts`.
// - For backwards compatibility, we fall back to the legacy single-user
//   refresh-token-from-.env behaviour when no athlete ID is available.

// Refresh the access token for a specific athlete using the stored refresh token.
// Docs: https://developers.strava.com/docs/authentication/
async function refreshAccessTokenForAthlete(athleteId: string): Promise<string> {
	const existing = await getTokensForAthlete(athleteId);

	if (!STRAVA_CLIENT_ID || !STRAVA_CLIENT_SECRET || !existing?.refreshToken) {
		throw new Error('Missing Strava client credentials or stored refresh token');
	}

	const body = new URLSearchParams({
		client_id: STRAVA_CLIENT_ID,
		client_secret: STRAVA_CLIENT_SECRET,
		grant_type: 'refresh_token',
		refresh_token: existing.refreshToken
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

	const nowIso = new Date().toISOString();

	await putTokensForAthlete({
		athleteId,
		accessToken: json.access_token,
		refreshToken: json.refresh_token,
		expiresAt: json.expires_at,
		athleteFirstName: existing.athleteFirstName,
		scope: json.scope ?? existing.scope,
		createdAt: existing.createdAt ?? nowIso,
		updatedAt: nowIso
	});

	return json.access_token;
}

async function getAccessToken(athleteId?: string): Promise<string> {
	// Multi-user path: look up the current athlete's tokens in Dynamo.
	if (athleteId) {
		const existing = await getTokensForAthlete(athleteId);

		if (!existing) {
			throw new Error('No stored Strava tokens for the current athlete');
		}

		const now = Math.floor(Date.now() / 1000);
		const isExpired = existing.expiresAt - 60 <= now;

		if (!isExpired) {
			return existing.accessToken;
		}

		return refreshAccessTokenForAthlete(athleteId);
	}

	// No athlete selected in this browser – treat as \"not connected\".
	throw new Error('No stored Strava tokens for the current athlete');

	// Legacy single-user behaviour (disabled now that we support multi-user):
	// use the refresh token from .env and keep tokens in memory for the
	// lifetime of the process. If you want to re-enable this, move the early
	// throw above behind an explicit feature flag.
	// tokens in memory for the lifetime of the process.
	let currentAccessToken: string | null = null;
	let currentRefreshToken: string | null = STRAVA_REFRESH_TOKEN ?? null;
	let accessTokenExpiresAt: number | null = null;

	const now = Math.floor(Date.now() / 1000);

	if (currentAccessToken && accessTokenExpiresAt && accessTokenExpiresAt - 60 > now) {
		return currentAccessToken;
	}

	if (!STRAVA_CLIENT_ID || !STRAVA_CLIENT_SECRET || !currentRefreshToken) {
		throw new Error('Missing Strava client credentials or tokens');
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

	currentAccessToken = json.access_token;
	currentRefreshToken = json.refresh_token;
	accessTokenExpiresAt = json.expires_at;

	return currentAccessToken;
}

async function fetchHeartRateStatsForActivity(
	activity: StravaActivity,
	accessToken: string
): Promise<HeartRateStats | null> {
	// Only attempt when Strava says the activity has heart rate data.
	if (!activity.has_heartrate) return null;

	const res = await fetch(
		`https://www.strava.com/api/v3/activities/${activity.id}/streams?keys=heartrate&key_by_type=true`,
		{
			headers: {
				Authorization: `Bearer ${accessToken}`
			}
		}
	);

	if (!res.ok) {
		// Silently ignore per-activity failures – we still want to show the activity itself.
		return null;
	}

	const json = (await res.json()) as
		| {
				heartrate?: {
					data?: number[];
				};
		  }
		| {
				data?: number[];
		  }[]
		| null;

	let samples: number[] | undefined;

	// Handle both key_by_type=true (object) and array formats defensively.
	if (json && !Array.isArray(json) && 'heartrate' in json && json.heartrate?.data) {
		samples = json.heartrate.data;
	} else if (Array.isArray(json)) {
		const hrStream = json.find(
			(s: { type?: string; data?: number[] }) => s.type === 'heartrate' && Array.isArray(s.data)
		);
		samples = hrStream?.data;
	}

	if (!samples || samples.length === 0) {
		return null;
	}

	const sorted = [...samples].sort((a, b) => a - b);
	const n = sorted.length;

	const percentile = (p: number) => {
		if (n === 0) return NaN;
		const idx = (p / 100) * (n - 1);
		const lower = Math.floor(idx);
		const upper = Math.ceil(idx);
		if (lower === upper) return sorted[lower];
		const weight = idx - lower;
		return sorted[lower] * (1 - weight) + sorted[upper] * weight;
	};

	const min = sorted[0];
	const max = sorted[n - 1];
	const avg = samples.reduce((acc, v) => acc + v, 0) / n;
	const p25 = percentile(25);
	const p50 = percentile(50);
	const p75 = percentile(75);

	// Build a simple histogram with 5 bins across [min, max].
	const binCount = 5;
	const range = max - min || 1;
	const binSize = range / binCount;
	const counts = new Array<number>(binCount).fill(0);

	for (const hr of samples) {
		let idx = Math.floor((hr - min) / binSize);
		if (idx < 0) idx = 0;
		if (idx >= binCount) idx = binCount - 1;
		counts[idx]++;
	}

	const bins: HeartRateBin[] = counts.map((count, i) => {
		const from = Math.round(min + i * binSize);
		const to = Math.round(i === binCount - 1 ? max : min + (i + 1) * binSize);
		return {
			label: `${from}–${to} bpm`,
			percentage: n > 0 ? (count / n) * 100 : 0
		};
	});

	return {
		min,
		max,
		avg,
		p25,
		p50,
		p75,
		sampleCount: n,
		bins
	};
}

export async function getRecentActivities(
	limit = 20,
	athleteId?: string
): Promise<ActivitiesResult> {
	try {
		const accessToken = await getAccessToken(athleteId);

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

		// Enrich activities with heart rate distributions when available.
		const activitiesWithHr: EnrichedActivity[] = await Promise.all(
			data.map(async (activity) => {
				try {
					const heartRateStats = await fetchHeartRateStatsForActivity(activity, accessToken);
					return { ...activity, heartRateStats };
				} catch {
					return { ...activity, heartRateStats: null };
				}
			})
		);

		return {
			activities: activitiesWithHr,
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

		if (message.toLowerCase().includes('no stored strava tokens')) {
			return {
				activities: null,
				needsAuth: true,
				errorMessage:
					'No Strava tokens found for the current athlete. Click Connect Strava to authorize access.'
			};
		}

		return {
			activities: null,
			needsAuth: false,
			errorMessage: message
		};
	}
}
