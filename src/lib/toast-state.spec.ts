import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createToastState } from './toast-state.svelte.js';

describe('toast-state', () => {
	beforeEach(() => {
		vi.useFakeTimers();
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	describe('showScanErrorToast', () => {
		it('creates an error toast with a retry action that auto-dismisses after 5s', () => {
			expect.assertions(6);
			const state = createToastState();
			const retry = vi.fn();

			state.showScanErrorToast("Couldn't extract any items from this image.", retry);

			expect(state.toasts.length).toBe(1);
			const toast = state.toasts[0];
			expect(toast.message).toBe("Couldn't extract any items from this image.");
			expect(toast.variant).toBe('error');
			expect(toast.action).toBeDefined();
			expect(toast.action!.label).toBe('Try again');
			expect(toast.dismissable).toBe(true);
		});
	});

	describe('showScanningToast', () => {
		it('creates a non-dismissable info toast that does not auto-dismiss', () => {
			expect.assertions(4);
			const state = createToastState();

			state.showScanningToast();

			expect(state.toasts.length).toBe(1);
			const toast = state.toasts[0];
			expect(toast.variant).toBe('info');
			expect(toast.dismissable).toBe(false);

			// Should still be there after 10s
			vi.advanceTimersByTime(10_000);
			expect(state.toasts.length).toBe(1);
		});
	});

	describe('dismissToast', () => {
		it('removes the toast and cancels its auto-dismiss timer', () => {
			expect.assertions(2);
			const state = createToastState();
			const clearSpy = vi.spyOn(globalThis, 'clearTimeout');

			state.showScanErrorToast('fail', vi.fn());
			const toastId = state.toasts[0].id;

			state.dismissToast(toastId);

			expect(state.toasts.length).toBe(0);
			expect(clearSpy).toHaveBeenCalled();
		});
	});

	describe('scanning toast replacement', () => {
		it('replaces existing scanning toast instead of duplicating', () => {
			expect.assertions(2);
			const state = createToastState();

			state.showScanningToast('Scanning receipt...');
			state.showScanningToast('Scanning food photo...');

			expect(state.toasts.length).toBe(1);
			expect(state.toasts[0].message).toBe('Scanning food photo...');
		});
	});

	describe('error toast retry', () => {
		it('invoking the action calls the retry callback and dismisses the toast', () => {
			expect.assertions(2);
			const state = createToastState();
			const retry = vi.fn();

			state.showScanErrorToast('fail', retry);
			const toast = state.toasts[0];

			state.invokeAction(toast.id);

			expect(retry).toHaveBeenCalledOnce();
			expect(state.toasts.length).toBe(0);
		});
	});
});
