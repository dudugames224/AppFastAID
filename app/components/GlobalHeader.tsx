import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import { Dimensions, Image, Text, TouchableOpacity, View } from "react-native";
import { useTheme } from "../context/ThemeContext";
import { getUserData } from "../firebaseConfig";
import { applyLifeRegeneration } from "../services/lifeService";
import { HeartIcon } from "./Icons";
const safiraIcon = require("../../assets/images/torneios.png");

export const GlobalHeader = () => {
  const { width, height } = Dimensions.get("window");
  const router = useRouter();
  const { colors, styles } = useTheme();
  const [userData, setUserData] = useState({
    ofensiva: 0,
    lives: 5,
    isPremium: false,
    safiras: 0,
  });

  useFocusEffect(
    useCallback(() => {
      const fetchData = async () => {
        try {
          const data = await getUserData();
          if (data) {
            const resolvedLives =
              typeof (data as any).lives === "number"
                ? (data as any).lives
                : typeof (data as any).vidas === "number"
                ? (data as any).vidas
                : 5;

            const regenerated = applyLifeRegeneration({
              lives: resolvedLives,
              lastLifeUpdate: (data as any).lastLifeUpdate ?? null,
            });

            setUserData({
              ofensiva: data.ofensiva || 0,
              lives: (data as any).isPremium ? resolvedLives : regenerated.lives,
              isPremium: Boolean((data as any).isPremium),
              safiras: typeof (data as any).safiras === "number" ? (data as any).safiras : 0,
            });
          }
        } catch (error) {
          console.warn("Nao foi possivel carregar header:", error);
        }
      };
      fetchData();
    }, [])
  );

  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-around",
        alignItems: "center",
        backgroundColor: colors.background,
        paddingTop: 30,
        paddingBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
      }}
    >
      <TouchableOpacity
        onPress={() => router.push("/screens/StreakScreen")}
        style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
      >
        <Ionicons name="flame" size={22} color={colors.primary} />
        <Text style={{ color: colors.text, fontWeight: "bold", fontSize: 15 }}>
          {userData.ofensiva}
        </Text>
      </TouchableOpacity>

      <Text style={[styles.titulo, { fontSize: 24 }]}>FASTAID</Text>

      <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
          <Image source={safiraIcon} style={{ width: 35, height: 40, resizeMode: "contain" }} />
          <Text style={{ color: colors.text, fontWeight: "bold", fontSize: 16 }}>
            {userData.safiras ?? 0}
          </Text>
        </View>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
          <HeartIcon />
          <Text style={{ color: colors.text, fontWeight: "bold", fontSize: 15 }}>
            {userData.isPremium ? "∞" : userData.lives}
          </Text>
        </View>
      </View>
    </View>
  );
};
