import { Pressable, View, Text } from "react-native";

type SegmentOption = { value: string; label: string };

type SegmentedControlProps = {
  options: SegmentOption[];
  value: string;
  onChange: (value: string) => void;
};

export default function SegmentedControl({
  options,
  value,
  onChange,
}: SegmentedControlProps) {
  return (
    <View className="flex flex-row bg-tint-2 rounded-xl p-1 mx-4 my-2">
      {options.map((option) => {
        const isActive = option.value === value;
        return (
          <Pressable
            className={`flex-1 py-2 items-center rounded-lg ${isActive ? "bg-surface" : ""}`}
            key={option.value}
            onPress={() => onChange(option.value)}
          >
            <Text
              className={
                isActive ? "text-brand-ink font-semibold" : "text-ink-3"
              }
            >
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
