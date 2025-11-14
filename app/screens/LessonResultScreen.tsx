import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity
} from "react-native";
import { useTheme } from "../context/ThemeContext";
import { auth, db, doc, getDoc, setDoc } from "../firebaseConfig.js";
import { fetchCourseModules, RemoteModule } from "../services/lessonService";




// Simples substituto visual do Character
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
      marginBottom: 40,
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
  });


  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 4,
        useNativeDriver: true,
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

  const updateXpAndExit = async () => {
    const user = auth.currentUser;
    if (user && currentUserData) {
      const userDocRef = doc(db, "users", user.uid);
      const newXp = (currentUserData.xp || 0) + computedXp;
      await setDoc(userDocRef, { xp: newXp }, { merge: true });
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
        {computedIsPractice ? "Prática Concluída!" : "Módulo Concluído!"}
      </Text>
      <Text style={styles.subtitle}>
        Você ganhou {computedXp} XP e está mais perto de se tornar um herói!
      </Text>

      {showNextButton && (
        <TouchableOpacity
          style={[styles.button, { marginBottom: 10 }]}
          onPress={handleNextPress}
        >
          <Text style={styles.buttonText}>Próximo Módulo</Text>
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
