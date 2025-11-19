import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
import React, { useCallback, useState } from "react";
import { Text, View } from "react-native";
import { useTheme } from "../context/ThemeContext";
import { getUserData } from "../firebaseConfig";
import { HeartIcon } from "./Icons";

export const GlobalHeader = () => {
  const { colors } = useTheme();
  const [userData, setUserData] = useState({ ofensiva: 0, lives: 5 });
  const {styles } = useTheme();


  useFocusEffect(
    useCallback(() => {
      const fetchData = async () => {
        const data = await getUserData();
        if (data) {
          setUserData({
            ofensiva: data.ofensiva || 0,
            lives: data.lives ?? 5, // Se 'lives' não existir, assume 5
          });
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
        paddingTop: 50, // Espaço para a status bar
        paddingBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
        
        <Ionicons name="flame" size={24} color={colors.primary} />
        
        <Text style={{ color: colors.text, fontWeight: "bold", fontSize: 16 }}>
          {userData.ofensiva}
        </Text>
        
      </View>
      <Text style={[styles.titulo,{fontSize:27}]}>FASTAID</Text>

      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
        <HeartIcon/>
        <Text style={{ color: colors.text, fontWeight: "bold", fontSize: 16 }}>
          {userData.lives}
        </Text>
      </View>
    </View>
  );
};