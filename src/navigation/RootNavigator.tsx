import { DefaultTheme, NavigationContainer, Theme } from '@react-navigation/native';

import { LoadingView } from '../components/LoadingView';
import { useAuth } from '../hooks/useAuth';
import { colors } from '../theme/colors';
import { AppStack } from './AppStack';
import { AuthStack } from './AuthStack';

const theme: Theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: colors.primary,
    background: colors.background,
    card: colors.surface,
    text: colors.text,
    border: colors.border,
  },
};

// Navegação condicional: o stack exibido depende só de `user` no AuthContext.
// Login/logout não chamam navigate(); a troca de árvore acontece aqui.
export function RootNavigator() {
  const { user, loading } = useAuth();

  if (loading) return <LoadingView message="Restaurando sua sessão…" />;

  return (
    <NavigationContainer theme={theme}>{user ? <AppStack /> : <AuthStack />}</NavigationContainer>
  );
}
