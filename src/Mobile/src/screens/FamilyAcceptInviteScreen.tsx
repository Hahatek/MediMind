import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { HomeStackList } from "../navigation/HomeStack";
import { SafeAreaView } from "react-native-safe-area-context";
import TextField from "../components/TextField";
import { useState } from "react";
import { getErrorMessage } from "../utils/errorMessage";
import { inviteAccept } from "../api/family";
import Button from "../components/Button";

type Props = {
  navigation: NativeStackNavigationProp<HomeStackList, "AkceptacjaZaproszenia">;
};

export default function FamilyAcceptInviteScreen({ navigation }: Props) {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleAcceptInvite() {
    if (!/^\d{6}$/.test(code)) {
      setError("Kod musi mieć 6 cyfr.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await inviteAccept({ code: code });
      navigation.goBack();
    } catch (e) {
      setError(getErrorMessage(e, "Nie udało się dołączyć do rodziny"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView className="flex-1 m-4">
      <TextField
        keyboardType="number-pad"
        label="Podaj kod"
        value={code}
        maxLength={6}
        onChangeText={setCode}
        error={error}
      />
      <Button
        title="Dołącz"
        variant="primary"
        onPress={handleAcceptInvite}
        disabled={loading}
      />
    </SafeAreaView>
  );
}
