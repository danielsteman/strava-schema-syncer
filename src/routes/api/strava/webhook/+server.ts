import type { RequestHandler } from './$types';
import { json } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import { handler as runSaf } from '../../../../functions/strava-saf.ts';

type StravaWebhookEvent = {
	object_type: string;
	aspect_type: string;
	owner_id: number;
	object_id: number;
	subscription_id?: number;
	event_time?: number;
};

export const GET: RequestHandler = async ({ url }) => {
	const mode = url.searchParams.get('hub.mode');
	const token = url.searchParams.get('hub.verify_token');
	const challenge = url.searchParams.get('hub.challenge');

	const expectedToken = env.STRAVA_WEBHOOK_VERIFY_TOKEN;

	if (mode === 'subscribe' && token && challenge && token === expectedToken) {
		return json({ 'hub.challenge': challenge });
	}

	return new Response('Forbidden', { status: 403 });
};

export const POST: RequestHandler = async ({ request }) => {
	const payload = (await request.json()) as StravaWebhookEvent | StravaWebhookEvent[];
	const events = Array.isArray(payload) ? payload : [payload];

	for (const event of events) {
		if (event.object_type === 'activity' && event.aspect_type === 'create') {
			const athleteId = String(event.owner_id);

			// Fire the SAF calculation for this athlete. We await it so errors are visible
			// in logs; if this becomes too slow, we can move to a queue/async pattern.
			try {
				await runSaf({ athleteId });
			} catch (err) {
				console.error('Error running SAF calculation from Strava webhook', {
					err,
					athleteId,
					event
				});
			}
		}
	}

	return json({ ok: true });
};
