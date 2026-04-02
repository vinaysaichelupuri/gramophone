import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
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
import { useLibrary } from '@/hooks/useLibrary';
import { getLocalSongs } from '@/services/musicLibraryService';
import { Album, createAlbum, deleteAlbum, renameAlbum } from '@/services/libraryStore';
import { Song } from '@/types/song';
import { COLORS } from '@/utils/colors';

export function AlbumsScreen() {
  const router = useRouter();
  const library = useLibrary();
  const [allSongs, setAllSongs] = useState<Song[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newAlbumName, setNewAlbumName] = useState('');
  const [editingAlbumId, setEditingAlbumId] = useState<string | null>(null);

  useEffect(() => {
    getLocalSongs().then(setAllSongs).catch(() => {});
  }, []);

  const handleSaveAlbum = useCallback(async () => {
    const name = newAlbumName.trim();
    if (!name) return;

    if (editingAlbumId) {
      await renameAlbum(editingAlbumId, name);
    } else {
      await createAlbum(name);
    }

    setNewAlbumName('');
    setEditingAlbumId(null);
    setShowCreateModal(false);
  }, [newAlbumName, editingAlbumId]);

  const openRenameModal = useCallback((album: Album) => {
    setNewAlbumName(album.name);
    setEditingAlbumId(album.id);
    setShowCreateModal(true);
  }, []);

  const handleDeleteAlbum = useCallback((album: Album) => {
    Alert.alert('Delete Album', `Delete "${album.name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => void deleteAlbum(album.id) },
    ]);
  }, []);

  const renderAlbum = ({ item }: { item: Album }) => {
    const songCount = item.songIds.length;
    return (
      <Pressable
        style={({ pressed }) => [styles.albumCard, pressed && styles.albumCardPressed]}
        onPress={() => router.push({ pathname: '/album-detail' as any, params: { albumId: item.id } })}
      >
        <View style={styles.albumIcon}>
          <Ionicons name="musical-notes" size={28} color={COLORS.buttonText} />
        </View>
        <View style={styles.albumInfo}>
          <Text style={styles.albumName} numberOfLines={1}>
            {item.name}
          </Text>
          <Text style={styles.albumMeta}>
            {songCount} {songCount === 1 ? 'song' : 'songs'}
          </Text>
        </View>
        <Pressable
          hitSlop={10}
          onPress={(e) => {
            e.stopPropagation();
            openRenameModal(item);
          }}
          style={styles.actionBtn}
        >
          <Ionicons name="pencil-outline" size={18} color={COLORS.secondaryText} />
        </Pressable>
        <Pressable
          hitSlop={10}
          onPress={(e) => {
            e.stopPropagation();
            handleDeleteAlbum(item);
          }}
          style={styles.actionBtn}
        >
          <Ionicons name="trash-outline" size={18} color={COLORS.secondaryText} />
        </Pressable>
      </Pressable>
    );
  };

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.container}>
      {/* Header */}
      <View style={styles.headerRow}>
        <Pressable onPress={() => router.back()} style={styles.backBtn} hitSlop={10}>
          <Ionicons name="chevron-back" size={24} color={COLORS.primaryText} />
        </Pressable>
        <View style={styles.headerText}>
          <Text style={styles.title}>Albums</Text>
          <Text style={styles.subtitle}>{library.albums.length} albums</Text>
        </View>
        <Pressable style={styles.addBtn} onPress={() => setShowCreateModal(true)}>
          <Ionicons name="add" size={22} color={COLORS.buttonText} />
          <Text style={styles.addBtnText}>New</Text>
        </Pressable>
      </View>

      {library.albums.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="albums-outline" size={56} color={COLORS.secondaryText} />
          <Text style={styles.emptyTitle}>No albums yet</Text>
          <Text style={styles.emptyDesc}>
            Tap "New" to create your first album and add songs to it.
          </Text>
        </View>
      ) : (
        <FlatList
          data={library.albums}
          keyExtractor={(item) => item.id}
          renderItem={renderAlbum}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}

      <MiniPlayer />

      <Modal
        animationType="slide"
        transparent
        visible={showCreateModal}
        onRequestClose={() => {
          setShowCreateModal(false);
          setEditingAlbumId(null);
          setNewAlbumName('');
        }}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
          <Pressable
            style={styles.modalOverlay}
            onPress={() => {
              setShowCreateModal(false);
              setEditingAlbumId(null);
              setNewAlbumName('');
            }}
          >
            <Pressable style={styles.modalSheet} onPress={() => {}}>
              <Text style={styles.modalTitle}>{editingAlbumId ? 'Rename Album' : 'New Album'}</Text>
              <TextInput
                autoFocus
                value={newAlbumName}
                onChangeText={setNewAlbumName}
                placeholder="Album name"
                placeholderTextColor={COLORS.secondaryText}
                style={styles.modalInput}
                onSubmitEditing={() => void handleSaveAlbum()}
                returnKeyType="done"
              />
              <View style={styles.modalActions}>
                <Pressable
                  style={styles.modalCancel}
                  onPress={() => {
                    setShowCreateModal(false);
                    setEditingAlbumId(null);
                    setNewAlbumName('');
                  }}
                >
                  <Text style={styles.modalCancelText}>Cancel</Text>
                </Pressable>
                <Pressable
                  style={[styles.modalCreate, !newAlbumName.trim() && styles.modalCreateDisabled]}
                  onPress={() => void handleSaveAlbum()}
                  disabled={!newAlbumName.trim()}
                >
                  <Text style={styles.modalCreateText}>{editingAlbumId ? 'Save' : 'Create'}</Text>
                </Pressable>
              </View>
            </Pressable>
          </Pressable>
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
  addBtn: {
    alignItems: 'center',
    backgroundColor: COLORS.button,
    borderRadius: 10,
    flexDirection: 'row',
    gap: 4,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  addBtnText: {
    color: COLORS.buttonText,
    fontSize: 14,
    fontWeight: '600',
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
  albumCard: {
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderColor: COLORS.secondaryText,
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: 'row',
    marginBottom: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  albumCardPressed: { opacity: 0.85 },
  albumIcon: {
    alignItems: 'center',
    backgroundColor: COLORS.button,
    borderRadius: 10,
    height: 48,
    justifyContent: 'center',
    marginRight: 14,
    width: 48,
  },
  albumInfo: { flex: 1 },
  albumName: {
    color: COLORS.primaryText,
    fontSize: 16,
    fontWeight: '600',
  },
  albumMeta: {
    color: COLORS.secondaryText,
    fontSize: 13,
    marginTop: 4,
  },
  actionBtn: {
    padding: 6,
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
    paddingBottom: 36,
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  modalTitle: {
    color: COLORS.primaryText,
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
  },
  modalInput: {
    borderColor: COLORS.secondaryText,
    borderRadius: 12,
    borderWidth: 1,
    color: COLORS.primaryText,
    fontSize: 16,
    minHeight: 48,
    paddingHorizontal: 14,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  modalCancel: {
    alignItems: 'center',
    borderColor: COLORS.secondaryText,
    borderRadius: 12,
    borderWidth: 1,
    flex: 1,
    paddingVertical: 12,
  },
  modalCancelText: {
    color: COLORS.primaryText,
    fontSize: 15,
    fontWeight: '600',
  },
  modalCreate: {
    alignItems: 'center',
    backgroundColor: COLORS.button,
    borderRadius: 12,
    flex: 1,
    paddingVertical: 12,
  },
  modalCreateDisabled: {
    opacity: 0.4,
  },
  modalCreateText: {
    color: COLORS.buttonText,
    fontSize: 15,
    fontWeight: '700',
  },
});
