import { View, Text, TextInput, KeyboardTypeOptions } from "react-native";
import { typography } from "../theme/typography";

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
  maxLength?: number;
  returnKeyType?: "next" | "go";
  onSubmitEditing?: () => void;
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
  maxLength,
  returnKeyType,
  onSubmitEditing,
}: TextFieldProps) {
  return (
    <View className="mb-4 w-full">
      <Text
        className="text-foreground mb-1"
        style={typography["field.label"]}
      >
        {label}
        {required && <Text className="text-danger"> *</Text>}
      </Text>
      <TextInput
        className={`rounded-2xl px-4 py-3 bg-input text-foreground placeholder:text-placeholder border ${error ? "border-danger" : "border-line-2"}`}
        style={typography["input.text"]}
        onChangeText={onChangeText}
        placeholder={placeholder}
        value={value}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        maxLength={maxLength}
        returnKeyType={returnKeyType}
        onSubmitEditing={onSubmitEditing}
      ></TextInput>
      {error && (
        <Text className="text-danger mt-1" style={typography["field.error"]}>
          {error}
        </Text>
      )}
    </View>
  );
}
