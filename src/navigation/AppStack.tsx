import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { LoadingView } from '../components/LoadingView';
import { useFavorites } from '../hooks/useFavorites';
import { CatalogScreen } from '../screens/CatalogScreen';
import { DetailsScreen } from '../screens/DetailsScreen';
import { FavoritesScreen } from '../screens/FavoritesScreen';
import { stackScreenOptions } from './screenOptions';
import { AppStackParamList } from './types';

const Stack = createNativeStackNavigator<AppStackParamList>();

export function AppStack() {
  const { hydrated: favoritesHydrated } = useFavorites();

  // Só entra no app depois de ler os dados salvos do usuário (RF06).
  if (!favoritesHydrated) return <LoadingView message="Carregando seus dados…" />;

  return (
    <Stack.Navigator screenOptions={stackScreenOptions}>
      <Stack.Screen name="Catalog" component={CatalogScreen} options={{ title: 'Mundi' }} />
      {/* O título final é definido pela tela com setOptions após carregar o país. */}
      <Stack.Screen name="Details" component={DetailsScreen} options={{ title: 'Detalhes' }} />
      <Stack.Screen name="Favorites" component={FavoritesScreen} options={{ title: 'Favoritos' }} />
    </Stack.Navigator>
  );
}
