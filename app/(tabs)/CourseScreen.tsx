import { Ionicons } from "@expo/vector-icons";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../context/ThemeContext";
import { coursesData } from "../data/courseData";
import { Sair } from "../firebaseConfig.js";

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

  const { styles, colors, currentTheme, setCurrentTheme } = useTheme();

  function logout() {
    Sair();
    router.replace("/screens/login");
  }


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

        <View style={styles.topicHeader}>
          {typeof course.icon === "number" ? (
            <Image source={course.icon} style={styles.topicIconImage} />
          ) : (
            <View
              style={[styles.topicIcon, { backgroundColor: course.color }]}
            />
          )}
          <Text style={styles.courseTitle}>{course.title}</Text>
          <Text style={styles.chevron}>›</Text>
        </View>

        <View style={styles.lessonPath}>
          {modules.map((m, index) => {
            const locked = index > 0;
            const labelColor = locked ? "#777" : colors.text;
            const circleColor = locked ? colors.circle : m.color;
            const symbol = locked ? (
              <FontAwesome name="lock" size={30} color="black" />
            ) : (
              <FontAwesome name="check" size={30} color={colors.background} />
            );

            return (
              <React.Fragment key={m.id}>
                <TouchableOpacity
                  style={styles.unitButton}
                  activeOpacity={0.8}
                  disabled={locked}
                >
                  <View
                    style={[styles.unitIconContainer, { backgroundColor: circleColor }]}
                  >
                    {symbol}
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

      
    </SafeAreaView>
  );
};

export default CourseScreen;
