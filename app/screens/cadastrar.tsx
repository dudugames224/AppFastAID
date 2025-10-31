import { router } from "expo-router";
import { createUserWithEmailAndPassword, User } from "firebase/auth";
import React, { useState } from "react";
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { auth, db, doc, setDoc } from "../firebaseConfig";

export default function CadastrarScreen() {
  const [user,setUser] = useState<User | null>(null);
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [nome, setNome] = useState("");

  const cadastrar = async () => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, senha);
      setUser(userCredential.user);
      const userDocRef = doc(db, "users", userCredential.user.uid);
      await setDoc(userDocRef, {
        uid: userCredential.user.uid,
        nome: nome,
        email: email,
      })
      console.log("Usuário cadastrado:", userCredential.user.email);
      router.replace('/screens/CourseScreen');

    } catch (error: any) {
      console.log("Erro ao cadastrar:", error.message);
      alert(`Erro: ${error.message}`);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.caixa}>
        <Text style={styles.titulo}>CADASTRO</Text>
        <TextInput
          style={styles.caixaInsercao}
          placeholder="Usuário"
          value={nome}
          onChangeText={setNome}
          placeholderTextColor="#aaa"
        />
        <TextInput
          style={styles.caixaInsercao}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          placeholderTextColor="#aaa"
        />
        <TextInput
          style={styles.caixaInsercao}
          placeholder="Senha"
          value={senha}
          onChangeText={setSenha}
          secureTextEntry
          placeholderTextColor="#aaa"
        />
        <TouchableOpacity style={styles.botao} onPress={cadastrar}>
          <Text style={styles.textoBotao}>CADASTRAR</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.push('/screens/login')} style={styles.link}><Text style={styles.textoLink}>Já tem login? Entre aqui</Text></TouchableOpacity>
      </View>
    </SafeAreaView>
  );
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
    padding:15,
    gap:15,
    borderRadius:20,
    paddingBottom:30,
   

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