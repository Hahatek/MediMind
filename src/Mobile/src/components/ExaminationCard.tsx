import { View, Text, Pressable } from "react-native";
import { Calendar, MapPin, PencilIcon, Trash } from "lucide-react-native";
import { formatDate, formatTime } from "../utils/dateFormat";
import { ExaminationDisplayStatus } from "../utils/examinationDisplayStatus";
import { getExamStatusStyle } from "../theme/examStatus";
import { useThemeColor } from "../theme/useThemeColor";
import { MAX_FONT_SCALE_CONTROLS, typography } from "../theme/typography";

type ExaminationCardProps = {
  name: string;
  date: string;
  time?: string | null;
  location?: string | null;
  status?: ExaminationDisplayStatus;
  color?: string | null;
  ownerName?: string | null;
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
  ownerName,
  onEdit,
  onDelete,
}: ExaminationCardProps) {
  const style = status ? getExamStatusStyle(status) : null;
  const iconColor = useThemeColor("--ink-3");
  const dangerColor = useThemeColor("--danger");

  return (
    <View className="relative rounded-xl bg-surface m-2 border border-line-2">
      <View className="relative p-4 pl-8">
        <View
          className="absolute left-2 top-2 bottom-2 rounded-full"
          style={{ width: 4, backgroundColor: color ?? "#00B3C2" }}
        />
        <View className="pl-4">
          {ownerName && (
            <Text className="text-ink-2 mb-1" style={typography["section.label"]}>
              {ownerName}
            </Text>
          )}
          <View className="flex flex-row justify-between items-center pb-2">
            <Text
              className="text-foreground flex-1 mr-2"
              style={typography["list.title"]}
            >
              {name}
            </Text>
            {style && (
              <View className={`px-3 py-1 rounded-full ${style.container}`}>
                <Text className={style.text} style={typography.badge}>
                  {style.label}
                </Text>
              </View>
            )}
          </View>
          <View className="flex flex-row items-center gap-2 pb-1">
            <Calendar size={16} color={iconColor} />
            <Text className="text-ink-3" style={typography.meta}>
              {formatDate(date)}
              {time && ` o godzinie ${formatTime(time)}`}
            </Text>
          </View>
          {location && (
            <View className="flex flex-row items-center gap-2 pb-1">
              <MapPin size={16} color={iconColor} />
              <Text className="text-ink-3" style={typography.meta}>
                {location}
              </Text>
            </View>
          )}
        </View>
      </View>
      {(onEdit || onDelete) && (
        <View className="flex flex-row justify-between w-full border-t border-t-line-2">
          <Pressable
            className="flex flex-row items-center w-1/2 justify-center h-12 border-r border-r-line-2 gap-2"
            onPress={onEdit}
          >
            <PencilIcon size={16} color={iconColor} />
            <Text
              className="text-ink-3"
              style={typography["button.md"]}
              maxFontSizeMultiplier={MAX_FONT_SCALE_CONTROLS}
            >
              Edytuj
            </Text>
          </Pressable>
          <Pressable
            className="flex flex-row items-center w-1/2 justify-center h-12 gap-2"
            onPress={onDelete}
          >
            <Trash size={16} color={dangerColor} />
            <Text
              className="text-danger"
              style={typography["button.md"]}
              maxFontSizeMultiplier={MAX_FONT_SCALE_CONTROLS}
            >
              Usuń
            </Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}
