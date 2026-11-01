import { useCallback } from 'react';
import { FlatList, ListRenderItem, StyleSheet } from 'react-native';

import { CountryListItem } from '../components/CountryListItem';
import { EmptyState } from '../components/EmptyState';
import { FavoriteButton } from '../components/FavoriteButton';
import { LoadingView } from '../components/LoadingView';
import { PrimaryButton } from '../components/PrimaryButton';
import { useFavorites } from '../hooks/useFavorites';
import { AppStackScreenProps } from '../navigation/types';
import { SavedCountry } from '../types/country';
import { spacing } from '../theme/spacing';
import { regionLabel } from '../utils/format';

type Props = AppStackScreenProps<'Favorites'>;

const keyExtractor = (item: SavedCountry) => item.code;

export function FavoritesScreen({ navigation }: Props) {
  const { favorites, toggleFavorite, hydrated } = useFavorites();

  const openDetails = useCallback(
    (code: string) => navigation.navigate('Details', { code }),
    [navigation],
  );

  const renderItem = useCallback<ListRenderItem<SavedCountry>>(
    ({ item }) => (
      <CountryListItem
        country={item}
        subtitle={regionLabel(item.region)}
        onPress={openDetails}
        right={<FavoriteButton active countryName={item.name} onPress={() => toggleFavorite(item)} />}
      />
    ),
    [openDetails, toggleFavorite],
  );

  // Nunca mostra a lista "zerada" antes de ler o AsyncStorage.
  if (!hydrated) return <LoadingView message="Carregando favoritos…" />;

  return (
    <FlatList
      data={favorites}
      keyExtractor={keyExtractor}
      renderItem={renderItem}
      contentContainerStyle={styles.list}
      ListEmptyComponent={
        <EmptyState
          icon="heart-outline"
          title="Nenhum favorito ainda"
          message="Toque no coração de um país para guardá-lo aqui."
          action={
            <PrimaryButton title="Explorar países" icon="earth-outline" onPress={() => navigation.popToTop()} />
          }
        />
      }
    />
  );
}

const styles = StyleSheet.create({
  list: {
    flexGrow: 1,
    paddingVertical: spacing.sm,
  },
});
