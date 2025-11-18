import { useLocalSearchParams, useRouter } from "expo-router";
import { doc, getDoc } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../context/ThemeContext";
import { db } from "../firebaseConfig";
import { getUserAchievements } from "../services/progressService.js";

const UserProfileScreen = () => {
  const { userId } = useLocalSearchParams<{ userId: string }>();
  const { styles, colors } = useTheme();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<any>(null);
  const [achievementData, setAchievementData] = useState<any>({
    achievements: {},
    courses: [],
  });

  useEffect(() => {
    if (!userId) {
      router.back();
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      // Buscar dados do usuário
      const userDocRef = doc(db, "users", userId);
      const userDoc = await getDoc(userDocRef);
      if (userDoc.exists()) {
        setUserData(userDoc.data());
      }

      // Buscar conquistas
      const achievements = await getUserAchievements(userId);
      setAchievementData(achievements);

      setLoading(false);
    };

    fetchData();
  }, [userId]);

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <ActivityIndicator style={{ flex: 1 }} size="large" />
      </SafeAreaView>
    );
  }

  if (!userData) {
    return (
      <SafeAreaView style={styles.safe}>
        <Text style={styles.titulo}>Usuário não encontrado</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={{ flex: 1 }}>
        <TouchableOpacity onPress={() => router.back()} style={{ padding: 10, alignSelf: 'flex-start', marginLeft: 10 }}>
          <Text style={{ color: colors.primary, fontSize: 16 }}>Voltar</Text>
        </TouchableOpacity>
        <ScrollView contentContainerStyle={{ alignItems: "center", padding: 20, paddingBottom: 40 }}>
          <Text style={{ fontSize: 60 }}>{userData.avatar || "👤"}</Text>
          <Text style={[styles.titulo, { marginTop: 10 }]}>{userData.nome}</Text>

          <View style={{ flexDirection: "row", gap: 20, marginVertical: 20 }}>
            <View style={[styles.caixaPerfil, { alignSelf:"flex-start",width:"47%", height:"100%" }]}>
              <Text style={[styles.titulo, { fontSize: 24 }]}>{userData.xp || 0} XP</Text>
            </View>
            <View style={[styles.caixaPerfil, { alignSelf:"flex-start",width:"47%", height:"100%" }]}>
              <Text style={[styles.titulo, { fontSize: 24 }]}>{userData.ofensiva || 0} Dias</Text>
            </View>
          </View>

          <Text style={[styles.titulo, { fontSize: 20, marginBottom: 10 }]}>Conquistas</Text>
          <View style={[styles.caixaPerfil, { height: 85, width: '100%' }]}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ alignItems: 'center' }}>
              {achievementData.courses.map((curso: any) => (
                <Image
                  key={curso.id}
                  source={curso.iconSource}
                  style={[EstiloImagem.achievement, !achievementData.achievements[curso.id] && EstiloImagem.grayscale]}
                />
              ))}
            </ScrollView>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const EstiloImagem = StyleSheet.create({
  achievement: { width: 61, height: 62, borderRadius: 10, marginHorizontal: 10 },
  grayscale: { tintColor: "#238bccff" },
});

export default UserProfileScreen;