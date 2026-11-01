// Constantes do app centralizadas em um único lugar.

/** Tamanho da fatia exibida a cada onEndReached no catálogo. */
export const PAGE_SIZE = 20;

/** Maior `limit` aceito pela API no plano gratuito. */
export const API_MAX_LIMIT = 100;

export const REQUEST_TIMEOUT_MS = 10_000;

export const MIN_PASSWORD_LENGTH = 6;

export const STORAGE_KEYS = {
  users: '@mundi:users',
  session: '@mundi:session',
  favorites: (userId: string) => `@mundi:favorites:${userId}`,
  visited: (userId: string) => `@mundi:visited:${userId}`,
} as const;

// SecureStore só aceita letras, números, ".", "-" e "_" nas chaves.
export const SECURE_KEYS = {
  credentials: (userId: string) => `mundi_cred_${userId}`,
} as const;
