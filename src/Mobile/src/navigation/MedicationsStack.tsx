import { createNativeStackNavigator } from "@react-navigation/native-stack";
import MedicationListScreen from "../screens/MedicationListScreen";
import MedicationDetailsScreen from "../screens/MedicationDetailsScreen";

type Props = {
  onLoginSuccess: () => void;
  onRegisterSuccess: () => void;
};

export type MedicationStack = {
  Leki: undefined;
  DodajLek: undefined;
  SzczegolyLeku: { medicationId: string };
  EdytujLek: { medicationId: string };
};

const Stack = createNativeStackNavigator<MedicationStack>();
function MedicationsStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: true }}>
      <Stack.Screen name="Leki" options={{ title: "Leki" }}>
        {({ navigation }) => <MedicationListScreen navigation={navigation} />}
      </Stack.Screen>
      <Stack.Screen
        name="SzczegolyLeku"
        options={{ title: "Szczegóły badania" }}
      >
        {({ navigation, route }) => (
          <MedicationDetailsScreen navigation={navigation} route={route} />
        )}
      </Stack.Screen>
      {/* <Stack.Screen name="DodajLek" options={{ title: "Dodaj badanie" }}>
        {({ navigation }) => <ExaminationAddScreen navigation={navigation} />}
      </Stack.Screen>

      <Stack.Screen name="EdytujLek" options={{ title: "Edytuj badanie" }}>
        {({ navigation, route }) => (
          <ExaminationEditScreen navigation={navigation} route={route} />
        )}
      </Stack.Screen> */}
    </Stack.Navigator>
  );
}

export default MedicationsStack;
