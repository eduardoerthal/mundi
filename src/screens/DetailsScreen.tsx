import { StyleSheet, Text, View } from 'react-native';

import { AppStackScreenProps } from '../navigation/types';
import { colors } from '../theme/colors';
import { fontSize, spacing } from '../theme/spacing';

type Props = AppStackScreenProps<'Details'>;

// Versão provisória: a tela completa entra na etapa RF03.
export function DetailsScreen({ route }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Código recebido: {route.params.code}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  text: {
    fontSize: fontSize.lg,
    color: colors.text,
  },
});
