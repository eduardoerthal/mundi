import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Image, StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';

import { colors } from '../theme/colors';
import { fontSize, radius, spacing } from '../theme/spacing';

interface Props {
  uri: string | null;
  countryName: string;
  /** Descrição textual da bandeira, quando a API fornece. */
  description?: string | null;
  style?: StyleProp<ViewStyle>;
  size?: 'small' | 'medium' | 'large';
}

const ICON_SIZE = { small: 18, medium: 32, large: 48 };

// Mostra a bandeira ou, se não houver URL (ou a imagem falhar), um placeholder
// com as mesmas dimensões, para não quebrar o layout.
export function FlagImage({ uri, countryName, description, style, size = 'medium' }: Props) {
  const [failed, setFailed] = useState(false);
  const showImage = Boolean(uri) && !failed;

  return (
    <View style={[styles.frame, style]}>
      {showImage ? (
        <Image
          source={{ uri: uri as string }}
          style={styles.image}
          resizeMode="contain"
          onError={() => setFailed(true)}
          accessible
          accessibilityRole="image"
          accessibilityLabel={description ? `Bandeira de ${countryName}. ${description}` : `Bandeira de ${countryName}`}
        />
      ) : (
        <View
          style={styles.placeholder}
          accessible
          accessibilityRole="image"
          accessibilityLabel={`Bandeira de ${countryName} indisponível`}
        >
          <Ionicons name="flag-outline" size={ICON_SIZE[size]} color={colors.textMuted} />
          {size !== 'small' ? <Text style={styles.placeholderText}>Sem bandeira</Text> : null}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    aspectRatio: 3 / 2,
    borderRadius: radius.md,
    overflow: 'hidden',
    backgroundColor: colors.placeholder,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xs,
  },
  placeholderText: {
    marginTop: spacing.xs,
    fontSize: fontSize.sm,
    color: colors.textMuted,
  },
});
