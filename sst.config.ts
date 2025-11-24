/// <reference path="./.sst/platform/config.d.ts" />
export default $config({
	app(input) {
		return {
			name: 'cut-through-the-traffic',
			removal: input?.stage === 'production' ? 'retain' : 'remove',
			protect: ['production'].includes(input?.stage),
			home: 'aws',
			providers: {
				aws: true,
				cloudflare: { version: '6.11.0' }
			}
		};
	},
	// deno-lint-ignore require-await
	async run() {
		const STRAVA_CLIENT_ID = new sst.Secret('STRAVA_CLIENT_ID');
		const STRAVA_CLIENT_SECRET = new sst.Secret('STRAVA_CLIENT_SECRET');
		const TELEGRAM_BOT_TOKEN = new sst.Secret('TELEGRAM_BOT_TOKEN');
		const GEMINI_API_KEY = new sst.Secret('GEMINI_API_KEY');
		const POSTGRES_CONNECTION_STRING = new sst.Secret('POSTGRES_CONNECTION_STRING');

		// Legacy single-user secret; kept for backwards compatibility while
		// we transition to multi-user token storage.
		const STRAVA_REFRESH_TOKEN = new sst.Secret('STRAVA_REFRESH_TOKEN');

		// Stores Strava OAuth tokens per athlete (multi-user).
		// Note: DynamoDB itself is schemaless. The `fields` here only need to
		// describe attributes used in indexes; the rest of the item shape is
		// handled at runtime.
		const StravaTokensTable = new sst.aws.Dynamo('StravaTokensTable', {
			fields: {
				athleteId: 'string'
			},
			primaryIndex: { hashKey: 'athleteId' }
		});

		// Stores Telegram chat metadata and daily-coach preferences per user.
		const TelegramUsersTable = new sst.aws.Dynamo('TelegramUsersTable', {
			fields: {
				telegramChatId: 'string'
			},
			primaryIndex: { hashKey: 'telegramChatId' }
		});

		const isProd = $app.stage === 'production';

		new sst.aws.SvelteKit('CutThroughTheTraffic', {
			...(isProd && {
				domain: {
					name: 'running.danielsteman.com',
					dns: sst.cloudflare.dns()
				}
			}),
			link: [
				STRAVA_CLIENT_ID,
				STRAVA_CLIENT_SECRET,
				STRAVA_REFRESH_TOKEN,
				StravaTokensTable,
				TelegramUsersTable,
				TELEGRAM_BOT_TOKEN,
				GEMINI_API_KEY,
				POSTGRES_CONNECTION_STRING
			],
			environment: {
				STRAVA_TOKENS_TABLE_NAME: StravaTokensTable.name,
				TELEGRAM_USERS_TABLE_NAME: TelegramUsersTable.name
			}
		});

		// Cron job that drives the daily Telegram AI coach messages.
		new sst.aws.Cron('TelegramDailyCoachCron', {
			schedule: 'rate(15 minutes)',
			job: {
				handler: 'src/functions/telegram-daily-cron.handler',
				link: [
					STRAVA_CLIENT_ID,
					STRAVA_CLIENT_SECRET,
					STRAVA_REFRESH_TOKEN,
					StravaTokensTable,
					TelegramUsersTable,
					TELEGRAM_BOT_TOKEN,
					GEMINI_API_KEY,
					POSTGRES_CONNECTION_STRING
				],
				environment: {
					STRAVA_TOKENS_TABLE_NAME: StravaTokensTable.name,
					TELEGRAM_USERS_TABLE_NAME: TelegramUsersTable.name
				}
			}
		});
	}
});
