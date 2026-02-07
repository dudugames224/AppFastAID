import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  Alert,
  Dimensions,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../context/ThemeContext";
import { auth, db, doc, getUserData, onSnapshot, Sair, updateUserAvatar } from "../firebaseConfig";
import {
  cancelReminder,
  getRandomReminderMessage,
  isReminderScheduled,
  scheduleRepeatingReminder,
} from "../services/notificationService";
import { getUserAchievements } from "../services/progressService";

const AVATAR_OPTIONS = ["😀", "😎", "🤔", "😂", "🥳", "🤯", "😇", "😴", "🤩"];
const REMINDER_IDENTIFIER = "lesson-demo-reminder";

const coerceToMs = (value: any): number | null => {
  if (!value) return null;
  if (typeof value === "number") {
    if (!Number.isFinite(value)) return null;
    return value < 1e12 ? value * 1000 : value;
  }
  if (value instanceof Date) return Number.isFinite(value.getTime()) ? value.getTime() : null;
  if (typeof value === "string") {
    const ms = new Date(value).getTime();
    return Number.isFinite(ms) ? ms : null;
  }
  if (typeof value === "object") {
    if (typeof (value as any).toDate === "function") {
      const date = (value as any).toDate();
      return date instanceof Date && Number.isFinite(date.getTime()) ? date.getTime() : null;
    }
    if (typeof (value as any).seconds === "number") return (value as any).seconds * 1000;
    if (typeof (value as any)._seconds === "number") return (value as any)._seconds * 1000;
  }
  return null;
};

const formatRemainingTime = (msRemaining: number) => {
  const totalSeconds = Math.max(0, Math.floor(msRemaining / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  if (hours > 0) return `${hours}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
};


const ProfileScreen = () => {
  const { width } = Dimensions.get("window");
  const [userData, setUserData] = useState<any>(null);
  const [nowMs, setNowMs] = useState(() => Date.now());
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
      let unsubscribe: null | (() => void) = null;

      const user = auth.currentUser;
      if (user) {
        const userDocRef = doc(db, "users", user.uid);
        unsubscribe = onSnapshot(userDocRef, (snapshot) => {
          if (snapshot.exists()) {
            setUserData(snapshot.data());
          }
        });
      }

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

      return () => {
        if (unsubscribe) unsubscribe();
      };
    }, [])
  );

  const tripleXpUntilKey = (userData as any)?.tripleXpUntil ?? null;
  const doubleXpUntilKey = (userData as any)?.doubleXpUntil ?? null;
  const lastDoubleAppliedKey = (userData as any)?.lastDoubleXpAppliedAt ?? null;

  useEffect(() => {
    const tripleUntilMs = coerceToMs(userData?.tripleXpUntil);
    const doubleUntilMs = coerceToMs((userData as any)?.doubleXpUntil);
    const lastDoubleMs = coerceToMs((userData as any)?.lastDoubleXpAppliedAt);
    const now = Date.now();
    const shouldTick =
      (tripleUntilMs !== null && tripleUntilMs > now) ||
      (doubleUntilMs !== null && doubleUntilMs > now) ||
      (lastDoubleMs !== null && now - lastDoubleMs < 10 * 60 * 1000);

    if (!shouldTick) return;

    const interval = setInterval(() => {
      const tickNow = Date.now();
      setNowMs(tickNow);
      const tripleExpired = tripleUntilMs !== null ? tickNow >= tripleUntilMs : true;
      const doubleExpired = doubleUntilMs !== null ? tickNow >= doubleUntilMs : true;
      const recentExpired = lastDoubleMs !== null ? tickNow - lastDoubleMs >= 10 * 60 * 1000 : true;
      if (tripleExpired && doubleExpired && recentExpired) clearInterval(interval);
    }, 1000);
    return () => clearInterval(interval);
  }, [tripleXpUntilKey, doubleXpUntilKey, lastDoubleAppliedKey]);

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

  const tripleXpUntilMs = coerceToMs(userData?.tripleXpUntil);
  const tripleActive = tripleXpUntilMs !== null && tripleXpUntilMs > nowMs;
  const tripleMultiplier =
    tripleActive && typeof userData?.tripleXpMultiplier === "number" ? userData.tripleXpMultiplier : 3;
  const tripleRemainingLabel =
    tripleActive && tripleXpUntilMs !== null ? formatRemainingTime(tripleXpUntilMs - nowMs) : null;

  const doubleUntilMs = coerceToMs((userData as any)?.doubleXpUntil);
  const doubleTimeActive = doubleUntilMs !== null && doubleUntilMs > nowMs;
  const doubleTimeRemainingLabel =
    doubleTimeActive && doubleUntilMs !== null ? formatRemainingTime(doubleUntilMs - nowMs) : null;
  const doubleMultiplierFromDoc =
    typeof (userData as any)?.doubleXpMultiplier === "number" ? (userData as any).doubleXpMultiplier : 2;

  const doubleXpChargesRaw = (userData as any)?.doubleXpCharges ?? (userData as any)?.doubleXPCharges;
  const doubleXpChargesNumber = typeof doubleXpChargesRaw === "string" ? Number(doubleXpChargesRaw) : doubleXpChargesRaw;
  const doubleXpCharges =
    typeof doubleXpChargesNumber === "number" && Number.isFinite(doubleXpChargesNumber)
      ? Math.max(0, Math.floor(doubleXpChargesNumber))
      : 0;
  const doubleActive = doubleTimeActive || doubleXpCharges > 0;

  const doubleMultiplier = doubleActive ? doubleMultiplierFromDoc : 1;
  const potionMultiplier = doubleMultiplier * (tripleActive ? tripleMultiplier : 1);
  const potionValueLabel = potionMultiplier > 1 ? `x${potionMultiplier}` : "--";
  const lastDoubleAppliedMs = coerceToMs((userData as any)?.lastDoubleXpAppliedAt);
  const recentDoubleLabel =
    lastDoubleAppliedMs !== null && nowMs - lastDoubleAppliedMs >= 0 && nowMs - lastDoubleAppliedMs < 10 * 60 * 1000
      ? `ÚLTIMO x2 • há ${formatRemainingTime(nowMs - lastDoubleAppliedMs)}`
      : null;

  const potionParts: string[] = [];
  if (doubleTimeActive && doubleTimeRemainingLabel) {
    potionParts.push(`x${doubleMultiplier} ${doubleTimeRemainingLabel}`);
  } else if (doubleXpCharges > 0) {
    potionParts.push(`x2 ${doubleXpCharges} lição(ões)`);
  }
  if (tripleActive && tripleRemainingLabel) {
    potionParts.push(`x${tripleMultiplier} ${tripleRemainingLabel}`);
  }

  const potionDetailLabel =
    potionParts.length > 0 ? `POÇÃO • ${potionParts.join(" • ")}` : recentDoubleLabel ?? "SEM POÇÃO";

  const statBoxSize = Math.min(120, Math.max(88, Math.floor(width * 0.28)));
  const statValueFontSize = Math.min(28, Math.max(18, Math.floor(width * 0.06)));
  const statLabelFontSize = Math.min(12, Math.max(10, Math.floor(width * 0.03)));

  return (
    <SafeAreaView style={styles.safe}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: '3%', paddingTop: 10 }}>
        <View style={{width: 24}} />
        <Text style={styles.titulo}>PERFIL</Text>
        {userData?.admin === true ? (
            <TouchableOpacity onPress={() => router.push('/screens/DailyReportScreen')}>
                <Ionicons name="settings-outline" size={24} color={colors.primary} />
            </TouchableOpacity>
        ) : (
            <View style={{width: 24}} />
        )}
    </View>
      <ScrollView>
        <Image source={require("../../assets/images/band_no_celular.png")} style={{ width: 140, height: 140, alignSelf: "center" }} />
        <ScrollView contentContainerStyle={[styles.containerPerfil, { marginHorizontal: '3%', paddingBottom: 30 }]}>

            <View style={[styles.caixaPerfil, { height: 85, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 20 }]}>
                <TouchableOpacity onPress={() => setAvatarModalVisible(true)}>
                  <Text style={{ fontSize: 40 }}>{userData?.avatar || "🙂"}</Text>
                </TouchableOpacity>
                <Text style={[styles.titulo]}>{userData ? userData.nome : "Carregando..."}</Text>
          </View>
          <View style={{flexDirection:"row", justifyContent:"space-between", alignItems:"center", width:"100%"}}>
              <View
                style={[
                  styles.caixaPerfil,
                  { width: statBoxSize, height: statBoxSize, justifyContent: "center", alignItems: "center" },
                ]}
              >
                <Text style={[styles.titulo, { marginBottom: 0, fontSize: statValueFontSize }]}>
                  {userData ? userData.xp : 0}
                </Text>
                <Text style={[styles.textoBotao, { color: colors.text, fontSize: statLabelFontSize, marginTop: 2 }]}>
                  XP
                </Text>
              </View>

              <View
                style={[
                  styles.caixaPerfil,
                  { width: statBoxSize, height: statBoxSize, justifyContent: "center", alignItems: "center" },
                ]}
              >
                <Text style={[styles.titulo, { marginBottom: 0, fontSize: statValueFontSize }]}>
                  {potionValueLabel}
                </Text>
                <Text
                  style={[
                    styles.textoBotao,
                    { color: colors.text, fontSize: statLabelFontSize, marginTop: 2, opacity: 0.9 },
                  ]}
                >
                  {potionDetailLabel}
                </Text>
              </View>

              <TouchableOpacity
                style={[
                  styles.caixaPerfil,
                  { width: statBoxSize, height: statBoxSize, justifyContent: "center", alignItems: "center" },
                ]}
                onPress={() => router.push("/screens/StreakScreen")}
              >
                <Text style={[styles.titulo, { marginBottom: 0, fontSize: statValueFontSize }]}>
                  {userData ? userData.ofensiva : 0}
                </Text>
                <Text style={[styles.textoBotao, { color: colors.text, fontSize: statLabelFontSize, marginTop: 2 }]}>
                  DIAS
                </Text>
              </TouchableOpacity>

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
