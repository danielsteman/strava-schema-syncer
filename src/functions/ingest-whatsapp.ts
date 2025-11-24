import fs from 'node:fs/promises';
import path from 'node:path';
import { ensureSchema, query } from '../lib/db.ts';
import { embedTexts } from '../lib/gemini-embeddings.ts';
import { chunkMessages, parseWhatsAppExport } from '../lib/whatsapp.ts';

async function main(): Promise<void> {
	const filePath = process.argv[2];

	if (!filePath) {
		// eslint-disable-next-line no-console
		console.error('Usage: deno run -A src/functions/ingest-whatsapp.ts /path/to/chat.txt');
		process.exit(1);
	}

	await ensureSchema();

	const absolutePath = path.resolve(filePath);
	const raw = await fs.readFile(absolutePath, 'utf8');
	const messages = parseWhatsAppExport(raw);
	const chunks = chunkMessages(messages, 1500);

	if (chunks.length === 0) {
		// eslint-disable-next-line no-console
		console.log('No messages found in WhatsApp export; nothing to ingest.');
		return;
	}

	// For now we keep user_id nullable; you can optionally wire this up to an
	// existing Telegram user row or a future multi-user identity.
	const userId: number | null = null;

	const texts = chunks.map((c) => c.text);
	const embeddings = await embedTexts(texts);

	if (embeddings.length !== chunks.length) {
		throw new Error(
			`Embedding count ${embeddings.length} does not match chunk count ${chunks.length}`
		);
	}

	for (let i = 0; i < chunks.length; i += 1) {
		const chunk = chunks[i];
		const embedding = embeddings[i];

		await query(
			`
			INSERT INTO whatsapp_chunks (
				user_id,
				source,
				chunk_index,
				text,
				start_timestamp,
				end_timestamp,
				metadata,
				embedding
			)
			VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
		`,
			[
				userId,
				'whatsapp',
				i,
				chunk.text,
				chunk.startTimestamp.toISOString(),
				chunk.endTimestamp.toISOString(),
				JSON.stringify({ chatFile: path.basename(absolutePath) }),
				embedding
			]
		);
	}

	// eslint-disable-next-line no-console
	console.log(`Ingested ${chunks.length} WhatsApp chunks from ${absolutePath}`);
}

void main();
