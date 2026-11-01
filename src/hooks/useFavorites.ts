import { useContext } from 'react';

import { FavoritesContext, FavoritesContextValue } from '../contexts/FavoritesContext';

export function useFavorites(): FavoritesContextValue {
  const context = useContext(FavoritesContext);
  if (!context) throw new Error('useFavorites deve ser usado dentro de <FavoritesProvider>.');
  return context;
}
