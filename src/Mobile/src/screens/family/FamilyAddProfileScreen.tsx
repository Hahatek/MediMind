import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { HomeStackList } from "../../navigation/HomeStack";
import { SafeAreaView } from "react-native-safe-area-context";
import TextField from "../../components/TextField";
import { useState } from "react";
import { getErrorMessage } from "../../utils/errorMessage";
import { familyCreateProfile } from "../../api/family";
import { RouteProp } from "@react-navigation/native";
import { CreateManagedProfile } from "../../types/FamilyTypes";
import { ScrollView, Text, View } from "react-native";
import { Plus } from "lucide-react-native";
import PickerField from "../../components/PickerField";
import Button from "../../components/Button";
import { typography } from "../../theme/typography";

type Props = {
  navigation: NativeStackNavigationProp<HomeStackList, "DodajProfil">;
  route: RouteProp<HomeStackList, "DodajProfil">;
};

type FieldErros = {
  firstName?: string;
  lastName?: string;
  birthDate?: string;
};

export default function FamilyAddProfileScreen({ navigation, route }: Props) {
  const [firstNameProfile, setFirstNameProfile] = useState("");
  const [lastNameProfile, setLastNameProfile] = useState("");
  const [dateProfile, setDateProfile] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErros>({});

  async function handleCreateNewProfile() {
    const errors: FieldErros = {};
    if (!firstNameProfile.trim()) errors.firstName = "Wpisz imię.";
    if (!lastNameProfile.trim()) errors.lastName = "Wpisz nazwisko.";
    if (!dateProfile) errors.birthDate = "Wybierz datę urodzenia.";
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    const newProfile: CreateManagedProfile = {
      firstName: firstNameProfile.trim(),
      lastName: lastNameProfile.trim(),
      birthDate: dateProfile,
    };
    setLoading(true);
    setError(null);
    try {
      await familyCreateProfile(route.params.familyId, newProfile);
      navigation.goBack();
    } catch (e) {
      setError(getErrorMessage(e, "Nie udało się utworzyć profilu"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView
      edges={["bottom", "left", "right"]}
      className="flex-1 bg-screen"
    >
      <ScrollView contentContainerClassName="flex-grow px-4 pt-6 pb-8">
        <Text className="text-ink-3 mb-6" style={typography["body.sm"]}>
          Dla osoby, która nie korzysta z telefonu. Będziesz prowadzić jej
          badania i leki.
        </Text>
        <TextField
          label="Imię"
          placeholder="Maria"
          required
          error={fieldErrors.firstName}
          value={firstNameProfile}
          onChangeText={setFirstNameProfile}
          autoCapitalize="words"
        />
        <TextField
          label="Nazwisko"
          placeholder="Kowalska"
          required
          error={fieldErrors.lastName}
          value={lastNameProfile}
          onChangeText={setLastNameProfile}
          autoCapitalize="words"
        />
        <PickerField
          label="Data urodzenia"
          mode="date"
          required
          error={fieldErrors.birthDate}
          value={dateProfile}
          onChange={setDateProfile}
          maximumDate={new Date()}
        />
        {error && (
          <Text className="text-destructive" style={typography["field.error"]}>
            {error}
          </Text>
        )}
        <View className="flex-1" />
        <View className="mt-6">
          <Button
            title="Dodaj"
            iconLeft={Plus}
            onPress={handleCreateNewProfile}
            loading={loading}
            loadingTitle="Dodawanie..."
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
