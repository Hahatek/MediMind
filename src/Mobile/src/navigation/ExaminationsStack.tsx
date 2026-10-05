import { createNativeStackNavigator } from "@react-navigation/native-stack";
import ExaminationsListScreen from "../screens/examination/ExaminationsListScreen";
import ExaminationAddScreen from "../screens/examination/ExaminationAddScreen";
import ExaminationDetailsScreen from "../screens/examination/ExaminationDetailsScreen";
import ExaminationEditScreen from "../screens/examination/ExaminationEditScreen";

type Props = {
  onLoginSuccess: () => void;
  onRegisterSuccess: () => void;
};

export type ExaminationStack = {
  Badania: undefined;
  DodajBadanie: undefined;
  SzczegolyBadania: { examinationId: string };
  EdytujBadanie: { examinationId: string };
};

const Stack = createNativeStackNavigator<ExaminationStack>();
// { onLoginSuccess, onRegisterSuccess }: Props
function ExaminationsStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: true }}>
      <Stack.Screen name="Badania" options={{ title: "Badania" }}>
        {({ navigation }) => <ExaminationsListScreen navigation={navigation} />}
      </Stack.Screen>
      <Stack.Screen name="DodajBadanie" options={{ title: "Dodaj badanie" }}>
        {({ navigation }) => <ExaminationAddScreen navigation={navigation} />}
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
