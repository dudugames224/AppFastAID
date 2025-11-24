import { useFocusEffect } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Image,
  StyleProp,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from "react-native";
import { useTheme } from "../context/ThemeContext";
import { getUserData } from "../firebaseConfig.js";
import { HeartIcon } from "./Icons";

type ThemeColors = ReturnType<typeof useTheme>["colors"];

interface UserStatsBarProps {
  containerStyle?: StyleProp<ViewStyle>;
}

interface UserStats {
  lives: number;
  ofensiva: number;
}

const DEFAULT_LIVES = 5;
const ofensivaIcon = require("../../assets/images/ofensiva.png");

const UserStatsBar: React.FC<UserStatsBarProps> = ({ containerStyle }) => {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [stats, setStats] = useState<UserStats>({
    lives: DEFAULT_LIVES,
    ofensiva: 0,
  });
  const [loading, setLoading] = useState(true);

  const loadStats = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getUserData();
      if (data) {
        const normalizedLives =
          typeof data.lives === "number"
            ? data.lives
            : typeof data.vidas === "number"
            ? data.vidas
            : DEFAULT_LIVES;
        const normalizedStreak =
          typeof data.ofensiva === "number"
            ? data.ofensiva
            : typeof data.streak === "number"
            ? data.streak
            : 0;
        setStats({
          lives: normalizedLives,
          ofensiva: normalizedStreak,
        });
      } else {
        setStats({ lives: DEFAULT_LIVES, ofensiva: 0 });
      }
    } catch (error) {
      console.warn("Nao foi possivel carregar os dados do usuario:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadStats();
    }, [loadStats])
  );

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  return (
    <View style={[styles.wrapper, containerStyle]}>
      <View style={styles.statItem}>
        <View style={styles.iconCircle}>
          <HeartIcon size={24} color="#FF4B4B" />
        </View>
        <View style={styles.statText}>
          <Text style={styles.value}>{loading ? "--" : stats.lives}</Text>
          <Text style={styles.label}>Vidas</Text>
        </View>
      </View>

      <View style={styles.statItem}>
        <View style={styles.iconCircle}>
          <Image source={ofensivaIcon} style={styles.ofensivaIcon} />
        </View>
        <View style={styles.statText}>
          <Text style={styles.value}>{loading ? "--" : stats.ofensiva}</Text>
          <Text style={styles.label}>Ofensiva</Text>
        </View>
      </View>
    </View>
  );
};

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    wrapper: {
      width: "100%",
      paddingHorizontal: 20,
      paddingTop: 12,
      paddingBottom: 16,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      backgroundColor: colors.background,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      gap: 24,
    },
    statItem: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
    },
    iconCircle: {
      width: 36,
      height: 36,
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
    },
    statText: {
      justifyContent: "center",
    },
    value: {
      fontSize: 18,
      fontWeight: "bold",
      color: colors.text,
    },
    label: {
      fontSize: 12,
      color: colors.text,
      opacity: 0.7,
    },
    ofensivaIcon: {
      width: 26,
      height: 26,
      resizeMode: "contain",
    },
  });

export default UserStatsBar;
