import { memo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';

import { RegionFilterValue } from '../types/country';
import { colors } from '../theme/colors';
import { fontSize, radius, spacing, TOUCH_MIN } from '../theme/spacing';

// Valores em inglês (como a API devolve) e rótulos em português.
const OPTIONS: { value: RegionFilterValue; label: string }[] = [
  { value: 'all', label: 'Todas' },
  { value: 'Africa', label: 'África' },
  { value: 'Americas', label: 'Américas' },
  { value: 'Asia', label: 'Ásia' },
  { value: 'Europe', label: 'Europa' },
  { value: 'Oceania', label: 'Oceania' },
];

interface Props {
  value: RegionFilterValue;
  onChange: (value: RegionFilterValue) => void;
}

function RegionFilterComponent({ value, onChange }: Props) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
      accessibilityLabel="Filtrar por região"
    >
      {OPTIONS.map((option) => {
        const selected = option.value === value;
        return (
          <Pressable
            key={option.value}
            onPress={() => onChange(option.value)}
            accessible
            accessibilityRole="button"
            accessibilityLabel={`Região: ${option.label}`}
            accessibilityState={{ selected }}
            style={[styles.chip, selected && styles.chipSelected]}
          >
            <Text style={[styles.text, selected && styles.textSelected]}>{option.label}</Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

export const RegionFilter = memo(RegionFilterComponent);

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  chip: {
    minHeight: TOUCH_MIN,
    paddingHorizontal: spacing.lg,
    justifyContent: 'center',
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  chipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  text: {
    fontSize: fontSize.md,
    color: colors.text,
    fontWeight: '500',
  },
  textSelected: {
    color: colors.textOnPrimary,
    fontWeight: '700',
  },
});
