import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { PAGE_SIZE } from '../constants';
import { AppError, toAppError } from '../services/api';
import { getAll } from '../services/countriesService';
import { CountrySummary, RegionFilterValue } from '../types/country';

// Atraso curto ao anexar a próxima fatia: deixa o footer com o
// ActivityIndicator aparecer e segura disparos repetidos do onEndReached.
const LOAD_MORE_DELAY_MS = 250;

/**
 * Catálogo com PAGINAÇÃO NO CLIENTE.
 *
 * A lista completa (~250 países) é buscada uma vez em getAll() e guardada em
 * memória. A FlatList recebe só `visible`, que cresce de PAGE_SIZE em PAGE_SIZE
 * a cada loadMore(). Assim o filtro por região é instantâneo, e a cota mensal
 * da API (1.000 requisições no plano grátis) é gasta só na carga e no refresh.
 */
export function useCountries() {
  const [all, setAll] = useState<CountrySummary[]>([]);
  const [region, setRegionState] = useState<RegionFilterValue>('all');
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<AppError | null>(null);

  const controllerRef = useRef<AbortController | null>(null);
  const loadMoreTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchAll = useCallback(async (mode: 'initial' | 'refresh') => {
    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;

    if (mode === 'initial') setLoading(true);
    else setRefreshing(true);
    setError(null);

    try {
      const countries = await getAll(controller.signal);
      if (controller.signal.aborted) return;
      setAll(countries);
      setVisibleCount(PAGE_SIZE); // refresh volta para a primeira fatia
    } catch (err) {
      if (controller.signal.aborted) return;
      setError(toAppError(err));
    } finally {
      if (!controller.signal.aborted) {
        setLoading(false);
        setRefreshing(false);
      }
    }
  }, []);

  useEffect(() => {
    fetchAll('initial');
    return () => {
      controllerRef.current?.abort();
      if (loadMoreTimer.current) clearTimeout(loadMoreTimer.current);
    };
  }, [fetchAll]);

  const filtered = useMemo(
    () => (region === 'all' ? all : all.filter((c) => c.region === region)),
    [all, region],
  );
  const visible = useMemo(() => filtered.slice(0, visibleCount), [filtered, visibleCount]);
  const hasMore = visibleCount < filtered.length;

  const loadMore = useCallback(() => {
    // Protege contra rajadas: ignora enquanto carrega ou quando acabou.
    if (loading || loadingMore || !hasMore) return;
    setLoadingMore(true);
    loadMoreTimer.current = setTimeout(() => {
      setVisibleCount((count) => count + PAGE_SIZE);
      setLoadingMore(false);
    }, LOAD_MORE_DELAY_MS);
  }, [loading, loadingMore, hasMore]);

  const setRegion = useCallback((value: RegionFilterValue) => {
    setRegionState(value);
    setVisibleCount(PAGE_SIZE); // trocar o filtro reinicia a paginação
  }, []);

  const refresh = useCallback(() => fetchAll('refresh'), [fetchAll]);
  const retry = useCallback(() => fetchAll('initial'), [fetchAll]);

  return {
    countries: visible,
    totalCount: filtered.length,
    hasData: all.length > 0,
    region,
    setRegion,
    loading,
    refreshing,
    loadingMore,
    hasMore,
    error,
    loadMore,
    refresh,
    retry,
  };
}
