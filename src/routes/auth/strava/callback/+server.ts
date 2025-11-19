import type { RequestHandler } from '@sveltejs/kit';
import { STRAVA_CLIENT_ID, STRAVA_CLIENT_SECRET } from '$env/static/private';

type StravaTokenResponse = {
	token_type: string;
	access_token: string;
	expires_at: number;
	expires_in: number;
	refresh_token: string;
	athlete?: unknown;
};

// Handles the OAuth callback from Strava and exchanges the authorization code for tokens.
// Docs: https://developers.strava.com/docs/authentication/
export const GET: RequestHandler = async ({ url }) => {
	const error = url.searchParams.get('error');
	if (error) {
		return new Response(`Strava authorization error: ${error}`, { status: 400 });
	}

	const code = url.searchParams.get('code');
	if (!code) {
		return new Response('Missing authorization code from Strava', { status: 400 });
	}

	if (!STRAVA_CLIENT_ID || !STRAVA_CLIENT_SECRET) {
		return new Response('Strava client credentials are not configured on the server', {
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

	const html = `
		<!doctype html>
		<html lang="en">
			<head>
				<meta charset="utf-8" />
				<title>Strava Connected</title>
				<meta name="viewport" content="width=device-width, initial-scale=1" />
				<style>
					body { font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; padding: 2rem; max-width: 720px; margin: 0 auto; background: #0f172a; color: #e5e7eb; }
					code { background: #020617; padding: 0.25rem 0.4rem; border-radius: 0.25rem; font-size: 0.9rem; word-break: break-all; }
					pre { background: #020617; padding: 1rem; border-radius: 0.5rem; overflow-x: auto; }
					a { color: #38bdf8; }
					.section { margin-bottom: 1.75rem; }
					.badge { display: inline-block; padding: 0.15rem 0.5rem; border-radius: 999px; background: #22c55e1a; color: #22c55e; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em; }
				</style>
			</head>
			<body>
				<h1>Strava authorization successful</h1>
				<p class="section">
					Your app has received tokens from Strava. For this single-user setup, you should update your
					<code>.env</code> with the <strong>refresh token</strong> below so the app can refresh access tokens as needed.
				</p>

				<div class="section">
					<div class="badge">Copy this into .env</div>
					<pre>STRAVA_REFRESH_TOKEN=${tokenJson.refresh_token}</pre>
				</div>

				<div class="section">
					<h2>Token details</h2>
					<ul>
						<li><strong>Access token expires in:</strong> ${tokenJson.expires_in} seconds</li>
						<li><strong>Access token expires at (epoch seconds):</strong> ${tokenJson.expires_at}</li>
					</ul>
				</div>

				<div class="section">
					<a href="/">Back to homepage</a>
				</div>
			</body>
		</html>
	`;

	return new Response(html, {
		status: 200,
		headers: {
			'Content-Type': 'text/html; charset=utf-8'
		}
	});
};
