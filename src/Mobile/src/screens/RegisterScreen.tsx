import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  Image,
  ScrollView,
} from "react-native";
import { register } from "../api/auth";
import { saveRefreshToken } from "../storage/tokenStorage";
import { setToken } from "../storage/accessToken";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { AuthStackList } from "../navigation/AuthStack";
import { SafeAreaView } from "react-native-safe-area-context";
import TextField from "../components/TextField";
import PickerField from "../components/PickerField";
import Button from "../components/Button";

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
    <SafeAreaView className="flex-1 justify-center p-4 bg-screen ">
      <ScrollView
        className="flex-1"
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="items-center">
          <Image
            source={require("../../assets/RegisterLoginPhoto.png")}
            className="w-[400px] h-[400px]"
            resizeMode="contain"
          />
        </View>
        <Text className="text-foreground">Zarejestruj się do aplikacji</Text>
        <TextField label="Imię" required value={name} onChangeText={setName} />
        <TextField
          label="Nazwisko"
          required
          value={lastName}
          onChangeText={setLastName}
        />
        <TextField
          label="Adres e-mail"
          required
          keyboardType="email-address"
          autoCapitalize="none"
          value={emailText}
          onChangeText={setEmailText}
        />
        <PickerField
          label="Data urodzenia"
          mode="date"
          required
          value={brithDay}
          onChange={setBrithDay}
          minimumDate={new Date(1900, 0, 1)}
          maximumDate={new Date()}
        />
        <TextField
          label="Hasło"
          required
          secureTextEntry
          value={passowrdText}
          onChangeText={setPasswordText}
        />
        <TextField
          label="Powtórz Hasło"
          required
          secureTextEntry
          value={confirmPasswordText}
          onChangeText={setRepeatPasswordText}
        />
        {info !== "" && (
          <Text className="font-bold text-destructive">{info}</Text>
        )}

        <View className="flex flex-col gap-2">
          <Button
            title={loading ? "Tworzenie konta..." : "Zarejestruj się"}
            disabled={loading}
            onPress={handleRegister}
          />
          <View className="flex-row justify-center mt-5">
            <Text className="text-ink-3">Masz konto?</Text>

            <Pressable onPress={() => navigation.navigate("Login")}>
              <Text className="text-primary font-semibold"> Zaloguj się</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
