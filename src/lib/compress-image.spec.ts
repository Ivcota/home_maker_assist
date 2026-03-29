import { describe, it, expect } from 'vitest';
import { computeScaledDimensions } from './compress-image.js';

describe('computeScaledDimensions', () => {
	const MB = 1024 * 1024;

	it('scales down proportionally when file exceeds max bytes', () => {
		const result = computeScaledDimensions(4000, 3000, 8 * MB, 4 * MB);

		expect(result.width).toBeLessThan(4000);
		expect(result.height).toBeLessThan(3000);
		expect(result.width / result.height).toBeCloseTo(4000 / 3000, 1);
	});

	it('returns original dimensions when file is at max bytes', () => {
		const result = computeScaledDimensions(4000, 3000, 4 * MB, 4 * MB);

		expect(result).toEqual({ width: 4000, height: 3000 });
	});

	it('returns original dimensions when file is under max bytes', () => {
		const result = computeScaledDimensions(1920, 1080, 2 * MB, 4 * MB);

		expect(result).toEqual({ width: 1920, height: 1080 });
	});

	it('scales by sqrt of size ratio to reduce both dimensions', () => {
		// 16 MB file with 4 MB limit → sqrt(4/16) = 0.5 scale factor
		const result = computeScaledDimensions(4000, 2000, 16 * MB, 4 * MB);

		expect(result).toEqual({ width: 2000, height: 1000 });
	});

	it('handles non-power-of-two ratios', () => {
		// 10 MB file with 4 MB limit → sqrt(4/10) ≈ 0.6325
		const result = computeScaledDimensions(1000, 500, 10 * MB, 4 * MB);

		expect(result.width).toBe(Math.round(1000 * Math.sqrt(4 / 10)));
		expect(result.height).toBe(Math.round(500 * Math.sqrt(4 / 10)));
	});
});
