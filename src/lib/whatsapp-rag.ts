import { query } from '$lib/db';
import { embedTexts } from '$lib/gemini-embeddings';

export type WhatsappChunkRow = {
	id: number;
	user_id: number | null;
	source: string;
	chunk_index: number;
	text: string;
	start_timestamp: string;
	end_timestamp: string;
	metadata: unknown;
};

/**
 * Retrieve the most relevant WhatsApp chunks for a given question by
 * embedding the question with Gemini and running a pgvector similarity search.
 *
 * Optionally filter by user_id if you want per-user isolation.
 */
export async function retrieveRelevantWhatsappChunks(params: {
	question: string;
	limit?: number;
	userId?: number;
}): Promise<WhatsappChunkRow[]> {
	const { question, limit = 10, userId } = params;
	const [embedding] = await embedTexts([question]);

	const values: unknown[] = [embedding, limit];
	let whereClause = '';

	if (typeof userId === 'number') {
		whereClause = 'WHERE user_id = $3';
		values.push(userId);
	}

	const res = await query<WhatsappChunkRow>(
		`
		SELECT
			id,
			user_id,
			source,
			chunk_index,
			text,
			start_timestamp,
			end_timestamp,
			metadata
		FROM whatsapp_chunks
		${whereClause}
		ORDER BY embedding <-> $1
		LIMIT $2
	`,
		values
	);

	return res.rows;
}


