import React, { useState } from "react";
import {
  Image,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
  emergencyMedicalDisclaimer,
  emergencyMedicalReviewedAt,
  emergencyMedicalSource,
} from "../data/emergencyData";

type Step = {
  title: string;
  bullets: string[];
  image?: any;
};

const QUICK_RCP_TEXT =
  "Se a pessoa não responde e não respira normalmente, ligue 192 e faça compressões fortes e rápidas no centro do peito (100-120/min), até a ajuda chegar.";

const fullSteps: Step[] = [
  {
    title: "Introdução",
    bullets: [
      "Se for treinado em RCP com ventilações, use esse método.",
      "Se não estiver confiante, faça RCP somente com as mãos.",
    ],
  },
  {
    title: "RCP somente com as mãos",
    bullets: [
      "Ajoelhe-se ao lado da pessoa.",
      "Coloque a base de uma mão no centro do peito.",
      "Coloque a outra mão por cima e entrelace os dedos.",
      "Mantenha os ombros alinhados sobre as mãos.",
      "Comprima 5-6 cm usando o peso do corpo.",
      "Libere a pressão permitindo o tórax subir.",
      "Faça 100-120 compressões por minuto até a ajuda chegar.",
    ],
    image: require("../../assets/images/RCP1.png"),
  },
  {
    title: "Compressões torácicas",
    bullets: [
      "Mantenha o ritmo de 100-120 por minuto.",
      "Conte em voz alta para manter o ritmo (ex.: 1, 2, 3...).",
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
    image: require("../../assets/images/RCP2.png"),
  },
  {
    title: "Finalizar e chamar ajuda",
    bullets: [
      "Continue a RCP até a chegada de ajuda, exaustão ou recuperação de sinais de vida.",
      "Use um DEA (desfibrilador) assim que disponível e siga as instruções.",
    ],
  },
];

const RCP: React.FC = () => {
  const router = useRouter();
  const [showFullGuide, setShowFullGuide] = useState(false);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>RCP de emergência</Text>
        <TouchableOpacity style={styles.close} onPress={() => router.back()}>
          <Ionicons name="close" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Image source={require("../../assets/images/RCP1.png")} style={styles.image} />
        <Text style={styles.quickText}>{QUICK_RCP_TEXT}</Text>

        <TouchableOpacity
          style={styles.callButton}
          onPress={() => void Linking.openURL("tel:192")}
          activeOpacity={0.9}
        >
          <Ionicons name="call" size={18} color="#FF4B4B" />
          <Text style={styles.callButtonText}>Ligar 192 agora</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.expandButton}
          activeOpacity={0.85}
          onPress={() => setShowFullGuide((prev) => !prev)}
        >
          <Ionicons
            name={showFullGuide ? "chevron-up" : "chevron-down"}
            size={18}
            color="#fff"
          />
          <Text style={styles.expandButtonText}>
            {showFullGuide ? "Ocultar guia completo" : "Ver guia completo"}
          </Text>
        </TouchableOpacity>

        {showFullGuide && (
          <View style={styles.fullGuideContainer}>
            {fullSteps.map((step, stepIndex) => (
              <View key={step.title} style={styles.card}>
                <Text style={styles.cardTitle}>
                  {stepIndex + 1}. {step.title}
                </Text>
                {step.bullets.map((bullet) => (
                  <View key={`${step.title}-${bullet}`} style={styles.bulletRow}>
                    <View style={styles.bulletDot} />
                    <Text style={styles.bulletText}>{bullet}</Text>
                  </View>
                ))}
                {step.image && <Image source={step.image} style={styles.stepImage} />}
              </View>
            ))}

            <View style={styles.noticeCard}>
              <Text style={styles.noticeText}>{emergencyMedicalDisclaimer}</Text>
              <Text style={styles.noticeText}>{emergencyMedicalSource}</Text>
              <Text style={styles.noticeText}>Revisado em: {emergencyMedicalReviewedAt}</Text>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default RCP;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FF4B4B",
    paddingHorizontal: 16,
    paddingTop: 6,
  },
  header: {
    alignItems: "center",
    justifyContent: "center",
    minHeight: 44,
  },
  title: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "800",
  },
  close: {
    position: "absolute",
    right: 0,
    top: 4,
    backgroundColor: "rgba(255,255,255,0.25)",
    borderRadius: 16,
    padding: 6,
  },
  content: {
    paddingBottom: 16,
    alignItems: "center",
    gap: 14,
  },
  image: {
    width: "100%",
    maxWidth: 340,
    height: 220,
    resizeMode: "contain",
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.08)",
    marginTop: 6,
  },
  quickText: {
    color: "#fff",
    fontSize: 18,
    lineHeight: 28,
    fontWeight: "700",
    textAlign: "center",
    paddingHorizontal: 4,
  },
  callButton: {
    marginTop: 4,
    backgroundColor: "#fff",
    borderRadius: 999,
    paddingVertical: 14,
    paddingHorizontal: 22,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  callButtonText: {
    color: "#FF4B4B",
    fontSize: 18,
    fontWeight: "900",
  },
  expandButton: {
    marginTop: 2,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  expandButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "800",
  },
  fullGuideContainer: {
    width: "100%",
    gap: 12,
    marginTop: 2,
  },
  card: {
    backgroundColor: "#151515",
    borderRadius: 14,
    padding: 14,
    gap: 8,
  },
  cardTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 2,
  },
  bulletRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  bulletDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#fff",
    marginTop: 8,
    marginRight: 8,
  },
  bulletText: {
    flex: 1,
    color: "#fff",
    fontSize: 15,
    lineHeight: 22,
  },
  stepImage: {
    width: "100%",
    height: 200,
    resizeMode: "contain",
    marginTop: 6,
    borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  noticeCard: {
    backgroundColor: "rgba(0,0,0,0.26)",
    borderRadius: 12,
    padding: 12,
    gap: 4,
  },
  noticeText: {
    color: "#FFE3E3",
    fontSize: 12,
    lineHeight: 16,
  },
});
