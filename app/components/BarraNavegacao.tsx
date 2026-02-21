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
  styles: any; 
}

const TabItem = ({ item, isActive, onNavigate, styles }: TabItemProps) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const Icon = item.icon;

  useEffect(() => {

    Animated.spring(scaleAnim, {
      toValue: isActive ? 1.2 : 1,

      friction: 3,

      useNativeDriver: true,
    }).start();
  }, [isActive, scaleAnim]);

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

  const { styles } = useTheme(); 

  return (
    <View style={styles.tabBarContainer}>
      {menuItems.map((item) => (
        <TabItem
          key={item.name} 
          item={item}
          isActive={activeScreen === item.key}
          onNavigate={onNavigate}
          styles={styles} 
        />
      ))}
    </View>
  );
};


export default BarraNavegacao;
