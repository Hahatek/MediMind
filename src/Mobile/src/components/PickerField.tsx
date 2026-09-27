import { useState } from "react";
import { View, Text, Pressable } from "react-native";
import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { Calendar, Clock } from "lucide-react-native";
import { useThemeColor } from "../theme/useThemeColor";
import {
  formatDate,
  formatDateLocal,
  formatTime,
  formatTimeLocal,
  parseDateLocal,
  parseTimeLocal,
} from "../utils/dateFormat";

type PickerFieldProps = {
  label: string;
  mode: "date" | "time";
  /** Wartość w formacie API: "2026-09-24" albo "09:05:00"; "" = nic nie wybrano. */
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  error?: string | null;
  minimumDate?: Date;
  maximumDate?: Date;
};

// Wygląda jak TextField, ale zamiast klawiatury otwiera systemowy kalendarz/zegar.
export default function PickerField({
  label,
  mode,
  value,
  onChange,
  placeholder,
  required,
  error,
  minimumDate,
  maximumDate,
}: PickerFieldProps) {
  const [show, setShow] = useState(false);
  const iconColor = useThemeColor("--ink-3");

  const Icon = mode === "date" ? Calendar : Clock;
  const displayValue = value
    ? mode === "date"
      ? formatDate(value)
      : formatTime(value)
    : null;

  function handleChange(event: DateTimePickerEvent, selected?: Date) {
    setShow(false);
    // "dismissed" = użytkownik kliknął Anuluj — nie zmieniamy wartości.
    if (event.type !== "set" || !selected) return;
    onChange(mode === "date" ? formatDateLocal(selected) : formatTimeLocal(selected));
  }

  return (
    <View className="mb-4 w-full">
      <Text className="text-foreground font-semibold text-sm mb-1">
        {label}
        {required && <Text className="text-danger"> *</Text>}
      </Text>
      <Pressable
        onPress={() => setShow(true)}
        accessibilityRole="button"
        accessibilityLabel={label}
        className={`flex-row justify-between items-center rounded-2xl px-4 py-3 bg-input border ${error ? "border-danger" : "border-line-2"}`}
      >
        <Text className={displayValue ? "text-foreground" : "text-placeholder"}>
          {displayValue ?? placeholder ?? (mode === "date" ? "Wybierz datę" : "Wybierz godzinę")}
        </Text>
        <Icon size={18} color={iconColor} />
      </Pressable>
      {error && <Text className="text-danger mt-1">{error}</Text>}

      {show && (
        <DateTimePicker
          // Kalendarz otwiera się na już wybranej wartości, a nie zawsze na "dziś".
          value={mode === "date" ? parseDateLocal(value) : parseTimeLocal(value)}
          mode={mode}
          is24Hour
          minimumDate={minimumDate}
          maximumDate={maximumDate}
          onChange={handleChange}
        />
      )}
    </View>
  );
}
