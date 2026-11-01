import { createContext, ReactNode, useCallback, useMemo } from 'react';

import { STORAGE_KEYS } from '../constants';
import { useAuth } from '../hooks/useAuth';
import { useUserStorage } from '../hooks/useUserStorage';
import { SavedCountry } from '../types/country';

export interface FavoritesContextValue {
  favorites: SavedCountry[];
  isFavorite: (code: string) => boolean;
  toggleFavorite: (country: SavedCountry) => void;
  /** false até os favoritos do usuário serem lidos do AsyncStorage. */
  hydrated: boolean;
}

export const FavoritesContext = createContext<FavoritesContextValue | null>(null);

const EMPTY: SavedCountry[] = [];

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const { value: favorites, hydrated, update } = useUserStorage<SavedCountry[]>(
    user ? STORAGE_KEYS.favorites(user.id) : null,
    EMPTY,
  );

  const favoriteCodes = useMemo(() => new Set(favorites.map((f) => f.code)), [favorites]);

  const isFavorite = useCallback((code: string) => favoriteCodes.has(code), [favoriteCodes]);

  // Estável (não depende do estado), então não força re-render dos cards.
  const toggleFavorite = useCallback(
    (country: SavedCountry) => {
      update((prev) => {
        if (prev.some((f) => f.code === country.code)) {
          return prev.filter((f) => f.code !== country.code);
        }
        // Guarda só o objeto mínimo, para a tela de favoritos funcionar offline.
        const { code, name, flagUrl, region } = country;
        return [...prev, { code, name, flagUrl, region }];
      });
    },
    [update],
  );

  const value = useMemo(
    () => ({ favorites, isFavorite, toggleFavorite, hydrated }),
    [favorites, isFavorite, toggleFavorite, hydrated],
  );

  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>;
}
