import { Ionicons } from "@expo/vector-icons";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Modal,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../context/ThemeContext";
import { Sair } from "../firebaseConfig.js";
import {
  fetchCourseModules,
  fetchCoursesMeta,
  RemoteCourseMeta,
  RemoteModule,
} from "../services/lessonService";
import { getCompletedModules } from "../services/progressService";
import { CircleIcon, FlaskIcon, ThermometerIcon, ZapIcon } from "../components/Icons";

const moduleIconMap: Record<string, React.ComponentType<any>> = {
  FlaskIcon,
  ThermometerIcon,
  ZapIcon,
};

const getModuleIcon = (identifier: unknown) => {
  if (typeof identifier === "string" && moduleIconMap[identifier]) {
    return moduleIconMap[identifier];
  }
  return null;
};

const CourseScreen: React.FC = () => {
  const [courses, setCourses] = useState<RemoteCourseMeta[]>([]);
  const [modules, setModules] = useState<RemoteModule[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [coursesLoading, setCoursesLoading] = useState(true);
  const [modulesLoading, setModulesLoading] = useState(false);
  const [courseProgress, setCourseProgress] = useState<string[]>([]);
  const router = useRouter();
  const [panicVisible, setPanicVisible] = useState(false);
  const [courseModalVisible, setCourseModalVisible] = useState(false);

  const { styles, colors, currentTheme, setCurrentTheme, panicStyles } =
    useTheme();

  const currentCourse = useMemo(
    () => courses.find((course) => course.id === selectedCourseId),
    [courses, selectedCourseId]
  );

  useEffect(() => {
    const loadCourses = async () => {
      setCoursesLoading(true);
      const data = await fetchCoursesMeta();
      setCourses(data);
      setSelectedCourseId((prev) => prev ?? data[0]?.id ?? null);
      setCoursesLoading(false);
    };
    loadCourses();
  }, []);

  useEffect(() => {
    const loadModules = async () => {
      if (!selectedCourseId) {
        setModules([]);
        setCourseProgress([]);
        return;
      }
      setModulesLoading(true);
      const data = await fetchCourseModules(selectedCourseId);
      setModules(data);
      const progress = await getCompletedModules(selectedCourseId);
      setCourseProgress(progress);
      setModulesLoading(false);
    };
    loadModules();
  }, [selectedCourseId]);

  useFocusEffect(
    useCallback(() => {
      const syncProgress = async () => {
        if (!selectedCourseId) return;
        const progress = await getCompletedModules(selectedCourseId);
        setCourseProgress(progress);
      };
      syncProgress();
    }, [selectedCourseId])
  );

  const courseOptions = useMemo(() => courses, [courses]);

  function logout() {
    Sair();
    router.replace("/screens/login");
  }

  function startModule(moduleId: string) {
    if (!selectedCourseId) return;
    router.push({
      pathname: "/screens/LessonScreen",
      params: { courseId: selectedCourseId, moduleId },
    });
  }

  const handleCourseSelect = (courseId: string) => {
    setSelectedCourseId(courseId);
    setCourseModalVisible(false);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={{ alignItems: "center" }}
      >
        <Image
          source={require("../../assets/images/band.png")}
          style={styles.character}
        />

        <View style={styles.streakLossContainer}>
          <Text style={styles.streakLossTitle}>Ofensiva perdida!</Text>
          <Text style={styles.streakLossText}>
            Complete uma lição hoje para começar uma nova ofensiva.
          </Text>
        </View>

        <TouchableOpacity
          style={styles.topicHeader}
          activeOpacity={0.85}
          onPress={() => setCourseModalVisible(true)}
          disabled={coursesLoading}
        >
          {currentCourse ? (
            <Image
              source={currentCourse.iconSource}
              style={styles.topicIconImage}
            />
          ) : (
            <View style={[styles.topicIcon, { backgroundColor: "#333" }]} />
          )}
          <Text style={styles.courseTitle}>
            {currentCourse ? currentCourse.title : "Carregando..."}
          </Text>
          <Text style={styles.chevron}>⌄</Text>
        </TouchableOpacity>

        <View style={styles.lessonPath}>
          {modulesLoading && (
            <ActivityIndicator size="small" color="#5D9CFB" />
          )}
          {!modulesLoading &&
            modules.map((m, index) => {
              const isCompleted = courseProgress.includes(m.id);
              const previousModuleId = modules[index - 1]?.id;
              const previousCompleted =
                index === 0 ||
                (previousModuleId
                  ? courseProgress.includes(previousModuleId)
                  : false);
              const locked = !previousCompleted;
              const labelColor = locked ? "#777" : colors.text;
              const circleColor = locked ? colors.circle : m.color || "#3B82F6";
              const ModuleIcon = getModuleIcon(m.icon);

              return (
                <React.Fragment key={m.id}>
                  <TouchableOpacity
                    style={styles.unitButton}
                    activeOpacity={0.8}
                    disabled={locked}
                    onPress={() => !locked && startModule(m.id)}
                  >
                    <View
                      style={[
                        styles.unitIconContainer,
                        { backgroundColor: circleColor },
                      ]}
                    >
                      {isCompleted ? (
                        <FontAwesome
                          name="check"
                          size={30}
                          color={colors.background}
                        />
                      ) : locked ? (
                        <FontAwesome name="lock" size={30} color="black" />
                      ) : ModuleIcon ? (
                        <ModuleIcon color={colors.background} size={30} />
                      ) : (
                        <CircleIcon color={colors.background} size={30} />
                      )}
                    </View>
                    <Text style={[styles.unitLabel, { color: labelColor }]}>
                      {m.title}
                    </Text>
                  </TouchableOpacity>
                  {index < modules.length - 1 && (
                    <View style={styles.pathConnector} />
                  )}
                </React.Fragment>
              );
            })}

          <TouchableOpacity style={styles.unitButton} onPress={logout}>
            <Text style={[styles.unitLabel, { color: "#FF4B4B" }]}>SAIR</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.unitButton}
            onPress={() =>
              setCurrentTheme(currentTheme === "light" ? "dark" : "light")
            }
          >
            <Text style={[styles.unitLabel, { color: "#FF4B4B" }]}>
              Trocar Tema
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <View style={styles.sosButton} pointerEvents="box-none">
        <TouchableOpacity
          style={styles.sosTouchable}
          activeOpacity={0.9}
          onPress={() => setPanicVisible(true)}
        >
          <Ionicons name="warning" size={30} color="#fff" />
        </TouchableOpacity>
      </View>
      <Modal
        visible={panicVisible}
        animationType="fade"
        transparent
        onRequestClose={() => setPanicVisible(false)}
      >
        <View style={panicStyles.centerBackdrop}>
          <View style={panicStyles.card}>
            <View style={panicStyles.cardHeader}>
              <Ionicons name="warning" size={22} color="#fff" />
              <Text style={panicStyles.cardTitle}>Modo Pânico</Text>
              <TouchableOpacity
                onPress={() => setPanicVisible(false)}
                style={panicStyles.cardClose}
              >
                <Ionicons name="close" size={18} color="#fff" />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={panicStyles.option}
              activeOpacity={0.9}
              onPress={() => {
                setPanicVisible(false);
                router.push("/screens/RCP");
              }}
            >
              <View style={panicStyles.optionIconCircle}>
                <Ionicons name="medkit" size={20} color="#FF4B4B" />
              </View>
              <Text style={panicStyles.optionLabel}>RCP (Reanimação)</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      <Modal
        visible={courseModalVisible}
        animationType="fade"
        transparent
        onRequestClose={() => setCourseModalVisible(false)}
      >
        <TouchableOpacity
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.6)",
            justifyContent: "center",
            padding: 24,
          }}
          activeOpacity={1}
          onPressOut={() => setCourseModalVisible(false)}
        >
          <View
            style={{
              backgroundColor: "#1E1E1E",
              borderRadius: 16,
              padding: 20,
              gap: 12,
            }}
          >
            <Text
              style={{
                color: "#FFFFFF",
                fontWeight: "bold",
                fontSize: 18,
                textAlign: "center",
                marginBottom: 8,
              }}
            >
              Escolha um curso
            </Text>
          {courseOptions.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={{
                flexDirection: "row",
                alignItems: "center",
                  gap: 12,
                  paddingVertical: 10,
                  borderRadius: 10,
                  backgroundColor:
                    item.id === selectedCourseId ? "#2A2A2A" : "transparent",
                }}
                onPress={() => handleCourseSelect(item.id)}
              >
                <Image
                  source={item.iconSource}
                  style={{ width: 40, height: 40, borderRadius: 10 }}
                />
                <Text style={{ color: "#FFFFFF", fontWeight: "600" }}>
                  {item.title}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
};

export default CourseScreen;
