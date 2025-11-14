import React, { useEffect, useState } from "react";
import { Image, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../context/ThemeContext";
import { getUserData } from "../firebaseConfig.js";


const ProfileScreen = () => {
  const { styles,colors } = useTheme();
  const [userData, setUserData] = useState<any>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      const data = await getUserData();
      if (data) {
        setUserData(data);
      }
    };

    fetchUserData();
  }, []);
  return (
    <SafeAreaView style={styles.safe}>
        <Image source={require("../../assets/images/band_no_celular.png")} style={{ width: 140, height: 140, alignSelf: "center" }} />
            <Text style={styles.titulo}>PERFIL</Text>
            <View style={styles.containerPerfil}>
                <View style={styles.caixa}>
                    <Text style={{color:colors.text}}>Nome</Text>
                     <Text style={styles.titulo}>{userData ? userData.nome : "Carregando..."}</Text>
                     <Text style={{color:colors.text}}>XP:</Text>
                     <Text style={styles.titulo}>{userData ? userData.xp : 0}</Text>
                     <Text style={{color:colors.text}}>OFENSIVA:</Text>
                     <Text style={styles.titulo}>{userData ? userData.ofensiva : 0} dias</Text>
            </View>
            </View>
    </SafeAreaView>
    
    
  );
};

export default ProfileScreen;