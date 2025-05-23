/**
 * File to store date utility functions
 */

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
