import { useState } from "react";
import { ScrollView, View, Text, Pressable } from "react-native";
import { Plus, Trash2 } from "lucide-react-native";

import TextField from "./TextField";
import Button from "./Button";
import PickerField from "./PickerField";

import { medicationForms } from "../utils/medicationForms";
import { getMedicationTimeOfDay } from "../utils/medicationTime";
import { parseAmount } from "../utils/amount";
import { pluralize } from "../utils/pluralize";
import { getErrorMessage } from "../utils/errorMessage";

import { MedicationTime } from "../types/EnumTypes";

// To, co formularz oddaje ekranowi. Pasuje do CreateMedication (dodawanie),
// a id pory pozwala ekranowi edycji odróżnić pory istniejące od nowych.
export type MedicationFormValues = {
  name: string;
  strength: string | null;
  form: string;
  notes: string | null;
  schedules: {
    id?: string; // brak = nowa pora
    timeOfDay: MedicationTime;
    time: string;
    amount: number;
  }[];
};

type Props = {
  onSubmit: (values: MedicationFormValues) => Promise<void>;
  initialValues?: MedicationFormInitialValues;
};

type ScheduleDraft = {
  key: string;
  id?: string;
  time: string;
  amount: string;
};

export type MedicationFormInitialValues = {
  name: string;
  strength: string;
  form: string;
  notes: string;
  schedules: {
    id: string;
    time: string;
    amount: string;
  }[];
};

function createSchedule(): ScheduleDraft {
  return {
    key: `${Date.now()}-${Math.random()}`,
    time: "",
    amount: "1",
  };
}

export default function MedicationForm({ onSubmit, initialValues }: Props) {
  const [name, setName] = useState(initialValues?.name ?? "");
  const [strength, setStrength] = useState(initialValues?.strength ?? "");
  const [notes, setNotes] = useState(initialValues?.notes ?? "");

  const initialForm = initialValues?.form ?? "tabletka";
  const isKnownForm = medicationForms.some(
    (option) => option.one === initialForm,
  );

  const [selectedForm, setSelectedForm] = useState(
    isKnownForm ? initialForm : "other",
  );

  const [customForm, setCustomForm] = useState(isKnownForm ? "" : initialForm);

  const [schedules, setSchedules] = useState<ScheduleDraft[]>(() =>
    initialValues
      ? initialValues.schedules.map((schedule) => ({
          key: schedule.id,
          id: schedule.id,
          time: schedule.time,
          amount: schedule.amount,
        }))
      : [createSchedule()],
  );

  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  function buildMedication(): MedicationFormValues | string {
    const form = selectedForm === "other" ? customForm.trim() : selectedForm;

    if (!name.trim()) {
      return "Podaj nazwę leku";
    }

    if (!form) {
      return "Podaj postać leku";
    }

    if (schedules.some((schedule) => !schedule.time)) {
      return "Każda pora musi mieć godzinę";
    }

    const times = schedules.map((schedule) => schedule.time);

    if (new Set(times).size !== times.length) {
      return "Dwie pory mają tę samą godzinę";
    }

    const amounts = schedules.map((schedule) => parseAmount(schedule.amount));

    if (
      amounts.some(
        (amount) => amount === null || amount < 0.01 || amount > 1000,
      )
    ) {
      return "Ilość musi być liczbą od 0,01 do 1000";
    }

    return {
      name: name.trim(),
      strength: strength.trim() || null,
      form,
      notes: notes.trim() || null,

      schedules: schedules.map((schedule, index) => ({
        id: schedule.id,
        timeOfDay: getMedicationTimeOfDay(schedule.time),
        time: schedule.time,
        amount: amounts[index]!,
      })),
    };
  }

  async function handleSubmit() {
    const medication = buildMedication();

    if (typeof medication === "string") {
      setError(medication);
      return;
    }

    setError(null);
    setSaving(true);

    try {
      await onSubmit(medication);
    } catch (error) {
      setError(getErrorMessage(error, "Nie udało się zapisać leku"));
    } finally {
      setSaving(false);
    }
  }

  function addSchedule() {
    setSchedules([...schedules, createSchedule()]);
  }

  function removeSchedule(key: string) {
    setSchedules(schedules.filter((schedule) => schedule.key !== key));
  }

  function updateSchedule(key: string, changes: Partial<ScheduleDraft>) {
    setSchedules(
      schedules.map((schedule) =>
        schedule.key === key ? { ...schedule, ...changes } : schedule,
      ),
    );
  }

  const formOption = medicationForms.find(
    (option) => option.one === selectedForm,
  );

  return (
    <View className="flex-1">
      <ScrollView
        className="flex-1"
        contentContainerClassName="p-4"
        keyboardShouldPersistTaps="handled"
      >
        <TextField
          label="Nazwa leku"
          placeholder="np. Apap Noc"
          required
          value={name}
          onChangeText={setName}
        />

        <TextField
          label="Moc"
          placeholder="np. 875/125 mg"
          autoCapitalize="none"
          value={strength}
          onChangeText={setStrength}
        />

        <Text className="text-foreground font-semibold text-sm mb-1">
          Postać
        </Text>

        <View className="flex-row flex-wrap gap-2 mb-4">
          {medicationForms.map((option) => (
            <Pressable
              key={option.one}
              accessibilityLabel={option.one}
              onPress={() => setSelectedForm(option.one)}
              className={`px-4 py-3 rounded-2xl border ${
                option.one === selectedForm
                  ? "bg-primary border-primary"
                  : "border-input-border"
              }`}
            >
              <Text
                className={
                  option.one === selectedForm
                    ? "text-primary-foreground"
                    : "text-foreground"
                }
              >
                {option.one}
              </Text>
            </Pressable>
          ))}

          <Pressable
            accessibilityLabel="Inna postać leku"
            onPress={() => setSelectedForm("other")}
            className={`px-4 py-3 rounded-2xl border ${
              selectedForm === "other"
                ? "bg-primary border-primary"
                : "border-input-border"
            }`}
          >
            <Text
              className={
                selectedForm === "other"
                  ? "text-primary-foreground"
                  : "text-foreground"
              }
            >
              Inna
            </Text>
          </Pressable>
        </View>

        {selectedForm === "other" && (
          <TextField
            label="Podaj postać"
            placeholder="np. saszetka"
            required
            value={customForm}
            onChangeText={setCustomForm}
          />
        )}

        <Text className="text-foreground font-semibold text-sm mb-1">
          Pory przyjmowania
        </Text>

        {schedules.map((schedule) => {
          const amount = parseAmount(schedule.amount);

          return (
            <View key={schedule.key} className="mb-2 p-3">
              <PickerField
                label="Godzina"
                mode="time"
                required
                value={schedule.time}
                onChange={(value) =>
                  updateSchedule(schedule.key, {
                    time: value,
                  })
                }
              />

              <TextField
                label="Ilość"
                keyboardType="decimal-pad"
                required
                value={schedule.amount}
                onChangeText={(value) =>
                  updateSchedule(schedule.key, {
                    amount: value,
                  })
                }
              />

              {amount !== null && (
                <Text className="text-muted-foreground text-sm mb-2">
                  {schedule.amount}{" "}
                  {formOption
                    ? pluralize(
                        amount,
                        formOption.one,
                        formOption.few,
                        formOption.many,
                      )
                    : customForm.trim()}
                </Text>
              )}

              <Button
                title="Usuń"
                variant="ghost"
                iconLeft={Trash2}
                onPress={() => removeSchedule(schedule.key)}
              />
            </View>
          );
        })}

        <View className="mb-4">
          <Button
            title="Dodaj porę"
            variant="secondary"
            iconLeft={Plus}
            onPress={addSchedule}
          />
        </View>

        <TextField
          label="Na co jest lek / notatka"
          placeholder="np. antybiotyk na zapalenie zatok"
          value={notes}
          onChangeText={setNotes}
        />
      </ScrollView>

      <View className="p-4">
        {error && <Text className="text-danger mb-2">{error}</Text>}

        <Button
          title="Zapisz"
          variant="primary"
          onPress={handleSubmit}
          disabled={saving}
        />
      </View>
    </View>
  );
}
