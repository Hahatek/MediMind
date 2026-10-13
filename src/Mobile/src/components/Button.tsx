import { useEffect, useRef, useState } from "react";
import { LucideIcon } from "lucide-react-native";
import { useColorScheme } from "nativewind";
import {
  Animated,
  Easing,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "neutral"
  | "danger"
  | "dangerSolid"
  | "ghost";

type ButtonProps = {
  title?: string;
  onPress: () => void;
  variant?: ButtonVariant;
  disabled?: boolean;
  loading?: boolean;
  loadingTitle?: string;
  iconLeft?: LucideIcon;
  iconRight?: LucideIcon;
};

type ButtonState = "default" | "hover" | "pressed" | "disabled" | "loading";

type StateStyle = {
  bg: string;
  text: string;
  icon?: string; // domyślnie = text
  border: string;
  shadow?: string | null;
  underline?: string | null;
  spinnerHead?: string; // domyślnie = text
  spinnerTrack?: string; // domyślnie = border
};

// `default` jest pełny, pozostałe stany zapisują tylko różnice względem niego.
type VariantColors = { default: StateStyle } & {
  [S in Exclude<ButtonState, "default">]?: Partial<StateStyle>;
};

// dangerSolid korzysta z kolorów danger.
type Palette = Record<Exclude<ButtonVariant, "dangerSolid">, VariantColors>;

// Wspólne dla wszystkich wariantów i obu motywów.
const STATE_DEFAULTS: Partial<Record<ButtonState, Partial<StateStyle>>> = {
  disabled: { icon: undefined, shadow: null, underline: null },
  loading: { underline: null },
};

const LIGHT: Palette = {
  primary: {
    default: { bg: "#005868", text: "#FFFFFF", border: "#004B59", shadow: "inset 0 -2px 0 #003C47" },
    hover: { bg: "#00687A", border: "#005868", shadow: "inset 0 -2px 0 #004652" },
    pressed: { bg: "#00434F", text: "#E6F3F5", border: "#003540", shadow: "inset 0 2px 3px rgba(0,22,27,0.35)" },
    disabled: { bg: "#E4EBED", text: "#5A6F74", border: "#D3DEE1" },
    loading: { text: "#D4ECF0", spinnerHead: "#FFFFFF", spinnerTrack: "rgba(255,255,255,0.28)" },
  },
  secondary: {
    default: { bg: "#EEF8FA", text: "#005868", border: "#B6D6DD", shadow: "inset 0 -2px 0 #CFE6EB" },
    hover: { bg: "#E1F1F5", border: "#9FC8D1", shadow: "inset 0 -2px 0 #C2DFE6" },
    pressed: { bg: "#D2E8EE", text: "#004A57", border: "#6FA9B6", shadow: "inset 0 2px 2px rgba(0,72,86,0.14)" },
    disabled: { bg: "#F1F4F5", text: "#5A6F74", border: "#D3DEE1" },
  },
  neutral: {
    default: { bg: "#FFFFFF", text: "#102F35", icon: "#4D666C", border: "#D3E0E3", shadow: "inset 0 -2px 0 #E6EDEF" },
    hover: { bg: "#F3F6F7", border: "#BFCED2", shadow: "inset 0 -2px 0 #E0E8EA" },
    pressed: { bg: "#E6ECEE", icon: "#3A5258", border: "#A9BBC0", shadow: "inset 0 2px 2px rgba(16,47,53,0.12)" },
    disabled: { bg: "#F6F8F8", text: "#5A6F74", border: "#C6D3D6" },
  },
  danger: {
    default: { bg: "#A8372F", text: "#FFFFFF", border: "#8F2D26", shadow: "inset 0 -2px 0 #7A241F" },
    hover: { bg: "#B53B32", border: "#98302A", shadow: "inset 0 -2px 0 #82271F" },
    pressed: { bg: "#7C2520", text: "#F7E4E1", border: "#651C18", shadow: "inset 0 2px 3px rgba(40,6,4,0.4)" },
    disabled: { bg: "#E9E6E5", text: "#625F5E", border: "#DAD5D3" },
    loading: { text: "#F7E4E1", spinnerHead: "#FFFFFF", spinnerTrack: "rgba(255,255,255,0.28)" },
  },
  ghost: {
    default: { bg: "transparent", text: "#005868", border: "transparent", underline: "#9CC9D3" },
    hover: { bg: "#EAF5F8", underline: "#005868" },
    pressed: { bg: "#D8EAEF", text: "#004A57", border: "#C3DDE4", underline: "#004A57" },
    disabled: { text: "#5A6F74" },
    loading: { spinnerTrack: "#B6D6DD" },
  },
};

// Kolory bazowe = paleta ciemna z global.css (primary #3A6DB5, secondary #1E2C47,
// surfaceElevated #212C42, inputBorder #35425C, disabled #222C3E); hover/pressed to pochodne.
const DARK: Palette = {
  primary: {
    default: { bg: "#3A6DB5", text: "#FFFFFF", border: "#335F9E", shadow: "inset 0 -2px 0 #284B7D" },
    hover: { bg: "#4579C1", border: "#3A6DB5", shadow: "inset 0 -2px 0 #2E5590" },
    pressed: { bg: "#2F5A96", text: "#E3ECF9", border: "#284B7D", shadow: "inset 0 2px 3px rgba(2,6,23,0.5)" },
    disabled: { bg: "#222C3E", text: "#6F7C92", border: "#2A3650" },
    loading: { text: "#D6E3F6", spinnerHead: "#FFFFFF", spinnerTrack: "rgba(255,255,255,0.28)" },
  },
  secondary: {
    default: { bg: "#1E2C47", text: "#8DB4EC", border: "#2E4266", shadow: "inset 0 -2px 0 #16213A" },
    hover: { bg: "#24355A", border: "#3A5280", shadow: "inset 0 -2px 0 #1A2742" },
    pressed: { bg: "#18243B", text: "#A9C7F1", border: "#4A6699", shadow: "inset 0 2px 2px rgba(2,6,23,0.4)" },
    disabled: { bg: "#1A2335", text: "#6F7C92", border: "#26324A" },
  },
  neutral: {
    default: { bg: "#212C42", text: "#E8EDF5", icon: "#A2AEC2", border: "#35425C", shadow: "inset 0 -2px 0 #172033" },
    hover: { bg: "#27334B", border: "#414F6B", shadow: "inset 0 -2px 0 #1A2438" },
    pressed: { bg: "#1B2438", icon: "#C3CCDA", border: "#4C5A77", shadow: "inset 0 2px 2px rgba(2,6,23,0.4)" },
    disabled: { bg: "#1A2335", text: "#6F7C92", border: "#35425C" },
  },
  danger: {
    default: { bg: "#C2413A", text: "#FFFFFF", border: "#A3352F", shadow: "inset 0 -2px 0 #852A25" },
    hover: { bg: "#D04A42", border: "#B03A33", shadow: "inset 0 -2px 0 #8F2D27" },
    pressed: { bg: "#9C312B", text: "#FBE3E0", border: "#7E2723", shadow: "inset 0 2px 3px rgba(20,4,4,0.5)" },
    disabled: { bg: "#24202A", text: "#857C86", border: "#3A3240" },
    loading: { text: "#FBE3E0", spinnerHead: "#FFFFFF", spinnerTrack: "rgba(255,255,255,0.28)" },
  },
  ghost: {
    default: { bg: "transparent", text: "#8DB4EC", border: "transparent", underline: "#3F5F9E" },
    hover: { bg: "#1E2C47", underline: "#8DB4EC" },
    pressed: { bg: "#24355A", text: "#A9C7F1", border: "#2E4266", underline: "#A9C7F1" },
    disabled: { text: "#6F7C92" },
    loading: { spinnerTrack: "#2E4266" },
  },
};

function resolveStyle(
  palette: Palette,
  variant: ButtonVariant,
  state: ButtonState,
) {
  const colors = palette[variant === "dangerSolid" ? "danger" : variant];
  const s = { ...colors.default, ...STATE_DEFAULTS[state], ...colors[state] };
  return {
    ...s,
    icon: s.icon ?? s.text,
    spinnerHead: s.spinnerHead ?? s.text,
    spinnerTrack: s.spinnerTrack ?? s.border,
  };
}

function Spinner({ head, track }: { head: string; track: string }) {
  const rotation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.timing(rotation, {
        toValue: 1,
        duration: 900,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    );
    anim.start();
    return () => anim.stop();
  }, [rotation]);

  const spin = rotation.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <Animated.View
      style={[
        spinnerStyles.ring,
        {
          borderColor: track,
          borderTopColor: head,
          transform: [{ rotate: spin }],
        },
      ]}
    />
  );
}

const spinnerStyles = StyleSheet.create({
  ring: {
    width: 16,
    height: 16,
    borderWidth: 2,
    borderRadius: 8,
  },
});

export default function Button({
  title,
  onPress,
  variant = "primary",
  disabled,
  loading,
  loadingTitle,
  iconLeft: IconLeft,
  iconRight: IconRight,
}: ButtonProps) {
  const [hovered, setHovered] = useState(false);
  const { colorScheme } = useColorScheme();
  const palette = colorScheme === "dark" ? DARK : LIGHT;
  const isDisabled = disabled || loading;
  const displayTitle = loading ? loadingTitle || title || "Zapisuję…" : title;

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      onHoverIn={() => setHovered(true)}
      onHoverOut={() => setHovered(false)}
    >
      {({ pressed }) => {
        const state: ButtonState = loading
          ? "loading"
          : disabled
            ? "disabled"
            : pressed
              ? "pressed"
              : hovered
                ? "hover"
                : "default";
        const s = resolveStyle(palette, variant, state);

        return (
          <View
            style={[
              styles.container,
              {
                backgroundColor: s.bg,
                borderColor: s.border,
                // Przerywana ramka tylko dla wyłączonego neutral.
                borderStyle:
                  state === "disabled" && variant === "neutral"
                    ? "dashed"
                    : "solid",
                gap: variant === "ghost" ? 8 : 9,
                paddingTop: state === "pressed" ? 2 : 0,
                boxShadow: s.shadow ?? undefined,
              },
            ]}
          >
            {loading ? (
              <Spinner head={s.spinnerHead} track={s.spinnerTrack} />
            ) : (
              IconLeft && <IconLeft size={18} strokeWidth={2} color={s.icon} />
            )}
            {displayTitle && (
              <View>
                <Text style={[styles.label, { color: s.text }]}>
                  {displayTitle}
                </Text>
                {s.underline && (
                  <View
                    style={[styles.underline, { backgroundColor: s.underline }]}
                  />
                )}
              </View>
            )}
            {!loading && IconRight && (
              <IconRight size={18} strokeWidth={2} color={s.icon} />
            )}
          </View>
        );
      }}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 48,
    borderWidth: 1,
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
    overflow: "hidden",
  },
  label: {
    fontSize: 15.5,
    // Spec: lineHeight 15.5 (CSS `1`), ale w RN Android ucina dolne wydłużenia (y, g, j).
    lineHeight: 20,
    fontWeight: "500",
    letterSpacing: -0.0775,
    textAlignVertical: "center",
    includeFontPadding: false,
  },
  underline: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 20,
    height: 1,
  },
});
