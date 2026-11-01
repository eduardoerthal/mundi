import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { AuthLayout } from '../components/AuthLayout';
import { PrimaryButton } from '../components/PrimaryButton';
import { TextField } from '../components/TextField';
import { useAuth } from '../hooks/useAuth';
import { AuthStackScreenProps } from '../navigation/types';
import { AuthError, AuthField } from '../services/authService';
import { spacing } from '../theme/spacing';

type Props = AuthStackScreenProps<'Login'>;

export function LoginScreen({ navigation }: Props) {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<AuthField, string>>>({});

  async function handleSubmit() {
    setFormError(null);
    setFieldErrors({});
    setSubmitting(true);
    try {
      // Em caso de sucesso o RootNavigator troca para o AppStack sozinho.
      await signIn(email, password);
    } catch (err) {
      if (err instanceof AuthError && err.field) {
        setFieldErrors({ [err.field]: err.message });
      } else {
        setFormError(err instanceof AuthError ? err.message : 'Não foi possível entrar. Tente novamente.');
      }
      setSubmitting(false);
    }
  }

  return (
    <AuthLayout title="Mundi" subtitle="Entre para explorar os países do mundo." error={formError}>
      <TextField
        label="E-mail"
        value={email}
        onChangeText={setEmail}
        error={fieldErrors.email}
        placeholder="nome@exemplo.com"
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
        textContentType="emailAddress"
        returnKeyType="next"
      />
      <TextField
        label="Senha"
        value={password}
        onChangeText={setPassword}
        error={fieldErrors.password}
        secureTextEntry
        autoComplete="current-password"
        textContentType="password"
        returnKeyType="go"
        onSubmitEditing={handleSubmit}
      />
      <View style={styles.actions}>
        <PrimaryButton title="Entrar" onPress={handleSubmit} loading={submitting} />
        <PrimaryButton
          title="Criar uma conta"
          variant="ghost"
          onPress={() => navigation.navigate('Register')}
          disabled={submitting}
          accessibilityHint="Abre a tela de cadastro"
        />
      </View>
    </AuthLayout>
  );
}

const styles = StyleSheet.create({
  actions: {
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
});
