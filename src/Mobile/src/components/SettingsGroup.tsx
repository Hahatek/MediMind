import { Pressable, Text, View } from "react-native";
import { ChevronRight, LucideIcon } from "lucide-react-native";
import { fonts, typography, useThemeColor } from "../theme";

export type SettingsRow = {
  icon: LucideIcon;
  label: string;
  sub?: string;
  value?: string;
  nav?: boolean;
  onPress?: () => void;
};

type Props = {
  label: string;
  rows: SettingsRow[];
};

export function GroupLabel({ children }: { children: string }) {
  return (
    <Text
      className="text-ink-5 pl-[18px]"
      style={{ fontFamily: fonts.medium, fontSize: 14, lineHeight: 18 }}
    >
      {children}
    </Text>
  );
}

export function RowIcon({ icon: Icon }: { icon: LucideIcon }) {
  const iconColor = useThemeColor("--brand-ink");
  return (
    <View className="w-8 h-8 rounded-lg bg-tint-2 items-center justify-center">
      <Icon size={18} color={iconColor} />
    </View>
  );
}

export function Chevron() {
  const color = useThemeColor("--ink-7");
  return (
    <View className="text-ink-7">
      <ChevronRight size={18} color={color} />
    </View>
  );
}

export default function SettingsGroup({ label, rows }: Props) {
  return (
    <View className="gap-2.5">
      <GroupLabel>{label}</GroupLabel>
      <View className="bg-surface rounded-[14px] border border-line-2 overflow-hidden">
        {rows.map((row, index) => (
          <Pressable
            key={row.label}
            onPress={row.onPress}
            accessibilityRole={row.nav === false ? "text" : "button"}
            className={`min-h-[60px] flex-row items-center gap-4 px-[18px] py-3 ${index < rows.length - 1 ? "border-b border-line-1" : ""}`}
          >
            <RowIcon icon={row.icon} />
            <View className="flex-1 gap-0.5">
              <Text className="text-ink-2" style={typography["option.label"]}>
                {row.label}
              </Text>
              {row.sub && (
                <Text className="text-ink-5" style={typography["caption.xs"]}>
                  {row.sub}
                </Text>
              )}
            </View>
            {row.value && (
              <Text className="text-ink-5" style={typography.caption}>
                {row.value}
              </Text>
            )}
            {row.nav !== false && <Chevron />}
          </Pressable>
        ))}
      </View>
    </View>
  );
}
