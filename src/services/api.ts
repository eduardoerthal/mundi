import axios from 'axios';

import { REQUEST_TIMEOUT_MS } from '../constants';

// Variáveis EXPO_PUBLIC_* são embutidas no bundle em tempo de build.
const baseURL = process.env.EXPO_PUBLIC_API_BASE_URL ?? 'https://api.restcountries.com/countries/v5';
const apiKey = process.env.EXPO_PUBLIC_API_KEY ?? '';

export const api = axios.create({
  baseURL,
  timeout: REQUEST_TIMEOUT_MS,
  headers: { Authorization: `Bearer ${apiKey}` },
});

export type AppErrorKind =
  | 'network'
  | 'timeout'
  | 'notFound'
  | 'unauthorized'
  | 'rateLimit'
  | 'server'
  | 'canceled'
  | 'unknown';

export class AppError extends Error {
  constructor(public kind: AppErrorKind, message: string) {
    super(message);
    this.name = 'AppError';
  }
}

const MESSAGES: Record<AppErrorKind, string> = {
  network: 'Sem conexão com a internet. Verifique sua rede e tente novamente.',
  timeout: 'O servidor demorou demais para responder. Tente novamente.',
  notFound: 'Não encontramos o que você procurava.',
  unauthorized: 'A chave da API é inválida ou não foi configurada no arquivo .env.',
  rateLimit: 'Muitas requisições em pouco tempo. Aguarde alguns segundos e tente de novo.',
  server: 'O serviço de países está instável no momento. Tente novamente mais tarde.',
  canceled: 'Requisição cancelada.',
  unknown: 'Algo deu errado. Tente novamente.',
};

/** Converte qualquer erro (Axios ou não) em um AppError com mensagem amigável. */
export function toAppError(error: unknown): AppError {
  if (error instanceof AppError) return error;
  if (axios.isCancel(error)) return new AppError('canceled', MESSAGES.canceled);

  if (axios.isAxiosError(error)) {
    if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
      return new AppError('timeout', MESSAGES.timeout);
    }
    const status = error.response?.status;
    if (status === undefined) return new AppError('network', MESSAGES.network);
    if (status === 404) return new AppError('notFound', MESSAGES.notFound);
    if (status === 401) return new AppError('unauthorized', MESSAGES.unauthorized);
    if (status === 403) {
      return new AppError('unauthorized', 'A cota mensal da API foi atingida ou o acesso foi bloqueado.');
    }
    if (status === 429) return new AppError('rateLimit', MESSAGES.rateLimit);
    if (status >= 500) return new AppError('server', MESSAGES.server);
  }
  return new AppError('unknown', MESSAGES.unknown);
}

export function notFoundError(message: string): AppError {
  return new AppError('notFound', message);
}
