import { ensureSchema, query } from '../lib/db.ts';
import { getActivitiesForPeriod } from '../lib/strava.ts';
import { buildSafObservations, computeSaf } from '../lib/caf.ts';

const MS_PER_DAY = 1000 * 60 * 60 * 24;

export type StravaCafEvent = {
	athleteId: string;
	horizonDays?: number;
};

export type StravaCafResult = {
	ok: boolean;
	message?: string;
	athleteId?: string;
	horizonDays?: number;
	observationCount?: number;
	cafBpm?: number;
	beta0?: number;
	beta1?: number;
	beta2?: number;
};

export async function handler(event: StravaCafEvent): Promise<StravaCafResult> {
	const { athleteId, horizonDays: horizonOverride } = event;

	if (!athleteId || typeof athleteId !== 'string') {
		return {
			ok: false,
			message: 'athleteId is required'
		};
	}

	const horizonDays = Number.isFinite(horizonOverride as number)
		? Math.max(1, Math.floor(horizonOverride as number))
		: 90;

	const now = new Date();
	const after = new Date(now.getTime() - horizonDays * MS_PER_DAY);

	await ensureSchema();

	const activitiesResult = await getActivitiesForPeriod({
		athleteId,
		after,
		before: now
	});

	if (activitiesResult.needsAuth) {
		return {
			ok: false,
			athleteId,
			horizonDays,
			message:
				activitiesResult.errorMessage ??
				'Authorization failed or no tokens are stored for this athlete.'
		};
	}

	if (activitiesResult.errorMessage) {
		return {
			ok: false,
			athleteId,
			horizonDays,
			message: activitiesResult.errorMessage
		};
	}

	const observations = buildSafObservations(activitiesResult.activities);

	if (observations.length === 0) {
		return {
			ok: false,
			athleteId,
			horizonDays,
			observationCount: 0,
			message:
				'No suitable activities with heart rate, distance, and moving time were found in the period.'
		};
	}

	const cafResult = computeSaf(observations, horizonDays);

	// Persist raw observation points (idempotent per athlete/activity).
	for (const obs of observations) {
		await query(
			`
			INSERT INTO strava_saf_points (
				athlete_id,
				activity_id,
				activity_date,
				t_days,
				avg_hr,
				speed_m_per_s
			)
			VALUES ($1, $2, $3, $4, $5, $6)
			ON CONFLICT (athlete_id, activity_id) DO UPDATE
			SET
				activity_date = EXCLUDED.activity_date,
				t_days = EXCLUDED.t_days,
				avg_hr = EXCLUDED.avg_hr,
				speed_m_per_s = EXCLUDED.speed_m_per_s
		`,
			[
				athleteId,
				obs.activityId,
				obs.activityDate.toISOString().slice(0, 10),
				obs.tDays,
				obs.avgHr,
				obs.speedMPerS
			]
		);
	}

	if (cafResult.kind !== 'success') {
		return {
			ok: false,
			athleteId,
			horizonDays,
			observationCount: cafResult.observationCount,
			message: cafResult.reason
		};
	}

	const { beta0, beta1, beta2, safBpm: cafBpm } = cafResult;

	await query(
		`
		INSERT INTO strava_saf_summaries (
			athlete_id,
			horizon_days,
			beta0,
			beta1,
			beta2,
			saf_bpm
		)
		VALUES ($1, $2, $3, $4, $5, $6)
	`,
		[athleteId, horizonDays, beta0, beta1, beta2, cafBpm]
	);

	return {
		ok: true,
		athleteId,
		horizonDays,
		observationCount: cafResult.observationCount,
		cafBpm,
		beta0,
		beta1,
		beta2
	};
}
