import type { HistoryService } from '$lib/types/ApiWrapper';

export function splitHistoryByDate(entries: HistoryService[]) {
	const today = new Date();
	const yesterday = new Date();
	today.setHours(0, 0, 0, 0);
	yesterday.setDate(today.getDate() - 1);
	yesterday.setHours(0, 0, 0, 0);

	const result = {
		today: [] as HistoryService[],
		yesterday: [] as HistoryService[],
		week: [] as HistoryService[]
	};

	for (const entry of entries) {
		const entryDate = new Date(entry.createdAt);
		const entryDateOnly = new Date(entryDate);
		entryDateOnly.setHours(0, 0, 0, 0);

		if (entryDateOnly.getTime() === today.getTime()) {
			result.today.push(entry);
		} else if (entryDateOnly.getTime() === yesterday.getTime()) {
			result.yesterday.push(entry);
		} else {
			result.week.push(entry);
		}
	}

	return result;
}
