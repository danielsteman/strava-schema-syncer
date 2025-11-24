import { Resource } from 'sst';
import process from 'node:process';
import pg from 'pg';

type Pool = ReturnType<typeof createPool>;

let pool: Pool | null = null;

function getConnectionString(): string {
	let conn: string | undefined;

	try {
		const r = Resource as unknown as {
			POSTGRES_CONNECTION_STRING?: { value: string };
		};
		conn = r.POSTGRES_CONNECTION_STRING?.value;
	} catch {
		// Resource may not be available in local non-SST contexts.
	}

	conn = conn ?? process.env.POSTGRES_CONNECTION_STRING;

	if (!conn) {
		throw new Error('Missing POSTGRES_CONNECTION_STRING environment/secret');
	}

	return conn;
}

function createPool() {
	return new pg.Pool({
		connectionString: getConnectionString()
	});
}

function getPool(): Pool {
	if (!pool) {
		pool = createPool();
	}
	return pool;
}

export type QueryResult<T> = {
	rows: T[];
};

export async function query<T = unknown>(
	text: string,
	params?: unknown[]
): Promise<QueryResult<T>> {
	const p = getPool();
	const res = await p.query(text, params);
	return { rows: res.rows as T[] };
}

let schemaEnsured = false;

export async function ensureSchema(): Promise<void> {
	if (schemaEnsured) return;

	const p = getPool();
	const client = await p.connect();
	try {
		await client.query('BEGIN');

		// Core tables for Telegram users and messages.
		await client.query(`
			CREATE TABLE IF NOT EXISTS users (
				id BIGSERIAL PRIMARY KEY,
				telegram_chat_id TEXT UNIQUE NOT NULL,
				strava_athlete_id TEXT,
				timezone TEXT,
				created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
				updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
			)
		`);

		await client.query(`
			CREATE TABLE IF NOT EXISTS messages (
				id BIGSERIAL PRIMARY KEY,
				user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
				role TEXT NOT NULL,
				source TEXT NOT NULL,
				content TEXT NOT NULL,
				created_at TIMESTAMPTZ NOT NULL DEFAULT now()
			)
		`);

		await client.query(`
			CREATE INDEX IF NOT EXISTS messages_user_created_at_idx
			ON messages (user_id, created_at DESC)
		`);

		// Optional RAG schema for WhatsApp chat history, backed by pgvector.
		// Note: this assumes the "vector" extension is available in the Neon database.
		await client.query(`
			CREATE EXTENSION IF NOT EXISTS vector
		`);

		await client.query(`
			CREATE TABLE IF NOT EXISTS whatsapp_chunks (
				id BIGSERIAL PRIMARY KEY,
				user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
				source TEXT NOT NULL DEFAULT 'whatsapp',
				chunk_index INT NOT NULL,
				text TEXT NOT NULL,
				start_timestamp TIMESTAMPTZ NOT NULL,
				end_timestamp TIMESTAMPTZ NOT NULL,
				metadata JSONB,
				embedding vector(768)
			)
		`);

		await client.query(`
			CREATE INDEX IF NOT EXISTS whatsapp_chunks_embedding_idx
			ON whatsapp_chunks
			USING ivfflat (embedding vector_cosine_ops)
			WITH (lists = 100)
		`);

		await client.query('COMMIT');
		schemaEnsured = true;
	} catch (err) {
		await client.query('ROLLBACK');
		throw err;
	} finally {
		client.release();
	}
}
