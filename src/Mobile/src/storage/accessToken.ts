let token: string | null = null;

export function setToken(newToken: string | null) {
  token = newToken;
}

export function getToken() {
  return token;
}
