import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
	DynamoDBDocumentClient,
	GetCommand,
	PutCommand,
	ScanCommand
} from '@aws-sdk/lib-dynamodb';

export type TelegramUserRow = {
	telegramChatId: string;
	athleteId?: string | null;
	timezone?: string | null;
	preferredSendHour?: number | null;
	lastDailySentAt?: string | null;
	createdAt: string;
	updatedAt: string;
};

const TELEGRAM_USERS_TABLE_NAME = process.env.TELEGRAM_USERS_TABLE_NAME;
const hasTable = Boolean(TELEGRAM_USERS_TABLE_NAME);

let docClient: DynamoDBDocumentClient | null = null;

function getDocClient(): DynamoDBDocumentClient {
	if (!docClient) {
		const client = new DynamoDBClient({});
		docClient = DynamoDBDocumentClient.from(client);
	}
	return docClient;
}

export async function getTelegramUser(
	telegramChatId: string
): Promise<TelegramUserRow | null> {
	if (!hasTable) return null;

	const client = getDocClient();
	const res = await client.send(
		new GetCommand({
			TableName: TELEGRAM_USERS_TABLE_NAME,
			Key: { telegramChatId }
		})
	);

	return (res.Item as TelegramUserRow | undefined) ?? null;
}

export async function putTelegramUser(row: TelegramUserRow): Promise<void> {
	if (!hasTable) return;

	const client = getDocClient();
	await client.send(
		new PutCommand({
			TableName: TELEGRAM_USERS_TABLE_NAME,
			Item: row
		})
	);
}

export async function upsertTelegramUser(
	partial: Omit<TelegramUserRow, 'createdAt' | 'updatedAt'> & {
		createdAt?: string;
		updatedAt?: string;
	}
): Promise<TelegramUserRow> {
	const existing = await getTelegramUser(partial.telegramChatId);
	const nowIso = new Date().toISOString();

	const merged: TelegramUserRow = {
		telegramChatId: partial.telegramChatId,
		athleteId: partial.athleteId ?? existing?.athleteId ?? null,
		timezone: partial.timezone ?? existing?.timezone ?? null,
		preferredSendHour:
			partial.preferredSendHour ?? existing?.preferredSendHour ?? 8,
		lastDailySentAt: partial.lastDailySentAt ?? existing?.lastDailySentAt ?? null,
		createdAt: existing?.createdAt ?? partial.createdAt ?? nowIso,
		updatedAt: partial.updatedAt ?? nowIso
	};

	await putTelegramUser(merged);
	return merged;
}

export async function listTelegramUsers(): Promise<TelegramUserRow[]> {
	if (!hasTable) return [];

	const client = getDocClient();
	const res = await client.send(
		new ScanCommand({
			TableName: TELEGRAM_USERS_TABLE_NAME
		})
	);

	return (res.Items as TelegramUserRow[] | undefined) ?? [];
}


