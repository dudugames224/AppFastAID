import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useMemo, useState } from "react";
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
import { applyLifeRegeneration, startLifeCountdown } from "../services/lifeService";

type ThemeColors = ReturnType<typeof useTheme>["colors"];

interface UserStatsBarProps {
  containerStyle?: StyleProp<ViewStyle>;
}

interface UserStats {
  lives: number;
  ofensiva: number;
  isPremium: boolean;
  safiras: number;
}

const DEFAULT_LIVES = 5;
const ofensivaIcon = require("../../assets/images/ofensiva.png");
const safiraIcon = require("../../assets/images/torneios.png");

const UserStatsBar: React.FC<UserStatsBarProps> = ({ containerStyle }) => {
  const router = useRouter();
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [stats, setStats] = useState<UserStats>({
    lives: DEFAULT_LIVES,
    ofensiva: 0,
    isPremium: false,
    safiras: 0,
  });
  const [loading, setLoading] = useState(true);
  const [restoringLives, setRestoringLives] = useState(false);

  const loadStats = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getUserData();
      if (data) {
        const normalizedLives =
          typeof (data as any).lives === "number"
            ? (data as any).lives
            : typeof (data as any).vidas === "number"
            ? (data as any).vidas
            : DEFAULT_LIVES;
        const normalizedStreak =
          typeof (data as any).ofensiva === "number"
            ? (data as any).ofensiva
            : typeof (data as any).streak === "number"
            ? (data as any).streak
            : 0;
        const regenerated = applyLifeRegeneration({
          lives: normalizedLives,
          lastLifeUpdate: (data as any).lastLifeUpdate ?? null,
        });

        if (!Boolean((data as any).isPremium) && regenerated.lives !== normalizedLives) {
          const user = auth.currentUser;
          if (user) {
            const userDocRef = doc(db, "users", user.uid);
            await updateDoc(userDocRef, {
              lives: regenerated.lives,
              vidas: regenerated.lives,
              lastLifeUpdate: regenerated.lastLifeUpdate,
            });
          }
        }

        setStats({
          lives: regenerated.lives,
          ofensiva: normalizedStreak,
          isPremium: Boolean((data as any).isPremium),
          safiras:
            typeof (data as any).safiras === "number"
              ? (data as any).safiras
              : typeof (data as any).safira === "number"
              ? (data as any).safira
              : 0,
        });
      } else {
        setStats({ lives: DEFAULT_LIVES, ofensiva: 0, isPremium: false, safiras: 0 });
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

  const handleRestoreLives = useCallback(async () => {
    if (restoringLives) {
      return;
    }
    if (stats.isPremium) {
      Alert.alert("Premium ativo", "Voce ja tem vidas infinitas.");
      return;
    }
    const user = auth.currentUser;
    if (!user) {
      Alert.alert("Conta necessaria", "Entre na sua conta para restaurar as vidas.");
      return;
    }
    try {
      setRestoringLives(true);
      const userDocRef = doc(db, "users", user.uid);
      await updateDoc(userDocRef, {
        lives: DEFAULT_LIVES,
        vidas: DEFAULT_LIVES,
        lastLifeUpdate: startLifeCountdown(),
      });
      setStats((prev) => ({ ...prev, lives: DEFAULT_LIVES }));
      Alert.alert("Pronto!", "As 5 vidas foram restauradas.");
    } catch (error) {
      console.warn("Nao foi possivel restaurar as vidas:", error);
      Alert.alert("Ops", "Nao conseguimos restaurar as vidas. Tente novamente.");
    } finally {
      setRestoringLives(false);
    }
  }, [restoringLives, stats.isPremium]);

  return (
    <View style={[styles.wrapper, containerStyle]}>
      <TouchableOpacity
        style={styles.statItem}
        activeOpacity={0.8}
        onPress={handleRestoreLives}
        disabled={restoringLives}
      >
        <View style={styles.iconCircle}>
          <HeartIcon />
        </View>
        <View style={styles.statText}>
          <Text style={styles.value}>{loading ? "--" : stats.isPremium ? "∞" : stats.lives}</Text>
          <Text style={styles.label}>{stats.isPremium ? "Premium" : "Vidas"}</Text>
        </View>
      </TouchableOpacity>

      <View style={styles.statItem}>
        <TouchableOpacity
          style={{ flexDirection: "row", alignItems: "center", gap: 10, flex: 1 }}
          activeOpacity={0.8}
          onPress={() => router.push("/screens/StreakScreen")}
        >
          <View style={styles.iconCircle}>
            <Image source={ofensivaIcon} style={styles.ofensivaIcon} />
          </View>
          <View style={styles.statText}>
            <Text style={styles.value}>{loading ? "--" : stats.ofensiva}</Text>
            <Text style={styles.label}>Ofensiva</Text>
          </View>
        </TouchableOpacity>
      </View>

      <View style={styles.statItem}>
        <View style={styles.iconCircle}>
          <Image source={safiraIcon} style={styles.safiraIcon} />
        </View>
        <View style={styles.statText}>
          <Text style={styles.value}>{loading ? "--" : stats.safiras}</Text>
          <Text style={styles.label}>Safiras</Text>
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
    safiraIcon: {
      width: 28,
      height: 28,
      resizeMode: "contain",
    },
  });

export default UserStatsBar;
