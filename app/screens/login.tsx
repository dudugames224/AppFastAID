import { router } from "expo-router";
import { signInWithEmailAndPassword, User } from "firebase/auth";
import React, { useState } from "react";
import { Alert, Image, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { auth } from "../firebaseConfig";
import styles from "../styles";





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
    
    <SafeAreaView style={styles.containerLogin}>
     
        <Image source={require("../../assets/images/band_no_celular.png")} style={styles.imagem}/>
      
      
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


