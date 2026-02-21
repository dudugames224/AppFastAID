import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { Animated, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { auth, db, doc, getDoc, setDoc } from "../firebaseConfig.js";
import { fetchCourseModules, RemoteModule } from "../services/lessonService";
import { addWeeklyXp } from "../services/tournamentService";

const CharacterImg = ({ size = 180 }: { size?: number }) => (
  <Image
    source={require("../../assets/images/band_feliz.png")}
    style={{ width: size, height: size, resizeMode: "contain", marginBottom: 10 }}
  />
);

const clampNumber = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

const coerceToMs = (value: any): number | null => {
  if (!value) return null;
  if (typeof value === "number") {
    if (!Number.isFinite(value)) return null;
    return value < 1e12 ? value * 1000 : value;
  }
  if (value instanceof Date) return Number.isFinite(value.getTime()) ? value.getTime() : null;
  if (typeof value === "string") {
    const ms = new Date(value).getTime();
    return Number.isFinite(ms) ? ms : null;
  }
  if (typeof value === "object") {
    if (typeof (value as any).toDate === "function") {
      const date = (value as any).toDate();
      return date instanceof Date && Number.isFinite(date.getTime()) ? date.getTime() : null;
    }
    if (typeof (value as any).seconds === "number") return (value as any).seconds * 1000;
    if (typeof (value as any)._seconds === "number") return (value as any)._seconds * 1000;
  }
  return null;
};

const formatDuration = (seconds: number) => {
  const total = Math.max(0, Math.floor(seconds));
  const minutes = Math.floor(total / 60);
  const remaining = total % 60;
  return `${minutes}:${String(remaining).padStart(2, "0")}`;
};

const DOUBLE_XP_MINUTES = 15;

const getPerformanceCopy = (params: {
  accuracy: number;
  mistakes: number;
  secondsPerAnswer: number | null;
  isPractice: boolean;
}) => {
  const { accuracy, mistakes, secondsPerAnswer, isPractice } = params;

  if (mistakes === 0 && accuracy >= 99) {
    return {
      headline: "Sério???",
      sub: "Você não errou nenhuma. Como?!",
    };
  }

  if (accuracy >= 95) {
    return {
      headline: "Incrível!",
      sub:
        secondsPerAnswer !== null && secondsPerAnswer <= 10
          ? "Rápido e preciso. Continue assim!"
          : "Excelente desempenho. Continue assim!",
    };
  }

  if (accuracy >= 80) {
    return {
      headline: "Mandou bem!",
      sub:
        mistakes > 0
          ? `Você teve ${mistakes} erro(s), mas mandou bem. Continue assim!`
          : isPractice
          ? "Boa prática! Mais uma rodada e você sobe ainda mais."
          : "Bom progresso. Vamos para o próximo passo!",
    };
  }

  return {
    headline: "Você consegue!",
    sub:
      mistakes > 0
        ? `Foram ${mistakes} erro(s). Revise o conteúdo e tente novamente para subir sua pontuação.`
        : "Revise o conteúdo e tente novamente para melhorar sua pontuação.",
  };
};

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
  const params = useLocalSearchParams();
  const insets = useSafeAreaInsets();

  // Helper para garantir que pegamos apenas o primeiro valor se vier como array
  const getSingleParam = (value: string | string[] | undefined) =>
    Array.isArray(value) ? value[0] : value;

  const courseId = getSingleParam(params.courseId as string | string[]);
  const moduleId = getSingleParam(params.moduleId as string | string[]);
  const mode = getSingleParam(params.mode as string | string[]);
  const xpParam = getSingleParam(params.xp as string | string[]);
  const accuracyParam = getSingleParam(params.accuracy as string | string[]);
  const mistakesParam = getSingleParam(params.mistakes as string | string[]);
  const answeredParam = getSingleParam(params.answered as string | string[]);
  const durationParam = getSingleParam(params.durationSeconds as string | string[]);
  const stageIndexParam = getSingleParam(params.stageIndex as string | string[]);
  const stageCountParam = getSingleParam(params.stageCount as string | string[]);

  const [nextModule, setNextModule] = useState<RemoteModule | null>(null);
  const [currentUserData, setCurrentUserData] = useState<any>(null);
  const [isClaiming, setIsClaiming] = useState(false);

  const parsedXp = xpParam !== undefined ? Number(xpParam) : undefined;
  const computedXp =
    parsedXp !== undefined && !Number.isNaN(parsedXp)
      ? parsedXp
      : xpFromProps ?? 20;

  const computedMistakes = Math.max(0, Math.floor(Number(mistakesParam) || 0));
  const computedAnswered = Math.max(0, Math.floor(Number(answeredParam) || 0));
  const computedDurationSeconds = Math.max(
    0,
    Math.floor(Number(durationParam) || 0)
  );
  const derivedAccuracy =
    computedAnswered > 0
      ? Math.round(((computedAnswered - computedMistakes) / computedAnswered) * 100)
      : 0;
  const computedAccuracy = clampNumber(
    Number(accuracyParam) ?? derivedAccuracy,
    0,
    100
  );
  const secondsPerAnswer =
    computedAnswered > 0 ? computedDurationSeconds / computedAnswered : null;

  const currentStageIndex = stageIndexParam !== undefined ? parseInt(stageIndexParam, 10) : 0;
  const totalStages = stageCountParam !== undefined ? parseInt(stageCountParam, 10) : 1;
  const hasNextStage = currentStageIndex + 1 < totalStages;

  const resolvedMode = mode ?? (isPracticeFromProps ? "practice" : "course");
  const isPracticeHubMode = resolvedMode === "practice" || resolvedMode === "review";
  const isCourseMode = resolvedMode === "course";
  const isDoctorMode = resolvedMode === "doctor";
  const isModuleReviewMode = resolvedMode === "module-review";
  const computedIsPractice = isPracticeHubMode;
  const resultKicker = isPracticeHubMode
    ? "PRATICA CONCLUIDA"
    : isDoctorMode
    ? "MODO DOUTOR CONCLUIDO"
    : isModuleReviewMode
    ? "REVISAO CONCLUIDA"
    : hasNextStage
    ? "LICAO CONCLUIDA"
    : "MODULO CONCLUIDO";
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const claimedRef = useRef(false);
  const claimInFlightRef = useRef(false);
  const lastComputedStreakRef = useRef<number | null>(null);

  const doubleXpCharges =
    typeof currentUserData?.doubleXpCharges === "number" ? currentUserData.doubleXpCharges : 0;
  const doubleUntilMs = coerceToMs((currentUserData as any)?.doubleXpUntil);
  const doubleActive = doubleXpCharges > 0 || (doubleUntilMs !== null && doubleUntilMs > Date.now());
  const doubleXpMultiplier = doubleActive
    ? typeof (currentUserData as any)?.doubleXpMultiplier === "number"
      ? (currentUserData as any).doubleXpMultiplier
      : 2
    : 1;
  const tripleXpUntilMs =
    coerceToMs((currentUserData as any)?.tripleXpUntil);
  const tripleXpMultiplier =
    tripleXpUntilMs !== null && tripleXpUntilMs > Date.now()
      ? typeof currentUserData?.tripleXpMultiplier === "number"
        ? currentUserData.tripleXpMultiplier
        : 3
      : 1;
  const xpMultiplier = doubleXpMultiplier * tripleXpMultiplier;
  const rewardedXp = computedXp * xpMultiplier;

  const performanceCopy = getPerformanceCopy({
    accuracy: computedAccuracy,
    mistakes: computedMistakes,
    secondsPerAnswer,
    isPractice: computedIsPractice,
  });

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: "#0B1B2A",
      paddingHorizontal: 20,
    },
    scrollContent: {
      flexGrow: 1,
      paddingTop: 10,
      paddingBottom: 18,
      alignItems: "center",
      justifyContent: "center",
    },
    scroll: { flex: 1 },
    hero: {
      width: "100%",
      alignItems: "center",
      justifyContent: "center",
      paddingTop: 24,
      paddingBottom: 8,
    },
    sparkle: {
      position: "absolute",
      width: 10,
      height: 10,
      borderRadius: 6,
      backgroundColor: "rgba(184, 255, 170, 0.7)",
      shadowColor: "rgba(184, 255, 170, 1)",
      shadowOpacity: 0.35,
      shadowRadius: 10,
      shadowOffset: { width: 0, height: 0 },
    },
    headline: {
      marginTop: 10,
      fontSize: 36,
      fontWeight: "900",
      color: "#FFD23C",
      textAlign: "center",
      letterSpacing: 0.4,
    },
    kicker: {
      marginTop: 2,
      fontSize: 12,
      fontWeight: "900",
      letterSpacing: 1.6,
      color: "rgba(255,255,255,0.6)",
      textAlign: "center",
    },
    subheadline: {
      marginTop: 10,
      fontSize: 18,
      color: "rgba(255,255,255,0.86)",
      textAlign: "center",
      lineHeight: 24,
      paddingHorizontal: 10,
    },
    statsRow: {
      marginTop: 26,
      width: "100%",
      maxWidth: 420,
      flexDirection: "row",
      justifyContent: "space-between",
      flexWrap: "wrap",
      gap: 12,
    },
    statCard: {
      flexGrow: 1,
      minWidth: 112,
      flexBasis: 112,
      borderRadius: 18,
      paddingVertical: 14,
      paddingHorizontal: 14,
      backgroundColor: "rgba(255,255,255,0.06)",
      borderWidth: 2,
    },
    statLabel: {
      fontSize: 12,
      fontWeight: "900",
      letterSpacing: 0.8,
      color: "rgba(255,255,255,0.86)",
      marginBottom: 10,
    },
    statValueRow: { flexDirection: "row", alignItems: "center", gap: 10 },
    statValue: {
      fontSize: 26,
      fontWeight: "900",
      color: "#fff",
    },
    statSub: {
      marginTop: 6,
      fontSize: 12,
      color: "rgba(255,255,255,0.7)",
      fontWeight: "700",
    },
    footer: {
      width: "100%",
      paddingTop: 10,
      paddingBottom: 10,
      gap: 12,
    },
    primaryButton: {
      backgroundColor: "#49B5FF",
      borderRadius: 18,
      paddingVertical: 18,
      width: "100%",
      alignItems: "center",
      shadowColor: "#000",
      shadowOpacity: 0.2,
      shadowRadius: 10,
      shadowOffset: { width: 0, height: 6 },
      elevation: 4,
    },
    primaryButtonDisabled: { opacity: 0.6 },
    primaryButtonText: {
      color: "#0B1B2A",
      fontSize: 16,
      fontWeight: "900",
      letterSpacing: 1,
    },
    secondaryButton: {
      backgroundColor: "rgba(255,255,255,0.02)",
      borderRadius: 18,
      paddingVertical: 14,
      width: "100%",
      alignItems: "center",
      borderWidth: 2,
      borderColor: "rgba(255,255,255,0.18)",
    },
    secondaryButtonText: {
      color: "rgba(255,255,255,0.85)",
      fontSize: 14,
      fontWeight: "900",
      letterSpacing: 0.6,
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
  }, [fadeAnim, scaleAnim]);

  const paddingTop = (safeAreaTop ?? insets.top) + 20;
  const paddingBottom = (safeAreaBottom ?? insets.bottom) + 20;
  const exitTarget = isPracticeHubMode
    ? "/(tabs)/PracticeScreen"
    : "/(tabs)/CourseScreen";

  useEffect(() => {
    const loadNextModule = async () => {
      if (!isCourseMode || !courseId || !moduleId) {
        setNextModule(null);
        return;
      }
      const modules = await fetchCourseModules(courseId as string);
      const index = modules.findIndex((module) => module.id === moduleId);
      if (index !== -1 && index + 1 < modules.length) {
        const next = modules[index + 1];
        // Se o próximo módulo for a ação de reiniciar, ignoramos (fim do curso real)
        if (next.id === "reset-course-action") {
          setNextModule(null);
        } else {
          setNextModule(next);
        }
      } else {
        setNextModule(null);
      }
    };
    loadNextModule();
  }, [isCourseMode, courseId, moduleId]);

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

  const showNextButton = Boolean(onNext || (isCourseMode && (hasNextStage || nextModule)));

  type UpdateXpResult = { newStreak: number; shouldCelebrateStreak: boolean };

  const updateXpAndExit = async (): Promise<UpdateXpResult | null> => {
    if (claimedRef.current || claimInFlightRef.current) {
      const fallbackStreak =
        lastComputedStreakRef.current ??
        (typeof currentUserData?.ofensiva === "number" ? currentUserData.ofensiva : 0);
      return { newStreak: fallbackStreak, shouldCelebrateStreak: false };
    }
    const user = auth.currentUser;
    if (!user) return null;

    setIsClaiming(true);
    claimInFlightRef.current = true;
    try {
      const userDocRef = doc(db, "users", user.uid);
      let resolvedUserData = currentUserData;
      const userDoc = await getDoc(userDocRef);
      if (userDoc.exists()) {
        resolvedUserData = userDoc.data();
        setCurrentUserData(resolvedUserData);
      }

      if (!resolvedUserData) return null;

      const now = new Date();
      const nowMs = now.getTime();

      const doubleXpCharges =
        typeof resolvedUserData.doubleXpCharges === "number"
          ? resolvedUserData.doubleXpCharges
          : 0;
      const doubleUntilMs = coerceToMs((resolvedUserData as any)?.doubleXpUntil);
      const hasActiveDoubleTime = doubleUntilMs !== null && doubleUntilMs > nowMs;
      const hasLegacyCharges = doubleXpCharges > 0;
      const doubleActive = hasLegacyCharges || hasActiveDoubleTime;
      const doubleXpMultiplier = doubleActive
        ? typeof (resolvedUserData as any)?.doubleXpMultiplier === "number"
          ? (resolvedUserData as any).doubleXpMultiplier
          : 2
        : 1;

      const tripleUntilMs = coerceToMs((resolvedUserData as any).tripleXpUntil);
      const tripleMultiplier =
        tripleUntilMs !== null && tripleUntilMs > nowMs
          ? typeof (resolvedUserData as any).tripleXpMultiplier === "number"
            ? (resolvedUserData as any).tripleXpMultiplier
            : 3
          : 1;

      const xpMultiplier = doubleXpMultiplier * tripleMultiplier;
      const rewardedXp = computedXp * xpMultiplier;
      const newXp = (resolvedUserData.xp || 0) + rewardedXp;

      const lastLessonDate = resolvedUserData.lastLessonDate ? new Date(resolvedUserData.lastLessonDate) : null;
      let newStreak = resolvedUserData.ofensiva || 0;

      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      let lastLessonStart: Date | null = null;

      if (lastLessonDate) {
        lastLessonStart = new Date(
          lastLessonDate.getFullYear(),
          lastLessonDate.getMonth(),
          lastLessonDate.getDate()
        );
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

      const isFirstLessonToday = !lastLessonStart || lastLessonStart.getTime() !== todayStart.getTime();
      const shouldCelebrateStreak = !computedIsPractice && isFirstLessonToday;

      const payload: Record<string, any> = {
        xp: newXp,
        ofensiva: newStreak,
        lastLessonDate: now.toISOString(),
      };

      if (hasLegacyCharges) {
        const baseMs = hasActiveDoubleTime && doubleUntilMs !== null ? doubleUntilMs : nowMs;
        const newUntilMs = baseMs + doubleXpCharges * DOUBLE_XP_MINUTES * 60 * 1000;
        payload.doubleXpUntil = new Date(newUntilMs).toISOString();
        payload.doubleXpMultiplier = 2;
        payload.doubleXpCharges = 0;
      } else {
        payload.doubleXpCharges = doubleXpCharges;
      }

      if (doubleActive) payload.lastDoubleXpAppliedAt = now.toISOString();

      await setDoc(userDocRef, payload, { merge: true });
      await addWeeklyXp(user.uid, rewardedXp, {
        nome: typeof resolvedUserData.nome === "string" ? resolvedUserData.nome : undefined,
        avatar: typeof resolvedUserData.avatar === "string" ? resolvedUserData.avatar : undefined,
      }).catch(() => 0);
      claimedRef.current = true;
      lastComputedStreakRef.current = newStreak;
      return { newStreak, shouldCelebrateStreak };
    } finally {
      claimInFlightRef.current = false;
      setIsClaiming(false);
    }
  };
  type NavigationIntent = { pathname: string; params?: Record<string, string> } | null;

  const buildNavigationIntent = async (action: "next" | "back"): Promise<NavigationIntent> => {
    if (action === "back") {
      if (onBack) {
        onBack();
        return null;
      }
      return { pathname: exitTarget };
    }

    if (onNext) {
      onNext();
      return null;
    }

    if (isCourseMode && courseId) {
      // Se houver próxima etapa (lição) no mesmo módulo, prioriza ela
      if (hasNextStage && moduleId) {
        return {
          pathname: "/screens/LessonScreen",
          params: {
            courseId: courseId as string,
            moduleId: moduleId as string,
            stageIndex: String(currentStageIndex + 1),
            stageCount: String(totalStages),
          },
        };
      }

      let resolvedNext = nextModule;
      if (!resolvedNext && moduleId) {
        const modules = await fetchCourseModules(courseId as string);
        const index = modules.findIndex((module) => module.id === moduleId);
        if (index !== -1 && index + 1 < modules.length) {
          const candidate = modules[index + 1];
          // Garante que não redirecione para o reset no fallback também
          if (candidate.id !== "reset-course-action") {
            resolvedNext = candidate;
          }
        }
      }

      if (resolvedNext) {
        return {
          pathname: "/screens/LessonScreen",
          params: { courseId: courseId as string, moduleId: resolvedNext.id },
        };
      }
    }

    return { pathname: exitTarget };
  };

  const handleExitAction = async (action: "next" | "back") => {
    const intent = await buildNavigationIntent(action);
    const result = await updateXpAndExit();
    if (!intent) return;

    if (result?.shouldCelebrateStreak && typeof result.newStreak === "number") {
      router.replace({
        pathname: "/screens/StreakCelebrationScreen",
        params: {
          streak: String(result.newStreak),
          targetPathname: intent.pathname,
          ...(intent.params || {}),
        },
      });
      return;
    }

    if (intent.params) {
      router.replace({ pathname: intent.pathname as any, params: intent.params } as any);
    } else {
      router.replace(intent.pathname as any);
    }
  };

  const handleBackPress = () => handleExitAction("back");
  const handleNextPress = () => handleExitAction("next");

  const primaryButtonLabel =
    showNextButton && isCourseMode ? "RESGATAR XP E CONTINUAR" : "RESGATAR XP";
  const secondaryButtonLabel = isPracticeHubMode ? "VOLTAR A PRATICAR" : "VOLTAR AO CURSO";

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
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        <View style={styles.hero}>
          <View style={[styles.sparkle, { top: 6, left: 42, transform: [{ rotate: "20deg" }] }]} />
          <View style={[styles.sparkle, { top: 44, right: 54, transform: [{ rotate: "-10deg" }] }]} />
          <View style={[styles.sparkle, { top: 120, left: 22, transform: [{ rotate: "5deg" }] }]} />
          <View style={[styles.sparkle, { top: 150, right: 30, transform: [{ rotate: "-22deg" }] }]} />
          <CharacterImg size={230} />
        </View>

        <Text style={styles.kicker}>{resultKicker}</Text>
        <Text style={styles.headline}>{performanceCopy.headline}</Text>
        <Text style={styles.subheadline}>{performanceCopy.sub}</Text>

        <View style={styles.statsRow}>
          <View style={[styles.statCard, { borderColor: "rgba(168, 98, 255, 0.85)" }]}>
            <Text style={styles.statLabel}>TOTAL XP</Text>
            <View style={styles.statValueRow}>
              <Ionicons name="flash" size={24} color="#B490FF" />
              <Text style={styles.statValue}>{rewardedXp}</Text>
            </View>
            <Text style={styles.statSub}>
              {xpMultiplier > 1 ? `XP x${xpMultiplier} aplicado` : "Recompensa do módulo"}
            </Text>
          </View>

          <View style={[styles.statCard, { borderColor: "rgba(88, 204, 2, 0.85)" }]}>
            <Text style={styles.statLabel}>
              {computedAccuracy >= 95 ? "IMPECÁVEL" : computedAccuracy >= 80 ? "ÓTIMO" : "EM TREINO"}
            </Text>
            <View style={styles.statValueRow}>
              <Ionicons name="checkmark-circle" size={24} color="#58CC02" />
              <Text style={styles.statValue}>{computedAccuracy}%</Text>
            </View>
            <Text style={styles.statSub}>
              {computedAnswered > 0
                ? `${computedMistakes} erro(s) em ${computedAnswered}`
                : `${computedMistakes} erro(s)`}
            </Text>
          </View>

          <View style={[styles.statCard, { borderColor: "rgba(73, 181, 255, 0.85)" }]}>
            <Text style={styles.statLabel}>
              {secondsPerAnswer !== null && secondsPerAnswer <= 10
                ? "TURBO"
                : secondsPerAnswer !== null && secondsPerAnswer <= 18
                ? "RÁPIDO"
                : "RITMADO"}
            </Text>
            <View style={styles.statValueRow}>
              <Ionicons name="time" size={24} color="#49B5FF" />
              <Text style={styles.statValue}>{formatDuration(computedDurationSeconds)}</Text>
            </View>
            <Text style={styles.statSub}>
              {secondsPerAnswer !== null ? `${Math.round(secondsPerAnswer)}s por questão` : "Tempo total"}
            </Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.primaryButton, isClaiming && styles.primaryButtonDisabled]}
          onPress={handleNextPress}
          activeOpacity={0.9}
          disabled={isClaiming}
        >
          <Text style={styles.primaryButtonText}>{primaryButtonLabel}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={handleBackPress}
          activeOpacity={0.9}
          disabled={isClaiming}
        >
          <Text style={styles.secondaryButtonText}>{secondaryButtonLabel}</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};

export default LessonResultScreen;
