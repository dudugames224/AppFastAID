import { Link } from "expo-router";
import React from "react";
import { Image, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { coursesData } from "../data/courseData";
import styles from "../styles";

type Module = {
  id: string;
  title: string;
  color: string;
};

const CourseScreen: React.FC = () => {
  const course = coursesData.burns;
  const modules = course.modules as Module[];

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={{ alignItems: "center" }}
      >
        {/* Personagem / estado */}
        <Image
          source={require("../../assets/images/band.png")}
          style={styles.character}
        />

        {/* Cartão de aviso (estático) */}
        <View style={styles.streakLossContainer}>
          <Text style={styles.streakLossTitle}>Ofensiva perdida!</Text>
          <Text style={styles.streakLossText}>
            Complete uma lição hoje para começar uma nova ofensiva.
          </Text>
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
            <View
              style={[styles.topicIcon, { backgroundColor: course.color }]}
            />
          )}
          <Text style={styles.courseTitle}>{course.title}</Text>
          <Text style={styles.chevron}>▼</Text>
        </View>

        {/* Trilha de lições (módulos) */}
        <View style={styles.lessonPath}>
          {modules.map((m, index) => {
            const locked = index > 0;
            const labelColor = locked ? "#777" : "#FFFFFF";
            const circleColor = locked ? "#4A4A4A" : m.color;
            const symbol = locked ? "🔒" : "▶";
            return (
              <React.Fragment key={m.id}>
                <TouchableOpacity
                  style={styles.unitButton}
                  activeOpacity={0.8}
                  disabled={locked}
                >
                  <View
                    style={[
                      styles.unitIconContainer,
                      { backgroundColor: circleColor },
                    ]}
                  >
                    <Text style={styles.unitSymbol}>{symbol}</Text>
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
          <Link style={styles.sosText} href="./login">
            <Text>SAIR</Text>
          </Link>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default CourseScreen;
