import { listTelegramUsers } from '$lib/messaging/telegram-users';
import { generateDailyCoachMessage } from '$lib/ai/ai-coach';
import { sendMessage } from '$lib/messaging/telegram';

function getLocalDateParts(
	timezone: string | null | undefined,
	now: Date
): { hour: number; dateKey: string } {
	const tz = timezone || 'UTC';

	const formatter = new Intl.DateTimeFormat('en-CA', {
		timeZone: tz,
		year: 'numeric',
		month: '2-digit',
		day: '2-digit',
		hour: '2-digit',
		hour12: false
	});

	const parts = formatter.formatToParts(now);

	const year = parts.find((p) => p.type === 'year')?.value ?? '1970';
	const month = parts.find((p) => p.type === 'month')?.value ?? '01';
	const day = parts.find((p) => p.type === 'day')?.value ?? '01';
	const hourStr = parts.find((p) => p.type === 'hour')?.value ?? '00';

	const hour = Number.parseInt(hourStr, 10);
	const dateKey = `${year}-${month}-${day}`;

	return { hour, dateKey };
}

export async function handler(): Promise<void> {
	const now = new Date();
	const users = await listTelegramUsers();

	for (const user of users) {
		const { telegramChatId, athleteId, timezone, preferredSendHour, lastDailySentAt } =
			user;

		// We can only coach when a Strava athlete has been linked.
		if (!athleteId) continue;

		const { hour, dateKey } = getLocalDateParts(timezone, now);
		const targetHour = preferredSendHour ?? 8;

		if (hour < targetHour) continue;
		if (lastDailySentAt === dateKey) continue;

		try {
			const coachMessage = await generateDailyCoachMessage({
				athleteId,
				timezone
			});

			await sendMessage(telegramChatId, coachMessage.text);

			// Best-effort update: we don't block the loop on failures here.
			const updated = {
				...user,
				lastDailySentAt: dateKey,
				updatedAt: now.toISOString()
			};
			// Inline import to avoid circular deps in some bundlers.
			const { putTelegramUser } = await import('$lib/messaging/telegram-users');
			// eslint-disable-next-line @typescript-eslint/no-floating-promises
			putTelegramUser(updated);
		} catch (err) {
			console.error(
				'Failed to send daily coach message to Telegram chat',
				telegramChatId,
				err
			);
		}
	}
}


