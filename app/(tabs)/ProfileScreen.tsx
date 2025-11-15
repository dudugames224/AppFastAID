import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../context/ThemeContext";
import { getUserData, Sair } from "../firebaseConfig.js";
import { fetchCoursesMeta, RemoteCourseMeta } from "../services/lessonService";
import { getCompletedModules } from "../services/progressService";

const ProfileScreen = () => {
  const [userData, setUserData] = useState<any>(null);
  const [cursos, setCursos] = useState<RemoteCourseMeta[]>([]);
  const [StatusConquista, setStatusConquista] = useState<Record<string, boolean>>({});
  const { styles, colors, currentTheme, setCurrentTheme, panicStyles } =
      useTheme();
  const router = useRouter();

  function logout() {
    Sair();
    router.replace("/screens/login");
  }

  useEffect(() => {
    const fetchUserData = async () => {
      const data = await getUserData();
      if (data) {
        setUserData(data);
      }
    };

    fetchUserData();

    const checarPremios = async () => {
      const DadosCursos = await fetchCoursesMeta();
      setCursos(DadosCursos);

      const status: Record<string, boolean> = {};
      for (const curso of DadosCursos) {
        const ModulosCompletos = await getCompletedModules(curso.id); 
        if(ModulosCompletos.length>0){
          status[curso.id] = true;
          return(true)
        } else{
          return(false)
        }
          
        
        
      }
      setStatusConquista(status);
    };

    checarPremios();

  }, []);
  return (
    <SafeAreaView style={styles.safe}>
        <Image source={require("../../assets/images/band_no_celular.png")} style={{ width: 140, height: 140, alignSelf: "center" }} />
            <Text style={styles.titulo}>PERFIL</Text>
            <View style={[styles.containerPerfil,{margin:'3%'}]}>
              {/*
                <View style={styles.caixaPerfil}>
                    <Text style={{color:colors.text}}>Nome</Text>
                     <Text style={styles.titulo}>{userData ? userData.nome : "Carregando..."}</Text>
                     <Text style={{color:colors.text}}>XP:</Text>
                     <Text style={styles.titulo}>{userData ? userData.xp : 0}</Text>
                     <Text style={{color:colors.text}}>OFENSIVA:</Text>
                     <Text style={styles.titulo}>{userData ? userData.ofensiva : 0} dias</Text>
                     
            </View>
        */}
          <View style={[styles.caixaPerfil, {height:85}]}>

             
        
                <Text style={[styles.titulo]}>{userData ? userData.nome : "Carregando..."}</Text>
                
          </View>
          <View style={{flexDirection:"row", justifyContent:"space-between", alignItems:"center", width:"100%"}}>
              <View style={[styles.caixaPerfil,{ alignSelf:"flex-start",width:"47%", height:"100%" }]}>
                <Text style={[styles.titulo, {  marginBottom:0 }]}>{userData ? userData.xp : 0} XP</Text>
                </View>

                <View style={[styles.caixaPerfil,{ alignSelf:"flex-end",width:"47%",height:"100%" }]}>
                <Text style={[styles.titulo, {  marginBottom:0, fontSize:40 }]}>{userData ? userData.ofensiva : 0} DIAS</Text>
                </View>

                </View>
                <View style={[styles.caixaPerfil, {height:85}]}>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ alignItems: 'center' }}>
                    {cursos.map((curso) => (
                      <Image
                        key={curso.id}
                        source={curso.iconSource}
                        style={[
                          EstiloImagem.achievement,
                          !StatusConquista[curso.id] && EstiloImagem.grayscale, 
                        ]}
                      />
                    ))}
                  </ScrollView>
                </View>

              <View style={{ width: '100%', gap: 15 }}>
                <TouchableOpacity style={styles.caixaPerfil} onPress={logout}>
                  <Text style={[styles.textoBotao, { color: colors.text }]}>SAIR DA CONTA</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.caixaPerfil}
                  onPress={() => setCurrentTheme(currentTheme === "light" ? "dark" : "light")}
                >
                  <Text style={[styles.textoBotao, { color: colors.text }]}>TROCAR DE TEMA</Text>
                </TouchableOpacity>
              </View>
            </View>
            
    </SafeAreaView>
    
    
    
  );
};

export default ProfileScreen;

const EstiloImagem = StyleSheet.create({
  
  achievement: {
    width: 61,
    height: 62,
    borderRadius: 10,
    marginHorizontal: 10,
  },
  grayscale: {
    tintColor: "#238bccff",
  },
});