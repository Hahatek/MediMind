import { View, Text, Pressable, Alert } from "react-native";
import { ExaminationsStatus } from "../types/EnumTypes";
import { PencilIcon, Trash } from "lucide-react-native";

type ExaminationCardProps = {
  name: string;
  date: string;
  time?: string | null;
  location?: string | null;
  status?: ExaminationsStatus;
  color?: string | null;
  onEdit?: () => void;
  onDelete?: () => void;
};

const statusLabels: Record<ExaminationsStatus, string> = {
  Sudden: "Nagłe",
  Pending: "Oczekujące",
  Scheduled: "Umówione",
  InProgress: "W trakcie",
  Planned: "Zaplanowane",
  Skipped: "Pominięte",
  Completed: "Zakończone",
};

function formatDate(dateStr: string) {
  const [year, month, day] = dateStr.split("-");
  return `${day}.${month}.${year}`;
}

function formatTime(timeStr: string) {
  return timeStr.slice(0, 5);
}

export default function ExaminationCard({
  name,
  date,
  time,
  location,
  status,
  color,
  onEdit,
  onDelete,
}: ExaminationCardProps) {
  return (
    <View className="relative rounded-xl bg-surface p-4 m-2 border border-line-2">
      <View
        className="absolute left-2 top-2 bottom-2 rounded-full"
        style={{ width: 4, backgroundColor: color ?? "#94a3b8" }}
      />
      <View className="pl-4">
        {" "}
        <View className="flex flex-row justify-between">
          <Text className="text-foreground p-2 mb-2">{name}</Text>
          <Text className="text-foreground p-2 mb-2 justify-end">
            {status && statusLabels[status]}
          </Text>
        </View>
        {location && (
          <Text className="text-foreground p-2 mb-2">{location}</Text>
        )}
        <Text className="text-foreground p-2 mb-2">
          {formatDate(date)}
          {time && ` o godzinie ${formatTime(time)}`}
        </Text>
        {(onEdit || onDelete) && (
          <View className="flex flex-row justify-between w-full m-0">
            <Pressable className="flex flex-row" onPress={onEdit}>
              <PencilIcon /> <Text>Edytuj</Text>
            </Pressable>
            <Pressable className="flex flex-row" onPress={onDelete}>
              <Trash /> <Text>Usuń</Text>
            </Pressable>
          </View>
        )}
      </View>
    </View>
  );
}
