import { View, Text, Pressable, Alert } from "react-native";
import { ExaminationsStatus } from "../types/EnumTypes";
import { PencilIcon, Trash } from "lucide-react-native";
import { formatDate, formatTime } from "../utils/dateFormat";
import { ExaminationDisplayStatus } from "../utils/examinationDisplayStatus";
import { getExamStatusStyle } from "../theme/examStatus";

type ExaminationCardProps = {
  name: string;
  date: string;
  time?: string | null;
  location?: string | null;
  status?: ExaminationDisplayStatus;
  color?: string | null;
  onEdit?: () => void;
  onDelete?: () => void;
};

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
  const style = status ? getExamStatusStyle(status) : null;
  return (
    <View className="relative rounded-xl bg-surface m-2 border border-line-2">
      <View className="relative p-4 pl-8">
        <View
          className="absolute left-2 top-2 bottom-2 rounded-full"
          style={{ width: 4, backgroundColor: color ?? "#00B3C2" }}
        />
        <View className="pl-4">
          <View className="flex flex-row justify-between pb-2">
            <Text className="text-foreground">{name}</Text>
            {style && (
              <View className={`px-4 py-2 rounded-full ${style.container}`}>
                <Text className={`text-xs ${style.text}`}>{style.label}</Text>
              </View>
            )}
          </View>
          {location && <Text className="text-foreground pb-2">{location}</Text>}
          <Text className="text-foreground pb-2">
            {formatDate(date)}
            {time && ` o godzinie ${formatTime(time)}`}
          </Text>
        </View>
      </View>
      <View>
        {(onEdit || onDelete) && (
          <View className="flex flex-row justify-between w-full m-0 border-t border-t-line-2">
            <Pressable
              className="flex flex-row items-center w-1/2 justify-center h-12 border-r border-r-line-2 gap-2"
              onPress={onEdit}
            >
              <PencilIcon />
              <Text>Edytuj</Text>
            </Pressable>
            <Pressable
              className="flex flex-row items-center w-1/2 justify-center h-12 gap-2"
              onPress={onDelete}
            >
              <Trash />
              <Text>Usuń</Text>
            </Pressable>
          </View>
        )}
      </View>
    </View>
  );
}
