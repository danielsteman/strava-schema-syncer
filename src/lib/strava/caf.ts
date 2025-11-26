import type { StravaActivity } from '$lib/strava/strava';

export type SafObservation = {
	activityId: number;
	activityDate: Date;
	tDays: number;
	avgHr: number;
	speedMPerS: number;
};

export type SafSuccessResult = {
	kind: 'success';
	beta0: number;
	beta1: number;
	beta2: number;
	safBpm: number;
	horizonDays: number;
	observationCount: number;
};

export type SafFailureResult = {
	kind: 'insufficient_data';
	reason: string;
	horizonDays: number;
	observationCount: number;
};

export type SafResult = SafSuccessResult | SafFailureResult;

/**
 * Build SAF regression observations from Strava activities.
 * - Filters to activities with distance, moving_time and average_heartrate.
 * - Sorts by date and computes elapsed days since the first activity.
 */
export function buildSafObservations(activities: StravaActivity[]): SafObservation[] {
	const valid = activities.filter(
		(a) =>
			typeof a.distance === 'number' &&
			a.distance > 0 &&
			typeof a.moving_time === 'number' &&
			a.moving_time > 0 &&
			typeof a.average_heartrate === 'number' &&
			Number.isFinite(a.average_heartrate)
	);

	if (valid.length === 0) return [];

	const sorted = [...valid].sort(
		(a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime()
	);

	const firstDate = new Date(sorted[0]?.start_date ?? 0);
	const msPerDay = 1000 * 60 * 60 * 24;

	return sorted.map((activity) => {
		const activityDate = new Date(activity.start_date);
		const tDays = (activityDate.getTime() - firstDate.getTime()) / msPerDay;
		const speedMPerS = activity.distance / activity.moving_time;
		const avgHr = activity.average_heartrate as number;

		return {
			activityId: activity.id,
			activityDate,
			tDays,
			avgHr,
			speedMPerS
		};
	});
}

function invert3x3(matrix: number[][]): number[][] | null {
	if (matrix.length !== 3 || matrix.some((row) => row.length !== 3)) {
		throw new Error('invert3x3 expects a 3x3 matrix');
	}

	const [
		[a, b, c],
		[d, e, f],
		[g, h, i]
	] = matrix;

	const det =
		a * (e * i - f * h) - b * (d * i - f * g) + c * (d * h - e * g);

	if (!Number.isFinite(det) || Math.abs(det) < 1e-12) {
		return null;
	}

	const invDet = 1 / det;

	const adjugate = [
		[e * i - f * h, c * h - b * i, b * f - c * e],
		[f * g - d * i, a * i - c * g, c * d - a * f],
		[d * h - e * g, b * g - a * h, a * e - b * d]
	];

	return adjugate.map((row) => row.map((v) => v * invDet));
}

/**
 * Compute OLS coefficients for y = beta0 + beta1 * t + beta2 * hr.
 */
function solveOlsCoefficients(
	observations: SafObservation[]
): { beta0: number; beta1: number; beta2: number } | null {
	const n = observations.length;
	if (n < 3) return null;

	const xtx = [
		[0, 0, 0],
		[0, 0, 0],
		[0, 0, 0]
	];
	const xty = [0, 0, 0];

	for (const obs of observations) {
		const x = [1, obs.tDays, obs.avgHr];
		const y = obs.speedMPerS;

		for (let i = 0; i < 3; i += 1) {
			xty[i] += x[i] * y;
			for (let j = 0; j < 3; j += 1) {
				xtx[i][j] += x[i] * x[j];
			}
		}
	}

	const invXtx = invert3x3(xtx);
	if (!invXtx) return null;

	const beta = [
		invXtx[0][0] * xty[0] + invXtx[0][1] * xty[1] + invXtx[0][2] * xty[2],
		invXtx[1][0] * xty[0] + invXtx[1][1] * xty[1] + invXtx[1][2] * xty[2],
		invXtx[2][0] * xty[0] + invXtx[2][1] * xty[1] + invXtx[2][2] * xty[2]
	];

	if (!beta.every((v) => Number.isFinite(v))) {
		return null;
	}

	const [beta0, beta1, beta2] = beta;
	return { beta0, beta1, beta2 };
}

/**
 * Compute the C3T Aerobic Fitness (CAF) coefficient for a given horizon.
 *
 * SAF_T = (beta1 * T) / beta2
 */
export function computeSaf(
	observations: SafObservation[],
	horizonDays: number
): SafResult {
	const observationCount = observations.length;

	if (observationCount < 3) {
		return {
			kind: 'insufficient_data',
			reason: 'At least 3 observations are required for the regression model.',
			horizonDays,
			observationCount
		};
	}

	const coeffs = solveOlsCoefficients(observations);

	if (!coeffs) {
		return {
			kind: 'insufficient_data',
			reason: 'Regression matrix was singular or coefficients were not finite.',
			horizonDays,
			observationCount
		};
	}

	const { beta0, beta1, beta2 } = coeffs;

	if (!Number.isFinite(beta2) || Math.abs(beta2) < 1e-9) {
		return {
			kind: 'insufficient_data',
			reason: 'Heart-rate coefficient beta2 is too close to zero for a stable SAF.',
			horizonDays,
			observationCount
		};
	}

	const safBpm = (beta1 * horizonDays) / beta2;

	if (!Number.isFinite(safBpm)) {
		return {
			kind: 'insufficient_data',
			reason: 'Computed SAF value was not finite.',
			horizonDays,
			observationCount
		};
	}

	return {
		kind: 'success',
		beta0,
		beta1,
		beta2,
		safBpm,
		horizonDays,
		observationCount
	};
}


