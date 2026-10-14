import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { View, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AuthStackList } from "../navigation/AuthStack";
import { useState } from "react";
import TextField from "../components/TextField";
import Button from "../components/Button";
import { getErrorMessage } from "../utils/errorMessage";
import { claimProfile, linkDevice, login } from "../api/auth";
import { setToken } from "../storage/accessToken";
import { saveRefreshToken } from "../storage/tokenStorage";
import { ClaimProfileRequest } from "../types/AuthTypes";
import CodeInput from "../components/CodeInput";
import { RouteProp } from "@react-navigation/native";

type Props = {
  onLoginSuccess: () => void;
  navigation: NativeStackNavigationProp<AuthStackList, "MamKod">;
  route: RouteProp<AuthStackList, "MamKod">;
};

export default function AccessCodeLoginScreen({
  onLoginSuccess,
  navigation,
  route,
}: Props) {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emailText, setEmailText] = useState("");
  const [passwordText, setPasswordText] = useState("");
  const [confirmPasswordText, setConfirmPasswordText] = useState("");

  const mode = route.params.mode;

  const modeInfo = {
    link: {
      description:
        "Kod widać na telefonie rodzica lub opiekuna, w profilu Twojej osoby.",
      badge: "Logowanie tego telefonu",
      cardText:
        "Telefon zaloguje się na konto tej osoby. Hasło nie jest potrzebne.",
      button: "Zaloguj",
      loadingButton: "Logowanie...",
    },
    claim: {
      description:
        "Opiekun pokaże Ci kod przy przekazaniu profilu. Wpisz go tutaj.",
      badge: "Przejęcie profilu",
      cardText:
        "Profil przejdzie na ten telefon. Ustawisz własny e-mail i hasło.",
      button: "To mój profil — przejmij",
      loadingButton: "Przejmowanie...",
    },
  };
  const info = modeInfo[mode];

  async function handleSubmit() {
    if (!/^\d{6}$/.test(code)) {
      setError("Kod musi mieć 6 cyfr.");
      return;
    }

    setLoading(true);
    setError(null);

    const user: ClaimProfileRequest = {
      code,
      email: emailText,
      password: passwordText,
      confirmPassword: confirmPasswordText,
    };

    try {
      if (mode === "link") {
        const codeData = await linkDevice({ code });
        await saveRefreshToken(codeData.refreshToken);
        setToken(codeData.token);
        onLoginSuccess();
      }
      if (mode === "claim") {
        const codeData = await claimProfile(user);
        await saveRefreshToken(codeData.refreshToken);
        setToken(codeData.token);
        onLoginSuccess();
      }
    } catch (e) {
      if (e instanceof Error) {
        setError(e.message);
      } else {
        setError("Nieznany błąd");
      }
    }

    setLoading(false);
  }
  return (
    <SafeAreaView
      className="flex flex-1 m-4"
      edges={["bottom", "left", "right"]}
    >
      <Text className="text-ink-3">{info.description}</Text>

      <View className="mt-6">
        <CodeInput value={code} onChange={setCode} />
        {error && <Text className="text-danger mt-1">{error}</Text>}
      </View>

      <View className="bg-surface border border-border rounded-2xl p-4 gap-2 mt-4">
        <View className="self-start rounded-full px-3 py-1 bg-tint-1">
          <Text className="text-sm text-foreground font-medium">
            {info.badge}
          </Text>
        </View>
        <Text className="text-ink-3">{info.cardText}</Text>
      </View>

      {mode === "claim" && (
        <View className="gap-4 mt-4">
          <TextField
            label="Adres e-mail"
            required
            keyboardType="email-address"
            autoCapitalize="none"
            value={emailText}
            onChangeText={setEmailText}
          />
          <TextField
            label="Hasło"
            required
            secureTextEntry
            value={passwordText}
            onChangeText={setPasswordText}
          />
          <TextField
            label="Powtórz Hasło"
            required
            secureTextEntry
            value={confirmPasswordText}
            onChangeText={setConfirmPasswordText}
          />
        </View>
      )}

      <View className="flex-1" />

      <Button
        title={info.button}
        variant="primary"
        onPress={handleSubmit}
        loading={loading}
        loadingTitle={info.loadingButton}
      />
    </SafeAreaView>
  );
}
