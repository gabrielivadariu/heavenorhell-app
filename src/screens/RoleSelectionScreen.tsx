import React from "react";
import { View, StyleSheet, Pressable, ImageBackground, Text } from "react-native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { RootStackParamList } from "../navigation/AppNavigator";
import { PersonaRole } from "../config";
import { usePremium } from "../context/PremiumContext";
import { useTranslation } from "../context/LanguageContext";
import { LinearGradient } from "expo-linear-gradient";
import { checkPremiumStatus } from "../services/revenuecat";

const splitImage = require("../../assets/god-devil-split.jpg");

type NavigationProp = NativeStackNavigationProp<RootStackParamList, "RoleSelection">;

export default function RoleSelectionScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { isPremium, setPremium } = usePremium();
  const { t } = useTranslation();

  useFocusEffect(
    React.useCallback(() => {
      let mounted = true;
      (async () => {
        const hasPremium = await checkPremiumStatus();
        if (mounted && hasPremium) {
          setPremium(true);
        }
      })();
      return () => {
        mounted = false;
      };
    }, [setPremium])
  );

  const handleSelect = (role: PersonaRole) => {
    if (!isPremium && role === "devil") {
      navigation.navigate("Paywall");
      return;
    }

    navigation.navigate("PortalTransition", { role });
  };

  return (
    <View style={styles.container}>
      <ImageBackground source={splitImage} style={styles.image} resizeMode="cover">
        <View style={styles.overlay}>
          <Text style={styles.title}>{t("common.choosePath")}</Text>
          <Pressable
            style={({ pressed }) => [styles.half, pressed && styles.pressed]}
            onPress={() => handleSelect("devil" as PersonaRole)}
          />
          <View pointerEvents="none" style={styles.divider} />
          <Pressable
            style={({ pressed }) => [styles.half, pressed && styles.pressed]}
            onPress={() => handleSelect("god" as PersonaRole)}
          />
        </View>

        {!isPremium && (
          <Pressable
            style={({ pressed }) => [styles.premiumBtn, pressed && styles.pressedBtn]}
            onPress={() => navigation.navigate("Paywall")}
          >
            <LinearGradient colors={["#ffd166", "#ffb347"]} style={styles.premiumInner}>
              <Text style={styles.premiumText}>{t("common.premium")}</Text>
            </LinearGradient>
          </Pressable>
        )}
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000"
  },
  image: {
    flex: 1
  },
  overlay: {
    flex: 1,
    flexDirection: "row"
  },
  title: {
    position: "absolute",
    top: 48,
    left: 0,
    right: 0,
    textAlign: "center",
    color: "#fff",
    fontSize: 20,
    fontWeight: "800",
    textShadowColor: "rgba(0,0,0,0.6)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8
  },
  half: {
    flex: 1
  },
  pressed: {
    backgroundColor: "rgba(0,0,0,0.1)"
  },
  divider: {
    width: 2,
    backgroundColor: "rgba(0,0,0,0.7)"
  },
  premiumBtn: {
    position: "absolute",
    right: 16,
    bottom: 24,
    shadowColor: "#ffd166",
    shadowOpacity: 0.7,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 }
  },
  premiumInner: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999
  },
  premiumText: {
    color: "#0b0b16",
    fontWeight: "800"
  },
  pressedBtn: {
    opacity: 0.85
  }
});
