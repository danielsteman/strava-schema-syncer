import { Resource } from 'sst';
import process from 'node:process';

export type TelegramChatId = number | string;

export type TelegramMessageEntity = {
	offset: number;
	length: number;
	type: string;
};

export type TelegramMessage = {
	message_id: number;
	date: number;
	text?: string;
	chat: {
		id: TelegramChatId;
		type: 'private' | 'group' | 'supergroup' | 'channel';
		title?: string;
		username?: string;
		first_name?: string;
		last_name?: string;
	};
	from?: {
		id: number;
		is_bot: boolean;
		first_name?: string;
		last_name?: string;
		username?: string;
		language_code?: string;
	};
	entities?: TelegramMessageEntity[];
};

export type TelegramUpdate = {
	update_id: number;
	message?: TelegramMessage;
	edited_message?: TelegramMessage;
	callback_query?: {
		id: string;
		from: TelegramMessage['from'];
		message?: TelegramMessage;
		data?: string;
	};
};

export type SendMessageOptions = {
	parseMode?: 'MarkdownV2' | 'HTML';
	disableNotification?: boolean;
	replyToMessageId?: number;
};

type TelegramApiError = {
	ok: false;
	error_code: number;
	description?: string;
	parameters?: {
		retry_after?: number;
	};
};

type TelegramApiSuccess<T> = {
	ok: true;
	result: T;
};

type TelegramApiResponse<T> = TelegramApiSuccess<T> | TelegramApiError;

function getBotToken(): string {
	let token: string | undefined;

	try {
		// In deployed environments, SST injects the secret as a Resource.
		token = (Resource as any).TELEGRAM_BOT_TOKEN?.value as string | undefined;
	} catch {
		// Resource may not be available in local non-SST contexts.
	}

	token = token ?? process.env.TELEGRAM_BOT_TOKEN;

	if (!token) {
		throw new Error('Missing TELEGRAM_BOT_TOKEN environment/secret');
	}

	return token;
}

async function callTelegramApi<T>(
	method: string,
	body: Record<string, unknown>,
	attempt = 0
): Promise<T> {
	const token = getBotToken();
	const url = `https://api.telegram.org/bot${token}/${method}`;

	const res = await fetch(url, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(body)
	});

	const json = (await res.json()) as TelegramApiResponse<T>;

	if (!json.ok) {
		// Basic, safe retry on rate limits and transient 5xx errors.
		const status = res.status;
		const retryAfter =
			json.parameters?.retry_after && Number.isFinite(json.parameters.retry_after)
				? json.parameters.retry_after * 1000
				: undefined;

		if (attempt < 2 && (status === 429 || status >= 500)) {
			const delay = retryAfter ?? 500 * (attempt + 1);
			await new Promise((resolve) => setTimeout(resolve, delay));
			return callTelegramApi<T>(method, body, attempt + 1);
		}

		throw new Error(
			`Telegram API error for ${method}: ${json.error_code} ${
				json.description ?? 'Unknown error'
			}`
		);
	}

	return json.result;
}

export async function sendMessage(
	chatId: TelegramChatId,
	text: string,
	options?: SendMessageOptions
): Promise<TelegramMessage> {
	const payload: Record<string, unknown> = {
		chat_id: chatId,
		text
	};

	if (options?.parseMode) {
		payload.parse_mode = options.parseMode;
	}
	if (options?.disableNotification !== undefined) {
		payload.disable_notification = options.disableNotification;
	}
	if (options?.replyToMessageId !== undefined) {
		payload.reply_to_message_id = options.replyToMessageId;
	}

	return callTelegramApi<TelegramMessage>('sendMessage', payload);
}


