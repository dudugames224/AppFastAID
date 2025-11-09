import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Image,
  Modal,
  ScrollView,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { coursesData } from "../data/courseData";
import { Sair } from "../firebaseConfig.js";
import styles, { panicStyles } from "../styles";


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

  function logout() {
    Sair(); 
    router.replace('/screens/login'); 
  }

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
          <TouchableOpacity style={styles.unitButton} onPress={logout}>
            <Text style={[styles.unitLabel, { color: "#FF4B4B" }]}>SAIR</Text>
          </TouchableOpacity>
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
                router.push("./screens/RCP");
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


