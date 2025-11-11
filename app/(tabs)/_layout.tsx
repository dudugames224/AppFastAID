import { Tabs } from "expo-router"; // ✅ Importar Tabs do expo-router
import React from "react";
import { HomeIcon, PracticeIcon, TrophyIcon } from "../components/Icons"; // Seus ícones customizados
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
          paddingTop: 5, // Ajuste para posicionamento vertical
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

      {/* Adicione outras Tabs.Screen aqui para cada tela que você mover para (tabs) */}
      {/* Exemplo:
      <Tabs.Screen
        name="ShopScreen"
        options={{ title: "", tabBarShowLabel: false, tabBarIcon: ({ color, size }) => <ShopIcon color={color} size={size} /> }}
      />
      */}
    </Tabs>
  );
}