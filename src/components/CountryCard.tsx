import { memo, useCallback } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { CountrySummary } from '../types/country';
import { colors } from '../theme/colors';
import { cardShadow, fontSize, radius, spacing } from '../theme/spacing';
import { FlagImage } from './FlagImage';

interface Props {
  country: CountrySummary;
  onPress: (country: CountrySummary) => void;
}

// Recebe tudo por props e é memoizado: só re-renderiza quando o próprio país
// (ou um callback) muda.
function CountryCardComponent({ country, onPress }: Props) {
  const handlePress = useCallback(() => onPress(country), [onPress, country]);

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
});
