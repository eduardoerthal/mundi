import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { LoadingView } from '../components/LoadingView';
import { useFavorites } from '../hooks/useFavorites';
import { useVisited } from '../hooks/useVisited';
import { CatalogScreen } from '../screens/CatalogScreen';
import { DetailsScreen } from '../screens/DetailsScreen';
import { FavoritesScreen } from '../screens/FavoritesScreen';
import { SearchScreen } from '../screens/SearchScreen';
import { VisitedScreen } from '../screens/VisitedScreen';
import { stackScreenOptions } from './screenOptions';
import { AppStackParamList } from './types';

const Stack = createNativeStackNavigator<AppStackParamList>();

export function AppStack() {
  const { hydrated: favoritesHydrated } = useFavorites();
  const { hydrated: visitedHydrated } = useVisited();

  // Só entra no app depois de ler os dados salvos do usuário (RF06).
  if (!favoritesHydrated || !visitedHydrated) {
    return <LoadingView message="Carregando seus dados…" />;
  }

  return (
    <Stack.Navigator screenOptions={stackScreenOptions}>
      <Stack.Screen name="Catalog" component={CatalogScreen} options={{ title: 'Mundi' }} />
      {/* O título final é definido pela tela com setOptions após carregar o país. */}
      <Stack.Screen name="Details" component={DetailsScreen} options={{ title: 'Detalhes' }} />
      <Stack.Screen name="Search" component={SearchScreen} options={{ title: 'Buscar' }} />
      <Stack.Screen name="Favorites" component={FavoritesScreen} options={{ title: 'Favoritos' }} />
      <Stack.Screen name="Visited" component={VisitedScreen} options={{ title: 'Países visitados' }} />
    </Stack.Navigator>
  );
}
