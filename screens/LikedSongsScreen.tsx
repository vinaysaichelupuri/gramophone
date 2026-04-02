import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { MiniPlayer } from '@/components/MiniPlayer';
import { SongListItem } from '@/components/SongListItem';
import { SongOptionsMenu } from '@/components/SongOptionsMenu';
import { StatusCard } from '@/components/StatusCard';
import { useLibrary } from '@/hooks/useLibrary';
import { getLocalSongs } from '@/services/musicLibraryService';
import { arePlaybackModulesAvailable, loadQueueAndPlay } from '@/services/playerService';
import { toggleLike } from '@/services/libraryStore';
import { Song } from '@/types/song';
import { COLORS } from '@/utils/colors';

export function LikedSongsScreen() {
  const router = useRouter();
  const library = useLibrary();
  const [allSongs, setAllSongs] = useState<Song[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);
  const [isMenuVisible, setIsMenuVisible] = useState(false);

  const loadSongs = useCallback(async (force = false) => {
    setIsLoading(true);
    try {
      const discovered = await getLocalSongs(force);
      setAllSongs(discovered);
    } catch {
      setErrorMessage('Could not load songs.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadSongs();
  }, [loadSongs]);

  const likedSongs = allSongs.filter((s) => library.likedSongIds.includes(s.id));

  const handlePlay = useCallback(
    async (index: number) => {
      if (!arePlaybackModulesAvailable() || likedSongs.length === 0) return;
      try {
        await loadQueueAndPlay(likedSongs, index);
        router.push('/now-playing');
      } catch {
        setErrorMessage('Playback could not start.');
      }
    },
    [likedSongs, router],
  );

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.container}>
      {/* Header */}
      <View style={styles.headerRow}>
        <Pressable onPress={() => router.back()} style={styles.backBtn} hitSlop={10}>
          <Ionicons name="chevron-back" size={24} color={COLORS.primaryText} />
        </Pressable>
        <View style={styles.headerText}>
          <Text style={styles.title}>Liked Songs</Text>
          <Text style={styles.subtitle}>{likedSongs.length} songs</Text>
        </View>
        <Ionicons name="heart" size={28} color="#E85D75" />
      </View>

      {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}

      {likedSongs.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="heart-dislike-outline" size={56} color={COLORS.secondaryText} />
          <Text style={styles.emptyTitle}>No liked songs yet</Text>
          <Text style={styles.emptyDesc}>
            Tap the heart icon next to any song to add it here.
          </Text>
        </View>
      ) : (
        <FlatList
          data={likedSongs}
          keyExtractor={(item) => item.id}
          renderItem={({ item, index }) => (
            <SongListItem
              song={item}
              onPress={() => void handlePlay(index)}
              onLongPress={() => {
                setSelectedSong(item);
                setIsMenuVisible(true);
              }}
              isLiked
              onLikePress={() => void toggleLike(item.id)}
            />
          )}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          onRefresh={() => void loadSongs(true)}
          refreshing={isLoading}
        />
      )}

      <MiniPlayer />

      <SongOptionsMenu
        visible={isMenuVisible}
        song={selectedSong}
        onClose={() => setIsMenuVisible(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.background,
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  headerRow: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: 20,
  },
  backBtn: {
    marginRight: 8,
  },
  headerText: {
    flex: 1,
  },
  title: {
    color: COLORS.primaryText,
    fontSize: 26,
    fontWeight: '700',
  },
  subtitle: {
    color: COLORS.secondaryText,
    fontSize: 14,
    marginTop: 2,
  },
  error: {
    color: COLORS.secondaryText,
    fontSize: 13,
    marginBottom: 8,
  },
  emptyState: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  emptyTitle: {
    color: COLORS.primaryText,
    fontSize: 20,
    fontWeight: '700',
    marginTop: 16,
  },
  emptyDesc: {
    color: COLORS.secondaryText,
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
  list: {
    paddingBottom: 12,
  },
});
