export type WhatsAppMessage = {
	timestamp: Date;
	author: string | null;
	text: string;
};

const LINE_RE =
	/^(\d{1,2}\/\d{1,2}\/\d{2,4}), (\d{1,2}:\d{2}) - (.*)$/;

/**
 * Parse a WhatsApp chat export `.txt` into structured messages.
 *
 * This handles the common export format where each new message starts with:
 * `dd/mm/yyyy, hh:mm - Name: Text`
 * and multi-line messages are represented as subsequent lines without a date prefix.
 */
export function parseWhatsAppExport(raw: string): WhatsAppMessage[] {
	const lines = raw.split(/\r?\n/);
	const messages: WhatsAppMessage[] = [];
	let current: WhatsAppMessage | null = null;

	for (const line of lines) {
		const match = LINE_RE.exec(line);

		if (match) {
			// Commit the previous message, if any.
			if (current) {
				messages.push(current);
			}

			const [, dateStr, timeStr, rest] = match;

			// We deliberately avoid locale-dependent parsing here and assume
			// the WhatsApp export uses day-first ordering as in most regions.
			// Example: "12/03/2024, 21:15 - Name: Text"
			const [day, month, year] = dateStr.split('/').map((v) => Number.parseInt(v, 10));
			const [hour, minute] = timeStr.split(':').map((v) => Number.parseInt(v, 10));
			// Normalise year to four digits if needed.
			const fullYear = year < 100 ? 2000 + year : year;
			const timestamp = new Date(Date.UTC(fullYear, month - 1, day, hour, minute));

			const colonIdx = rest.indexOf(':');
			let author: string | null = null;
			let text = rest;

			if (colonIdx !== -1) {
				author = rest.slice(0, colonIdx).trim() || null;
				text = rest.slice(colonIdx + 1).trim();
			}

			current = {
				timestamp,
				author,
				text
			};
		} else if (current) {
			// Continuation of the previous message (multi-line).
			current.text += `\n${line}`;
		}
	}

	if (current) {
		messages.push(current);
	}

	return messages;
}

export type WhatsAppChunk = {
	id: string;
	text: string;
	startTimestamp: Date;
	endTimestamp: Date;
};

/**
 * Group messages into contiguous chunks up to a maximum character budget.
 * This is useful for RAG where each chunk becomes a single embedding.
 */
export function chunkMessages(
	messages: WhatsAppMessage[],
	maxChars = 1500
): WhatsAppChunk[] {
	const chunks: WhatsAppChunk[] = [];
	let buffer = '';
	let startTs: Date | null = null;
	let lastTs: Date | null = null;
	let index = 0;

	for (const msg of messages) {
		const line = `[${msg.timestamp.toISOString()}] ${msg.author ?? 'System'}: ${msg.text}\n`;

		if (buffer && buffer.length + line.length > maxChars && startTs && lastTs) {
			chunks.push({
				id: `chunk-${index++}`,
				text: buffer.trim(),
				startTimestamp: startTs,
				endTimestamp: lastTs
			});
			buffer = '';
			startTs = null;
			lastTs = null;
		}

		if (!startTs) {
			startTs = msg.timestamp;
		}
		lastTs = msg.timestamp;
		buffer += line;
	}

	if (buffer && startTs && lastTs) {
		chunks.push({
			id: `chunk-${index++}`,
			text: buffer.trim(),
			startTimestamp: startTs,
			endTimestamp: lastTs
		});
	}

	return chunks;
}


