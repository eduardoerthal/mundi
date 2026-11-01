import { memo, useCallback } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { CountrySummary } from '../types/country';
import { colors } from '../theme/colors';
import { cardShadow, fontSize, radius, spacing } from '../theme/spacing';
import { FavoriteButton } from './FavoriteButton';
import { FlagImage } from './FlagImage';

interface Props {
  country: CountrySummary;
  /** Vem por prop: favoritar um país só re-renderiza o card dele. */
  isFavorite: boolean;
  onPress: (country: CountrySummary) => void;
  onToggleFavorite: (country: CountrySummary) => void;
}

function CountryCardComponent({ country, isFavorite, onPress, onToggleFavorite }: Props) {
  const handlePress = useCallback(() => onPress(country), [onPress, country]);
  const handleToggle = useCallback(() => onToggleFavorite(country), [onToggleFavorite, country]);

  return (
    <View style={styles.card}>
      <Pressable
        onPress={handlePress}
        accessible
        accessibilityRole="button"
        accessibilityLabel={country.name}
        accessibilityHint="Abre os detalhes do país"
        style={({ pressed }) => [styles.pressable, pressed && styles.pressed]}
      >
        <FlagImage
          uri={country.flagUrl}
          countryName={country.name}
          description={country.flagDescription}
        />
        <Text style={styles.name} numberOfLines={3}>
          {country.name}
        </Text>
      </Pressable>
      {/* Irmão do Pressable (não filho), para o leitor de tela focar cada um separadamente. */}
      <View style={styles.favorite}>
        <FavoriteButton
          active={isFavorite}
          countryName={country.name}
          onPress={handleToggle}
          variant="overlay"
          size={22}
        />
      </View>
    </View>
  );
}

export const CountryCard = memo(CountryCardComponent);

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    ...cardShadow,
  },
  pressable: {
    padding: spacing.sm,
    borderRadius: radius.lg,
  },
  pressed: {
    opacity: 0.85,
  },
  name: {
    marginTop: spacing.sm,
    paddingHorizontal: spacing.xs,
    paddingBottom: spacing.xs,
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.text,
  },
  favorite: {
    position: 'absolute',
    top: spacing.xs,
    right: spacing.xs,
  },
});
