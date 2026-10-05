import { createNativeStackNavigator } from "@react-navigation/native-stack";
import HomeScreen from "../screens/HomeScreen";
import FamilyScreen from "../screens/FamilyScreen";
import FamilyInviteScreen from "../screens/FamilyInviteScreen";
import FamilyAcceptInviteScreen from "../screens/FamilyAcceptInviteScreen";
import FamilyAddProfileScreen from "../screens/FamilyAddProfileScreen";
import FamilyAccessCodeScreen from "../screens/FamilyAccessCodeScreen";

type Props = { onLogout: () => void };

export type HomeStackList = {
  Home: undefined;
  Rodzina: undefined;
  Zaproszenie: { familyId: string };
  AkceptacjaZaproszenia: undefined;
  DodajProfil: { familyId: string };
  KodDostepu: {
    userId: string;
    isChild: boolean;
    firstName: string;
    lastName: string;
  };
};

const Stack = createNativeStackNavigator<HomeStackList>();

function HomeStack({ onLogout }: Props) {
  return (
    <Stack.Navigator screenOptions={{ headerShown: true }}>
      <Stack.Screen
        name="Home"
        options={{ title: "Strona główna", headerShown: false }}
      >
        {({ navigation }) => (
          <HomeScreen navigation={navigation} onLogout={onLogout} />
        )}
      </Stack.Screen>
      <Stack.Screen name="Rodzina" options={{ title: "Rodzina" }}>
        {({ navigation }) => <FamilyScreen navigation={navigation} />}
      </Stack.Screen>
      <Stack.Screen
        name="Zaproszenie"
        options={{ title: "Zaproszenie do rodziny" }}
      >
        {({ navigation, route }) => (
          <FamilyInviteScreen navigation={navigation} route={route} />
        )}
      </Stack.Screen>
      <Stack.Screen
        name="AkceptacjaZaproszenia"
        options={{ title: "Akceptowanie zaproszenia do rodziny" }}
      >
        {({ navigation }) => (
          <FamilyAcceptInviteScreen navigation={navigation} />
        )}
      </Stack.Screen>
      <Stack.Screen name="DodajProfil" options={{ title: "Dodaj profil" }}>
        {({ navigation, route }) => (
          <FamilyAddProfileScreen navigation={navigation} route={route} />
        )}
      </Stack.Screen>
      <Stack.Screen name="KodDostepu" options={{ title: "Kod dostępu" }}>
        {({ navigation, route }) => (
          <FamilyAccessCodeScreen navigation={navigation} route={route} />
        )}
      </Stack.Screen>
    </Stack.Navigator>
  );
}

export default HomeStack;
