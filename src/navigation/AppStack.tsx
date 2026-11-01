import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { CatalogScreen } from '../screens/CatalogScreen';
import { DetailsScreen } from '../screens/DetailsScreen';
import { stackScreenOptions } from './screenOptions';
import { AppStackParamList } from './types';

const Stack = createNativeStackNavigator<AppStackParamList>();

export function AppStack() {
  return (
    <Stack.Navigator screenOptions={stackScreenOptions}>
      <Stack.Screen name="Catalog" component={CatalogScreen} options={{ title: 'Mundi' }} />
      {/* O título final é definido pela tela com setOptions após carregar o país. */}
      <Stack.Screen name="Details" component={DetailsScreen} options={{ title: 'Detalhes' }} />
    </Stack.Navigator>
  );
}
