import { describe, expect, it } from 'vitest';
import { removeScanParam } from './scan-utils.js';

describe('removeScanParam', () => {
	it('removes ?scan=receipt from the URL', () => {
		const result = removeScanParam('http://localhost/inventory?scan=receipt');
		expect(new URL(result).searchParams.has('scan')).toBe(false);
	});

	it('removes ?scan=food from the URL', () => {
		const result = removeScanParam('http://localhost/inventory?scan=food');
		expect(new URL(result).searchParams.has('scan')).toBe(false);
	});

	it('preserves other URL params when clearing scan', () => {
		const result = removeScanParam('http://localhost/inventory?scan=receipt&tab=pantry');
		const url = new URL(result);
		expect(url.searchParams.has('scan')).toBe(false);
		expect(url.searchParams.get('tab')).toBe('pantry');
	});
});
