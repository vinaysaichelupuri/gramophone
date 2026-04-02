import { Song } from "@/types/song";
import {
  Audio,
  AVPlaybackStatus,
  InterruptionModeAndroid,
  InterruptionModeIOS,
} from "expo-av";

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

let isPlayerSetup = false;
let currentSound: Audio.Sound | null = null;
let queue: Song[] = [];
let currentIndex = -1;
let playbackState = "none";
let playbackProgress: PlaybackProgressSnapshot = { duration: 0, position: 0 };
let activeTrack: ActiveTrackSnapshot | null = null;
let currentSongId: string | null = null;
let isLoadingTrack = false;

function normalizeUri(path: string): string {
  return path.startsWith("file://") ? path : `file://${path}`;
}

async function unloadCurrentSound() {
  if (!currentSound) {
    return;
  }

  currentSound.setOnPlaybackStatusUpdate(null);
  await currentSound.unloadAsync();
  currentSound = null;
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

  // Unload immediately to stop any currently playing audio before
  // async loading starts — this prevents the double-play bug.
  await unloadCurrentSound();

  if (isLoadingTrack) {
    return;
  }
  isLoadingTrack = true;

  currentIndex = index;
  updateActiveTrackFromQueue();

  const source = { uri: normalizeUri(queue[index].path) };
  const initialStatus = {
    shouldPlay,
    progressUpdateIntervalMillis: 300,
  };

  try {
    const { sound, status } = await Audio.Sound.createAsync(
      source,
      initialStatus,
      onPlaybackStatusUpdate,
    );
    currentSound = sound;
    applyPlaybackStatus(status);
  } finally {
    isLoadingTrack = false;
  }
}

async function handleDidFinish() {
  if (currentIndex + 1 < queue.length) {
    await loadTrackAtIndex(currentIndex + 1, true);
    return;
  }

  playbackState = "paused";
  playbackProgress = {
    ...playbackProgress,
    position: playbackProgress.duration,
  };
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
    interruptionModeAndroid: InterruptionModeAndroid.DuckOthers,
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

  queue = songs;
  const safeIndex = Math.max(0, Math.min(startIndex, songs.length - 1));
  await loadTrackAtIndex(safeIndex, true);
}

export async function togglePlayPause(): Promise<void> {
  if (!currentSound) {
    return;
  }

  const status = await currentSound.getStatusAsync();
  if (!status.isLoaded) {
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

  const nextIndex = Math.min(currentIndex + 1, queue.length - 1);
  if (nextIndex === currentIndex) {
    return;
  }

  await loadTrackAtIndex(nextIndex, true);
}

export async function skipToPrevious(): Promise<void> {
  if (queue.length === 0) {
    return;
  }

  const previousIndex = Math.max(currentIndex - 1, 0);
  if (previousIndex === currentIndex) {
    return;
  }

  await loadTrackAtIndex(previousIndex, true);
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
