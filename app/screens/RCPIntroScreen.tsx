import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLocalSearchParams, useRouter } from "expo-router";

import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Easing,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../context/ThemeContext";
import { auth } from "../firebaseConfig";

const cardSources = [
  require("../../assets/rcp/cards/1.png"),
  require("../../assets/rcp/cards/2.png"),
  require("../../assets/rcp/cards/3.png"),
  require("../../assets/rcp/cards/4.png"),
  require("../../assets/rcp/cards/5.png"),
  require("../../assets/rcp/cards/6.png"),
  require("../../assets/rcp/cards/7.png"),
  require("../../assets/rcp/cards/8.png"),
  require("../../assets/rcp/cards/9.png"),
  require("../../assets/rcp/cards/10.png"),
  require("../../assets/rcp/cards/11.png"),
  require("../../assets/rcp/cards/12.png"),
  require("../../assets/rcp/cards/13.png"),
  require("../../assets/rcp/cards/14.png"),
  require("../../assets/rcp/cards/15.png"),
  require("../../assets/rcp/cards/16.png"),
  require("../../assets/rcp/cards/17.png"),
  require("../../assets/rcp/cards/18.png"),
  require("../../assets/rcp/cards/19.png"),
  require("../../assets/rcp/cards/20.png"),
  require("../../assets/rcp/cards/21.png"),
];

const RCPIntroScreen = () => {
  const router = useRouter();
  const { courseId, moduleId, nextModuleId } = useLocalSearchParams<{
    courseId?: string;
    moduleId?: string;
    nextModuleId?: string;
  }>();
  const { colors } = useTheme();

  const [index, setIndex] = useState(0);
  // ANIMACAO: deslocamento horizontal do card e flutuacao leve em repouso.
  const cardAnim = useRef(new Animated.Value(0)).current;
  const idleAnim = useRef(new Animated.Value(0)).current;

  const total = cardSources.length;
  const currentImage = useMemo(() => cardSources[index], [index]);

  useEffect(() => {
    // ANIMACAO: loop suave que faz o card respirar/flutuar enquanto parado.
    Animated.loop(
      Animated.sequence([
        Animated.timing(idleAnim, {
          toValue: 1,
          duration: 1400,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(idleAnim, {
          toValue: 0,
          duration: 1400,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [idleAnim]);

  // ANIMACAO: controla o fade do card durante a troca de cartas.
  const cardOpacity = useRef(new Animated.Value(1)).current;

  const goNext = () => {
    if (index >= total - 1) return;
    const targetIndex = index + 1;
    // ANIMACAO: card atual sai para a esquerda e some.
    Animated.parallel([
      Animated.timing(cardAnim, { toValue: -20, duration: 180, useNativeDriver: true }),
      Animated.timing(cardOpacity, { toValue: 0, duration: 180, useNativeDriver: true }),
    ]).start(() => {
      setIndex(targetIndex);
      cardAnim.setValue(20);
      cardOpacity.setValue(0);
      // ANIMACAO: proximo card entra da direita com mola e fade.
      Animated.parallel([
        Animated.spring(cardAnim, {
          toValue: 0,
          useNativeDriver: true,
          speed: 10,
          bounciness: 8,
        }),
        Animated.timing(cardOpacity, { toValue: 1, duration: 200, useNativeDriver: true }),
      ]).start();
    });
  };

  const goPrev = () => {
    if (index === 0) {
      router.back();
      return;
    }
    const targetIndex = index - 1;
    // ANIMACAO: card atual sai para a direita e some.
    Animated.parallel([
      Animated.timing(cardAnim, { toValue: 20, duration: 180, useNativeDriver: true }),
      Animated.timing(cardOpacity, { toValue: 0, duration: 180, useNativeDriver: true }),
    ]).start(() => {
      setIndex(targetIndex);
      cardAnim.setValue(-20);
      cardOpacity.setValue(0);
      // ANIMACAO: card anterior entra da esquerda com mola e fade.
      Animated.parallel([
        Animated.spring(cardAnim, {
          toValue: 0,
          useNativeDriver: true,
          speed: 10,
          bounciness: 8,
        }),
        Animated.timing(cardOpacity, { toValue: 1, duration: 200, useNativeDriver: true }),
      ]).start();
    });
  };

  const goToQuiz = () => {
    if (!courseId || !nextModuleId) {
      router.replace("/(tabs)/CourseScreen");
      return;
    }
    const userId = auth.currentUser?.uid ?? "anon";
    void AsyncStorage.setItem(`fastaid:rcpIntroPart1:${userId}`, "1").catch(() => {});
    router.replace({
      pathname: "/screens/LessonScreen",
      params: {
        courseId: courseId as string,
        moduleId: nextModuleId as string,
        introModuleId: moduleId as string,
      },
    });
  };

  const idleTranslateY = idleAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -4],
  });
  // ANIMACAO: valores interpolados que transformam o loop de repouso em movimento visual.
  const idleScale = idleAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.01],
  });

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.primary }]}>RCP · Parte 1</Text>
        <Text style={[styles.subtitle, { color: colors.text }]}>Cartas de orientaçao</Text>
      </View>

      <View style={styles.cardWrapper}>
        {/* ANIMACAO: aplica transicao lateral, flutuacao e fade na carta. */}
        <Animated.View
          style={{
            transform: [{ translateX: cardAnim }, { translateY: idleTranslateY }, { scale: idleScale }],
            opacity: cardOpacity,
          }}
        >
          <Image source={currentImage} style={styles.cardImage} resizeMode="contain" />
        </Animated.View>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.secondaryButton, { borderColor: colors.primary }]}
          onPress={goPrev}
          activeOpacity={0.85}
        >
          <Text style={[styles.secondaryText, { color: colors.primary }]}>
            Voltar
          </Text>
        </TouchableOpacity>
        {index < total - 1 ? (
          <TouchableOpacity style={styles.primaryButton} onPress={goNext} activeOpacity={0.9}>
            <Text style={styles.primaryText}>Proximo</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.primaryButton} onPress={goToQuiz} activeOpacity={0.9}>
            <Text style={styles.primaryText}>Continuar para Parte 2 (Quiz)</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: { alignItems: "center", paddingTop: 12, paddingBottom: 6 },
  title: { fontSize: 24, fontWeight: "800" },
  subtitle: { fontSize: 14, opacity: 0.7 },
  cardWrapper: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  cardImage: { width: 320, height: 480, borderRadius: 18 },
  actions: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  primaryButton: {
    flex: 1,
    backgroundColor: "#2F80ED",
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
    marginLeft: 10,
  },
  primaryText: { color: "#fff", fontWeight: "800", fontSize: 16, textAlign: "center" },
  secondaryButton: {
    flex: 0.8,
    borderWidth: 2,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
    marginRight: 10,
  },
  secondaryText: { fontWeight: "700", fontSize: 15 },
});

export default RCPIntroScreen;
