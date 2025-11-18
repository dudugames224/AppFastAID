import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../context/ThemeContext";
import { fetchCoursesMeta, RemoteCourseMeta } from "../services/lessonService";

const PracticeScreen = () => {
  const { styles, colors } = useTheme();
  const router = useRouter();
  const [courses, setCourses] = useState<RemoteCourseMeta[]>([]);
  const [loading, setLoading] = useState(true);

  const startPractice = (courseId: string) => {
    router.push({
      pathname: "/screens/LessonScreen",
      params: { courseId, mode: "practice" },
    });
  };

  useEffect(() => {
    const loadCourses = async () => {
      setLoading(true);
      const data = await fetchCoursesMeta();
      setCourses(data);
      setLoading(false);
    };
    loadCourses();
  }, []);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 30 }}>
        <Image
          source={require("../../assets/images/band_halter.png")}
          style={{ width: 140, height: 140, alignSelf: "center" }}
        />
        <Text style={styles.titulo}>PRATICAR</Text>
        <Text style={styles.subtitle}>
          Teste os seus conhecimentos com desafios de nível difícil!
        </Text>

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
              onPress={() => startPractice(course.id)}
            >
              <Image source={course.iconSource} style={styles.topicIconImage} />
              <View style={{ flex: 1 }}>
                <Text style={styles.courseTitle}>{course.title}</Text>
                <Text style={{ color: colors.text }}>
                  Quiz de nível difícil
                </Text>
              </View>
              <Text style={styles.arrow}>›</Text>
            </TouchableOpacity>
          ))}
      </ScrollView>
    </SafeAreaView>
  );
};

export default PracticeScreen;
