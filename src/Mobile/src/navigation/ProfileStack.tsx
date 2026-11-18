import { createNativeStackNavigator } from "@react-navigation/native-stack";
import UserScreen from "../screens/UserScreen";
import SettingsScreen from "../screens/SettingsScreen";
import { stackScreenOptions } from "./stackScreenOptions";

export type ProfileStackList = {
  ProfilGlowny: undefined;
  Ustawienia: undefined;
};

type Props = {
  onLogout: () => void;
};

const Stack = createNativeStackNavigator<ProfileStackList>();

export default function ProfileStack({ onLogout }: Props) {
  return (
    <Stack.Navigator screenOptions={stackScreenOptions}>
      <Stack.Screen
        name="ProfilGlowny"
        options={{ title: "Profil", headerShown: false }}
      >
        {({ navigation }) => (
          <UserScreen navigation={navigation} onLogout={onLogout} />
        )}
      </Stack.Screen>
      <Stack.Screen name="Ustawienia" options={{ title: "Ustawienia" }}>
        {() => <SettingsScreen onLogout={onLogout} />}
      </Stack.Screen>
    </Stack.Navigator>
  );
}
