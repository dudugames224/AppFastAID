import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Linking,
  Animated,
  Easing,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import {
  emergencyMedicalReviewedAt,
  emergencyMedicalSource,
} from "../data/emergencyData";

type Step = {
  title: string;
  bullets: string[];
};

const steps: Step[] = [
  {
    title: "Introdução",
    bullets: [
      "Se for treinado em RCP com ventilações, use esse método (vá para o passo 4).",
      "Se não estiver confiante, faça RCP somente com as mãos (vá para o passo 2).",
    ],
  },
  {
    title: "RCP somente com as mãos",
    bullets: [
      "Ajoelhe‑se ao lado da pessoa.",
      "Coloque a base de uma mão no centro do peito.",
      "Coloque a outra mão por cima e entrelace os dedos.",
      "Mantenha os ombros alinhados sobre as mãos.",
      "Comprima 5–6 cm usando o peso do corpo.",
      "Libere a pressão permitindo o tórax subir.",
      "Faça 100–120 compressões por minuto até a ajuda chegar.",
    ],
  },
  {
    title: "Compressões torácicas",
    bullets: [
      "Mantenha o ritmo de 100–120 por minuto.",
      "Conte em voz alta para manter o ritmo (ex.: 1, 2, 3…).",
      "Troque o socorrista, se possível, a cada 2 minutos.",
    ],
  },
  {
    title: "RCP com ventilações de resgate",
    bullets: [
      "Realize 30 compressões torácicas.",
      "Incline a cabeça e eleve o queixo.",
      "Feche o nariz com os dedos e sele os lábios sobre a boca da vítima.",
      "Dê 2 ventilações, cada uma com cerca de 1 segundo, observando o tórax subir.",
      "Repita ciclos de 30:2 (compressões:ventilações).",
    ],
  },
  {
    title: "Finalizar / chamar ajuda",
    bullets: [
      "Continue a RCP até a chegada de ajuda, exaustão ou recuperação de sinais de vida.",
      "Use um DEA (desfibrilador) assim que disponível e siga as instruções.",
    ],
  },
];

const RCP: React.FC = () => {
  const router = useRouter();
  const [index, setIndex] = useState(0);
  const [mode, setMode] = useState<"overview" | "guide">("overview");
  const [expanded, setExpanded] = useState<number | null>(null);
  const [playing, setPlaying] = useState(true);
  const total = steps.length;

  const next = () => setIndex((i) => Math.min(i + 1, total - 1));
  const prev = () => setIndex((i) => Math.max(i - 1, 0));

  const percent = ((index + 1) / total) * 100;


  const scale = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(0.35)).current;
  const loopRef = useRef<Animated.CompositeAnimation | null>(null);
  const beatTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  const startPulse = useCallback(() => {
    const beatMs = 550; 
    loopRef.current = Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(scale, { toValue: 1.15, duration: beatMs / 2, easing: Easing.out(Easing.quad), useNativeDriver: true }),
          Animated.timing(opacity, { toValue: 0.6, duration: beatMs / 2, useNativeDriver: true }),
        ]),
        Animated.parallel([
          Animated.timing(scale, { toValue: 1, duration: beatMs / 2, easing: Easing.in(Easing.quad), useNativeDriver: true }),
          Animated.timing(opacity, { toValue: 0.35, duration: beatMs / 2, useNativeDriver: true }),
        ]),
      ])
    );
    loopRef.current.start();

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    beatTimer.current = setInterval(() => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }, beatMs);
  }, [opacity, scale]);
  const stopPulse = useCallback(() => {
    loopRef.current?.stop();
    scale.setValue(1);
    opacity.setValue(0.35);
    if (beatTimer.current) {
      clearInterval(beatTimer.current);
      beatTimer.current = null;
    }
  }, [opacity, scale]);

  useEffect(() => {
    if (playing && (index === 2 || index === 4) && mode === "guide") startPulse();
    else stopPulse();
    return () => stopPulse();
  }, [index, mode, playing, startPulse, stopPulse]);

  const StepCard = ({ i, step }: { i: number; step: Step }) => {
    const isOpen = (mode === "guide" && i === index) || expanded === i;
    return (
      <View style={s.card}>
        <TouchableOpacity
          style={s.cardHeader}
          activeOpacity={0.8}
          onPress={() => {
            if (mode === "overview") {
              setExpanded(isOpen ? null : i);
            } else {
              setIndex(i);
            }
          }}
        >
          <View style={{ flex: 1 }}>
            <Text style={s.cardStep}>Passo {i + 1}</Text>
            <Text style={s.cardTitle}>{step.title}</Text>
          </View>
          <Ionicons name={isOpen ? "chevron-up" : "chevron-down"} size={18} color="#fff" />
        </TouchableOpacity>
        {isOpen && (
          <View style={s.cardBody}>
            {step.bullets.map((b, k) => (
              <View key={k} style={s.bulletRow}>
                <View style={s.dot} />
                <Text style={s.bulletText}>{b}</Text>
              </View>
            ))}

            {i === 1 && (
              <View style={s.stepImgWrap}>
                <Image source={require("../../assets/images/RCP1.png")} style={s.stepImg} />
              </View>
            )}
            {i === 3 && (
              <View style={s.stepImgWrap}>
                <Image source={require("../../assets/images/RCP2.png")} style={s.stepImg} />
              </View>
            )}
            {(i === 2 || i === 4) && mode === "guide" && (
              <View style={s.pulseWrap}>
                <View style={s.pulseArea}>
                  <Animated.View style={[s.pulseOuter, { opacity, transform: [{ scale }] }]} />
                  <View style={s.pulseInner} />
                </View>
                <Text style={s.pulseHint}>Siga o ritmo para 100‑120 compressões/min</Text>
              </View>
            )}
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={s.container}>
      <View style={s.header}>
        <Text style={s.title}>RCP</Text>
        {mode === "guide" && (
          <Text style={s.subtitle}>Passo {index + 1} de {total}</Text>
        )}
        <Text style={s.medicalNotice}>Guia educativo. Em emergencia real, ligue 192.</Text>
        <Text style={s.medicalNotice}>{emergencyMedicalSource}</Text>
        <Text style={s.medicalNotice}>Revisado em: {emergencyMedicalReviewedAt}</Text>
        <TouchableOpacity style={s.close} onPress={() => router.back()}>
          <Ionicons name="close" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      {mode === "guide" && (
        <View style={s.progressBar}>
          <View style={[s.progress, { width: `${percent}%` }]} />
        </View>
      )}

      <ScrollView contentContainerStyle={s.content}>
        {mode === "overview" && (
          <Text style={{ color: "#fff", marginBottom: 6 }}>
            Um guia passo a passo para realizar RCP (com e sem ventilações).
          </Text>
        )}
        {steps.map((st, i) => (
          <StepCard key={i} i={i} step={st} />
        ))}
      </ScrollView>

      {mode === "overview" ? (
        <View style={s.footerSingle}>
          <TouchableOpacity style={[s.primaryBtn, s.primaryBtnLarge]} onPress={() => { setMode("guide"); setIndex(0); }}>
            <Text style={s.primaryText}>Iniciar Guia</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={s.footer}>
          <TouchableOpacity style={s.secondaryBtn} onPress={prev} disabled={index === 0}>
            <Ionicons name="arrow-back" size={18} color="#fff" />
          </TouchableOpacity>

          {index < total - 1 ? (
            <TouchableOpacity style={[s.primaryBtn, s.primaryBtnLarge]} onPress={next}>
              <Text style={s.primaryText}>Próximo passo</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={[s.primaryBtn, s.primaryBtnLarge]} onPress={() => Linking.openURL("tel:192")}>
              <Text style={s.primaryText}>Ligar 192</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity style={s.secondaryBtn} onPress={() => setPlaying((p) => !p)}>
            <Ionicons name={playing ? "pause" : "play"} size={18} color="#fff" />
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
};

export default RCP;

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FF4B4B",
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "bold",
  },
  subtitle: {
    color: "#fff",
    opacity: 0.9,
    marginTop: 4,
  },
  medicalNotice: {
    color: "#FFE3E3",
    fontSize: 11,
    textAlign: "center",
    marginTop: 2,
    opacity: 0.9,
  },
  close: {
    position: "absolute",
    right: 16,
    top: 8,
    backgroundColor: "rgba(255,255,255,0.25)",
    borderRadius: 16,
    padding: 6,
  },
  progressBar: {
    height: 6,
    marginHorizontal: 16,
    borderRadius: 3,
    backgroundColor: "rgba(255,255,255,0.35)",
  },
  progress: {
    height: 6,
    backgroundColor: "#fff",
    borderRadius: 3,
  },
  content: {
    padding: 16,
    gap: 12,
  },
  card: {
    backgroundColor: "#151515",
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  cardStep: {
    color: "#FFB4B4",
    fontWeight: "700",
    marginBottom: 2,
  },
  cardTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },
  cardBody: {
    marginTop: 8,
    paddingHorizontal: 12,
    paddingBottom: 12,
  },
  bulletRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#fff",
    marginTop: 8,
    marginRight: 8,
  },
  bulletText: {
    color: "#fff",
    fontSize: 16,
    lineHeight: 22,
  },
  stepImgWrap: {
    marginTop: 12,
    padding: 0,
    alignItems: "center",
  },
  stepImg: {
    width: "100%",
    height: 220,
    resizeMode: "contain",
    borderRadius: 0,
  },
  footer: {
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  footerSingle: {
    padding: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryBtn: {
    backgroundColor: "#fff",
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 22,
  },
  primaryBtnLarge: {
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 28,
    minWidth: 220,
    alignItems: "center",
  },
  primaryText: {
    color: "#FF4B4B",
    fontWeight: "700",
  },
  secondaryBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(0,0,0,0.25)",
    alignItems: "center",
    justifyContent: "center",
  },
  // Pulso
  pulseWrap: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 12,
    padding: 10,
  },
  pulseArea: {
    width: 180,
    height: 180,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  pulseOuter: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 90,
    backgroundColor: "rgba(255,255,255,0.35)",
  },
  pulseInner: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: "#fff",
  },
  pulseHint: {
    color: "#fff",
    marginTop: 8,
    textAlign: "center",
  },
});
