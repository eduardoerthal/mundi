import { Ionicons } from '@expo/vector-icons';
import { memo } from 'react';
import { Pressable, StyleSheet } from 'react-native';

import { colors } from '../theme/colors';
import { cardShadow, radius, TOUCH_MIN } from '../theme/spacing';

interface Props {
  active: boolean;
  countryName: string;
  onPress: () => void;
  /** "overlay" = círculo branco sobre a bandeira do card. */
  variant?: 'plain' | 'overlay';
  size?: number;
}

function FavoriteButtonComponent({ active, countryName, onPress, variant = 'plain', size = 26 }: Props) {
  return (
    <Pressable
      onPress={onPress}
      accessible
      accessibilityRole="button"
      accessibilityLabel={
        active ? `Remover ${countryName} dos favoritos` : `Adicionar ${countryName} aos favoritos`
      }
      accessibilityState={{ selected: active }}
      hitSlop={8}
      style={({ pressed }) => [
        styles.button,
        variant === 'overlay' && styles.overlay,
        pressed && styles.pressed,
      ]}
    >
      <Ionicons
        name={active ? 'heart' : 'heart-outline'}
        size={size}
        color={active ? colors.favorite : colors.textMuted}
      />
    </Pressable>
  );
}

export const FavoriteButton = memo(FavoriteButtonComponent);

const styles = StyleSheet.create({
  button: {
    minWidth: TOUCH_MIN,
    minHeight: TOUCH_MIN,
    alignItems: 'center',
    justifyContent: 'center',
  },
  overlay: {
    backgroundColor: colors.surface,
    borderRadius: radius.pill,
    ...cardShadow,
  },
  pressed: {
    opacity: 0.6,
  },
});
