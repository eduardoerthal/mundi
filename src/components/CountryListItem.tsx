import { Ionicons } from '@expo/vector-icons';
import { memo, ReactNode, useCallback } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { SavedCountry } from '../types/country';
import { colors } from '../theme/colors';
import { cardShadow, fontSize, radius, spacing, TOUCH_MIN } from '../theme/spacing';
import { FlagImage } from './FlagImage';

interface Props {
  country: SavedCountry;
  subtitle?: string;
  onPress: (code: string) => void;
  /** Ação à direita (ex.: botão de favorito), fora da área tocável da linha. */
  right?: ReactNode;
}

// Linha usada na busca, nos favoritos e nos visitados.
function CountryListItemComponent({ country, subtitle, onPress, right }: Props) {
  const handlePress = useCallback(() => onPress(country.code), [onPress, country.code]);

  return (
    <View style={styles.row}>
      <Pressable
        onPress={handlePress}
        accessible
        accessibilityRole="button"
        accessibilityLabel={subtitle ? `${country.name}, ${subtitle}` : country.name}
        accessibilityHint="Abre os detalhes do país"
        style={({ pressed }) => [styles.main, pressed && styles.pressed]}
      >
        <FlagImage uri={country.flagUrl} countryName={country.name} size="small" style={styles.flag} />
        <View style={styles.texts}>
          <Text style={styles.name}>{country.name}</Text>
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        </View>
        {right ? null : <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />}
      </Pressable>
      {right}
    </View>
  );
}

export const CountryListItem = memo(CountryListItemComponent);

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: spacing.lg,
    marginVertical: spacing.xs,
    paddingRight: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    ...cardShadow,
  },
  main: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: TOUCH_MIN + 16,
    padding: spacing.md,
    gap: spacing.md,
  },
  pressed: {
    opacity: 0.7,
  },
  flag: {
    width: 56,
    borderRadius: radius.sm,
  },
  texts: {
    flex: 1,
  },
  name: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: colors.text,
  },
  subtitle: {
    marginTop: 2,
    fontSize: fontSize.sm,
    color: colors.textMuted,
  },
});
