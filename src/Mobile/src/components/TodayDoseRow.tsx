import { View, Text, Pressable } from "react-native";
import { Square, SquareCheck } from "lucide-react-native";
import { TodayMedicationIntake } from "../types/MedicationIntakeTypes";
import { formatTime } from "../utils/dateFormat";
import { formatDose } from "../utils/medicationForms";
import { useThemeColor } from "../theme/useThemeColor";

type Props = {
  dose: TodayMedicationIntake;
  onToggle?: () => void;
};

// Jedna dawka na liście „Dziś”: nazwa, szczegóły (godzina · moc · ilość · notatka)
// i przycisk „Przyjmij” / „Przyjęte” (drugie kliknięcie cofa potwierdzenie).
export default function TodayDoseRow({ dose, onToggle }: Props) {
  const taken = dose.status === "Taken";
  const iconColor = useThemeColor(taken ? "--on-brand" : "--brand-ink");
  const Icon = taken ? SquareCheck : Square;

  // Puste kawałki (brak godziny, mocy, notatki) wypadają przez filter(Boolean)
  const details = [
    dose.time ? formatTime(dose.time) : null,
    dose.strength,
    formatDose(dose.amount, dose.form),
    dose.notes,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <View className="flex-row overflow-hidden mb-2 rounded-2xl bg-surface border border-line-2">
      <View className="flex-1 p-4">
        <Text className="text-foreground text-base">{dose.medicationName}</Text>
        <Text className="text-muted-foreground text-sm mt-1">{details}</Text>
      </View>

      <Pressable
        onPress={onToggle}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: taken }}
        accessibilityLabel={`${dose.medicationName}: ${taken ? "przyjęte" : "przyjmij"}`}
        className={`flex-row items-center gap-2 px-4 justify-center active:opacity-70 border-l-2 border-l-line-2 ${
          taken ? "bg-primary" : ""
        }`}
      >
        <Icon size={20} color={iconColor} />
        <Text
          className={`font-semibold ${
            taken ? "text-primary-foreground" : "text-brand-ink"
          }`}
        >
          {taken ? "Przyjęte" : "Przyjmij"}
        </Text>
      </Pressable>
    </View>
  );
}
