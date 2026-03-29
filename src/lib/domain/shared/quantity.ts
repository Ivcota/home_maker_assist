export type QuantityUnit = 'ml' | 'g' | 'count';

export interface Quantity {
	value: number;
	unit: QuantityUnit;
}

export type SubtractResult =
	| { status: 'sufficient' }
	| { status: 'deficit'; quantity: Quantity };

function assertSameUnit(a: Quantity, b: Quantity): void {
	if (a.unit !== b.unit) {
		throw new Error(
			`Unit mismatch: cannot operate on '${a.unit}' and '${b.unit}'`
		);
	}
}

export function subtract(have: Quantity, need: Quantity): SubtractResult {
	assertSameUnit(have, need);
	if (have.value >= need.value) {
		return { status: 'sufficient' };
	}
	return { status: 'deficit', quantity: { value: need.value - have.value, unit: have.unit } };
}

export function isEnough(have: Quantity, need: Quantity): boolean {
	assertSameUnit(have, need);
	return have.value >= need.value;
}

export function sum(items: Quantity[]): Quantity {
	if (items.length === 0) {
		throw new Error('Cannot sum an empty list of quantities');
	}
	const unit = items[0].unit;
	for (const item of items) {
		if (item.unit !== unit) {
			throw new Error(
				`Unit mismatch in sum: expected '${unit}', got '${item.unit}'`
			);
		}
	}
	return { value: items.reduce((acc, q) => acc + q.value, 0), unit };
}
