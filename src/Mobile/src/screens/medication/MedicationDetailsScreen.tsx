import { useCallback, useState } from "react";
import { Alert, Text, View } from "react-native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { SafeAreaView } from "react-native-safe-area-context";
import { RouteProp, useFocusEffect } from "@react-navigation/native";
import {
  CalendarOff,
  CalendarPlus,
  CalendarX,
  Clock,
  LucideIcon,
  Pill,
  RotateCcw,
  SquareText,
  Trash,
} from "lucide-react-native";
import { getErrorMessage } from "../../utils/errorMessage";
import {
  formatDate,
  formatDateLocal,
  formatTime,
} from "../../utils/dateFormat";
import { formatDose } from "../../utils/medicationForms";
import { timeOfDayLabels } from "../../utils/medicationTime";
import { useThemeColor } from "../../theme/useThemeColor";
import ErrorState from "../../components/ErrorState";
import Button from "../../components/Button";
import { MedicationStack } from "../../navigation/MedicationsStack";
import { MedicationResponse } from "../../types/MedicationTypes";
import { MedicationScheduleResponse } from "../../types/MedicationScheduleTypes";
import {
  medicationDelete,
  medicationDiscontinue,
  medicationGetOne,
  medicationResume,
} from "../../api/medication";
import { medicationScheduleGet } from "../../api/medicationSchedule";
import { PersonContext } from "../../types/FamilyTypes";

type Props = {
  navigation: NativeStackNavigationProp<MedicationStack, "SzczegolyLeku">;
  route: RouteProp<MedicationStack, "SzczegolyLeku">;
  person?: PersonContext;
};

function DetailField({
  icon,
  label,
  value,
  emptyText = "Nie podano",
}: {
  icon: LucideIcon;
  label: string;
  value?: string | null;
  emptyText?: string;
}) {
  const Icon = icon;
  const iconColor = useThemeColor("--ink-3");
  return (
    <View className="flex-row items-center gap-3 mb-3">
      <Icon size={20} color={iconColor} />
      <Text className="text-foreground flex-1">
        {label}: {value || emptyText}
      </Text>
    </View>
  );
}

// Stare pory mogą nie mieć godziny — wtedy pokazujemy porę dnia.
function scheduleLabel(schedule: MedicationScheduleResponse) {
  return schedule.time
    ? formatTime(schedule.time)
    : timeOfDayLabels[schedule.timeOfDay];
}

export default function MedicationDetailsScreen({
  navigation,
  route,
  person,
}: Props) {
  const canManage = !person || person.canManage;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Osobno od loading, żeby akcja (odstaw/usuń) nie zamieniała całego ekranu na "Ładowanie..."
  const [acting, setActing] = useState(false);
  const iconColor = useThemeColor("--ink-3");

  const [medication, setMedication] = useState<MedicationResponse | null>(null);
  const [medicationSchedule, setMedicationSchedule] = useState<
    MedicationScheduleResponse[]
  >([]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [medication, schedules] = await Promise.all([
        medicationGetOne(route.params.medicationId),
        medicationScheduleGet(route.params.medicationId),
      ]);
      setMedication(medication);
      setMedicationSchedule(schedules);
    } catch (e) {
      setError(getErrorMessage(e, "Nie udało się pobrać leku"));
    } finally {
      setLoading(false);
    }
  }, [route.params.medicationId]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  async function handleDeleteMedication() {
    setActing(true);
    try {
      await medicationDelete(route.params.medicationId);
      navigation.goBack();
    } catch (e) {
      // 409 = lek ma historię przyjęć; backend sam podpowiada, żeby go odstawić
      Alert.alert(
        "Nie można usunąć",
        getErrorMessage(e, "Nie udało się usunąć leku."),
      );
    } finally {
      setActing(false);
    }
  }

  function handleDelete() {
    Alert.alert(
      "Usuń lek",
      "Usuwanie służy do poprawiania pomyłek. Jeśli kończysz przyjmowanie leku, użyj „Odstaw”.",
      [
        { text: "Anuluj", style: "cancel" },
        { text: "Usuń", style: "destructive", onPress: handleDeleteMedication },
      ],
    );
  }

  async function handleDiscontinueMedication() {
    setActing(true);
    try {
      const updated = await medicationDiscontinue(
        { date: formatDateLocal(new Date()) },
        route.params.medicationId,
      );
      setMedication(updated);
    } catch (e) {
      Alert.alert("Błąd", getErrorMessage(e, "Nie udało się odstawić leku."));
    } finally {
      setActing(false);
    }
  }

  function handleDiscontinue() {
    Alert.alert(
      "Odstaw lek",
      "Lek zniknie z listy i z dawek na dziś. Historia przyjęć zostaje.",
      [
        { text: "Anuluj", style: "cancel" },
        { text: "Odstaw", onPress: handleDiscontinueMedication },
      ],
    );
  }

  async function handleResume() {
    setActing(true);
    try {
      const updated = await medicationResume(route.params.medicationId);
      setMedication(updated);
    } catch (e) {
      Alert.alert("Błąd", getErrorMessage(e, "Nie udało się wznowić leku."));
    } finally {
      setActing(false);
    }
  }

  if (loading) {
    return (
      <SafeAreaView className="flex-1" edges={["bottom", "left", "right"]}>
        <Text className="text-foreground m-4">Ładowanie...</Text>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView className="flex-1" edges={["bottom", "left", "right"]}>
        <ErrorState message={error} onRetry={load} />
      </SafeAreaView>
    );
  }

  if (!medication) {
    return null;
  }

  const strengthAndForm = medication.strength
    ? `${medication.strength} ${medication.form}`
    : medication.form;

  // Chronologicznie; pory bez godziny na końcu
  const sortedSchedules = [...medicationSchedule].sort((a, b) =>
    (a.time ?? "99").localeCompare(b.time ?? "99"),
  );

  return (
    <SafeAreaView
      className="flex-1 bg-screen p-4"
      edges={["bottom", "left", "right"]}
    >
      <Text className="text-foreground text-xl font-semibold mb-1">
        {medication.name}
      </Text>
      {medication.discontinuedOn && (
        <Text className="text-danger mb-3">
          Odstawiony od {formatDate(medication.discontinuedOn)}
        </Text>
      )}

      <View className="mt-3">
        <DetailField icon={Pill} label="Moc i postać" value={strengthAndForm} />
        <DetailField
          icon={SquareText}
          label="Notatka"
          value={medication.notes}
        />
        <DetailField
          icon={CalendarPlus}
          label="Data rozpoczęcia"
          value={medication.startDate ? formatDate(medication.startDate) : null}
        />
        <DetailField
          icon={CalendarX}
          label="Data zakończenia"
          value={medication.endDate ? formatDate(medication.endDate) : null}
          emptyText="Bez daty zakończenia"
        />
      </View>

      <Text className="text-foreground font-semibold text-sm mt-4 mb-2">
        Pory przyjmowania
      </Text>
      {sortedSchedules.length === 0 ? (
        <Text className="text-muted-foreground">Brak pór przyjmowania</Text>
      ) : (
        sortedSchedules.map((schedule) => (
          <View key={schedule.id} className="flex-row items-center gap-3 mb-2">
            <Clock size={20} color={iconColor} />
            <Text className="text-foreground">
              {scheduleLabel(schedule)} ·{" "}
              {formatDose(schedule.amount, medication.form)}
            </Text>
          </View>
        ))
      )}

      {canManage && (
        <View className="mt-auto gap-3">
          {medication.discontinuedOn ? (
            <Button
              title="Wznów lek"
              variant="secondary"
              iconLeft={RotateCcw}
              onPress={handleResume}
              disabled={acting}
            />
          ) : (
            <Button
              title="Odstaw lek"
              variant="secondary"
              iconLeft={CalendarOff}
              onPress={handleDiscontinue}
              disabled={acting}
            />
          )}
          <Button
            title="Usuń lek"
            variant="danger"
            iconLeft={Trash}
            onPress={handleDelete}
            disabled={acting}
          />
        </View>
      )}
    </SafeAreaView>
  );
}
