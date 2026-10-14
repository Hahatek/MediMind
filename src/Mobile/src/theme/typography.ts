import type { TextStyle } from "react-native";
import {
  Manrope_400Regular,
  Manrope_500Medium,
  Manrope_600SemiBold,
} from "@expo-google-fonts/manrope";

export const fontAssets = {
  "Manrope-Regular": Manrope_400Regular,
  "Manrope-Medium": Manrope_500Medium,
  "Manrope-SemiBold": Manrope_600SemiBold,
};

export const fonts = {
  regular: "Manrope-Regular",
  medium: "Manrope-Medium",
  semibold: "Manrope-SemiBold",
} as const;

export const typography = {
  // Nagłówki
  "title.hero": {
    fontFamily: fonts.semibold,
    fontSize: 30,
    lineHeight: 36,
    letterSpacing: -0.3,
  },
  "title.page": {
    fontFamily: fonts.semibold,
    fontSize: 28,
    lineHeight: 34,
    letterSpacing: -0.28,
  },
  "title.greeting": {
    fontFamily: fonts.semibold,
    fontSize: 28,
    lineHeight: 32,
    letterSpacing: -0.28,
  },
  "title.detail": {
    fontFamily: fonts.semibold,
    fontSize: 26,
    lineHeight: 31,
    letterSpacing: -0.26,
  },
  "title.empty": { fontFamily: fonts.semibold, fontSize: 24, lineHeight: 30 },
  "title.profile": {
    fontFamily: fonts.semibold,
    fontSize: 23,
    lineHeight: 28,
    letterSpacing: -0.23,
  },
  "header.title": {
    fontFamily: fonts.semibold,
    fontSize: 22,
    lineHeight: 26,
    letterSpacing: -0.22,
  },
  "title.member": { fontFamily: fonts.semibold, fontSize: 22, lineHeight: 27 },
  "detail.dateTime": {
    fontFamily: fonts.semibold,
    fontSize: 21,
    lineHeight: 25,
    letterSpacing: -0.21,
  },
  "card.title": { fontFamily: fonts.semibold, fontSize: 19, lineHeight: 24 },
  "dialog.title": { fontFamily: fonts.semibold, fontSize: 19, lineHeight: 24 },

  // Przyciski i kontrolki
  "button.lg": { fontFamily: fonts.semibold, fontSize: 18, lineHeight: 22 }, // przycisk 56 dp
  "list.title": { fontFamily: fonts.semibold, fontSize: 18, lineHeight: 23 },
  "button.md": { fontFamily: fonts.semibold, fontSize: 17, lineHeight: 21 }, // przycisk 48 dp
  "input.text": { fontFamily: fonts.regular, fontSize: 17, lineHeight: 22 },
  "option.label": { fontFamily: fonts.medium, fontSize: 17, lineHeight: 22 },

  // Treść
  "body.lg": { fontFamily: fonts.regular, fontSize: 18, lineHeight: 28 },
  body: { fontFamily: fonts.regular, fontSize: 17, lineHeight: 26 },
  link: { fontFamily: fonts.medium, fontSize: 17, lineHeight: 22 },
  "row.label": { fontFamily: fonts.semibold, fontSize: 17, lineHeight: 22 },
  "field.label": { fontFamily: fonts.semibold, fontSize: 16, lineHeight: 20 },
  segment: { fontFamily: fonts.semibold, fontSize: 16, lineHeight: 20 },
  "segment.inactive": {
    fontFamily: fonts.medium,
    fontSize: 16,
    lineHeight: 20,
  },
  "body.sm": { fontFamily: fonts.regular, fontSize: 16, lineHeight: 24 },
  meta: { fontFamily: fonts.regular, fontSize: 16, lineHeight: 21 },
  toast: { fontFamily: fonts.medium, fontSize: 16, lineHeight: 22 },

  // Drobne
  caption: { fontFamily: fonts.regular, fontSize: 15, lineHeight: 22 },
  "field.error": { fontFamily: fonts.regular, fontSize: 15, lineHeight: 21 },
  "section.label": {
    fontFamily: fonts.semibold,
    fontSize: 14,
    lineHeight: 18,
    letterSpacing: 0.56,
    textTransform: "uppercase",
  },
  "caption.xs": { fontFamily: fonts.regular, fontSize: 14, lineHeight: 18 },
  badge: { fontFamily: fonts.semibold, fontSize: 13, lineHeight: 16 },
  eyebrow: {
    fontFamily: fonts.medium,
    fontSize: 13,
    lineHeight: 16,
    letterSpacing: 1.8,
    textTransform: "uppercase",
  },
  "nav.label": { fontFamily: fonts.regular, fontSize: 12, lineHeight: 15 },
  "nav.label.active": {
    fontFamily: fonts.semibold,
    fontSize: 12,
    lineHeight: 15,
  },

  // Kody
  "code.invite": { fontFamily: fonts.medium, fontSize: 32, letterSpacing: 5.8 },
  "code.digit": { fontFamily: fonts.semibold, fontSize: 28 },
} satisfies Record<string, TextStyle>;

export type TypographyToken = keyof typeof typography;

export const MAX_FONT_SCALE_CONTROLS = 1.3;

export const iconSizes = {
  bottomNav: 24,
  ctaButton: 21,
  button: 20,
  listRow: 22,
  emptyStateHero: 44,
} as const;
