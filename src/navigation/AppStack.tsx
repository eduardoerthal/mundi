import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { CatalogScreen } from '../screens/CatalogScreen';
import { stackScreenOptions } from './screenOptions';
import { AppStackParamList } from './types';

const Stack = createNativeStackNavigator<AppStackParamList>();

export function AppStack() {
  return (
    <Stack.Navigator screenOptions={stackScreenOptions}>
      <Stack.Screen name="Catalog" component={CatalogScreen} options={{ title: 'Mundi' }} />
    </Stack.Navigator>
  );
}
