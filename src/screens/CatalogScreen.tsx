import { useCallback, useLayoutEffect } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  ListRenderItem,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { CountryCard } from '../components/CountryCard';
import { EmptyState } from '../components/EmptyState';
import { ErrorView } from '../components/ErrorView';
import { IconButton } from '../components/IconButton';
import { LoadingView } from '../components/LoadingView';
import { PrimaryButton } from '../components/PrimaryButton';
import { RegionFilter } from '../components/RegionFilter';
import { useAuth } from '../hooks/useAuth';
import { useCountries } from '../hooks/useCountries';
import { useFavorites } from '../hooks/useFavorites';
import { AppStackScreenProps } from '../navigation/types';
import { CountrySummary } from '../types/country';
import { colors } from '../theme/colors';
import { fontSize, spacing } from '../theme/spacing';

type Props = AppStackScreenProps<'Catalog'>;

const keyExtractor = (item: CountrySummary) => item.code;

export function CatalogScreen({ navigation }: Props) {
  const { signOut } = useAuth();
  const { isFavorite, toggleFavorite } = useFavorites();
  const {
    countries,
    totalCount,
    hasData,
    region,
    setRegion,
    loading,
    refreshing,
    loadingMore,
    error,
    loadMoreError,
    loadMore,
    retryLoadMore,
    refresh,
    retry,
  } = useCountries();

  const confirmSignOut = useCallback(() => {
    Alert.alert('Sair da conta', 'Deseja mesmo sair?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Sair', style: 'destructive', onPress: signOut },
    ]);
  }, [signOut]);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <View style={styles.headerActions}>
          <IconButton
            icon="search-outline"
            label="Buscar país"
            onPress={() => navigation.navigate('Search')}
          />
          <IconButton
            icon="heart-outline"
            label="Abrir favoritos"
            onPress={() => navigation.navigate('Favorites')}
          />
          <IconButton
            icon="airplane-outline"
            label="Abrir países visitados"
            onPress={() => navigation.navigate('Visited')}
          />
          <IconButton icon="log-out-outline" label="Sair da conta" onPress={confirmSignOut} />
        </View>
      ),
    });
  }, [navigation, confirmSignOut]);

  const openDetails = useCallback(
    (country: CountrySummary) => navigation.navigate('Details', { code: country.code }),
    [navigation],
  );

  const renderItem = useCallback<ListRenderItem<CountrySummary>>(
    ({ item }) => (
      <View style={styles.cell}>
        <CountryCard
          country={item}
          isFavorite={isFavorite(item.code)}
          onPress={openDetails}
          onToggleFavorite={toggleFavorite}
        />
      </View>
    ),
    [openDetails, isFavorite, toggleFavorite],
  );

  // Tela cheia só na primeira carga; ao trocar de região o filtro continua visível.
  if (region === 'all' && !hasData) {
    if (loading) return <LoadingView message="Carregando países…" />;
    if (error) return <ErrorView message={error.message} onRetry={retry} />;
  }

  return (
    <FlatList
      data={countries}
      keyExtractor={keyExtractor}
      renderItem={renderItem}
      numColumns={2}
      contentContainerStyle={styles.list}
      onEndReached={loadMore}
      onEndReachedThreshold={0.5}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={refresh}
          colors={[colors.primary]}
          tintColor={colors.primary}
        />
      }
      ListHeaderComponent={
        <View>
          <RegionFilter value={region} onChange={setRegion} />
          {error && hasData ? (
            <Text style={styles.inlineError} accessibilityRole="alert">
              {error.message} Puxe a lista para baixo para tentar de novo.
            </Text>
          ) : null}
          <Text style={styles.count} accessibilityLiveRegion="polite">
            {totalCount} {totalCount === 1 ? 'país' : 'países'}
          </Text>
        </View>
      }
      ListEmptyComponent={
        loading ? (
          <ActivityIndicator
            style={styles.footer}
            size="large"
            color={colors.primary}
            accessibilityLabel="Carregando países"
          />
        ) : error ? (
          <ErrorView message={error.message} onRetry={retry} />
        ) : (
          <EmptyState icon="earth-outline" title="Nenhum país nesta região" />
        )
      }
      ListFooterComponent={
        loadingMore ? (
          <ActivityIndicator
            style={styles.footer}
            color={colors.primary}
            accessibilityLabel="Carregando mais países"
          />
        ) : loadMoreError ? (
          // A API caiu no meio da rolagem: mantém o que já carregou e oferece nova tentativa.
          <View style={styles.footerError}>
            <Text style={styles.footerErrorText} accessibilityRole="alert">
              {loadMoreError.message}
            </Text>
            <PrimaryButton
              title="Tentar novamente"
              icon="refresh"
              variant="outline"
              onPress={retryLoadMore}
              accessibilityHint="Busca a próxima página de países"
            />
          </View>
        ) : undefined
      }
    />
  );
}

const styles = StyleSheet.create({
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  list: {
    paddingHorizontal: spacing.sm,
    paddingBottom: spacing.xxl,
  },
  // Cada célula ocupa metade da linha, inclusive a última quando é ímpar.
  cell: {
    width: '50%',
    padding: spacing.sm,
  },
  count: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xs,
    fontSize: fontSize.sm,
    color: colors.textMuted,
  },
  inlineError: {
    marginHorizontal: spacing.md,
    marginBottom: spacing.sm,
    fontSize: fontSize.sm,
    color: colors.danger,
  },
  footer: {
    paddingVertical: spacing.xl,
  },
  footerError: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  footerErrorText: {
    fontSize: fontSize.md,
    color: colors.danger,
    textAlign: 'center',
  },
});
