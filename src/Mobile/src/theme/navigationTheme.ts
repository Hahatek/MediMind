import { DarkTheme, DefaultTheme, type Theme } from "@react-navigation/native";
import { useColorScheme, useUnstableNativeVariable } from "nativewind";

// React Navigation wymaga kolorów jako wartości JS — odczytujemy zmienne CSS
// z global.css, więc nie ma drugiej kopii palety.
export function useNavigationTheme(): Theme {
  const { colorScheme } = useColorScheme();
  const dark = colorScheme === "dark";
  const base = dark ? DarkTheme : DefaultTheme;

  const primary = useUnstableNativeVariable("--brand-ink");
  const background = useUnstableNativeVariable("--screen");
  const card = useUnstableNativeVariable("--surface");
  const text = useUnstableNativeVariable("--ink-1");
  const border = useUnstableNativeVariable("--line-2");
  const notification = useUnstableNativeVariable("--danger");

  const pick = (v: unknown, fallback: string) =>
    typeof v === "string" ? v : fallback;

  return {
    ...base,
    dark,
    colors: {
      primary: pick(primary, base.colors.primary),
      background: pick(background, base.colors.background),
      card: pick(card, base.colors.card),
      text: pick(text, base.colors.text),
      border: pick(border, base.colors.border),
      notification: pick(notification, base.colors.notification),
    },
  };
}
