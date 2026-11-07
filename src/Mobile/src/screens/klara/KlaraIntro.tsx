import { Image, ScrollView, Text, View } from "react-native";
import {
  CalendarClock,
  CirclePlus,
  Download,
  ShieldCheck,
  Stethoscope,
} from "lucide-react-native";
import Button from "../../components/Button";
import { fonts, iconSizes, typography, useThemeColor } from "../../theme";

type Props = {
  onDownload: () => void;
};

const FEATURES = [
  {
    icon: CalendarClock,
    text: "Powie, kiedy jest badanie i jakie leki są na dziś — Twoje i bliskich.",
  },
  { icon: CirclePlus, text: "Doda badanie lub lek — zawsze zapyta, zanim coś zapisze." },
  {
    icon: Stethoscope,
    text: "Odpowie na proste pytania, a w sprawach leczenia odeśle do lekarza.",
  },
];

export default function KlaraIntro({ onDownload }: Props) {
  const brandInk = useThemeColor("--brand-ink");

  return (
    <View className="flex-1">
      <ScrollView contentContainerClassName="p-4 pt-6 gap-8">
        <View className="flex-row items-center gap-4">
          <Image
            source={require("../../../assets/klara.png")}
            style={{ width: 96, height: 96 }}
          />
          <View className="flex-1 gap-1">
            <Text className="text-foreground" style={typography["title.page"]}>
              Poznaj Klarę
            </Text>
            <Text className="text-muted-foreground" style={typography.meta}>
              Asystentka zdrowia Twojej rodziny
            </Text>
          </View>
        </View>

        <View className="gap-4">
          {FEATURES.map(({ icon: Icon, text }) => (
            <View key={text} className="flex-row items-center gap-4">
              <View className="w-11 h-11 rounded-xl bg-tint-2 items-center justify-center">
                <Icon color={brandInk} size={iconSizes.listRow} />
              </View>
              <Text className="flex-1 text-foreground" style={typography["body.sm"]}>
                {text}
              </Text>
            </View>
          ))}
        </View>

        <View className="bg-surface border border-border rounded-xl p-4 gap-3">
          <View className="flex-row items-start gap-3">
            <Download color={brandInk} size={iconSizes.button} />
            <Text className="flex-1 text-foreground" style={typography.caption}>
              Klara potrzebuje pobrać model{" "}
              <Text style={{ fontFamily: fonts.monoSemibold }}>3,1 GB</Text>. Zalecane Wi-Fi.
            </Text>
          </View>
          <View className="flex-row items-start gap-3">
            <ShieldCheck color={brandInk} size={iconSizes.button} />
            <Text className="flex-1 text-foreground" style={typography.caption}>
              Po pobraniu działa bez internetu. Twoje dane nie opuszczają telefonu.
            </Text>
          </View>
        </View>
      </ScrollView>

      <View className="px-4 pt-4 pb-8">
        <Button title="Pobierz" iconLeft={Download} onPress={onDownload} />
      </View>
    </View>
  );
}
