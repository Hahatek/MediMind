import { useSyncExternalStore } from "react";
import { colorScheme } from "nativewind";
import { readThemeMode, saveThemeMode, type ThemeMode } from "./themeStorage";

// Aktywny motyw (jasny/ciemny) należy do NativeWind — kolory zmieniają się same
// przez klasy Tailwind. Tu przechowujemy tylko WYBRANY tryb (w tym "system").
let mode: ThemeMode = readThemeMode();
const listeners = new Set<() => void>();

function apply(next: ThemeMode) {
  try {
    colorScheme.set(next);
  } catch {
    // motyw systemowy pozostaje w razie błędu
  }
}

// Wykonuje się przy imporcie, przed pierwszym renderem — bez migotania.
apply(mode);

export function setThemeMode(next: ThemeMode) {
  mode = next;
  apply(next);
  saveThemeMode(next);
  listeners.forEach((l) => l());
}

export function useThemeMode(): ThemeMode {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => mode,
  );
}
