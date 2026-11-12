import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import RoleSelectionScreen from "../screens/RoleSelectionScreen";
import ChatScreen from "../screens/ChatScreen";
import PaywallScreen from "../screens/PaywallScreen";
import NotificationSettingsScreen from "../screens/NotificationSettingsScreen";
import PortalTransitionScreen from "../screens/PortalTransitionScreen";
import SplashScreen from "../screens/SplashScreen";
import RitualScreen from "../screens/RitualScreen";
import JournalScreen from "../screens/JournalScreen";
import LegalScreen from "../screens/LegalScreen";
import type { PersonaRole } from "../config";

export type RootStackParamList = {
  Splash: undefined;
  PortalTransition: { role: PersonaRole };
  RoleSelection: undefined;
  Paywall: undefined;
  Chat: { role: PersonaRole; initialPrompt?: string };
  Journal: undefined;
  Ritual: undefined;
  Notifications: undefined;
  Legal: { section?: "terms" | "privacy" } | undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Splash"
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: "#0B0E12" },
          animation: "fade"
        }}
      >
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="PortalTransition" component={PortalTransitionScreen} />
        <Stack.Screen name="RoleSelection" component={RoleSelectionScreen} />
        <Stack.Screen name="Paywall" component={PaywallScreen} />
        <Stack.Screen name="Chat" component={ChatScreen} />
        <Stack.Screen name="Notifications" component={NotificationSettingsScreen} />
        <Stack.Screen name="Journal" component={JournalScreen} />
        <Stack.Screen name="Ritual" component={RitualScreen} />
        <Stack.Screen name="Legal" component={LegalScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
