import React, { useEffect, useRef } from "react";

import { Animated, TouchableOpacity, View } from "react-native";
import { useTheme } from "../context/ThemeContext";
import {
    HomeIcon,
    PracticeIcon,
    ProfileIcon,
    ShopIcon,
    TrophyIcon,
} from "./Icons";

interface TabItemProps {
  item: {
    name: string;

    icon: React.FC<{ color?: string }>;

    key: string;
  };

  isActive: boolean;
  onNavigate: (screen: string) => void;
  styles: any; // Adiciona a prop para receber os estilos
}

const TabItem = ({ item, isActive, onNavigate, styles }: TabItemProps) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const Icon = item.icon;

  useEffect(() => {
    // Animação de "salto" para o ícone ativo

    Animated.spring(scaleAnim, {
      toValue: isActive ? 1.2 : 1,

      friction: 3,

      useNativeDriver: true,
    }).start();
  }, [isActive]);

  return (
    <TouchableOpacity
      onPress={() => onNavigate(item.key)}
      style={styles.tabItem}
    >
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <Icon color={isActive ? "#5D9CFB" : "#A9A9A9"} />
      </Animated.View>
    </TouchableOpacity>
  );
};

interface BarraNavegacaoProps {
  activeScreen: string;

  onNavigate: (screen: string) => void;
}

const BarraNavegacao = ({ activeScreen, onNavigate }: BarraNavegacaoProps) => {
  const menuItems = [
    { name: "APRENDER", icon: HomeIcon, key: "CourseScreen" },

    { name: "PRATICAR", icon: PracticeIcon, key: "PracticeScreen" },

    { name: "TORNEIOS", icon: TrophyIcon, key: "TournamentScreen" },

    { name: "LOJA", icon: ShopIcon, key: "TournamentScreen" },

    { name: "PERFIL", icon: ProfileIcon, key: "TournamentScreen" },
  ];

  const { styles } = useTheme(); // Pega os estilos diretamente do contexto global

  return (
    <View style={styles.tabBarContainer}>
      {menuItems.map((item) => (
        <TabItem
          key={item.name} // ✅ Alterado de item.key para item.name para garantir unicidade
          item={item}
          isActive={activeScreen === item.key}
          onNavigate={onNavigate}
          styles={styles} // Passa os estilos para o componente filho
        />
      ))}
    </View>
  );
};


export default BarraNavegacao;
