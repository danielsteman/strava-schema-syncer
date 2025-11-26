import { Resource } from 'sst';
import process from 'node:process';

function getGeminiApiKey(): string {
	let apiKey: string | undefined;

	try {
		const r = Resource as unknown as {
			GEMINI_API_KEY?: { value: string };
		};
		apiKey = r.GEMINI_API_KEY?.value;
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
		'https://generativelanguage.googleapis.com/v1/models/text-embedding-004:batchEmbedContents'
	);
	url.searchParams.set('key', apiKey);

	const allEmbeddings: number[][] = [];
	const maxBatchSize = 100;

	for (let start = 0; start < texts.length; start += maxBatchSize) {
		const batch = texts.slice(start, start + maxBatchSize);

		const body = {
			requests: batch.map((text) => ({
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
			embeddings?: { values?: number[] }[];
		};

		const embeddings = json.embeddings ?? [];

		if (embeddings.length !== batch.length) {
			throw new Error(
				`Gemini embeddings: response length ${
					embeddings.length
				} does not match batch length ${batch.length}`
			);
		}

		for (let i = 0; i < embeddings.length; i += 1) {
			const e = embeddings[i];
			const values = e.values;
			if (!values || values.length === 0) {
				throw new Error(`Gemini embeddings: missing embedding for index ${start + i}`);
			}
			allEmbeddings.push(values);
		}
	}

	return allEmbeddings;
}
