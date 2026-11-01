import axios from 'axios';

import { API_MAX_LIMIT } from '../constants';
import {
  ApiCountry,
  ApiListResponse,
  CountryDetails,
  CountrySummary,
  Neighbor,
} from '../types/country';
import { stripHtml } from '../utils/stripHtml';
import { api, notFoundError, toAppError } from './api';

const SUMMARY_FIELDS = [
  'names.common',
  'codes.alpha_3',
  'flag.url_png',
  'flag.description',
  'region',
  'capitals',
  'population',
].join(',');

const DETAIL_FIELDS = [
  SUMMARY_FIELDS,
  'names.official',
  'subregion',
  'area.kilometers',
  'languages',
  'currencies',
  'borders',
  'timezones',
  'links.google_maps',
  'links.open_street_maps',
].join(',');

// ---------- conversão do formato da API para o modelo do app ----------

function toSummary(raw: ApiCountry): CountrySummary {
  const name = stripHtml(raw.names?.common) || 'País sem nome';
  return {
    code: raw.codes?.alpha_3 ?? name,
    name,
    flagUrl: raw.flag?.url_png || null,
    flagDescription: stripHtml(raw.flag?.description) || null,
    region: raw.region ?? '',
    capital:
      raw.capitals
        ?.map((c) => stripHtml(c.name))
        .filter(Boolean)
        .join(', ') || null,
    population: raw.population ?? null,
  };
}

function toDetails(raw: ApiCountry): CountryDetails {
  const summary = toSummary(raw);
  return {
    ...summary,
    officialName: stripHtml(raw.names?.official) || summary.name,
    subregion: stripHtml(raw.subregion) || null,
    area: raw.area?.kilometers ?? null,
    languages: (raw.languages ?? []).map((l) => stripHtml(l.name)).filter(Boolean),
    currencies: (raw.currencies ?? [])
      .map((c) => {
        const name = stripHtml(c.name);
        const extra = [c.code, c.symbol].filter(Boolean).join(', ');
        return extra ? `${name} (${extra})` : name;
      })
      .filter(Boolean),
    timezones: raw.timezones ?? [],
    borders: raw.borders ?? [],
    mapsUrl: raw.links?.google_maps || raw.links?.open_street_maps || null,
  };
}

const byName = (a: CountrySummary, b: CountrySummary) => a.name.localeCompare(b.name, 'pt-BR');

// ---------------------------- endpoints ----------------------------

/**
 * Busca TODOS os países de uma vez. A API pagina com no máximo 100 itens por
 * chamada, então percorremos as páginas até `meta.more` ser falso (~3 chamadas).
 * A fatia de 20 em 20 exibida no catálogo é feita no cliente (useCountries).
 */
export async function getAll(signal?: AbortSignal): Promise<CountrySummary[]> {
  try {
    const all: ApiCountry[] = [];
    let offset = 0;
    let more = true;
    while (more) {
      const { data } = await api.get<ApiListResponse<ApiCountry>>('', {
        params: { limit: API_MAX_LIMIT, offset, response_fields: SUMMARY_FIELDS },
        signal,
      });
      const { objects, meta } = data.data;
      all.push(...objects);
      offset += API_MAX_LIMIT;
      more = objects.length > 0 && (meta.more ?? offset < meta.total);
    }
    return all.map(toSummary).sort(byName);
  } catch (error) {
    throw toAppError(error);
  }
}

/**
 * Busca por nome (agregado `name`: comum, oficial, alternativos e nativos;
 * por isso "Brasil" encontra o Brazil). Sem resultados = lista vazia, não erro.
 */
export async function searchByName(text: string, signal?: AbortSignal): Promise<CountrySummary[]> {
  const query = text.trim();
  if (!query) return [];
  try {
    const { data } = await api.get<ApiListResponse<ApiCountry>>('/name', {
      params: { q: query, limit: API_MAX_LIMIT, response_fields: SUMMARY_FIELDS },
      signal,
    });
    return data.data.objects.map(toSummary).sort(byName);
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404) return [];
    throw toAppError(error);
  }
}

export async function getByCode(code: string, signal?: AbortSignal): Promise<CountryDetails> {
  try {
    const { data } = await api.get<ApiListResponse<ApiCountry>>(
      `/codes.alpha_3/${encodeURIComponent(code)}`,
      { params: { response_fields: DETAIL_FIELDS }, signal },
    );
    const raw = data.data.objects[0];
    if (!raw) throw notFoundError(`Não encontramos o país com o código ${code}.`);
    return toDetails(raw);
  } catch (error) {
    const appError = toAppError(error);
    if (appError.kind === 'notFound') {
      throw notFoundError(`Não encontramos o país com o código ${code}.`);
    }
    throw appError;
  }
}

/** Busca reversa: países cuja lista `borders` contém `code` (os vizinhos). */
export async function getNeighbors(code: string, signal?: AbortSignal): Promise<Neighbor[]> {
  try {
    const { data } = await api.get<ApiListResponse<ApiCountry>>(
      `/borders/${encodeURIComponent(code)}`,
      { params: { limit: API_MAX_LIMIT, response_fields: 'names.common,codes.alpha_3' }, signal },
    );
    return data.data.objects.map((raw) => {
      const { code: neighborCode, name } = toSummary(raw);
      return { code: neighborCode, name };
    });
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404) return [];
    throw toAppError(error);
  }
}
