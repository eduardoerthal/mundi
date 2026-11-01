/** Dados não sensíveis do usuário, guardados no AsyncStorage. */
export interface PublicUser {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

/** Guardado apenas no SecureStore. */
export interface StoredCredentials {
  salt: string;
  hash: string;
}
