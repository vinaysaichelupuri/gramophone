import { Song } from '@/types/song';
import { titleFromFilePath } from '@/utils/formatters';
import { isAudioFile, sortSongsByTitle } from '@/utils/music';
import { isExpoGoRuntime } from '@/utils/runtime';
import { getAudioMetadata } from '@missingcore/audio-metadata';

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
let isExtractingMetadata = false;

// --- Subscriptions ---
const libraryListeners = new Set<(songs: Song[]) => void>();

export function subscribeToLibraryUpdates(fn: (songs: Song[]) => void): () => void {
  libraryListeners.add(fn);
  return () => libraryListeners.delete(fn);
}

function notifyLibraryListeners() {
  if (songCache) {
    libraryListeners.forEach((fn) => fn(songCache!));
  }
}

export async function extractMetadataForSongs() {
  if (isExtractingMetadata || !songCache) return;
  isExtractingMetadata = true;
  
  let hasChanges = false;
  const wantedTags = ['artist', 'album', 'name', 'year'] as const;

  for (let i = 0; i < songCache.length; i++) {
    const song = songCache[i];
    if (song.artist !== 'Unknown Artist' || song.album) continue;

    try {
      const uri = `file://${song.path}`;
      const data = await getAudioMetadata(uri, wantedTags);
      const meta = data.metadata;
      
      let updated = false;
      if (meta?.artist) { song.artist = meta.artist; updated = true; }
      if (meta?.album) { song.album = meta.album; updated = true; }
      if (meta?.name) { song.title = meta.name; updated = true; }
      if (meta?.year) { song.year = String(meta.year); updated = true; }
      
      if (updated) {
        hasChanges = true;
        if (hasChanges && i % 5 === 0) {
          songCache = [...songCache]; // trigger react state updates
          notifyLibraryListeners();
          hasChanges = false;
        }
      }
    } catch {
      // ignore
    }
  }

  if (hasChanges) {
    songCache = [...songCache];
    notifyLibraryListeners();
  }
  isExtractingMetadata = false;
}

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

  const scanRoots = [
    `${rnfs.ExternalStorageDirectoryPath}/Music`,
    `${rnfs.ExternalStorageDirectoryPath}/Download`,
    rnfs.DownloadDirectoryPath,
  ].filter(Boolean);

  const existingRoots: string[] = [];
  for (const rootPath of scanRoots) {
    try {
      if (await rnfs.exists(rootPath)) {
        existingRoots.push(rootPath);
      }
    } catch {
      // Ignore inaccessible paths so scanning can continue for other roots.
    }
  }

  const discoveredFiles = new Set<string>();

  for (const rootPath of existingRoots) {
    await scanDirectory(rnfs, rootPath, 0, discoveredFiles);
  }

  const discoveredSongs = Array.from(discoveredFiles).map(toSong);
  songCache = sortSongsByTitle(discoveredSongs);
  
  // start background extraction without awaiting
  extractMetadataForSongs();
  
  return songCache;
}
