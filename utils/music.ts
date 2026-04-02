const AUDIO_EXTENSIONS = ['.mp3', '.m4a', '.aac', '.wav', '.flac', '.ogg'];

export function isAudioFile(filePath: string): boolean {
  const normalizedPath = filePath.toLowerCase();
  return AUDIO_EXTENSIONS.some((extension) => normalizedPath.endsWith(extension));
}

export function sortSongsByTitle<T extends { title: string }>(songs: T[]): T[] {
  return [...songs].sort((a, b) => a.title.localeCompare(b.title));
}
