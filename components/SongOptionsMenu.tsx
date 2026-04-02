import { Ionicons } from '@expo/vector-icons';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { Song } from '@/types/song';
import { COLORS } from '@/utils/colors';
import { playNow, playNext, addToQueue } from '@/services/playerService';

interface SongOptionsMenuProps {
  visible: boolean;
  song: Song | null;
  onClose: () => void;
}

export function SongOptionsMenu({ visible, song, onClose }: SongOptionsMenuProps) {
  if (!song) return null;

  const handleAction = async (action: () => void | Promise<void>) => {
    await action();
    onClose();
  };

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <View style={styles.sheet}>
          <View style={styles.header}>
            <View style={styles.songInfo}>
              <Text numberOfLines={1} style={styles.title}>{song.title}</Text>
              <Text numberOfLines={1} style={styles.artist}>{song.artist}</Text>
            </View>
            <Pressable onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={24} color={COLORS.secondaryText} />
            </Pressable>
          </View>

          <View style={styles.options}>
            <Pressable 
              style={styles.option} 
              onPress={() => handleAction(() => playNow(song))}
            >
              <Ionicons name="play-outline" size={24} color={COLORS.primaryText} />
              <Text style={styles.optionText}>Play Now</Text>
            </Pressable>

            <Pressable 
              style={styles.option} 
              onPress={() => handleAction(() => playNext(song))}
            >
              <Ionicons name="play-forward-outline" size={24} color={COLORS.primaryText} />
              <Text style={styles.optionText}>Play Next</Text>
            </Pressable>

            <Pressable 
              style={styles.option} 
              onPress={() => handleAction(() => addToQueue(song))}
            >
              <Ionicons name="list-outline" size={24} color={COLORS.primaryText} />
              <Text style={styles.optionText}>Add to Queue</Text>
            </Pressable>
          </View>
        </View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: COLORS.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.secondaryText + '33',
    paddingBottom: 15,
  },
  songInfo: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.primaryText,
  },
  artist: {
    fontSize: 14,
    color: COLORS.secondaryText,
    marginTop: 4,
  },
  closeBtn: {
    padding: 5,
  },
  options: {
    gap: 15,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 15,
  },
  optionText: {
    fontSize: 16,
    color: COLORS.primaryText,
    fontWeight: '500',
  },
});
