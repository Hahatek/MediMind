import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { MedicationStack } from "../../navigation/MedicationsStack";
import { SafeAreaView } from "react-native-safe-area-context";
import MedicationForm from "../../components/MedicationForm";
import { CreateMedication } from "../../types/MedicationTypes";
import { medicationCreate } from "../../api/medication";
import { PersonContext } from "../../types/FamilyTypes";

type Props = {
  navigation: NativeStackNavigationProp<MedicationStack, "DodajLek">;
  person?: PersonContext;
};

export default function MedicationAddScreen({ navigation, person }: Props) {
  async function handleCreate(medication: CreateMedication) {
    await medicationCreate({ ...medication, forUserId: person?.userId });
    navigation.goBack();
  }

  return (
    <SafeAreaView
      className="flex-1 bg-screen"
      edges={["bottom", "left", "right"]}
    >
      <MedicationForm onSubmit={handleCreate} />
    </SafeAreaView>
  );
}
