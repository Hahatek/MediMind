import { useRef } from "react";
import { TextInput, Pressable, View, Text } from "react-native";
import { typography } from "../theme/typography";

type Props = {
  value: string;
  onChange: (value: string) => void;
};

export default function CodeInput({ value, onChange }: Props) {
  const inputRef = useRef<TextInput>(null);
  return (
    <Pressable onPress={() => inputRef.current?.focus()}>
      <View className="flex flex-row gap-2">
        {Array.from({ length: 6 }).map((_, index) => (
          <View
            key={index}
            className={`flex flex-1 h-16 bg-tint-1 rounded-xl items-center justify-center ${index === value.length ? "border-2 border-primary" : ""}`}
          >
            <Text className="text-foreground" style={typography["code.digit"]}>
              {value[index]}
            </Text>
          </View>
        ))}
      </View>
      <TextInput
        value={value}
        onChangeText={(text) => onChange(text.replace(/\D/g, ""))}
        ref={inputRef}
        className="absolute opacity-0"
        keyboardType="number-pad"
        maxLength={6}
        autoComplete="one-time-code"
        textContentType="oneTimeCode"
      />
    </Pressable>
  );
}
