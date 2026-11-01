import { Ionicons } from '@expo/vector-icons';
import { ComponentProps, memo } from 'react';
import { Pressable, StyleSheet } from 'react-native';

import { colors } from '../theme/colors';
import { TOUCH_MIN } from '../theme/spacing';

interface Props {
  icon: ComponentProps<typeof Ionicons>['name'];
  /** Texto lido pelo leitor de tela; o ícone sozinho não tem significado. */
  label: string;
  onPress: () => void;
  color?: string;
  size?: number;
  selected?: boolean;
  hint?: string;
}

function IconButtonComponent({
  icon,
  label,
  onPress,
  color = colors.primary,
  size = 24,
  selected,
  hint,
}: Props) {
  return (
    <Pressable
      onPress={onPress}
      accessible
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={hint}
      accessibilityState={selected === undefined ? undefined : { selected }}
      hitSlop={8}
      style={({ pressed }) => [styles.button, pressed && styles.pressed]}
    >
      <Ionicons name={icon} size={size} color={color} />
    </Pressable>
  );
}

export const IconButton = memo(IconButtonComponent);

const styles = StyleSheet.create({
  button: {
    minWidth: TOUCH_MIN,
    minHeight: TOUCH_MIN,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.6,
  },
});
