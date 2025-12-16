import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { Animated, Easing, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Svg, { Path } from "react-native-svg";
import { useTheme } from "../context/ThemeContext";
import { auth, db, doc, getDoc, setDoc } from "../firebaseConfig.js";

type ChestFrame = "closed" | "open" | "openAlt";
type Rarity = "normal" | "rare" | "epic" | "legendary";

const ChestRewardScreen = () => {
  const { courseId, moduleId, mode, xp } = useLocalSearchParams<{
    courseId?: string;
    moduleId?: string;
    mode?: string;
    xp?: string;
  }>();
  const router = useRouter();
  const { colors } = useTheme();

  const [currentUserData, setCurrentUserData] = useState<any>(null);
  const [{ safiraReward, rarity }] = useState(() => {
    const legendary = Math.random() < 0.01;
    const value = legendary ? 30 : Math.floor(Math.random() * 21) + 10; // 10-30
    let bucket: Rarity = "normal";
    if (legendary) bucket = "legendary";
    else if (value >= 30) bucket = "epic";
    else if (value >= 15) bucket = "rare";
    else bucket = "normal";
    return { safiraReward: value, rarity: bucket };
  });
  const [chestOpened, setChestOpened] = useState(false);
  const [rewardGranted, setRewardGranted] = useState(false);
  const [isAnimatingChest, setIsAnimatingChest] = useState(false);
  const [tapCount, setTapCount] = useState(0);
  const [arrowGone, setArrowGone] = useState<[boolean, boolean, boolean]>([false, false, false]);
  const [chestFrame, setChestFrame] = useState<ChestFrame>("closed");

  const chestScale = useRef(new Animated.Value(1)).current;
  const chestRotate = useRef(new Animated.Value(0)).current;
  const chestLift = useRef(new Animated.Value(0)).current;
  const glowOpacity = useRef(new Animated.Value(0)).current;
  const glowScale = useRef(new Animated.Value(0.9)).current;
  const screenFlashOpacity = useRef(new Animated.Value(0)).current;
  const starAnims = useRef([
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
  ]).current;
  const frameSwapTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const chestIdleLoop = useRef<Animated.CompositeAnimation | null>(null);
  const openFrameTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const arrowAnims = useRef([new Animated.Value(0), new Animated.Value(0), new Animated.Value(0)]).current;

  const rarityLabel: Record<Rarity, string> = {
    normal: "NORMAL",
    rare: "RARO",
    epic: "EPICO",
    legendary: "LENDARIO",
  };

  const rarityBackground: Record<Rarity, string> = {
    normal: "#2C8B2F",
    rare: "#2F80ED",
    epic: "#7B2BE0",
    legendary: "#F2994A",
  };

  const rarityAccent: Record<Rarity, string> = {
    normal: "#C6F6D5",
    rare: "#D6E9FF",
    epic: "#E5D4FF",
    legendary: "#FFE4C2",
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: 24,
      backgroundColor: rarityBackground[rarity],
    },
    header: {
      fontSize: 28,
      fontWeight: "800",
      textAlign: "center",
      marginBottom: 6,
      color: rarityAccent[rarity],
    },
    chestWrapper: {
      width: "100%",
      maxWidth: 360,
      alignItems: "center",
      justifyContent: "center",
      padding: 18,
      borderRadius: 18,
      borderWidth: 1,
      gap: 12,
      backgroundColor: "rgba(255,255,255,0.08)",
      borderColor: "rgba(255,255,255,0.18)",
    },
    chestTouchable: {
      width: 220,
      height: 200,
      alignItems: "center",
      justifyContent: "center",
    },
    chestGlow: {
      position: "absolute",
      width: 230,
      height: 230,
      borderRadius: 120,
      backgroundColor: "rgba(255, 214, 70, 0.42)",
    },
    chestImage: { width: 220, height: 200, borderRadius: 18 },
    star: {
      position: "absolute",
      width: 10,
      height: 10,
      borderRadius: 6,
      backgroundColor: "white",
      shadowColor: "#fff",
      shadowOpacity: 0.9,
      shadowRadius: 6,
      shadowOffset: { width: 0, height: 0 },
    },
    rewardText: { fontSize: 16, fontWeight: "700", textAlign: "center" },
    continueButton: {
      width: "100%",
      maxWidth: 360,
      marginTop: 26,
      paddingVertical: 16,
      borderRadius: 18,
      alignItems: "center",
      backgroundColor: "#fff",
      shadowColor: "#000",
      shadowOpacity: 0.15,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 5 },
      elevation: 5,
    },
    continueButtonText: {
      color: "#2F80ED",
      fontWeight: "800",
      fontSize: 16,
      letterSpacing: 0.5,
    },
    flashOverlay: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "white",
      pointerEvents: "none",
    },
    tapIndicator: {
      marginTop: 26,
      width: "100%",
      maxWidth: 220,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    tapDot: {
      width: 48,
      height: 48,
      borderRadius: 24,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "rgba(255,255,255,0.2)",
    },
    tapDotActive: {
      backgroundColor: "rgba(255,255,255,0.32)",
    },
    tapArrow: {
      color: "rgba(255,255,255,0.7)",
      fontSize: 18,
      fontWeight: "800",
    },
    tapArrowActive: {
      color: rarityAccent[rarity],
    },
    tapHint: {
      marginTop: 8,
      color: rarityAccent[rarity],
      fontWeight: "800",
      letterSpacing: 0.5,
    },
  });

  const clearTimers = () => {
    if (frameSwapTimer.current) {
      clearTimeout(frameSwapTimer.current);
      frameSwapTimer.current = null;
    }
    if (chestIdleLoop.current) {
      chestIdleLoop.current.stop();
      chestIdleLoop.current = null;
    }
    if (openFrameTimeout.current) {
      clearTimeout(openFrameTimeout.current);
      openFrameTimeout.current = null;
    }
  };

  useEffect(() => () => clearTimers(), []);

  useEffect(() => {
    if (mode === "practice") {
      router.replace({
        pathname: "/screens/LessonResultScreen",
        params: { courseId: courseId as string, moduleId: moduleId as string, mode, xp },
      });
    }
  }, [mode, router, courseId, moduleId, xp]);

  useEffect(() => {
    const fetchUserData = async () => {
      const user = auth.currentUser;
      if (user) {
        const userDocRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          setCurrentUserData(userDoc.data());
        }
      }
    };
    fetchUserData();
  }, []);

  useEffect(() => {
    starAnims.forEach((value, index) => {
      const delay = 120 * index;
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(value, {
            toValue: 1,
            duration: 1400 + index * 200,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(value, {
            toValue: 0,
            duration: 1400 + index * 200,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ])
      ).start();
    });
  }, [starAnims]);

  const grantSafirasIfNeeded = async () => {
    if (rewardGranted) return;
    const user = auth.currentUser;
    if (user && currentUserData) {
      const userDocRef = doc(db, "users", user.uid);
      const currentSafiras =
        typeof currentUserData.safiras === "number" ? currentUserData.safiras : 0;
      const payload: Record<string, any> = { safiras: currentSafiras + safiraReward };
      if (rarity === "legendary") {
        const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();
        payload.tripleXpUntil = expiresAt;
      }
      await setDoc(
        userDocRef,
        payload,
        { merge: true }
      );
      setRewardGranted(true);
    }
  };

  const chestRotation = chestRotate.interpolate({
    inputRange: [-25, 25],
    outputRange: ["-25deg", "25deg"],
  });

  const chestAnimatedStyle = {
    transform: [{ translateY: chestLift }, { scale: chestScale }, { rotate: chestRotation }],
    shadowColor: "#000",
    shadowOpacity: 0.18,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    elevation: 10,
  };

  const chestGlowStyle = {
    opacity: glowOpacity,
    transform: [{ scale: glowScale }],
  };

  const chestImageSource =
    chestFrame === "open"
      ? require("../../assets/images/bau2.png")
      : chestFrame === "openAlt"
        ? require("../../assets/images/bau3.png")
        : require("../../assets/images/bau1.png");

  const runTapAnimation = (intensity: number) => {
    if (chestIdleLoop.current) {
      chestIdleLoop.current.stop();
      chestIdleLoop.current = null;
    }
    setIsAnimatingChest(true);
    Animated.parallel([
      Animated.sequence([
        Animated.timing(chestScale, { toValue: 1 + 0.04 * intensity, duration: 80, useNativeDriver: true }),
        Animated.spring(chestScale, { toValue: 1, speed: 10, bounciness: 6, useNativeDriver: true }),
      ]),
      Animated.sequence([
        Animated.timing(chestLift, { toValue: -6 * intensity, duration: 90, useNativeDriver: true }),
        Animated.spring(chestLift, { toValue: 0, speed: 10, bounciness: 8, useNativeDriver: true }),
      ]),
      Animated.sequence([
        Animated.timing(chestRotate, { toValue: -6 * intensity, duration: 60, useNativeDriver: true }),
        Animated.timing(chestRotate, { toValue: 6 * intensity, duration: 120, useNativeDriver: true }),
        Animated.timing(chestRotate, { toValue: 0, duration: 60, useNativeDriver: true }),
      ]),
      Animated.sequence([
        Animated.timing(glowOpacity, { toValue: 0.08 * intensity, duration: 80, useNativeDriver: true }),
        Animated.timing(glowOpacity, { toValue: 0, duration: 140, useNativeDriver: true }),
      ]),
    ]).start(() => {
      setIsAnimatingChest(false);
      if (!chestOpened) {
        startIdleAnimation("closed");
      }
    });
  };

  const runOpenAnimation = () => {
    if (chestIdleLoop.current) {
      chestIdleLoop.current.stop();
      chestIdleLoop.current = null;
    }
    setIsAnimatingChest(true);
    setChestOpened(true);
    void grantSafirasIfNeeded();

    if (frameSwapTimer.current) {
      clearTimeout(frameSwapTimer.current);
    }
    frameSwapTimer.current = setTimeout(() => {
      setChestFrame("open");
      frameSwapTimer.current = null;
    }, 220);
    if (openFrameTimeout.current) {
      clearTimeout(openFrameTimeout.current);
      openFrameTimeout.current = null;
    }
    openFrameTimeout.current = setTimeout(() => setChestFrame("openAlt"), 5000);

    Animated.sequence([
      Animated.sequence([
        Animated.timing(chestRotate, { toValue: -8, duration: 70, useNativeDriver: true }),
        Animated.timing(chestRotate, { toValue: 8, duration: 90, useNativeDriver: true }),
        Animated.timing(chestRotate, { toValue: 0, duration: 100, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(glowOpacity, { toValue: 0.75, duration: 160, useNativeDriver: true }),
        Animated.timing(glowScale, { toValue: 1.1, duration: 200, useNativeDriver: true }),
        Animated.timing(chestScale, { toValue: 1.14, duration: 200, useNativeDriver: true }),
        Animated.timing(chestLift, {
          toValue: -16,
          duration: 200,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.sequence([
          Animated.timing(screenFlashOpacity, { toValue: 1, duration: 120, useNativeDriver: true }),
          Animated.timing(screenFlashOpacity, {
            toValue: 0,
            duration: 1260,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
        ]),
      ]),
      Animated.parallel([
        Animated.spring(chestScale, { toValue: 1.04, speed: 8, bounciness: 9, useNativeDriver: true }),
        Animated.spring(chestLift, { toValue: 0, speed: 9, bounciness: 9, useNativeDriver: true }),
        Animated.timing(glowOpacity, { toValue: 0.22, duration: 380, useNativeDriver: true }),
      ]),
    ]).start(() => {
      setIsAnimatingChest(false);
      startIdleAnimation("open");
    });
  };

  const animateArrow = (index: number) => {
    const anim = arrowAnims[index];
    if (!anim || arrowGone[index]) return;
    anim.setValue(0);
    Animated.timing(anim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
      easing: Easing.out(Easing.quad),
    }).start(() => {
      anim.setValue(0);
      setArrowGone((prev) => {
        const next = [...prev] as [boolean, boolean, boolean];
        next[index] = true;
        return next;
      });
    });
  };

  const handleChestPress = () => {
    if (isAnimatingChest || chestOpened) return;
    setTapCount((prev) => {
      const next = Math.min(prev + 1, 3);
      animateArrow(next - 1);
      if (next === 1) {
        runTapAnimation(1);
      } else if (next === 2) {
        runTapAnimation(1.35);
      } else {
        runOpenAnimation();
      }
      return next;
    });
  };

  const handleContinue = () => {
    router.replace({
      pathname: "/screens/LessonResultScreen",
      params: {
        courseId: (courseId as string) || "",
        moduleId: (moduleId as string) || "",
        mode,
        xp,
      },
    });
  };

  const startIdleAnimation = (frame: ChestFrame) => {
    if (chestIdleLoop.current) {
      chestIdleLoop.current.stop();
      chestIdleLoop.current = null;
    }
    const isOpen = frame !== "closed";
    const scaleUp = isOpen ? 1.04 : 1.02;
    const liftUp = isOpen ? -4 : -2;
    const duration = isOpen ? 1000 : 900;

    chestIdleLoop.current = Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(chestScale, { toValue: scaleUp, duration, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
          Animated.timing(chestLift, { toValue: liftUp, duration, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
          Animated.timing(glowOpacity, { toValue: isOpen ? 0.3 : 0.18, duration, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
          Animated.timing(glowScale, { toValue: isOpen ? 1.12 : 1.05, duration, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        ]),
        Animated.parallel([
          Animated.timing(chestScale, { toValue: 1, duration, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
          Animated.timing(chestLift, { toValue: 0, duration, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
          Animated.timing(glowOpacity, { toValue: 0.12, duration, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
          Animated.timing(glowScale, { toValue: 1, duration, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        ]),
      ])
    );
    chestIdleLoop.current.start();
  };

  useEffect(() => {
    startIdleAnimation("closed");
    return () => {
      if (chestIdleLoop.current) {
        chestIdleLoop.current.stop();
        chestIdleLoop.current = null;
      }
    };
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>{rarityLabel[rarity]}</Text>

      <View style={styles.chestWrapper}>
        <TouchableOpacity
          style={[styles.chestTouchable, chestOpened && { opacity: 0.9 }]}
          activeOpacity={0.9}
          onPress={handleChestPress}
          disabled={chestOpened || isAnimatingChest}
        >
          <Animated.View pointerEvents="none" style={[styles.chestGlow, chestGlowStyle]} />
          {starAnims.map((anim, idx) => {
            const translateX = anim.interpolate({
              inputRange: [0, 1],
              outputRange: [idx % 2 === 0 ? -70 : 60, idx % 2 === 0 ? -40 : 90],
            });
            const translateY = anim.interpolate({
              inputRange: [0, 1],
              outputRange: [idx * 10 - 20, idx * 8 - 40],
            });
            const scale = anim.interpolate({
              inputRange: [0, 0.5, 1],
              outputRange: [0.6, 1.1, 0.6],
            });
            const opacity = anim.interpolate({
              inputRange: [0, 0.3, 0.7, 1],
              outputRange: [0, 0.7, 1, 0],
            });
            return (
              <Animated.View
                key={`star-${idx}`}
                style={[
                  styles.star,
                  {
                    transform: [{ translateX }, { translateY }, { scale }],
                    opacity,
                  },
                ]}
                pointerEvents="none"
              />
            );
          })}
          <Animated.Image
            source={chestImageSource}
            style={[styles.chestImage, chestAnimatedStyle]}
            resizeMode="contain"
          />
        </TouchableOpacity>

        {rewardGranted && (
          <>
            <Text style={[styles.rewardText, { color: "#fff" }]}>
              Safiras adicionadas: +{safiraReward}
            </Text>
            {rarity === "legendary" && (
              <Text style={[styles.rewardText, { color: rarityAccent[rarity] }]}>
                Pocao de XP x3 por 15 minutos ativada!
              </Text>
            )}
          </>
        )}
      </View>

      {!chestOpened && (
        <>
          <View style={styles.tapIndicator}>
            {[0, 1, 2].map((idx) => {
              const active = tapCount > idx;
              const anim = arrowAnims[idx];
              const translateY = anim.interpolate({ inputRange: [0, 1], outputRange: [0, -30] });
              const opacity = anim.interpolate({ inputRange: [0, 0.2, 1], outputRange: [1, 1, 0] });
              return (
                <View key={`dot-${idx}`} style={[styles.tapDot, active && styles.tapDotActive]}>
                  {!arrowGone[idx] && (
                    <Animated.View style={{ transform: [{ translateY }], opacity }}>
                      <Svg width={22} height={22} viewBox="0 0 24 24">
                        <Path
                          d="M12 5l6 8h-4v6h-4v-6H6z"
                          fill={active ? rarityAccent[rarity] : "rgba(255,255,255,0.7)"}
                        />
                      </Svg>
                    </Animated.View>
                  )}
                </View>
              );
            })}
          </View>
          <Text style={styles.tapHint}>Tap! Tap!</Text>
        </>
      )}

      {chestOpened && (
        <TouchableOpacity style={styles.continueButton} activeOpacity={0.9} onPress={handleContinue}>
          <Text style={styles.continueButtonText}>CONTINUAR</Text>
        </TouchableOpacity>
      )}

      <Animated.View style={[styles.flashOverlay, { opacity: screenFlashOpacity }]} />
    </View>
  );
};

export default ChestRewardScreen;
