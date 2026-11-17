import { Pressable, Text, View } from "react-native";
import { Trash2 } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { iconSizes, typography, useThemeColor } from "../../theme";
import KlaraAvatar from "./KlaraAvatar";

type Props = {
  subtitle: string;
  onClear?: () => void;
};

export default function KlaraHeader({ subtitle, onClear }: Props) {
  const insets = useSafeAreaInsets();
  const onBrand = useThemeColor("--on-brand");

  return (
    <View
      className="bg-chrome flex-row items-center gap-3 px-4 pb-4"
      style={{ paddingTop: insets.top + 12 }}
    >
      <KlaraAvatar size={44} className="bg-white/15" />
      <View className="flex-1">
        <Text className="text-on-brand" style={typography["card.title"]}>
          Klara
        </Text>
        <Text className="text-on-brand-dim" style={typography["caption.xs"]}>
          {subtitle}
        </Text>
      </View>
      {onClear && (
        <Pressable
          onPress={onClear}
          hitSlop={12}
          accessibilityLabel="Wyczyść rozmowę"
        >
          <Trash2 color={onBrand} size={iconSizes.button} />
        </Pressable>
      )}
    </View>
  );
}
