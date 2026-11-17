import { Pressable, Text, View } from "react-native";
import { ChevronRight, CircleCheck, Plus } from "lucide-react-native";
import Button from "../../components/Button";
import ExaminationCard from "../../components/ExaminationCard";
import { ExaminationResponse } from "../../types/ExaminationTypes";
import { getExaminationDisplayStatus } from "../../utils/examinationDisplayStatus";
import { iconSizes, typography, useThemeColor } from "../../theme";
import KlaraAvatar from "./KlaraAvatar";
import { formatCycleInterval } from "../../utils/cycleInterval";
import TodayDoseRow from "../../components/TodayDoseRow";
import { TodayMedicationIntake } from "../../types/MedicationIntakeTypes";
import MedicationCard from "../../components/MedicationCard";
import { CreateMedication } from "../../types/MedicationTypes";

export type ExaminationProposal = {
  name: string;
  date: string;
  time?: string | null;
  ownerName?: string | null;
  forUserId?: string;
  cycleInterval?: number;
};

export type Message = {
  id: string;
  from: "me" | "klara";
  text: string;
  examinations?: ExaminationResponse[];
  proposal?: ExaminationProposal;
  confirmed?: boolean;
  marking?: ExaminationMarking;
  dose?: DoseConfirmation;
  medication?: MedicationProposal;
};

type Props = {
  message: Message;
  onAdd: (id: string) => void;
  onFix: (id: string) => void;
  onOpenExaminations: () => void;
};

export type ExaminationMarking = {
  examination: ExaminationResponse;
  akcja: "wykonane" | "pominiete";
  ownerName?: string;
};

export type DoseConfirmation = {
  intake: TodayMedicationIntake;
  status: "Taken" | "Skipped";
  date: string;
  ownerName?: string;
};

export type MedicationProposal = CreateMedication & { ownerName?: string };

export default function KlaraMessage({
  message,
  onAdd,
  onFix,
  onOpenExaminations,
}: Props) {
  const brandInk = useThemeColor("--brand-ink");
  const now = new Date();

  if (message.from === "me") {
    return (
      <View className="flex-row justify-end pl-12">
        <View className="bg-primary rounded-2xl rounded-br-md px-4 py-3">
          <Text
            className="text-primary-foreground"
            style={typography["body.sm"]}
          >
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
            <Text
              className="text-foreground px-2 pt-2"
              style={typography["list.title"]}
            >
              {message.confirmed ? "Badanie dodane" : "Dodać badanie?"}
            </Text>
            <ExaminationCard
              name={message.proposal.name}
              date={message.proposal.date}
              time={message.proposal.time}
              ownerName={message.proposal.ownerName}
            />
            {message.proposal.cycleInterval && (
              <Text
                className="text-muted-foreground px-2"
                style={typography.meta}
              >
                Cykliczne: {formatCycleInterval(message.proposal.cycleInterval)}
              </Text>
            )}
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
                  <Button
                    title="Dodaj"
                    iconLeft={Plus}
                    onPress={() => onAdd(message.id)}
                  />
                </View>
              </View>
            )}
          </View>
        )}

        {message.marking && (
          <View className="bg-surface border border-border rounded-xl p-2">
            <Text
              className="text-foreground px-2 pt-2"
              style={typography["list.title"]}
            >
              {message.confirmed
                ? "Zapisano"
                : message.marking.akcja === "wykonane"
                  ? "Oznaczyć jako wykonane?"
                  : "Oznaczyć jako pominięte?"}
            </Text>
            <ExaminationCard
              name={message.marking.examination.name}
              date={message.marking.examination.date}
              time={message.marking.examination.time}
              color={message.marking.examination.color}
              ownerName={message.marking.ownerName}
            />
            {message.confirmed ? (
              <View className="flex-row items-center gap-2 p-2">
                <CircleCheck color={brandInk} size={iconSizes.button} />
                <Text className="text-link" style={typography.link}>
                  Zapisano
                </Text>
              </View>
            ) : (
              <View className="flex-row gap-2 p-2">
                <View className="flex-1">
                  <Button
                    title="Anuluj"
                    variant="secondary"
                    onPress={() => onFix(message.id)}
                  />
                </View>
                <View className="flex-1">
                  <Button title="Potwierdź" onPress={() => onAdd(message.id)} />
                </View>
              </View>
            )}
          </View>
        )}

        {message.dose && (
          <View className="bg-surface border border-border rounded-xl p-2">
            <Text
              className="text-foreground px-2 pt-2"
              style={typography["list.title"]}
            >
              {message.confirmed
                ? "Zapisano"
                : message.dose.status === "Taken"
                  ? "Potwierdzić dawkę?"
                  : "Oznaczyć dawkę jako pominiętą?"}
            </Text>
            {message.dose.ownerName && (
              <Text
                className="text-muted-foreground px-2"
                style={typography.meta}
              >
                Dla: {message.dose.ownerName}
              </Text>
            )}
            <View className="px-2 pt-2">
              <TodayDoseRow dose={message.dose.intake} />
            </View>
            {message.confirmed ? (
              <View className="flex-row items-center gap-2 p-2">
                <CircleCheck color={brandInk} size={iconSizes.button} />
                <Text className="text-link" style={typography.link}>
                  Zapisano
                </Text>
              </View>
            ) : (
              <View className="flex-row gap-2 p-2">
                <View className="flex-1">
                  <Button
                    title="Anuluj"
                    variant="secondary"
                    onPress={() => onFix(message.id)}
                  />
                </View>
                <View className="flex-1">
                  <Button title="Potwierdź" onPress={() => onAdd(message.id)} />
                </View>
              </View>
            )}
          </View>
        )}

        {message.medication && (
          <View className="bg-surface border border-border rounded-xl p-2">
            <Text
              className="text-foreground px-2 pt-2"
              style={typography["list.title"]}
            >
              {message.confirmed ? "Lek dodany" : "Dodać lek?"}
            </Text>
            {message.medication.ownerName && (
              <Text
                className="text-muted-foreground px-2"
                style={typography.meta}
              >
                Dla: {message.medication.ownerName}
              </Text>
            )}
            <MedicationCard
              name={message.medication.name}
              strength={message.medication.strength}
              form={message.medication.form}
              schedules={message.medication.schedules.map((s, i) => ({
                ...s,
                id: String(i),
                medicationId: "",
              }))}
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
                  <Button
                    title="Dodaj"
                    iconLeft={Plus}
                    onPress={() => onAdd(message.id)}
                  />
                </View>
              </View>
            )}
          </View>
        )}
      </View>
    </View>
  );
}
