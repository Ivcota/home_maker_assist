export type ToastAction = { label: string; callback: () => void };

export type Toast<T = unknown> = {
	id: number;
	message: string;
	variant: 'info' | 'error';
	action?: ToastAction;
	dismissable: boolean;
	timeoutId?: ReturnType<typeof setTimeout>;
	data?: T;
};

export function createToastState() {
	let nextId = 0;
	let toasts = $state<Toast[]>([]);

	function showToast(message: string, opts?: { action?: ToastAction; data?: unknown; timeoutMs?: number }) {
		const id = nextId++;
		const timeoutId = setTimeout(() => dismissToast(id), opts?.timeoutMs ?? 5000);
		toasts.push({
			id,
			message,
			variant: 'info',
			action: opts?.action,
			dismissable: true,
			timeoutId,
			data: opts?.data
		});
		return id;
	}

	function showScanErrorToast(message: string, retry: () => void) {
		const id = nextId++;
		const timeoutId = setTimeout(() => dismissToast(id), 5000);
		toasts.push({
			id,
			message,
			variant: 'error',
			action: { label: 'Try again', callback: retry },
			dismissable: true,
			timeoutId
		});
	}

	function dismissToast(id: number) {
		const idx = toasts.findIndex((t) => t.id === id);
		if (idx !== -1) {
			const toast = toasts[idx];
			if (toast.timeoutId) clearTimeout(toast.timeoutId);
			toasts.splice(idx, 1);
		}
	}

	function showScanningToast(message = 'Scanning...') {
		// Replace any existing scanning toast
		const existing = toasts.findIndex((t) => !t.dismissable);
		if (existing !== -1) toasts.splice(existing, 1);

		const id = nextId++;
		toasts.push({
			id,
			message,
			variant: 'info',
			dismissable: false
		});
		return id;
	}

	function invokeAction(id: number) {
		const toast = toasts.find((t) => t.id === id);
		if (toast?.action) {
			toast.action.callback();
			dismissToast(id);
		}
	}

	return {
		get toasts() {
			return toasts;
		},
		showToast,
		showScanErrorToast,
		showScanningToast,
		dismissToast,
		invokeAction
	};
}
