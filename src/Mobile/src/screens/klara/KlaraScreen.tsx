import { Text, View } from "react-native";
import { typography } from "../../theme";

export default function KlaraScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-screen">
      <Text className="text-muted-foreground" style={typography.meta}>
        Klara — wkrótce
      </Text>
    </View>
  );
}
