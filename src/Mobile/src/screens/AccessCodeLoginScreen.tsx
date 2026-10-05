import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Pressable, Text, View } from "react-native";
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

type Props = {
  onLoginSuccess: () => void;
  navigation: NativeStackNavigationProp<AuthStackList, "MamKod">;
};

export default function AccessCodeLoginScreen({
  onLoginSuccess,
  navigation,
}: Props) {
  const [code, setCode] = useState("");
  const [mode, setMode] = useState<"link" | "claim">("link");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emailText, setEmailText] = useState("");
  const [passwordText, setPasswordText] = useState("");
  const [confirmPasswordText, setConfirmPasswordText] = useState("");

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
    <SafeAreaView className="m-4" edges={["bottom", "left", "right"]}>
      <TextField
        keyboardType="number-pad"
        label="Podaj kod"
        value={code}
        maxLength={6}
        onChangeText={setCode}
        error={error}
      />

      <View className="flex flex-row gap-4">
        <Pressable
          onPress={() => setMode("link")}
          className={`px-4 py-3 rounded-2xl border ${
            mode === "link"
              ? "bg-primary border-primary"
              : "border-input-border"
          }`}
        >
          <Text
            className={
              mode === "link" ? "text-primary-foreground" : "text-foreground"
            }
          >
            Połącz konto z telefonem
          </Text>
        </Pressable>

        <Pressable
          onPress={() => setMode("claim")}
          className={`px-4 py-3 rounded-2xl border ${
            mode === "claim"
              ? "bg-primary border-primary"
              : "border-input-border"
          }`}
        >
          <Text
            className={
              mode === "claim" ? "text-primary-foreground" : "text-foreground"
            }
          >
            Załóż konto
          </Text>
        </Pressable>
      </View>

      {mode === "claim" && (
        <View className="gap-4 flex flex-col">
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

      <Button
        title="Dołącz"
        variant="primary"
        onPress={handleSubmit}
        disabled={loading}
      />
    </SafeAreaView>
  );
}
