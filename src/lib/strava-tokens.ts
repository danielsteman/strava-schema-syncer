import { env } from '$env/dynamic/private';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand, PutCommand } from '@aws-sdk/lib-dynamodb';

type StravaTokenRow = {
	athleteId: string;
	accessToken: string;
	refreshToken: string;
	expiresAt: number;
	scope: string;
	createdAt: string;
	updatedAt: string;
};

const STRAVA_TOKENS_TABLE_NAME = env.STRAVA_TOKENS_TABLE_NAME;
const hasTable = Boolean(STRAVA_TOKENS_TABLE_NAME);

// Lazy singleton client; only created when we actually need Dynamo.
let docClient: DynamoDBDocumentClient | null = null;

function getDocClient(): DynamoDBDocumentClient {
	if (!docClient) {
		const client = new DynamoDBClient({});
		docClient = DynamoDBDocumentClient.from(client);
	}
	return docClient;
}

export async function getTokensForAthlete(athleteId: string): Promise<StravaTokenRow | null> {
	if (!hasTable) return null;

	const client = getDocClient();
	const res = await client.send(
		new GetCommand({
			TableName: STRAVA_TOKENS_TABLE_NAME,
			Key: { athleteId }
		})
	);

	return (res.Item as StravaTokenRow | undefined) ?? null;
}

export async function putTokensForAthlete(row: StravaTokenRow): Promise<void> {
	if (!hasTable) return;

	const client = getDocClient();
	await client.send(
		new PutCommand({
			TableName: STRAVA_TOKENS_TABLE_NAME,
			Item: row
		})
	);
}
