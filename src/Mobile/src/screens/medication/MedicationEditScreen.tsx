import { useCallback, useEffect, useState } from "react";
import { Text } from "react-native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RouteProp } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MedicationStack } from "../../navigation/MedicationsStack";
import MedicationForm, {
  MedicationFormInitialValues,
  MedicationFormValues,
} from "../../components/MedicationForm";
import ErrorState from "../../components/ErrorState";
import { medicationGetOne, medicationPut } from "../../api/medication";
import {
  medicationScheduleCreate,
  medicationScheduleDelete,
  medicationScheduleGet,
  medicationSchedulePut,
} from "../../api/medicationSchedule";
import { MedicationResponse } from "../../types/MedicationTypes";
import { MedicationScheduleResponse } from "../../types/MedicationScheduleTypes";
import { getErrorMessage } from "../../utils/errorMessage";

type Props = {
  navigation: NativeStackNavigationProp<MedicationStack, "EdytujLek">;
  route: RouteProp<MedicationStack, "EdytujLek">;
};

function toInitialValues(
  medication: MedicationResponse,
  schedules: MedicationScheduleResponse[],
): MedicationFormInitialValues {
  return {
    name: medication.name,
    strength: medication.strength ?? "",
    form: medication.form,
    notes: medication.notes ?? "",
    schedules: [...schedules]
      .sort((a, b) => (a.time ?? "99").localeCompare(b.time ?? "99"))
      .map((s) => ({
        id: s.id,
        time: s.time ?? "", // stare pory bez godziny trzeba uzupełnić przed zapisem
        amount: String(s.amount).replace(".", ","),
      })),
  };
}

export default function MedicationEditScreen({ navigation, route }: Props) {
  const { medicationId } = route.params;

  const [medication, setMedication] = useState<MedicationResponse | null>(null);
  const [originalSchedules, setOriginalSchedules] = useState<
    MedicationScheduleResponse[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const [medication, schedules] = await Promise.all([
        medicationGetOne(medicationId),
        medicationScheduleGet(medicationId),
      ]);
      setMedication(medication);
      setOriginalSchedules(schedules);
    } catch (e) {
      setLoadError(getErrorMessage(e, "Nie udało się pobrać leku"));
    } finally {
      setLoading(false);
    }
  }, [medicationId]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleSave(values: MedicationFormValues) {
    if (!medication) return;

    const scheduleIds = values.schedules
      .map((schedule) => schedule.id)
      .filter(Boolean);

    const removedSchedules = originalSchedules.filter(
      (schedule) => !scheduleIds.includes(schedule.id),
    );

    for (const schedule of removedSchedules) {
      await medicationScheduleDelete(schedule.id);
    }

    await medicationPut(
      {
        name: values.name,
        strength: values.strength,
        form: values.form,
        notes: values.notes,
        startDate: medication.startDate ?? null,
        endDate: medication.endDate ?? null,
      },
      medicationId,
    );

    for (const schedule of values.schedules) {
      const scheduleData = {
        timeOfDay: schedule.timeOfDay,
        time: schedule.time,
        amount: schedule.amount,
      };

      if (!schedule.id) {
        await medicationScheduleCreate({
          ...scheduleData,
          medicationId,
        });

        continue;
      }

      const original = originalSchedules.find(
        (item) => item.id === schedule.id,
      );

      if (
        original?.time === schedule.time &&
        original.amount === schedule.amount &&
        original.timeOfDay === schedule.timeOfDay
      ) {
        continue;
      }

      await medicationSchedulePut(scheduleData, schedule.id);
    }

    navigation.goBack();
  }

  if (loading) {
    return (
      <SafeAreaView
        className="flex-1 bg-screen"
        edges={["bottom", "left", "right"]}
      >
        <Text className="text-foreground m-4">Ładowanie...</Text>
      </SafeAreaView>
    );
  }

  if (loadError || !medication) {
    return (
      <SafeAreaView
        className="flex-1 bg-screen"
        edges={["bottom", "left", "right"]}
      >
        <ErrorState
          message={loadError ?? "Nie znaleziono leku"}
          onRetry={load}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      className="flex-1 bg-screen"
      edges={["bottom", "left", "right"]}
    >
      <MedicationForm
        initialValues={toInitialValues(medication, originalSchedules)}
        onSubmit={handleSave}
      />
    </SafeAreaView>
  );
}
