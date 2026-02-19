import { Tabs } from "expo-router";
import React from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { GlobalHeader } from "../components/GlobalHeader";
import { HomeIcon, PracticeIcon, ProfileIcon, ShopIcon, TrophyIcon } from "../components/Icons"; // Seus ícones customizados
import { useTheme } from "../context/ThemeContext";

export default function TabsLayout() {
  const { colors } = useTheme(); 
  const insets = useSafeAreaInsets();

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
          tabBarIcon: ({ color }) => (
            <HomeIcon color={color}  /> 
          ),
        }}
      />

      <Tabs.Screen
        name="PracticeScreen" 
        options={{
          title: "", 
          tabBarShowLabel: false,
          tabBarIcon: ({ color }) => (
            <PracticeIcon color={color}  /> 
          ),
        }}
      />

      <Tabs.Screen
        name="TournamentScreen" 
        options={{
          title: "", 
          tabBarShowLabel: false,
          tabBarIcon: ({ color }) => (
            <TrophyIcon color={color}  /> 
          ),
        }}
      />

      <Tabs.Screen
        name="StoreScreen" 
        options={{
          title: "", 
          tabBarShowLabel: false,
          tabBarIcon: ({ color }) => (
            <ShopIcon color={color}  /> 
          ),
        }}
      />

      <Tabs.Screen
        name="ProfileScreen" 
        options={{
          title: "", 
          tabBarShowLabel: false,
          tabBarIcon: ({ color }) => (
            <ProfileIcon color={color}  /> 
          ),
        }}
      />

      
    </Tabs>
  );
}