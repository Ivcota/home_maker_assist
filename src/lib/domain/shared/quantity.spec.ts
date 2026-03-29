import { describe, it, expect } from 'vitest';
import { subtract, isEnough, sum } from './quantity.js';
import type { Quantity } from './quantity.js';

const ml = (value: number): Quantity => ({ value, unit: 'ml' });
const g = (value: number): Quantity => ({ value, unit: 'g' });
const count = (value: number): Quantity => ({ value, unit: 'count' });

describe('subtract', () => {
	it('returns sufficient when have equals need', () => {
		expect(subtract(ml(500), ml(500))).toEqual({ status: 'sufficient' });
	});

	it('returns sufficient when have exceeds need', () => {
		expect(subtract(ml(600), ml(400))).toEqual({ status: 'sufficient' });
	});

	it('returns deficit when have is less than need', () => {
		expect(subtract(ml(200), ml(500))).toEqual({ status: 'deficit', quantity: ml(300) });
	});

	it('returns sufficient for zero need', () => {
		expect(subtract(ml(0), ml(0))).toEqual({ status: 'sufficient' });
	});

	it('returns deficit when have is zero and need is positive', () => {
		expect(subtract(ml(0), ml(100))).toEqual({ status: 'deficit', quantity: ml(100) });
	});

	it('works with grams', () => {
		expect(subtract(g(100), g(300))).toEqual({ status: 'deficit', quantity: g(200) });
	});

	it('works with count', () => {
		expect(subtract(count(3), count(1))).toEqual({ status: 'sufficient' });
	});

	it('throws on unit mismatch', () => {
		expect(() => subtract(ml(100), g(100))).toThrow();
	});

	it('throws on unit mismatch (count vs ml)', () => {
		expect(() => subtract(count(1), ml(250))).toThrow();
	});
});

describe('isEnough', () => {
	it('returns true when have equals need', () => {
		expect(isEnough(g(500), g(500))).toBe(true);
	});

	it('returns true when have exceeds need', () => {
		expect(isEnough(g(1000), g(500))).toBe(true);
	});

	it('returns false when have is less than need', () => {
		expect(isEnough(g(200), g(500))).toBe(false);
	});

	it('returns true for zero need', () => {
		expect(isEnough(g(0), g(0))).toBe(true);
	});

	it('throws on unit mismatch', () => {
		expect(() => isEnough(ml(100), g(100))).toThrow();
	});
});

describe('sum', () => {
	it('sums a single quantity', () => {
		expect(sum([ml(100)])).toEqual(ml(100));
	});

	it('sums multiple quantities of the same unit', () => {
		expect(sum([ml(100), ml(200), ml(50)])).toEqual(ml(350));
	});

	it('sums count quantities', () => {
		expect(sum([count(2), count(3)])).toEqual(count(5));
	});

	it('handles zero values', () => {
		expect(sum([g(0), g(0)])).toEqual(g(0));
	});

	it('throws on mixed units', () => {
		expect(() => sum([ml(100), g(200)])).toThrow();
	});

	it('throws on mixed units in larger array', () => {
		expect(() => sum([count(1), count(2), ml(100)])).toThrow();
	});
});
