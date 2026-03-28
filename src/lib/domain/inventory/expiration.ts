export type ExpirationStatus = 'fresh' | 'expiring-soon' | 'expired';

export const EXPIRING_SOON_THRESHOLD_DAYS = 3;

export function getExpirationStatus(
	expirationDate: Date,
	now: Date = new Date()
): ExpirationStatus {
	const msPerDay = 24 * 60 * 60 * 1000;
	const daysUntilExpiry = (expirationDate.getTime() - now.getTime()) / msPerDay;

	if (daysUntilExpiry < 0) {
		return 'expired';
	}
	if (daysUntilExpiry <= EXPIRING_SOON_THRESHOLD_DAYS) {
		return 'expiring-soon';
	}
	return 'fresh';
}
