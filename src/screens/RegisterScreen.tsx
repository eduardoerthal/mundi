import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { AuthLayout } from '../components/AuthLayout';
import { PrimaryButton } from '../components/PrimaryButton';
import { TextField } from '../components/TextField';
import { MIN_PASSWORD_LENGTH } from '../constants';
import { useAuth } from '../hooks/useAuth';
import { AuthStackScreenProps } from '../navigation/types';
import { AuthError, AuthField } from '../services/authService';
import { spacing } from '../theme/spacing';

type Props = AuthStackScreenProps<'Register'>;
type FieldErrors = Partial<Record<AuthField | 'confirm', string>>;

export function RegisterScreen({ navigation }: Props) {
  const { signUp } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  async function handleSubmit() {
    setFormError(null);
    setFieldErrors({});
    if (password !== confirm) {
      setFieldErrors({ confirm: 'As senhas não conferem.' });
      return;
    }
    setSubmitting(true);
    try {
      await signUp(name, email, password);
    } catch (err) {
      if (err instanceof AuthError && err.field) {
        setFieldErrors({ [err.field]: err.message });
      } else {
        setFormError(err instanceof AuthError ? err.message : 'Não foi possível criar a conta. Tente novamente.');
      }
      setSubmitting(false);
    }
  }

  return (
    <AuthLayout
      title="Criar conta"
      subtitle="Seus favoritos e países visitados ficam salvos neste aparelho."
      error={formError}
    >
      <TextField
        label="Nome"
        value={name}
        onChangeText={setName}
        error={fieldErrors.name}
        autoComplete="name"
        textContentType="name"
        returnKeyType="next"
      />
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
        label={`Senha (mínimo de ${MIN_PASSWORD_LENGTH} caracteres)`}
        value={password}
        onChangeText={setPassword}
        error={fieldErrors.password}
        secureTextEntry
        autoComplete="new-password"
        textContentType="newPassword"
        returnKeyType="next"
      />
      <TextField
        label="Confirmar senha"
        value={confirm}
        onChangeText={setConfirm}
        error={fieldErrors.confirm}
        secureTextEntry
        autoComplete="new-password"
        textContentType="newPassword"
        returnKeyType="go"
        onSubmitEditing={handleSubmit}
      />
      <View style={styles.actions}>
        <PrimaryButton title="Cadastrar" onPress={handleSubmit} loading={submitting} />
        <PrimaryButton
          title="Já tenho conta"
          variant="ghost"
          onPress={() => navigation.goBack()}
          disabled={submitting}
          accessibilityHint="Volta para a tela de login"
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
