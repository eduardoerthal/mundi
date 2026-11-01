import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { colors } from '../theme/colors';
import { fontSize, spacing } from '../theme/spacing';
import { PrimaryButton } from './PrimaryButton';

interface Props {
  message: string;
  onRetry?: () => void;
  title?: string;
}

export function ErrorView({ message, onRetry, title = 'Não foi possível carregar' }: Props) {
  return (
    <View style={styles.container}>
      <Ionicons name="cloud-offline-outline" size={56} color={colors.danger} accessible={false} />
      <Text style={styles.title} accessibilityRole="header">
        {title}
      </Text>
      <Text style={styles.message} accessibilityRole="alert" accessibilityLiveRegion="polite">
        {message}
      </Text>
      {onRetry ? (
        <PrimaryButton
          title="Tentar novamente"
          icon="refresh"
          onPress={onRetry}
          accessibilityHint="Refaz a requisição"
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    gap: spacing.md,
  },
  title: {
    fontSize: fontSize.xl,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
  },
  message: {
    fontSize: fontSize.md,
    color: colors.textMuted,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
});
