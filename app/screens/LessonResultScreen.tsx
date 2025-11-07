import React, { useEffect, useRef } from "react";
import { Animated, Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

// Simples substituto visual do Character
const CharacterImg = ({ size = 180 }: { size?: number }) => (
  <Image
    source={require("../../assets/images/band_feliz.png")}
    style={{ width: size, height: size, resizeMode: "contain", marginBottom: 10 }}
  />
);

interface LessonResultProps {
  onNext?: (() => void) | null;
  onBack?: () => void;
  xpGained?: number;
  isPractice?: boolean;
  safeAreaTop?: number;
  safeAreaBottom?: number;
}

const LessonResultScreen = ({
  onNext = null,
  onBack = () => {},
  xpGained = 20,
  isPractice = false,
  safeAreaTop,
  safeAreaBottom,
}: LessonResultProps) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 4,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const paddingTop = (safeAreaTop || 0) + 20;
  const paddingBottom = (safeAreaBottom || 0) + 20;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
          paddingTop,
          paddingBottom,
        },
      ]}
    >
      <CharacterImg size={180} />
      <Text style={styles.title}>{isPractice ? "Prática Concluída!" : "Módulo Concluído!"}</Text>
      <Text style={styles.subtitle}>Você ganhou {xpGained} XP e está mais perto de se tornar um herói!</Text>

      {onNext && (
        <TouchableOpacity style={[styles.button, { marginBottom: 10 }]} onPress={onNext}>
          <Text style={styles.buttonText}>Próximo Módulo</Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity style={[styles.button, styles.backButton]} onPress={onBack}>
        <Text style={[styles.buttonText, styles.backButtonText]}>
          {isPractice ? "Voltar a Praticar" : "Voltar ao Curso"}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
    backgroundColor: "#121212",
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#58CC02",
    marginBottom: 10,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 18,
    color: "#A9A9A9",
    marginBottom: 40,
    textAlign: "center",
  },
  button: {
    backgroundColor: "#58CC02",
    borderRadius: 12,
    paddingVertical: 18,
    width: "100%",
    alignItems: "center",
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
  },
  backButton: {
    backgroundColor: "transparent",
    borderWidth: 2,
    borderColor: "#444",
  },
  backButtonText: {
    color: "#5D9CFB",
  },
});

export default LessonResultScreen;

