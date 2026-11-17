import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Alert, AppState, Text, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { useKeepAwake } from "expo-keep-awake";
import type { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import type { ModelMessage } from "ai";
import {
  askKlara,
  downloadModel,
  isModelReady,
  loadModel,
  unloadModel,
} from "../../ai/engine";
import { getMe } from "../../api/user";
import type { AppStackList } from "../../navigation/AppStack";
import { typography } from "../../theme";
import KlaraHeader from "./KlaraHeader";
import KlaraIntro from "./KlaraIntro";
import KlaraDownload from "./KlaraDownload";
import KlaraChat from "./KlaraChat";
import type { Message } from "./KlaraMessage";
import {
  examinationComplete,
  examinationCreate,
  examinationSkip,
} from "../../api/examination";
import { medicationIntakeCreate } from "../../api/medicationIntake";
import { medicationCreate } from "../../api/medication";
import { clearHistory, loadHistory, saveHistory } from "../../ai/history";
import ErrorState from "../../components/ErrorState";

type Props = BottomTabScreenProps<AppStackList, "Klara">;

type Status =
  | "missing"
  | "downloading"
  | "error"
  | "waking"
  | "ready"
  | "loadError";

function KeepScreenOn() {
  useKeepAwake();
  return null;
}

export default function KlaraScreen({ navigation }: Props) {
  const [status, setStatus] = useState<Status>(
    isModelReady() ? "waking" : "missing",
  );
  const [percent, setPercent] = useState(0);
  const [userName, setUserName] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [busy, setBusy] = useState(false);
  const [userId, setUserId] = useState("");

  useEffect(() => {
    navigation.setOptions({ tabBarHideOnKeyboard: true });
  }, [navigation]);

  useEffect(() => {
    async function load() {
      const userData = await getMe();
      setUserName(userData.firstName);
      setMessages(await loadHistory(userData.id));
      setUserId(userData.id);
    }
    load();
  }, []);

  useEffect(() => {
    if (userId) {
      saveHistory(userId, messages);
    }
  }, [userId, messages]);

  async function wake() {
    setStatus("waking");
    try {
      await loadModel();
      setStatus("ready");
    } catch (e) {
      console.log("Błąd wczytania modelu:", e);
      setStatus("loadError");
    }
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
    } catch (e) {
      console.log("Błąd pobierania modelu:", e);
      setStatus("error");
      return;
    }
    await wake();
  }

  async function handleSend(text: string) {
    if (busy) return;

    const mine: Message = { id: String(Date.now()), from: "me", text };
    const klaraId = mine.id + "-k";
    const history = [...messages, mine];
    setMessages(history);
    setBusy(true);

    const modelMessages = history.slice(-10).map((m): ModelMessage => ({
      role: m.from === "me" ? "user" : "assistant",
      content: m.text,
    }));

    try {
      const odp = await askKlara(modelMessages, (partial) => {
        setMessages([
          ...history,
          { id: klaraId, from: "klara", text: partial },
        ]);
      });
      if (odp.proposal || odp.marking || odp.dose || odp.medication) {
        setMessages([
          ...history,
          {
            id: klaraId,
            from: "klara",
            text: odp.text,
            proposal: odp.proposal ?? undefined,
            marking: odp.marking ?? undefined,
            dose: odp.dose ?? undefined,
            medication: odp.medication ?? undefined,
          },
        ]);
      }
    } catch (e) {
      console.log("Błąd Klary:", e);
      setMessages([
        ...history,
        {
          id: klaraId,
          from: "klara",
          text: "Coś poszło nie tak. Spróbuj jeszcze raz.",
        },
      ]);
    } finally {
      setBusy(false);
    }
  }

  async function handleAdd(id: string) {
    const message = messages.find((m) => m.id === id);

    if (message?.medication) {
      const { ownerName, ...nowyLek } = message.medication;
      try {
        await medicationCreate(nowyLek);
        setMessages(
          messages.map((m) => (m.id === id ? { ...m, confirmed: true } : m)),
        );
      } catch (e) {
        console.log("Błąd dodawania leku:", e);
        setMessages([
          ...messages,
          {
            id: String(Date.now()),
            from: "klara",
            text: "Nie udało się dodać leku. Spróbuj jeszcze raz.",
          },
        ]);
      }
      return;
    }

    if (message?.dose) {
      try {
        await medicationIntakeCreate({
          medicationScheduleId: message.dose.intake.medicationScheduleId,
          date: message.dose.date,
          status: message.dose.status,
        });
        setMessages(
          messages.map((m) => (m.id === id ? { ...m, confirmed: true } : m)),
        );
      } catch (e) {
        console.log("Błąd zapisu dawki:", e);
        setMessages([
          ...messages,
          {
            id: String(Date.now()),
            from: "klara",
            text: "Nie udało się zapisać dawki. Spróbuj jeszcze raz.",
          },
        ]);
      }
      return;
    }

    if (message?.marking) {
      try {
        if (message.marking.akcja === "wykonane") {
          await examinationComplete(message.marking.examination.id);
        } else {
          await examinationSkip(message.marking.examination.id);
        }
        setMessages(
          messages.map((m) => (m.id === id ? { ...m, confirmed: true } : m)),
        );
      } catch (e) {
        console.log("Błąd oznaczania badania:", e);
        setMessages([
          ...messages,
          {
            id: String(Date.now()),
            from: "klara",
            text: "Nie udało się zapisać. Spróbuj jeszcze raz.",
          },
        ]);
      }
      return;
    }

    if (!message?.proposal) {
      return;
    }

    try {
      await examinationCreate({
        name: message.proposal.name,
        date: message.proposal.date,
        time: message.proposal.time,
        isCyclic: !!message.proposal.cycleInterval,
        cycleInterval: message.proposal.cycleInterval ?? null,
        forUserId: message.proposal.forUserId,
      });
      setMessages(
        messages.map((m) => (m.id === id ? { ...m, confirmed: true } : m)),
      );
    } catch (e) {
      console.log("Błąd dodawania badania:", e);
      setMessages([
        ...messages,
        {
          id: String(Date.now()),
          from: "klara",
          text: "Nie udało się dodać badania. Spróbuj jeszcze raz.",
        },
      ]);
    }
  }

  function handleFix(id: string) {
    setMessages([
      ...messages.map((m) =>
        m.id === id
          ? {
              ...m,
              proposal: undefined,
              marking: undefined,
              dose: undefined,
              medication: undefined,
            }
          : m,
      ),
      {
        id: String(Date.now()),
        from: "klara",
        text: "Jasne, co mam poprawić?",
      },
    ]);
  }

  function handleClear() {
    Alert.alert(
      "Wyczyść rozmowę",
      "Czy na pewno chcesz usunąć całą rozmowę z Klarą?",
      [
        { text: "Anuluj", style: "cancel" },
        {
          text: "Wyczyść",
          style: "destructive",
          onPress: () => {
            clearHistory(userId);
            setMessages([]);
          },
        },
      ],
    );
  }

  return (
    <View className="flex-1 bg-screen">
      <KlaraHeader
        subtitle={
          status === "ready"
            ? "Na tym telefonie · bez internetu"
            : "Asystentka MediMind"
        }
        onClear={
          status === "ready" && messages.length > 0 && !busy
            ? handleClear
            : undefined
        }
      />

      {status === "missing" && <KlaraIntro onDownload={handleDownload} />}

      {(status === "downloading" || status === "error") && (
        <KlaraDownload
          percent={percent}
          failed={status === "error"}
          onRetry={handleDownload}
        />
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

      {status === "loadError" && (
        <ErrorState
          message="Nie udało się uruchomić Klary. Zamknij inne aplikacje i spróbuj ponownie."
          onRetry={wake}
        />
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
