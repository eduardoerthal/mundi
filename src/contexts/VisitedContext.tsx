import { createContext, ReactNode, useCallback, useMemo } from 'react';

import { STORAGE_KEYS } from '../constants';
import { useAuth } from '../hooks/useAuth';
import { useUserStorage } from '../hooks/useUserStorage';
import { SavedCountry, VisitedCountry } from '../types/country';

export interface VisitedContextValue {
  visited: VisitedCountry[];
  isVisited: (code: string) => boolean;
  getRating: (code: string) => number | null;
  toggleVisited: (country: SavedCountry) => void;
  setRating: (code: string, rating: number) => void;
  hydrated: boolean;
}

export const VisitedContext = createContext<VisitedContextValue | null>(null);

const EMPTY: VisitedCountry[] = [];

export function VisitedProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const { value: visited, hydrated, update } = useUserStorage<VisitedCountry[]>(
    user ? STORAGE_KEYS.visited(user.id) : null,
    EMPTY,
  );

  const byCode = useMemo(() => new Map(visited.map((v) => [v.code, v])), [visited]);

  const isVisited = useCallback((code: string) => byCode.has(code), [byCode]);
  const getRating = useCallback((code: string) => byCode.get(code)?.rating ?? null, [byCode]);

  const toggleVisited = useCallback(
    (country: SavedCountry) => {
      update((prev) => {
        if (prev.some((v) => v.code === country.code)) {
          return prev.filter((v) => v.code !== country.code);
        }
        const { code, name, flagUrl, region } = country;
        return [...prev, { code, name, flagUrl, region, rating: null, visitedAt: new Date().toISOString() }];
      });
    },
    [update],
  );

  const setRating = useCallback(
    (code: string, rating: number) => {
      const clamped = Math.min(5, Math.max(1, Math.round(rating)));
      update((prev) => prev.map((v) => (v.code === code ? { ...v, rating: clamped } : v)));
    },
    [update],
  );

  const value = useMemo(
    () => ({ visited, isVisited, getRating, toggleVisited, setRating, hydrated }),
    [visited, isVisited, getRating, toggleVisited, setRating, hydrated],
  );

  return <VisitedContext.Provider value={value}>{children}</VisitedContext.Provider>;
}
