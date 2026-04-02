import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  arePlaybackModulesAvailable,
  getActiveTrackSnapshot,
  getPlaybackProgressSnapshot,
  getPlaybackStateSnapshot,
  skipToNext,
  togglePlayPause,
  ActiveTrackSnapshot,
} from '@/services/playerService';
import { COLORS } from '@/utils/colors';

const fallbackArtwork = require('../assets/images/now-playing-cover.png');

export function MiniPlayer() {
  const router = useRouter();
  const [activeTrack, setActiveTrack] = useState<ActiveTrackSnapshot | null>(null);
  const [playbackState, setPlaybackState] = useState('none');
  const [progressPosition, setProgressPosition] = useState(0);
  const [progressDuration, setProgressDuration] = useState(0);
  const isPlaybackAvailable = arePlaybackModulesAvailable();
  const insets = useSafeAreaInsets();

  const refresh = useCallback(async () => {
    if (!isPlaybackAvailable) return;
    const [track, state, progress] = await Promise.all([
      getActiveTrackSnapshot(),
      getPlaybackStateSnapshot(),
      getPlaybackProgressSnapshot(),
    ]);
    setActiveTrack(track);
    setPlaybackState(state);
    setProgressPosition(progress.position);
    setProgressDuration(progress.duration);
  }, [isPlaybackAvailable]);

  useEffect(() => {
    if (!isPlaybackAvailable) return;
    void refresh();
    const id = setInterval(() => void refresh(), 400);
    return () => clearInterval(id);
  }, [isPlaybackAvailable, refresh]);

  const isPlaying =
    playbackState === 'playing' || playbackState === 'buffering' || playbackState === 'loading';

  const duration = useMemo(() => {
    if (progressDuration > 0) return progressDuration;
    if (typeof activeTrack?.duration === 'number' && activeTrack.duration > 0)
      return activeTrack.duration;
    return 1;
  }, [progressDuration, activeTrack?.duration]);

  const progressPercent = Math.min(100, (progressPosition / duration) * 100);
  const showArtwork = typeof activeTrack?.artwork === 'string' && activeTrack.artwork.length > 0;

  if (!activeTrack) return null;

  return (
    <Pressable
      style={[styles.container, { paddingBottom: Math.max(insets.bottom, 8) }]}
      onPress={() => router.push('/now-playing')}
    >
      {/* progress rail at top */}
      <View style={styles.progressRail}>
        <View style={[styles.progressFill, { width: `${progressPercent}%` }]} />
      </View>

      <View style={styles.inner}>
        <Image
          source={showArtwork ? { uri: activeTrack.artwork } : fallbackArtwork}
          style={styles.artwork}
        />

        <View style={styles.info}>
          <Text style={styles.title} numberOfLines={1}>
            {activeTrack.title ?? 'Unknown Title'}
          </Text>
          <Text style={styles.artist} numberOfLines={1}>
            {activeTrack.artist ?? 'Unknown Artist'}
          </Text>
        </View>

        {/* Play / Pause */}
        <Pressable
          hitSlop={12}
          onPress={(e) => {
            e.stopPropagation();
            void togglePlayPause();
          }}
          style={styles.btn}
        >
          <Ionicons
            name={isPlaying ? 'pause-circle' : 'play-circle'}
            size={38}
            color={COLORS.primaryText}
          />
        </Pressable>

        {/* Skip next */}
        <Pressable
          hitSlop={12}
          onPress={(e) => {
            e.stopPropagation();
            void skipToNext();
          }}
          style={styles.btn}
        >
          <Ionicons name="play-skip-forward" size={24} color={COLORS.secondaryText} />
        </Pressable>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F0EEE9',
    borderTopColor: '#DDD',
    borderTopWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
  },
  progressRail: {
    backgroundColor: '#E0DDD8',
    height: 3,
    width: '100%',
  },
  progressFill: {
    backgroundColor: COLORS.button,
    height: '100%',
  },
  inner: {
    alignItems: 'center',
    flexDirection: 'row',
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  artwork: {
    borderRadius: 8,
    height: 46,
    marginRight: 12,
    width: 46,
  },
  info: {
    flex: 1,
    marginRight: 8,
  },
  title: {
    color: COLORS.primaryText,
    fontSize: 14,
    fontWeight: '600',
  },
  artist: {
    color: COLORS.secondaryText,
    fontSize: 12,
    marginTop: 2,
  },
  btn: {
    marginLeft: 6,
    padding: 4,
  },
});
