import { Ionicons } from "@expo/vector-icons";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Easing,
  Image,
  Modal,
  Pressable,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Circle } from "react-native-svg";
import { FlaskIcon, HeartIcon, ThermometerIcon, ZapIcon } from "../components/Icons";
import { useTheme } from "../context/ThemeContext";
import { auth, getUserData } from "../firebaseConfig";
import {
  getAdaptiveEventsForToday,
  isAdaptiveCourseEnabled,
} from "../services/adaptiveTrainingService";
import {
  fetchCourseModules,
  fetchCoursesMeta,
  RemoteCourseMeta,
  RemoteModule,
} from "../services/lessonService";
import {
  getCompletedModules,
  getDoctorCompletedModules,
  getModuleStages
} from "../services/progressService";

const moduleIconMap: Record<string, React.ComponentType<any>> = {
  FlaskIcon,
  ThermometerIcon,
  ZapIcon,
  HeartIcon,
  star: ({ size = 30, color = "#fff" }) => (
    <Ionicons name="star" size={size} color={color} />
  ),
  book: ({ size = 30, color = "#fff" }) => (
    <Ionicons name="book" size={size} color={color} />
  ),
  refresh: ({ size = 30, color = "#fff" }) => (
    <Ionicons name="refresh" size={size} color={color} />
  ),
};

const getModuleIcon = (identifier: unknown) => {
  if (typeof identifier === "string" && moduleIconMap[identifier]) {
    return moduleIconMap[identifier];
  }
  return null;
};

type ModuleEntry = {
  module: RemoteModule;
  index: number;
};

type AdaptiveMode =
  | "micro-session"
  | "pressure"
  | "daily-emergency"
  | "weekly-challenge"
  | "monthly-sim";

const SPECIAL_MODULE_IDS = new Set([
  "course-intro",
  "review-cards",
  "reset-course-action",
]);

const getModuleTopicTitle = (module: RemoteModule): string | undefined => {
  const rawTopic =
    typeof module.topic === "string"
      ? module.topic
      : typeof (module as any).topico === "string"
      ? (module as any).topico
      : typeof (module as any).section === "string"
      ? (module as any).section
      : typeof (module as any).group === "string"
      ? (module as any).group
      : undefined;
  return rawTopic?.trim() || undefined;
};

const CourseScreen: React.FC = () => {
  const LAST_COURSE_KEY = "fastaid:lastCourseId";
  const [courses, setCourses] = useState<RemoteCourseMeta[]>([]);
  const [modules, setModules] = useState<RemoteModule[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [coursesLoading, setCoursesLoading] = useState(true);
  const [modulesLoading, setModulesLoading] = useState(false);
  const [courseProgress, setCourseProgress] = useState<string[]>([]);
  const [doctorProgress, setDoctorProgress] = useState<string[]>([]);
  const [moduleStages, setModuleStages] = useState<Record<string, number>>({});
  const [rcpIntroHalf, setRcpIntroHalf] = useState(false);
  const router = useRouter();
  const [panicVisible, setPanicVisible] = useState(false);
  const [courseModalVisible, setCourseModalVisible] = useState(false);
  const [streakLost, setStreakLost] = useState(false);
  const [expandedReplayModuleId, setExpandedReplayModuleId] = useState<string | null>(null);
  const [bandOptionsVisible, setBandOptionsVisible] = useState(false);
  // ANIMACAO: valores que fazem o personagem Band pulsar, flutuar e abrir o menu.
  const bandScale = React.useRef(new Animated.Value(1)).current;
  const bandFloat = React.useRef(new Animated.Value(0)).current;
  const bandOptionsProgress = React.useRef(new Animated.Value(0)).current;

  const { styles, colors, panicStyles } = useTheme();

  const currentCourse = useMemo(
    () => courses.find((course) => course.id === selectedCourseId),
    [courses, selectedCourseId]
  );
  const moduleEntries = useMemo<ModuleEntry[]>(
    () => modules.map((module, index) => ({ module, index })),
    [modules]
  );
  const moduleSections = useMemo(() => {
    const sections: { title?: string; entries: ModuleEntry[] }[] = [];
    moduleEntries.forEach((entry) => {
      const title = getModuleTopicTitle(entry.module);
      const lastSection = sections.length > 0 ? sections[sections.length - 1] : null;

      if (lastSection && lastSection.title === title) {
        lastSection.entries.push(entry);
      } else {
        sections.push({ title, entries: [entry] });
      }
    });
    return sections;
  }, [moduleEntries]);
  const adaptiveEventsToday = useMemo(() => getAdaptiveEventsForToday(), []);
  const dailyEmergencyEvent = useMemo(
    () => adaptiveEventsToday.find((event) => event.type === "daily-emergency"),
    [adaptiveEventsToday]
  );
  const adaptiveEnabledForSelectedCourse = useMemo(
    () => (selectedCourseId ? isAdaptiveCourseEnabled(selectedCourseId) : false),
    [selectedCourseId]
  );
  // ANIMACAO: estilos derivados do progresso de abertura do menu do Band.
  const bandOptionsOpacity = bandOptionsProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });
  const bandOptionsScale = bandOptionsProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [0.96, 1],
  });
  const bandOptionsTranslateY = bandOptionsProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [-16, 0],
  });
  const bandOptionsMaxHeight = bandOptionsProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 360],
  });

  useFocusEffect(
    useCallback(() => {
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
        const validStored = stored ? data.find((c) => c.id === stored) : undefined;
        
        setSelectedCourseId((prev) => {
          // Verifica se o curso selecionado anteriormente ainda existe na lista (pode ter sido ocultado)
          if (prev && data.find(c => c.id === prev)) return prev;
          return validStored?.id ?? data[0]?.id ?? null;
        });
      } catch {
        setSelectedCourseId((prev) => {
          if (prev && data.find(c => c.id === prev)) return prev;
          return data[0]?.id ?? null;
        });
      }
      setCoursesLoading(false);
    };
    checkStreak();
    loadCourses();
  }, [])
  );

  useEffect(() => {
    const loadModules = async () => {
      if (!selectedCourseId) {
        setModules([]);
        setCourseProgress([]);
        setDoctorProgress([]);
        setExpandedReplayModuleId(null);
        return;
      }
      setModulesLoading(true);
      const data = await fetchCourseModules(selectedCourseId);
      setModules(data);
      const progress = await getCompletedModules(selectedCourseId);
      const doctorCompleted = await getDoctorCompletedModules(selectedCourseId);
      const stageProgress = await getModuleStages(selectedCourseId);
      setCourseProgress(progress);
      setDoctorProgress(doctorCompleted);
      setModuleStages(stageProgress);
      setExpandedReplayModuleId(null);
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
        const doctorCompleted = await getDoctorCompletedModules(selectedCourseId);
        const stageProgress = await getModuleStages(selectedCourseId);
        setCourseProgress(progress);
        setDoctorProgress(doctorCompleted);
        setModuleStages(stageProgress);
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

  useEffect(() => {
    // ANIMACAO: loop que deixa o personagem Band flutuando suavemente.
    const floatLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(bandFloat, {
          toValue: -7,
          duration: 1400,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(bandFloat, {
          toValue: 0,
          duration: 1400,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );
    floatLoop.start();
    return () => floatLoop.stop();
  }, [bandFloat]);

  useEffect(() => {
    // ANIMACAO: abre/fecha o menu do Band com mola.
    Animated.spring(bandOptionsProgress, {
      toValue: bandOptionsVisible ? 1 : 0,
      damping: 18,
      stiffness: 170,
      mass: 0.9,
      useNativeDriver: false,
    }).start();
  }, [bandOptionsProgress, bandOptionsVisible]);

  const courseOptions = useMemo(() => courses, [courses]);
  const isFirstAidCourse = useMemo(
    () =>
      selectedCourseId === "primeirosSocorros" ||
      selectedCourseId === "firstAid" ||
      selectedCourseId === "queimaduras" ||
      selectedCourseId === "burns",
    [selectedCourseId]
  );

  function startModule(module: RemoteModule, index: number) {
    if (!selectedCourseId) return;
    setExpandedReplayModuleId(null);
    setBandOptionsVisible(false);
    void AsyncStorage.setItem(LAST_COURSE_KEY, selectedCourseId).catch(() => {});
        if (isFirstAidCourse && /rcp|pcr/i.test(module.title)) {
      router.push({
        pathname: "/screens/RCPIntroScreen",
        params: {
          courseId: selectedCourseId,
          moduleId: module.id,
          nextModuleId: module.id,
        },
      });
      return;
    }
    router.push({
      pathname: "/screens/LessonScreen",
      params: {
        courseId: selectedCourseId,
        moduleId: module.id,
        stageCount: String(module.stageCount ?? 1),
      },
    });
  }

  const handleCompletedModulePress = (entry: ModuleEntry) => {
    setBandOptionsVisible(false);
    if (SPECIAL_MODULE_IDS.has(entry.module.id)) {
      startModule(entry.module, entry.index);
      return;
    }
    setExpandedReplayModuleId((prev) => (prev === entry.module.id ? null : entry.module.id));
  };

  const startCompletedModuleMode = (mode: "module-review" | "doctor", module: RemoteModule) => {
    if (!selectedCourseId) return;
    if (mode === "doctor" && doctorProgress.includes(module.id)) {
      Alert.alert("Modo Doutor concluído", "Neste módulo você já concluiu o modo Doutor. Agora ele fica apenas para revisão.");
      return;
    }
    setExpandedReplayModuleId(null);
    setBandOptionsVisible(false);
    router.push({
      pathname: "/screens/LessonScreen",
      params: {
        courseId: selectedCourseId,
        moduleId: module.id,
        mode,
        stageCount: "1",
        stageIndex: "0",
      },
    });
  };

  const handleBandPress = (event?: any) => {
    event?.stopPropagation?.();
    setExpandedReplayModuleId(null);
    setBandOptionsVisible((prev) => !prev);

    // ANIMACAO: efeito de clique no Band, dando um pequeno "pop" de escala.
    Animated.sequence([
      Animated.timing(bandScale, {
        toValue: 0.93,
        duration: 90,
        useNativeDriver: true,
      }),
      Animated.spring(bandScale, {
        toValue: 1.08,
        friction: 4,
        tension: 170,
        useNativeDriver: true,
      }),
      Animated.spring(bandScale, {
        toValue: 1,
        friction: 6,
        tension: 130,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const startAdaptiveModeFromBand = (
    mode: AdaptiveMode,
    params?: { eventSeed?: number; trackId?: string }
  ) => {
    if (!selectedCourseId) {
      Alert.alert("Escolha um curso", "Selecione um curso para iniciar a sessão.");
      return;
    }
    if (!isAdaptiveCourseEnabled(selectedCourseId)) {
      Alert.alert(
        "Modo indisponível",
        "Este curso ainda não recebeu modos adaptativos."
      );
      return;
    }

    setExpandedReplayModuleId(null);
    setBandOptionsVisible(false);
    router.push({
      pathname: "/screens/LessonScreen",
      params: {
        courseId: selectedCourseId,
        mode,
        ...(typeof params?.eventSeed === "number"
          ? { eventSeed: String(params.eventSeed) }
          : {}),
        ...(typeof params?.trackId === "string" ? { trackId: params.trackId } : {}),
      },
    });
  };

  const startDailyEmergency = () => {
    if (!dailyEmergencyEvent) {
      Alert.alert(
        "Evento indisponível",
        "Não foi possível carregar a emergência do dia."
      );
      return;
    }

    startAdaptiveModeFromBand("daily-emergency", {
      eventSeed: dailyEmergencyEvent.seed,
      trackId: dailyEmergencyEvent.trackId,
    });
  };

  const handleCourseSelect = (courseId: string) => {
    setSelectedCourseId(courseId);
    setExpandedReplayModuleId(null);
    setBandOptionsVisible(false);
    void AsyncStorage.setItem(LAST_COURSE_KEY, courseId).catch(() => {});
    setCourseModalVisible(false);
  };

  return (
    <SafeAreaView style={styles.safe} edges={["left", "right"]}>
      <ScrollView
        style={[styles.container, { paddingTop: 2, paddingBottom: 20 }]}
        contentContainerStyle={{ alignItems: "center" }}
      >
        <Pressable
          style={{ width: "100%", alignItems: "center" }}
          onPress={() => {
            setExpandedReplayModuleId(null);
            setBandOptionsVisible(false);
          }}
        >
        <TouchableOpacity activeOpacity={0.95} onPress={handleBandPress}>
          {/* ANIMACAO: aplica escala de clique e flutuacao no Band. */}
          <Animated.View
            style={{
              transform: [{ scale: bandScale }, { translateY: bandFloat }],
            }}
          >
            <Image
              source={require("../../assets/images/band_incio.png")}
              style={[styles.character, { marginTop: -10, marginBottom: 8, paddingEnd: 0, height: 250 }]}
            />
          </Animated.View>
        </TouchableOpacity>

        {/* ANIMACAO: menu do Band aparece com opacidade, altura, escala e deslocamento. */}
        <Animated.View
          pointerEvents={bandOptionsVisible ? "auto" : "none"}
          style={{
            width: "88%",
            maxWidth: 340,
            marginTop: 4,
            marginBottom: bandOptionsVisible ? 14 : 0,
            opacity: bandOptionsOpacity,
            maxHeight: bandOptionsMaxHeight,
            overflow: "hidden",
            transform: [{ translateY: bandOptionsTranslateY }, { scale: bandOptionsScale }],
          }}
        >
          <Pressable onPress={(event) => event.stopPropagation()} style={{ width: "100%" }}>
            <View
              style={{
                alignSelf: "center",
                width: 18,
                height: 18,
                backgroundColor: "#2E94FF",
                transform: [{ rotate: "45deg" }],
                marginBottom: -10,
                borderTopLeftRadius: 4,
              }}
            />
            <View
              style={{
                borderRadius: 20,
                backgroundColor: "#2E94FF",
                borderWidth: 2,
                borderColor: "rgba(255,255,255,0.2)",
                padding: 14,
                gap: 8,
                shadowColor: "#0A4A8C",
                shadowOpacity: 0.25,
                shadowRadius: 12,
                shadowOffset: { width: 0, height: 6 },
                elevation: 6,
              }}
            >
              <Text style={{ color: "#D7EEFF", fontSize: 11, fontWeight: "800", letterSpacing: 1 }}>
                SESSÕES ADAPTATIVAS
              </Text>
              <Text style={{ color: "#FFFFFF", fontSize: 16, fontWeight: "900" }}>
                {adaptiveEnabledForSelectedCourse
                  ? "Escolha o treino rápido no Band"
                  : "Modo adaptativo indisponível neste curso"}
              </Text>

              <TouchableOpacity
                activeOpacity={0.9}
                disabled={!adaptiveEnabledForSelectedCourse}
                onPress={() => startAdaptiveModeFromBand("micro-session")}
                style={{
                  borderRadius: 12,
                  backgroundColor: "#F4F6FA",
                  paddingVertical: 11,
                  alignItems: "center",
                  justifyContent: "center",
                  opacity: adaptiveEnabledForSelectedCourse ? 1 : 0.45,
                }}
              >
                <Text style={{ color: "#1E293B", fontSize: 15, fontWeight: "900", letterSpacing: 0.4 }}>
                  SESSÃO DIÁRIA 3-5 MIN
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.9}
                disabled={!adaptiveEnabledForSelectedCourse}
                onPress={() => startAdaptiveModeFromBand("pressure")}
                style={{
                  borderRadius: 12,
                  backgroundColor: "#0A66FF",
                  paddingVertical: 11,
                  alignItems: "center",
                  justifyContent: "center",
                  borderWidth: 1,
                  borderColor: "rgba(255,255,255,0.32)",
                  opacity: adaptiveEnabledForSelectedCourse ? 1 : 0.45,
                }}
              >
                <Text style={{ color: "#FFFFFF", fontSize: 15, fontWeight: "900", letterSpacing: 0.4 }}>
                  MODO PRESSÃO
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.9}
                disabled={!adaptiveEnabledForSelectedCourse || !dailyEmergencyEvent}
                onPress={startDailyEmergency}
                style={{
                  borderRadius: 12,
                  backgroundColor: "#032f73",
                  paddingVertical: 11,
                  alignItems: "center",
                  justifyContent: "center",
                  borderWidth: 1,
                  borderColor: "rgba(255,255,255,0.26)",
                  opacity: adaptiveEnabledForSelectedCourse && dailyEmergencyEvent ? 1 : 0.45,
                }}
              >
                <Text style={{ color: "#FFFFFF", fontSize: 15, fontWeight: "900", letterSpacing: 0.4 }}>
                  EMERGÊNCIA DO DIA
                </Text>
              </TouchableOpacity>

              {dailyEmergencyEvent && (
                <Text style={{ color: "rgba(255,255,255,0.9)", fontSize: 12, fontWeight: "600" }}>
                  {dailyEmergencyEvent.description} (+{dailyEmergencyEvent.rewardXp} XP base)
                </Text>
              )}
            </View>
          </Pressable>
        </Animated.View>

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
          onPress={() => {
            setBandOptionsVisible(false);
            setCourseModalVisible(true);
          }}
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
            moduleSections.map((section, sectionIndex) => (
              <View
                key={`${section.title ?? "section"}-${sectionIndex}`}
                style={styles.moduleSectionGroup}
              >
                {section.title && (
                  <View style={styles.moduleSectionHeader}>
                    <View style={styles.moduleSectionLine} />
                    <Text style={styles.moduleSectionText}>{section.title}</Text>
                    <View style={styles.moduleSectionLine} />
                  </View>
                )}
                {section.entries.map((entry, entryIndex) => {
                  const m = entry.module;
                  const index = entry.index;
                  const isCompleted = courseProgress.includes(m.id);
                  const stageCount = typeof m.stageCount === "number" ? m.stageCount : 1;
                  const stagesDone = typeof moduleStages[m.id] === "number" ? moduleStages[m.id] : 0;
                  const progressRatio = Math.max(0, Math.min(1, stagesDone / stageCount));
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
                  const doctorCompleted = doctorProgress.includes(m.id);
                  const replayCardVisible =
                    expandedReplayModuleId === m.id &&
                    !locked &&
                    isCompleted &&
                    !SPECIAL_MODULE_IDS.has(m.id);

                  return (
                    <React.Fragment key={m.id}>
                      <ModuleItem
                        title={m.title}
                        labelColor={labelColor}
                        circleColor={circleColor}
                        locked={locked}
                        completed={isCompleted}
                        doctorCompleted={doctorCompleted}
                        doctorAnimate={replayCardVisible}
                        halfComplete={halfComplete}
                        progress={
                          isCompleted ? 1 : halfComplete ? Math.max(0.5, progressRatio) : progressRatio
                        }
                        onPress={(event) => {
                          event?.stopPropagation?.();
                          if (locked) return;
                          if (isCompleted) {
                            handleCompletedModulePress(entry);
                            return;
                          }
                          setExpandedReplayModuleId(null);
                          startModule(m, index);
                        }}
                        ModuleIcon={ModuleIcon}
                        backgroundColor={colors.background}
                      />
                      {replayCardVisible && (
                        <InlineReplayCard
                          title={m.title}
                          doctorAvailable={!doctorCompleted}
                          onReview={() => startCompletedModuleMode("module-review", m)}
                          onDoctor={() => startCompletedModuleMode("doctor", m)}
                        />
                      )}
                      {entryIndex < section.entries.length - 1 && (
                        <View style={styles.pathConnector} />
                      )}
                    </React.Fragment>
                  );
                })}
              </View>
            ))}

          

          
        </View>
        </Pressable>
      </ScrollView>

      <View style={styles.sosButton} pointerEvents="box-none">
        <TouchableOpacity
          style={styles.sosTouchable}
          activeOpacity={0.9}
          onPress={(event) => {
            event.stopPropagation();
            setPanicVisible(true);
          }}
        >
          <Ionicons name="warning" size={30} color="#fff" />
        </TouchableOpacity>
      </View>
      <Modal
        visible={panicVisible}
        // ANIMACAO: fade nativo do Modal ao abrir/fechar o modo panico.
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
        // ANIMACAO: fade nativo do Modal ao abrir/fechar o seletor de cursos.
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

type InlineReplayCardProps = {
  title: string;
  doctorAvailable: boolean;
  onReview: () => void;
  onDoctor: () => void;
};

const InlineReplayCard: React.FC<InlineReplayCardProps> = ({
  title,
  doctorAvailable,
  onReview,
  onDoctor,
}) => {
  return (
    <View style={{ width: "86%", maxWidth: 330, alignSelf: "center", marginTop: 6, marginBottom: 10 }}>
      <View
        style={{
          alignSelf: "center",
          width: 18,
          height: 18,
          backgroundColor: "#2E94FF",
          transform: [{ rotate: "45deg" }],
          marginBottom: -10,
          borderTopLeftRadius: 4,
        }}
      />
      <View
        style={{
          borderRadius: 20,
          backgroundColor: "#2E94FF",
          borderWidth: 2,
          borderColor: "rgba(255,255,255,0.2)",
          padding: 14,
          gap: 10,
          shadowColor: "#0A4A8C",
          shadowOpacity: 0.25,
          shadowRadius: 12,
          shadowOffset: { width: 0, height: 6 },
          elevation: 6,
        }}
      >
        <Text style={{ color: "#D7EEFF", fontSize: 11, fontWeight: "800", letterSpacing: 1 }}>
          MÓDULO CONCLUÍDO
        </Text>
        <Text style={{ color: "#FFFFFF", fontSize: 28, fontWeight: "900", marginTop: -6 }} numberOfLines={1}>
          {title}
        </Text>
        <Text style={{ color: "rgba(255,255,255,0.9)", fontSize: 13, fontWeight: "600", marginTop: -2 }}>
          {doctorAvailable ? "Escolha como quer repetir." : "Revise este módulo novamente."}
        </Text>
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={(event) => {
            event.stopPropagation();
            onReview();
          }}
          style={{
            borderRadius: 13,
            backgroundColor: "#F4F6FA",
            paddingVertical: 12,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text style={{ color: "#1E293B", fontSize: 20, fontWeight: "900", letterSpacing: 0.8 }}>
            REVISAR +5 XP
          </Text>
        </TouchableOpacity>
        {doctorAvailable && (
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={(event) => {
              event.stopPropagation();
              onDoctor();
            }}
            style={{
              borderRadius: 13,
              backgroundColor: "#0A66FF",
              paddingVertical: 12,
              alignItems: "center",
              justifyContent: "center",
              borderWidth: 1,
              borderColor: "rgba(255,255,255,0.32)",
            }}
          >
            <Text style={{ color: "#FFFFFF", fontSize: 20, fontWeight: "900", letterSpacing: 0.8 }}>
              DOUTOR XP x2
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

type ModuleItemProps = {
  title: string;
  labelColor: string;
  circleColor: string;
  locked: boolean;
  completed: boolean;
  doctorCompleted?: boolean;
  doctorAnimate?: boolean;
  halfComplete?: boolean;
  progress?: number;
  ModuleIcon: React.ComponentType<any> | null;
  onPress: (event?: any) => void;
  backgroundColor: string;
};

const ModuleItem: React.FC<ModuleItemProps> = ({
  title,
  labelColor,
  circleColor,
  locked,
  completed,
  doctorCompleted = false,
  doctorAnimate = false,
  halfComplete = false,
  progress = 0,
  ModuleIcon,
  onPress,
  backgroundColor,
}) => {
  // ANIMACAO: valores usados no modulo para pulsar o botao e destacar o modo Doutor.
  const pulse = React.useRef(new Animated.Value(1)).current;
  const doctorGlow = React.useRef(new Animated.Value(0.35)).current;
  const doctorSparkleA = React.useRef(new Animated.Value(0.2)).current;
  const doctorSparkleB = React.useRef(new Animated.Value(0.45)).current;
  const doctorSparkleC = React.useRef(new Animated.Value(0.6)).current;
  const ringSize = 110;
  const strokeWidth = 8;
  const gap = 8;
  const innerSize = ringSize - strokeWidth * 2 - gap * 2;
  const radius = ringSize / 2 - strokeWidth;
  const circumference = 2 * Math.PI * radius;
  const clampedProgress = Math.max(0, Math.min(1, progress || 0));
  const activeIconColor = "#fff";
  const doctorStrokeColor = "#6FE6FF";
  const doctorFillColor = "#0D63F2";
  const finalCircleColor = doctorCompleted ? doctorFillColor : circleColor;
  const finalStrokeColor = doctorCompleted ? doctorStrokeColor : circleColor;

  React.useEffect(() => {
    if (locked || (completed && !(doctorCompleted && doctorAnimate))) {
      pulse.setValue(1);
      return;
    }
    // ANIMACAO: pulso continuo no modulo disponivel/selecionado.
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.08, duration: 900, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: 900, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [locked, completed, doctorCompleted, doctorAnimate, pulse]);

  React.useEffect(() => {
    if (!doctorCompleted || locked || !doctorAnimate) {
      doctorGlow.setValue(0.35);
      doctorSparkleA.setValue(0.2);
      doctorSparkleB.setValue(0.45);
      doctorSparkleC.setValue(0.6);
      return;
    }
    // ANIMACAO: brilho e faíscas quando o modulo Doutor concluido esta em destaque.
    const glowLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(doctorGlow, { toValue: 0.85, duration: 760, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(doctorGlow, { toValue: 0.35, duration: 760, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ])
    );
    const sparkleLoop = Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(doctorSparkleA, { toValue: 1, duration: 520, useNativeDriver: true }),
          Animated.timing(doctorSparkleA, { toValue: 0.2, duration: 520, useNativeDriver: true }),
        ]),
        Animated.sequence([
          Animated.timing(doctorSparkleB, { toValue: 1, duration: 620, useNativeDriver: true }),
          Animated.timing(doctorSparkleB, { toValue: 0.25, duration: 620, useNativeDriver: true }),
        ]),
        Animated.sequence([
          Animated.timing(doctorSparkleC, { toValue: 1, duration: 700, useNativeDriver: true }),
          Animated.timing(doctorSparkleC, { toValue: 0.28, duration: 700, useNativeDriver: true }),
        ]),
      ])
    );
    glowLoop.start();
    sparkleLoop.start();
    return () => {
      glowLoop.stop();
      sparkleLoop.stop();
    };
  }, [doctorCompleted, locked, doctorAnimate, doctorGlow, doctorSparkleA, doctorSparkleB, doctorSparkleC]);

  return (
    <TouchableOpacity
      style={{ alignItems: "center", marginBottom: 14, marginTop: 6 }}
      activeOpacity={0.8}
      disabled={locked}
      onPress={onPress}
    >
      {/* ANIMACAO: aplica o pulso no item do modulo. */}
      <Animated.View style={{ transform: [{ scale: pulse }] }}>
        <View
          style={{
            padding: 6,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <View style={{ width: ringSize, height: ringSize, alignItems: "center", justifyContent: "center" }}>
          {doctorCompleted && !locked && doctorAnimate && (
            <>
              {/* ANIMACAO: brilho atras do medalhao Doutor. */}
              <Animated.View
                style={{
                  position: "absolute",
                  width: ringSize + 16,
                  height: ringSize + 16,
                  borderRadius: 999,
                  backgroundColor: "#36C7FF",
                  opacity: doctorGlow,
                  transform: [{ scale: 1.02 }],
                }}
              />
              {/* ANIMACAO: faísca do destaque Doutor. */}
              <Animated.View
                style={{
                  position: "absolute",
                  top: 4,
                  right: 10,
                  width: 8,
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: "#D9F6FF",
                  opacity: doctorSparkleA,
                }}
              />
              {/* ANIMACAO: faísca do destaque Doutor. */}
              <Animated.View
                style={{
                  position: "absolute",
                  top: 16,
                  left: 6,
                  width: 6,
                  height: 6,
                  borderRadius: 3,
                  backgroundColor: "#BFF0FF",
                  opacity: doctorSparkleB,
                }}
              />
              {/* ANIMACAO: faísca do destaque Doutor. */}
              <Animated.View
                style={{
                  position: "absolute",
                  bottom: 10,
                  right: 8,
                  width: 7,
                  height: 7,
                  borderRadius: 3.5,
                  backgroundColor: "#E8FBFF",
                  opacity: doctorSparkleC,
                }}
              />
            </>
          )}
          <Svg width={ringSize} height={ringSize} style={{ position: "absolute" }}>
            <Circle
              cx={ringSize / 2}
              cy={ringSize / 2}
              r={radius}
              stroke={doctorCompleted ? "rgba(111, 230, 255, 0.42)" : "rgba(170, 168, 168, 0.22)"}
              strokeWidth={strokeWidth}
              fill="none"
            />
            {!locked && (
              <Circle
                cx={ringSize / 2}
                cy={ringSize / 2}
                r={radius}
                stroke={finalStrokeColor}
                strokeWidth={strokeWidth}
                fill="none"
                strokeLinecap="round"
                strokeDasharray={`${circumference} ${circumference}`}
                strokeDashoffset={circumference * (1 - clampedProgress)}
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
                backgroundColor: finalCircleColor,
              },
            ]}
          >
            {doctorCompleted && !locked ? (
              <Ionicons name="medal" size={30} color="#EAF9FF" />
            ) : completed ? (
              <FontAwesome name="check" size={30} color="#fff" />
            ) : locked ? (
              <FontAwesome name="lock" size={30} color="black" />
            ) : ModuleIcon ? (
              <ModuleIcon color={activeIconColor} size={30} />
            ) : (
              <Ionicons name="play" size={28} color={activeIconColor} />
            )}
          </View>
          </View>
        </View>
      </Animated.View>
      <Text style={[{ marginTop: 6, fontWeight: "700", textAlign: "center" }, { color: labelColor }]}>
        {title}
      </Text>
      {doctorCompleted && !locked && (
        <Text style={{ marginTop: 2, color: "#73D9FF", fontWeight: "900", letterSpacing: 1 }}>
          DOUTOR
        </Text>
      )}
    </TouchableOpacity>
  );
};
