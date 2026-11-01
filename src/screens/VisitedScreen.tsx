import { useCallback } from 'react';
import { FlatList, ListRenderItem, StyleSheet, View } from 'react-native';

import { CountryListItem } from '../components/CountryListItem';
import { EmptyState } from '../components/EmptyState';
import { LoadingView } from '../components/LoadingView';
import { PrimaryButton } from '../components/PrimaryButton';
import { StarRating } from '../components/StarRating';
import { useVisited } from '../hooks/useVisited';
import { AppStackScreenProps } from '../navigation/types';
import { VisitedCountry } from '../types/country';
import { spacing } from '../theme/spacing';
import { regionLabel } from '../utils/format';

type Props = AppStackScreenProps<'Visited'>;

const keyExtractor = (item: VisitedCountry) => item.code;

export function VisitedScreen({ navigation }: Props) {
  const { visited, hydrated } = useVisited();

  const openDetails = useCallback(
    (code: string) => navigation.navigate('Details', { code }),
    [navigation],
  );

  const renderItem = useCallback<ListRenderItem<VisitedCountry>>(
    ({ item }) => (
      <CountryListItem
        country={item}
        subtitle={`${regionLabel(item.region)} · ${item.rating ? `nota ${item.rating} de 5` : 'sem nota'}`}
        onPress={openDetails}
        right={
          <View style={styles.rating}>
            <StarRating value={item.rating} size={16} />
          </View>
        }
      />
    ),
    [openDetails],
  );

  if (!hydrated) return <LoadingView message="Carregando países visitados…" />;

  return (
    <FlatList
      data={visited}
      keyExtractor={keyExtractor}
      renderItem={renderItem}
      contentContainerStyle={styles.list}
      ListEmptyComponent={
        <EmptyState
          icon="airplane-outline"
          title="Nenhum país visitado"
          message='Abra um país e toque em "Já visitei" para registrar sua viagem e dar uma nota.'
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
  rating: {
    paddingRight: spacing.xs,
  },
});
