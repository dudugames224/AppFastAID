import React from "react";
import { Image, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../context/ThemeContext";
import { coursesData } from "../data/courseData";



const PracticeScreen = () => {
    const { styles, colors, currentTheme, setCurrentTheme } = useTheme();
  return (
    <SafeAreaView style={styles.safe}>
    <ScrollView style={styles.container}>
      <Image source={require("../../assets/images/band_halter.png")} style={{ width: 140, height: 140, alignSelf: "center" }} />
      <Text style={styles.titulo}>Praticar</Text>
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
              <Text style={{color:colors.text}}>Quiz de nível difícil</Text>
            </View>
            <Text style={styles.arrow}>›</Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
    </SafeAreaView>
  );
};


  

export default PracticeScreen;

