import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { AppButton } from '@/components/AppButton';
import { PlaybackControls } from '@/components/PlaybackControls';
import { SeekBar } from '@/components/SeekBar';
import { StatusCard } from '@/components/StatusCard';
import { useLibrary } from '@/hooks/useLibrary';
import {
  ActiveTrackSnapshot,
  arePlaybackModulesAvailable,
  getCurrentSongId,
  getQueueSnapshot,
  getActiveTrackSnapshot,
  getPlaybackProgressSnapshot,
  getPlaybackStateSnapshot,
  playAtQueueIndex,
  getRepeatMode,
  getShuffleMode,
  RepeatMode,
  seekTo,
  skipToNext,
  skipToPrevious,
  togglePlayPause,
  toggleRepeatMode,
  toggleShuffle,
} from '@/services/playerService';
import { toggleLike } from '@/services/libraryStore';
import { Song } from '@/types/song';
import { COLORS } from '@/utils/colors';
import { formatDuration } from '@/utils/formatters';

const fallbackArtwork = require('../assets/images/now-playing-cover.png');

export function NowPlayingScreen() {
  const router = useRouter();
  const [activeTrack, setActiveTrack] = useState<ActiveTrackSnapshot | null>(null);
  const [playbackState, setPlaybackState] = useState('none');
  const [progressPosition, setProgressPosition] = useState(0);
  const [progressDuration, setProgressDuration] = useState(0);
  const [isSeeking, setIsSeeking] = useState(false);
  const [seekingPosition, setSeekingPosition] = useState(0);
  const [repeatMode, setRepeatMode] = useState<RepeatMode>('off');
  const [isShuffleEnabled, setIsShuffleEnabled] = useState(false);
  const [queueSongs, setQueueSongs] = useState<Song[]>([]);
  const [queueIndex, setQueueIndex] = useState(-1);
  const isPlaybackAvailable = arePlaybackModulesAvailable();
  const library = useLibrary();
  const songId = getCurrentSongId();
  const liked = songId ? library.likedSongIds.includes(songId) : false;

  const refreshPlayerSnapshot = useCallback(async () => {
    if (!isPlaybackAvailable) {
      return;
    }

    const [track, currentPlaybackState, currentProgress, currentRepeat, currentShuffle, queueSnapshot] = await Promise.all([
      getActiveTrackSnapshot(),
      getPlaybackStateSnapshot(),
      getPlaybackProgressSnapshot(),
      Promise.resolve(getRepeatMode()),
      Promise.resolve(getShuffleMode()),
      getQueueSnapshot(),
    ]);

    setActiveTrack(track);
    setPlaybackState(currentPlaybackState);
    setProgressPosition(currentProgress.position);
    setProgressDuration(currentProgress.duration);
    setRepeatMode(currentRepeat);
    setIsShuffleEnabled(currentShuffle);
    setQueueSongs(queueSnapshot.songs);
    setQueueIndex(queueSnapshot.currentIndex);
  }, [isPlaybackAvailable]);

  // Refresh songId each poll cycle too so it updates when track changes
  useEffect(() => {
    void refreshPlayerSnapshot();

    if (!isPlaybackAvailable) {
      return;
    }

    const interval = setInterval(() => {
      void refreshPlayerSnapshot();
    }, 400);

    return () => {
      clearInterval(interval);
    };
  }, [isPlaybackAvailable, refreshPlayerSnapshot]);

  const isPlaying =
    playbackState === 'playing' ||
    playbackState === 'buffering' ||
    playbackState === 'loading';

  const seekPosition = isSeeking ? seekingPosition : progressPosition;
  const duration = useMemo(() => {
    if (progressDuration > 0) {
      return progressDuration;
    }

    if (typeof activeTrack?.duration === 'number' && activeTrack.duration > 0) {
      return activeTrack.duration;
    }

    return 0;
  }, [activeTrack?.duration, progressDuration]);

  const nextUpSongs = useMemo(
    () =>
      queueSongs
        .slice(Math.max(0, queueIndex + 1), Math.max(0, queueIndex + 3))
        .map((song, offset) => ({ song, absoluteIndex: queueIndex + 1 + offset })),
    [queueSongs, queueIndex],
  );

  const handleSeekStart = () => {
    setIsSeeking(true);
  };

  const handleSeekValueChange = (value: number) => {
    if (!isSeeking) setIsSeeking(true);
    setSeekingPosition(value);
  };

  const handleSeekComplete = async (value: number) => {
    setSeekingPosition(value); // ensure the thumb stays
    try {
      await seekTo(value);
      await refreshPlayerSnapshot();
    } finally {
      // Delay releasing the seek state slightly
      // so the UI doesn't jump back before the new position propagates
      setTimeout(() => setIsSeeking(false), 300);
    }
  };

  if (!isPlaybackAvailable) {
    return (
      <View style={styles.container}>
        <StatusCard
          title="Native Playback Unavailable"
          description="This feature requires a native development build. Run 'npx expo run:android' and open the dev client."
        />
        <AppButton title="Back to Songs" onPress={() => router.replace('/')} style={styles.backButton} />
      </View>
    );
  }

  if (!activeTrack) {
    return (
      <View style={styles.container}>
        <StatusCard
          title="Nothing Is Playing"
          description="Choose a song from the list to start offline playback."
        />
        <AppButton title="Back to Songs" onPress={() => router.replace('/')} style={styles.backButton} />
      </View>
    );
  }

  const showArtwork = typeof activeTrack.artwork === 'string' && activeTrack.artwork.length > 0;

  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.artworkWrapper}>
        <Image source={showArtwork ? { uri: activeTrack.artwork } : fallbackArtwork} style={styles.artwork} />
      </View>

      <View style={styles.titleRow}>
        <View style={styles.titleGroup}>
          <Text numberOfLines={1} style={styles.title}>
            {activeTrack.title ?? 'Unknown Title'}
          </Text>
          <Text numberOfLines={1} style={styles.artist}>
            {activeTrack.artist ?? 'Unknown Artist'}
          </Text>
        </View>

        {/* Like button */}
        <Pressable
          style={styles.heartBtn}
          onPress={() => {
            if (songId) void toggleLike(songId);
          }}
        >
          <Ionicons
            name={liked ? 'heart' : 'heart-outline'}
            size={28}
            color={liked ? '#E85D75' : COLORS.secondaryText}
          />
        </Pressable>
      </View>

      <SeekBar
        position={seekPosition}
        duration={duration}
        onSeekStart={handleSeekStart}
        onSeekValueChange={handleSeekValueChange}
        onSeekComplete={handleSeekComplete}
      />

      <PlaybackControls
        isPlaying={isPlaying}
        repeatMode={repeatMode}
        isShuffleEnabled={isShuffleEnabled}
        onPlayPausePress={() => {
          void togglePlayPause();
          void refreshPlayerSnapshot();
        }}
        onNextPress={() => {
          void skipToNext();
          void refreshPlayerSnapshot();
        }}
        onPreviousPress={() => {
          void skipToPrevious();
          void refreshPlayerSnapshot();
        }}
        onShufflePress={async () => {
          await toggleShuffle();
          void refreshPlayerSnapshot();
        }}
        onRepeatPress={() => {
          toggleRepeatMode();
          void refreshPlayerSnapshot();
        }}
      />

      <View style={styles.metaRow}>
        <Text style={styles.metaText}>Elapsed: {formatDuration(progressPosition)}</Text>
        <Text style={styles.metaText}>Duration: {formatDuration(duration)}</Text>
      </View>

      {nextUpSongs.length > 0 ? (
        <View style={styles.nextUpSection}>
          <Text style={styles.nextUpTitle}>Next Up</Text>
          <View style={styles.nextUpList}>
            {nextUpSongs.map(({ song, absoluteIndex }) => (
              <Pressable
                key={`${song.id}_${absoluteIndex}`}
                style={({ pressed }) => [styles.nextUpItem, pressed && { opacity: 0.75 }]}
                onPress={async () => {
                  await playAtQueueIndex(absoluteIndex);
                  await refreshPlayerSnapshot();
                }}
              >
                <View style={styles.nextUpText}>
                  <Text style={styles.nextUpSongTitle} numberOfLines={1}>
                    {song.title}
                  </Text>
                  <Text style={styles.nextUpSongArtist} numberOfLines={1}>
                    {song.artist}
                  </Text>
                </View>
                <Ionicons name="play-circle-outline" size={22} color={COLORS.secondaryText} />
              </Pressable>
            ))}
          </View>
        </View>
      ) : null}

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.background,
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  artworkWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  artwork: {
    borderColor: COLORS.secondaryText,
    borderRadius: 18,
    borderWidth: 1,
    height: 260,
    width: '100%',
  },
  titleRow: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: 4,
  },
  titleGroup: {
    flex: 1,
    marginRight: 8,
  },
  title: {
    color: COLORS.primaryText,
    fontSize: 24,
    fontWeight: '700',
  },
  artist: {
    color: COLORS.secondaryText,
    fontSize: 16,
    marginTop: 6,
  },
  heartBtn: {
    padding: 6,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 18,
  },
  metaText: {
    color: COLORS.secondaryText,
    fontSize: 13,
  },
  nextUpSection: {
    marginTop: 20,
  },
  nextUpTitle: {
    color: COLORS.primaryText,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 10,
  },
  nextUpList: {
    gap: 8,
  },
  nextUpItem: {
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderColor: COLORS.secondaryText,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  nextUpText: {
    flex: 1,
    marginRight: 10,
  },
  nextUpSongTitle: {
    color: COLORS.primaryText,
    fontSize: 14,
    fontWeight: '600',
  },
  nextUpSongArtist: {
    color: COLORS.secondaryText,
    fontSize: 12,
    marginTop: 2,
  },
  backButton: {
    marginTop: 12,
  },
});
