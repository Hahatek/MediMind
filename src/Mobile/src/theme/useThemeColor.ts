import { useUnstableNativeVariable } from "nativewind";

// Odczytuje kolor ze zmiennej CSS z global.css (np. "--brand") jako string.
// Potrzebne tam, gdzie klasy text-... nie działają, bo komponent chce
// wartości w propie — np. ikony lucide: <Icon color={...} />.
// Aktualizuje się sama przy zmianie motywu jasny/ciemny.
export function useThemeColor(variable: string, fallback = "#000000"): string {
  const value = useUnstableNativeVariable(variable);
  return typeof value === "string" ? value : fallback;
}
