import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import { Image, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../context/ThemeContext";
import { auth, getAllUsers, getUserData } from "../firebaseConfig.js";

const TournamentScreen = () => {
  const { styles, colors, currentTheme, setCurrentTheme } = useTheme();
  const [userData, setUserData] = useState<any>(null);
  const [leaderboardData, setLeaderboardData] = useState<any[]>([]);
  const router = useRouter();

  useFocusEffect(
    useCallback(() => {
          const fetchData = async () => {
            // Busca os dados do usuário logado
            const currentUserData = await getUserData();
            if (currentUserData) {
              setUserData(currentUserData);
            }

            // Busca os dados de todos os usuários para o leaderboard
            const allUsers = await getAllUsers();
            const currentUserId = auth.currentUser?.uid;

            // Filtra e formata os dados dos outros usuários
            const otherUsers = allUsers
              .filter(user => user.id !== currentUserId)
              .map(user => ({
                id: user.id,
                name: user.nome, // Mapeia 'nome' para 'name'
                xp: user.xp,
                avatar: user.avatar || '👤'
              }));
              setLeaderboardData(otherUsers);
          };
      
      fetchData();
    }, [])
  );

  const fullLeaderboard = [...leaderboardData, { id: "currentUser", rank: "?", name: `${userData?.nome || 'Você'} (Você)`, xp: userData?.xp || 0, avatar: userData?.avatar || "🙂" }].sort(
    (a: any, b: any) => b.xp - a.xp
  );
 
  const handlePlayerPress = (playerId: string) => {
    if (playerId && playerId !== 'currentUser') {
      router.push({ pathname: "/screens/UserProfileScreen", params: { userId: playerId } });
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 30 }}>
      <Image source={require("../../assets/images/band_atletico.png")} style={{ width: 140, height: 140, alignSelf: "center" }} />
      <Text style={styles.titulo}>TORNEIOS</Text>
      <Text style={styles.subtitle}>Veja a sua posição no ranking semanal!</Text>
      
      <View style={styles.leaderboard}>
        {fullLeaderboard.map((player: any, index: number) => {
          const isCurrentUser = String(player.name).includes("(Você)");
          return (
            <TouchableOpacity
              key={player.id || index}
              style={isCurrentUser ? styles.leaderboardRowUser : styles.leaderboardRow}
              onPress={() => handlePlayerPress(player.id)}
              disabled={isCurrentUser}
            >
              <Text style={{ fontWeight: "bold", width: 30, color: colors.text }}>{index + 1}</Text>
              <Text style={{ fontSize: 24 }}>{player.avatar || '👤'}</Text>
              <Text style={styles.playerName}>{player.name}</Text>
              <Text style={styles.playerXp}>{player.xp} XP</Text>
            </TouchableOpacity>
          );
        })}
      </View>
      
    </ScrollView>
    </SafeAreaView>
  );
};



export default TournamentScreen;
