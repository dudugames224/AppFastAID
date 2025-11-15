import { Tabs } from "expo-router"; // ✅ Importar Tabs do expo-router
import React from "react";
import { HomeIcon, PracticeIcon, ProfileIcon, ShopIcon, TrophyIcon } from "../components/Icons"; // Seus ícones customizados
import { useTheme } from "../context/ThemeContext";

export default function TabsLayout() {
  const { colors } = useTheme(); // ✅ Pegar as cores do tema

  return (
    <Tabs
      screenOptions={{
        tabBarStyle: {
          backgroundColor: colors.background,
          borderTopColor: colors.border,
          height: 70, // Altura da barra
          paddingTop: 7, // Ajuste para posicionamento vertical
          paddingBottom: 5, // Ajuste para posicionamento vertical
        },
        tabBarActiveTintColor: colors.primary, // Cor do ícone ativo
        tabBarInactiveTintColor: colors.text, // Cor do ícone inativo
        headerShown: false, // Esconde o cabeçalho padrão para todas as telas de aba
      }}
    >
      <Tabs.Screen
        name="CourseScreen" // Nome do arquivo dentro de app/(tabs)/CourseScreen.tsx
        options={{
          title: "", // Sem texto abaixo do ícone
          tabBarShowLabel: false,
          tabBarIcon: ({ color }) => (
            <HomeIcon color={color}  /> // ✅ Passando o size
          ),
        }}
      />

      <Tabs.Screen
        name="PracticeScreen" // Nome do arquivo dentro de app/(tabs)/PracticeScreen.tsx
        options={{
          title: "", // Sem texto abaixo do ícone
          tabBarShowLabel: false,
          tabBarIcon: ({ color }) => (
            <PracticeIcon color={color}  /> // ✅ Passando o size
          ),
        }}
      />

      <Tabs.Screen
        name="TournamentScreen" // Nome do arquivo dentro de app/(tabs)/TournamentScreen.tsx
        options={{
          title: "", // Sem texto abaixo do ícone
          tabBarShowLabel: false,
          tabBarIcon: ({ color }) => (
            <TrophyIcon color={color}  /> // ✅ Passando o size
          ),
        }}
      />

      <Tabs.Screen
        name="StoreScreen" // Nome do arquivo dentro de app/(tabs)/StoreScreen.tsx
        options={{
          title: "", // Sem texto abaixo do ícone
          tabBarShowLabel: false,
          tabBarIcon: ({ color }) => (
            <ShopIcon color={color}  /> // ✅ Passando o size
          ),
        }}
      />

      <Tabs.Screen
        name="ProfileScreen" // Nome do arquivo dentro de app/(tabs)/ProfileScreen.tsx
        options={{
          title: "", // Sem texto abaixo do ícone
          tabBarShowLabel: false,
          tabBarIcon: ({ color }) => (
            <ProfileIcon color={color}  /> // ✅ Passando o size
          ),
        }}
      />

      
    </Tabs>
  );
}