import { Song } from "@/types/song";
import {
  Audio,
  AVPlaybackStatus,
  InterruptionModeAndroid,
  InterruptionModeIOS,
} from "expo-av";
import * as KeepAwake from 'expo-keep-awake';

export interface PlaybackProgressSnapshot {
  duration: number;
  position: number;
}

export interface ActiveTrackSnapshot {
  title?: string;
  artist?: string;
  artwork?: string;
  duration?: number;
}

export interface QueueSnapshot {
  songs: Song[];
  currentIndex: number;
}

export type RepeatMode = "off" | "all" | "one";

let isPlayerSetup = false;
let currentSound: Audio.Sound | null = null;
let queue: Song[] = [];
let originalQueue: Song[] = [];
let currentIndex = -1;
let playbackState = "none";
let playbackProgress: PlaybackProgressSnapshot = { duration: 0, position: 0 };
let activeTrack: ActiveTrackSnapshot | null = null;
let currentSongId: string | null = null;
let isLoadingTrack = false;
let isHandlingFinish = false;

let repeatMode: RepeatMode = "off";
let isShuffleEnabled = false;

async function syncKeepAwake(shouldStayAwake: boolean) {
  try {
    if (shouldStayAwake) {
      await KeepAwake.activateKeepAwakeAsync();
    } else {
      await KeepAwake.deactivateKeepAwake();
    }
  } catch {
    // Some runtimes/dev clients may reject keep-awake calls; ignore safely.
  }
}

function normalizeUri(path: string): string {
  if (path.startsWith("file://") || path.startsWith("content://") || path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }
  return `file://${path}`;
}

async function unloadCurrentSound() {
  if (!currentSound) {
    return;
  }

  const soundToUnload = currentSound;
  currentSound = null; // Clear immediately to unblock subsequent loads
  
  try {
    // Stop and clear listener before unloading
    soundToUnload.setOnPlaybackStatusUpdate(null);
    await soundToUnload.stopAsync().catch(() => {});
    await soundToUnload.unloadAsync().catch(() => {});
  } catch (e) {
    console.warn("Failed to cleanly unload audio", e);
  }
}

function updateActiveTrackFromQueue() {
  if (currentIndex < 0 || currentIndex >= queue.length) {
    activeTrack = null;
    currentSongId = null;
    return;
  }

  const song = queue[currentIndex];
  activeTrack = {
    title: song.title,
    artist: song.artist,
    artwork: song.artwork,
    duration: song.duration,
  };
  currentSongId = song.id;
}

async function loadTrackAtIndex(index: number, shouldPlay: boolean) {
  if (queue.length === 0 || index < 0 || index >= queue.length) {
    return;
  }

  if (isLoadingTrack) {
    console.log("Track is already loading, skipping redundant load request");
    return;
  }
  isLoadingTrack = true;

  try {
    // Unload immediately to stop any currently playing audio before
    // async loading starts — this prevents the double-play bug.
    await unloadCurrentSound();

    currentIndex = index;
    updateActiveTrackFromQueue();

    const source = { uri: normalizeUri(queue[index].path) };
    const initialStatus = {
      shouldPlay,
      progressUpdateIntervalMillis: 300,
    };

    const { sound, status } = await Audio.Sound.createAsync(
      source,
      initialStatus,
      onPlaybackStatusUpdate,
    );
    currentSound = sound;
    applyPlaybackStatus(status);
    
    if (shouldPlay) {
      // Workaround for Expo AV occasionally failing to auto-play with initialStatus shouldPlay=true
      // We also add a small safety check to ensure it's actually playing
      const result = await sound.playAsync();
      applyPlaybackStatus(result);
    }
  } catch (e: any) {
    // If it's a focus error, try once more after a short delay
    if (e?.message?.includes("AudioFocusNotAcquiredException")) {
      console.log("Audio focus failed, retrying in 500ms...");
      await new Promise(resolve => setTimeout(resolve, 500));
      isLoadingTrack = false; // reset to allow retry
      return loadTrackAtIndex(index, shouldPlay);
    }
    
    console.error("Failed to load track:", e);
    playbackState = "none";
  } finally {
    isLoadingTrack = false;
  }
}

async function handleDidFinish() {
  if (isHandlingFinish) return;
  isHandlingFinish = true;

  try {
    if (repeatMode === "one") {
      if (currentSound) {
        await currentSound.playFromPositionAsync(0);
      } else {
        await loadTrackAtIndex(currentIndex, true);
      }
      return;
    }

    if (currentIndex + 1 < queue.length) {
      await loadTrackAtIndex(currentIndex + 1, true);
      return;
    }

    if (repeatMode === "all" && queue.length > 0) {
      await loadTrackAtIndex(0, true);
      return;
    }

    playbackState = "paused";
    playbackProgress = {
      ...playbackProgress,
      position: playbackProgress.duration,
    };
  } catch (e) {
    console.error("Error in handleDidFinish:", e);
  } finally {
    isHandlingFinish = false;
  }
}

function applyPlaybackStatus(status: AVPlaybackStatus) {
  if (!status.isLoaded) {
    playbackState = "none";
    playbackProgress = { duration: 0, position: 0 };
    return;
  }

  playbackProgress = {
    duration: (status.durationMillis ?? 0) / 1000,
    position: status.positionMillis / 1000,
  };

  if (status.isBuffering) {
    playbackState = "buffering";
  } else {
    playbackState = status.shouldPlay ? "playing" : "paused";
    void syncKeepAwake(status.shouldPlay);
  }

  if (status.didJustFinish) {
    void handleDidFinish();
  }
}

function onPlaybackStatusUpdate(status: AVPlaybackStatus) {
  applyPlaybackStatus(status);
}

export async function setupPlayer(): Promise<void> {
  if (isPlayerSetup) {
    return;
  }

  await Audio.setAudioModeAsync({
    allowsRecordingIOS: false,
    interruptionModeAndroid: InterruptionModeAndroid.DoNotMix,
    interruptionModeIOS: InterruptionModeIOS.MixWithOthers,
    playsInSilentModeIOS: true,
    shouldDuckAndroid: true,
    staysActiveInBackground: true,
  });

  isPlayerSetup = true;
}

export async function loadQueueAndPlay(
  songs: Song[],
  startIndex: number,
): Promise<void> {
  if (songs.length === 0) {
    return;
  }

  await setupPlayer();

  originalQueue = [...songs];
  if (isShuffleEnabled) {
    const shuffled = [...songs].sort(() => Math.random() - 0.5);
    // Find the starting song in the shuffled array to maintain continuity
    const startSong = songs[startIndex];
    const shuffledIndex = shuffled.findIndex((s) => s.id === startSong.id);
    queue = shuffled;
    await loadTrackAtIndex(shuffledIndex >= 0 ? shuffledIndex : 0, true);
  } else {
    // Keep a decoupled queue copy so queue mutations (play next/add queue)
    // never mutate arrays used directly by screen lists.
    queue = [...songs];
    const safeIndex = Math.max(0, Math.min(startIndex, songs.length - 1));
    await loadTrackAtIndex(safeIndex, true);
  }
}

export async function togglePlayPause(): Promise<void> {
  if (!currentSound) {
    // If we have a queue and index but no sound instance, try to load it
    if (currentIndex >= 0 && currentIndex < queue.length) {
      await loadTrackAtIndex(currentIndex, true);
    }
    return;
  }

  const status = await currentSound.getStatusAsync();
  if (!status.isLoaded) {
    // Try to reload if it's in a bad state
    await loadTrackAtIndex(currentIndex, true);
    return;
  }

  if (status.isPlaying) {
    await currentSound.pauseAsync();
    return;
  }

  await currentSound.playAsync();
}

export async function skipToNext(): Promise<void> {
  if (queue.length === 0) {
    return;
  }

  const nextIndex = currentIndex + 1;
  if (nextIndex < queue.length) {
    await loadTrackAtIndex(nextIndex, true);
  } else if (repeatMode === "all") {
    await loadTrackAtIndex(0, true);
  }
}

export async function skipToPrevious(): Promise<void> {
  if (queue.length === 0 || !currentSound) {
    return;
  }

  // If we've played more than 3 seconds, just restart the current song
  if (playbackProgress.position > 3) {
    await currentSound.setPositionAsync(0);
    return;
  }

  const previousIndex = currentIndex - 1;
  if (previousIndex >= 0) {
    await loadTrackAtIndex(previousIndex, true);
  } else if (repeatMode === "all") {
    await loadTrackAtIndex(queue.length - 1, true);
  }
}

export function toggleRepeatMode(): RepeatMode {
  const modes: RepeatMode[] = ["off", "all", "one"];
  const nextIndex = (modes.indexOf(repeatMode) + 1) % modes.length;
  repeatMode = modes[nextIndex];
  return repeatMode;
}

export function getRepeatMode(): RepeatMode {
  return repeatMode;
}

export async function toggleShuffle(): Promise<boolean> {
  isShuffleEnabled = !isShuffleEnabled;

  if (queue.length === 0) return isShuffleEnabled;

  if (isShuffleEnabled) {
    // Shuffle the queue but keep current song at current position (or move it to start)
    const currentSong = queue[currentIndex];
    const otherSongs = originalQueue.filter((s) => s.id !== currentSong.id);
    const shuffled = otherSongs.sort(() => Math.random() - 0.5);
    queue = [currentSong, ...shuffled];
    currentIndex = 0;
  } else {
    // Restore original order
    const currentSong = queue[currentIndex];
    queue = [...originalQueue];
    currentIndex = queue.findIndex((s) => s.id === currentSong.id);
  }

  return isShuffleEnabled;
}

export function getShuffleMode(): boolean {
  return isShuffleEnabled;
}

export async function seekTo(position: number): Promise<void> {
  if (!currentSound) {
    return;
  }

  await currentSound.setPositionAsync(Math.max(0, Math.floor(position * 1000)));
}

export async function getActiveTrackSnapshot(): Promise<ActiveTrackSnapshot | null> {
  return activeTrack;
}

export async function getPlaybackProgressSnapshot(): Promise<PlaybackProgressSnapshot> {
  return playbackProgress;
}

export async function getPlaybackStateSnapshot(): Promise<string> {
  return playbackState;
}

export function arePlaybackModulesAvailable(): boolean {
  return true;
}

export function getCurrentSongId(): string | null {
  return currentSongId;
}

export async function getQueueSnapshot(): Promise<QueueSnapshot> {
  return {
    songs: [...queue],
    currentIndex,
  };
}

export async function playAtQueueIndex(index: number): Promise<void> {
  if (index < 0 || index >= queue.length) return;
  await loadTrackAtIndex(index, true);
}

export async function playNow(song: Song): Promise<void> {
  await setupPlayer();
  // Insert at current position + 1 and skip to it
  const targetIndex = currentIndex + 1;
  queue.splice(targetIndex, 0, song);
  originalQueue.splice(targetIndex, 0, song);
  await loadTrackAtIndex(targetIndex, true);
}

export function playNext(song: Song): void {
  const targetIndex = currentIndex + 1;
  queue.splice(targetIndex, 0, song);
  originalQueue.splice(targetIndex, 0, song);
}

export function addToQueue(song: Song): void {
  queue.push(song);
  originalQueue.push(song);
}
