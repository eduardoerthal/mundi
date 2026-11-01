import { useCallback, useEffect, useRef, useState } from 'react';

import { PAGE_SIZE } from '../constants';
import { AppError, toAppError } from '../services/api';
import { getPage } from '../services/countriesService';
import { CountrySummary, RegionFilterValue } from '../types/country';

type LoadMode = 'initial' | 'refresh' | 'more';

/**
 * Catálogo com PAGINAÇÃO NO SERVIDOR (rolagem infinita).
 *
 * Cada página é um GET com limit=PAGE_SIZE e offset = itens já carregados.
 * loadMore() anexa a próxima página à lista; refresh() e a troca de região
 * recomeçam do offset 0. O filtro por região também é aplicado no servidor.
 *
 * Proteções: flags `loadingMore`/`hasMore` evitam disparos em rajada do
 * onEndReached, e um AbortController cancela a requisição anterior quando a
 * região muda ou a tela desmonta (resposta antiga nunca entra na lista).
 */
export function useCountries() {
  const [countries, setCountries] = useState<CountrySummary[]>([]);
  const [region, setRegionState] = useState<RegionFilterValue>('all');
  const [totalCount, setTotalCount] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<AppError | null>(null);
  /** Falha ao buscar a PRÓXIMA página: a lista atual continua na tela. */
  const [loadMoreError, setLoadMoreError] = useState<AppError | null>(null);

  const controllerRef = useRef<AbortController | null>(null);
  // Espelho síncrono de loadingMore: dois onEndReached no mesmo frame
  // ainda veriam o state antigo.
  const busyRef = useRef(false);

  const load = useCallback(
    async (mode: LoadMode, offset: number, regionValue: RegionFilterValue) => {
      controllerRef.current?.abort();
      const controller = new AbortController();
      controllerRef.current = controller;
      busyRef.current = true;

      if (mode === 'initial') setLoading(true);
      if (mode === 'refresh') setRefreshing(true);
      if (mode === 'more') setLoadingMore(true);
      if (mode === 'more') setLoadMoreError(null);
      else setError(null);

      try {
        const page = await getPage(
          { offset, limit: PAGE_SIZE, region: regionValue === 'all' ? undefined : regionValue },
          controller.signal,
        );
        if (controller.signal.aborted) return;

        setCountries((prev) => {
          if (mode !== 'more') return page.items;
          // Defesa extra contra duplicatas caso a base mude entre páginas.
          const seen = new Set(prev.map((c) => c.code));
          return [...prev, ...page.items.filter((c) => !seen.has(c.code))];
        });
        setTotalCount(page.total);
        setHasMore(page.hasMore);
        if (mode !== 'more') setLoadMoreError(null);
      } catch (err) {
        if (controller.signal.aborted) return;
        if (mode === 'more') setLoadMoreError(toAppError(err));
        else setError(toAppError(err));
      } finally {
        if (!controller.signal.aborted) {
          busyRef.current = false;
          setLoading(false);
          setRefreshing(false);
          setLoadingMore(false);
        }
      }
    },
    [],
  );

  useEffect(() => {
    load('initial', 0, 'all');
    return () => controllerRef.current?.abort();
  }, [load]);

  const loadMore = useCallback(() => {
    // Não dispara em rajada, nem depois do fim, nem em loop após um erro
    // (o usuário tenta de novo pelo botão do footer).
    if (busyRef.current || loading || !hasMore || loadMoreError) return;
    load('more', countries.length, region);
  }, [load, loading, hasMore, loadMoreError, countries.length, region]);

  const retryLoadMore = useCallback(() => {
    if (busyRef.current) return;
    load('more', countries.length, region);
  }, [load, countries.length, region]);

  const refresh = useCallback(() => load('refresh', 0, region), [load, region]);
  const retry = useCallback(() => load('initial', 0, region), [load, region]);

  const setRegion = useCallback(
    (value: RegionFilterValue) => {
      setRegionState(value);
      setCountries([]); // troca de filtro reinicia a paginação
      setHasMore(true);
      load('initial', 0, value);
    },
    [load],
  );

  return {
    countries,
    totalCount,
    hasData: countries.length > 0,
    region,
    setRegion,
    loading,
    refreshing,
    loadingMore,
    hasMore,
    error,
    loadMoreError,
    loadMore,
    retryLoadMore,
    refresh,
    retry,
  };
}
