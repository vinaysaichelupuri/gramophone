import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useState, useMemo } from 'react';
import {
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { MiniPlayer } from '@/components/MiniPlayer';
import { SongListItem } from '@/components/SongListItem';
import { SongOptionsMenu } from '@/components/SongOptionsMenu';
import { StatusCard } from '@/components/StatusCard';
import { useLibrary } from '@/hooks/useLibrary';
import { getLocalSongs } from '@/services/musicLibraryService';
import { addSongToAlbum, getAlbumSongs, removeSongFromAlbum } from '@/services/libraryStore';
import { arePlaybackModulesAvailable, loadQueueAndPlay } from '@/services/playerService';
import { Song } from '@/types/song';
import { COLORS } from '@/utils/colors';

export function AlbumDetailScreen() {
  const { albumId } = useLocalSearchParams<{ albumId: string }>();
  const router = useRouter();
  const library = useLibrary();
  const [allSongs, setAllSongs] = useState<Song[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const loadSongs = useCallback(async (force = false) => {
    setIsRefreshing(true);
    try {
      const discovered = await getLocalSongs(force);
      setAllSongs(discovered);
    } catch {
      setErrorMessage('Could not load songs.');
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void loadSongs();
  }, [loadSongs]);

  const album = library.albums.find((a) => a.id === albumId);
  const albumSongs = album ? getAlbumSongs(albumId!, allSongs) : [];

  // Songs not yet in this album
  const availableSongs = useMemo(() => {
    let list = allSongs.filter((s) => !album?.songIds.includes(s.id));
    const query = searchQuery.trim().toLowerCase();
    if (query) {
      list = list.filter(
        (song) => song.title.toLowerCase().includes(query) || (song.artist && song.artist.toLowerCase().includes(query))
      );
    }
    return list;
  }, [allSongs, album?.songIds, searchQuery]);

  const handlePlay = useCallback(
    async (index: number) => {
      if (!arePlaybackModulesAvailable() || albumSongs.length === 0) return;
      try {
        await loadQueueAndPlay(albumSongs, index);
        router.push('/now-playing');
      } catch {
        setErrorMessage('Playback could not start.');
      }
    },
    [albumSongs, router],
  );

  const handleRemoveSong = useCallback(
    (songId: string, title: string) => {
      Alert.alert('Remove Song', `Remove "${title}" from this album?`, [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => void removeSongFromAlbum(albumId!, songId),
        },
      ]);
    },
    [albumId],
  );

  if (!album) {
    return (
      <SafeAreaView edges={['top', 'left', 'right']} style={styles.container}>
        <StatusCard title="Album Not Found" description="This album may have been deleted." />
        <Pressable onPress={() => router.back()} style={styles.backPressable}>
          <Text style={styles.backText}>← Go Back</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.container}>
      {/* Header */}
      <View style={styles.headerRow}>
        <Pressable onPress={() => router.back()} style={styles.backBtn} hitSlop={10}>
          <Ionicons name="chevron-back" size={24} color={COLORS.primaryText} />
        </Pressable>
        <View style={styles.headerText}>
          <Text style={styles.title} numberOfLines={1}>{album.name}</Text>
          <Text style={styles.subtitle}>{albumSongs.length} songs</Text>
        </View>
        <Pressable style={styles.addBtn} onPress={() => setShowAddModal(true)}>
          <Ionicons name="add" size={20} color={COLORS.buttonText} />
          <Text style={styles.addBtnText}>Add Songs</Text>
        </Pressable>
      </View>

      {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}

      {albumSongs.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="musical-note-outline" size={56} color={COLORS.secondaryText} />
          <Text style={styles.emptyTitle}>No songs yet</Text>
          <Text style={styles.emptyDesc}>Tap "Add Songs" to add songs to this album.</Text>
        </View>
      ) : (
        <FlatList
          data={albumSongs}
          keyExtractor={(item) => item.id}
          renderItem={({ item, index }) => (
            <View style={styles.songRow}>
              <View style={styles.songItem}>
                <SongListItem
                  song={item}
                  onPress={() => void handlePlay(index)}
                  onLongPress={() => {
                    setSelectedSong(item);
                    setIsMenuVisible(true);
                  }}
                />
              </View>
              <Pressable
                hitSlop={10}
                onPress={() => handleRemoveSong(item.id, item.title)}
                style={styles.removeBtn}
              >
                <Ionicons name="remove-circle-outline" size={22} color="#E85D75" />
              </Pressable>
            </View>
          )}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          onRefresh={() => void loadSongs(true)}
          refreshing={isRefreshing}
          keyboardShouldPersistTaps="handled"
        />
      )}

      <MiniPlayer />

      <SongOptionsMenu
        visible={isMenuVisible}
        song={selectedSong}
        onClose={() => setIsMenuVisible(false)}
      />

      {/* Add Songs Modal */}
      <Modal
        animationType="slide"
        transparent
        visible={showAddModal}
        onRequestClose={() => {
          setShowAddModal(false);
          setSearchQuery('');
        }}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalSheet}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Add Songs to "{album.name}"</Text>
                <Pressable onPress={() => {
                  setShowAddModal(false);
                  setSearchQuery('');
                }} hitSlop={10}>
                  <Ionicons name="close" size={24} color={COLORS.primaryText} />
                </Pressable>
              </View>

              <View style={styles.modalSearchWrapper}>
                <Ionicons name="search" size={20} color={COLORS.secondaryText} style={styles.modalSearchIcon} />
                <TextInput
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  placeholder="Search songs..."
                  placeholderTextColor={COLORS.secondaryText}
                  style={styles.modalSearchInput}
                />
                {searchQuery.length > 0 && (
                  <Pressable onPress={() => setSearchQuery('')} hitSlop={10}>
                    <Ionicons name="close-circle" size={18} color={COLORS.secondaryText} />
                  </Pressable>
                )}
              </View>

              {availableSongs.length === 0 ? (
                <View style={styles.modalEmpty}>
                  <Text style={styles.modalEmptyText}>All songs are already in this album.</Text>
                </View>
              ) : (
                <FlatList
                  data={availableSongs}
                  keyExtractor={(item) => item.id}
                  renderItem={({ item }) => (
                    <Pressable
                      style={({ pressed }) => [styles.modalSongRow, pressed && { opacity: 0.75 }]}
                      onPress={async () => {
                        await addSongToAlbum(albumId!, item.id);
                      }}
                    >
                      <View style={styles.modalSongInfo}>
                        <Text style={styles.modalSongTitle} numberOfLines={1}>
                          {item.title}
                        </Text>
                        <Text style={styles.modalSongArtist} numberOfLines={1}>
                          {item.artist}
                        </Text>
                      </View>
                      <Ionicons name="add-circle" size={24} color={COLORS.button} />
                    </Pressable>
                  )}
                  contentContainerStyle={styles.modalList}
                  showsVerticalScrollIndicator={false}
                  keyboardShouldPersistTaps="handled"
                />
              )}
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
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
  backBtn: { marginRight: 8 },
  headerText: { flex: 1 },
  title: {
    color: COLORS.primaryText,
    fontSize: 24,
    fontWeight: '700',
  },
  subtitle: {
    color: COLORS.secondaryText,
    fontSize: 14,
    marginTop: 2,
  },
  addBtn: {
    alignItems: 'center',
    backgroundColor: COLORS.button,
    borderRadius: 10,
    flexDirection: 'row',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  addBtnText: {
    color: COLORS.buttonText,
    fontSize: 13,
    fontWeight: '600',
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
  list: { paddingBottom: 12 },
  songRow: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  songItem: { flex: 1 },
  removeBtn: {
    marginBottom: 12,
    marginLeft: 8,
    padding: 4,
  },
  backPressable: { marginTop: 16 },
  backText: {
    color: COLORS.primaryText,
    fontSize: 16,
    fontWeight: '600',
  },
  // Modal
  modalOverlay: {
    backgroundColor: 'rgba(0,0,0,0.35)',
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: '#FAFAF8',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '75%',
    paddingBottom: 36,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  modalHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  modalTitle: {
    color: COLORS.primaryText,
    flex: 1,
    fontSize: 17,
    fontWeight: '700',
    marginRight: 8,
  },
  modalSearchWrapper: {
    alignItems: 'center',
    backgroundColor: '#F0F0F0',
    borderRadius: 10,
    flexDirection: 'row',
    marginBottom: 16,
    paddingHorizontal: 12,
  },
  modalSearchIcon: {
    marginRight: 8,
  },
  modalSearchInput: {
    color: COLORS.primaryText,
    flex: 1,
    fontSize: 15,
    height: 40,
  },
  modalEmpty: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  modalEmptyText: {
    color: COLORS.secondaryText,
    fontSize: 15,
  },
  modalList: { paddingBottom: 8 },
  modalSongRow: {
    alignItems: 'center',
    borderBottomColor: '#E8E6E2',
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    paddingVertical: 12,
  },
  modalSongInfo: { flex: 1, marginRight: 10 },
  modalSongTitle: {
    color: COLORS.primaryText,
    fontSize: 15,
    fontWeight: '600',
  },
  modalSongArtist: {
    color: COLORS.secondaryText,
    fontSize: 13,
    marginTop: 2,
  },
});
