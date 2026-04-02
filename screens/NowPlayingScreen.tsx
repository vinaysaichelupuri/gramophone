import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { AppButton } from '@/components/AppButton';
import { PlaybackControls } from '@/components/PlaybackControls';
import { SeekBar } from '@/components/SeekBar';
import { StatusCard } from '@/components/StatusCard';
import { useLibrary } from '@/hooks/useLibrary';
import {
  ActiveTrackSnapshot,
  arePlaybackModulesAvailable,
  getCurrentSongId,
  getActiveTrackSnapshot,
  getPlaybackProgressSnapshot,
  getPlaybackStateSnapshot,
  seekTo,
  skipToNext,
  skipToPrevious,
  togglePlayPause,
} from '@/services/playerService';
import { toggleLike } from '@/services/libraryStore';
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
  const isPlaybackAvailable = arePlaybackModulesAvailable();
  const library = useLibrary();
  const songId = getCurrentSongId();
  const liked = songId ? library.likedSongIds.includes(songId) : false;

  const refreshPlayerSnapshot = useCallback(async () => {
    if (!isPlaybackAvailable) {
      return;
    }

    const [track, currentPlaybackState, currentProgress] = await Promise.all([
      getActiveTrackSnapshot(),
      getPlaybackStateSnapshot(),
      getPlaybackProgressSnapshot(),
    ]);

    setActiveTrack(track);
    setPlaybackState(currentPlaybackState);
    setProgressPosition(currentProgress.position);
    setProgressDuration(currentProgress.duration);
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
    <View style={styles.container}>
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
        onPlayPausePress={() => {
          void togglePlayPause();
        }}
        onNextPress={() => {
          void skipToNext();
        }}
        onPreviousPress={() => {
          void skipToPrevious();
        }}
      />

      <View style={styles.metaRow}>
        <Text style={styles.metaText}>Elapsed: {formatDuration(progressPosition)}</Text>
        <Text style={styles.metaText}>Duration: {formatDuration(duration)}</Text>
      </View>

      <View style={styles.footerActions}>
        <AppButton
          title="Back to Song List"
          onPress={() => router.replace('/')}
          style={styles.fullWidthButton}
        />
      </View>
    </View>
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
  footerActions: {
    gap: 10,
    marginTop: 22,
  },
  fullWidthButton: {
    width: '100%',
  },
  backButton: {
    marginTop: 12,
  },
});
