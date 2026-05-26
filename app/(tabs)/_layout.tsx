import { Ionicons } from "@expo/vector-icons";
import { Tabs, useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import { Modal, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { GlobalHeader } from "../components/GlobalHeader";
import { HomeIcon, PracticeIcon, ProfileIcon, ShopIcon, TrophyIcon } from "../components/Icons";
import { useTheme } from "../context/ThemeContext";

export default function TabsLayout() {
  const { colors, panicStyles } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [panicVisible, setPanicVisible] = useState(false);
  const [isOffline, setIsOffline] = useState(false);

  const checkConnection = useCallback(async () => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    try {
      const response = await fetch("https://clients3.google.com/generate_204", {
        method: "GET",
        cache: "no-store",
        signal: controller.signal,
      });
      setIsOffline(!(response.status >= 200 && response.status < 400));
    } catch {
      setIsOffline(true);
    } finally {
      clearTimeout(timeout);
    }
  }, []);

  useEffect(() => {
    checkConnection();
    const interval = setInterval(checkConnection, 10000);
    return () => clearInterval(interval);
  }, [checkConnection]);

  if (isOffline) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: colors.background,
          alignItems: "center",
          justifyContent: "center",
          padding: 24,
        }}
      >
        <TouchableOpacity
          style={{
            backgroundColor: "#FF4B4B",
            width: 88,
            height: 88,
            borderRadius: 44,
            alignItems: "center",
            justifyContent: "center",
            shadowColor: "#000",
            shadowOpacity: 0.3,
            shadowOffset: { width: 0, height: 3 },
            shadowRadius: 6,
            elevation: 6,
          }}
          activeOpacity={0.9}
          onPress={() => setPanicVisible(true)}
        >
          <Ionicons name="warning" size={40} color="#fff" />
        </TouchableOpacity>

        <Modal
          visible={panicVisible}
          // ANIMACAO: fade nativo do Modal ao abrir/fechar o modo panico offline.
          animationType="fade"
          transparent
          onRequestClose={() => setPanicVisible(false)}
        >
          <View style={panicStyles.centerBackdrop}>
            <View style={panicStyles.card}>
              <View style={panicStyles.cardHeader}>
                <Ionicons name="warning" size={22} color="#fff" />
              <Text style={panicStyles.cardTitle}>Modo Pânico</Text>
                <TouchableOpacity
                  onPress={() => setPanicVisible(false)}
                  style={panicStyles.cardClose}
                >
                  <Ionicons name="close" size={18} color="#fff" />
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={panicStyles.option}
                activeOpacity={0.9}
                onPress={() => {
                  setPanicVisible(false);
                  router.push("/screens/RCP");
                }}
              >
                <View style={panicStyles.optionIconCircle}>
                  <Ionicons name="medkit" size={20} color="#FF4B4B" />
                </View>
                <Text style={panicStyles.optionLabel}>RCP (Reanimação)</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    );
  }

  return (
    <Tabs
      screenOptions={{
        header: () => <GlobalHeader />,
        tabBarStyle: {
          backgroundColor: colors.background,
          borderTopColor: colors.border,
          height: 55 + insets.bottom,
          paddingTop: 10,
          paddingBottom: insets.bottom,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.text,
      }}
    >
      <Tabs.Screen
        name="CourseScreen"
        options={{
          title: "",
          tabBarShowLabel: false,
          tabBarIcon: ({ color }) => <HomeIcon color={color} />,
        }}
      />

      <Tabs.Screen
        name="PracticeScreen"
        options={{
          title: "",
          tabBarShowLabel: false,
          tabBarIcon: ({ color }) => <PracticeIcon color={color} />,
        }}
      />

      <Tabs.Screen
        name="TournamentScreen"
        options={{
          title: "",
          tabBarShowLabel: false,
          tabBarIcon: ({ color }) => <TrophyIcon color={color} />,
        }}
      />

      <Tabs.Screen
        name="StoreScreen"
        options={{
          title: "",
          tabBarShowLabel: false,
          tabBarIcon: ({ color }) => <ShopIcon color={color} />,
        }}
      />

      <Tabs.Screen
        name="ProfileScreen"
        options={{
          title: "",
          tabBarShowLabel: false,
          tabBarIcon: ({ color }) => <ProfileIcon color={color} />,
        }}
      />
    </Tabs>
  );
}
