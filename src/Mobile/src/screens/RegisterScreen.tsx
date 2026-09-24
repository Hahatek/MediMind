import { useState } from "react";
import { View, Text, TextInput, Pressable } from "react-native";
import { register } from "../api/auth";
import { saveRefreshToken } from "../storage/tokenStorage";
import { setToken } from "../storage/accessToken";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { AuthStackList } from "../navigation/AuthStack";
import { SafeAreaView } from "react-native-safe-area-context";

type Props = {
  onRegisterSuccess: () => void;
  navigation: NativeStackNavigationProp<AuthStackList, "Login">;
};

export default function RegisterScreen({
  onRegisterSuccess,
  navigation,
}: Props) {
  const [name, setName] = useState("");
  const [lastName, setLastName] = useState("");
  const [emailText, setEmailText] = useState("");
  const [brithDay, setBrithDay] = useState("");
  const [passowrdText, setPasswordText] = useState("");
  const [confirmPasswordText, setRepeatPasswordText] = useState("");
  const [loading, setLoading] = useState(false);
  const [info, setInfo] = useState("");

  async function handleRegister() {
    const user = {
      firstName: name,
      lastName: lastName,
      email: emailText,
      password: passowrdText,
      confirmPassword: confirmPasswordText,
      birthDate: brithDay,
    };

    setLoading(true);
    setInfo("");

    try {
      const registerData = await register(user);
      await saveRefreshToken(registerData.refreshToken);
      setToken(registerData.token);
      onRegisterSuccess();
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
    <SafeAreaView className="flex-1 justify-center p-4 bg-screen">
      <Text className="text-foreground">Zarejestruj się do aplikacji</Text>
      <TextInput
        className="mb-2 border rounded-sm border-input-border bg-input text-foreground placeholder:text-placeholder"
        placeholder="Imie"
        value={name}
        onChangeText={setName}
      ></TextInput>
      <TextInput
        className="mb-2 border rounded-sm border-input-border bg-input text-foreground placeholder:text-placeholder"
        placeholder="Nazwisko"
        value={lastName}
        onChangeText={setLastName}
      ></TextInput>
      <TextInput
        className="mb-2 border rounded-sm border-input-border bg-input text-foreground placeholder:text-placeholder"
        placeholder="Email"
        autoCapitalize="none"
        keyboardType="email-address"
        value={emailText}
        onChangeText={setEmailText}
      ></TextInput>
      <TextInput
        className="mb-2 border rounded-sm border-input-border bg-input text-foreground placeholder:text-placeholder"
        placeholder="Data urodzenia: YYYY-MM-DD"
        value={brithDay}
        onChangeText={setBrithDay}
      ></TextInput>
      <TextInput
        className="mb-2 border rounded-sm border-input-border bg-input text-foreground placeholder:text-placeholder"
        placeholder="Hasło"
        secureTextEntry
        autoCapitalize="none"
        value={passowrdText}
        onChangeText={setPasswordText}
      ></TextInput>
      <TextInput
        className="mb-2 border rounded-sm border-input-border bg-input text-foreground placeholder:text-placeholder"
        placeholder="Powtórz Hasło"
        secureTextEntry
        autoCapitalize="none"
        value={confirmPasswordText}
        onChangeText={setRepeatPasswordText}
      ></TextInput>
      {info !== "" && (
        <Text className="font-bold text-destructive">{info}</Text>
      )}
      <Pressable
        disabled={loading}
        className={
          loading ? "p-2 rounded-xl bg-disabled" : "p-2 rounded-xl bg-primary"
        }
        onPress={handleRegister}
      >
        <Text
          className={
            loading ? "text-disabled-foreground" : "text-primary-foreground"
          }
        >
          {loading ? "Tworzenie konta" : "Zarejestruj się!"}
        </Text>{" "}
      </Pressable>
      <Pressable onPress={() => navigation.navigate("Login")}>
        <Text className="text-link bg-surface p-2 rounded-xl mt-3">
          Masz konto? Zaloguj się
        </Text>
      </Pressable>
    </SafeAreaView>
  );
}
