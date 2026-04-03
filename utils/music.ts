const AUDIO_EXTENSIONS = ['.mp3', '.m4a', '.aac', '.wav', '.flac', '.ogg', '.mp4', '.m4b', '.amr', '.3gp', '.opus', '.mid', '.midi', '.alac', '.aiff', '.wma', '.caf', '.3g2'];

export function isAudioFile(filePath: string): boolean {
  const normalizedPath = filePath.toLowerCase();
  return AUDIO_EXTENSIONS.some((extension) => normalizedPath.endsWith(extension));
}

export function sortSongsByTitle<T extends { title: string }>(songs: T[]): T[] {
  return [...songs].sort((a, b) => a.title.localeCompare(b.title));
}
