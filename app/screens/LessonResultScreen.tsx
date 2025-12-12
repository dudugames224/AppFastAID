import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Video, ResizeMode } from "expo-av";
import { useTheme } from "../context/ThemeContext";
import { auth, db, doc, getDoc, setDoc } from "../firebaseConfig.js";
import { fetchCourseModules, RemoteModule } from "../services/lessonService";

const CharacterImg = ({ size = 180 }: { size?: number }) => (
  <Image
    source={require("../../assets/images/band_feliz.png")}
    style={{ width: size, height: size, resizeMode: "contain", marginBottom: 10 }}
  />
);

interface LessonResultProps {
  onNext?: (() => void) | null;
  onBack?: () => void;
  xpGained?: number;
  isPractice?: boolean;
  safeAreaTop?: number;
  safeAreaBottom?: number;
}

const LessonResultScreen = ({
  onNext,
  onBack,
  xpGained: xpFromProps,
  isPractice: isPracticeFromProps,
  safeAreaTop,
  safeAreaBottom,
}: LessonResultProps = {}) => {
  const router = useRouter();
  const { courseId, moduleId, mode, xp } = useLocalSearchParams<{
    courseId?: string;
    moduleId?: string;
    mode?: string;
    xp?: string;
  }>();

  const [nextModule, setNextModule] = useState<RemoteModule | null>(null);
  const [currentUserData, setCurrentUserData] = useState<any>(null);
  const [safiraReward] = useState(() => Math.floor(Math.random() * 21) + 10);
  const [chestOpened, setChestOpened] = useState(false);
  const [rewardGranted, setRewardGranted] = useState(false);
  const [videoFinished, setVideoFinished] = useState(false);
  const chestPulse = useRef(new Animated.Value(0)).current;
  const chestVideoRef = useRef<Video | null>(null);

  const parsedXp = xp !== undefined ? Number(xp) : undefined;
  const computedXp =
    parsedXp !== undefined && !Number.isNaN(parsedXp)
      ? parsedXp
      : xpFromProps ?? 20;
  const computedIsPractice =
    mode === "practice" ? true : isPracticeFromProps ?? false;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const { colors } = useTheme();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 20,
      backgroundColor: colors.background,
    },
    title: {
      fontSize: 32,
      fontWeight: "bold",
      color: "#58CC02",
      marginBottom: 10,
      textAlign: "center",
    },
    subtitle: {
      fontSize: 18,
      color: "#A9A9A9",
      marginBottom: 20,
      textAlign: "center",
    },
    button: {
      backgroundColor: "#58CC02",
      borderRadius: 12,
      paddingVertical: 18,
      width: "100%",
      alignItems: "center",
    },
    buttonText: { color: colors.text, fontSize: 18, fontWeight: "bold" },
    backButton: { backgroundColor: "transparent", borderWidth: 2, borderColor: colors.text },
    backButtonText: { color: "#5D9CFB" },
    chestCard: {
      width: "100%",
      marginTop: 8,
      padding: 16,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.card,
      alignItems: "center",
      gap: 8,
    },
    chestTitle: { fontSize: 18, fontWeight: "700", color: colors.text },
    chestSubtitle: { color: colors.text, opacity: 0.8, textAlign: "center" },
    rewardText: { fontSize: 16, fontWeight: "700", color: colors.primary },
    chestButton: {
      backgroundColor: colors.primary,
      paddingVertical: 12,
      paddingHorizontal: 20,
      borderRadius: 12,
      marginTop: 6,
    },
    chestButtonText: { color: "#fff", fontWeight: "700", fontSize: 16 },
    chestPulseBox: {
      width: 160,
      height: 120,
      borderRadius: 16,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "#000",
      padding: 8,
    },
    chestVideo: {
      width: 160,
      height: 120,
      borderRadius: 12,
      overflow: "hidden",
      backgroundColor: "#000",
    },
  });


  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: false,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 4,
        useNativeDriver: false,
      }),
    ]).start();
  }, []);

  const paddingTop = (safeAreaTop || 0) + 20;
  const paddingBottom = (safeAreaBottom || 0) + 20;
  const exitTarget = computedIsPractice
    ? "/(tabs)/PracticeScreen"
    : "/(tabs)/CourseScreen";
  useEffect(() => {
    const loadNextModule = async () => {
      if (computedIsPractice || !courseId || !moduleId) {
        setNextModule(null);
        return;
      }
      const modules = await fetchCourseModules(courseId as string);
      const index = modules.findIndex((module) => module.id === moduleId);
      if (index !== -1 && index + 1 < modules.length) {
        setNextModule(modules[index + 1]);
      } else {
        setNextModule(null);
      }
    };
    loadNextModule();
  }, [computedIsPractice, courseId, moduleId]);

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

  const showNextButton = Boolean(
    onNext || (!computedIsPractice && nextModule)
  );

  const grantSafirasIfNeeded = async () => {
    if (rewardGranted) return;
    const user = auth.currentUser;
    if (user && currentUserData) {
      const userDocRef = doc(db, "users", user.uid);
      const currentSafiras = typeof currentUserData.safiras === "number" ? currentUserData.safiras : 0;
      await setDoc(
        userDocRef,
        { safiras: currentSafiras + safiraReward },
        { merge: true }
      );
      setRewardGranted(true);
    }
  };

  const updateXpAndExit = async () => {
    const user = auth.currentUser;
    if (user && currentUserData) {
      const userDocRef = doc(db, "users", user.uid);
      const doubleXpCharges = typeof currentUserData.doubleXpCharges === "number" ? currentUserData.doubleXpCharges : 0;
      const xpMultiplier = doubleXpCharges > 0 ? 2 : 1;
      const nextCharges = doubleXpCharges > 0 ? doubleXpCharges - 1 : 0;
      const rewardedXp = computedXp * xpMultiplier;
      const newXp = (currentUserData.xp || 0) + rewardedXp;

      const today = new Date();
      const lastLessonDate = currentUserData.lastLessonDate ? new Date(currentUserData.lastLessonDate) : null;
      let newStreak = currentUserData.ofensiva || 0;

      if (lastLessonDate) {
        const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const lastLessonStart = new Date(lastLessonDate.getFullYear(), lastLessonDate.getMonth(), lastLessonDate.getDate());
        const diffTime = todayStart.getTime() - lastLessonStart.getTime();
        const diffDays = diffTime / (1000 * 60 * 60 * 24);

        if (diffDays === 1) {
          newStreak++; 
        } else if (diffDays > 1) {
          newStreak = 1; 
        }
      } else {
        newStreak = 1;
      }

      await setDoc(
        userDocRef,
        {
          xp: newXp,
          ofensiva: newStreak,
          lastLessonDate: today.toISOString(),
          doubleXpCharges: nextCharges,
        },
        { merge: true }
      );
      await grantSafirasIfNeeded();
    }
  };

  const handleBackPress = async () => {
    await updateXpAndExit();
    if (onBack) {
      onBack();
      return;
    }
    router.replace(exitTarget);
  };

  const handleNextPress = async () => {
    await updateXpAndExit();
    if (onNext) {
      onNext();
      return;
    }
    if (!computedIsPractice && courseId && nextModule) {
      router.replace({
        pathname: "/screens/LessonScreen",
        params: { courseId: courseId as string, moduleId: nextModule.id },
      });
      return;
    }
    router.replace(exitTarget);
  };

  const handleOpenChest = async () => {
    if (!chestOpened) {
      setChestOpened(true);
      Animated.sequence([
        Animated.spring(chestPulse, { toValue: 1, useNativeDriver: true, speed: 6, bounciness: 12 }),
        Animated.spring(chestPulse, { toValue: 0, useNativeDriver: true, speed: 6, bounciness: 6 }),
      ]).start();
    }
    setVideoFinished(false);
    await grantSafirasIfNeeded();
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
          paddingTop,
          paddingBottom,
        },
      ]}
    >
      <CharacterImg size={180} />
      <Text style={styles.title}>
        {computedIsPractice ? "Pratica Concluida!" : "Modulo Concluido!"}
      </Text>
      <Text style={styles.subtitle}>
        Voce ganhou {computedXp} XP{currentUserData?.doubleXpCharges > 0 ? " (XP x2 ativo)" : ""} e esta mais perto de se tornar um heroi!
      </Text>

      {!computedIsPractice && (
        <View style={styles.chestCard}>
          <Animated.View
            style={[
              styles.chestPulseBox,
              {
                transform: [
                  {
                    scale: chestPulse.interpolate({
                      inputRange: [0, 1],
                      outputRange: [1, 1.08],
                    }),
                  },
                ],
              },
            ]}
          >
            {!videoFinished ? (
              <Video
                ref={chestVideoRef}
                source={require("../../assets/animations/bau_recodificado.mp4")}
                style={styles.chestVideo}
                resizeMode={ResizeMode.CONTAIN}
                isLooping={false}
                shouldPlay={chestOpened}
                useNativeControls={false}
                onPlaybackStatusUpdate={(status) => {
                  if ("didJustFinish" in status && status.didJustFinish) {
                    setVideoFinished(true);
                  }
                }}
              />
            ) : (
              <Image
                source={require("../../assets/images/torneios.png")}
                style={{ width: 120, height: 120, resizeMode: "contain" }}
              />
            )}
          </Animated.View>
          <Text style={styles.chestTitle}>Bau de Safiras</Text>
          {rewardGranted && (
            <Text style={styles.rewardText}>Safiras adicionadas: +{safiraReward}</Text>
          )}
          <TouchableOpacity
            style={[styles.chestButton, chestOpened && { opacity: 0.6 }]}
            activeOpacity={0.9}
            onPress={handleOpenChest}
            disabled={chestOpened}
          >
            <Text style={styles.chestButtonText}>
              {rewardGranted ? "Safiras coletadas" : "Abrir bau"}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {showNextButton && (
        <TouchableOpacity
          style={[styles.button, { marginBottom: 10 }]}
          onPress={handleNextPress}
        >
          <Text style={styles.buttonText}>Proximo Modulo</Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity style={[styles.button, styles.backButton]} onPress={handleBackPress}>
        <Text style={[styles.buttonText, styles.backButtonText]}>
          {computedIsPractice ? "Voltar a Praticar" : "Voltar ao Curso"}
        </Text>
      </TouchableOpacity>
    </Animated.View>
    
  );
};

export default LessonResultScreen;
