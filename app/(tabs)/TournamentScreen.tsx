import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useMemo, useState } from "react";
import { ActivityIndicator, Image, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../context/ThemeContext";
import { auth, getUserData } from "../firebaseConfig";
import {
  fetchWeeklyLeaderboard,
  getCurrentWeeklySeason,
  WeeklyLeaderboardEntry,
} from "../services/tournamentService";

const TournamentScreen = () => {
  const { styles, colors } = useTheme();
  const [loading, setLoading] = useState(true);
  const [currentUserEntry, setCurrentUserEntry] = useState<WeeklyLeaderboardEntry | null>(null);
  const [leaderboardData, setLeaderboardData] = useState<WeeklyLeaderboardEntry[]>([]);
  const router = useRouter();
  const season = useMemo(() => getCurrentWeeklySeason(), []);

  useFocusEffect(
    useCallback(() => {
      let mounted = true;

      const fetchData = async () => {
        setLoading(true);
        try {
          const currentUserId = auth.currentUser?.uid ?? null;
          const [currentUserData, ranking] = await Promise.all([
            getUserData(),
            fetchWeeklyLeaderboard(200),
          ]);

          if (!mounted) return;

          const weeklyXp =
            currentUserData?.weeklySeasonId === season.id &&
            typeof currentUserData?.weeklyXp === "number"
              ? currentUserData.weeklyXp
              : 0;

          const currentEntryFromRanking =
            currentUserId !== null ? ranking.find((item) => item.uid === currentUserId) : undefined;

          const resolvedCurrentUser: WeeklyLeaderboardEntry | null =
            currentUserId && currentUserData
              ? {
                  uid: currentUserId,
                  name:
                    typeof currentUserData.nome === "string" && currentUserData.nome.trim()
                      ? `${currentUserData.nome} (Você)`
                      : "Você",
                  avatar:
                    typeof currentUserData.avatar === "string" && currentUserData.avatar.trim()
                      ? currentUserData.avatar
                      : ":-)",
                  xp: currentEntryFromRanking?.xp ?? weeklyXp,
                }
              : null;

          const others = ranking.filter((item) => item.uid !== currentUserId);
          setLeaderboardData(others);
          setCurrentUserEntry(resolvedCurrentUser);
        } catch {
          if (!mounted) return;
          setLeaderboardData([]);
          setCurrentUserEntry(null);
        } finally {
          if (mounted) setLoading(false);
        }
      };

      fetchData();

      return () => {
        mounted = false;
      };
    }, [season.id])
  );

  const fullLeaderboard = useMemo(() => {
    if (loading) return [];
    const entries = [...leaderboardData];
    if (currentUserEntry) entries.push(currentUserEntry);
    return entries.sort((a, b) => b.xp - a.xp);
  }, [currentUserEntry, leaderboardData, loading]);

  const handlePlayerPress = (playerId: string) => {
    if (playerId && playerId !== auth.currentUser?.uid) {
      router.push({ pathname: "/screens/UserProfileScreen", params: { userId: playerId } });
    }
  };

  const periodLabel = useMemo(() => {
    const start = new Date(season.startsAtIso);
    const end = new Date(season.endsAtIso);
    const startLabel = `${String(start.getUTCDate()).padStart(2, "0")}/${String(
      start.getUTCMonth() + 1
    ).padStart(2, "0")}`;
    const endLabel = `${String(end.getUTCDate()).padStart(2, "0")}/${String(
      end.getUTCMonth() + 1
    ).padStart(2, "0")}`;
    return `${startLabel} - ${endLabel}`;
  }, [season.endsAtIso, season.startsAtIso]);

  return (
    <SafeAreaView style={styles.safe} edges={["left", "right"]}>
      <ScrollView style={styles.tabContainer} contentContainerStyle={{ paddingBottom: 30 }}>
        <Image
          source={require("../../assets/images/band_atletico.png")}
          style={{ width: 140, height: 140, alignSelf: "center" }}
        />
        <Text style={styles.titulo}>TORNEIOS</Text>
        <Text style={styles.subtitle}>{`${season.label} (${periodLabel})`}</Text>

        {loading ? (
          <ActivityIndicator style={{ marginTop: 20 }} size="large" color={colors.primary} />
        ) : (
          <View style={styles.leaderboard}>
            {fullLeaderboard.map((player, index: number) => {
              const isCurrentUser = player.uid === auth.currentUser?.uid;
              return (
                <TouchableOpacity
                  key={player.uid || String(index)}
                  style={isCurrentUser ? styles.leaderboardRowUser : styles.leaderboardRow}
                  onPress={() => handlePlayerPress(player.uid)}
                  disabled={isCurrentUser}
                >
                  <Text style={{ fontWeight: "bold", width: 30, color: colors.text }}>{index + 1}</Text>
                  <Text style={{ fontSize: 24 }}>{player.avatar || ":-)"}</Text>
                  <Text style={styles.playerName}>{player.name}</Text>
                  <Text style={styles.playerXp}>{player.xp} XP</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default TournamentScreen;
