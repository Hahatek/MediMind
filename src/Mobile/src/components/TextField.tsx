import { View, Text, TextInput, KeyboardTypeOptions } from "react-native";

type TextFieldProps = {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  error?: string | null;
  required?: boolean;
  secureTextEntry?: boolean;
  keyboardType?: KeyboardTypeOptions;
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
};

export default function TextField({
  label,
  value,
  onChangeText,
  placeholder,
  error,
  required,
  secureTextEntry,
  keyboardType,
  autoCapitalize,
}: TextFieldProps) {
  return (
    <View className="mb-4 w-full">
      <Text className="text-foreground font-semibold text-sm mb-1">
        {label}
        {required && <Text className="text-danger"> *</Text>}
      </Text>
      <TextInput
        className={`rounded-2xl px-4 py-3 bg-input text-foreground placeholder:text-placeholder border ${error ? "border-danger" : "border-line-2"}`}
        onChangeText={onChangeText}
        placeholder={placeholder}
        value={value}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
      ></TextInput>
      {error && <Text className="text-danger mt-1">{error}</Text>}
    </View>
  );
}
