/** Returns a copy of the given href with the `scan` search param removed. */
export function removeScanParam(href: string): string {
	const url = new URL(href);
	url.searchParams.delete('scan');
	return url.toString();
}

/** Removes the `?scan=` URL parameter in-place using history.replaceState. */
export function clearScanParam(): void {
	history.replaceState(history.state, '', removeScanParam(window.location.href));
}
