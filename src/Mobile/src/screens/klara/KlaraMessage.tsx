import { Pressable, Text, View } from "react-native";
import { ChevronRight, CircleCheck, Plus } from "lucide-react-native";
import Button from "../../components/Button";
import ExaminationCard from "../../components/ExaminationCard";
import { ExaminationResponse } from "../../types/ExaminationTypes";
import { getExaminationDisplayStatus } from "../../utils/examinationDisplayStatus";
import { iconSizes, typography, useThemeColor } from "../../theme";
import KlaraAvatar from "./KlaraAvatar";

export type ExaminationProposal = {
  name: string;
  date: string;
  time?: string | null;
  ownerName?: string | null;
};

export type Message = {
  id: string;
  from: "me" | "klara";
  text: string;
  examinations?: ExaminationResponse[];
  proposal?: ExaminationProposal;
  confirmed?: boolean;
};

type Props = {
  message: Message;
  onAdd: (id: string) => void;
  onFix: (id: string) => void;
  onOpenExaminations: () => void;
};

export default function KlaraMessage({ message, onAdd, onFix, onOpenExaminations }: Props) {
  const brandInk = useThemeColor("--brand-ink");
  const now = new Date();

  if (message.from === "me") {
    return (
      <View className="flex-row justify-end pl-12">
        <View className="bg-primary rounded-2xl rounded-br-md px-4 py-3">
          <Text className="text-primary-foreground" style={typography["body.sm"]}>
            {message.text}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-row items-start gap-2 pr-6">
      <KlaraAvatar size={36} />
      <View className="flex-1 gap-3">
        <View className="self-start bg-surface border border-border rounded-2xl rounded-tl-md px-4 py-3">
          <Text className="text-foreground" style={typography["body.sm"]}>
            {message.text}
          </Text>
        </View>

        {message.examinations && (
          <View className="-mx-2">
            {message.examinations.map((item) => (
              <ExaminationCard
                key={item.id}
                name={item.name}
                date={item.date}
                time={item.time}
                color={item.color}
                status={getExaminationDisplayStatus(item, now)}
              />
            ))}
            <Pressable
              onPress={onOpenExaminations}
              className="flex-row items-center gap-1 px-2 py-3"
            >
              <Text className="text-link" style={typography.link}>
                Otwórz badania
              </Text>
              <ChevronRight color={brandInk} size={iconSizes.button} />
            </Pressable>
          </View>
        )}

        {message.proposal && (
          <View className="bg-surface border border-border rounded-xl p-2">
            <Text className="text-foreground px-2 pt-2" style={typography["list.title"]}>
              {message.confirmed ? "Badanie dodane" : "Dodać badanie?"}
            </Text>
            <ExaminationCard
              name={message.proposal.name}
              date={message.proposal.date}
              time={message.proposal.time}
              ownerName={message.proposal.ownerName}
            />
            {message.confirmed ? (
              <View className="flex-row items-center gap-2 p-2">
                <CircleCheck color={brandInk} size={iconSizes.button} />
                <Text className="text-link" style={typography.link}>
                  Dodano
                </Text>
              </View>
            ) : (
              <View className="flex-row gap-2 p-2">
                <View className="flex-1">
                  <Button
                    title="Popraw"
                    variant="secondary"
                    onPress={() => onFix(message.id)}
                  />
                </View>
                <View className="flex-1">
                  <Button title="Dodaj" iconLeft={Plus} onPress={() => onAdd(message.id)} />
                </View>
              </View>
            )}
          </View>
        )}
      </View>
    </View>
  );
}
