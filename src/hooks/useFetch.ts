import { DependencyList, useCallback, useEffect, useState } from 'react';

import { AppError, toAppError } from '../services/api';

interface FetchState<T> {
  data: T | null;
  loading: boolean;
  error: AppError | null;
}

/**
 * Hook genérico de requisição com estados explícitos (loading / error / data).
 * Cada execução cria um AbortController; o cleanup do useEffect cancela a
 * requisição anterior quando as deps mudam ou a tela desmonta, então uma
 * resposta antiga nunca sobrescreve o estado.
 */
export function useFetch<T>(
  fetcher: (signal: AbortSignal) => Promise<T>,
  deps: DependencyList,
) {
  const [state, setState] = useState<FetchState<T>>({ data: null, loading: true, error: null });
  const [attempt, setAttempt] = useState(0);

  // O fetcher é recriado a cada render; as deps informadas decidem quando refazer.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const run = useCallback(fetcher, deps);

  useEffect(() => {
    const controller = new AbortController();
    setState((prev) => ({ ...prev, loading: true, error: null }));

    run(controller.signal)
      .then((data) => {
        if (!controller.signal.aborted) setState({ data, loading: false, error: null });
      })
      .catch((err: unknown) => {
        if (!controller.signal.aborted) {
          setState({ data: null, loading: false, error: toAppError(err) });
        }
      });

    return () => controller.abort();
  }, [run, attempt]);

  const refetch = useCallback(() => setAttempt((n) => n + 1), []);

  return { ...state, refetch };
}
