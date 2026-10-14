import { View, Text } from "react-native";
import Button from "./Button";
import { typography } from "../theme/typography";

type ErrorStateProps = {
  message: string;
  onRetry?: () => void;
};

// Komunikat błędu + opcjonalny przycisk "Spróbuj ponownie".
// Używany gdy nie da się wczytać danych (lista, szczegóły, edycja).
export default function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <View className="m-4 p-4 rounded-xl border border-danger-line bg-danger-bg">
      <Text className="text-danger-ink" style={typography.body}>
        {message}
      </Text>
      {onRetry && (
        <View className="mt-3 self-start">
          <Button
            title="Spróbuj ponownie"
            variant="primary"
            onPress={onRetry}
          />
        </View>
      )}
    </View>
  );
}
