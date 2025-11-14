import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { HeartIcon, XIcon } from "../components/Icons";
import {
  fetchCourseModules,
  fetchModuleLessons,
} from "../services/lessonService";
import { markModuleCompleted } from "../services/progressService";
import { LessonCard } from "../types/lesson";

// Demo: lição simples só para visual
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
  const router = useRouter();
  const {
    courseId: paramsCourseId,
    moduleId: paramsModuleId,
    mode,
  } = useLocalSearchParams<{
    courseId?: string;
    moduleId?: string;
    mode?: string;
  }>();

  const isPracticeMode = mode === "practice";
  const courseId = (paramsCourseId as string) || fallbackCourseId;

  const [userXP, setUserXP] = useState(1200);
  const [lives, setLives] = useState(5);
  const isPremium = false;

  const [currentStep, setCurrentStep] = useState(0);
  const [questions, setQuestions] = useState<LessonCard[]>(
    getShuffledLesson(demoLesson)
  );
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isLoadingLessons, setIsLoadingLessons] = useState(true);

  useEffect(() => {
    const loadLessons = async () => {
      setIsLoadingLessons(true);
      setLives(5);
      try {
        let deck: LessonCard[] = [];
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
        const finalDeck = deck.length ? deck : demoLesson;
        const randomizedDeck = shuffleLessonCards(finalDeck);
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
    loadLessons();
  }, [courseId, paramsModuleId, isPracticeMode]);

  const exitTarget = isPracticeMode
    ? "/(tabs)/PracticeScreen"
    : "/(tabs)/CourseScreen";
  const xpReward = isPracticeMode ? 15 : 20;

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

  const handleOptionSelect = (index: number) => {
    if (showFeedback || !currentCard || currentCard.answer === undefined)
      return;
    setSelectedOption(index);
    const correct = index === currentCard.answer;
    setIsCorrect(correct);
    setShowFeedback(true);
    if (correct) setUserXP((xp) => xp + 10);
    else setLives((l) => l - 1);
  };

  const goToResults = async () => {
    if (!isPracticeMode && paramsModuleId) {
      await markModuleCompleted(courseId, paramsModuleId as string);
    }
    router.replace({
      pathname: "/screens/LessonResultScreen",
      params: {
        courseId,
        moduleId: (paramsModuleId as string) || "",
        mode: isPracticeMode ? "practice" : "course",
        xp: String(xpReward),
      },
    });
  };

  const handleNext = async () => {
    if (currentStep >= questions.length - 1) {
      setShowFeedback(false);
      setSelectedOption(null);
      setIsCorrect(null);
      await goToResults();
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
      <View style={styles.completionContainer}>
        <Image
          source={require("../../assets/images/band_chorando.png")}
          style={{ width: 160, height: 160 }}
        />
        <Text style={[styles.completionTitle, { color: "#FF4B4B" }]}>
          Oh não!
        </Text>
        <Text style={styles.completionText}>Você ficou sem vidas.</Text>
        <TouchableOpacity style={styles.restartButton} onPress={handleExit}>
          <Text style={styles.restartButtonText}>Voltar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const progress =
    questions.length > 0 ? (currentStep / questions.length) * 100 : 0;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.fullScreen}>
        <View style={styles.header}>
          <TouchableOpacity onPress={confirmExit}>
            <XIcon />
          </TouchableOpacity>
          <View style={styles.progressBarContainer}>
            <View style={{ ...styles.progressBar, width: `${progress}%` }} />
          </View>
          <View style={styles.livesContainer}>
            <HeartIcon />
            <Text style={styles.livesText}>{isPremium ? "∞" : lives}</Text>
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.contentContainer}>
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
              style={styles.lessonMascot}
            />
          )}
          <View style={styles.card}>
          {isInfoCard ? (
              <View>
                <Text style={styles.title}>{currentCard.title}</Text>
                <Text style={styles.infoText}>{currentCard.text}</Text>
              </View>
            ) : (
              <View>
                <Text style={styles.question}>{currentCard.question}</Text>
                {currentCard.options?.map((option, index) => {
                  let optionStyle: any = [styles.optionButton];
                  let textStyle: any = [styles.optionText];
                  if (showFeedback) {
                    if (index === currentCard.answer) {
                      optionStyle.push(styles.correctOption);
                      textStyle.push(styles.correctOptionText);
                    } else if (index === selectedOption) {
                      optionStyle.push(styles.incorrectOption);
                      textStyle.push(styles.incorrectOptionText);
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
            styles.feedbackContainer,
            {
              backgroundColor:
                isCorrect === null
                  ? "#121212"
                  : isCorrect
                  ? "#1A331C"
                  : "#392323",
              transform: [{ translateY: feedbackAnim }],
            },
          ]}
        >
          {isInfoCard && !showFeedback && (
            <TouchableOpacity style={styles.continueButton} onPress={handleNext}>
              <Text style={styles.continueButtonText}>Continuar</Text>
            </TouchableOpacity>
          )}
          {showFeedback && (
            <View>
              <Text
                style={[
                  styles.feedbackTitle,
                  { color: isCorrect ? "#58CC02" : "#FF4B4B" },
                ]}
              >
                {isCorrect ? "Excelente!" : "Resposta Incorreta"}
              </Text>
              <Text style={styles.infoText}>
                {isCorrect
                  ? currentCard.correctFeedback
                  : currentCard.incorrectFeedback}
              </Text>
              <TouchableOpacity
                style={[
                  styles.continueButton,
                  { backgroundColor: isCorrect ? "#58CC02" : "#FF4B4B" },
                ]}
                onPress={handleNext}
              >
                <Text style={styles.continueButtonText}>
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

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#121212" },
  fullScreen: { flex: 1, backgroundColor: "#121212" },
  header: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#2D2D2D",
    gap: 15,
  },
  progressBarContainer: {
    flex: 1,
    height: 16,
    backgroundColor: "#333",
    borderRadius: 8,
    overflow: "hidden",
  },
  progressBar: { height: 16, backgroundColor: "#0eb6f8ff", borderRadius: 8 },
  livesContainer: { flexDirection: "row", alignItems: "center", gap: 5 },
  livesText: { color: "#EF4444", fontWeight: "bold", fontSize: 18 },
  contentContainer: { flexGrow: 1, justifyContent: "center", padding: 20 },
  card: {
    backgroundColor: "#1E1E1E",
    borderRadius: 20,
    padding: 25,
    width: "100%",
    minHeight: 300,
    justifyContent: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#EAEAEA",
    marginBottom: 15,
    textAlign: "center",
  },
  infoText: {
    fontSize: 18,
    color: "#A9A9A9",
    lineHeight: 28,
    textAlign: "center",
  },
  question: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#EAEAEA",
    marginBottom: 30,
    textAlign: "center",
  },
  lessonMascot: {
    width: 140,
    height: 140,
    alignSelf: "center",
    marginBottom: 20,
  },
  optionButton: {
    borderWidth: 2,
    borderColor: "#444",
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    width: "100%",
    backgroundColor: "#1E1E1E",
  },
  optionText: { fontSize: 18, fontWeight: "600", color: "#EAEAEA" },
  correctOption: { backgroundColor: "#58CC02", borderColor: "#58A700" },
  correctOptionText: { color: "#FFFFFF" },
  incorrectOption: { backgroundColor: "#FF4B4B", borderColor: "#EA2B2B" },
  incorrectOptionText: { color: "#FFFFFF" },
  feedbackContainer: {
    paddingHorizontal: 30,
    paddingBottom: 20,
    paddingTop: 10,
    borderTopWidth: 2,
    borderTopColor: "#2D2D2D",
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
  },
  feedbackTitle: { fontSize: 22, fontWeight: "bold", marginBottom: 5 },
  continueButton: {
    backgroundColor: "#3B82F6",
    borderRadius: 12,
    padding: 18,
    marginTop: 15,
    alignItems: "center",
  },
  continueButtonText: { color: "#FFFFFF", fontSize: 18, fontWeight: "bold" },
  completionContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#121212",
  },
  completionTitle: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#5D9CFB",
    marginBottom: 10,
    textAlign: "center",
  },
  completionText: {
    fontSize: 18,
    color: "#A9A9A9",
    marginBottom: 30,
    textAlign: "center",
  },
  restartButton: {
    backgroundColor: "#3B82F6",
    borderRadius: 12,
    paddingVertical: 18,
    paddingHorizontal: 50,
  },
  restartButtonText: { color: "#FFFFFF", fontSize: 18, fontWeight: "bold" },
});

export default LessonScreen;
