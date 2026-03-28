import { describe, it, expect } from 'vitest';
import { getExpirationStatus, EXPIRING_SOON_THRESHOLD_DAYS } from './expiration.js';

const daysFromNow = (days: number, now = new Date()) =>
	new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

describe('getExpirationStatus', () => {
	const now = new Date('2026-01-15T12:00:00Z');

	it('returns "fresh" when expiration is far in the future', () => {
		expect(getExpirationStatus(daysFromNow(10, now), now)).toBe('fresh');
	});

	it('returns "fresh" when expiration is just past the threshold', () => {
		expect(
			getExpirationStatus(daysFromNow(EXPIRING_SOON_THRESHOLD_DAYS + 0.01, now), now)
		).toBe('fresh');
	});

	it('returns "expiring-soon" when expiration is exactly at the threshold', () => {
		expect(
			getExpirationStatus(daysFromNow(EXPIRING_SOON_THRESHOLD_DAYS, now), now)
		).toBe('expiring-soon');
	});

	it('returns "expiring-soon" when expiration is within threshold days', () => {
		expect(getExpirationStatus(daysFromNow(1, now), now)).toBe('expiring-soon');
	});

	it('returns "expiring-soon" when expiration is today (0 days)', () => {
		expect(getExpirationStatus(daysFromNow(0, now), now)).toBe('expiring-soon');
	});

	it('returns "expired" when expiration is in the past', () => {
		expect(getExpirationStatus(daysFromNow(-1, now), now)).toBe('expired');
	});

	it('returns "expired" when expiration is long past', () => {
		expect(getExpirationStatus(daysFromNow(-30, now), now)).toBe('expired');
	});
});
