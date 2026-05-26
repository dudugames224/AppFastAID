import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../context/ThemeContext";
import { fetchCoursesMeta, RemoteCourseMeta } from "../services/lessonService";
import {
  getCompletedModules,
  getReviewCards,
} from "../services/progressService";

type ReviewStatus = {
  unlocked: boolean;
  mistakes: number;
};

const SPECIAL_MODULE_IDS = new Set([
  "course-intro",
  "review-cards",
  "reset-course-action",
]);

const PracticeScreen = () => {
  const { styles, colors } = useTheme();
  const router = useRouter();
  const [courses, setCourses] = useState<RemoteCourseMeta[]>([]);
  const [loading, setLoading] = useState(true);
  const [modeModalVisible, setModeModalVisible] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<RemoteCourseMeta | null>(null);
  const [reviewStatusByCourse, setReviewStatusByCourse] = useState<Record<string, ReviewStatus>>(
    {}
  );

  const openModePicker = (course: RemoteCourseMeta) => {
    setSelectedCourse(course);
    setModeModalVisible(true);
  };

  const closeModePicker = () => {
    setModeModalVisible(false);
    setSelectedCourse(null);
  };

  const startLessonMode = (mode: string) => {
    if (!selectedCourse) return;
    const courseId = selectedCourse.id;
    closeModePicker();
    router.push({
      pathname: "/screens/LessonScreen",
      params: { courseId, mode },
    });
  };

  const startHardQuiz = () => {
    startLessonMode("practice");
  };

  const startReviewMode = () => {
    if (!selectedCourse) return;
    const courseId = selectedCourse.id;
    const reviewStatus = reviewStatusByCourse[courseId] || {
      unlocked: false,
      mistakes: 0,
    };

    if (!reviewStatus.unlocked) {
      Alert.alert(
        "Revisão bloqueada",
        "Conclua ao menos a primeira lição deste curso para liberar a revisão."
      );
      return;
    }

    if (reviewStatus.mistakes <= 0) {
      Alert.alert(
        "Sem erros para revisar",
        "Você ainda não tem perguntas erradas neste curso."
      );
      return;
    }

    startLessonMode("review");
  };

  useFocusEffect(
    useCallback(() => {
      let mounted = true;

      const loadCourses = async () => {
        setLoading(true);
        try {
          const data = await fetchCoursesMeta();
          if (!mounted) return;
          setCourses(data);

          const statusEntries = await Promise.all(
            data.map(async (course) => {
              const [completedModules, reviewCards] = await Promise.all([
                getCompletedModules(course.id),
                getReviewCards(course.id),
              ]);

              const unlocked = completedModules.some(
                (moduleId) => !SPECIAL_MODULE_IDS.has(moduleId)
              );
              return [
                course.id,
                {
                  unlocked,
                  mistakes: reviewCards.length,
                },
              ] as const;
            })
          );

          if (mounted) {
            setReviewStatusByCourse(Object.fromEntries(statusEntries));
          }
        } finally {
          if (mounted) {
            setLoading(false);
          }
        }
      };

      loadCourses();

      return () => {
        mounted = false;
      };
    }, [])
  );

  const selectedStatus = selectedCourse
    ? reviewStatusByCourse[selectedCourse.id] || {
        unlocked: false,
        mistakes: 0,
      }
    : { unlocked: false, mistakes: 0 };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView style={styles.tabContainer} contentContainerStyle={{ paddingBottom: 30 }}>
        <Image
          source={require("../../assets/images/band_halter.png")}
          style={{ width: 140, height: 140, alignSelf: "center" }}
        />
        <Text style={styles.titulo}>PRATICAR</Text>

        {loading && (
          <ActivityIndicator
            style={{ marginTop: 24 }}
            size="small"
            color="#5D9CFB"
          />
        )}

        {!loading &&
          courses.map((course) => (
            <TouchableOpacity
              key={course.id}
              style={styles.courseCard}
              activeOpacity={0.85}
              onPress={() => openModePicker(course)}
            >
              <Image source={course.iconSource} style={styles.courseTopicIconImage} />
              <View style={{ flex: 1 }}>
                <Text style={styles.courseTitle}>{course.title}</Text>
              </View>
            </TouchableOpacity>
          ))}
      </ScrollView>

      <Modal
        visible={modeModalVisible}
        // ANIMACAO: fade nativo do Modal ao abrir/fechar a escolha de pratica.
        animationType="fade"
        transparent
        onRequestClose={closeModePicker}
      >
        <TouchableOpacity
          activeOpacity={1}
          onPressOut={closeModePicker}
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.6)",
            justifyContent: "center",
            padding: 24,
          }}
        >
          <View
            style={{
              backgroundColor: colors.background,
              borderRadius: 16,
              padding: 20,
              gap: 12,
              maxHeight: "90%",
            }}
          >
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text
                style={{
                  color: colors.primary,
                  fontWeight: "bold",
                  fontSize: 23,
                  textAlign: "center",
                  marginBottom: 6,
                }}
              >
                {selectedCourse?.title || "PRATICA"}
              </Text>

              <TouchableOpacity
                style={{
                  backgroundColor: colors.card,
                  borderRadius: 12,
                  paddingVertical: 14,
                  paddingHorizontal: 16,
                  borderWidth: 1,
                  borderColor: colors.border,
                  marginBottom: 10,
                }}
                onPress={startHardQuiz}
              >
                <Text style={{ color: colors.text, fontWeight: "700", fontSize: 16 }}>
                  Quiz difícil
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={{
                  backgroundColor: colors.card,
                  borderRadius: 12,
                  paddingVertical: 14,
                  paddingHorizontal: 16,
                  borderWidth: 1,
                  borderColor: colors.border,
                  opacity: selectedStatus.unlocked ? 1 : 0.5,
                  marginBottom: 8,
                }}
                onPress={startReviewMode}
                disabled={!selectedStatus.unlocked}
              >
                <Text style={{ color: colors.text, fontWeight: "700", fontSize: 16 }}>
                  Revisar conteúdo ({selectedStatus.mistakes})
                </Text>
              </TouchableOpacity>

            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
};

export default PracticeScreen;
