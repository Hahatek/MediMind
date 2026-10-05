import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { HomeStackList } from "../navigation/HomeStack";
import { SafeAreaView } from "react-native-safe-area-context";
import TextField from "../components/TextField";
import { useState } from "react";
import { getErrorMessage } from "../utils/errorMessage";
import { familyCreateProfile } from "../api/family";
import { RouteProp } from "@react-navigation/native";
import { CreateManagedProfile } from "../types/FamilyTypes";
import { Text, View } from "react-native";
import PickerField from "../components/PickerField";
import Button from "../components/Button";

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
    const newProfile: CreateManagedProfile = {
      firstName: firstNameProfile,
      lastName: lastNameProfile,
      birthDate: dateProfile,
    };
    if (!firstNameProfile) {
      setFieldErrors({ firstName: "Podaj imię" });
      return;
    }
    if (!lastNameProfile) {
      setFieldErrors({ lastName: "Podaj nazwisko" });
      return;
    }
    if (!dateProfile) {
      setFieldErrors({ birthDate: "Podaj datę urodzenia" });
      return;
    }
    setLoading(true);
    setError(null);
    setFieldErrors({});
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
      <View className="flex-1 w-full">
        <View className="gap-2 w-full mb-6">
          <TextField
            label="Imię"
            placeholder="Jan"
            required
            error={fieldErrors.firstName}
            value={firstNameProfile}
            onChangeText={setFirstNameProfile}
          />
          <TextField
            label="Nazwisko"
            placeholder="Kowalski"
            required
            error={fieldErrors.lastName}
            value={lastNameProfile}
            onChangeText={setLastNameProfile}
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
        </View>
        <Button
          title="Dodaj"
          onPress={() => handleCreateNewProfile()}
          disabled={loading}
        />
        {error && (
          <Text className="font-bold text-destructive mt-4">{error}</Text>
        )}
      </View>
    </SafeAreaView>
  );
}
