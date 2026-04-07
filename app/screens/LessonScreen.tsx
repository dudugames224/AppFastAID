import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { HeartIcon, XIcon } from "../components/Icons";
import { useTheme } from "../context/ThemeContext";
import { auth, db, doc, getDoc, updateDoc } from "../firebaseConfig";
import {
  fetchAppSettings,
  fetchCourseModules,
  fetchModuleLessons,
  resetCourseProgress,
  savePostTestResult
} from "../services/lessonService";
import { applyLifeRegeneration, startLifeCountdown } from "../services/lifeService";
import {
  getDueReviewCards,
  getDoctorCompletedModules,
  getReviewCards,
  markDoctorModuleCompleted,
  markModuleStage,
  recordReviewCardOutcome,
  saveAdaptiveSessionOutcome,
} from "../services/progressService";
import {
  AdaptiveLessonMode,
  buildAdaptiveDeck,
  getDeckConfigForMode,
  getPressureHint,
  inferSkillFromCard,
  isAdaptiveCourseEnabled,
} from "../services/adaptiveTrainingService";
import { LessonCard } from "../types/lesson";

const demoLesson: LessonCard[] = [
  {
    type: "info",
    title: "Introdução",
    text: "Siga as orientações e responda as perguntas.",
  },
  {
    type: "mcq",
    question: "Qual é a cor do botão de continuar?",
    options: ["Verde", "Azul", "Vermelho", "Branco"],
    answer: 1,
    correctFeedback: "Isso aí! É azul.",
    incorrectFeedback: "Tente novamente nas próximas atividades.",
  },
];

const shuffleArray = <T,>(array: T[]): T[] => {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};

const shuffleMcqCardOptions = (card: LessonCard): LessonCard => {
  if (card.type !== "mcq" || !Array.isArray(card.options)) {
    return card;
  }

  const indexedOptions = card.options.map((option, index) => ({
    option,
    isCorrect: index === card.answer,
  }));
  const shuffledOptions = shuffleArray(indexedOptions);
  const newAnswerIndex = shuffledOptions.findIndex((item) => item.isCorrect);

  return {
    ...card,
    options: shuffledOptions.map((item) => item.option),
    answer: newAnswerIndex >= 0 ? newAnswerIndex : card.answer,
  };
};

const getShuffledLesson = (data: LessonCard[]): LessonCard[] => {
  return data.map((card) => {
    if (card.type === "mcq") {
      return shuffleMcqCardOptions(card);
    }
    if (card.type === "sequence" && card.orderOptions) {
      return { ...card, orderOptions: shuffleArray(card.orderOptions) };
    }
    return card;
  });
};

const cloneLessonCard = (card: LessonCard): LessonCard => {
  if (card.type === "mcq") {
    return {
      ...card,
      options: Array.isArray(card.options) ? [...card.options] : [],
    };
  }
  if (card.type === "sequence") {
    return {
      ...card,
      orderOptions: Array.isArray(card.orderOptions)
        ? card.orderOptions.map((option) => ({ ...option }))
        : [],
      correctOrder: Array.isArray(card.correctOrder) ? [...card.correctOrder] : [],
    };
  }
  return { ...card };
};

const getDoctorDeck = (
  practiceDeck: LessonCard[],
  moduleDeck: LessonCard[],
  questionCount: number = 15,
): LessonCard[] => {
  const deduped = new Map<string, LessonCard>();
  const addCards = (cards: LessonCard[]) => {
    cards.forEach((card, index) => {
      if (!card || card.type === "info") return;
      const baseKey =
        card.type === "sequence"
          ? card.question
          : card.type === "mcq"
          ? card.question
          : String(index);
      const key = baseKey?.trim().toLowerCase();
      if (!key || deduped.has(key)) return;
      deduped.set(key, cloneLessonCard(card));
    });
  };

  addCards(practiceDeck);
  addCards(moduleDeck);

  const pool = shuffleArray(Array.from(deduped.values()));
  if (pool.length === 0) return [];

  const selected: LessonCard[] = [];
  while (selected.length < questionCount) {
    const card = pool[selected.length % pool.length];
    selected.push(cloneLessonCard(card));
  }
  return selected;
};

const fallbackCourseId = "burns";
const SPECIAL_MODULE_IDS = new Set(["course-intro", "review-cards", "reset-course-action"]);
const ADAPTIVE_MODE_SET = new Set<AdaptiveLessonMode>([
  "micro-session",
  "pressure",
  "daily-emergency",
  "weekly-challenge",
  "monthly-sim",
]);
const EVENT_MODE_SET = new Set<AdaptiveLessonMode>([
  "daily-emergency",
  "weekly-challenge",
  "monthly-sim",
]);

const LessonScreen = () => {
    const {  lessonstyles, colors } = useTheme();
  const insets = useSafeAreaInsets();
 
  const router = useRouter();
  const {
    courseId: paramsCourseId,
    moduleId: paramsModuleId,
    mode,
    introModuleId,
    stageCount: paramsStageCount,
    stageIndex: paramsStageIndex,
    eventSeed: paramsEventSeed,
    trackId: paramsTrackId,
  } = useLocalSearchParams<{
    courseId?: string;
    moduleId?: string;
    mode?: string;
    introModuleId?: string;
    stageCount?: string;
    stageIndex?: string;
    eventSeed?: string;
    trackId?: string;
  }>();

  const lessonMode = typeof mode === "string" ? mode : "course";
  const isPracticeMode = lessonMode === "practice";
  const isReviewMode = lessonMode === "review";
  const isModuleReviewMode = lessonMode === "module-review";
  const isDoctorMode = lessonMode === "doctor";
  const isAdaptiveMode = ADAPTIVE_MODE_SET.has(lessonMode as AdaptiveLessonMode);
  const adaptiveMode = isAdaptiveMode ? (lessonMode as AdaptiveLessonMode) : null;
  const isPressureMode = lessonMode === "pressure";
  const isDailyEmergencyMode = lessonMode === "daily-emergency";
  const isWeeklyChallengeMode = lessonMode === "weekly-challenge";
  const isMonthlySimMode = lessonMode === "monthly-sim";
  const isEventMode = EVENT_MODE_SET.has(lessonMode as AdaptiveLessonMode);
  const isTrainingMode =
    isPracticeMode ||
    isReviewMode ||
    isModuleReviewMode ||
    isDoctorMode ||
    isAdaptiveMode;
  const isPracticeHubMode =
    isPracticeMode || isReviewMode;
  const courseId = (paramsCourseId as string) || fallbackCourseId;
  const stageCountParam = paramsStageCount ? Number(paramsStageCount) : 1;
  const stageCount = Number.isFinite(stageCountParam) && stageCountParam > 0 ? stageCountParam : 1;
  
  const stageIndexParam = paramsStageIndex ? Number(paramsStageIndex) : 0;
  const currentStageIndex = Number.isFinite(stageIndexParam) && stageIndexParam >= 0 ? stageIndexParam : 0;
  const eventSeedParam = paramsEventSeed ? Number(paramsEventSeed) : NaN;
  const resolvedEventSeed = useMemo(
    () => (Number.isFinite(eventSeedParam) ? eventSeedParam : Date.now()),
    [eventSeedParam]
  );
  const fixedTrackId = typeof paramsTrackId === "string" && paramsTrackId.trim().length > 0
    ? (paramsTrackId as any)
    : undefined;

  const [isPremium, setIsPremium] = useState(false);

  const [currentStep, setCurrentStep] = useState(0);
  const [questions, setQuestions] = useState<LessonCard[]>(
    getShuffledLesson(demoLesson)
  );
  const [, setCorrectCount] = useState(0);
  const [, setAnsweredCount] = useState(0);
  const [lessonStartTime, setLessonStartTime] = useState<number | null>(null);
  const correctCountRef = useRef(0);
  const answeredCountRef = useRef(0);
  const lessonStartTimeRef = useRef<number | null>(null);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const showFeedbackRef = useRef(false);
  const [isLoadingLessons, setIsLoadingLessons] = useState(true);
  const [lives, setLives] = useState(5);
  const [, setLastLifeUpdate] = useState<number | null>(null);
  const [isNavigating, setIsNavigating] = useState(false);
  const [sequenceSelection, setSequenceSelection] = useState<string[]>([]);
  const [revealCorrectOrder, setRevealCorrectOrder] = useState(false);
  const [pressureTimerSeconds, setPressureTimerSeconds] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [pressureHint, setPressureHint] = useState<string | null>(null);
  const [feedbackReason, setFeedbackReason] = useState<"timeout" | null>(null);
  const adaptiveSkillXpRef = useRef<Record<string, number>>({});
  const adaptiveTrackRef = useRef<Record<string, { attempts: number; success: number }>>({});
  
  // Ref para armazenar o detalhamento das respostas (Pos-Teste)
  const resultsLog = useRef<{ question: string; isCorrect: boolean }[]>([]);

  useEffect(() => {
    setIsNavigating(false);
  }, [currentStep]);

  useEffect(() => {
    showFeedbackRef.current = showFeedback;
  }, [showFeedback]);

  const resetSessionState = (deck: LessonCard[]) => {
    correctCountRef.current = 0;
    answeredCountRef.current = 0;
    lessonStartTimeRef.current = Date.now();
    resultsLog.current = [];
    adaptiveSkillXpRef.current = {};
    adaptiveTrackRef.current = {};
    setCorrectCount(0);
    setAnsweredCount(0);
    setLessonStartTime(lessonStartTimeRef.current);
    setQuestions(getShuffledLesson(deck));
    setCurrentStep(0);
    setSelectedOption(null);
    setIsCorrect(null);
    setShowFeedback(false);
    showFeedbackRef.current = false;
    setRevealCorrectOrder(false);
    setSequenceSelection([]);
    setFeedbackReason(null);
    setTimeLeft(null);
  };

  const addAdaptiveSkillXp = (skillId: string, delta: number) => {
    if (!skillId || delta <= 0) return;
    const current = adaptiveSkillXpRef.current[skillId] || 0;
    adaptiveSkillXpRef.current[skillId] = current + delta;
  };

  const addAdaptiveTrackProgress = (trackId: string | undefined, wasCorrect: boolean) => {
    if (!trackId) return;
    const previous = adaptiveTrackRef.current[trackId] || { attempts: 0, success: 0 };
    adaptiveTrackRef.current[trackId] = {
      attempts: previous.attempts + 1,
      success: previous.success + (wasCorrect ? 1 : 0),
    };
  };

  const decrementLive = useCallback(() => {
    const user = auth.currentUser;
    if (user && !isPremium) {
      const newLives = Math.max(0, lives - 1);
      setLives(newLives);
      const userDocRef = doc(db, "users", user.uid);
      void updateDoc(userDocRef, {
        lives: newLives,
        vidas: newLives,
        lastLifeUpdate: startLifeCountdown(),
      }).catch((error) => console.error("Failed to update lives:", error));
      setLastLifeUpdate(Date.now());
    }
  }, [isPremium, lives]);

  const registerCardOutcome = useCallback((card: LessonCard, wasCorrect: boolean, questionLabel?: string) => {
    const questionText =
      questionLabel && questionLabel.trim().length > 0
        ? questionLabel
        : card.type === "info"
        ? `Informacao ${currentStep + 1}`
        : typeof (card as any).question === "string" && (card as any).question.trim().length > 0
        ? (card as any).question
        : `Pergunta ${currentStep + 1}`;
    resultsLog.current.push({ question: questionText, isCorrect: wasCorrect });

    answeredCountRef.current += 1;
    setAnsweredCount((value) => value + 1);
    if (wasCorrect) {
      correctCountRef.current += 1;
      setCorrectCount((value) => value + 1);
    } else {
      void decrementLive();
    }

    if (card.type !== "info") {
      const moduleIdForReview =
        typeof paramsModuleId === "string" ? paramsModuleId : undefined;
      void recordReviewCardOutcome(
        courseId,
        card as any,
        wasCorrect,
        moduleIdForReview
      ).catch(() => {});
    }

    if (isAdaptiveMode && card.type !== "info") {
      const adaptiveMeta = (card as any)?.adaptiveMeta || {};
      const inferredSkill =
        typeof adaptiveMeta.primarySkill === "string"
          ? adaptiveMeta.primarySkill
          : inferSkillFromCard(card, "decision");
      const skillDelta = wasCorrect ? 12 : 4;
      addAdaptiveSkillXp(inferredSkill, skillDelta);
      addAdaptiveTrackProgress(
        typeof adaptiveMeta.trackId === "string" ? adaptiveMeta.trackId : fixedTrackId,
        wasCorrect
      );
    }
  }, [courseId, currentStep, decrementLive, fixedTrackId, isAdaptiveMode, paramsModuleId]);

  useEffect(() => {
    const loadInitialData = async () => {
      // Carrega configurações globais
      const settings = await fetchAppSettings();
      const globalInfinite = settings.globalInfiniteLives === true;

      const user = auth.currentUser;
      if (user) {
        const userDocRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          const userData = userDoc.data();
          const initialLives =
            typeof (userData as any).lives === "number"
              ? (userData as any).lives
              : typeof (userData as any).vidas === "number"
              ? (userData as any).vidas
              : 5;
          const regenerated = applyLifeRegeneration({
            lives: initialLives,
            lastLifeUpdate: (userData as any).lastLifeUpdate ?? null,
          });

          setLives(regenerated.lives);
          setLastLifeUpdate(regenerated.lastLifeUpdate);

          if (!Boolean((userData as any).isPremium) && regenerated.lives !== initialLives) {
            await updateDoc(userDocRef, {
              lives: regenerated.lives,
              vidas: regenerated.lives,
              lastLifeUpdate: regenerated.lastLifeUpdate,
            });
          }
          // Se o evento global estiver ativo, consideramos o usuário como Premium para fins de vidas
          setIsPremium(Boolean((userData as any).isPremium) || globalInfinite);
        }
      }
    };

    const loadLessons = async () => {
      setIsLoadingLessons(true);
      try {
        // Lógica para o botão de Reiniciar Curso
        if (paramsModuleId === "reset-course-action") {
          const user = auth.currentUser;
          if (user) {
            Alert.alert(
              "Reiniciar Curso",
              "Tem certeza que deseja reiniciar este curso? Todo o seu progresso será perdido.",
              [
                {
                  text: "Cancelar",
                  style: "cancel",
                  onPress: () => router.back(),
                },
                {
                  text: "Sim, reiniciar",
                  style: "destructive",
                  onPress: async () => {
                    setIsLoadingLessons(true);
                    const success = await resetCourseProgress(user.uid, courseId);
                    if (success) {
                      Alert.alert("Curso Reiniciado", "O progresso foi zerado e você ganhou 200 XP e 200 Safiras!", [
                        { text: "OK", onPress: () => router.back() }
                      ]);
                    } else {
                      Alert.alert("Erro", "Não foi possível reiniciar o curso. Verifique suas permissões ou conexão.");
                      router.back();
                    }
                  },
                },
              ]
            );
          } else {
            router.back();
          }
          return;
        }

        // Verifica se é o curso de RCP/Suporte Básico e se precisa mostrar a intro
        const normalizedId = courseId.toLowerCase();
        const isRcp = normalizedId === 'rcp' || normalizedId === 'reanimacao' || normalizedId === 'suportebasico';

        if (isRcp && paramsModuleId === 'review-cards' && !introModuleId && !isTrainingMode) {
          router.replace({
            pathname: "/screens/RCPIntroScreen",
            params: {
              courseId,
              moduleId: "review-cards",
              nextModuleId: "review-cards",
            },
          });
          return;
        }

        if (isReviewMode) {
          const dueReviewDeck = await getDueReviewCards(courseId, 60);
          const reviewDeck =
            dueReviewDeck.length > 0 ? dueReviewDeck : await getReviewCards(courseId);
          if (reviewDeck.length === 0) {
            Alert.alert(
              "Revisão indisponível",
              "Você ainda não tem perguntas erradas para revisar neste curso."
            );
            router.replace("/(tabs)/PracticeScreen");
            return;
          }

          setPressureTimerSeconds(null);
          setPressureHint(null);
          resetSessionState(reviewDeck);
          return;
        }

        let effectiveModuleId = paramsModuleId as string | undefined;
        let playableModulesCache: Awaited<ReturnType<typeof fetchCourseModules>> = [];

        if (isPracticeMode || isModuleReviewMode || isDoctorMode || isAdaptiveMode) {
          const allModules = await fetchCourseModules(courseId);
          playableModulesCache = allModules.filter(
            (m) =>
              m.id !== "course-intro" &&
              m.id !== "review-cards" &&
              m.id !== "reset-course-action" &&
              (m.stageCount ?? 1) > 0
          );
          const hasProvidedModule = typeof effectiveModuleId === "string" && effectiveModuleId.trim().length > 0;
          const shouldAutoPick =
            !hasProvidedModule ||
            effectiveModuleId === "review-cards" ||
            effectiveModuleId === "course-intro" ||
            effectiveModuleId === "reset-course-action";

          if (shouldAutoPick) {
            effectiveModuleId = playableModulesCache[0]?.id;
          }
        }

        if (isAdaptiveMode) {
          if (!isAdaptiveCourseEnabled(courseId)) {
            Alert.alert(
              "Modo indisponível",
              "Os modos adaptativos ainda não estão ativos para este curso."
            );
            router.replace("/(tabs)/CourseScreen");
            return;
          }

          const resolvedAdaptiveMode = adaptiveMode || "micro-session";
          const deckConfig = getDeckConfigForMode(resolvedAdaptiveMode);
          const playableModules =
            playableModulesCache.length > 0
              ? playableModulesCache
              : (await fetchCourseModules(courseId)).filter(
                  (m) =>
                    !SPECIAL_MODULE_IDS.has(m.id) && (m.stageCount ?? 1) > 0
                );

          const selectedModuleIds: string[] = [];
          if (
            effectiveModuleId &&
            playableModules.some((module) => module.id === effectiveModuleId)
          ) {
            selectedModuleIds.push(effectiveModuleId);
          } else {
            const shuffledIds = shuffleArray(playableModules.map((module) => module.id));
            const moduleTargetCount = isMonthlySimMode
              ? Math.min(3, shuffledIds.length)
              : isWeeklyChallengeMode
              ? Math.min(2, shuffledIds.length)
              : 1;
            selectedModuleIds.push(...shuffledIds.slice(0, moduleTargetCount));
          }

          const moduleDeckList = await Promise.all(
            selectedModuleIds.map((moduleId) =>
              fetchModuleLessons(courseId, moduleId, 0)
            )
          );
          const modulePool = moduleDeckList.flat();
          const dueReviewCards = await getDueReviewCards(courseId, 80);
          const adaptiveDeck = buildAdaptiveDeck({
            courseId,
            moduleCards: modulePool.length > 0 ? modulePool : demoLesson,
            reviewCards: dueReviewCards,
            mode: resolvedAdaptiveMode,
            seed: resolvedEventSeed,
            fixedTrackId,
          });

          setPressureTimerSeconds(deckConfig.timerSeconds);
          setPressureHint(
            deckConfig.forcePressure
              ? getPressureHint(resolvedEventSeed + currentStageIndex)
              : null
          );
          resetSessionState(adaptiveDeck.length > 0 ? adaptiveDeck : demoLesson);
          return;
        }

        if (isDoctorMode) {
          if (effectiveModuleId && !SPECIAL_MODULE_IDS.has(effectiveModuleId)) {
            const doctorCompleted = await getDoctorCompletedModules(courseId);
            if (doctorCompleted.includes(effectiveModuleId)) {
              Alert.alert(
                "Modo Doutor concluído",
                "Você já concluiu o modo Doutor neste módulo. Agora ele fica disponível apenas para revisão."
              );
              router.replace("/(tabs)/CourseScreen");
              return;
            }
          }

          const [practiceDeck, moduleDeck] = await Promise.all([
            fetchModuleLessons(courseId, "review-cards", 0),
            effectiveModuleId && effectiveModuleId.trim().length > 0
              ? fetchModuleLessons(courseId, effectiveModuleId, 0)
              : Promise.resolve([]),
          ]);

          const doctorDeck = getDoctorDeck(practiceDeck, moduleDeck, 15);
          const fallbackDoctorDeck = getDoctorDeck([], demoLesson, 15);
          const finalDoctorDeck = doctorDeck.length > 0 ? doctorDeck : fallbackDoctorDeck;

          setPressureTimerSeconds(null);
          setPressureHint(null);
          resetSessionState(finalDoctorDeck);
          return;
        }

        const deck =
          effectiveModuleId && effectiveModuleId.trim().length > 0
            ? await fetchModuleLessons(courseId, effectiveModuleId, currentStageIndex)
            : [];
        const finalDeck = deck.length > 0 ? deck : demoLesson;

        setPressureTimerSeconds(null);
        setPressureHint(null);
        resetSessionState(finalDeck);
      } catch (error) {
        console.warn("Erro ao carregar a lição:", error);
        setPressureTimerSeconds(null);
        setPressureHint(null);
        resetSessionState(demoLesson);
      } finally {
        setIsLoadingLessons(false);
      }
    };
    loadInitialData(); 
    loadLessons(); 
  }, [
    courseId,
    paramsModuleId,
    lessonMode,
    isPracticeMode,
    isReviewMode,
    isModuleReviewMode,
    isDoctorMode,
    isAdaptiveMode,
    adaptiveMode,
    isWeeklyChallengeMode,
    isMonthlySimMode,
    isTrainingMode,
    currentStageIndex,
    introModuleId,
    resolvedEventSeed,
    fixedTrackId,
    router,
  ]);

  const exitTarget = isPracticeHubMode
    ? "/(tabs)/PracticeScreen"
    : "/(tabs)/CourseScreen";

  const feedbackAnim = useRef(new Animated.Value(200)).current;
  const currentCard = questions[currentStep];

  const activeImage = useMemo(() => {   // A imagem já vem resolvida do lessonService
    return (currentCard as any)?.image || null;
  }, [currentCard]);

  const isInfoCard = currentCard?.type === "info";
  const isSequenceCard = currentCard?.type === "sequence";
  const sequenceOptions = useMemo(() => {
    if (!isSequenceCard || !currentCard) return [];
    const base =
      currentCard.orderOptions?.length && currentCard.orderOptions[0]
        ? currentCard.orderOptions
        : (currentCard.correctOrder || []).map((item, index) => ({
            id: String(item ?? index),
            label: typeof item === "string" ? item : `Passo ${index + 1}`,
          }));
    // A imagem já vem resolvida do lessonService
    return base.map((opt: any, index) => {
      return {
        id:
          typeof (opt as any)?.id === "string"
            ? (opt as any).id
            : typeof (opt as any)?.label === "string"
            ? (opt as any).label
            : `seq-${index}`,
        label:
          typeof (opt as any)?.label === "string"
            ? (opt as any).label
            : typeof (opt as any)?.text === "string"
            ? (opt as any).text
            : `Passo ${index + 1}`,
        image: opt.image,
      };
    });
  }, [currentCard, isSequenceCard]);

  useEffect(() => {
    if (showFeedback || isInfoCard) {
      Animated.spring(feedbackAnim, {
        toValue: 0,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(feedbackAnim, {
        toValue: 200,
        duration: 150,
        useNativeDriver: true,
      }).start();
    }
  }, [showFeedback, currentStep, isInfoCard, feedbackAnim]);

  const isPressureSession = isAdaptiveMode && pressureTimerSeconds !== null;
  const activePressureHint =
    pressureHint ||
    (typeof (currentCard as any)?.adaptiveMeta?.pressureHint === "string"
      ? (currentCard as any).adaptiveMeta.pressureHint
      : null);

  const handleTimedOutQuestion = useCallback(() => {
    if (showFeedbackRef.current || !currentCard || isInfoCard) return;
    setFeedbackReason("timeout");
    setIsCorrect(false);
    setShowFeedback(true);
    showFeedbackRef.current = true;

    if (currentCard.type === "mcq") {
      const wrongIndex = currentCard.options?.findIndex((_, idx) => idx !== currentCard.answer) ?? -1;
      if (wrongIndex >= 0) {
        setSelectedOption(wrongIndex);
      }
      registerCardOutcome(currentCard, false, currentCard.question);
      return;
    }

    if (currentCard.type === "sequence") {
      setRevealCorrectOrder(false);
      registerCardOutcome(currentCard, false, currentCard.question);
    }
  }, [currentCard, isInfoCard, registerCardOutcome]);

  useEffect(() => {
    if (!isPressureSession || !currentCard || isInfoCard || showFeedback || !pressureTimerSeconds) {
      setTimeLeft(null);
      return;
    }

    let remaining = pressureTimerSeconds;
    setTimeLeft(remaining);
    const interval = setInterval(() => {
      remaining -= 1;
      setTimeLeft(Math.max(0, remaining));
      if (remaining <= 0) {
        clearInterval(interval);
        handleTimedOutQuestion();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [
    isPressureSession,
    currentCard,
    isInfoCard,
    showFeedback,
    pressureTimerSeconds,
    currentStep,
    handleTimedOutQuestion,
  ]);

  const handleOptionSelect = (index: number) => {
    if (showFeedback || !currentCard)
      return;
    const cardData = currentCard as any;
    const options = Array.isArray(cardData.options) ? cardData.options : null;
    const answer = typeof cardData.answer === "number" ? cardData.answer : null;
    if (!options || answer === null) return;

    setSelectedOption(index);
    const correct = index === answer;
    const questionText =
      typeof cardData.question === "string" && cardData.question.trim().length > 0
        ? cardData.question
        : `Pergunta ${currentStep + 1}`;
    setFeedbackReason(null);
    setIsCorrect(correct);
    setShowFeedback(true);
    showFeedbackRef.current = true;
    registerCardOutcome(currentCard, correct, questionText);
  };

  const normalizeIds = (list: any[] | undefined) =>
    (list || []).map((opt: any, index) =>
      typeof opt === "string"
        ? opt
        : typeof opt?.id === "string"
        ? opt.id
        : typeof opt?.label === "string"
        ? opt.label
        : `seq-${index}`
    );

  const toggleSequenceItem = (item: string) => {
    if (showFeedback || !isSequenceCard || !currentCard) return;
    const targetOrder =
      (currentCard as any)?.correctOrder?.length
        ? normalizeIds((currentCard as any).correctOrder)
        : normalizeIds((currentCard as any).orderOptions);
    const limit = Math.min(targetOrder?.length ?? 4, 4);
    setSequenceSelection((prev) => {
      const exists = prev.includes(item);
      if (exists) return prev.filter((i) => i !== item);
      if (limit && prev.length >= limit) return prev;
      return [...prev, item];
    });
  };

  const handleSequenceCheck = () => {
    if (!isSequenceCard || !currentCard) return;
    const rawOrder = currentCard.correctOrder?.length
      ? normalizeIds(currentCard.correctOrder as any)
      : sequenceOptions.map((opt) => opt.id);
    if (!rawOrder || !rawOrder.length) return;
    const targetOrder = rawOrder.slice(0, 4);
    if (sequenceSelection.length !== targetOrder.length) return;
    const isSequenceCorrect = sequenceSelection.every(
      (item, idx) => item === targetOrder[idx]
    );

    setIsCorrect(isSequenceCorrect);
    setFeedbackReason(null);
    setShowFeedback(true);
    showFeedbackRef.current = true;
    registerCardOutcome(currentCard, isSequenceCorrect, currentCard.question || undefined);
    setRevealCorrectOrder(false);
  };


  const goToResults = async () => {
    if (!isTrainingMode && paramsModuleId) {
      // Evita travar a navegacao no Android aguardando persistencia.
      void markModuleStage(courseId, paramsModuleId as string, currentStageIndex + 1).catch(() => {});
      if (introModuleId) {
        void markModuleStage(courseId, introModuleId as string, 1).catch(() => {});
        try {
          const userId = auth.currentUser?.uid ?? "anon";
          await AsyncStorage.removeItem(`fastaid:rcpIntroPart1:${userId}`);
        } catch {}
      }
    }
    if (isDoctorMode && paramsModuleId && !SPECIAL_MODULE_IDS.has(paramsModuleId as string)) {
      void markDoctorModuleCompleted(courseId, paramsModuleId as string).catch(() => {});
    }
    const targetPath = isTrainingMode ? "/screens/LessonResultScreen" : "/screens/ChestRewardScreen";
    const finalAnswered = answeredCountRef.current;
    const finalCorrect = correctCountRef.current;
    const startTime = lessonStartTimeRef.current ?? lessonStartTime;
    const accuracy =
      finalAnswered > 0 ? Math.round((finalCorrect / finalAnswered) * 100) : 0;

    let calculatedXp = 10;
    if (isAdaptiveMode) {
      const adaptiveBaseXp = isMonthlySimMode
        ? 70
        : isWeeklyChallengeMode
        ? 40
        : isDailyEmergencyMode
        ? 18
        : isPressureMode
        ? 24
        : 16;
      const adaptiveBonus = Math.round((accuracy / 100) * (isMonthlySimMode ? 18 : 12));
      calculatedXp = adaptiveBaseXp + adaptiveBonus;
    } else if (isModuleReviewMode) {
      calculatedXp = 5;
    } else if (isDoctorMode) {
      const bonus = Math.round((accuracy / 100) * 10);
      calculatedXp = (20 + bonus) * 2;
    } else if (!isTrainingMode) {
      // Faixa de 20 a 30 XP baseado na precisão
      // Base: 20 XP | Bônus: 0 a 10 XP (proporcional à precisão)
      const bonus = Math.round((accuracy / 100) * 10);
      calculatedXp = 20 + bonus;

      // Lógica de Pós-Teste: Salva para TODOS os cursos
      const user = auth.currentUser;
      if (user) {
        await savePostTestResult(user.uid, courseId, {
          score: accuracy,
          totalQuestions: finalAnswered,
          correctCount: finalCorrect,
          mistakes: Math.max(0, finalAnswered - finalCorrect),
          details: resultsLog.current,
          moduleId: (paramsModuleId as string) || "unknown"
        });
      }
    }

    const mistakes = Math.max(0, finalAnswered - finalCorrect);
    const durationSeconds =
      startTime !== null
        ? Math.max(0, Math.round((Date.now() - startTime) / 1000))
        : 0;

    if (isAdaptiveMode) {
      void saveAdaptiveSessionOutcome(courseId, {
        mode: lessonMode,
        eventType: isEventMode ? lessonMode : undefined,
        trackAttempts: adaptiveTrackRef.current,
        skillXpById: adaptiveSkillXpRef.current,
        accuracy,
        answered: finalAnswered,
        durationSeconds,
      }).catch(() => {});
    }

    router.replace({
      pathname: targetPath,
      params: {
        courseId,
        moduleId: (paramsModuleId as string) || "",
        mode: lessonMode,
        xp: String(calculatedXp),
        accuracy: String(accuracy),
        mistakes: String(mistakes),
        answered: String(finalAnswered),
        durationSeconds: String(durationSeconds),
        stageIndex: String(currentStageIndex),
        stageCount: String(stageCount),
      },
    });
  };

  const handleNext = async () => {
    if (isNavigating) return;
    setIsNavigating(true);

    if (currentStep >= questions.length - 1) {
      setShowFeedback(false);
      showFeedbackRef.current = false;
      setSelectedOption(null);
      setIsCorrect(null);
      setRevealCorrectOrder(false);
      setSequenceSelection([]);
      setFeedbackReason(null);
      setTimeLeft(null);
      goToResults();
      return;
    }
    setShowFeedback(false);
    showFeedbackRef.current = false;
    setSelectedOption(null);
    setIsCorrect(null);
    setRevealCorrectOrder(false);
    setSequenceSelection([]);
    setFeedbackReason(null);
    setTimeLeft(null);
    setCurrentStep((step) => step + 1);
  };

  const handleExit = () => {
    router.replace(exitTarget);
  };

  const confirmExit = () => {
    Alert.alert("Sair da lição?", "Tem certeza que deseja sair da lição atual?", [
      { text: "Cancelar", style: "cancel" },
      { text: "Sair", onPress: handleExit },
    ]);
  };

  if (lives <= 0 && !isPremium) {
    return (
      <View style={lessonstyles.completionContainer}>
        <Image
          source={require("../../assets/images/band_chorando.png")}
          style={{ width: 160, height: 160 }}
        />
        <Text style={[lessonstyles.completionTitle, { color: "#FF4B4B" }]}>
          Oh não!
        </Text>
        <Text style={lessonstyles.completionText}>Você ficou sem vidas.</Text>
        <TouchableOpacity style={lessonstyles.restartButton} onPress={handleExit}>
          <Text style={lessonstyles.restartButtonText}>Voltar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!currentCard && !isLoadingLessons) {
    return (
      <View style={lessonstyles.completionContainer}>
        <Image
          source={require("../../assets/images/band_chorando.png")}
          style={{ width: 160, height: 160 }}
        />
        <Text style={[lessonstyles.completionTitle, { color: "#FF4B4B" }]}>
          Oh não!
        </Text>
        <Text style={lessonstyles.completionText}>
          Não foi possível carregar as perguntas.
        </Text>
        <TouchableOpacity style={lessonstyles.restartButton} onPress={handleExit}>
          <Text style={lessonstyles.restartButtonText}>Voltar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!currentCard) {
    return (
      <View style={lessonstyles.completionContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const progress =
    questions.length > 0 ? (currentStep / questions.length) * 100 : 0;

  return (
    <SafeAreaView style={lessonstyles.safeArea} edges={["left", "right", "bottom"]}>
      <View style={lessonstyles.fullScreen}>
        <View
          style={[
            lessonstyles.header,
            { paddingTop: insets.top > 0 ? insets.top : 12 },
          ]}
        >
          <TouchableOpacity onPress={confirmExit}>
            <XIcon />
          </TouchableOpacity>
          <View style={lessonstyles.progressBarContainer}>
            <View style={{ ...lessonstyles.progressBar, width: `${progress}%` }} />
          </View>
          <View style={lessonstyles.livesContainer}>
            <HeartIcon />
            <Text style={lessonstyles.livesText}>{isPremium ? "∞" : lives}</Text>
          </View>
          {isPressureSession && !isInfoCard && timeLeft !== null && !showFeedback && (
            <View
              style={{
                backgroundColor: timeLeft <= 5 ? "#ef4444" : "#2563eb",
                borderRadius: 10,
                paddingHorizontal: 10,
                paddingVertical: 6,
              }}
            >
              <Text style={{ color: "#fff", fontWeight: "800", fontSize: 13 }}>
                {timeLeft}s
              </Text>
            </View>
          )}
        </View>

        <ScrollView contentContainerStyle={lessonstyles.contentContainer}>
          {isLoadingLessons && (
            <ActivityIndicator
              size="small"
              color="#5D9CFB"
              style={{ marginBottom: 16 }}
            />
          )}
          {isInfoCard && (
            <Image
              source={require("../../assets/images/band_lendo.png")}
              style={lessonstyles.lessonMascot}
            />
          )}
          <View style={lessonstyles.card}>
          {activePressureHint && !isInfoCard && (
            <View
              style={{
                backgroundColor: "rgba(37,99,235,0.12)",
                borderRadius: 10,
                paddingHorizontal: 12,
                paddingVertical: 8,
                marginBottom: 14,
                borderWidth: 1,
                borderColor: "rgba(37,99,235,0.35)",
              }}
            >
              <Text
                style={{
                  color: "#1d4ed8",
                  fontWeight: "700",
                  fontSize: 13,
                  textTransform: "uppercase",
                }}
              >
                Pressão: {activePressureHint}
              </Text>
            </View>
          )}
          {isInfoCard ? (
            <View>
              {activeImage && (
                <Image
                  source={activeImage}
                  style={{ width: "100%", height: 150, resizeMode: "contain", marginBottom: 16 }}
                />
              )}
              <Text style={lessonstyles.title}>{currentCard.title}</Text>
              <Text style={lessonstyles.infoText}>{currentCard.text}</Text>
            </View>
          ) : isSequenceCard ? (
            <View>
              {activeImage && (
                <Image
                  source={activeImage}
                  style={{ width: "100%", height: 150, resizeMode: "contain", marginBottom: 16 }}
                />
              )}
              <Text style={lessonstyles.question}>{currentCard.question}</Text>
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
                {sequenceOptions.slice(0, 4).map((option, idx) => {
                  const optionId = option?.id ? String(option.id) : `seq-${idx}`;
                  const targetOrderList =
                    (currentCard?.correctOrder?.length
                      ? normalizeIds(currentCard.correctOrder as any)
                      : sequenceOptions.map((opt) => opt.id)
                    ).slice(0, 4);
                  const selectedIndex = sequenceSelection.indexOf(optionId);
                  const selected = selectedIndex !== -1;
                  const correctIndex = targetOrderList.indexOf(optionId);
                  const isCorrectPosition =
                    selectedIndex !== -1 && selectedIndex === correctIndex;
                  const showCorrectPlacement = revealCorrectOrder && correctIndex !== -1;

                  let badgeNumber: number | null = null;
                  let badgeColor = "#3B82F6";
                  let borderColor = colors.border;

                  if (showCorrectPlacement) {
                    badgeNumber = correctIndex + 1;
                    badgeColor = "#22c55e";
                    borderColor = "#22c55e";
                  } else if (showFeedback) {
                    if (selected) {
                      badgeNumber = selectedIndex + 1;
                      if (isCorrectPosition) {
                        badgeColor = "#22c55e";
                        borderColor = "#22c55e";
                      } else {
                        badgeColor = "#ef4444";
                        borderColor = "#ef4444";
                      }
                    } else {
                      borderColor = colors.border;
                    }
                  } else {
                    if (selected) {
                      badgeNumber = selectedIndex + 1;
                      badgeColor = "#3B82F6";
                      borderColor = "#3B82F6";
                    } else {
                      borderColor = colors.border;
                    }
                  }

                  return (
                    <TouchableOpacity
                      key={optionId}
                      style={[
                        lessonstyles.optionButton,
                        {
                          paddingHorizontal: 8,
                          flexBasis: "48%",
                          minHeight: 200,
                          marginVertical: 4,
                          borderColor,
                          backgroundColor:
                            selected || showCorrectPlacement || showFeedback
                              ? "#0f172a"
                              : "rgba(255,255,255,0.06)",
                          justifyContent: "center",
                          alignItems: "center",
                          gap: 6,
                          shadowColor: "#000",
                          shadowOpacity: 0.2,
                          shadowRadius: 10,
                          shadowOffset: { width: 0, height: 4 },
                          elevation: 4,
                        },
                      ]}
                      onPress={() => toggleSequenceItem(optionId)}
                      disabled={showFeedback}
                    >
                      {badgeNumber !== null && (
                        <View
                          style={{
                            position: "absolute",
                            top: 6,
                            left: 6,
                            width: 22,
                            height: 22,
                            borderRadius: 11,
                            backgroundColor: badgeColor,
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <Text style={{ color: "#fff", fontWeight: "800", fontSize: 12 }}>
                            {badgeNumber}
                          </Text>
                        </View>
                      )}
                      {option.image && (
                        <Image
                          source={option.image}
                          style={{ width: "100%", height: 140, resizeMode: "contain" }}
                        />
                      )}
                      <Text
                        style={[
                          lessonstyles.optionText,
                          {
                            color: selected
                              ? "#3B82F6"
                              : showCorrectPlacement
                              ? "#22c55e"
                              : colors.text,
                            textAlign: "center",
                            paddingTop: option.image ? 4 : 10,
                          },
                        ]}
                        numberOfLines={2}
                      >
                        {option.label || `Passo ${idx + 1}`}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {!showFeedback && (
                <TouchableOpacity
                  style={[
                    lessonstyles.continueButton,
                    {
                      marginTop: 18,
                      opacity:
                        sequenceSelection.length ===
                        Math.min(
                          (currentCard.correctOrder?.length
                            ? normalizeIds(currentCard.correctOrder as any).length
                            : sequenceOptions.length),
                          4
                        )
                          ? 1
                          : 0.5,
                    },
                  ]}
                  onPress={handleSequenceCheck}
                  disabled={
                    showFeedback ||
                    sequenceSelection.length !==
                      Math.min(
                        (currentCard.correctOrder?.length
                          ? normalizeIds(currentCard.correctOrder as any).length
                          : sequenceOptions.length),
                        4
                      )
                  }
                >
                  <Text style={lessonstyles.continueButtonText}>Checar ordem</Text>
                </TouchableOpacity>
              )}
            </View>
          ) : (
            <View>
              {activeImage && (
                <Image
                  source={activeImage}
                  style={{ width: "100%", height: 150, resizeMode: "contain", marginBottom: 16 }}
                />
              )}
              <Text style={lessonstyles.question}>{currentCard.question}</Text>
              {currentCard.options?.map((option, index) => {
                let optionStyle: any = [lessonstyles.optionButton];
                let textStyle: any = [lessonstyles.optionText];
                if (showFeedback) {
                  if (index === currentCard.answer) {
                    optionStyle.push(lessonstyles.correctOption);
                    textStyle.push(lessonstyles.correctOptionText);
                  } else if (index === selectedOption) {
                    optionStyle.push(lessonstyles.incorrectOption);
                    textStyle.push(lessonstyles.incorrectOptionText);
                  } else {
                    optionStyle.push({ opacity: 0.5 });
                  }
                }
                return (
                  <TouchableOpacity
                    key={index}
                    style={optionStyle}
                    onPress={() => handleOptionSelect(index)}
                    disabled={showFeedback}
                  >
                    <Text style={textStyle}>{option}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
          </View>
        </ScrollView>

        <Animated.View
          style={[
            lessonstyles.feedbackContainer,
            {
              backgroundColor:
                isCorrect === null
                  ? colors.background
                  : isCorrect
                  ? colors.backgroundCorrect
                  : colors.backgroundError,
              transform: [{ translateY: feedbackAnim }],
            },
          ]}
        >
          {isInfoCard && !showFeedback && (
            <TouchableOpacity
              style={lessonstyles.continueButton}
              onPress={handleNext}
              disabled={isNavigating}
            >
              <Text style={lessonstyles.continueButtonText}>Continuar</Text>
            </TouchableOpacity>
          )}
          {showFeedback && (
            <View>
              <Text
                style={[
                  lessonstyles.feedbackTitle,
                  { color: isCorrect ? "#58CC02" : "#FF4B4B" },
                ]}
              >
                {isCorrect
                  ? "Excelente!"
                  : feedbackReason === "timeout"
                  ? "Tempo esgotado"
                  : "Resposta Incorreta"}
              </Text>
              {isCorrect && !!currentCard.correctFeedback && (
                <Text style={lessonstyles.infoText}>
                  {currentCard.correctFeedback}
                </Text>
              )}
              {!isCorrect && !!currentCard.incorrectFeedback && (
                <Text style={lessonstyles.infoText}>
                  {currentCard.incorrectFeedback}
                </Text>
              )}
              <TouchableOpacity
                style={[
                  lessonstyles.continueButton,
                  {
                    backgroundColor:
                      isSequenceCard && isCorrect === false && !revealCorrectOrder
                        ? "#2563eb"
                        : isSequenceCard && isCorrect === false && revealCorrectOrder
                        ? "#FF4B4B"
                        : isCorrect
                        ? "#58CC02"
                        : "#FF4B4B",
                  },
                ]}
                onPress={() => {
                  if (isSequenceCard && isCorrect === false && !revealCorrectOrder) {
                    setRevealCorrectOrder(true);
                    return;
                  }
                  handleNext();
                }}
                disabled={isNavigating}
              >
                <Text style={lessonstyles.continueButtonText}>
                  {isSequenceCard && isCorrect === false && !revealCorrectOrder
                    ? "Mostrar a ordem correta"
                    : isCorrect
                    ? currentStep >= questions.length - 1
                      ? "Finalizar"
                      : "Continuar"
                    : "CONTINUAR"}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </Animated.View>
      </View>
    </SafeAreaView>
  );
};



export default LessonScreen;
