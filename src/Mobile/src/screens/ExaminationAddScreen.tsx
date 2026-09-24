import { useState } from "react";
import { Text, View, Pressable, TextInput, Switch } from "react-native";
import { examinationCreate } from "../api/examination";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { ExaminationStack } from "../navigation/ExaminationsStack";
import { ChevronRight } from "lucide-react-native";
import DateTimePicker from "@react-native-community/datetimepicker";

type Props = {
  navigation: NativeStackNavigationProp<ExaminationStack, "DodajBadanie">;
};

export default function ExaminationAddScreen({ navigation }: Props) {
  const [step, setStep] = useState<1 | 2>(1);
  const [nameTextExamination, setNameTextExamination] = useState("");
  const [dateExamination, setDateExamination] = useState("");
  const [timeExamination, setTimeExamination] = useState("");
  const [locationExamination, setLocationExamination] = useState("");
  const [doctorExamination, setDoctorExamination] = useState("");
  const [preparationExamination, setPreparationExamination] = useState("");
  const [isCyclicExamination, setIsCyclicExamination] = useState(false);
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  async function handleCreateExamination() {
    const examination = {
      name: nameTextExamination,
      date: dateExamination,
      time: timeExamination || null,
      location: locationExamination || null,
      doctor: doctorExamination || null,
      preparaton: preparationExamination || null,
      isCyclic: isCyclicExamination,
    };
    setInfo("");
    setLoading(true);

    try {
      await examinationCreate(examination);
      navigation.goBack();
    } catch (e) {
      if (e instanceof Error) {
        setInfo(e.message);
      } else {
        setInfo("Nieznany błąd");
      }
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

  if (step === 1) {
    return (
      <View className="flex-1 items-center justify-center bg-screen">
        <Text className="text-foreground">Dodaj Badanie</Text>
        <TextInput
          placeholder="Nazwa Badania"
          autoCapitalize="none"
          className="border-2 border-input-border bg-input text-foreground placeholder:text-placeholder"
          value={nameTextExamination}
          onChangeText={setNameTextExamination}
        ></TextInput>
        <Pressable onPress={() => setShowDatePicker(true)}>
          <Text>{dateExamination || "Wybierz datę"}</Text>
        </Pressable>
        {showDatePicker && (
          <DateTimePicker
            value={new Date()}
            mode="date"
            onChange={(event, selectedDate) => {
              setShowDatePicker(false);
              if (selectedDate) {
                const date = selectedDate.toISOString().split("T")[0];
                setDateExamination(date);
              }
            }}
          />
        )}
        <Pressable onPress={() => setShowTimePicker(true)}>
          <Text>{timeExamination || "Wybierz godzinę"}</Text>
        </Pressable>
        {showTimePicker && (
          <DateTimePicker
            value={new Date()}
            mode="time"
            onChange={(event, selectedDate) => {
              setShowTimePicker(false);
              if (selectedDate) {
                const date = selectedDate
                  .toISOString()
                  .split("T")[1]
                  .split(".")[0];
                setTimeExamination(date);
              }
            }}
          />
        )}
        <TextInput
          placeholder="np. Przychodnia Zdrowia Toruń"
          autoCapitalize="none"
          className="border-2 border-input-border bg-input text-foreground placeholder:text-placeholder"
          value={locationExamination}
          onChangeText={setLocationExamination}
        ></TextInput>
        <TextInput
          placeholder="np. Doktor Nowak"
          autoCapitalize="none"
          className="border-2 border-input-border bg-input text-foreground placeholder:text-placeholder"
          value={doctorExamination}
          onChangeText={setDoctorExamination}
        ></TextInput>
        <Pressable
          className="flex flex-row bg-slate-400"
          onPress={handleNextPage}
        >
          <ChevronRight />
          <Text className="pl-2">Dalej</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View className="flex-1 items-center justify-center bg-screen">
      <TextInput
        placeholder="np. Na czczo, min, 12 godz bez posiłku"
        autoCapitalize="none"
        className="border-2 border-input-border bg-input text-foreground placeholder:text-placeholder"
        value={preparationExamination}
        onChangeText={setPreparationExamination}
      ></TextInput>
      <Switch
        value={isCyclicExamination}
        onValueChange={setIsCyclicExamination}
      />
      <Pressable onPress={handleCreateExamination} disabled={loading}>
        <Text className="text-primary-foreground mt-8 bg-neutral-600 p-2 rounded-xl">
          {loading ? "Zapisywanie..." : "Zapisz badanie"}
        </Text>
      </Pressable>
    </View>
  );
}
