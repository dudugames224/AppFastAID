import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { sendPasswordResetEmail, signInWithEmailAndPassword, User } from "firebase/auth";
import React, { useState } from "react";
import { Alert, Image, KeyboardAvoidingView, Modal, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../context/ThemeContext";
import { auth } from "../firebaseConfig.js";

export default function LoginScreen() {
  const { styles, panicStyles } = useTheme(); // Pega os estilos diretamente do contexto global
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [user, setUser] = useState<User | null>(null);
  const [panicVisible, setPanicVisible] = useState(false);

  async function login() {
    try{
      const userCredential = await signInWithEmailAndPassword(auth, email, senha);
      setUser(userCredential.user);
      console.log("Usuário logado:", userCredential.user.email);
    
      router.replace('../(tabs)/CourseScreen');

    } catch (error: any) {
      console.log("Erro ao fazer login:", error.message);
      Alert.alert("Erro no Login", "Email ou senha inválidos. Por favor, tente novamente.");
    }
  }

  async function EsqueciMinhaSenha() {
    if (email === "") {
      Alert.alert("Redefinir Senha", "Por favor, digite seu e-mail no campo correspondente para redefinir sua senha.");
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email);
      Alert.alert("Redefinir Senha", "Um e-mail foi enviado para você com as instruções para redefinir sua senha. Verifique sua caixa de entrada e spam.");
    } catch (error: any) {
      Alert.alert("Erro", "Não foi possível enviar o e-mail de redefinição. Verifique se o e-mail está correto.");
    }
  }

  return(
    
    <SafeAreaView style={styles.containerLogin}>
     
        
    <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
          >
    <ScrollView contentContainerStyle={{ flexGrow: 1}}>
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
      <TouchableOpacity onPress={EsqueciMinhaSenha} style={styles.link}><Text style={styles.textoLink}>Esqueci minha senha</Text></TouchableOpacity>
    </View>
    <View style={styles.sosButton} pointerEvents="box-none">
        <TouchableOpacity style={styles.sosTouchable} activeOpacity={0.9} onPress={() => setPanicVisible(true)}>
          <Ionicons name="warning" size={30} color="#fff" />
        </TouchableOpacity>
      </View>
    <Modal visible={panicVisible} animationType="fade" transparent onRequestClose={() => setPanicVisible(false)}>
        <View style={panicStyles.centerBackdrop}>
          <View style={panicStyles.card}>
            <View style={panicStyles.cardHeader}>
              <Ionicons name="warning" size={22} color="#fff" />
              <Text style={panicStyles.cardTitle}>Modo Pânico</Text>
              <TouchableOpacity onPress={() => setPanicVisible(false)} style={panicStyles.cardClose}>
                <Ionicons name="close" size={18} color="#fff" />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={panicStyles.option}
              activeOpacity={0.9}
              onPress={() => {
                setPanicVisible(false);
                router.push("/screens/RCP"); // Caminho absoluto para a tela RCP
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
      </ScrollView>
      </KeyboardAvoidingView>
  </SafeAreaView>
  )
  
  
}
