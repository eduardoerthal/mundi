import { NativeStackNavigationOptions } from '@react-navigation/native-stack';

import { colors } from '../theme/colors';

export const stackScreenOptions: NativeStackNavigationOptions = {
  headerStyle: { backgroundColor: colors.surface },
  headerTintColor: colors.primary,
  headerTitleStyle: { color: colors.text, fontWeight: '700' },
  contentStyle: { backgroundColor: colors.background },
  headerBackButtonDisplayMode: 'minimal',
};
