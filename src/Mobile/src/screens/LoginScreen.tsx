import { useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import { login } from "../api/auth";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { AuthStackList } from "../navigation/AuthStack";
import { saveRefreshToken } from "../storage/tokenStorage";
import { setToken } from "../storage/accessToken";
import { SafeAreaView } from "react-native-safe-area-context";

type Props = {
  onLoginSuccess: () => void;
  navigation: NativeStackNavigationProp<AuthStackList, "Login">;
};

export default function LoginScreen({ onLoginSuccess, navigation }: Props) {
  const [emailText, setEmailText] = useState("");
  const [passwordText, setPasswordText] = useState("");
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    const user = { email: emailText, password: passwordText };
    setInfo("");
    setLoading(true);

    try {
      const loginData = await login(user);
      await saveRefreshToken(loginData.refreshToken);
      setToken(loginData.token);
      onLoginSuccess();
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

  return (
    <SafeAreaView className="flex-1 items-center justify-center bg-screen">
      <Text className="text-foreground">Zaloguj się do aplikacji</Text>
      <TextInput
        placeholder="Email"
        autoCapitalize="none"
        keyboardType="email-address"
        className="border-2 border-input-border bg-input text-foreground placeholder:text-placeholder"
        value={emailText}
        onChangeText={setEmailText}
      ></TextInput>
      <TextInput
        placeholder="Hasło"
        secureTextEntry
        autoCapitalize="none"
        className="border-2 border-input-border bg-input text-foreground placeholder:text-placeholder"
        value={passwordText}
        onChangeText={setPasswordText}
      ></TextInput>
      {info !== "" && (
        <Text className="font-bold text-destructive">{info}</Text>
      )}
      <Pressable
        disabled={loading}
        className={
          loading ? "p-2 rounded-xl bg-disabled" : "p-2 rounded-xl bg-primary"
        }
        onPress={handleLogin}
      >
        <Text
          className={
            loading ? "text-disabled-foreground" : "text-primary-foreground"
          }
        >
          {loading ? "Logowanie" : "Zaloguj się!"}
        </Text>
      </Pressable>
      <Pressable onPress={() => navigation.navigate("Register")}>
        <Text className="text-link bg-surface p-2 rounded-xl mt-3">
          Nie masz konta? Zarejestruj się
        </Text>
      </Pressable>
    </SafeAreaView>
  );
}
