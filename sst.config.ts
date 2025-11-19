/// <reference path="./.sst/platform/config.d.ts" />

export default $config({
	app(input) {
		return {
			name: 'strava-schema-syncer',
			removal: input?.stage === 'production' ? 'retain' : 'remove',
			protect: ['production'].includes(input?.stage),
			home: 'aws'
		};
	},
	// deno-lint-ignore require-await
	async run() {
		const STRAVA_CLIENT_ID = new sst.Secret('STRAVA_CLIENT_ID');
		const STRAVA_CLIENT_SECRET = new sst.Secret('STRAVA_CLIENT_SECRET');
		const STRAVA_REFRESH_TOKEN = new sst.Secret('STRAVA_REFRESH_TOKEN');

		new sst.aws.SvelteKit('StravaSchemaSyncer', {
			link: [STRAVA_CLIENT_ID, STRAVA_CLIENT_SECRET, STRAVA_REFRESH_TOKEN]
		});
	}
});
