import { useState } from "react";
import { Text, View, Pressable, TextInput, Switch } from "react-native";
import { examinationCreate } from "../../api/examination";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RouteProp } from "@react-navigation/native";
import { ExaminationStack } from "../../navigation/ExaminationsStack";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react-native";
import { CreateExamination } from "../../types/ExaminationTypes";
import PickerField from "../../components/PickerField";
import ExaminationCard from "../../components/ExaminationCard";
import { examColors } from "../../theme/examColors";
import {
  CycleUnit,
  cycleUnitLabels,
  fromMonths,
  parseCycleValue,
  toMonths,
} from "../../utils/cycleInterval";
import { getErrorMessage } from "../../utils/errorMessage";
import Button from "../../components/Button";
import TextField from "../../components/TextField";
import { SafeAreaView } from "react-native-safe-area-context";
import { PersonContext } from "../../types/FamilyTypes";
import { typography } from "../../theme/typography";

type Props = {
  navigation: NativeStackNavigationProp<ExaminationStack, "DodajBadanie">;
  route: RouteProp<ExaminationStack, "DodajBadanie">;
  person?: PersonContext;
};

const cycleUnits = [
  { value: "months", label: cycleUnitLabels.months },
  { value: "years", label: cycleUnitLabels.years },
] as const satisfies readonly { value: CycleUnit; label: string }[];

export default function ExaminationAddScreen({
  navigation,
  route,
  person,
}: Props) {
  // "Zaplanuj kolejny termin": formularz wypełniony danymi poprzedniego badania z serii (bez daty i godziny)
  const previous = route.params?.previous;
  const previousCycle =
    previous?.cycleInterval != null ? fromMonths(previous.cycleInterval) : null;

  const [step, setStep] = useState<1 | 2>(1);
  const [nameTextExamination, setNameTextExamination] = useState(
    previous?.name ?? "",
  );
  const [dateExamination, setDateExamination] = useState("");
  const [timeExamination, setTimeExamination] = useState("");
  const [locationExamination, setLocationExamination] = useState(
    previous?.location ?? "",
  );
  const [doctorExamination, setDoctorExamination] = useState(
    previous?.doctor ?? "",
  );
  const [preparationExamination, setPreparationExamination] = useState(
    previous?.preparation ?? "",
  );
  const [isCyclicExamination, setIsCyclicExamination] = useState(
    previous?.isCyclic ?? false,
  );
  const [cycleIntervalExamination, setCycleIntervalExamination] = useState(
    previousCycle ? String(previousCycle.value) : "",
  );
  const [cycleUnitExamination, setCycleUnitExamination] = useState<CycleUnit>(
    previousCycle?.unit ?? "months",
  );
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(false);
  const [colorPickForExamination, setColorPickForExamination] = useState<
    string | null
  >(previous?.color ?? null);

  async function handleCreateExamination() {
    const cycleValue = parseCycleValue(cycleIntervalExamination);
    const examination: CreateExamination = {
      name: nameTextExamination,
      date: dateExamination,
      time: timeExamination || null,
      location: locationExamination || null,
      doctor: doctorExamination || null,
      preparation: preparationExamination || null,
      color: colorPickForExamination,
      isCyclic: isCyclicExamination,
      cycleInterval:
        isCyclicExamination && cycleValue !== null
          ? toMonths(cycleValue, cycleUnitExamination)
          : null,
      forUserId: person?.userId,
      seriesId: previous?.seriesId ?? null,
    };
    setInfo("");
    setLoading(true);

    try {
      await examinationCreate(examination);
      navigation.goBack();
    } catch (e) {
      setInfo(getErrorMessage(e, "Nie udało się zapisać badania"));
    } finally {
      setLoading(false);
    }
  }

  function handleNextPage() {
    if (!nameTextExamination) {
      setInfo("Podaj nazwę badania");
      return;
    }
    if (!dateExamination) {
      setInfo("Podaj datę badania");
      return;
    }
    setInfo("");
    setStep(2);
  }

  function handlePreviosPage() {
    setInfo("");
    setStep(1);
  }

  function handleConfirmCreateExamination() {
    if (
      isCyclicExamination &&
      parseCycleValue(cycleIntervalExamination) === null
    ) {
      setInfo("Podaj co ile ma być badanie (liczba większa od 0)");
      return;
    }
    setInfo("");
    handleCreateExamination();
  }

  if (step === 1) {
    return (
      <SafeAreaView
        edges={["bottom", "left", "right"]}
        className="flex-1 bg-screen"
      >
        <View className="flex-1 items-center justify-center m-4 bg-screen">
          <View className="flex-1 w-full">
            <View className="flex-row gap-2 w-full mb-6">
              <View
                className={`flex-1 h-1 rounded-full ${
                  step >= 1 ? "bg-primary" : "bg-gray-300 dark:bg-line-4"
                }`}
              />

              <View
                className={`flex-1 h-1 rounded-full ${
                  step >= 2 ? "bg-primary" : "bg-gray-300 dark:bg-line-4"
                }`}
              />
            </View>
            <Text className="text-ink-4 mb-8" style={typography.caption}>
              Termin i miejsce, krok 1 z 2{" "}
            </Text>

            <TextField
              label="Nazwa Badania"
              placeholder="Morfologia"
              required
              autoCapitalize="none"
              value={nameTextExamination}
              onChangeText={setNameTextExamination}
            />

            <PickerField
              label="Data"
              mode="date"
              required
              value={dateExamination}
              onChange={setDateExamination}
            />
            <PickerField
              label="Godzina"
              mode="time"
              value={timeExamination}
              onChange={setTimeExamination}
            />
            <TextField
              label="Lokalizacja badania"
              placeholder="np. Przychodnia Zdrowia Toruń"
              autoCapitalize="none"
              value={locationExamination}
              onChangeText={setLocationExamination}
            />

            <TextField
              label="Doktor przeprowadzający badanie"
              placeholder="np. Doktor Nowak"
              autoCapitalize="none"
              value={doctorExamination}
              onChangeText={setDoctorExamination}
            />

            {info && (
              <Text className="text-danger" style={typography["field.error"]}>
                {info}
              </Text>
            )}
          </View>
          <View className="w-full">
            <Button
              title={"Dalej"}
              iconLeft={ChevronRight}
              variant="primary"
              onPress={handleNextPage}
            />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      edges={["bottom", "left", "right"]}
      className="flex-1 bg-screen"
    >
      <View className="flex-1 justify-center m-4 bg-screen">
        <View className="flex-row gap-2 w-full mb-6">
          <View
            className={`flex-1 h-1 rounded-full ${
              step >= 1 ? "bg-gray-300 dark:bg-line-4" : "bg-primary"
            }`}
          />

          <View
            className={`flex-1 h-1 rounded-full ${
              step >= 2 ? "bg-primary" : "bg-gray-300 dark:bg-line-4"
            }`}
          />
        </View>
        <Text className="text-ink-4 mb-8" style={typography.caption}>
          Wygląd i przygotowanie, krok 2 z 2{" "}
        </Text>
        <View className="flex-1">
          <ExaminationCard
            name={nameTextExamination}
            date={dateExamination}
            time={timeExamination}
            location={locationExamination}
            color={colorPickForExamination}
          />
          <TextField
            label="Przygotowanie do badania"
            placeholder="np. Na czczo, min, 12 godz bez posiłku"
            autoCapitalize="none"
            value={preparationExamination}
            onChangeText={setPreparationExamination}
          />
          <View className="flex flex-row gap-2 items-center">
            <Text className="text-foreground" style={typography["option.label"]}>
              Badanie cykliczne
            </Text>
            <Switch
              value={isCyclicExamination}
              onValueChange={setIsCyclicExamination}
            />
          </View>
          {isCyclicExamination && (
            <View className="flex-row items-end gap-2">
              <View className="flex-1">
                <TextField
                  label={"Co ile ma być badanie?"}
                  keyboardType="number-pad"
                  value={cycleIntervalExamination}
                  onChangeText={setCycleIntervalExamination}
                  placeholder={
                    cycleUnitExamination === "years" ? "np. 2" : "np. 3"
                  }
                />
              </View>
              {cycleUnits.map(({ value, label }) => (
                <Pressable
                  key={value}
                  accessibilityLabel={label}
                  onPress={() => setCycleUnitExamination(value)}
                  className={`mb-4 px-4 py-3 rounded-2xl border ${value === cycleUnitExamination ? "bg-primary border-primary" : "border-input-border"}`}
                >
                  <Text
                    className={
                      value === cycleUnitExamination
                        ? "text-primary-foreground"
                        : "text-foreground"
                    }
                    style={typography["option.label"]}
                  >
                    {label}
                  </Text>
                </Pressable>
              ))}
            </View>
          )}
          {info && (
            <Text className="text-danger mb-4" style={typography["field.error"]}>
              {info}
            </Text>
          )}
          <View className="flex flex-row gap-4">
            {examColors.map((colorExamination) => (
              <Pressable
                key={colorExamination.value}
                style={{
                  backgroundColor: `${colorExamination.value}`, // colorExamination.value,
                }}
                onPress={() =>
                  setColorPickForExamination(colorExamination.value)
                }
                className={`w-10 h-10 rounded-full ${colorExamination.value === colorPickForExamination ? "border-2 border-foreground" : ""}`}
              ></Pressable>
            ))}
          </View>
        </View>

        <View className="flex flex-row gap-2 mt-4 justify-between">
          {/* shrink: przy większym tekście przyciski zwężają się i zawijają etykietę zamiast wyjść poza ekran */}
          <View className="shrink">
            <Button
              title="Wróć"
              variant="secondary"
              iconLeft={ChevronLeft}
              onPress={handlePreviosPage}
            />
          </View>
          <View className="shrink">
            <Button
              title="Zapisz badanie"
              onPress={handleConfirmCreateExamination}
              loading={loading}
              loadingTitle="Zapisuję..."
            />
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}
