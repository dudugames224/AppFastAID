import { useFocusEffect } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Image,
  StyleProp,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";
import { useTheme } from "../context/ThemeContext";
import { auth, db, doc, getUserData, updateDoc } from "../firebaseConfig.js";
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
  const [restoringLives, setRestoringLives] = useState(false);

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

  const handleRestoreLives = useCallback(async () => {
    if (restoringLives) {
      return;
    }
    const user = auth.currentUser;
    if (!user) {
      Alert.alert("Conta necessária", "Entre na sua conta para restaurar as vidas.");
      return;
    }
    try {
      setRestoringLives(true);
      const userDocRef = doc(db, "users", user.uid);
      await updateDoc(userDocRef, { lives: DEFAULT_LIVES });
      setStats((prev) => ({ ...prev, lives: DEFAULT_LIVES }));
      Alert.alert("Pronto!", "As 5 vidas foram restauradas.");
    } catch (error) {
      console.warn("Nao foi possivel restaurar as vidas:", error);
      Alert.alert("Ops", "Não conseguimos restaurar as vidas. Tente novamente.");
    } finally {
      setRestoringLives(false);
    }
  }, [restoringLives]);

  return (
    <View style={[styles.wrapper, containerStyle]}>
      <TouchableOpacity
        style={styles.statItem}
        activeOpacity={0.8}
        onPress={handleRestoreLives}
        disabled={restoringLives}
      >
        <View style={styles.iconCircle}>
          <HeartIcon size={24} color="#FF4B4B" />
        </View>
        <View style={styles.statText}>
          <Text style={styles.value}>{loading ? "--" : stats.lives}</Text>
          <Text style={styles.label}>Vidas</Text>
        </View>
      </TouchableOpacity>

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
