import { Resource } from 'sst';
import process from 'node:process';

function getGeminiApiKey(): string {
	let apiKey: string | undefined;

	try {
		apiKey = (Resource as any).GEMINI_API_KEY?.value as string | undefined;
	} catch {
		// Resource may not be available in local non-SST contexts.
	}

	apiKey = apiKey ?? process.env.GEMINI_API_KEY;

	if (!apiKey) {
		throw new Error('Missing GEMINI_API_KEY environment/secret');
	}

	return apiKey;
}

/**
 * Call Gemini's text embedding API (text-embedding-004) for one or more texts.
 *
 * Returns an array of embeddings where each embedding is a number[].
 * The current dimensionality for text-embedding-004 is 768.
 */
export async function embedTexts(texts: string[]): Promise<number[][]> {
	if (texts.length === 0) return [];

	const apiKey = getGeminiApiKey();
	const url = new URL(
		'https://generativelanguage.googleapis.com/v1/models/text-embedding-004:embedContent'
	);
	url.searchParams.set('key', apiKey);

	const body = {
		requests: texts.map((text) => ({
			model: 'models/text-embedding-004',
			content: {
				parts: [{ text }]
			}
		}))
	};

	const res = await fetch(url, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(body)
	});

	if (!res.ok) {
		const errText = await res.text();
		throw new Error(`Gemini embeddings failed: ${res.status} ${errText}`);
	}

	const json = (await res.json()) as {
		responses?: { embedding?: { values?: number[] } }[];
	};

	const responses = json.responses ?? [];

	if (responses.length !== texts.length) {
		throw new Error(
			`Gemini embeddings: response length ${responses.length} does not match texts length ${texts.length}`
		);
	}

	return responses.map((r, idx) => {
		const values = r.embedding?.values;
		if (!values || values.length === 0) {
			throw new Error(`Gemini embeddings: missing embedding for index ${idx}`);
		}
		return values;
	});
}


