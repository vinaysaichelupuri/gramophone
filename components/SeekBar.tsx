import Slider from '@react-native-community/slider';
import { StyleSheet, Text, View } from 'react-native';

import { COLORS } from '@/utils/colors';
import { formatDuration } from '@/utils/formatters';

interface SeekBarProps {
  position: number;
  duration: number;
  onSeekStart: () => void;
  onSeekComplete: (nextPosition: number) => void;
  onSeekValueChange: (nextPosition: number) => void;
}

export function SeekBar({
  position,
  duration,
  onSeekStart,
  onSeekComplete,
  onSeekValueChange,
}: SeekBarProps) {
  const maxValue = duration > 0 ? duration : 1;

  return (
    <View style={styles.wrapper}>
      <Slider
        minimumValue={0}
        maximumValue={maxValue}
        value={Math.min(position, maxValue)}
        onSlidingStart={onSeekStart}
        onSlidingComplete={onSeekComplete}
        onValueChange={onSeekValueChange}
        minimumTrackTintColor={COLORS.button}
        maximumTrackTintColor={COLORS.secondaryText}
        thumbTintColor={COLORS.button}
      />
      <View style={styles.timeRow}>
        <Text style={styles.timeText}>{formatDuration(position)}</Text>
        <Text style={styles.timeText}>{formatDuration(duration)}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginVertical: 12,
    width: '100%',
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  timeText: {
    color: COLORS.secondaryText,
    fontSize: 12,
    fontWeight: '500',
  },
});
