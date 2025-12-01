import React, { useCallback, useState } from "react";
import { View, Text, StyleSheet, Pressable, ActivityIndicator, ImageBackground } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/AppNavigator";
import { usePremium } from "../context/PremiumContext";
import { useTranslation, Language } from "../context/LanguageContext";
import { purchasePremium, restorePurchases, checkPremiumStatus } from "../services/revenuecat";

type Props = NativeStackScreenProps<RootStackParamList, "Paywall">;

export default function PaywallScreen({ navigation }: Props) {
  const { setPremium, isPremium } = usePremium();
  const { t, language, setLanguage } = useTranslation();
  const [loading, setLoading] = useState(false);

  const onPurchase = useCallback(async () => {
    if (loading) return;
    if (isPremium) return;
    setLoading(true);
    const success = await purchasePremium();
    setLoading(false);
    if (success) {
      const verified = await checkPremiumStatus();
      if (verified) {
        setPremium(true);
        navigation.navigate("RoleSelection");
      }
    }
  }, [navigation, setPremium]);

  const onRestore = useCallback(async () => {
    if (loading) return;
    setLoading(true);
    const restored = await restorePurchases();
    setLoading(false);
    if (restored) {
      const verified = await checkPremiumStatus();
      if (verified) {
        setPremium(true);
        navigation.navigate("RoleSelection");
      }
    }
  }, [navigation, setPremium]);

  const benefits: string[] = t("paywall.benefits") as unknown as string[];

  const handleLanguageChange = (lang: Language) => {
    setLanguage(lang);
  };

  return (
    <ImageBackground
      source={require("../../assets/paywall-portal.jpg")}
      style={styles.bg}
      resizeMode="cover"
    >
      <LinearGradient
        colors={["rgba(6,2,14,0.6)", "rgba(10,14,32,0.68)"]}
        style={styles.container}
      >
        <View style={styles.glow} />

        <View style={styles.card}>
          <View style={styles.tagWrapper}>
            <Text style={styles.tagText}>{t("paywall.tag")}</Text>
          </View>
          <Text style={styles.title}>{t("paywall.title")}</Text>
          <Text style={styles.subtitle}>{t("paywall.subtitle")}</Text>

          <View style={styles.benefits}>
            {benefits?.map((item, idx) => (
              <View key={idx} style={styles.benefitRow}>
                <LinearGradient
                  colors={["#f6e27a", "#ffb347"]}
                  style={styles.check}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                />
                <Text style={styles.benefitText}>{item}</Text>
              </View>
            ))}
            <View style={styles.benefitRow}>
              <LinearGradient
                colors={["#f6e27a", "#ffb347"]}
                style={styles.check}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              />
              <Text style={styles.benefitText}>{t("premium.benefit_notifications_god")}</Text>
            </View>
            <View style={styles.benefitRow}>
              <LinearGradient
                colors={["#f6e27a", "#ffb347"]}
                style={styles.check}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              />
              <Text style={styles.benefitText}>{t("premium.benefit_notifications_devil")}</Text>
            </View>
          </View>

          <Pressable
            style={({ pressed }) => [styles.cta, pressed && styles.pressed]}
            onPress={onPurchase}
            disabled={loading || isPremium}
          >
            <LinearGradient
              colors={["#ffd166", "#ffb347"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.ctaGradient}
            >
              {loading ? (
                <View style={styles.loadingRow}>
                  <ActivityIndicator color="#0b0b16" />
                  <Text style={styles.loadingText}>{t("paywall.loading")}</Text>
                </View>
              ) : (
                <Text style={styles.ctaText}>
                  {isPremium ? t("paywall.ctaActive") : t("paywall.cta")}
                </Text>
              )}
            </LinearGradient>
          </Pressable>

          <Text style={styles.reassurance}>{t("paywall.reassurance")}</Text>

          <Pressable onPress={onRestore} disabled={loading} style={styles.restore}>
            <Text style={styles.restoreText}>{t("paywall.restore")}</Text>
          </Pressable>
        </View>

        <View style={styles.languageRow}>
          <Pressable
            style={[styles.langButton, language === "ro" && styles.langButtonActive]}
            onPress={() => handleLanguageChange("ro")}
          >
            <Text style={styles.langText}>{t("paywall.switchRo")}</Text>
          </Pressable>
          <Pressable
            style={[styles.langButton, language === "en" && styles.langButtonActive]}
            onPress={() => handleLanguageChange("en")}
          >
            <Text style={styles.langText}>{t("paywall.switchEn")}</Text>
          </Pressable>
        </View>
      </LinearGradient>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bg: {
    flex: 1
  },
  container: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
    alignItems: "center"
  },
  glow: {
    position: "absolute",
    top: 60,
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: "rgba(255, 209, 102, 0.18)"
  },
  card: {
    width: "100%",
    maxWidth: 420,
    padding: 24,
    borderRadius: 24,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
    gap: 14,
    shadowColor: "#000",
    shadowOpacity: 0.5,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 10 }
  },
  tagWrapper: {
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "rgba(255, 209, 102, 0.2)",
    borderWidth: 1,
    borderColor: "rgba(255,209,102,0.5)"
  },
  tagText: {
    color: "#ffd166",
    fontWeight: "800",
    fontSize: 12,
    letterSpacing: 0.6
  },
  title: {
    color: "#fff",
    fontSize: 30,
    fontWeight: "900"
  },
  subtitle: {
    color: "#d9ddff",
    fontSize: 16,
    marginBottom: 4
  },
  benefits: {
    gap: 12,
    marginVertical: 4
  },
  benefitRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12
  },
  check: {
    width: 20,
    height: 20,
    borderRadius: 10,
    shadowColor: "#ffd166",
    shadowOpacity: 0.6,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 0 }
  },
  benefitText: {
    color: "#f7f8ff",
    fontSize: 16,
    fontWeight: "600"
  },
  cta: {
    marginTop: 6,
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#ffd166",
    shadowOpacity: 0.8,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 }
  },
  ctaGradient: {
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center"
  },
  pressed: {
    opacity: 0.9
  },
  loadingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8
  },
  loadingText: {
    color: "#0b0b16",
    fontWeight: "800"
  },
  ctaText: {
    color: "#0b0b16",
    fontWeight: "900",
    fontSize: 18
  },
  reassurance: {
    color: "#d9ddff",
    textAlign: "center",
    marginTop: 6
  },
  restore: {
    alignSelf: "center",
    marginTop: 10,
    padding: 6
  },
  restoreText: {
    color: "#ffd166",
    fontWeight: "700"
  },
  languageRow: {
    position: "absolute",
    bottom: 28,
    flexDirection: "row",
    gap: 12,
    backgroundColor: "rgba(255,255,255,0.08)",
    padding: 10,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)"
  },
  langButton: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)"
  },
  langButtonActive: {
    backgroundColor: "rgba(255,209,102,0.2)",
    borderColor: "rgba(255,209,102,0.5)"
  },
  langText: {
    color: "#fff",
    fontWeight: "700"
  }
});
