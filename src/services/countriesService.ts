import axios from 'axios';

import { API_MAX_LIMIT } from '../constants';
import {
  ApiCountry,
  ApiListResponse,
  CountryDetails,
  CountrySummary,
  Neighbor,
  Region,
} from '../types/country';
import { stripHtml } from '../utils/stripHtml';
import { api, notFoundError, toAppError } from './api';

const SUMMARY_FIELDS = [
  'uuid',
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
  'descriptions.long',
].join(',');

// ---------- conversão do formato da API para o modelo do app ----------

const ALPHA3_REGEX = /^[A-Z]{3}$/;

/** true quando o id é um cca3; caso contrário é o uuid de um território. */
export function isAlpha3(code: string): boolean {
  return ALPHA3_REGEX.test(code);
}

function toSummary(raw: ApiCountry): CountrySummary {
  const name = stripHtml(raw.names?.common) || 'País sem nome';
  return {
    // A API devolve alpha_3 = "" para alguns territórios; aí o uuid garante
    // uma chave única e estável (keyExtractor e navegação).
    code: raw.codes?.alpha_3 || raw.uuid || name,
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
    description: stripHtml(raw.descriptions?.long) || null,
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

export interface CountriesPage {
  items: CountrySummary[];
  total: number;
  hasMore: boolean;
}

/**
 * Uma página do catálogo, paginada no servidor com limit/offset. A API devolve
 * os países em ordem estável por nome, então páginas seguidas não repetem itens.
 * `region` filtra no servidor (undefined = todas).
 */
export async function getPage(
  { offset, limit, region }: { offset: number; limit: number; region?: Region },
  signal?: AbortSignal,
): Promise<CountriesPage> {
  try {
    const { data } = await api.get<ApiListResponse<ApiCountry>>('', {
      params: { limit, offset, region, response_fields: SUMMARY_FIELDS },
      signal,
    });
    const { objects, meta } = data.data;
    return {
      items: objects.map(toSummary),
      total: meta.total,
      hasMore: objects.length > 0 && (meta.more ?? offset + objects.length < meta.total),
    };
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
    const path = isAlpha3(code) ? `/codes.alpha_3/${code}` : `/uuid/${encodeURIComponent(code)}`;
    const { data } = await api.get<ApiListResponse<ApiCountry>>(path, {
      params: { response_fields: DETAIL_FIELDS },
      signal,
    });
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

/**
 * Busca reversa: países cuja lista `borders` contém `code` (os vizinhos).
 * Territórios sem cca3 não entram na busca reversa; para eles usamos os
 * códigos de `borders` como nome.
 */
export async function getNeighbors(
  code: string,
  borders: string[],
  signal?: AbortSignal,
): Promise<Neighbor[]> {
  if (!isAlpha3(code)) return borders.map((border) => ({ code: border, name: border }));
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
