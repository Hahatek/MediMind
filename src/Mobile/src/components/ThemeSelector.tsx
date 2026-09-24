import { Pressable, Text, View } from "react-native";
import { setThemeMode, useThemeMode, type ThemeMode } from "../theme";

const OPTIONS: { value: ThemeMode; label: string }[] = [
  { value: "system", label: "System" },
  { value: "light", label: "Jasny" },
  { value: "dark", label: "Ciemny" },
];

export default function ThemeSelector() {
  const mode = useThemeMode();

  return (
    <View
      accessibilityRole="radiogroup"
      className="flex-row rounded-xl overflow-hidden border border-border"
    >
      {OPTIONS.map((o) => {
        const selected = o.value === mode;
        return (
          <Pressable
            key={o.value}
            accessibilityRole="radio"
            accessibilityState={{ selected }}
            onPress={() => setThemeMode(o.value)}
            className={
              selected
                ? "flex-1 items-center py-2 bg-primary"
                : "flex-1 items-center py-2 bg-surface"
            }
          >
            <Text
              className={selected ? "text-primary-foreground" : "text-foreground"}
            >
              {o.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
