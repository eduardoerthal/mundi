// ---------------------------------------------------------------------------
// Formato bruto da REST Countries v5 (apenas os campos que o app pede via
// `response_fields`). Tudo opcional porque a API omite campos vazios.
// ---------------------------------------------------------------------------

export interface ApiCountry {
  names?: { common?: string; official?: string };
  codes?: { alpha_3?: string };
  flag?: { url_png?: string; url_svg?: string; description?: string };
  region?: string;
  subregion?: string;
  capitals?: { name?: string }[];
  population?: number;
  area?: { kilometers?: number };
  languages?: { name?: string; native_name?: string }[];
  currencies?: { code?: string; name?: string; symbol?: string }[];
  borders?: string[];
  timezones?: string[];
  links?: { google_maps?: string; open_street_maps?: string };
}

export interface ApiListMeta {
  total: number;
  count?: number;
  limit?: number;
  offset?: number;
  more?: boolean;
}

export interface ApiListResponse<T> {
  data: {
    objects: T[];
    meta: ApiListMeta;
  };
}

// ---------------------------------------------------------------------------
// Modelos usados pelo app. O service converte ApiCountry -> estes tipos, então
// uma mudança na API fica isolada em countriesService.ts.
// ---------------------------------------------------------------------------

export const REGIONS = ['Africa', 'Americas', 'Asia', 'Europe', 'Oceania'] as const;
export type Region = (typeof REGIONS)[number];
export type RegionFilterValue = Region | 'all';

/** Item do catálogo e da busca. `code` = cca3 (alpha-3). */
export interface CountrySummary {
  code: string;
  name: string;
  flagUrl: string | null;
  flagDescription: string | null;
  region: string;
  capital: string | null;
  population: number | null;
}

export interface CountryDetails extends CountrySummary {
  officialName: string;
  subregion: string | null;
  area: number | null;
  languages: string[];
  currencies: string[];
  timezones: string[];
  borders: string[];
  mapsUrl: string | null;
}

export interface Neighbor {
  code: string;
  name: string;
}

/** Objeto mínimo salvo nos favoritos/visitados (dispensa nova requisição). */
export interface SavedCountry {
  code: string;
  name: string;
  flagUrl: string | null;
  region: string;
}

export interface VisitedCountry extends SavedCountry {
  /** Nota de 1 a 5; null enquanto o usuário não avaliou. */
  rating: number | null;
  visitedAt: string;
}
