import { createNativeStackNavigator } from "@react-navigation/native-stack";
import ExaminationsListScreen from "../screens/examination/ExaminationsListScreen";
import ExaminationAddScreen from "../screens/examination/ExaminationAddScreen";
import ExaminationDetailsScreen from "../screens/examination/ExaminationDetailsScreen";
import ExaminationEditScreen from "../screens/examination/ExaminationEditScreen";
import { PersonContext } from "../types/FamilyTypes";
import { stackScreenOptions } from "./stackScreenOptions";

type Props = {
  person?: PersonContext;
};

export type ExaminationStack = {
  ListaBadan: undefined;
  DodajBadanie: undefined;
  SzczegolyBadania: { examinationId: string; canManage: boolean };
  EdytujBadanie: { examinationId: string };
};

const Stack = createNativeStackNavigator<ExaminationStack>();
function ExaminationsStack({ person }: Props) {
  return (
    <Stack.Navigator screenOptions={stackScreenOptions}>
      <Stack.Screen
        name="ListaBadan"
        options={{ title: person ? `Badania ${person.firstName}` : "Badania" }}
      >
        {({ navigation }) => (
          <ExaminationsListScreen navigation={navigation} person={person} />
        )}
      </Stack.Screen>
      <Stack.Screen
        name="DodajBadanie"
        options={{
          title: person
            ? `Dodaj badanie: ${person.firstName}`
            : "Dodaj badanie",
        }}
      >
        {({ navigation }) => (
          <ExaminationAddScreen navigation={navigation} person={person} />
        )}
      </Stack.Screen>
      <Stack.Screen
        name="SzczegolyBadania"
        options={{ title: "Szczegóły badania" }}
      >
        {({ navigation, route }) => (
          <ExaminationDetailsScreen navigation={navigation} route={route} />
        )}
      </Stack.Screen>
      <Stack.Screen name="EdytujBadanie" options={{ title: "Edytuj badanie" }}>
        {({ navigation, route }) => (
          <ExaminationEditScreen navigation={navigation} route={route} />
        )}
      </Stack.Screen>
    </Stack.Navigator>
  );
}

export default ExaminationsStack;
