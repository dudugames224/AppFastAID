import { Ionicons } from "@expo/vector-icons";
import { Link, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
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
  const router = useRouter();
  const [panicVisible, setPanicVisible] = useState(false);

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

        {/* FAB SOS removido do scroll para ficar fixo (movido abaixo) */}

        {/* Cabeçalho de seleção de curso (somente visual) */}
        <View style={styles.topicHeader}>
          {typeof course.icon === "number" ? (
            <Image source={course.icon} style={styles.topicIconImage} />
          ) : (
            <View style={[styles.topicIcon, { backgroundColor: course.color }]} />
          )}
          <Text style={styles.courseTitle}>{course.title}</Text>
          <Text style={styles.chevron}>›</Text>
        </View>

        {/* Trilha de lições (módulos) */}
        <View style={styles.lessonPath}>
          {modules.map((m, index) => {
            const locked = index > 0;
            const labelColor = locked ? "#777" : "#FFFFFF";
            const circleColor = locked ? "#4A4A4A" : m.color;
            const symbol = locked ? "🔒" : "✓";
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
          <Link style={styles.sosText} href="./login">
            <Text>SAIR</Text>
          </Link>
        </View>
      </ScrollView>

      {/* Botão SOS flutuante fixo */}
      <View style={styles.sosButton} pointerEvents="box-none">
        <TouchableOpacity style={styles.sosTouchable} activeOpacity={0.9} onPress={() => setPanicVisible(true)}>
          <Ionicons name="warning" size={30} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Modal: Modo Pânico central (apenas RCP) */}
      <Modal visible={panicVisible} animationType="fade" transparent onRequestClose={() => setPanicVisible(false)}>
        <View style={panicStyles.centerBackdrop}>
          <View style={panicStyles.card}>
            <View style={panicStyles.cardHeader}>
              <Ionicons name="warning" size={22} color="#fff" />
              <Text style={panicStyles.cardTitle}>Modo Pânico</Text>
              <TouchableOpacity onPress={() => setPanicVisible(false)} style={panicStyles.cardClose}>
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
    </SafeAreaView>
  );
};

export default CourseScreen;

// Estilos locais do modal de pânico
const panicStyles = StyleSheet.create({
  centerBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  card: {
    width: "100%",
    backgroundColor: "#FF4B4B",
    borderRadius: 22,
    padding: 16,
    gap: 16,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  cardTitle: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 18,
  },
  cardClose: {
    position: "absolute",
    right: 6,
    top: -10,
    backgroundColor: "rgba(255,255,255,0.25)",
    borderRadius: 16,
    padding: 6,
  },
  option: {
    backgroundColor: "#FFD5D5",
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  optionIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  optionLabel: {
    fontSize: 16,
    fontWeight: "700",
    color: "#000",
  },
});
