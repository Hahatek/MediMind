import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, AppState, Text, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { useKeepAwake } from "expo-keep-awake";
import type { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import type { ModelMessage } from "ai";
import { askKlara, downloadModel, isModelReady, loadModel, unloadModel } from "../../ai/engine";
import { getMe } from "../../api/user";
import type { AppStackList } from "../../navigation/AppStack";
import { typography } from "../../theme";
import KlaraHeader from "./KlaraHeader";
import KlaraIntro from "./KlaraIntro";
import KlaraDownload from "./KlaraDownload";
import KlaraChat from "./KlaraChat";
import type { Message } from "./KlaraMessage";

type Props = BottomTabScreenProps<AppStackList, "Klara">;

type Status = "missing" | "downloading" | "error" | "waking" | "ready";

function KeepScreenOn() {
  useKeepAwake();
  return null;
}

export default function KlaraScreen({ navigation }: Props) {
  const [status, setStatus] = useState<Status>(isModelReady() ? "waking" : "missing");
  const [percent, setPercent] = useState(0);
  const [userName, setUserName] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    navigation.setOptions({ tabBarHideOnKeyboard: true });
  }, [navigation]);

  useEffect(() => {
    async function load() {
      const userData = await getMe();
      setUserName(userData.firstName);
    }
    load();
  }, []);

  async function wake() {
    setStatus("waking");
    await loadModel();
    setStatus("ready");
  }

  useFocusEffect(
    useCallback(() => {
      if (isModelReady()) {
        wake();
      }
    }, []),
  );

  useEffect(() => {
    const sub = AppState.addEventListener("change", (state) => {
      if (state === "background") {
        unloadModel();
      }
    });
    return () => sub.remove();
  }, []);

  async function handleDownload() {
    setPercent(0);
    setStatus("downloading");
    try {
      await downloadModel(setPercent);
      await wake();
    } catch (e) {
      console.log("Błąd pobierania modelu:", e);
      setStatus("error");
    }
  }

  async function handleSend(text: string) {
    if (busy) return;

    const mine: Message = { id: String(Date.now()), from: "me", text };
    const klaraId = mine.id + "-k";
    const history = [...messages, mine];
    setMessages(history);
    setBusy(true);

    const modelMessages = history.slice(-10).map(
      (m): ModelMessage => ({
        role: m.from === "me" ? "user" : "assistant",
        content: m.text,
      }),
    );

    try {
      await askKlara(modelMessages, (partial) => {
        setMessages([...history, { id: klaraId, from: "klara", text: partial }]);
      });
    } catch (e) {
      console.log("Błąd Klary:", e);
      setMessages([
        ...history,
        { id: klaraId, from: "klara", text: "Coś poszło nie tak. Spróbuj jeszcze raz." },
      ]);
    } finally {
      setBusy(false);
    }
  }

  function handleAdd(id: string) {
    setMessages(messages.map((m) => (m.id === id ? { ...m, confirmed: true } : m)));
  }

  function handleFix(id: string) {
    setMessages(messages.map((m) => (m.id === id ? { ...m, proposal: undefined } : m)));
  }

  return (
    <View className="flex-1 bg-screen">
      <KlaraHeader
        subtitle={status === "ready" ? "Na tym telefonie · bez internetu" : "Asystentka MediMind"}
      />

      {status === "missing" && <KlaraIntro onDownload={handleDownload} />}

      {(status === "downloading" || status === "error") && (
        <KlaraDownload percent={percent} failed={status === "error"} onRetry={handleDownload} />
      )}

      {status === "downloading" && <KeepScreenOn />}

      {status === "waking" && (
        <View className="flex-1 items-center justify-center gap-4">
          <ActivityIndicator size="large" />
          <Text className="text-muted-foreground" style={typography.body}>
            Klara się budzi…
          </Text>
        </View>
      )}

      {status === "ready" && (
        <KlaraChat
          userName={userName}
          messages={messages}
          typing={busy && messages[messages.length - 1]?.from === "me"}
          onSend={handleSend}
          onAdd={handleAdd}
          onFix={handleFix}
          onOpenExaminations={() => navigation.navigate("Badania")}
        />
      )}
    </View>
  );
}
