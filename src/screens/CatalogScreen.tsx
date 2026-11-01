import { StyleSheet, Text, View } from 'react-native';

import { PrimaryButton } from '../components/PrimaryButton';
import { useAuth } from '../hooks/useAuth';
import { colors } from '../theme/colors';
import { fontSize, spacing } from '../theme/spacing';

// Versão provisória: o catálogo completo entra na etapa RF01.
export function CatalogScreen() {
  const { user, signOut } = useAuth();

  return (
    <View style={styles.container}>
      <Text style={styles.text} accessibilityRole="header">
        Olá, {user?.name}!
      </Text>
      <PrimaryButton title="Sair" icon="log-out-outline" variant="outline" onPress={signOut} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: spacing.xl,
    gap: spacing.lg,
  },
  text: {
    fontSize: fontSize.xl,
    color: colors.text,
    textAlign: 'center',
  },
});
