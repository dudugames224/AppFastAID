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
    const {  lessonstyles, colors } = useTheme();
 
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
            <TouchableOpacity style={lessonstyles.continueButton} onPress={handleNext}>
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
