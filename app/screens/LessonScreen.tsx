import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
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
import { SafeAreaView } from "react-native-safe-area-context";
import { HeartIcon, XIcon } from "../components/Icons";
import { useTheme } from "../context/ThemeContext";
import { auth, db, doc, getDoc, updateDoc } from "../firebaseConfig";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  fetchCourseModules,
  fetchModuleLessons,
} from "../services/lessonService";
import { markModuleCompleted } from "../services/progressService";
import { LessonCard } from "../types/lesson";
import { applyLifeRegeneration, startLifeCountdown } from "../services/lifeService";

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

const shuffleLessonCards = (data: LessonCard[]): LessonCard[] => {
  if (data.length <= 2) return data;
  const firstTwo = data.slice(0, 2);
  const remaining = data.slice(2);
  return [...firstTwo, ...shuffleArray(remaining)];
};

const getShuffledLesson = (data: LessonCard[]): LessonCard[] => {
  return data.map((card) => {
    if (card.type === "mcq" && card.options && card.answer !== undefined) {
      const correctAnswerString = card.options[card.answer];
      const shuffledOptions = [...card.options].sort(() => 0.5 - Math.random());
      const newAnswerIndex = shuffledOptions.indexOf(correctAnswerString);
      return { ...card, options: shuffledOptions, answer: newAnswerIndex };
    }
    return card;
  });
};

const fallbackCourseId = "burns";

const LessonScreen = () => {
    const {  lessonstyles, colors } = useTheme();
 
  const router = useRouter();
  const {
    courseId: paramsCourseId,
    moduleId: paramsModuleId,
    mode,
    introModuleId,
  } = useLocalSearchParams<{
    courseId?: string;
    moduleId?: string;
    mode?: string;
    introModuleId?: string;
  }>();

  const isPracticeMode = mode === "practice";
  const courseId = (paramsCourseId as string) || fallbackCourseId;

  const [userXP, setUserXP] = useState(1200);
  const [isPremium, setIsPremium] = useState(false);

  const [currentStep, setCurrentStep] = useState(0);
  const [questions, setQuestions] = useState<LessonCard[]>(
    getShuffledLesson(demoLesson)
  );
  const [correctCount, setCorrectCount] = useState(0);
  const [answeredCount, setAnsweredCount] = useState(0);
  const [lessonStartTime, setLessonStartTime] = useState<number | null>(null);
  const correctCountRef = useRef(0);
  const answeredCountRef = useRef(0);
  const lessonStartTimeRef = useRef<number | null>(null);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isLoadingLessons, setIsLoadingLessons] = useState(true);
  const [lives, setLives] = useState(5);
  const [lastLifeUpdate, setLastLifeUpdate] = useState<number | null>(null);
  const [isNavigating, setIsNavigating] = useState(false);

  useEffect(() => {
    setIsNavigating(false);
  }, [currentStep]);

  useEffect(() => {
    const loadInitialData = async () => {
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
          setIsPremium(Boolean((userData as any).isPremium));
        }
      }
    };

    const loadLessons = async () => {
      setIsLoadingLessons(true);
      try {
        let deck: any[] = [];
        if (isPracticeMode) {
          const modules = await fetchCourseModules(courseId);
          const aggregated = modules.flatMap((module) => module.lessons ?? []);
          const practiceOnly = aggregated.filter(
            (card) =>
              Array.isArray(card.options) &&
              card.options.length > 0 &&
              typeof card.answer === "number"
          );
          deck = practiceOnly.length ? practiceOnly : aggregated;
        } else if (paramsModuleId) {
          deck = await fetchModuleLessons(courseId, paramsModuleId as string);
        }
        const mappedDeck = deck.map(card => ({
          ...card,
          correctFeedback: card.FeedbackCorreto || card.correctFeedback,
          incorrectFeedback: card.FeedbackIncorreto || card.incorrectFeedback,
        }));

        const finalDeck = mappedDeck.length ? mappedDeck : demoLesson;

        const randomizedDeck = shuffleLessonCards(finalDeck);
        correctCountRef.current = 0;
        answeredCountRef.current = 0;
        lessonStartTimeRef.current = Date.now();
        setCorrectCount(0);
        setAnsweredCount(0);
        setLessonStartTime(lessonStartTimeRef.current);
        setQuestions(getShuffledLesson(randomizedDeck));
        setCurrentStep(0);
        setSelectedOption(null);
        setIsCorrect(null);
        setShowFeedback(false);
      } catch (error) {
        console.warn("Erro ao carregar a lição:", error);
        setQuestions(getShuffledLesson(demoLesson));
      } finally {
        setIsLoadingLessons(false);
      }
    };
    loadInitialData(); 
    loadLessons(); 
  }, [courseId, paramsModuleId, isPracticeMode]);

  const exitTarget = isPracticeMode
    ? "/(tabs)/PracticeScreen"
    : "/(tabs)/CourseScreen";
  const xpReward = isPracticeMode ? 10 : 20;

  const feedbackAnim = useRef(new Animated.Value(200)).current;
  const currentCard = questions[currentStep];
  const isInfoCard = currentCard?.type === "info";

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
  }, [showFeedback, currentStep, isInfoCard]);

  const decrementLive = () => {
    const user = auth.currentUser;
    if (user && !isPremium) {
      const newLives = Math.max(0, lives - 1);
      setLives(newLives);
      const userDocRef = doc(db, "users", user.uid);
      void updateDoc(userDocRef, {
        lives: newLives,
        vidas: newLives,
        lastLifeUpdate: startLifeCountdown(),
      }).catch(error => console.error("Failed to update lives:", error));
      setLastLifeUpdate(Date.now());
    }
  };

  const handleOptionSelect = (index: number) => {
    if (showFeedback || !currentCard || currentCard.answer === undefined)
      return;
    setSelectedOption(index);
    const correct = index === currentCard.answer;
    setIsCorrect(correct);
    setShowFeedback(true);
    answeredCountRef.current += 1;
    if (correct) correctCountRef.current += 1;
    setAnsweredCount((value) => value + 1);
    if (correct) setCorrectCount((value) => value + 1);
    if (!correct) void decrementLive();
  };


  const goToResults = async () => {
    if (!isPracticeMode && paramsModuleId) {
      // Evita travar a navega??o no Android aguardando persist?ncia.
      void markModuleCompleted(courseId, paramsModuleId as string).catch(() => {});
      if (introModuleId) {
        void markModuleCompleted(courseId, introModuleId as string).catch(() => {});
        try {
          const userId = auth.currentUser?.uid ?? "anon";
          await AsyncStorage.removeItem(`fastaid:rcpIntroPart1:${userId}`);
        } catch {}
      }
    }
    const targetPath = isPracticeMode ? "/screens/LessonResultScreen" : "/screens/ChestRewardScreen";
    const finalAnswered = answeredCountRef.current;
    const finalCorrect = correctCountRef.current;
    const startTime = lessonStartTimeRef.current ?? lessonStartTime;
    const accuracy =
      finalAnswered > 0 ? Math.round((finalCorrect / finalAnswered) * 100) : 100;
    const mistakes = Math.max(0, finalAnswered - finalCorrect);
    const durationSeconds =
      startTime !== null
        ? Math.max(0, Math.round((Date.now() - startTime) / 1000))
        : 0;
    router.replace({
      pathname: targetPath,
      params: {
        courseId,
        moduleId: (paramsModuleId as string) || "",
        mode: isPracticeMode ? "practice" : "course",
        xp: String(xpReward),
        accuracy: String(accuracy),
        mistakes: String(mistakes),
        answered: String(finalAnswered),
        durationSeconds: String(durationSeconds),
      },
    });
  };

  const handleNext = async () => {
    if (isNavigating) return;
    setIsNavigating(true);

    if (currentStep >= questions.length - 1) {
      setShowFeedback(false);
      setSelectedOption(null);
      setIsCorrect(null);
      goToResults();
      return;
    }
    setShowFeedback(false);
    setSelectedOption(null);
    setIsCorrect(null);
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

  if ((lives <= 0 && !isPremium) || !currentCard) {
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

  const progress =
    questions.length > 0 ? (currentStep / questions.length) * 100 : 0;

  return (
    <SafeAreaView style={lessonstyles.safeArea}>
      <View style={lessonstyles.fullScreen}>
        <View style={lessonstyles.header}>
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
          {isInfoCard ? (
              <View>
                <Text style={lessonstyles.title}>{currentCard.title}</Text>
                <Text style={lessonstyles.infoText}>{currentCard.text}</Text>
              </View>
            ) : (
              <View>
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
                {isCorrect ? "Excelente!" : "Resposta Incorreta"}
              </Text>
              <Text style={lessonstyles.infoText}>
                {isCorrect
                  ? currentCard.correctFeedback
                  : currentCard.incorrectFeedback}
              </Text>
              <TouchableOpacity
                style={[
                  lessonstyles.continueButton,
                  { backgroundColor: isCorrect ? "#58CC02" : "#FF4B4B" },
                ]}
                onPress={handleNext}
                disabled={isNavigating}
              >
                <Text style={lessonstyles.continueButtonText}>
                  {currentStep >= questions.length - 1
                    ? "Finalizar"
                    : "Continuar"}
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
