import { router } from "expo-router";
import { createUserWithEmailAndPassword } from "firebase/auth";
import React, { useEffect, useState } from "react";
import { Image, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Checkbox from "../components/Checkbox";
import { useTheme } from "../context/ThemeContext";
import { auth, db, doc, setDoc } from "../firebaseConfig.js";
import { fetchAppSettings } from "../services/lessonService";

const PASSWORD_REQUIREMENTS = [
  "No minimo 8 caracteres",
  "Pelo menos uma letra maiuscula",
  "Pelo menos um numero",
  "Pelo menos um caractere especial (ex.: ! # @ $ % & *)",
];

const CODIGO_TURMA = "McQueen";

const getPasswordValidation = (value: string) => ({
  minLength: value.length >= 8,
  hasUppercase: /[A-Z]/.test(value),
  hasNumber: /\d/.test(value),
  hasSpecial: /[^A-Za-z0-9]/.test(value),
});

export default function CadastrarScreen() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [nome, setNome] = useState("");
  const [dataNascimento, setDataNascimento] = useState("");
  const [turma, setTurma] = useState("");
  const [codigoTurma, setCodigoTurma] = useState("");
  const [codigoTurmaObrigatorio, setCodigoTurmaObrigatorio] = useState(true);
  const [codigoTurmaAceito, setCodigoTurmaAceito] = useState(CODIGO_TURMA);
  const [sexo, setSexo] = useState("");
  const [aceiteDeTermos, setAceiteDeTermos] = useState(false);
  
  const { styles, colors, currentTheme } = useTheme();
  const normalizeText = (value: string) =>
    value
      .trim()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");

  const formatBirthDate = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 8);
    if (digits.length <= 2) return digits;
    if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
    return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
  };

  const parseBirthDate = (value: string): Date | null => {
    const match = value.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    if (!match) return null;
    const day = Number(match[1]);
    const month = Number(match[2]);
    const year = Number(match[3]);
    const parsed = new Date(year, month - 1, day);

    if (
      parsed.getFullYear() !== year ||
      parsed.getMonth() !== month - 1 ||
      parsed.getDate() !== day
    ) {
      return null;
    }
    return parsed;
  };

  const getAgeFromBirthDate = (birthDate: Date) => {
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const hasNotHadBirthdayYet =
      today.getMonth() < birthDate.getMonth() ||
      (today.getMonth() === birthDate.getMonth() &&
        today.getDate() < birthDate.getDate());
    if (hasNotHadBirthdayYet) age -= 1;
    return age;
  };

  const isValidBirthDate = (value: string) => {
    const parsed = parseBirthDate(value);
    if (!parsed) return false;
    const age = getAgeFromBirthDate(parsed);
    return age >= 0 && age <= 120;
  };

  useEffect(() => {
    let isMounted = true;

    const loadClassCodeSettings = async () => {
      const settings = await fetchAppSettings();
      if (!isMounted) return;

      setCodigoTurmaObrigatorio(settings.isClassCodeRequired === true);
      setCodigoTurmaAceito(settings.classRegistrationCode || CODIGO_TURMA);
    };

    loadClassCodeSettings();

    return () => {
      isMounted = false;
    };
  }, []);

  const cadastrar = async () => {
    try {
      if (!aceiteDeTermos) {
        alert("É necessário aceitar os termos e condições para continuar.");
        return;
      }
      if (!nome || !dataNascimento || !turma || !sexo || !email || !senha) {
        alert("Por favor, preencha todos os campos.");
        return;
      }

      if (codigoTurmaObrigatorio && !codigoTurma) {
        alert("Por favor, preencha todos os campos.");
        return;
      }

      if (!isValidBirthDate(dataNascimento)) {
        alert("Informe uma data de nascimento valida no formato DD/MM/AAAA.");
        return;
      }

      if (codigoTurmaObrigatorio && codigoTurma !== codigoTurmaAceito) {
        alert("Codigo de turma invalido.");
        return;
      }

      const passwordValidation = getPasswordValidation(senha);
      const isPasswordValid = Object.values(passwordValidation).every(Boolean);
      if (!isPasswordValid) {
        alert(
          "A senha deve ter no minimo 8 caracteres, uma letra maiuscula, um numero e um caractere especial."
        );
        return;
      }

      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        senha
      );
      const userDocRef = doc(db, "users", userCredential.user.uid);
      const normalizedName = normalizeText(nome);
      await setDoc(userDocRef, {
        uid: userCredential.user.uid,
        nome: nome,
        nomeNormalized: normalizedName,
        username: nome,
        usernameNormalized: normalizedName,
        dataNascimento: dataNascimento,
        turma: turma,
        sexo: sexo,
        email: email,
        aceiteDeTermos: aceiteDeTermos,
        xp: 0,
        safiras: 0,
        safira: 0,
        ofensiva: 0,
        lives: 5,
        vidas: 5,
        isPremium: false,
      });
      console.log("Usuário cadastrado:", userCredential.user.email);
      router.replace("../(tabs)/CourseScreen");
    } catch (error: any) {
      console.log("Erro ao cadastrar:", error.message);
      alert(`Erro: ${error.message}`);
    }
  };

  return (
    <SafeAreaView style={styles.containerLogin}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
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
              placeholder="Data de nascimento (DD/MM/AAAA)"
              value={dataNascimento}
              onChangeText={(text) => setDataNascimento(formatBirthDate(text))}
              keyboardType="number-pad"
              maxLength={10}
              placeholderTextColor="#aaa"
            />
            <TextInput
              style={styles.caixaInsercao}
              placeholder="Turma"
              value={turma}
              onChangeText={setTurma}
              placeholderTextColor="#aaa"
            />
            {codigoTurmaObrigatorio && (
              <TextInput
                style={styles.caixaInsercao}
                placeholder="Codigo da turma"
                value={codigoTurma}
                onChangeText={setCodigoTurma}
                autoCapitalize="none"
                autoCorrect={false}
                placeholderTextColor="#aaa"
              />
            )}
            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
              <TouchableOpacity
                style={[
                  styles.caixaInsercao,
                  {
                    width: "48%",
                    alignItems: "center",
                    justifyContent: "center",
                    paddingLeft: 0,
                    backgroundColor: sexo === "F" ? "#FF4B4B" : undefined,
                    borderWidth: 1,
                    borderColor: sexo === "F" ? "#FF4B4B" : "#aaa",
                  },
                ]}
                onPress={() => setSexo("F")}
              >
                <Text style={{ color: sexo === "F" ? "#fff" : "#aaa", fontWeight: "bold" }}>Feminino</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.caixaInsercao,
                  {
                    width: "48%",
                    alignItems: "center",
                    justifyContent: "center",
                    paddingLeft: 0,
                    backgroundColor: sexo === "M" ? "#2F80ED" : undefined,
                    borderWidth: 1,
                    borderColor: sexo === "M" ? "#2F80ED" : "#aaa",
                  },
                ]}
                onPress={() => setSexo("M")}
              >
                <Text style={{ color: sexo === "M" ? "#fff" : "#aaa", fontWeight: "bold" }}>Masculino</Text>
              </TouchableOpacity>
            </View>
            <TextInput
              style={styles.caixaInsercao}
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholderTextColor="#aaa"
            />
            <View
              style={[
                localStyles.passwordGuideCard,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                },
              ]}
            >
              <View
                style={[
                  localStyles.passwordAlertBox,
                  { backgroundColor: colors.backgroundError },
                ]}
              >
                <Text
                  style={[
                    localStyles.passwordAlertText,
                    { color: currentTheme === "dark" ? "#FFD5D5" : "#B33939" },
                  ]}
                >
                  Sua senha precisa atender aos requisitos abaixo para criar a conta.
                </Text>
              </View>
              <Text style={[localStyles.passwordGuideTitle, { color: colors.text }]}>
                Use uma senha com:
              </Text>
              {PASSWORD_REQUIREMENTS.map((requirement) => (
                <View key={requirement} style={localStyles.passwordRequirementRow}>
                  <Text style={[localStyles.passwordBullet, { color: colors.text }]}>-</Text>
                  <Text style={[localStyles.passwordRequirementText, { color: colors.text }]}>
                    {requirement}
                  </Text>
                </View>
              ))}
            </View>
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
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const localStyles = StyleSheet.create({
  passwordGuideCard: {
    width: "100%",
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    gap: 10,
  },
  passwordAlertBox: {
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  passwordAlertText: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "700",
  },
  passwordGuideTitle: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "600",
  },
  passwordRequirementRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
  },
  passwordBullet: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "700",
  },
  passwordRequirementText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 20,
  },
});
