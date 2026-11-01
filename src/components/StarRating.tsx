import { Ionicons } from '@expo/vector-icons';
import { memo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { colors } from '../theme/colors';
import { TOUCH_MIN } from '../theme/spacing';

const STARS = [1, 2, 3, 4, 5];

interface Props {
  value: number | null;
  /** Sem onChange, as estrelas são só leitura (ex.: lista de visitados). */
  onChange?: (rating: number) => void;
  size?: number;
}

function StarRatingComponent({ value, onChange, size = 32 }: Props) {
  const rating = value ?? 0;

  if (!onChange) {
    return (
      <View
        style={styles.row}
        accessible
        accessibilityRole="image"
        accessibilityLabel={value ? `Nota ${value} de 5` : 'Sem nota'}
      >
        {STARS.map((star) => (
          <Ionicons
            key={star}
            name={star <= rating ? 'star' : 'star-outline'}
            size={size}
            color={colors.star}
          />
        ))}
      </View>
    );
  }

  return (
    <View style={styles.row}>
      {STARS.map((star) => (
        <Pressable
          key={star}
          onPress={() => onChange(star)}
          accessible
          accessibilityRole="button"
          accessibilityLabel={`Dar nota ${star} de 5`}
          accessibilityState={{ selected: star <= rating }}
          hitSlop={4}
          style={styles.star}
        >
          <Ionicons name={star <= rating ? 'star' : 'star-outline'} size={size} color={colors.star} />
        </Pressable>
      ))}
    </View>
  );
}

export const StarRating = memo(StarRatingComponent);

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  star: {
    minWidth: TOUCH_MIN,
    minHeight: TOUCH_MIN,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
