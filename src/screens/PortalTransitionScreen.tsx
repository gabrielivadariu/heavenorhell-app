import React, { useEffect, useMemo } from "react";
import { StyleSheet, Dimensions, Text } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming
} from "react-native-reanimated";
import { RootStackParamList } from "../navigation/AppNavigator";

type Props = NativeStackScreenProps<RootStackParamList, "PortalTransition">;

const { width, height } = Dimensions.get("window");
const ANIM_DURATION = 3000;

type Particle = {
  delay: number;
  x: number;
  drift: number;
  size: number;
  duration: number;
};

export default function PortalTransitionScreen({ route, navigation }: Props) {
  const { role } = route.params;
  const isGod = role === "god";

  useEffect(() => {
    navigation.setOptions({ headerShown: false, gestureEnabled: false });
    const t = setTimeout(() => {
      navigation.replace("Chat", { role });
    }, ANIM_DURATION);
    return () => clearTimeout(t);
  }, [navigation, role]);

  const portalScale = useSharedValue(0.6);
  const portalOpacity = useSharedValue(0);
  const pulse = useSharedValue(1);
  const bgScale = useSharedValue(1);
  const shakeX = useSharedValue(0);
  const shakeY = useSharedValue(0);
  const captionOpacity = useSharedValue(0);

  useEffect(() => {
    portalScale.value = withTiming(1.1, { duration: 900, easing: Easing.out(Easing.exp) });
    portalOpacity.value = withTiming(1, { duration: 800, easing: Easing.out(Easing.ease) });
    pulse.value = withDelay(
      700,
      withRepeat(withTiming(1.05, { duration: 900, easing: Easing.inOut(Easing.sin) }), -1, true)
    );
    bgScale.value = withTiming(1.08, { duration: ANIM_DURATION, easing: Easing.inOut(Easing.ease) });
    captionOpacity.value = withTiming(1, { duration: 1200, easing: Easing.out(Easing.ease) });

    if (!isGod) {
      shakeX.value = withRepeat(
        withSequence(
          withTiming(4, { duration: 80 }),
          withTiming(-3, { duration: 80 }),
          withTiming(0, { duration: 80 })
        ),
        -1,
        true
      );
      shakeY.value = withRepeat(
        withSequence(
          withTiming(-2, { duration: 90 }),
          withTiming(2, { duration: 90 }),
          withTiming(0, { duration: 90 })
        ),
        -1,
        true
      );
    }
  }, [bgScale, captionOpacity, isGod, portalOpacity, portalScale, pulse, shakeX, shakeY]);

  const particles = useMemo<Particle[]>(() => {
    const arr: Particle[] = [];
    for (let i = 0; i < 18; i++) {
      arr.push({
        delay: Math.random() * 800,
        x: Math.random() * width * 0.6 + width * 0.2,
        drift: (Math.random() - 0.5) * 30,
        size: Math.random() * 5 + 3,
        duration: 1400 + Math.random() * 900
      });
    }
    return arr;
  }, []);

  const containerStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: bgScale.value },
      !isGod ? { translateX: shakeX.value } : { translateX: 0 },
      !isGod ? { translateY: shakeY.value } : { translateY: 0 }
    ]
  }));

  const beamStyle = useAnimatedStyle(() => ({
    transform: [{ scale: portalScale.value * pulse.value }],
    opacity: portalOpacity.value
  }));

  const glowPulse = useSharedValue(0);
  useEffect(() => {
    glowPulse.value = withRepeat(withTiming(1, { duration: 1200, easing: Easing.inOut(Easing.sin) }), -1, true);
  }, [glowPulse]);

  const glowStyle = useAnimatedStyle(() => ({
    opacity: 0.4 + glowPulse.value * 0.25
  }));

  const captionStyle = useAnimatedStyle(() => ({
    opacity: captionOpacity.value
  }));

  const renderParticle = (p: Particle, idx: number) => {
    const y = useSharedValue(height);
    const opacity = useSharedValue(1);
    const drift = useSharedValue(0);

    useEffect(() => {
      y.value = withDelay(
        p.delay,
        withRepeat(withTiming(-60, { duration: p.duration, easing: Easing.out(Easing.cubic) }), -1, false)
      );
      opacity.value = withDelay(
        p.delay,
        withRepeat(withTiming(0, { duration: p.duration, easing: Easing.in(Easing.cubic) }), -1, false)
      );
      drift.value = withDelay(
        p.delay,
        withRepeat(withTiming(p.drift, { duration: p.duration, easing: Easing.inOut(Easing.ease) }), -1, true)
      );
    }, [drift, opacity, p.delay, p.duration, p.drift, y]);

    const style = useAnimatedStyle(() => ({
      transform: [{ translateY: y.value }, { translateX: drift.value }],
      opacity: opacity.value
    }));

    return (
      <Animated.View
        key={idx}
        style={[
          styles.particle,
          style,
          {
            left: p.x,
            width: p.size,
            height: p.size,
            backgroundColor: isGod ? "rgba(255, 235, 170, 0.95)" : "rgba(255, 80, 20, 0.95)"
          }
        ]}
      />
    );
  };

  return (
    <Animated.View style={[styles.container, containerStyle]}>
      <LinearGradient
        colors={
          isGod
            ? ["#040214", "#0a0c2b", "#1b1640", "#f5ce8c"]
            : ["#050306", "#1a0008", "#2a050c", "#b31d08"]
        }
        start={{ x: 0, y: 0 }}
        end={{ x: 0.8, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      <Animated.View
        style={[
          styles.halo,
          isGod ? styles.haloGod : styles.haloDevil,
          glowStyle,
          { transform: [{ scale: 1.2 }] }
        ]}
      />

      <Animated.View style={[styles.beamContainer, beamStyle]}>
        <LinearGradient
          colors={
            isGod
              ? ["rgba(255, 255, 255, 0.2)", "rgba(255, 214, 102, 0.9)", "rgba(255, 255, 255, 0.18)"]
              : ["rgba(255, 70, 20, 0.2)", "rgba(255, 40, 0, 0.9)", "rgba(255, 140, 60, 0.18)"]
          }
          start={{ x: 0.3, y: 0 }}
          end={{ x: 0.7, y: 1 }}
          style={styles.beam}
        />
        <LinearGradient
          colors={
            isGod
              ? ["rgba(255, 240, 200, 0.3)", "rgba(255, 214, 102, 0.05)"]
              : ["rgba(255, 80, 0, 0.25)", "rgba(140, 20, 0, 0.06)"]
          }
          style={styles.beamGlow}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
      </Animated.View>

      {particles.map(renderParticle)}

      <Animated.View style={[styles.ringsWrapper, beamStyle]}>
        <LinearGradient
          colors={
            isGod
              ? ["rgba(255, 214, 102, 0.3)", "rgba(255, 214, 102, 0.0)"]
              : ["rgba(255, 60, 0, 0.35)", "rgba(255, 60, 0, 0.0)"]
          }
          style={styles.ring}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
        <LinearGradient
          colors={
            isGod
              ? ["rgba(255, 240, 200, 0.2)", "rgba(255, 214, 102, 0.0)"]
              : ["rgba(255, 120, 40, 0.22)", "rgba(255, 60, 0, 0.0)"]
          }
          style={[styles.ring, { transform: [{ scale: 1.3 }] }]}
          start={{ x: 1, y: 0 }}
          end={{ x: 0, y: 1 }}
        />
      </Animated.View>

      <Animated.Text style={[styles.caption, captionStyle]}>
        {isGod ? "Entering God's realm…" : "Descending into the depths…"}
      </Animated.Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
    alignItems: "center",
    justifyContent: "center"
  },
  halo: {
    position: "absolute",
    width: width * 1.1,
    height: width * 1.1,
    borderRadius: width * 0.55
  },
  haloGod: {
    backgroundColor: "rgba(255, 214, 102, 0.12)"
  },
  haloDevil: {
    backgroundColor: "rgba(255, 60, 0, 0.12)"
  },
  beamContainer: {
    position: "absolute",
    width: width * 0.38,
    height: height * 0.7,
    borderRadius: width * 0.18,
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center"
  },
  beam: {
    position: "absolute",
    width: "80%",
    height: "105%",
    borderRadius: width * 0.18,
    opacity: 0.95
  },
  beamGlow: {
    position: "absolute",
    width: "110%",
    height: "120%",
    borderRadius: width * 0.2
  },
  ringsWrapper: {
    position: "absolute",
    width: width * 0.8,
    height: width * 0.8,
    alignItems: "center",
    justifyContent: "center"
  },
  ring: {
    position: "absolute",
    width: width * 0.8,
    height: width * 0.8,
    borderRadius: width * 0.4,
    borderWidth: 1,
    borderColor: "transparent"
  },
  particle: {
    position: "absolute",
    bottom: -50,
    borderRadius: 20
  },
  caption: {
    position: "absolute",
    bottom: 48,
    color: "#f7f8ff",
    fontSize: 16,
    fontWeight: "700",
    textShadowColor: "rgba(0,0,0,0.7)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6
  }
});
