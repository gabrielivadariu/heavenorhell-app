import React from "react";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { LanguageProvider } from "./src/context/LanguageContext";
import { PremiumProvider } from "./src/context/PremiumContext";
import AppNavigator from "./src/navigation/AppNavigator";

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <PremiumProvider>
          <LanguageProvider>
            <StatusBar style="light" />
            <AppNavigator />
          </LanguageProvider>
        </PremiumProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
