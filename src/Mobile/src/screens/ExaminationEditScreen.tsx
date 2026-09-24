import { useEffect, useState } from "react";
import { Text, View, Pressable, TextInput } from "react-native";
import { examinationGetOne, examinationPut } from "../api/examination";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { ExaminationStack } from "../navigation/ExaminationsStack";
import { RouteProp } from "@react-navigation/native";
import { ExaminationResponse } from "../types/ExaminationTypes";
import { SafeAreaView } from "react-native-safe-area-context";

type Props = {
  navigation: NativeStackNavigationProp<ExaminationStack, "EdytujBadanie">;
  route: RouteProp<ExaminationStack, "EdytujBadanie">;
};

export default function ExaminationEditScreen({ navigation, route }: Props) {
  const [examinationData, setExaminationData] =
    useState<ExaminationResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [location, setLocation] = useState("");
  const [doctor, setDoctor] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    setLoading(true);
    async function dataExamination() {
      try {
        const response = await examinationGetOne(route.params.examinationId);
        setExaminationData(response);
        setName(response.name);
        setDate(response.date);
        setTime(response.time ?? "");
        setLocation(response.location ?? "");
        setDoctor(response.doctor ?? "");
        setDescription(response.description ?? "");
      } catch {
        setError("Nie udało się wczytać informacji o badaniu");
      } finally {
        setLoading(false);
      }
    }
    dataExamination();
  }, [route.params.examinationId]);

  async function handleSave() {
    if (!examinationData) return;
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
    } catch {
      setError("Nie udało się zapisać zmian");
    } finally {
      setSaving(false);
    }
  }

  // Guard clauses odrzucamy przypadki, w których nie możemy kontynuować. Potem piszemy główną logikę bez niepotrzebnych zagnieżdżeń.
  if (loading) {
    return (
      <SafeAreaView className="flex-1">
        <Text className="text-foreground">Ładowanie...</Text>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView className="flex-1">
        <Text className="text-foreground">{error}</Text>
      </SafeAreaView>
    );
  }

  if (!examinationData) {
    return null;
  }

  return (
    <SafeAreaView className="flex-1">
      <TextInput
        className="text-foreground text-xl border-b-2 p-2 mb-2"
        placeholder="Nazwa Badania"
        value={name}
        onChangeText={setName}
      />
      <TextInput
        className="text-foreground border-b-2 p-2 mb-2"
        placeholder="Data (YYYY-MM-DD)"
        value={date}
        onChangeText={setDate}
      />
      <TextInput
        className="text-foreground border-b-2 p-2 mb-2"
        placeholder="Godzina"
        value={time}
        onChangeText={setTime}
      />
      <TextInput
        className="text-foreground border-b-2 p-2 mb-2"
        placeholder="Lokalizacja"
        value={location}
        onChangeText={setLocation}
      />
      <TextInput
        className="text-foreground border-b-2 p-2 mb-2"
        placeholder="Lekarz"
        value={doctor}
        onChangeText={setDoctor}
      />
      <TextInput
        className="text-foreground border-b-2 p-2 mb-2"
        placeholder="Opis"
        value={description}
        onChangeText={setDescription}
      />
      <Pressable
        onPress={handleSave}
        disabled={saving}
        className="mt-8 bg-neutral-600 p-2 rounded-xl"
      >
        <Text className="text-primary-foreground">
          {saving ? "Zapisywanie..." : "Zapisz zmiany"}
        </Text>
      </Pressable>
    </SafeAreaView>
  );
}
