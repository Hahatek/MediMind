import axios from "axios";

export function getErrorMessage(e: unknown, fallback: string): string {
  if (!axios.isAxiosError(e)) {
    return fallback;
  }

  // Brak odpowiedzi = serwer nieosiągalny (brak internetu, backend wyłączony, timeout).
  if (!e.response) {
    return "Brak połączenia z serwerem. Sprawdź internet i spróbuj ponownie.";
  }

  const status = e.response.status;
  const data = e.response.data;

  // Backend zwraca polskie komunikaty jako zwykły string, np. NotFound("Nie znaleziono badania").
  if (typeof data === "string" && data.length > 0 && status < 500) {
    return data;
  }

  if (status === 400) return "Niepoprawne dane. Sprawdź formularz.";
  if (status === 403) return "Nie masz dostępu do tego badania.";
  if (status === 404) return "Nie znaleziono badania. Mogło zostać usunięte.";
  if (status >= 500) return "Błąd serwera. Spróbuj ponownie za chwilę.";

  return fallback;
}
