import { getItem, setItem } from "expo-secure-store";

export type ThemeMode = "light" | "dark" | "system";

const KEY = "theme_mode";
const MODES: readonly ThemeMode[] = ["light", "dark", "system"];

// Synchroniczny odczyt pozwala ustalić motyw przed pierwszym renderem (bez migotania).
export function readThemeMode(): ThemeMode {
  try {
    const v = getItem(KEY);
    return MODES.includes(v as ThemeMode) ? (v as ThemeMode) : "system";
  } catch {
    return "system";
  }
}

export function saveThemeMode(mode: ThemeMode) {
  try {
    setItem(KEY, mode);
  } catch {
    // brak zapisu nie może psuć działania aplikacji
  }
}
