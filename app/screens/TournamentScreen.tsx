import React from "react";
import { Image, ScrollView, StyleSheet, Text, View } from "react-native";
import { leaderboardData } from "../data/courseData";

const TournamentScreen = () => {
  const user = { name: "Você", xp: 2100, avatar: "🙂" };
  const fullLeaderboard = [...leaderboardData, { rank: "?", name: `${user.name} (Você)`, xp: user.xp, avatar: user.avatar }].sort(
    (a: any, b: any) => b.xp - a.xp
  );

  return (
    <ScrollView style={styles.container}>
      <Image source={require("../../assets/images/torneios.png")} style={{ width: 120, height: 120, alignSelf: "center" }} />
      <Text style={styles.title}>🏆 Torneios</Text>
      <Text style={styles.subtitle}>Veja a sua posição no ranking semanal!</Text>
      <View style={styles.leaderboard}>
        {fullLeaderboard.map((player: any, index: number) => {
          const isCurrentUser = String(player.name).includes("(Você)");
          return (
            <View key={index} style={isCurrentUser ? styles.leaderboardRowUser : styles.leaderboardRow}>
              <Text style={{ fontWeight: "bold", width: 30, color: "#FFFFFF" }}>{index + 1}</Text>
              <Text style={{ fontSize: 24 }}>{player.avatar}</Text>
              <Text style={styles.playerName}>{player.name}</Text>
              <Text style={styles.playerXp}>{player.xp} XP</Text>
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#121212", padding: 20 },
  title: { fontSize: 28, fontWeight: "bold", color: "#FFFFFF", marginBottom: 10, textAlign: "center" },
  subtitle: { fontSize: 16, color: "#A9A9A9", marginBottom: 30, textAlign: "center" },
  leaderboard: { gap: 10 },
  leaderboardRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 15,
    padding: 15,
    borderRadius: 8,
    backgroundColor: "#1E1E1E",
    borderWidth: 1,
    borderColor: "#2D2D2D",
  },
  leaderboardRowUser: {
    flexDirection: "row",
    alignItems: "center",
    gap: 15,
    padding: 15,
    borderRadius: 8,
    backgroundColor: "#1C2541",
    borderWidth: 2,
    borderColor: "#3B82F6",
  },
  playerName: { flex: 1, fontSize: 16, color: "#FFFFFF" },
  playerXp: { fontWeight: "bold", fontSize: 16, color: "#FFFFFF" },
});

export default TournamentScreen;

