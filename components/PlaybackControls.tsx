import { StyleSheet, View } from 'react-native';

import { AppButton } from '@/components/AppButton';

interface PlaybackControlsProps {
  isPlaying: boolean;
  onPlayPausePress: () => void;
  onNextPress: () => void;
  onPreviousPress: () => void;
}

export function PlaybackControls({
  isPlaying,
  onPlayPausePress,
  onNextPress,
  onPreviousPress,
}: PlaybackControlsProps) {
  return (
    <View style={styles.controlsRow}>
      <AppButton style={styles.smallButton} title="Prev" onPress={onPreviousPress} />
      <AppButton
        style={styles.playPauseButton}
        title={isPlaying ? 'Pause' : 'Play'}
        onPress={onPlayPausePress}
      />
      <AppButton style={styles.smallButton} title="Next" onPress={onNextPress} />
    </View>
  );
}

const styles = StyleSheet.create({
  controlsRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  playPauseButton: {
    flex: 1,
    marginHorizontal: 12,
  },
  smallButton: {
    minWidth: 84,
  },
});
