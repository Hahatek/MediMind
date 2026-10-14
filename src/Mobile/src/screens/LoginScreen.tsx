import { useState } from "react";
import {
  View,
  Text,
  Image,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { login } from "../api/auth";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { AuthStackList } from "../navigation/AuthStack";
import { saveRefreshToken } from "../storage/tokenStorage";
import { setToken } from "../storage/accessToken";

import TextField from "../components/TextField";
import Button from "../components/Button";
import { typography } from "../theme";

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
    const user = {
      email: emailText,
      password: passwordText,
    };

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
    }

    setLoading(false);
  }

  return (
    <SafeAreaView className="flex-1 bg-screen" edges={["top"]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          showsVerticalScrollIndicator={false}
        >
          <View className="items-center">
            <Image
              source={require("../../assets/LoginScreenPhoto.png")}
              className="w-[400px] h-[400px]"
              resizeMode="contain"
            />
          </View>

          <View className="px-7">
            <Text
              className="text-foreground mb-2"
              style={typography["title.hero"]}
            >
              Witaj ponownie
            </Text>

            <Text className="text-ink-3 mb-7" style={typography["body.lg"]}>
              Zaloguj się, żeby zobaczyć swoje badania i leki.
            </Text>

            <TextField
              label="Adres e-mail"
              keyboardType="email-address"
              autoCapitalize="none"
              value={emailText}
              onChangeText={setEmailText}
              placeholder="jan.kowalski@example.com"
              returnKeyType="next"
            />

            <TextField
              label="Hasło"
              secureTextEntry
              value={passwordText}
              onChangeText={setPasswordText}
              placeholder="••••••••"
              returnKeyType="go"
              onSubmitEditing={handleLogin}
            />

            {info !== "" && (
              <Text className="text-danger mb-4" style={typography["field.error"]}>
                {info}
              </Text>
            )}

            <Button
              title="Zaloguj się"
              loadingTitle="Logowanie..."
              onPress={handleLogin}
              loading={loading}
              variant="primary"
            />

            <View className="flex-row flex-wrap justify-center mt-5">
              <Text className="text-ink-3" style={typography.body}>
                Nie masz konta?{" "}
              </Text>

              <Pressable onPress={() => navigation.navigate("Register")}>
                <Text className="text-link" style={typography.link}>
                  Zarejestruj się
                </Text>
              </Pressable>
            </View>
            <View className="flex-row flex-wrap justify-center mt-5">
              <Text className="text-ink-3" style={typography.body}>
                Posiadasz kod od rodziny?{" "}
              </Text>

              <Pressable onPress={() => navigation.navigate("WyborKodu")}>
                <Text className="text-link" style={typography.link}>
                  Wpisz kod
                </Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
