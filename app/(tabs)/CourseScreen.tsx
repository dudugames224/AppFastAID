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
  Animated,
  Easing,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Circle } from "react-native-svg";
import { CircleIcon, FlaskIcon, ThermometerIcon, ZapIcon } from "../components/Icons";
import { useTheme } from "../context/ThemeContext";
import { auth, getUserData } from "../firebaseConfig";
import {
  fetchCourseModules,
  fetchCoursesMeta,
  RemoteCourseMeta,
  RemoteModule,
} from "../services/lessonService";
import { getCompletedModules } from "../services/progressService";

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
  const LAST_COURSE_KEY = "fastaid:lastCourseId";
  const [courses, setCourses] = useState<RemoteCourseMeta[]>([]);
  const [modules, setModules] = useState<RemoteModule[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [coursesLoading, setCoursesLoading] = useState(true);
  const [modulesLoading, setModulesLoading] = useState(false);
  const [courseProgress, setCourseProgress] = useState<string[]>([]);
  const [rcpIntroHalf, setRcpIntroHalf] = useState(false);
  const router = useRouter();
  const [panicVisible, setPanicVisible] = useState(false);
  const [courseModalVisible, setCourseModalVisible] = useState(false);
  const [streakLost, setStreakLost] = useState(false);

  const { styles, colors, panicStyles } = useTheme();

  const currentCourse = useMemo(
    () => courses.find((course) => course.id === selectedCourseId),
    [courses, selectedCourseId]
  );

  useEffect(() => {
    const checkStreak = async () => {
      const userData = await getUserData();
      if (userData && userData.lastLessonDate) {
        const today = new Date();
        const lastLessonDate = new Date(userData.lastLessonDate);

        const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const lastLessonStart = new Date(lastLessonDate.getFullYear(), lastLessonDate.getMonth(), lastLessonDate.getDate());

        const diffTime = todayStart.getTime() - lastLessonStart.getTime();
        const diffDays = diffTime / (1000 * 60 * 60 * 24);
        if (diffDays > 1) {
          setStreakLost(true);
        } else {
          setStreakLost(false);
        }
      }
    };

    const loadCourses = async () => {
      setCoursesLoading(true);
      const data = await fetchCoursesMeta();
      setCourses(data);
      try {
        const stored = await AsyncStorage.getItem(LAST_COURSE_KEY);
        const validStored = stored && data.find((c) => c.id === stored);
        setSelectedCourseId((prev) => prev ?? validStored?.id ?? data[0]?.id ?? null);
      } catch {
        setSelectedCourseId((prev) => prev ?? data[0]?.id ?? null);
      }
      setCoursesLoading(false);
    };
    checkStreak();
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
      try {
        const userId = auth.currentUser?.uid ?? "anon";
        const halfFlag = await AsyncStorage.getItem(`fastaid:rcpIntroPart1:${userId}`);
        setRcpIntroHalf(halfFlag === "1" && !progress.includes("rcp-intro"));
      } catch {
        setRcpIntroHalf(false);
      }
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
        if (progress.includes("rcp-intro")) {
          try {
            const userId = auth.currentUser?.uid ?? "anon";
            await AsyncStorage.removeItem(`fastaid:rcpIntroPart1:${userId}`);
            setRcpIntroHalf(false);
          } catch {}
        }
      };
      syncProgress();
    }, [selectedCourseId])
  );

  const courseOptions = useMemo(() => courses, [courses]);
  const isFirstAidCourse = useMemo(
    () =>
      selectedCourseId === "primeirosSocorros" ||
      selectedCourseId === "firstAid" ||
      selectedCourseId === "queimaduras" ||
      selectedCourseId === "burns",
    [selectedCourseId]
  );

  function startModule(moduleId: string, index: number) {
    if (!selectedCourseId) return;
    void AsyncStorage.setItem(LAST_COURSE_KEY, selectedCourseId).catch(() => {});
    if (isFirstAidCourse && index === 0) {
      router.push({
        pathname: "/screens/RCPIntroScreen",
        params: {
          courseId: selectedCourseId,
          moduleId,
          nextModuleId: moduleId,
        },
      });
      return;
    }
    router.push({
      pathname: "/screens/LessonScreen",
      params: { courseId: selectedCourseId, moduleId },
    });
  }

  const handleCourseSelect = (courseId: string) => {
    setSelectedCourseId(courseId);
    void AsyncStorage.setItem(LAST_COURSE_KEY, courseId).catch(() => {});
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
          style={[styles.character, { marginBottom:0,paddingEnd:0}]}
        />
        <Text style={[styles.titulo, {paddingBottom:15,marginTop:0}]}>FASTAID</Text>

        {streakLost && (
          <View style={styles.streakLossContainer}>
            <Text style={styles.streakLossTitle}>Ofensiva perdida!</Text>
            <Text style={styles.streakLossText}>
              Complete uma lição hoje para começar uma nova ofensiva.
            </Text>
          </View>
        )}

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
              const halfComplete = isFirstAidCourse && index === 0 && rcpIntroHalf && !isCompleted;

              return (
                <React.Fragment key={m.id}>
                  <ModuleItem
                    title={m.title}
                    labelColor={labelColor}
                    circleColor={circleColor}
                    locked={locked}
                    completed={isCompleted}
                    halfComplete={halfComplete}
                    onPress={() => !locked && startModule(m.id, index)}
                    ModuleIcon={ModuleIcon}
                    backgroundColor={colors.background}
                  />
                  {index < modules.length - 1 && (
                    <View style={styles.pathConnector} />
                  )}
                </React.Fragment>
              );
            })}

          

          
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
              backgroundColor: colors.background,
              borderRadius: 16,
              padding: 20,
              gap: 12,
            }}
          >
            <Text
              style={{
                color: colors.primary,
                fontWeight: "bold",
                fontSize: 25,
                textAlign: "center",
                marginBottom: 8,
              }}
            >
              ESCOLHA UM CURSO
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
                    item.id === selectedCourseId ? "rgba(96, 194, 255, 1)" : "transparent",
                }}
                onPress={() => handleCourseSelect(item.id)}
              >
                <Image
                  source={item.iconSource}
                  style={{ width: 40, height: 40, borderRadius: 10, marginLeft:10 }}
                />
                <Text style={{ color: colors.text, fontWeight: "600" }}>
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

type ModuleItemProps = {
  title: string;
  labelColor: string;
  circleColor: string;
  locked: boolean;
  completed: boolean;
  halfComplete?: boolean;
  ModuleIcon: React.ComponentType<any> | null;
  onPress: () => void;
  backgroundColor: string;
};

const ModuleItem: React.FC<ModuleItemProps> = ({
  title,
  labelColor,
  circleColor,
  locked,
  completed,
  halfComplete = false,
  ModuleIcon,
  onPress,
  backgroundColor,
}) => {
  const pulse = React.useRef(new Animated.Value(1)).current;
  const ringSize = 110;
  const strokeWidth = 8;
  const gap = 8;
  const innerSize = ringSize - strokeWidth * 2 - gap * 2;
  const radius = ringSize / 2 - strokeWidth;
  const circumference = 2 * Math.PI * radius;
  const progress = completed ? 1 : halfComplete ? 0.5 : 0;

  React.useEffect(() => {
    if (locked || completed) {
      pulse.setValue(1);
      return;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.08, duration: 900, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: 900, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [locked, completed, pulse]);

  return (
    <TouchableOpacity
      style={{ alignItems: "center", marginBottom: 14, marginTop: 6 }}
      activeOpacity={0.8}
      disabled={locked}
      onPress={onPress}
    >
      <Animated.View style={{ transform: [{ scale: pulse }] }}>
        <View
          style={{
            padding: 6,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <View style={{ width: ringSize, height: ringSize, alignItems: "center", justifyContent: "center" }}>
          <Svg width={ringSize} height={ringSize} style={{ position: "absolute" }}>
            <Circle
              cx={ringSize / 2}
              cy={ringSize / 2}
              r={radius}
              stroke="rgba(255,255,255,0.25)"
              strokeWidth={strokeWidth}
              fill="none"
            />
            {!locked && (
              <Circle
                cx={ringSize / 2}
                cy={ringSize / 2}
                r={radius}
                stroke={circleColor}
                strokeWidth={strokeWidth}
                fill="none"
                strokeLinecap="round"
                strokeDasharray={`${circumference} ${circumference}`}
                strokeDashoffset={circumference * (1 - progress)}
                transform={`rotate(-90 ${ringSize / 2} ${ringSize / 2})`}
              />
            )}
          </Svg>
          <View
            style={[
              {
                width: innerSize,
                height: innerSize,
                borderRadius: 999,
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: circleColor,
              },
            ]}
          >
            {completed ? (
              <FontAwesome name="check" size={30} color="#fff" />
            ) : locked ? (
              <FontAwesome name="lock" size={30} color="black" />
            ) : ModuleIcon ? (
              <ModuleIcon color={backgroundColor} size={30} />
            ) : (
              <CircleIcon color={backgroundColor} size={30} />
            )}
          </View>
          </View>
        </View>
      </Animated.View>
      <Text style={[{ marginTop: 6, fontWeight: "700", textAlign: "center" }, { color: labelColor }]}>
        {title}
      </Text>
    </TouchableOpacity>
  );
};
