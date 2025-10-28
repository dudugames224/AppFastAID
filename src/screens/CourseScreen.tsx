import React from "react";
import { SafeAreaView, ScrollView, View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import { coursesData } from "../data/courseData";

type Module = {
  id: string;
  title: string;
  color: string;
};

const CourseScreen: React.FC = () => {
  const course = coursesData.burns; // estático: exemplo "Queimaduras"
  const modules = course.modules as Module[];

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView style={styles.container} contentContainerStyle={{ alignItems: "center" }}>
      {/* Personagem / estado */}
      <Image source={require("../../assets/images/band.png")} style={styles.character} />

      {/* Cartão de aviso (estático) */}
      <View style={styles.streakLossContainer}>
        <Text style={styles.streakLossTitle}>Ofensiva perdida!</Text>
        <Text style={styles.streakLossText}>Complete uma lição hoje para começar uma nova ofensiva.</Text>
      </View>

      {/* Botão SOS (estático, sem animação) */}
      <View style={styles.sosButton}>
        <TouchableOpacity style={styles.sosTouchable} activeOpacity={0.8}>
          <Text style={styles.sosText}>SOS</Text>
        </TouchableOpacity>
      </View>

      {/* Cabeçalho de seleção de curso (somente visual) */}
      <View style={styles.topicHeader}>
        {typeof course.icon === "number" ? (
          <Image source={course.icon} style={styles.topicIconImage} />
        ) : (
          <View style={[styles.topicIcon, { backgroundColor: course.color }]} />
        )}
        <Text style={styles.courseTitle}>{course.title}</Text>
        <Text style={styles.chevron}>▼</Text>
      </View>

      {/* Trilha de lições (módulos) */}
      <View style={styles.lessonPath}>
        {modules.map((m, index) => {
          const locked = index > 0; // estático: só o 1º desbloqueado
          const labelColor = locked ? "#777" : "#FFFFFF";
          const circleColor = locked ? "#4A4A4A" : m.color;
          const symbol = locked ? "🔒" : "▶";
          return (
            <React.Fragment key={m.id}>
              <TouchableOpacity style={styles.unitButton} activeOpacity={0.8} disabled={locked}>
                <View style={[styles.unitIconContainer, { backgroundColor: circleColor }]}>
                  <Text style={styles.unitSymbol}>{symbol}</Text>
                </View>
                <Text style={[styles.unitLabel, { color: labelColor }]}>{m.title}</Text>
              </TouchableOpacity>
              {index < modules.length - 1 && <View style={styles.pathConnector} />}
            </React.Fragment>
          );
        })}
      </View>
    </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#121212",
  },
  container: {
    flex: 1,
    backgroundColor: "#121212",
    padding: 20,
  },
  character: {
    width: 120,
    height: 120,
    resizeMode: "contain",
    marginBottom: 16,
  },
  topicHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 30,
    alignSelf: "center",
    padding: 10,
    backgroundColor: "#1E1E1E",
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "#2D2D2D",
  },
  topicIcon: {
    width: 50,
    height: 50,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  topicIconImage: {
    width: 50,
    height: 50,
    borderRadius: 12,
    resizeMode: "cover",
    marginRight: 12,
  },
  courseTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginRight: 8,
  },
  chevron: {
    color: "#A9A9A9",
    fontSize: 16,
  },
  lessonPath: {
    alignItems: "center",
    paddingBottom: 40,
    width: "100%",
  },
  unitButton: {
    alignItems: "center",
    marginBottom: 20,
  },
  unitIconContainer: {
    width: 90,
    height: 90,
    borderRadius: 45,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
    position: "relative",
  },
  unitSymbol: {
    fontSize: 28,
    color: "#FFFFFF",
  },
  unitLabel: {
    fontWeight: "600",
    fontSize: 16,
    color: "#FFFFFF",
  },
  pathConnector: {
    width: 4,
    height: 50,
    backgroundColor: "#2D2D2D",
    marginBottom: 20,
  },
  streakLossContainer: {
    backgroundColor: "#392323",
    padding: 15,
    borderRadius: 12,
    marginBottom: 20,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#FF4B4B",
  },
  streakLossTitle: {
    color: "#FF4B4B",
    fontSize: 18,
    fontWeight: "bold",
  },
  streakLossText: {
    color: "#A9A9A9",
    textAlign: "center",
    marginTop: 5,
  },
  sosButton: {
    position: "absolute",
    top: 1,
    left: 2,
    zIndex: 10,
  },
  sosTouchable: {
    backgroundColor: "#000",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
  },
  sosText: {
    color: "#FF4B4B",
    fontWeight: "bold",
    fontSize: 18,
  },
});

export default CourseScreen;
