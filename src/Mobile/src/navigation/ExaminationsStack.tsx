import { createNativeStackNavigator } from "@react-navigation/native-stack";
import ExaminationsListScreen from "../screens/ExaminationsListScreen";
import ExaminationAddScreen from "../screens/ExaminationAddScreen";
import ExaminationDetailsScreen from "../screens/ExaminationDetailsScreen";
import ExaminationEditScreen from "../screens/ExaminationEditScreen";

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
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Badania">
        {({ navigation }) => <ExaminationsListScreen navigation={navigation} />}
      </Stack.Screen>
      <Stack.Screen name="DodajBadanie">
        {({ navigation }) => <ExaminationAddScreen navigation={navigation} />}
      </Stack.Screen>
      <Stack.Screen name="SzczegolyBadania">
        {({ navigation, route }) => (
          <ExaminationDetailsScreen navigation={navigation} route={route} />
        )}
      </Stack.Screen>
      <Stack.Screen name="EdytujBadanie">
        {({ navigation, route }) => (
          <ExaminationEditScreen navigation={navigation} route={route} />
        )}
      </Stack.Screen>
    </Stack.Navigator>
  );
}

export default ExaminationsStack;
