import React, { useEffect } from "react";
import { StyleSheet, ImageBackground, StatusBar } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/AppNavigator";

type Props = NativeStackScreenProps<RootStackParamList, "Splash">;

const MIN_DURATION_MS = 5000;

export default function SplashScreen({ navigation }: Props) {
  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.replace("RoleSelection");
    }, MIN_DURATION_MS);

    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <ImageBackground
      source={require("../../assets/splash-loading.jpg")}
      style={styles.container}
      resizeMode="cover"
    >
      <StatusBar barStyle="light-content" />
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  }
});
