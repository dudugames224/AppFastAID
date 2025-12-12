import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../context/ThemeContext";
import { auth, getUserData, Sair, updateUserAvatar } from "../firebaseConfig";
import {
  cancelReminder,
  getRandomReminderMessage,
  isReminderScheduled,
  scheduleRepeatingReminder,
} from "../services/notificationService";
import { getUserAchievements } from "../services/progressService";

const AVATAR_OPTIONS = ["😀", "😎", "🤔", "😂", "🥳", "🤯", "😇", "😴", "🤩"];
const REMINDER_IDENTIFIER = "lesson-demo-reminder";


const ProfileScreen = () => {
  const { width } = Dimensions.get("window");
  const [userData, setUserData] = useState<any>(null);
  const [achievementData, setAchievementData] = useState<any>({
    achievements: {},
    courses: [],
  });
  const { styles, colors, currentTheme, setCurrentTheme } = useTheme();
  const router = useRouter();
  const [avatarModalVisible, setAvatarModalVisible] = useState(false);
  const [reminderLoading, setReminderLoading] = useState(false);
  const [reminderActive, setReminderActive] = useState(false);
  const [previewMessage, setPreviewMessage] = useState(getRandomReminderMessage());

  function logout() {
    Sair();
    router.replace("/screens/login");
  }

  useFocusEffect(
    useCallback(() => {
      const fetchData = async () => {
        const currentUserData = await getUserData();
        if (currentUserData) {
          setUserData(currentUserData);
        }
  
        const userId = auth.currentUser?.uid;
        if (userId) {
          const achievements = await getUserAchievements(userId);
          setAchievementData(achievements);
        }
      };
  
      fetchData();
    }, [])
  );

  useEffect(() => {
    let mounted = true;
    const syncReminderStatus = async () => {
      const active = await isReminderScheduled(REMINDER_IDENTIFIER);
      if (mounted) {
        setReminderActive(active);
      }
    };
    syncReminderStatus();
    return () => {
      mounted = false;
    };
  }, []);

  const handleReminderError = (error: unknown) => {
    const message = error instanceof Error ? error.message : "unknown";
    if (message === "notifications-permission-denied") {
      Alert.alert(
        "Permissão necessária",
        "Autorize o FastAid a enviar notificações para receber os lembretes."
      );
    } else {
      Alert.alert(
        "Notificações",
        "Não foi possível atualizar o lembrete. Tente novamente."
      );
    }
  };

  const handleActivateReminder = async () => {
    try {
      setReminderLoading(true);
      const message = previewMessage ?? getRandomReminderMessage();
      await scheduleRepeatingReminder({
        identifier: REMINDER_IDENTIFIER,
        message,
        data: { type: "lesson-reminder" },
        intervalInMinutes: 1,
      });
      setReminderActive(true);
      setPreviewMessage(getRandomReminderMessage());
      Alert.alert(
        "Lembrete ativo",
        `${message.emoji} ${message.title} chega a cada 1 minuto.`
      );
    } catch (error) {
      handleReminderError(error);
    } finally {
      setReminderLoading(false);
    }
  };

  const handleDeactivateReminder = async () => {
    try {
      setReminderLoading(true);
      await cancelReminder(REMINDER_IDENTIFIER);
      setReminderActive(false);
      setPreviewMessage(getRandomReminderMessage());
      Alert.alert("Lembrete desativado", "As notificações de demonstração foram pausadas.");
    } catch (error) {
      handleReminderError(error);
    } finally {
      setReminderLoading(false);
    }
  };

  const handleAvatarSelect = async (avatar: string) => {
    const userId = auth.currentUser?.uid;
    if (userId) {
      const success = await updateUserAvatar(userId, avatar);
      if (success) {
        setUserData((prev: any) => ({ ...prev, avatar }));
      }
    }
    setAvatarModalVisible(false);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView>

      
        <Image source={require("../../assets/images/band_no_celular.png")} style={{ width: 140, height: 140, alignSelf: "center" }} />
        <Text style={styles.titulo}>PERFIL</Text>
        <ScrollView contentContainerStyle={[styles.containerPerfil, { marginHorizontal: '3%', paddingBottom: 30 }]}>
             
            <View style={[styles.caixaPerfil, { height: 85, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 20 }]}>
                <TouchableOpacity onPress={() => setAvatarModalVisible(true)}>
                  <Text style={{ fontSize: 40 }}>{userData?.avatar || "🙂"}</Text>
                </TouchableOpacity>
                <Text style={[styles.titulo]}>{userData ? userData.nome : "Carregando..."}</Text>
          </View>
          <View style={{flexDirection:"row", justifyContent:"space-between", alignItems:"center", width:"100%"}}>
              <View style={[styles.caixaPerfil,{ alignSelf:"flex-start",width:"47%", height:"100%" }]}>
                <Text style={[styles.titulo, {  marginBottom:0, fontSize: width*0.101 }]}>{userData ? userData.xp : 0} XP</Text>
                </View>

                <View style={[styles.caixaPerfil,{ alignSelf:"flex-end",width:"47%",height:"100%" }]}>
                <Text style={[styles.titulo, {  marginBottom:0, fontSize: width*0.101  }]}>{userData ? userData.ofensiva : 0} DIAS</Text>
                </View>

                </View>
                <View style={[styles.caixaPerfil, {height:85}]}>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ alignItems: 'center' }}>
                    {achievementData.courses.map((curso: any) => (
                      <Image
                        key={curso.id}
                        source={curso.iconSource}
                        style={[
                          EstiloImagem.achievement,
                          !achievementData.achievements[curso.id] && EstiloImagem.grayscale, 
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
        </ScrollView>

            <Modal
              visible={avatarModalVisible}
              animationType="fade"
              transparent
              onRequestClose={() => setAvatarModalVisible(false)}
            >
              <TouchableOpacity
                style={styles.modalBackdrop}
                activeOpacity={1}
                onPressOut={() => setAvatarModalVisible(false)}
              >
                <View style={[styles.modalView, { backgroundColor: colors.background }]}>
                  <Text style={[styles.modalTitle, { color: colors.primary }]}>ESCOLHA SEU AVATAR</Text>
                  <View style={styles.avatarGrid}>
                    {AVATAR_OPTIONS.map((avatar) => (
                      <TouchableOpacity
                        key={avatar}
                        style={styles.avatarTouchable}
                        onPress={() => handleAvatarSelect(avatar)}
                      >
                        <Text style={{ fontSize: 40 }}>{avatar}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </TouchableOpacity>
            </Modal>
            </ScrollView>
            
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
    opacity: 0.5,
  },
  
});
