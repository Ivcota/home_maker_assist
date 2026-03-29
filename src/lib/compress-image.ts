const DEFAULT_MAX_BYTES = 4 * 1024 * 1024;

export function computeScaledDimensions(
	originalWidth: number,
	originalHeight: number,
	fileSize: number,
	maxBytes: number
): { width: number; height: number } {
	const scale = Math.min(1, Math.sqrt(maxBytes / fileSize));
	return {
		width: Math.round(originalWidth * scale),
		height: Math.round(originalHeight * scale)
	};
}

export async function compressImage(
	file: File,
	maxBytes = DEFAULT_MAX_BYTES
): Promise<File> {
	if (file.size <= maxBytes) return file;

	const bitmap = await createImageBitmap(file);
	const { width, height } = computeScaledDimensions(
		bitmap.width,
		bitmap.height,
		file.size,
		maxBytes
	);

	const canvas = new OffscreenCanvas(width, height);
	const ctx = canvas.getContext('2d')!;
	ctx.drawImage(bitmap, 0, 0, width, height);
	bitmap.close();

	const blob = await canvas.convertToBlob({ type: 'image/jpeg', quality: 0.8 });
	return new File([blob], file.name, { type: 'image/jpeg' });
}
