import * as Crypto from 'expo-crypto';
import * as SecureStore from 'expo-secure-store';

import { MIN_PASSWORD_LENGTH, SECURE_KEYS, STORAGE_KEYS } from '../constants';
import { PublicUser, StoredCredentials } from '../types/user';
import { getItem, removeItem, setItem } from './storage';

export type AuthField = 'name' | 'email' | 'password';

export class AuthError extends Error {
  constructor(message: string, public field?: AuthField) {
    super(message);
    this.name = 'AuthError';
  }
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function validateEmail(email: string): string | null {
  if (!email.trim()) return 'Informe seu e-mail.';
  if (!EMAIL_REGEX.test(normalizeEmail(email))) return 'Digite um e-mail válido, como nome@exemplo.com.';
  return null;
}

export function validatePassword(password: string): string | null {
  if (password.length < MIN_PASSWORD_LENGTH) {
    return `A senha precisa ter pelo menos ${MIN_PASSWORD_LENGTH} caracteres.`;
  }
  return null;
}

function toHex(bytes: Uint8Array): string {
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
}

// SHA-256 de salt + senha; o salt é aleatório e diferente para cada usuário.
async function hashPassword(password: string, salt: string): Promise<string> {
  return Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, `${salt}:${password}`);
}

async function getUsers(): Promise<PublicUser[]> {
  return getItem<PublicUser[]>(STORAGE_KEYS.users, []);
}

async function readCredentials(userId: string): Promise<StoredCredentials | null> {
  try {
    const raw = await SecureStore.getItemAsync(SECURE_KEYS.credentials(userId));
    return raw ? (JSON.parse(raw) as StoredCredentials) : null;
  } catch {
    return null;
  }
}

export async function signUp(name: string, email: string, password: string): Promise<PublicUser> {
  const trimmedName = name.trim();
  if (!trimmedName) throw new AuthError('Informe seu nome.', 'name');

  const emailError = validateEmail(email);
  if (emailError) throw new AuthError(emailError, 'email');

  const passwordError = validatePassword(password);
  if (passwordError) throw new AuthError(passwordError, 'password');

  const normalized = normalizeEmail(email);
  const users = await getUsers();
  if (users.some((u) => u.email === normalized)) {
    throw new AuthError('Já existe uma conta com este e-mail. Faça login.', 'email');
  }

  const user: PublicUser = {
    id: Crypto.randomUUID(),
    name: trimmedName,
    email: normalized,
    createdAt: new Date().toISOString(),
  };
  const salt = toHex(Crypto.getRandomBytes(16));
  const credentials: StoredCredentials = { salt, hash: await hashPassword(password, salt) };

  try {
    await SecureStore.setItemAsync(SECURE_KEYS.credentials(user.id), JSON.stringify(credentials));
  } catch {
    throw new AuthError('Não foi possível salvar sua senha com segurança neste aparelho.');
  }

  const saved = await setItem(STORAGE_KEYS.users, [...users, user]);
  if (!saved) throw new AuthError('Não foi possível concluir o cadastro. Tente novamente.');

  await setItem(STORAGE_KEYS.session, user.id);
  return user;
}

export async function signIn(email: string, password: string): Promise<PublicUser> {
  const emailError = validateEmail(email);
  if (emailError) throw new AuthError(emailError, 'email');
  if (!password) throw new AuthError('Informe sua senha.', 'password');

  // Mensagem genérica de propósito: não revela se o e-mail existe.
  const invalid = new AuthError('E-mail ou senha incorretos.');

  const users = await getUsers();
  const user = users.find((u) => u.email === normalizeEmail(email));
  if (!user) throw invalid;

  const credentials = await readCredentials(user.id);
  if (!credentials) throw invalid;

  const hash = await hashPassword(password, credentials.salt);
  if (hash !== credentials.hash) throw invalid;

  await setItem(STORAGE_KEYS.session, user.id);
  return user;
}

export async function restoreSession(): Promise<PublicUser | null> {
  const userId = await getItem<string | null>(STORAGE_KEYS.session, null);
  if (!userId) return null;
  const users = await getUsers();
  return users.find((u) => u.id === userId) ?? null;
}

export async function signOut(): Promise<void> {
  await removeItem(STORAGE_KEYS.session);
}
