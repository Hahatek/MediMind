import { ChevronRight, LucideIcon } from "lucide-react-native";
import { View, Pressable, Text } from "react-native";
import { useThemeColor } from "../theme/useThemeColor";

export type ActionItem = {
  key: string;
  label: string;
  icon: LucideIcon;
  onPress: () => void;
  danger?: boolean;
};

type ActionListProps = {
  actions: ActionItem[];
};

export default function ActionList({ actions }: ActionListProps) {
  const iconColor = useThemeColor("--ink-3");
  const dangerColor = useThemeColor("--danger");
  const chevronColor = useThemeColor("--ink-4");

  if (actions.length === 0) {
    return null;
  }

  return (
    <View className="bg-surface border border-border rounded-2xl overflow-hidden">
      {actions.map((action, index) => {
        const Icon = action.icon;

        return (
          <Pressable
            key={action.key}
            onPress={action.onPress}
            className={`flex flex-row items-center gap-3 px-4 py-4 ${index > 0 ? "border-t border-border" : ""}`}
          >
            <Icon size={20} color={action.danger ? dangerColor : iconColor} />
            <Text
              className={`flex flex-1 ${action.danger ? "text-danger" : "text-foreground"}`}
            >
              {action.label}
            </Text>
            <ChevronRight size={18} color={chevronColor} />
          </Pressable>
        );
      })}
    </View>
  );
}
