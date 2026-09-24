import { useEffect, useState } from "react";
import { Pressable, Text, View } from "react-native";
import { getMe } from "../api/user";
import { endSession } from "../api/auth";
import ThemeSelector from "../components/ThemeSelector";

type Props = {
  onLogout: () => void;
};

export default function UserScreen({ onLogout }: Props) {
  const [nameUser, setNameUser] = useState("");
  const [emailUser, setEmailUser] = useState("");

  useEffect(() => {
    async function load() {
      const userData = await getMe();
      setNameUser(userData.firstName);
      setEmailUser(userData.email);
    }
    load();
  }, []);

  async function handleLogout() {
    await endSession();
    onLogout();
  }

  return (
    <View className="flex-1 items-center justify-center bg-screen">
      <Text className="text-muted-foreground">{nameUser}</Text>
      <Text className="text-muted-foreground">{emailUser}</Text>

      <Pressable
        className="p-2 bg-primary rounded-xl mt-10"
        onPress={() => handleLogout()}
      >
        <Text className="text-primary-foreground">Wyloguj się</Text>
      </Pressable>
    </View>
  );
}
