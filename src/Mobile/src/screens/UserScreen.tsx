import { useEffect, useState } from "react";
import { Text, View } from "react-native";
import { getMe } from "../api/user";
import { endSession } from "../api/auth";
import ThemeSelector from "../components/ThemeSelector";
import Button from "../components/Button";
import { LogOut } from "lucide-react-native";
import { typography } from "../theme";

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
      setEmailUser(userData.email ?? "");
    }
    load();
  }, []);

  async function handleLogout() {
    await endSession();
    onLogout();
  }

  return (
    <View className="flex-1 items-center justify-center bg-screen">
      <Text className="text-muted-foreground" style={typography["title.profile"]}>
        {nameUser}
      </Text>
      <Text className="text-muted-foreground" style={typography.meta}>
        {emailUser}
      </Text>

      <View className="w-64 mt-6">
        <ThemeSelector />
      </View>

      <View className="w-64 mt-10">
        <Button
          title="Wyloguj się"
          variant="danger"
          iconLeft={LogOut}
          onPress={handleLogout}
        />
      </View>
    </View>
  );
}
