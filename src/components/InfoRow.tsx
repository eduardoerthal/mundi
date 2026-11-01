import { Ionicons } from '@expo/vector-icons';
import { ComponentProps } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { colors } from '../theme/colors';
import { fontSize, spacing } from '../theme/spacing';

interface Props {
  icon: ComponentProps<typeof Ionicons>['name'];
  label: string;
  value: string;
}

// Linha "rótulo: valor" sem altura fixa; o texto quebra com a fonte aumentada.
export function InfoRow({ icon, label, value }: Props) {
  return (
    <View style={styles.row} accessible accessibilityLabel={`${label}: ${value}`}>
      <Ionicons name={icon} size={22} color={colors.primary} style={styles.icon} />
      <View style={styles.texts}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.value}>{value}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  icon: {
    marginTop: 2,
    marginRight: spacing.md,
  },
  texts: {
    flex: 1,
  },
  label: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
  },
  value: {
    marginTop: 2,
    fontSize: fontSize.md,
    color: colors.text,
    flexShrink: 1,
  },
});
