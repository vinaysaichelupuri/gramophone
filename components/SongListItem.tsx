import { Ionicons } from '@expo/vector-icons';
import { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Song } from '@/types/song';
import { COLORS } from '@/utils/colors';
import { formatDuration } from '@/utils/formatters';

interface SongListItemProps {
  song: Song;
  onPress: () => void;
  onLongPress?: () => void;
  isLiked?: boolean;
  onLikePress?: () => void;
}

export const SongListItem = memo(function SongListItem({
  song,
  onPress,
  onLongPress,
  isLiked = false,
  onLikePress,
}: SongListItemProps) {
  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      delayLongPress={300}
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
    >
      <View style={styles.textGroup}>
        <Text numberOfLines={1} style={styles.title}>
          {song.title}
        </Text>
        <Text numberOfLines={1} style={styles.artist}>
          {song.artist}
        </Text>
      </View>

      <Text style={styles.duration}>{formatDuration(song.duration)}</Text>

      {onLikePress ? (
        <Pressable
          hitSlop={10}
          onPress={(e) => {
            e.stopPropagation();
            onLikePress();
          }}
          style={styles.likeBtn}
        >
          <Ionicons
            name={isLiked ? 'heart' : 'heart-outline'}
            size={20}
            color={isLiked ? '#E85D75' : COLORS.secondaryText}
          />
        </Pressable>
      ) : null}
    </Pressable>
  );
});

const styles = StyleSheet.create({
  card: {
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderColor: COLORS.secondaryText,
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  cardPressed: {
    opacity: 0.85,
  },
  textGroup: {
    flex: 1,
    marginRight: 10,
  },
  title: {
    color: COLORS.primaryText,
    fontSize: 16,
    fontWeight: '600',
  },
  artist: {
    color: COLORS.secondaryText,
    fontSize: 13,
    marginTop: 4,
  },
  duration: {
    color: COLORS.secondaryText,
    fontSize: 13,
    minWidth: 44,
    textAlign: 'right',
  },
  likeBtn: {
    marginLeft: 10,
    padding: 4,
  },
});
