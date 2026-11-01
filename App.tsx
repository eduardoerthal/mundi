import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AuthProvider } from './src/contexts/AuthContext';
import { FavoritesProvider } from './src/contexts/FavoritesContext';
import { VisitedProvider } from './src/contexts/VisitedContext';
import { RootNavigator } from './src/navigation/RootNavigator';

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <FavoritesProvider>
          <VisitedProvider>
            <StatusBar style="dark" />
            <RootNavigator />
          </VisitedProvider>
        </FavoritesProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
