import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, FlatList, ListRenderItem, StyleSheet, TextInput, View } from 'react-native';

import { CountryListItem } from '../components/CountryListItem';
import { EmptyState } from '../components/EmptyState';
import { ErrorView } from '../components/ErrorView';
import { FavoriteButton } from '../components/FavoriteButton';
import { PrimaryButton } from '../components/PrimaryButton';
import { useFavorites } from '../hooks/useFavorites';
import { AppStackScreenProps } from '../navigation/types';
import { AppError, toAppError } from '../services/api';
import { searchByName } from '../services/countriesService';
import { CountrySummary } from '../types/country';
import { colors } from '../theme/colors';
import { fontSize, radius, spacing, TOUCH_MIN } from '../theme/spacing';
import { regionLabel } from '../utils/format';

type Props = AppStackScreenProps<'Search'>;
type Status = 'idle' | 'loading' | 'success' | 'error';

const keyExtractor = (item: CountrySummary) => item.code;

export function SearchScreen({ navigation }: Props) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const [query, setQuery] = useState('');
  const [submittedQuery, setSubmittedQuery] = useState('');
  const [results, setResults] = useState<CountrySummary[]>([]);
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState<AppError | null>(null);

  // Cada nova busca cancela a anterior: uma resposta lenta nunca
  // sobrescreve o resultado de uma busca mais recente.
  const controllerRef = useRef<AbortController | null>(null);
  useEffect(() => () => controllerRef.current?.abort(), []);

  const runSearch = useCallback(async (text: string) => {
    const term = text.trim();
    if (!term) return;

    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;

    setSubmittedQuery(term);
    setStatus('loading');
    setError(null);
    try {
      const found = await searchByName(term, controller.signal);
      if (controller.signal.aborted) return;
      setResults(found);
      setStatus('success');
    } catch (err) {
      if (controller.signal.aborted) return;
      setError(toAppError(err));
      setStatus('error');
    }
  }, []);

  const openDetails = useCallback(
    (code: string) => navigation.navigate('Details', { code }),
    [navigation],
  );

  const renderItem = useCallback<ListRenderItem<CountrySummary>>(
    ({ item }) => (
      <CountryListItem
        country={item}
        subtitle={[regionLabel(item.region), item.capital].filter(Boolean).join(' · ')}
        onPress={openDetails}
        right={
          <FavoriteButton
            active={isFavorite(item.code)}
            countryName={item.name}
            onPress={() => toggleFavorite(item)}
          />
        }
      />
    ),
    [openDetails, isFavorite, toggleFavorite],
  );

  function renderContent() {
    if (status === 'loading') {
      return (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} accessibilityLabel="Buscando países" />
        </View>
      );
    }
    if (status === 'error' && error) {
      return <ErrorView message={error.message} onRetry={() => runSearch(submittedQuery)} />;
    }
    if (status === 'idle') {
      return (
        <EmptyState
          icon="search-outline"
          title="Busque um país"
          message='Digite o nome em inglês ou no idioma local (ex.: "Brasil", "Japan") e toque em Buscar.'
        />
      );
    }
    return (
      <FlatList
        data={results}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        keyboardShouldPersistTaps="handled"
        ListEmptyComponent={
          <EmptyState
            icon="sad-outline"
            title={`Nenhum país encontrado para '${submittedQuery}'`}
            message="Confira a grafia ou tente outro nome."
          />
        }
      />
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.searchBar} accessibilityRole="search">
        <TextInput
          value={query}
          onChangeText={setQuery}
          onSubmitEditing={() => runSearch(query)}
          placeholder="Nome do país"
          placeholderTextColor={colors.textMuted}
          returnKeyType="search"
          autoCorrect={false}
          autoFocus
          accessible
          accessibilityLabel="Nome do país para buscar"
          style={styles.input}
        />
        <PrimaryButton
          title="Buscar"
          icon="search"
          onPress={() => runSearch(query)}
          disabled={!query.trim()}
          loading={status === 'loading'}
        />
      </View>
      {renderContent()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchBar: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.lg,
  },
  input: {
    flexGrow: 1,
    flexBasis: 180,
    minHeight: TOUCH_MIN + 4,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: fontSize.lg,
    color: colors.text,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  list: {
    flexGrow: 1,
    paddingBottom: spacing.xl,
  },
});
