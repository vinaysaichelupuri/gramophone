/**
 * libraryStore.ts
 * In-memory store for liked songs and albums.
 * Persisted to a JSON file via react-native-fs so data survives app restarts.
 */

import RNFS from 'react-native-fs';
import { Song } from '@/types/song';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Album {
  id: string;
  name: string;
  songIds: string[];
  createdAt: number;
  isSystem?: boolean;
  systemType?: string;
}

export interface LibraryData {
  likedSongIds: string[];
  albums: Album[];
}

function normalizeGroupKey(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, ' ');
}

function isIgnoredFolderName(folderName: string): boolean {
  const normalized = folderName.trim().toLowerCase();
  if (!normalized) return true;

  const ignored = new Set([
    'music',
    'download',
    'downloads',
    'audio',
    'songs',
    'storage',
    'emulated',
    '0',
    'android',
    'media',
  ]);
  if (ignored.has(normalized)) return true;

  // Skip technical folders like bitrate/quality buckets.
  if (/^\d+\s?kbps$/.test(normalized)) return true;
  if (/^\d{3,4}p$/.test(normalized)) return true;
  if (/^(www\.)?[\w-]+\.(com|co|in|net|org)$/.test(normalized)) return true;
  if (/(songsmp3|naasongs|sensongs|masstamilan|djmaza)/.test(normalized)) return true;

  return false;
}

function getBestFolderGroupName(filePath: string): string | null {
  const normalized = filePath.replace(/\\/g, '/');
  const parts = normalized.split('/').filter(Boolean);
  if (parts.length < 2) return null;

  // Try closest folders first (parent, then parent's parent, etc.)
  for (let i = parts.length - 2; i >= 0; i--) {
    const candidate = parts[i]?.trim();
    if (!candidate) continue;
    if (isIgnoredFolderName(candidate)) continue;
    return candidate;
  }

  return null;
}

// ─── Persistence ──────────────────────────────────────────────────────────────

const DATA_PATH = `${RNFS.DocumentDirectoryPath}/gramophone_library.json`;

let store: LibraryData = { likedSongIds: [], albums: [] };
let loaded = false;
const listeners = new Set<() => void>();

function notifyListeners() {
  listeners.forEach((fn) => fn());
}

async function persist() {
  try {
    await RNFS.writeFile(DATA_PATH, JSON.stringify(store), 'utf8');
  } catch {
    // ignore write errors gracefully
  }
}

export async function loadLibraryStore(): Promise<void> {
  if (loaded) return;
  loaded = true;
  try {
    const exists = await RNFS.exists(DATA_PATH);
    if (exists) {
      const raw = await RNFS.readFile(DATA_PATH, 'utf8');
      const parsed = JSON.parse(raw) as LibraryData;
      store = {
        likedSongIds: Array.isArray(parsed.likedSongIds) ? parsed.likedSongIds : [],
        albums: Array.isArray(parsed.albums) ? parsed.albums : [],
      };
      notifyListeners();
    }
  } catch {
    // use empty defaults
  }
}

// ─── Subscriptions ────────────────────────────────────────────────────────────

export function subscribeToLibrary(fn: () => void): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function getLibrarySnapshot(): LibraryData {
  return store;
}

// ─── Liked Songs ──────────────────────────────────────────────────────────────

export function isLiked(songId: string): boolean {
  return store.likedSongIds.includes(songId);
}

export async function toggleLike(songId: string): Promise<void> {
  if (store.likedSongIds.includes(songId)) {
    store = { ...store, likedSongIds: store.likedSongIds.filter((id) => id !== songId) };
  } else {
    store = { ...store, likedSongIds: [...store.likedSongIds, songId] };
  }
  notifyListeners();
  await persist();
}

export function getLikedSongs(allSongs: Song[]): Song[] {
  return allSongs.filter((s) => store.likedSongIds.includes(s.id));
}

// ─── Albums ───────────────────────────────────────────────────────────────────

export async function createAlbum(name: string): Promise<Album> {
  const album: Album = {
    id: `album_${Date.now()}_${Math.random().toString(36).slice(2)}`,
    name: name.trim(),
    songIds: [],
    createdAt: Date.now(),
  };
  store = { ...store, albums: [...store.albums, album] };
  notifyListeners();
  await persist();
  return album;
}

export async function deleteAlbum(albumId: string): Promise<void> {
  store = { ...store, albums: store.albums.filter((a) => a.id !== albumId) };
  notifyListeners();
  await persist();
}

export async function renameAlbum(albumId: string, newName: string): Promise<void> {
  store = {
    ...store,
    albums: store.albums.map((a) => (a.id === albumId ? { ...a, name: newName.trim() } : a)),
  };
  notifyListeners();
  await persist();
}

export async function addSongToAlbum(albumId: string, songId: string): Promise<void> {
  store = {
    ...store,
    albums: store.albums.map((a) =>
      a.id === albumId && !a.songIds.includes(songId)
        ? { ...a, songIds: [...a.songIds, songId] }
        : a,
    ),
  };
  notifyListeners();
  await persist();
}

export async function removeSongFromAlbum(albumId: string, songId: string): Promise<void> {
  store = {
    ...store,
    albums: store.albums.map((a) =>
      a.id === albumId ? { ...a, songIds: a.songIds.filter((id) => id !== songId) } : a,
    ),
  };
  notifyListeners();
  await persist();
}

export function getSystemAlbums(songs: Song[]): Album[] {
  const albumsMap = new Map<string, Album>();

  if (songs.length > 0) {
    albumsMap.set('sys_all_songs', {
      id: 'sys_all_songs',
      name: 'All Songs',
      songIds: songs.map((song) => song.id),
      createdAt: 0,
      isSystem: true,
      systemType: 'Library',
    });
  }

  songs.forEach((song) => {
    const albumName = song.album?.trim();
    if (albumName) {
      const id = `sys_album_${normalizeGroupKey(albumName)}`;
      if (!albumsMap.has(id)) {
        albumsMap.set(id, { id, name: albumName, songIds: [], createdAt: 0, isSystem: true, systemType: 'Movie / Album' });
      }
      if (!albumsMap.get(id)!.songIds.includes(song.id)) albumsMap.get(id)!.songIds.push(song.id);
    }

    const artistName = song.artist?.trim();
    if (artistName && artistName !== 'Unknown Artist') {
      const id = `sys_artist_${normalizeGroupKey(artistName)}`;
      if (!albumsMap.has(id)) {
        albumsMap.set(id, { id, name: artistName, songIds: [], createdAt: 0, isSystem: true, systemType: 'Singer' });
      }
      if (!albumsMap.get(id)!.songIds.includes(song.id)) albumsMap.get(id)!.songIds.push(song.id);
    }

    // Fallback when metadata tags are missing: group songs by folder name.
    if (!albumName) {
      const folderName = getBestFolderGroupName(song.path);
      if (folderName) {
        const id = `sys_folder_${normalizeGroupKey(folderName)}`;
        if (!albumsMap.has(id)) {
          albumsMap.set(id, { id, name: folderName, songIds: [], createdAt: 0, isSystem: true, systemType: 'Movie / Folder' });
        }
        if (!albumsMap.get(id)!.songIds.includes(song.id)) albumsMap.get(id)!.songIds.push(song.id);
      }
    }
  });

  return Array.from(albumsMap.values());
}

export function getAlbumSongs(albumId: string, allSongs: Song[]): Song[] {
  const systemAlbums = getSystemAlbums(allSongs);
  const album = store.albums.find((a) => a.id === albumId) || systemAlbums.find((a) => a.id === albumId);
  if (!album) return [];
  return album.songIds.map((id) => allSongs.find((s) => s.id === id)).filter(Boolean) as Song[];
}
