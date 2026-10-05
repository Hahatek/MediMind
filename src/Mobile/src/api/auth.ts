import axios from "axios";
import type {
  LoginRequest,
  AuthResponse,
  RegisterRequest,
  RefreshTokenRequest,
  ClaimProfileRequest,
  LinkDeviceRequest,
} from "../types/AuthTypes";
import instance, { authClient, refreshTokens } from "./client";
import { deleteRefreshToken, readRefreshToken } from "../storage/tokenStorage";
import { setToken } from "../storage/accessToken";

export async function login(lRData: LoginRequest): Promise<AuthResponse> {
  try {
    const response = await authClient.post<AuthResponse>(
      "/api/auth/login",
      lRData,
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 401) {
        throw new Error("Błędny email lub hasło");
      }
      if (error.response) {
        throw new Error("Serwer zgłosił błąd");
      }
      throw new Error("Brak połączenia z internetem");
    }

    throw new Error("Nieoczekiwany błąd");
  }
}

export async function register(rRData: RegisterRequest): Promise<AuthResponse> {
  try {
    const response = await authClient.post<AuthResponse>(
      "/api/auth/register",
      rRData,
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 409) {
        throw new Error("Użytkownik z podanym adresem email już istnieje");
      }

      if (error.response?.status === 400) {
        const data = error.response.data;
        if (typeof data === "string") {
          throw new Error(data);
        }
        throw new Error("Sprawdź poprawność danych");
      }

      if (error.response) {
        throw new Error("Serwer zgłosił błąd");
      }
      throw new Error("Brak połączenia z internetem");
    }
    throw new Error("Nieoczekiwany błąd");
  }
}

export async function refreshSession(
  refreshTokenData: RefreshTokenRequest,
): Promise<AuthResponse> {
  const response = await authClient.post<AuthResponse>(
    "/api/auth/refresh",
    refreshTokenData,
  );
  return response.data;
}

export async function logoutSession(
  logoutData: RefreshTokenRequest,
): Promise<void> {
  await authClient.post("/api/auth/logout", logoutData);
}

export async function endSession() {
  const storedRefreshToken = await readRefreshToken();
  try {
    if (storedRefreshToken !== null) {
      await logoutSession({ refreshToken: storedRefreshToken });
    }
  } catch {
    // celowo pusty: błąd backendu nie blokuje lokalnego wylogowania
  }
  await deleteRefreshToken();
  setToken(null);
}

export async function linkDevice(lDData: LinkDeviceRequest) {
  try {
    const response = await authClient.post<AuthResponse>(
      "/api/auth/link-device",
      lDData,
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 429) {
        throw new Error("Za dużo prób. Spróbuj za chwilę");
      }

      if (error.response?.status === 401) {
        throw new Error("Nieprawidłowy lub wygasły kod");
      }

      if (error.response?.status === 400) {
        const data = error.response.data;
        if (typeof data === "string") {
          throw new Error(data);
        }
        throw new Error("Sprawdź poprawność danych");
      }

      if (error.response) {
        throw new Error("Serwer zgłosił błąd");
      }
      throw new Error("Brak połączenia z internetem");
    }
    throw new Error("Nieoczekiwany błąd");
  }
}

export async function claimProfile(cPData: ClaimProfileRequest) {
  try {
    const response = await authClient.post<AuthResponse>(
      "/api/auth/claim-profile",
      cPData,
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 429) {
        throw new Error("Za dużo prób. Spróbuj za chwilę");
      }

      if (error.response?.status === 401) {
        throw new Error("Nieprawidłowy lub wygasły kod");
      }

      if (error.response?.status === 409) {
        throw new Error("Podany adres email jest zajęty");
      }

      if (error.response?.status === 400) {
        const data = error.response.data;
        if (typeof data === "string") {
          throw new Error(data);
        }
        throw new Error("Sprawdź poprawność danych");
      }

      if (error.response) {
        throw new Error("Serwer zgłosił błąd");
      }
      throw new Error("Brak połączenia z internetem");
    }
    throw new Error("Nieoczekiwany błąd");
  }
}
