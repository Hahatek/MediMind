import { Text } from "react-native";
import { useTheme } from "@react-navigation/native";
import type { NativeStackNavigationOptions } from "@react-navigation/native-stack";
import { MAX_FONT_SCALE_CONTROLS, typography } from "../theme";

// Własny tytuł, bo natywny nagłówek nie przyjmuje lineHeight, letterSpacing
// ani maxFontSizeMultiplier. Kolor jak w domyślnym nagłówku (colors.text).
function HeaderTitle({ children }: { children: string }) {
  const { colors } = useTheme();

  return (
    <Text
      numberOfLines={1}
      maxFontSizeMultiplier={MAX_FONT_SCALE_CONTROLS}
      style={[typography["header.title"], { color: colors.text }]}
    >
      {children}
    </Text>
  );
}

// Wspólne opcje dla wszystkich Stack.Navigator w aplikacji.
export const stackScreenOptions: NativeStackNavigationOptions = {
  headerShown: true,
  headerTitle: ({ children }) => <HeaderTitle>{children}</HeaderTitle>,
};
