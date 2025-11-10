import { router } from "expo-router";
import { createUserWithEmailAndPassword, User } from "firebase/auth";
import React, { useState } from "react";
import { Image, Text, TextInput, TouchableOpacity, useColorScheme, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Checkbox from "../components/Checkbox";
import { auth, db, doc, setDoc } from "../firebaseConfig.js";
import getThemedStyles from "../styles";

export default function CadastrarScreen() {
  const [user, setUser] = useState<User | null>(null);
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [nome, setNome] = useState("");
  const [aceiteDeTermos, setAceiteDeTermos] = useState(false);
    const colorScheme = useColorScheme();

    const { styles, panicStyles } = getThemedStyles(colorScheme);


  const cadastrar = async () => {
    try {
      if (!aceiteDeTermos) {
        alert("É necessário aceitar os termos e condições para continuar.");
      }
      const temCaractereEspecial = /[^A-Za-z0-9]/.test(senha);
      if (!temCaractereEspecial) {
        alert("Insira um caracter especial!");
        return;
      }

      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        senha
      );
      setUser(userCredential.user);
      const userDocRef = doc(db, "users", userCredential.user.uid);
      await setDoc(userDocRef, {
        uid: userCredential.user.uid,
        nome: nome,
        email: email,
        aceiteDeTermos: aceiteDeTermos,
        xp: 0,
        safira: 0,
        ofensiva: 0,
      });
      console.log("Usuário cadastrado:", userCredential.user.email);
      router.replace("/screens/CourseScreen");
    } catch (error: any) {
      console.log("Erro ao cadastrar:", error.message);
      alert(`Erro: ${error.message}`);
    }
  };

  return (
    <SafeAreaView style={styles.containerLogin}>
      <Image
        style={styles.imagem}
        source={require("../../assets/images/band_no_celular.png")}
      />

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
        <Checkbox
          label="Eu aceito os termos e condições."
          value={aceiteDeTermos}
          onValueChange={setAceiteDeTermos}
        />
        <TouchableOpacity style={styles.botao} onPress={cadastrar}>
          <Text style={styles.textoBotao}>CADASTRAR</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => router.push("/screens/login")}
          style={styles.link}
        >
          <Text style={styles.textoLink}>Já tem login? Entre aqui</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
