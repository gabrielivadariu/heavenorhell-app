import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import RoleSelectionScreen from "../screens/RoleSelectionScreen";
import ChatScreen from "../screens/ChatScreen";
import PaywallScreen from "../screens/PaywallScreen";
import NotificationSettingsScreen from "../screens/NotificationSettingsScreen";
import PortalTransitionScreen from "../screens/PortalTransitionScreen";
import SplashScreen from "../screens/SplashScreen";
import { PersonaRole } from "../config";

export type RootStackParamList = {
  Splash: undefined;
  PortalTransition: { role: PersonaRole };
  RoleSelection: undefined;
  Paywall: undefined;
  Chat: { role: PersonaRole };
  Notifications: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Splash"
        screenOptions={{
          headerShown: false
        }}
      >
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="PortalTransition" component={PortalTransitionScreen} />
        <Stack.Screen name="RoleSelection" component={RoleSelectionScreen} />
        <Stack.Screen name="Paywall" component={PaywallScreen} />
        <Stack.Screen name="Chat" component={ChatScreen} />
        <Stack.Screen name="Notifications" component={NotificationSettingsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
