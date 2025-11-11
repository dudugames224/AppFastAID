import React from "react";
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { coursesData } from "../data/courseData";

const PracticeScreen = () => {
  return (
    <ScrollView style={styles.container}>
      <Image source={require("../../assets/images/band_halter.png")} style={{ width: 140, height: 140, alignSelf: "center" }} />
      <Text style={styles.title}>Praticar</Text>
      <Text style={styles.subtitle}>Teste os seus conhecimentos com desafios de nível difícil!</Text>

      {Object.values(coursesData).map((course: any) => {
        const CourseIcon = course.icon;
        return (
          <TouchableOpacity key={course.id} style={styles.courseCard}>
            {typeof CourseIcon === "number" ? (
              <Image source={CourseIcon} style={styles.topicIconImage} />
            ) : (
              <View style={[styles.topicIcon, { backgroundColor: course.color }]}>
                <CourseIcon size={32} />
              </View>
            )}
            <View style={{ flex: 1 }}>
              <Text style={styles.courseTitle}>{course.title}</Text>
              <Text style={styles.courseSubtitle}>Quiz de nível difícil</Text>
            </View>
            <Text style={styles.arrow}>›</Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#121212", padding: 20 },
  title: { fontSize: 28, fontWeight: "bold", color: "#FFFFFF", marginBottom: 10, textAlign: "center" },
  subtitle: { fontSize: 16, color: "#A9A9A9", marginBottom: 30, textAlign: "center" },
  courseCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 15,
    width: "100%",
    padding: 20,
    borderWidth: 1,
    borderColor: "#2D2D2D",
    borderRadius: 15,
    backgroundColor: "#1E1E1E",
    marginBottom: 15,
  },
  topicIcon: { width: 50, height: 50, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  topicIconImage: { width: 50, height: 50, resizeMode: "contain" },
  courseTitle: { fontWeight: "bold", fontSize: 18, color: "#FFFFFF" },
  courseSubtitle: { color: "#A9A9A9", marginTop: 4 },
  arrow: { color: "#A9A9A9", fontSize: 24 },
});

export default PracticeScreen;

