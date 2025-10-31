import { router } from "expo-router";
import { signInWithEmailAndPassword, User } from "firebase/auth";
import React, { useState } from "react";
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { auth } from "../firebaseConfig";



export default function LoginScreen() {
  const [email,setEmail] = useState('');
  const [senha,setSenha] = useState('');
  const [user,setUser] = useState<User | null>(null);

  async function login() {
    try{
      const userCredential = await signInWithEmailAndPassword(auth, email, senha);
      setUser(userCredential.user);
      console.log("Usuário logado:", userCredential.user.email);
    
      router.replace('/screens/CourseScreen');

    } catch (error: any) {
      console.log("Erro ao fazer login:", error.message);
      Alert.alert("Erro no Login", "Email ou senha inválidos. Por favor, tente novamente.");
    }
  }

  return(
    
    <SafeAreaView style={styles.container}>
    <View style={styles.caixa}>
      <Text style={styles.titulo}>LOGIN</Text>
      <TextInput
        style={styles.caixaInsercao}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        placeholderTextColor="#aaa"
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        style={styles.caixaInsercao}
        secureTextEntry={true}
        placeholder="Senha" value={senha} onChangeText={setSenha}
        placeholderTextColor="#aaa" />
      <TouchableOpacity style={styles.botao} onPress={login}><Text style={styles.textoBotao}>ENTRAR</Text></TouchableOpacity>
      
      <TouchableOpacity onPress={() => router.push('/screens/cadastrar')} style={styles.link}><Text style={styles.textoLink}>Não tem login? Cadastre-se</Text></TouchableOpacity>
    </View>
  </SafeAreaView>
  )
  
  
}

const styles = StyleSheet.create({
  container:{
    flex:1,
    alignItems:"center",
    justifyContent:"center",
    backgroundColor: "#121212",
    
    


  },
  titulo:{
   //color: "#0eb6f8ff",
   color: "#238bccff",
    fontSize:40,
    textAlign:"center",
    fontWeight:"700",
    

  },
  caixa:{
    backgroundColor:"#1f1e1eff",
    padding:20,
    gap:15,
    borderRadius:20,
    paddingBottom:30
   

  },
  caixaInsercao:{
    backgroundColor: "#272626ff",
    borderRadius:10,
    padding:10,
    paddingLeft:12,
    width:300,
    height:45,
    color: "#fff"

  },
  botao:{
    backgroundColor:"#238bccff",
    padding:10,
    borderRadius:7,


  },
  textoBotao:{
    color: "#fff",
    fontWeight:"700",
    textAlign:"center"

  },
  link:{

  },
  textoLink:{
    color: "#238bccff",
    textAlign:"center",

  }

    
  })
