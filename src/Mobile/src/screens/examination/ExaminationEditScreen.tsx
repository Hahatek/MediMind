import { useCallback, useEffect, useState } from "react";
import { Text, View } from "react-native";
import { examinationGetOne, examinationPut } from "../../api/examination";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { ExaminationStack } from "../../navigation/ExaminationsStack";
import { RouteProp } from "@react-navigation/native";
import { ExaminationResponse } from "../../types/ExaminationTypes";
import { SafeAreaView } from "react-native-safe-area-context";
import Button from "../../components/Button";
import ErrorState from "../../components/ErrorState";
import PickerField from "../../components/PickerField";
import TextField from "../../components/TextField";
import { getErrorMessage } from "../../utils/errorMessage";

type Props = {
  navigation: NativeStackNavigationProp<ExaminationStack, "EdytujBadanie">;
  route: RouteProp<ExaminationStack, "EdytujBadanie">;
};

export default function ExaminationEditScreen({ navigation, route }: Props) {
  const [examinationData, setExaminationData] =
    useState<ExaminationResponse | null>(null);
  const [loading, setLoading] = useState(false);
  // Dwa osobne błędy: loadError zastępuje cały ekran (nie ma czego edytować),
  // saveError pokazujemy pod formularzem, żeby nie zniknęły wpisane zmiany.
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [location, setLocation] = useState("");
  const [doctor, setDoctor] = useState("");
  const [description, setDescription] = useState("");

  const dataExamination = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const response = await examinationGetOne(route.params.examinationId);
      setExaminationData(response);
      setName(response.name);
      setDate(response.date);
      setTime(response.time ?? "");
      setLocation(response.location ?? "");
      setDoctor(response.doctor ?? "");
      setDescription(response.description ?? "");
    } catch (e) {
      setLoadError(
        getErrorMessage(e, "Nie udało się wczytać informacji o badaniu"),
      );
    } finally {
      setLoading(false);
    }
  }, [route.params.examinationId]);

  useEffect(() => {
    dataExamination();
  }, [dataExamination]);

  async function handleSave() {
    if (!examinationData) return;
    if (!name.trim()) {
      setSaveError("Podaj nazwę badania");
      return;
    }
    if (!date) {
      setSaveError("Podaj datę badania");
      return;
    }
    setSaveError(null);
    setSaving(true);
    try {
      await examinationPut(
        {
          name,
          date,
          time: time || null,
          location: location || null,
          doctor: doctor || null,
          description: description || null,
          isCyclic: examinationData.isCyclic,
          status: examinationData.status,
          cycleInterval: examinationData.cycleInterval,
          preparation: examinationData.preparation,
          color: examinationData.color,
          icon: examinationData.icon,
        },
        route.params.examinationId,
      );
      navigation.goBack();
    } catch (e) {
      setSaveError(getErrorMessage(e, "Nie udało się zapisać zmian"));
    } finally {
      setSaving(false);
    }
  }

  // Guard clauses odrzucamy przypadki, w których nie możemy kontynuować. Potem piszemy główną logikę bez niepotrzebnych zagnieżdżeń.
  if (loading) {
    return (
      <SafeAreaView className="flex-1" edges={["bottom", "left", "right"]}>
        <Text className="text-foreground">Ładowanie...</Text>
      </SafeAreaView>
    );
  }

  if (loadError) {
    return (
      <SafeAreaView className="flex-1" edges={["bottom", "left", "right"]}>
        <ErrorState message={loadError} onRetry={dataExamination} />
      </SafeAreaView>
    );
  }

  if (!examinationData) {
    return null;
  }

  return (
    <SafeAreaView
      className="flex flex-1 m-4"
      edges={["bottom", "left", "right"]}
    >
      <TextField
        label="Nazwa Badania"
        placeholder="Morfologia"
        required
        autoCapitalize="none"
        value={name}
        onChangeText={setName}
      />
      <PickerField
        label="Data"
        mode="date"
        required
        value={date}
        onChange={setDate}
      />
      <PickerField
        label="Godzina"
        mode="time"
        value={time}
        onChange={setTime}
      />
      <TextField
        label="Lokalizacja badania"
        placeholder="np. Przychodnia Zdrowia Toruń"
        autoCapitalize="none"
        value={location}
        onChangeText={setLocation}
      />
      <TextField
        label="Doktor przeprowadzający badanie"
        placeholder="np. Doktor Nowak"
        autoCapitalize="none"
        value={doctor}
        onChangeText={setDoctor}
      />
      <TextField
        label="Opis"
        placeholder="Dodatkowe informacje"
        value={description}
        onChangeText={setDescription}
      />
      <View className="mt-8">
        <Button
          title="Zapisz zmiany"
          loadingTitle="Zapisywanie..."
          variant="primary"
          onPress={handleSave}
          loading={saving}
        />
      </View>
      {saveError && <Text className="text-danger mt-2">{saveError}</Text>}
    </SafeAreaView>
  );
}
