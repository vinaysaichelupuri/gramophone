import { Song } from '@/types/song';
import { titleFromFilePath } from '@/utils/formatters';
import { isAudioFile, sortSongsByTitle } from '@/utils/music';
import { isExpoGoRuntime } from '@/utils/runtime';

const MAX_SCAN_DEPTH = 3;
type ReactNativeFsModule = {
  [key: string]: any;
};
type ReadDirEntry = {
  isDirectory: () => boolean;
  isFile: () => boolean;
  path: string;
};

let cachedRNFSModule: ReactNativeFsModule | null | undefined;
let songCache: Song[] | null = null;

function getRNFSModule(): ReactNativeFsModule | null {
  if (cachedRNFSModule !== undefined) {
    return cachedRNFSModule;
  }

  if (isExpoGoRuntime()) {
    cachedRNFSModule = null;
    return cachedRNFSModule;
  }

  try {
    const moduleValue = require('react-native-fs') as ReactNativeFsModule & {
      default?: ReactNativeFsModule;
    };
    cachedRNFSModule = Object.assign(moduleValue.default ?? {}, moduleValue);
  } catch {
    cachedRNFSModule = null;
  }

  return cachedRNFSModule;
}

export function isMusicLibraryModuleAvailable(): boolean {
  return getRNFSModule() !== null;
}

function normalizePath(filePath: string): string {
  return filePath.startsWith('file://') ? filePath.slice(7) : filePath;
}

function toSong(filePath: string): Song {
  return {
    id: normalizePath(filePath),
    title: titleFromFilePath(filePath),
    artist: 'Unknown Artist',
    duration: undefined,
    path: normalizePath(filePath),
  };
}

async function scanDirectory(
  rnfs: ReactNativeFsModule,
  directoryPath: string,
  depth: number,
  collector: Set<string>
) {
  if (depth > MAX_SCAN_DEPTH) {
    return;
  }

  let entries: ReadDirEntry[] = [];

  try {
    entries = await rnfs.readDir(directoryPath);
  } catch {
    return;
  }

  for (const entry of entries) {
    if (entry.isDirectory()) {
      await scanDirectory(rnfs, entry.path, depth + 1, collector);
      continue;
    }

    if (entry.isFile() && isAudioFile(entry.path)) {
      collector.add(normalizePath(entry.path));
    }
  }
}

export async function getLocalSongs(forceRefresh = false): Promise<Song[]> {
  if (songCache && !forceRefresh) {
    return songCache;
  }

  const rnfs = getRNFSModule();
  if (!rnfs) {
    throw new Error(
      'Filesystem module is unavailable. Use a native development build (expo run:android), not Expo Go.'
    );
  }

  const scanRoots = Array.from(new Set([
    `${rnfs.ExternalStorageDirectoryPath}/Music`,
    `${rnfs.ExternalStorageDirectoryPath}/Download`,
    rnfs.DownloadDirectoryPath,
  ].filter(Boolean)));

  const existingRoots: string[] = [];
  for (const rootPath of scanRoots) {
    try {
      const normalizedRoot = normalizePath(rootPath);
      if (await rnfs.exists(normalizedRoot) && !existingRoots.includes(normalizedRoot)) {
        existingRoots.push(normalizedRoot);
      }
    } catch {
      // Ignore inaccessible paths
    }
  }

  const discoveredFiles = new Set<string>();

  for (const rootPath of existingRoots) {
    await scanDirectory(rnfs, rootPath, 0, discoveredFiles);
  }

  const seenIds = new Set<string>();
  const uniqueSongs: Song[] = [];
  
  for (const file of discoveredFiles) {
    const song = toSong(file);
    if (!seenIds.has(song.id)) {
      seenIds.add(song.id);
      uniqueSongs.push(song);
    }
  }

  songCache = sortSongsByTitle(uniqueSongs);
  return songCache;
}
