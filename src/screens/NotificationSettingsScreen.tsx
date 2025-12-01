import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  Switch,
  TouchableOpacity,
  Alert,
  ScrollView
} from "react-native";
import * as Notifications from "expo-notifications";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/AppNavigator";
import { useTranslation } from "../context/LanguageContext";
import { usePremium } from "../context/PremiumContext";
import { getRandomGodMessage, getRandomDevilMessage } from "../services/notificationMessages";

type Props = NativeStackScreenProps<RootStackParamList, "Notifications">;

type NotificationSettings = {
  godEnabled: boolean;
  devilEnabled: boolean;
};

const SETTINGS_KEY = "notification_settings";
const IDs_KEY = "notification_ids";

type StoredIds = {
  god?: string[];
  devil?: string[];
};

export default function NotificationSettingsScreen({ navigation }: Props) {
  const { t, language } = useTranslation();
  const { isPremium } = usePremium();
  const [settings, setSettings] = useState<NotificationSettings>({ godEnabled: false, devilEnabled: false });
  const [permissionDenied, setPermissionDenied] = useState(false);

  const loadSettings = useCallback(async () => {
    const raw = await AsyncStorage.getItem(SETTINGS_KEY);
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as NotificationSettings;
        setSettings(parsed);
      } catch (e) {
        // ignore parse errors
      }
    }
  }, []);

  const requestPermission = useCallback(async () => {
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== "granted") {
      setPermissionDenied(true);
    } else {
      setPermissionDenied(false);
    }
  }, []);

  useEffect(() => {
    requestPermission();
    loadSettings();
  }, [loadSettings, requestPermission]);

  useEffect(() => {
    // Dacă nu mai e premium, dezactivează notificările pentru Diavol
    if (!isPremium && settings.devilEnabled) {
      (async () => {
        const next: NotificationSettings = { ...settings, devilEnabled: false };
        await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(next));
        setSettings(next);
        await cancelCategory("devil");
      })();
    }
  }, [isPremium, settings]);

  const saveSettings = async (next: NotificationSettings) => {
    setSettings(next);
    await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(next));
  };

  const getStoredIds = async (): Promise<StoredIds> => {
    const raw = await AsyncStorage.getItem(IDs_KEY);
    if (!raw) return {};
    try {
      return JSON.parse(raw) as StoredIds;
    } catch (e) {
      return {};
    }
  };

  const storeIds = async (ids: StoredIds) => {
    await AsyncStorage.setItem(IDs_KEY, JSON.stringify(ids));
  };

  const cancelCategory = async (category: "god" | "devil") => {
    const stored = await getStoredIds();
    const ids = stored[category] || [];
    await Promise.all(ids.map((id) => Notifications.cancelScheduledNotificationAsync(id)));
    const updated: StoredIds = { ...stored, [category]: [] };
    await storeIds(updated);
  };

  const getScheduleTimes = useMemo(
    () =>
      (category: "god" | "devil", premium: boolean) => {
        if (category === "god") {
          if (!premium) {
            return [{ hour: 10, minute: 0 }];
          }
          return [
            { hour: 8, minute: 0 },
            { hour: 9, minute: 0 },
            { hour: 10, minute: 0 },
            { hour: 11, minute: 0 },
            { hour: 12, minute: 0 },
            { hour: 14, minute: 0 },
            { hour: 16, minute: 0 },
            { hour: 18, minute: 0 },
            { hour: 20, minute: 0 },
            { hour: 22, minute: 0 }
          ];
        }

        // devil
        return [
          { hour: 9, minute: 30 },
          { hour: 11, minute: 30 },
          { hour: 13, minute: 0 },
          { hour: 14, minute: 30 },
          { hour: 16, minute: 0 },
          { hour: 17, minute: 30 },
          { hour: 19, minute: 0 },
          { hour: 20, minute: 30 },
          { hour: 21, minute: 30 },
          { hour: 23, minute: 0 }
        ];
      },
    []
  );

  const scheduleCategory = async (category: "god" | "devil") => {
    const stored = await getStoredIds();
    const times = getScheduleTimes(category, isPremium);

    const schedule = category === "god" ? getRandomGodMessage : getRandomDevilMessage;
    const langKey = language === "ro" ? "ro" : "en";
    const ids: string[] = [];

    for (const ttime of times) {
      const msg = schedule(langKey as "en" | "ro");
      const id = await Notifications.scheduleNotificationAsync({
        content: {
          title: msg.title,
          body: msg.body
        },
        trigger: { hour: ttime.hour, minute: ttime.minute, repeats: true }
      });
      ids.push(id);
    }

    const updated: StoredIds = { ...stored, [category]: ids };
    await storeIds(updated);
  };

  const handleToggle = async (category: "god" | "devil") => {
    if (category === "devil" && !isPremium) {
      navigation.navigate("Paywall");
      return;
    }

    if (permissionDenied) {
      Alert.alert(t("notifications.permissionDenied"));
      return;
    }

    const key = category === "god" ? "godEnabled" : "devilEnabled";
    const nextState: NotificationSettings = { ...settings, [key]: !settings[key] };
    await saveSettings(nextState);

    if (nextState[key]) {
      await cancelCategory(category);
      await scheduleCategory(category);
    } else {
      await cancelCategory(category);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>{"←"}</Text>
        </TouchableOpacity>
        <Text style={styles.title}>{t("notifications.title")}</Text>
      </View>

      <Text style={styles.subtitle}>{t("notifications.subtitle")}</Text>

      <View style={styles.card}>
        <TouchableOpacity style={styles.row} onPress={() => handleToggle("god")}>
          <View style={styles.rowLeft}>
            <Text style={styles.rowLabel}>{t("notifications.godLabel")}</Text>
          </View>
          <Switch
            value={settings.godEnabled}
            onValueChange={() => handleToggle("god")}
            trackColor={{ true: "#ffd166", false: "#6a627a" }}
            thumbColor={settings.godEnabled ? "#ffb347" : "#f4f3f4"}
          />
        </TouchableOpacity>

        <View style={styles.divider} />

        <TouchableOpacity
          style={styles.row}
          onPress={() => handleToggle("devil")}
          disabled={!isPremium}
        >
          <View style={styles.rowLeft}>
            <Text style={styles.rowLabel}>{t("notifications.devilLabel")}</Text>
            {!isPremium && <Text style={styles.lockText}>🔒 {t("notifications.premiumOnly")}</Text>}
          </View>
          {isPremium ? (
            <Switch
              value={settings.devilEnabled}
              onValueChange={() => handleToggle("devil")}
              trackColor={{ true: "#ffd166", false: "#6a627a" }}
              thumbColor={settings.devilEnabled ? "#ffb347" : "#f4f3f4"}
            />
          ) : (
            <Text style={styles.lockArrow}>{"›"}</Text>
          )}
        </TouchableOpacity>
      </View>

      {permissionDenied && <Text style={styles.permission}>{t("notifications.permissionDenied")}</Text>}

      <Text style={styles.info}>{t("notifications.toggleInfo")}</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0b0b16"
  },
  content: {
    padding: 20,
    paddingTop: 72,
    paddingBottom: 40,
    gap: 16
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12
  },
  backBtn: {
    padding: 6
  },
  backText: {
    color: "#ffd166",
    fontSize: 18
  },
  title: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "800"
  },
  subtitle: {
    color: "#d3d4ff"
  },
  card: {
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    padding: 16,
    gap: 12
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  rowLeft: {
    gap: 6
  },
  rowLabel: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600"
  },
  lockText: {
    color: "#ffb347",
    fontSize: 13
  },
  lockArrow: {
    color: "#ffb347",
    fontSize: 20
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.1)"
  },
  permission: {
    color: "#ff7a7a"
  },
  info: {
    color: "#d3d4ff"
  }
});
