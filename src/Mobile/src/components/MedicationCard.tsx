import { View, Text, Pressable } from "react-native";
import { PencilIcon } from "lucide-react-native";
import { MedicationScheduleResponse } from "../types/MedicationScheduleTypes";
import { formatTime } from "../utils/dateFormat";
import { timeOfDayLabels } from "../utils/medicationTime";

type MedicationProps = {
  name: string;
  strength?: string | null;
  form: string;
  schedules: MedicationScheduleResponse[];
  notes?: string | null;
  onEdit?: () => void;
  // onDelete?: () => void;
};

export default function MedicationCard({
  name,
  strength,
  onEdit,
  // onDelete,
  schedules,
  notes,
  form,
}: MedicationProps) {
  const times = schedules
    .map((schedule) => {
      const label = timeOfDayLabels[schedule.timeOfDay];

      if (schedule.time) {
        return `${label}, ${formatTime(schedule.time)}`;
      }

      return label;
    })
    .join(" | ");

  return (
    <View className="relative rounded-xl bg-surface m-2 border border-line-2">
      <View className="relative p-4 pl-8">
        <View className="pl-4">
          <View className="flex flex-row justify-between pb-2">
            <Text className="text-foreground">{name}</Text>
          </View>
          <Text className="text-foreground pb-2">
            {strength ? `${strength} ${form}` : form}
          </Text>
          {notes ? <Text>{notes}</Text> : null}
          <Text>{times}</Text>
        </View>
      </View>
      <View>
        {onEdit && (
          <Pressable
            className="flex flex-row items-center justify-center h-12 border-t border-t-line-2 gap-2"
            onPress={onEdit}
          >
            <PencilIcon />
            <Text>Edytuj</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}
