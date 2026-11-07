import { useEffect, useState } from "react";
import { Text, View } from "react-native";
import { typography } from "../../theme";
import KlaraAvatar from "./KlaraAvatar";

export default function KlaraTyping() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setActive((prev) => (prev + 1) % 3), 300);
    return () => clearInterval(timer);
  }, []);

  return (
    <View className="flex-row items-center gap-2">
      <KlaraAvatar size={36} />
      <View
        accessibilityLiveRegion="polite"
        className="bg-surface border border-border rounded-2xl rounded-tl-md px-4 py-3 flex-row items-center gap-3"
      >
        <View className="flex-row gap-1">
          {[0, 1, 2].map((dot) => (
            <View
              key={dot}
              className="w-2 h-2 rounded-full bg-accent"
              style={{ opacity: dot === active ? 1 : 0.3 }}
            />
          ))}
        </View>
        <Text className="text-muted-foreground" style={typography.caption}>
          Klara pisze…
        </Text>
      </View>
    </View>
  );
}
