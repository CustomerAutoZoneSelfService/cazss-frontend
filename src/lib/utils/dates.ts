/**
 * File to store date utility functions, here we all the functions that are related to date formatting
 * and manipulation.
 */

import type { HistoryService } from '$lib/types/ApiWrapper';

/**
 * @param datetime
 * @returns A formatted date string in the format "dd MMM, HH:mm"
 */
export function formatDateHistoryCards(datetime: string) {
	const date = new Date(datetime);
	return date.toLocaleString('es-MX', {
		day: '2-digit',
		month: 'short',
		hour: '2-digit',
		minute: '2-digit',
		hour12: false
	});
}

/**
 * Check if two dates are on the same day.
 * @param date1 The first date to compare.
 * @param date2 The second date to compare.
 * @returns True if the dates are on the same day, false otherwise.
 */

export function sameDay(date1: Date, date2: Date) {
	return (
		date1.getDate() === date2.getDate() &&
		date1.getMonth() === date2.getMonth() &&
		date1.getFullYear() === date2.getFullYear()
	);
}

/**
 * Split history entries into groups (today, yesterday, previous ones) by date.
 * @param entries The history entries to split.
 * @returns An object containing the split history entries.
 */
export function splitHistoryByDate(entries: HistoryService[]) {
	const today = new Date();
	const yesterday = new Date();
	const sevenDaysAgo = new Date();

	today.setHours(0, 0, 0, 0);
	yesterday.setDate(today.getDate() - 1);
	yesterday.setHours(0, 0, 0, 0);
	sevenDaysAgo.setDate(today.getDate() - 6);
	sevenDaysAgo.setHours(0, 0, 0, 0);

	const result = {
		today: [] as HistoryService[],
		yesterday: [] as HistoryService[],
		week: [] as HistoryService[]
	};

	for (const entry of entries) {
		const entryDate = new Date(entry.createdAt);
		entryDate.setHours(0, 0, 0, 0);

		if (sameDay(entryDate, today)) {
			result.today.push(entry);
		} else if (sameDay(entryDate, yesterday)) {
			result.yesterday.push(entry);
		} else {
			result.week.push(entry);
		}
	}

	return result;
}
