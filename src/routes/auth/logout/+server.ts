import { redirect, type RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ cookies, url }) => {
	const isHttps = url.protocol === 'https:';

	cookies.set('strava_athlete_id', '', {
		path: '/',
		httpOnly: true,
		secure: isHttps,
		sameSite: 'lax',
		maxAge: 0
	});

	throw redirect(302, '/');
};

