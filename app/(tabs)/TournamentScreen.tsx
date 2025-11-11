import React from "react";
import { Image, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../context/ThemeContext";
import { leaderboardData } from "../data/courseData";






const TournamentScreen = () => {
      const { styles, colors, currentTheme, setCurrentTheme } = useTheme();
  
  const user = { name: "Você", xp: 2100, avatar: "🙂" };
  const fullLeaderboard = [...leaderboardData, { rank: "?", name: `${user.name} (Você)`, xp: user.xp, avatar: user.avatar }].sort(
    (a: any, b: any) => b.xp - a.xp
  );
 

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView style={styles.container}>
      <Image source={require("../../assets/images/torneios.png")} style={{ width: 120, height: 120, alignSelf: "center" }} />
      <Text style={styles.title}>🏆 Torneios</Text>
      <Text style={styles.subtitle}>Veja a sua posição no ranking semanal!</Text>
      
      <View style={styles.leaderboard}>
        {fullLeaderboard.map((player: any, index: number) => {
          const isCurrentUser = String(player.name).includes("(Você)");
          return (
            <View key={index} style={isCurrentUser ? styles.leaderboardRowUser : styles.leaderboardRow}>
              <Text style={{ fontWeight: "bold", width: 30, color: colors.text }}>{index + 1}</Text>
              <Text style={{ fontSize: 24 }}>{player.avatar}</Text>
              <Text style={styles.playerName}>{player.name}</Text>
              <Text style={styles.playerXp}>{player.xp} XP</Text>
            </View>
          );
        })}
      </View>
      
    </ScrollView>
    </SafeAreaView>
  );
};



export default TournamentScreen;

