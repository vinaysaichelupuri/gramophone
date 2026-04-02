import { StyleSheet, Text, View } from 'react-native';

import { COLORS } from '@/utils/colors';

interface StatusCardProps {
  title: string;
  description: string;
}

export function StatusCard({ title, description }: StatusCardProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.background,
    borderColor: COLORS.secondaryText,
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
  },
  title: {
    color: COLORS.primaryText,
    fontSize: 16,
    fontWeight: '600',
  },
  description: {
    color: COLORS.secondaryText,
    fontSize: 14,
    lineHeight: 20,
    marginTop: 8,
  },
});
