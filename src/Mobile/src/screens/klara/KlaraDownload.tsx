import { ScrollView, Text, View } from "react-native";
import { Download, RotateCw, Smartphone, WifiOff } from "lucide-react-native";
import Button from "../../components/Button";
import { fonts, iconSizes, typography, useThemeColor } from "../../theme";

type Props = {
  percent: number;
  failed: boolean;
  onRetry: () => void;
};

const MODEL_SIZE_GB = 3.1;

function formatGb(value: number) {
  return value.toFixed(2).replace(".", ",");
}

export default function KlaraDownload({ percent, failed, onRetry }: Props) {
  const brandInk = useThemeColor("--brand-ink");
  const danger = useThemeColor("--danger");
  const warnInk = useThemeColor("--warn-ink");

  return (
    <View className="flex-1">
      <ScrollView contentContainerClassName="p-4 pt-6 gap-8">
        <View className="gap-3">
          <View
            className={`w-14 h-14 rounded-xl items-center justify-center ${
              failed ? "bg-danger-bg" : "bg-tint-2"
            }`}
          >
            {failed ? (
              <WifiOff color={danger} size={28} />
            ) : (
              <Download color={brandInk} size={28} />
            )}
          </View>
          <Text className="text-foreground" style={typography["title.page"]}>
            {failed ? "Nie udało się pobrać modelu" : "Pobieram Klarę"}
          </Text>
          <Text className="text-muted-foreground" style={typography.body}>
            {failed ? "Sprawdź połączenie." : "Może to potrwać kilkanaście minut."}
          </Text>
        </View>

        <View className="bg-surface border border-border rounded-xl p-4 gap-4">
          {failed ? (
            <View className="flex-row justify-between">
              <Text className="text-destructive" style={typography.caption}>
                Przerwano
              </Text>
              <Text
                className="text-destructive"
                style={[typography.caption, { fontFamily: fonts.monoSemibold }]}
              >
                {percent}%
              </Text>
            </View>
          ) : (
            <View className="flex-row items-end justify-between gap-3">
              <Text
                className="text-link"
                style={[typography["title.hero"], { fontFamily: fonts.monoSemibold }]}
              >
                {percent}%
              </Text>
              <Text
                className="text-muted-foreground"
                style={[typography["caption.xs"], { fontFamily: fonts.monoMedium }]}
              >
                {formatGb((percent / 100) * MODEL_SIZE_GB)} z {formatGb(MODEL_SIZE_GB)} GB
              </Text>
            </View>
          )}
          <View className="h-3 rounded-full bg-line-1 overflow-hidden">
            <View
              className={`h-full rounded-full ${failed ? "bg-destructive" : "bg-accent"}`}
              style={{ width: `${percent}%` }}
            />
          </View>
        </View>

        {!failed && (
          <View className="bg-warn-bg border border-warn-line rounded-xl p-4 flex-row items-start gap-3">
            <Smartphone color={warnInk} size={iconSizes.button} />
            <Text className="flex-1 text-warn-ink" style={typography.toast}>
              Nie zamykaj aplikacji i nie wygaszaj ekranu w trakcie pobierania.
            </Text>
          </View>
        )}
      </ScrollView>

      {failed && (
        <View className="px-4 pt-4 pb-8">
          <Button title="Spróbuj ponownie" iconLeft={RotateCw} onPress={onRetry} />
        </View>
      )}
    </View>
  );
}
