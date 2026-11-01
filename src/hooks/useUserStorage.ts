import { useCallback, useEffect, useRef, useState } from 'react';

import { getItem, setItem } from '../services/storage';

interface State<T> {
  /** Chave de onde `value` foi lido; garante que salvamos no usuário certo. */
  key: string | null;
  value: T;
  hydrated: boolean;
}

/**
 * Estado persistido no AsyncStorage, com chave por usuário.
 *
 * - Carrega (hidrata) num useEffect sempre que a chave muda (troca de conta).
 * - Salva num useEffect que observa o valor, mas só depois de hidratar: assim
 *   o estado inicial vazio nunca sobrescreve os dados salvos.
 * - Grava na chave de onde o valor veio, e não na do usuário atual, para não
 *   misturar dados de duas contas no instante da troca.
 */
export function useUserStorage<T>(storageKey: string | null, fallback: T) {
  const fallbackRef = useRef(fallback);
  const [state, setState] = useState<State<T>>({ key: null, value: fallback, hydrated: false });

  useEffect(() => {
    let cancelled = false;
    setState({ key: null, value: fallbackRef.current, hydrated: false });
    if (!storageKey) return;

    getItem<T>(storageKey, fallbackRef.current).then((value) => {
      if (!cancelled) setState({ key: storageKey, value, hydrated: true });
    });
    return () => {
      cancelled = true;
    };
  }, [storageKey]);

  useEffect(() => {
    if (state.hydrated && state.key) setItem(state.key, state.value);
  }, [state]);

  // Atualizações antes da hidratação são ignoradas.
  const update = useCallback((updater: (prev: T) => T) => {
    setState((prev) => (prev.hydrated ? { ...prev, value: updater(prev.value) } : prev));
  }, []);

  return { value: state.value, hydrated: state.hydrated, update };
}
