import { Pressable, StyleSheet, Text, ViewStyle } from 'react-native';

import { COLORS } from '@/utils/colors';

interface AppButtonProps {
  title: string;
  onPress: () => void;
  style?: ViewStyle;
  disabled?: boolean;
}

export function AppButton({ title, onPress, style, disabled = false }: AppButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [styles.button, style, (pressed || disabled) && styles.buttonPressed]}>
      <Text style={styles.buttonText}>{title}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    backgroundColor: COLORS.button,
    borderRadius: 12,
    justifyContent: 'center',
    minHeight: 48,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  buttonPressed: {
    opacity: 0.8,
  },
  buttonText: {
    color: COLORS.buttonText,
    fontSize: 16,
    fontWeight: '600',
  },
});
