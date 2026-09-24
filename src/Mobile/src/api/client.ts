import axios from "axios";
import type { InternalAxiosRequestConfig } from "axios";
import { getToken, setToken } from "../storage/accessToken";
import {
  deleteRefreshToken,
  readRefreshToken,
  saveRefreshToken,
} from "../storage/tokenStorage";
import { refreshSession } from "./auth";

const BASE_URL = "http://192.168.1.131:5003";

type RetryConfig = InternalAxiosRequestConfig & { _retry?: boolean };

const instance = axios.create({
  baseURL: BASE_URL,
  timeout: 5000,
});

instance.interceptors.request.use(
  function (config) {
    const accessToken = getToken();

    if (accessToken !== null) {
      config.headers["Authorization"] = `Bearer ${accessToken}`;
    }

    return config;
  },
  function (error) {
    return Promise.reject(error);
  },
);

let ongoingRefresh: Promise<void> | null = null;
let sessionExpired: (() => void) | null = null;

export async function refreshTokens() {
  const storedRefreshToken = await readRefreshToken();
  if (storedRefreshToken === null) {
    throw new Error("Brak refresh tokenu");
  }
  const tokenRefreshSession = await refreshSession({
    refreshToken: storedRefreshToken,
  });

  await saveRefreshToken(tokenRefreshSession.refreshToken);

  setToken(tokenRefreshSession.token);
}

instance.interceptors.response.use(
  function (response) {
    return response;
  },
  async function (error) {
    const originalRequest = error.config as RetryConfig;
    if (error.response?.status === 401 && originalRequest._retry !== true) {
      try {
        if (ongoingRefresh === null) {
          ongoingRefresh = refreshTokens().finally(() => {
            ongoingRefresh = null;
          });
        }
        await ongoingRefresh;
      } catch {
        await deleteRefreshToken();
        setToken(null);
        sessionExpired?.();
        return Promise.reject(error);
      }

      originalRequest._retry = true;

      return instance(originalRequest);
    }
    return Promise.reject(error);
  },
);

export const authClient = axios.create({
  baseURL: BASE_URL,
  timeout: 5000,
});

export function setSessionExpiredHandler(
  newSessionExpired: (() => void) | null,
) {
  sessionExpired = newSessionExpired;
}

export default instance;
