import { View, Text, Pressable } from "react-native";

type ErrorStateProps = {
  message: string;
  onRetry?: () => void;
};

// Komunikat błędu + opcjonalny przycisk "Spróbuj ponownie".
// Używany gdy nie da się wczytać danych (lista, szczegóły, edycja).
export default function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <View className="m-4 p-4 rounded-xl border border-danger-line bg-danger-bg">
      <Text className="text-danger-ink">{message}</Text>
      {onRetry && (
        <Pressable
          onPress={onRetry}
          className="mt-3 self-start px-4 py-2 rounded-xl bg-primary"
        >
          <Text className="text-primary-foreground">Spróbuj ponownie</Text>
        </Pressable>
      )}
    </View>
  );
}
