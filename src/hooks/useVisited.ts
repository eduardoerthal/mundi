import { useContext } from 'react';

import { VisitedContext, VisitedContextValue } from '../contexts/VisitedContext';

export function useVisited(): VisitedContextValue {
  const context = useContext(VisitedContext);
  if (!context) throw new Error('useVisited deve ser usado dentro de <VisitedProvider>.');
  return context;
}
