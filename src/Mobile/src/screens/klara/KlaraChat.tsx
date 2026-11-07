import { useState } from "react";
import {
  FlatList,
  Image,
  KeyboardAvoidingView,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import {
  ArrowUp,
  CalendarClock,
  CalendarPlus,
  ChevronRight,
  Info,
  Pill,
  UserRoundPlus,
} from "lucide-react-native";
import Button from "../../components/Button";
import { iconSizes, typography, useThemeColor } from "../../theme";
import KlaraTyping from "./KlaraTyping";
import KlaraMessage, { type Message } from "./KlaraMessage";

type Props = {
  userName: string;
  messages: Message[];
  typing: boolean;
  onSend: (text: string) => void;
  onAdd: (id: string) => void;
  onFix: (id: string) => void;
  onOpenExaminations: () => void;
};

const SUGGESTIONS = [
  { label: "Kiedy mam następne badanie?", icon: CalendarClock },
  { label: "Jakie leki biorę dziś?", icon: Pill },
  { label: "Dodaj badanie", icon: CalendarPlus },
  { label: "Jak dodać członka rodziny?", icon: UserRoundPlus },
];

export default function KlaraChat({
  userName,
  messages,
  typing,
  onSend,
  onAdd,
  onFix,
  onOpenExaminations,
}: Props) {
  const [input, setInput] = useState("");
  const brandInk = useThemeColor("--brand-ink");
  const warnInk = useThemeColor("--warn-ink");
  const chevronColor = useThemeColor("--ink-3");

  function send(text: string) {
    if (!text.trim() || typing) return;
    onSend(text.trim());
    setInput("");
  }

  return (
    <KeyboardAvoidingView className="flex-1" behavior="padding">
      <View className="bg-warn-bg border-b border-warn-line flex-row items-center gap-3 px-4 py-3">
        <Info color={warnInk} size={iconSizes.button} />
        <Text className="flex-1 text-warn-ink" style={typography["caption.xs"]}>
          Klara może się mylić. To nie jest porada lekarska.
        </Text>
      </View>

      {messages.length === 0 && !typing ? (
        <ScrollView
          contentContainerClassName="p-4 pt-6 gap-8"
          keyboardShouldPersistTaps="handled"
        >
          <View className="flex-row items-center gap-4">
            <Image
              source={require("../../../assets/klara.png")}
              style={{ width: 72, height: 72 }}
            />
            <View className="flex-1 gap-1">
              <Text className="text-foreground" style={typography["title.empty"]}>
                {userName ? `Cześć, ${userName}!` : "Cześć!"}
              </Text>
              <Text className="text-muted-foreground" style={typography.meta}>
                W czym mogę pomóc?
              </Text>
            </View>
          </View>

          <View className="gap-3">
            <Text className="text-muted-foreground" style={typography["section.label"]}>
              Zapytaj na przykład
            </Text>
            {SUGGESTIONS.map(({ label, icon: Icon }) => (
              <Pressable
                key={label}
                onPress={() => send(label)}
                className="bg-surface border border-border rounded-xl flex-row items-center gap-4 p-4"
              >
                <Icon color={brandInk} size={iconSizes.listRow} />
                <Text className="flex-1 text-foreground" style={typography["row.label"]}>
                  {label}
                </Text>
                <ChevronRight color={chevronColor} />
              </Pressable>
            ))}
          </View>
        </ScrollView>
      ) : (
        <FlatList
          inverted
          data={[...messages].reverse()}
          keyExtractor={(message) => message.id}
          contentContainerClassName="p-4 gap-4"
          keyboardShouldPersistTaps="handled"
          ListHeaderComponent={typing ? <KlaraTyping /> : undefined}
          renderItem={({ item }) => (
            <KlaraMessage
              message={item}
              onAdd={onAdd}
              onFix={onFix}
              onOpenExaminations={onOpenExaminations}
            />
          )}
        />
      )}

      <View className="bg-surface border-t border-border flex-row items-end gap-2 px-4 pt-3 pb-4">
        <TextInput
          value={input}
          onChangeText={setInput}
          onSubmitEditing={() => send(input)}
          returnKeyType="send"
          placeholder="Napisz do Klary…"
          className="flex-1 rounded-2xl px-4 py-3 bg-input text-foreground placeholder:text-placeholder border border-line-2"
          style={typography["input.text"]}
        />
        <Button
          iconLeft={ArrowUp}
          disabled={!input.trim() || typing}
          onPress={() => send(input)}
        />
      </View>
    </KeyboardAvoidingView>
  );
}
