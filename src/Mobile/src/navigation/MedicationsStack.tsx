import { createNativeStackNavigator } from "@react-navigation/native-stack";
import MedicationListScreen from "../screens/medication/MedicationListScreen";
import MedicationDetailsScreen from "../screens/medication/MedicationDetailsScreen";
import MedicationAddScreen from "../screens/medication/MedicationAddScreen";
import MedicationEditScreen from "../screens/medication/MedicationEditScreen";
import { PersonContext } from "../types/FamilyTypes";

type Props = {
  person?: PersonContext;
};

export type MedicationStack = {
  Leki: undefined;
  DodajLek: undefined;
  SzczegolyLeku: { medicationId: string };
  EdytujLek: { medicationId: string };
};

const Stack = createNativeStackNavigator<MedicationStack>();
function MedicationsStack({ person }: Props) {
  return (
    <Stack.Navigator screenOptions={{ headerShown: true }}>
      <Stack.Screen
        name="Leki"
        options={{ title: person ? `Leki ${person.firstName}` : "Leki" }}
      >
        {({ navigation }) => (
          <MedicationListScreen navigation={navigation} person={person} />
        )}
      </Stack.Screen>
      <Stack.Screen
        name="DodajLek"
        options={{
          title: person ? `Dodaj lek: ${person.firstName}` : "Dodaj lek",
        }}
      >
        {({ navigation }) => (
          <MedicationAddScreen navigation={navigation} person={person} />
        )}
      </Stack.Screen>
      <Stack.Screen name="SzczegolyLeku" options={{ title: "Szczegóły leku" }}>
        {({ navigation, route }) => (
          <MedicationDetailsScreen
            navigation={navigation}
            route={route}
            person={person}
          />
        )}
      </Stack.Screen>
      <Stack.Screen name="EdytujLek" options={{ title: "Edytuj lek" }}>
        {({ navigation, route }) => (
          <MedicationEditScreen navigation={navigation} route={route} />
        )}
      </Stack.Screen>
    </Stack.Navigator>
  );
}

export default MedicationsStack;
