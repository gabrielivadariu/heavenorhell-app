import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  FlatList,
  Alert,
  ImageBackground
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useNetInfo } from "@react-native-community/netinfo";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_BASE_URL } from "../config";
import { RootStackParamList } from "../navigation/AppNavigator";
import { usePremium } from "../context/PremiumContext";
import { useTranslation } from "../context/LanguageContext";

type Message = {
  id: string;
  from: "user" | "ai";
  text: string;
};

type Props = NativeStackScreenProps<RootStackParamList, "Chat">;

const STORAGE_KEY = "chat_daily_count";
const FREE_GOD_DAILY_LIMIT = 1;
const DEFAULT_DAILY_LIMIT = 10;

export default function ChatScreen({ route, navigation }: Props) {
  const { role } = route.params;
  const godBg = require("../../assets/god-bg.jpg");
  const devilBg = require("../../assets/devil-bg.jpg");
  const { isPremium } = usePremium();
  const { t } = useTranslation();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [limitReached, setLimitReached] = useState(false);
  const netInfo = useNetInfo();

  const personaTitle = role === "god" ? t("common.god") : t("common.devil");
  const personaAccent = useMemo(
    () => (role === "god" ? ["#a8e6ff", "#d4b5ff"] : ["#b70032", "#ff4d00"]),
    [role]
  );
  const backgroundImage = role === "god" ? godBg : devilBg;
  const listRef = useRef<FlatList<Message>>(null);
  const isDevil = role === "devil";

  const getTodayKey = () => new Date().toISOString().slice(0, 10);

  const readDailyCount = useCallback(async () => {
    const today = getTodayKey();
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return { date: today, count: 0 };
    }

    try {
      const parsed = JSON.parse(raw) as { date: string; count: number };
      if (parsed.date === today) {
        return parsed;
      }
    } catch (e) {
      return { date: today, count: 0 };
    }

    return { date: today, count: 0 };
  }, []);

  const dailyLimit = useMemo(
    () => (role === "god" ? FREE_GOD_DAILY_LIMIT : DEFAULT_DAILY_LIMIT),
    [role]
  );

  const canSendFreeMessage = useCallback(async () => {
    const record = await readDailyCount();
    return record.count < dailyLimit;
  }, [readDailyCount, dailyLimit]);

  const incrementDailyCount = useCallback(async () => {
    const today = getTodayKey();
    const record = await readDailyCount();
    const nextCount = record.date === today ? record.count + 1 : 1;
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ date: today, count: nextCount }));
    setLimitReached(nextCount >= dailyLimit);
  }, [readDailyCount, dailyLimit]);

  useEffect(() => {
    if (isPremium) {
      setLimitReached(false);
      return;
    }

    readDailyCount().then((data) => {
      setLimitReached(data.count >= dailyLimit);
    });
  }, [isPremium, readDailyCount, dailyLimit]);

  const handleSend = useCallback(async () => {
    const trimmed = input.trim();
    if (!trimmed) {
      return;
    }

    if (netInfo.isConnected === false) {
      const offlineMsg = t("chat.offline");
      setError(offlineMsg);
      Alert.alert(offlineMsg);
      return;
    }

    if (!isPremium) {
      const allowed = await canSendFreeMessage();
      if (!allowed) {
        setLimitReached(true);
        setError(t("chat.limitReached"));
        return;
      }
    }

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      from: "user",
      text: trimmed
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setError(null);
    setIsSending(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ message: trimmed, role })
      });

      if (!response.ok) {
        throw new Error("Failed to reach server");
      }

      const data = await response.json();
      const aiMessage: Message = {
        id: `ai-${Date.now()}`,
        from: "ai",
        text: data.reply || t("chat.noReply")
      };

      setMessages((prev) => [...prev, aiMessage]);

      if (!isPremium) {
        await incrementDailyCount();
      }
    } catch (err) {
      setError(t("chat.error"));
    } finally {
      setIsSending(false);
    }
  }, [input, netInfo.isConnected, role, t, isPremium, canSendFreeMessage, incrementDailyCount]);

  useEffect(() => {
    // Scroll la ultimul mesaj când lista se schimbă
    requestAnimationFrame(() => {
      listRef.current?.scrollToEnd({ animated: true });
    });
  }, [messages]);

  const hasLimit = !isPremium && limitReached;
  const renderItem = ({ item }: { item: Message }) => (
    <View
      style={[
        styles.bubble,
        item.from === "user" ? styles.bubbleUser : styles.bubbleAI,
        item.from === "user" ? styles.alignEnd : styles.alignStart
      ]}
    >
      <Text style={item.from === "user" ? styles.userText : styles.aiText}>{item.text}</Text>
    </View>
  );

  const offline = netInfo.isConnected === false;
  const limitDisabled = hasLimit;
  const disableSend = offline || isSending || !input.trim() || limitDisabled;

  return (
    <ImageBackground source={backgroundImage} style={styles.container} resizeMode="cover">
      <LinearGradient colors={["rgba(0,0,0,0.65)", "rgba(0,0,0,0.9)"]} style={styles.overlay}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={styles.flex}
          keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 0}
        >
        <View style={[styles.header, role === "devil" && styles.headerCenter]}>
          <View style={styles.headerTopRow}>
            <LinearGradient
              colors={personaAccent}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.badge}
            >
              <Text style={styles.badgeText}>{t("chat.badge", { persona: personaTitle })}</Text>
            </LinearGradient>
            <TouchableOpacity
              style={styles.notificationsBtn}
              onPress={() => navigation.navigate("Notifications")}
            >
              <LinearGradient
                colors={personaAccent}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.notificationsInner}
              >
                <Text style={styles.notificationsText}>{t("common.notifications")}</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
          <Text style={styles.helper}>
            {role === "god" ? t("chat.helperGod") : t("chat.helperDevil")}
          </Text>
          {offline && (
            <Text style={styles.offlineText}>
              {t("chat.offline")}
            </Text>
          )}
          {error && <Text style={styles.errorText}>{error}</Text>}
          {limitDisabled && (
            <View style={styles.limitBox}>
              <Text style={styles.limitText}>{t("chat.limitReached")}</Text>
            </View>
          )}
        </View>

        <FlatList
          data={messages}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
        />

        <View style={styles.inputRow}>
          <TextInput
            style={[styles.input, offline && styles.inputDisabled]}
            placeholder={t("chat.placeholder")}
            placeholderTextColor="rgba(255,255,255,0.6)"
            value={input}
            onChangeText={setInput}
            editable={!offline && !isSending && !limitDisabled}
            multiline
          />
          <TouchableOpacity
            style={[styles.sendButton, disableSend && styles.sendButtonDisabled]}
            onPress={handleSend}
            disabled={disableSend}
          >
            {isSending ? (
              <ActivityIndicator color="#0b0b16" />
            ) : (
              <Text style={styles.sendText}>{t("chat.send")}</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
      </LinearGradient>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  overlay: {
    flex: 1
  },
  flex: {
    flex: 1
  },
  header: {
    padding: 16,
    paddingTop: 48,
    gap: 6
  },
  badge: {
    alignSelf: "flex-start",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 16
  },
  badgeText: {
    color: "#0b0b16",
    fontWeight: "800",
    fontSize: 16
  },
  helper: {
    color: "rgba(255,255,255,0.75)"
  },
  headerTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  headerCenter: {
    alignItems: "center"
  },
  notificationsBtn: {
    borderRadius: 999,
    overflow: "hidden"
  },
  notificationsInner: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 999
  },
  notificationsText: {
    color: "#ffd166",
    fontWeight: "800"
  },
  offlineText: {
    color: "#ffb67f",
    fontWeight: "600"
  },
  errorText: {
    color: "#ff7a7a"
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 12,
    flexGrow: 1,
    justifyContent: "flex-end"
  },
  bubble: {
    maxWidth: "80%",
    padding: 12,
    borderRadius: 16
  },
  bubbleUser: {
    backgroundColor: "#4e5bf2",
    borderTopRightRadius: 4
  },
  bubbleAI: {
    backgroundColor: "#222744",
    borderTopLeftRadius: 4
  },
  alignEnd: {
    alignSelf: "flex-end"
  },
  alignStart: {
    alignSelf: "flex-start"
  },
  userText: {
    color: "#fff"
  },
  aiText: {
    color: "#e1e4ff"
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    backgroundColor: "rgba(255,255,255,0.02)",
    gap: 10
  },
  input: {
    flex: 1,
    minHeight: 48,
    maxHeight: 120,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.06)",
    color: "#fff"
  },
  inputDisabled: {
    opacity: 0.6
  },
  sendButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: "#ffd166"
  },
  sendButtonDisabled: {
    backgroundColor: "#6a627a"
  },
  sendText: {
    fontWeight: "700",
    color: "#0b0b16"
  },
  limitBox: {
    backgroundColor: "rgba(255,255,255,0.08)",
    padding: 12,
    borderRadius: 12,
    gap: 8
  },
  limitText: {
    color: "#ffd166",
    fontWeight: "600"
  },
});
