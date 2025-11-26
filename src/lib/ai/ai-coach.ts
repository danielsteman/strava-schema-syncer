import { Resource } from 'sst';
import process from 'node:process';
import { getRecentActivities, type EnrichedActivity } from '$lib/strava/strava';

export type DailyCoachInput = {
	athleteId: string;
	timezone?: string | null;
	model?: string;
};

export type CoachMessage = {
	text: string;
	rawModelResponse?: unknown;
};

function getGeminiApiKey(): string {
	let apiKey: string | null | undefined;

	try {
		const value = (Resource as typeof Resource & { GEMINI_API_KEY?: { value: string } })
			.GEMINI_API_KEY?.value;
		apiKey = value;
	} catch {
		// Resource may not be available in local non-SST contexts.
	}

	apiKey = apiKey ?? process.env.GEMINI_API_KEY ?? null;

	if (!apiKey) {
		throw new Error('Missing GEMINI_API_KEY environment/secret');
	}

	return apiKey;
}

async function callGemini(prompt: string, modelOverride?: string): Promise<CoachMessage> {
	const apiKey = getGeminiApiKey();
	const model = modelOverride ?? process.env.GEMINI_MODEL ?? 'gemini-1.5-flash';

	const url = new URL(
		`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`
	);
	url.searchParams.set('key', apiKey);

	const res = await fetch(url, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			contents: [
				{
					role: 'user',
					parts: [{ text: prompt }]
				}
			]
		})
	});

	if (!res.ok) {
		const text = await res.text();
		throw new Error(`Gemini generateContent failed: ${res.status} ${text}`);
	}

	const json = (await res.json()) as {
		candidates?: {
			content?: {
				parts?: { text?: string }[];
			};
		}[];
	};

	const candidate = json.candidates?.[0];
	const partWithText = candidate?.content?.parts?.find((p) => typeof p.text === 'string');
	const text = partWithText?.text?.trim();

	if (!text) {
		return {
			text: 'I could not generate a coaching message right now, but keep up the great work and check back soon!',
			rawModelResponse: json
		};
	}

	return { text, rawModelResponse: json };
}

function summariseRecentRunning(activities: EnrichedActivity[], now: Date): string {
	const nowMs = now.getTime();
	const dayMs = 24 * 60 * 60 * 1000;

	const withDates = activities.map((a) => ({
		...a,
		date: new Date(a.start_date)
	}));

	const last7Days = withDates.filter((a) => nowMs - a.date.getTime() <= 7 * dayMs);
	const last30Days = withDates.filter((a) => nowMs - a.date.getTime() <= 30 * dayMs);

	const sumKm = (list: typeof withDates) => list.reduce((acc, a) => acc + a.distance / 1000, 0);

	const last7Km = sumKm(last7Days);
	const last30Km = sumKm(last30Days);

	const lastRun = withDates.toSorted((a, b) => b.date.getTime() - a.date.getTime())[0] as
		| (EnrichedActivity & { date: Date })
		| undefined;

	const longRuns = withDates
		.filter((a) => a.distance / 1000 >= 15)
		.toSorted((a, b) => b.distance - a.distance);
	const longest = longRuns[0];

	const fmtKm = (km: number) => km.toFixed(1);

	const bits: string[] = [];

	if (last7Days.length > 0) {
		bits.push(
			`In the last 7 days you ran ${fmtKm(last7Km)} km across ${last7Days.length} run${
				last7Days.length === 1 ? '' : 's'
			}.`
		);
	}

	if (last30Days.length > 0) {
		bits.push(
			`Over the last 30 days you ran ${fmtKm(last30Km)} km across ${last30Days.length} run${
				last30Days.length === 1 ? '' : 's'
			}.`
		);
	}

	if (lastRun) {
		bits.push(
			`Your most recent run was ${fmtKm(lastRun.distance / 1000)} km on ${lastRun.date.toDateString()} (${lastRun.name}).`
		);
	}

	if (longest) {
		bits.push(
			`Your longest recent run was ${fmtKm(longest.distance / 1000)} km (${longest.name}).`
		);
	}

	if (bits.length === 0) {
		return 'There are no recent runs yet.';
	}

	return bits.join(' ');
}

export async function generateDailyCoachMessage(input: DailyCoachInput): Promise<CoachMessage> {
	const now = new Date();
	const { athleteId, timezone, model } = input;

	const { activities, needsAuth, errorMessage } = await getRecentActivities(50, athleteId);

	if (needsAuth || !activities) {
		const fallbackText =
			'Hi! I tried to look at your recent Strava runs but your connection seems to be missing or expired. Please reconnect Strava in the web app so I can coach you based on your training data.';

		if (errorMessage) {
			return {
				text: `${fallbackText}\n\nDetails: ${errorMessage}`,
				rawModelResponse: null
			};
		}

		return { text: fallbackText, rawModelResponse: null };
	}

	const runs = activities.filter((a) => a.sport_type === 'Run');
	const summary = summariseRecentRunning(runs, now);

	const tzPart = timezone ? `The athlete's local timezone is ${timezone}.` : '';

	const prompt = `
You are an encouraging but honest running coach helping a marathon trainee.

You see the following short summary of their recent Strava runs:

${summary}

${tzPart}

Write a SHORT daily check-in message that:
- is 2–4 sentences
- is specific to the numbers above (distances, counts, recency)
- suggests one concrete focus for the next day or two
- avoids emojis and over-the-top hype
- assumes the runner is a motivated adult.

Reply with plain text only, no markdown.
`.trim();

	return callGemini(prompt, model);
}
