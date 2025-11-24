import { ensureSchema, query } from '$lib/db';

export type DbUser = {
	id: number;
	telegram_chat_id: string;
	strava_athlete_id: string | null;
	timezone: string | null;
	created_at: string;
	updated_at: string;
};

export type DbMessage = {
	id: number;
	user_id: number;
	role: string;
	source: string;
	content: string;
	created_at: string;
};

export async function getOrCreateUserByTelegramChatId(
	telegramChatId: string
): Promise<DbUser> {
	await ensureSchema();

	const existing = await query<DbUser>(
		`SELECT * FROM users WHERE telegram_chat_id = $1`,
		[telegramChatId]
	);

	if (existing.rows[0]) {
		return existing.rows[0];
	}

	const inserted = await query<DbUser>(
		`
			INSERT INTO users (telegram_chat_id)
			VALUES ($1)
			RETURNING *
		`,
		[telegramChatId]
	);

	return inserted.rows[0];
}

export async function insertMessage(params: {
	userId: number;
	role: 'user' | 'assistant' | 'system';
	source: 'telegram' | 'whatsapp' | 'coach' | 'other';
	content: string;
}): Promise<DbMessage> {
	await ensureSchema();

	const res = await query<DbMessage>(
		`
			INSERT INTO messages (user_id, role, source, content)
			VALUES ($1, $2, $3, $4)
			RETURNING *
		`,
		[params.userId, params.role, params.source, params.content]
	);

	return res.rows[0];
}


