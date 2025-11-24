import type { RequestHandler } from './$types';
import { json } from '@sveltejs/kit';
import type { TelegramUpdate } from '$lib/telegram';
import { sendMessage } from '$lib/telegram';
import { upsertTelegramUser } from '$lib/telegram-users';
import { getOrCreateUserByTelegramChatId, insertMessage } from '$lib/messages';
import { generateDailyCoachMessage } from '$lib/ai-coach';

const START_COMMAND = '/start';

export const POST: RequestHandler = async ({ request }) => {
	const update = (await request.json()) as TelegramUpdate;

	const message =
		update.message ?? update.edited_message ?? update.callback_query?.message;

	if (!message || !message.chat || message.chat.type === 'channel') {
		return json({ ok: true });
	}

	const chatId = message.chat.id;
	const text = message.text ?? '';

	// Minimal upsert into Dynamo per chat so the cron knows this chat exists.
	await upsertTelegramUser({
		telegramChatId: String(chatId)
	});

	// Persist the message in Neon for future RAG/analytics.
	const dbUser = await getOrCreateUserByTelegramChatId(String(chatId));

	if (text) {
		await insertMessage({
			userId: dbUser.id,
			role: 'user',
			source: 'telegram',
			content: text
		});
	}

	if (text.startsWith(START_COMMAND)) {
		const welcome =
			'Hey, I am your Strava-based running coach.\n\n' +
			'1. Connect your Strava account in the web app.\n' +
			'2. I will send you one short coaching message per day based on your recent training.\n' +
			'3. You can also ask me questions about your training here.';

		await sendMessage(chatId, welcome);

		return json({ ok: true });
	}

	// For now, treat any free-form message as a coaching question.
	try {
		const athleteId = dbUser.strava_athlete_id ?? undefined;

		const coachMessage = athleteId
			? await generateDailyCoachMessage({
					athleteId,
					timezone: dbUser.timezone ?? undefined
				})
			: {
					text:
						'I can answer questions best once your Strava account is connected. Please connect Strava in the web app, then ask again.'
				};

		await sendMessage(chatId, coachMessage.text);

		await insertMessage({
			userId: dbUser.id,
			role: 'assistant',
			source: 'coach',
			content: coachMessage.text
		});
	} catch (err) {
		console.error('Error handling Telegram message', err);
		await sendMessage(
			chatId,
			"Something went wrong while generating a response. Please try again in a moment."
		);
	}

	return json({ ok: true });
};


