import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Animated, Easing, StatusBar, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Defs, LinearGradient, Path, Stop } from "react-native-svg";

type CelebrationParams = {
  streak?: string;
  targetPathname?: string;
  courseId?: string;
  moduleId?: string;
};

const AnimatedSvg = Animated.createAnimatedComponent(Svg);

const BlueFlame = ({
  entrance,
  pulse,
  glowOpacity,
}: {
  entrance: Animated.Value;
  pulse: Animated.Value;
  glowOpacity: Animated.Value | Animated.AnimatedInterpolation<number>;
}) => {
  const scaleEntrance = entrance.interpolate({
    inputRange: [0, 1],
    outputRange: [0.7, 1],
  });

  const scalePulse = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [0.97, 1.05],
  });

  const tilt = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: ["-1.4deg", "1.4deg"],
  });

  const combinedScale = Animated.multiply(scaleEntrance, scalePulse);

  return (
    <Animated.View
      style={{
        width: 180,
        height: 220,
        alignItems: "center",
        justifyContent: "center",
        transform: [{ scale: combinedScale }, { rotate: tilt }],
      }}
    >
      <Animated.View
        style={{
          position: "absolute",
          width: 180,
          height: 180,
          borderRadius: 90,
          backgroundColor: "rgba(40, 160, 255, 0.25)",
          opacity: glowOpacity,
          transform: [{ scale: 1.1 }],
        }}
      />
      <AnimatedSvg width={150} height={210} viewBox="0 0 180 220">
        <Defs>
          <LinearGradient id="outer" x1="0%" y1="0%" x2="0%" y2="100%">
            <Stop offset="0%" stopColor="#52B8FF" />
            <Stop offset="100%" stopColor="#0F4EBB" />
          </LinearGradient>
          <LinearGradient id="inner" x1="0%" y1="0%" x2="0%" y2="100%">
            <Stop offset="0%" stopColor="#8CDFFF" />
            <Stop offset="100%" stopColor="#2D7CFF" />
          </LinearGradient>
        </Defs>
        <Path
          d="M90 8C62 34 44 72 44 102c0 39 23 82 46 94c23-12 46-55 46-94c0-30-18-68-46-94Z"
          fill="url(#outer)"
        />
        <Path
          d="M90 36c-18 19-30 46-30 70c0 26 16 51 30 59c14-8 30-33 30-59c0-24-12-51-30-70Z"
          fill="url(#inner)"
        />
        <Path
          d="M90 78c-11 12-18 26-18 40c0 15 10 31 18 35c8-4 18-20 18-35c0-14-7-28-18-40Z"
          fill="#E8F5FF"
        />
      </AnimatedSvg>
    </Animated.View>
  );
};

const StreakCelebrationScreen = () => {
  const router = useRouter();
  const params = useLocalSearchParams<CelebrationParams>();
  const getSingleParam = (value?: string | string[]) =>
    Array.isArray(value) ? value[0] : value;

  const rawStreak = useMemo(() => Number(getSingleParam(params.streak) ?? 0), [params.streak]);
  const streak = Number.isFinite(rawStreak) && rawStreak > 0 ? rawStreak : 1;
  const courseId = getSingleParam(params.courseId);
  const moduleId = getSingleParam(params.moduleId);
  const targetPathParam = getSingleParam(params.targetPathname);
  const targetPathname =
    typeof targetPathParam === "string" && targetPathParam.length > 0
      ? targetPathParam
      : "/(tabs)/CourseScreen";

  const containerOpacity = useRef(new Animated.Value(0)).current;
  const containerTranslate = useRef(new Animated.Value(30)).current;
  const flameEntrance = useRef(new Animated.Value(0)).current;
  const flamePulse = useRef(new Animated.Value(0)).current;
  const glowOpacity = useRef(new Animated.Value(0.5)).current;
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(containerOpacity, {
        toValue: 1,
        duration: 420,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(containerTranslate, {
        toValue: 0,
        duration: 420,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.spring(flameEntrance, {
        toValue: 1,
        friction: 5,
        tension: 70,
        useNativeDriver: true,
      }),
    ]).start();

    const loop = Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(flamePulse, {
            toValue: 1,
            duration: 900,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(glowOpacity, {
            toValue: 0.8,
            duration: 900,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(flamePulse, {
            toValue: 0,
            duration: 900,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(glowOpacity, {
            toValue: 0.4,
            duration: 900,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
      ])
    );

    loop.start();
    return () => loop.stop();
  }, [containerOpacity, containerTranslate, flameEntrance, flamePulse, glowOpacity]);

  const handleContinue = () => {
    if (exiting) return;
    setExiting(true);

    Animated.parallel([
      Animated.timing(containerOpacity, {
        toValue: 0,
        duration: 320,
        easing: Easing.in(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(containerTranslate, {
        toValue: -24,
        duration: 320,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(flameEntrance, {
        toValue: 0.5,
        duration: 320,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }),
    ]).start(() => {
      if (moduleId && courseId && targetPathname === "/screens/LessonScreen") {
        router.replace({
          pathname: targetPathname,
          params: { courseId, moduleId },
        });
        return;
      }

      router.replace(targetPathname as any);
    });
  };

  const weekChecks = useMemo(() => {
    const filled = Math.min(7, streak);
    return Array.from({ length: 7 }, (_, index) => index < filled);
  }, [streak]);

  const barFill = useMemo(() => Math.min(1, streak / 7), [streak]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#050F1E" }}>
      <StatusBar barStyle="light-content" />
      <Animated.View
        style={{
          flex: 1,
          paddingHorizontal: 22,
          paddingBottom: 24,
          alignItems: "center",
          justifyContent: "space-between",
          opacity: containerOpacity,
          transform: [{ translateY: containerTranslate }],
        }}
      >
        <View style={{ position: "absolute", top: -80, width: "140%", height: 300 }}>
          <View
            style={{
              position: "absolute",
              width: "100%",
              height: "100%",
              backgroundColor: "rgba(20,88,180,0.22)",
              borderBottomLeftRadius: 280,
              borderBottomRightRadius: 280,
              transform: [{ scale: 1.1 }],
            }}
          />
          <View
            style={{
              position: "absolute",
              width: "100%",
              height: "100%",
              backgroundColor: "rgba(40,140,255,0.18)",
              borderBottomLeftRadius: 300,
              borderBottomRightRadius: 300,
              transform: [{ scaleX: 1.05 }],
            }}
          />
        </View>

        <View style={{ alignItems: "center", marginTop: 30, gap: 12 }}>
          <BlueFlame entrance={flameEntrance} pulse={flamePulse} glowOpacity={glowOpacity} />
          <Text style={{ color: "#8CDFFF", fontSize: 14, fontWeight: "800", letterSpacing: 2 }}>
            OFENSIVA VIVA
          </Text>
          <Text
            style={{
              color: "#F5FBFF",
              fontSize: 64,
              fontWeight: "900",
              letterSpacing: 0.5,
            }}
          >
            {streak}
          </Text>
          <Text style={{ color: "#7FB7FF", fontSize: 18, fontWeight: "800" }}>dias seguidos</Text>
        </View>

        <View
          style={{
            width: "100%",
            backgroundColor: "rgba(255,255,255,0.06)",
            borderRadius: 18,
            padding: 18,
            gap: 12,
            borderWidth: 1,
            borderColor: "rgba(122,175,255,0.25)",
          }}
        >
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              paddingHorizontal: 6,
            }}
          >
            {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sab"].map((day, index) => {
              const active = weekChecks[index];
              return (
                <View
                  key={day}
                  style={{
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  <Text style={{ color: "rgba(255,255,255,0.65)", fontSize: 12, fontWeight: "700" }}>
                    {day}
                  </Text>
                  <View
                    style={{
                      width: 32,
                      height: 16,
                      backgroundColor: active ? "rgba(77,190,255,0.85)" : "rgba(255,255,255,0.08)",
                      borderRadius: 14,
                      alignItems: "center",
                      justifyContent: "center",
                      borderWidth: 1,
                      borderColor: active ? "rgba(120,225,255,0.8)" : "rgba(255,255,255,0.05)",
                    }}
                  >
                    {active && <Ionicons name="checkmark" size={14} color="#041120" />}
                  </View>
                </View>
              );
            })}
          </View>

          <View
            style={{
              height: 10,
              borderRadius: 100,
              backgroundColor: "rgba(52,140,255,0.35)",
              overflow: "hidden",
              marginTop: 4,
            }}
          >
            <View
              style={{
                width: `${barFill * 100}%`,
                height: "100%",
                backgroundColor: "#6DDCFF",
              }}
            />
          </View>

          <Text
            style={{
              color: "#DDEFFF",
              fontSize: 16,
              fontWeight: "700",
              lineHeight: 22,
              textAlign: "center",
            }}
          >
            Primeira lição do dia concluida. Você manteve a sua ofensiva viva!
          </Text>
        </View>

        <TouchableOpacity
          onPress={handleContinue}
          activeOpacity={0.9}
          style={{
            width: "100%",
            backgroundColor: "#3FA3FF",
            borderRadius: 16,
            paddingVertical: 16,
            alignItems: "center",
            shadowColor: "#0E5BC9",
            shadowOpacity: 0.35,
            shadowRadius: 14,
            shadowOffset: { width: 0, height: 6 },
          }}
        >
          <Text style={{ color: "#051226", fontSize: 16, fontWeight: "900", letterSpacing: 1 }}>
            CONTINUAR
          </Text>
        </TouchableOpacity>
      </Animated.View>
    </SafeAreaView>
  );
};

export default StreakCelebrationScreen;
