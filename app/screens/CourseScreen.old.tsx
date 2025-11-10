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
  useColorScheme
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { coursesData } from "../data/courseData";
import getThemedStyles from "../styles";

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
  const colorScheme = useColorScheme();
  
  const { styles, panicStyles } = getThemedStyles(colorScheme);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={{ alignItems: "center" }}
      >
        {/* Personagem */}
        <Image
          source={require("../../assets/images/band.png")}
          style={styles.character}
        />

        {/* Aviso de ofensiva */}
        <View style={styles.streakLossContainer}>
          <Text style={styles.streakLossTitle}>Ofensiva perdida!</Text>
          <Text style={styles.streakLossText}>
            Complete uma liÃ§Ã£o hoje para comeÃ§ar uma nova ofensiva.
          </Text>
        </View>

        {/* BotÃ£o SOS */}
        <View style={styles.sosButton}>
          <TouchableOpacity
            style={styles.sosTouchable}
            activeOpacity={0.9}
            onPress={() => setPanicVisible(true)}
          >
            <Ionicons name="warning" size={30} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* CabeÃ§alho do Curso */}
        <View style={styles.topicHeader}>
          {typeof course.icon === "number" ? (
            <Image source={course.icon} style={styles.topicIconImage} />
          ) : (
            <View
              style={[styles.topicIcon, { backgroundColor: course.color }]}
            />
          )}
          <Text style={styles.courseTitle}>{course.title}</Text>
          <Text style={styles.chevron}>â€º</Text>
        </View>

        {/* Lista de mÃ³dulos */}
        <View style={styles.lessonPath}>
          {modules.map((m, index) => {
            const locked = index > 0;
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
                      { backgroundColor: locked ? "#4A4A4A" : m.color },
                    ]}
                  >
                    <Text style={styles.unitSymbol}>{locked ? "ðŸ”’" : "âœ“"}</Text>
                  </View>
                  <Text
                    style={[
                      styles.unitLabel,
                      { color: locked ? "#777" : "#FFFFFF" },
                    ]}
                  >
                    {m.title}
                  </Text>
                </TouchableOpacity>

                {index < modules.length - 1 && (
                  <View style={styles.pathConnector} />
                )}
              </React.Fragment>
            );
          })}

          {/* BotÃ£o de sair */}
          <Link style={styles.sosText} href="./login">
            <Text>SAIR</Text>
          </Link>
        </View>
      </ScrollView>

      {/* Modal de PÃ¢nico */}
      <Modal
        visible={panicVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setPanicVisible(false)}
      >
        <View style={panicStyles.backdrop}>
          <View style={panicStyles.sheet}>
            <View style={panicStyles.header}>
              <View style={panicStyles.headerLeft}>
                <Ionicons name="warning" size={22} color="#fff" />
                <Text style={panicStyles.title}>Modo PÃ¢nico</Text>
              </View>
              <TouchableOpacity
                onPress={() => setPanicVisible(false)}
                style={panicStyles.close}
              >
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
                <Ionicons name="heart" size={22} color="#FF4B4B" />
              </View>
              <Text style={panicStyles.optionLabel}>RCP (ReanimaÃ§Ã£o)</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default CourseScreen;

const panicStyles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: "#FF4B4B",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
    gap: 12,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  title: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  close: {
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
