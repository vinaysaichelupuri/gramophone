export function formatDuration(seconds?: number): string {
  if (!seconds || !Number.isFinite(seconds) || seconds <= 0) {
    return '--:--';
  }

  const rounded = Math.floor(seconds);
  const minutes = Math.floor(rounded / 60);
  const remainingSeconds = rounded % 60;

  return `${minutes}:${String(remainingSeconds).padStart(2, '0')}`;
}

export function titleFromFilePath(filePath: string): string {
  const normalizedPath = filePath.replace(/\\/g, '/');
  const nameWithExtension = normalizedPath.split('/').pop() ?? '';
  const lastDotIndex = nameWithExtension.lastIndexOf('.');
  const trimmedName =
    lastDotIndex > 0 ? nameWithExtension.slice(0, lastDotIndex) : nameWithExtension;

  return trimmedName.trim() || 'Unknown Title';
}
