import { View, Text, Pressable, Alert } from "react-native";
import { PencilIcon, Trash } from "lucide-react-native";
import { formatDate, formatTime } from "../utils/dateFormat";

type MedicationProps = {
  name?: string;
  dose: number;
  onEdit?: () => void;
  onDelete?: () => void;
};

export default function MedicationCard({
  name,
  dose,
  onEdit,
  onDelete,
}: MedicationProps) {
  return (
    <View className="relative rounded-xl bg-surface m-2 border border-line-2">
      <View className="relative p-4 pl-8">
        <View className="pl-4">
          <View className="flex flex-row justify-between pb-2">
            {name && <Text className="text-foreground">{name}</Text>}
          </View>
          <Text className="text-foreground pb-2">{dose}</Text>
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
