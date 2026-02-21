import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import * as Sharing from "expo-sharing";
import React, { useCallback, useMemo, useRef, useState } from "react";
import {
  Alert,
  Image,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { captureRef } from "react-native-view-shot";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../context/ThemeContext";
import { auth, db, doc, findUserByName, getDoc, getUserData, setDoc } from "../firebaseConfig";

type TabMode = "personal" | "friends";

type FriendProfile = {
  uid: string;
  nome: string;
  avatar: string;
  streak: number;
  streakTogether: boolean;
};

const daysOfWeek = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

const buildMonthGrid = (year: number, month: number) => {
  const firstDay = new Date(year, month, 1).getDay();
  const totalDays = new Date(year, month + 1, 0).getDate();
  const grid: { day: number; date: Date }[] = [];
  for (let i = 0; i < firstDay; i++) {
    grid.push({ day: 0, date: new Date(year, month, i - firstDay + 1) });
  }
  for (let d = 1; d <= totalDays; d++) {
    grid.push({ day: d, date: new Date(year, month, d) });
  }
  return grid;
};

const safeStreak = (value: unknown): number => {
  if (typeof value === "number" && Number.isFinite(value)) return Math.max(0, Math.floor(value));
  return 0;
};

const safeString = (value: unknown, fallback = ""): string => {
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : fallback;
  }
  return fallback;
};

const toStoredFriends = (friends: FriendProfile[]) =>
  friends.map((friend) => ({
    uid: friend.uid,
    nome: friend.nome,
    avatar: friend.avatar,
    streakTogether: friend.streakTogether,
  }));

const StreakScreen = () => {
  const router = useRouter();
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const [streak, setStreak] = useState(0);
  const [lastLessonDate, setLastLessonDate] = useState<Date | null>(null);
  const [userName, setUserName] = useState("Usuario");
  const [activeTab, setActiveTab] = useState<TabMode>("personal");
  const [friendNameInput, setFriendNameInput] = useState("");
  const [friends, setFriends] = useState<FriendProfile[]>([]);
  const [friendActionLoading, setFriendActionLoading] = useState(false);

  const shareCardRef = useRef<View>(null);

  const hydrateFriends = useCallback(async (rawFriends: any[]): Promise<FriendProfile[]> => {
    const entries = Array.isArray(rawFriends) ? rawFriends : [];

    const hydrated = await Promise.all(
      entries
        .filter((entry) => entry && typeof entry === "object" && typeof entry.uid === "string")
        .map(async (entry) => {
          const fallbackName = safeString(entry.nome, "Usuario");
          const fallbackAvatar = safeString(entry.avatar, "🙂");

          try {
            const snap = await getDoc(doc(db, "users", entry.uid));
            if (!snap.exists()) {
              return {
                uid: entry.uid,
                nome: fallbackName,
                avatar: fallbackAvatar,
                streak: 0,
                streakTogether: entry.streakTogether === true,
              };
            }

            const data = snap.data();
            return {
              uid: entry.uid,
              nome: safeString(data?.nome, fallbackName),
              avatar: safeString(data?.avatar, fallbackAvatar),
              streak: safeStreak(data?.ofensiva ?? data?.streak),
              streakTogether: entry.streakTogether === true,
            };
          } catch {
            return {
              uid: entry.uid,
              nome: fallbackName,
              avatar: fallbackAvatar,
              streak: 0,
              streakTogether: entry.streakTogether === true,
            };
          }
        })
    );

    return hydrated.filter((friend) => typeof friend.uid === "string" && friend.uid.length > 0);
  }, []);

  const persistFriends = useCallback(async (nextFriends: FriendProfile[]) => {
    const currentUid = auth.currentUser?.uid;
    if (!currentUid) return;

    await setDoc(
      doc(db, "users", currentUid),
      { streakFriends: toStoredFriends(nextFriends) },
      { merge: true }
    );
  }, []);

  useFocusEffect(
    useCallback(() => {
      let mounted = true;

      const loadData = async () => {
        const data = await getUserData();
        if (!mounted) return;

        const ofensiva =
          typeof (data as any)?.ofensiva === "number"
            ? (data as any).ofensiva
            : typeof (data as any)?.streak === "number"
            ? (data as any).streak
            : 0;

        setStreak(safeStreak(ofensiva));
        setUserName(safeString((data as any)?.nome, "Usuario"));

        const last = (data as any)?.lastLessonDate ? new Date((data as any).lastLessonDate) : null;
        setLastLessonDate(last && !Number.isNaN(last.getTime()) ? last : null);

        const hydratedFriends = await hydrateFriends((data as any)?.streakFriends || []);
        if (!mounted) return;
        setFriends(hydratedFriends);
      };

      loadData();

      return () => {
        mounted = false;
      };
    }, [hydrateFriends])
  );

  const now = useMemo(() => new Date(), []);
  const grid = buildMonthGrid(now.getFullYear(), now.getMonth());

  const streakDates = useMemo(() => {
    const set = new Set<string>();
    if (!streak) return set;
    const base = lastLessonDate && !Number.isNaN(lastLessonDate.getTime()) ? lastLessonDate : now;
    for (let i = 0; i < streak; i++) {
      const d = new Date(base);
      d.setDate(d.getDate() - i);
      set.add(d.toDateString());
    }
    return set;
  }, [streak, now, lastLessonDate]);

  const practicedCount = streakDates.size;

  const handleAddFriend = async () => {
    if (friendActionLoading) return;
    const currentUid = auth.currentUser?.uid;
    if (!currentUid) {
      Alert.alert("Erro", "Voce precisa estar logado para adicionar amigos.");
      return;
    }

    const typedName = friendNameInput.trim();
    if (!typedName) {
      Alert.alert("Adicionar amigo", "Digite um nome de usuario.");
      return;
    }

    setFriendActionLoading(true);
    try {
      const matchedUser = (await findUserByName(typedName)) as any;
      if (!matchedUser) {
        Alert.alert("Nao encontrado", "Nenhum usuario com esse nome foi encontrado.");
        return;
      }

      if (matchedUser.id === currentUid) {
        Alert.alert("Adicionar amigo", "Voce nao pode adicionar a si mesmo.");
        return;
      }

      if (friends.some((friend) => friend.uid === matchedUser.id)) {
        Alert.alert("Adicionar amigo", "Esse usuario ja esta na sua lista.");
        return;
      }

      const nextFriend: FriendProfile = {
        uid: matchedUser.id,
        nome: safeString(matchedUser.username, safeString(matchedUser.nome, typedName)),
        avatar: safeString(matchedUser.avatar, ":-)"),
        streak: safeStreak(matchedUser.ofensiva ?? matchedUser.streak),
        streakTogether: false,
      };

      const nextFriends = [...friends, nextFriend];
      setFriends(nextFriends);
      setFriendNameInput("");
      await persistFriends(nextFriends);
      Alert.alert("Sucesso", `${nextFriend.nome} foi adicionado(a).`);
    } catch {
      Alert.alert("Erro", "Nao foi possivel adicionar amigo agora.");
    } finally {
      setFriendActionLoading(false);
    }
  };

  const handleToggleStreakTogether = async (friendUid: string) => {
    const nextFriends = friends.map((friend) =>
      friend.uid === friendUid
        ? { ...friend, streakTogether: !friend.streakTogether }
        : friend
    );

    setFriends(nextFriends);
    try {
      await persistFriends(nextFriends);
    } catch {
      Alert.alert("Erro", "Nao foi possivel atualizar ofensiva juntos.");
    }
  };

  const handleShareStreak = async () => {
    try {
      const canShare = await Sharing.isAvailableAsync();
      if (!canShare) {
        Alert.alert("Compartilhar", "Compartilhamento nao disponivel neste dispositivo.");
        return;
      }

      if (!shareCardRef.current) {
        Alert.alert("Compartilhar", "Nao foi possivel gerar a imagem da ofensiva.");
        return;
      }

      const uri = await captureRef(shareCardRef.current, {
        format: "png",
        quality: 1,
        result: "tmpfile",
      });

      await Sharing.shareAsync(uri, {
        mimeType: "image/png",
        dialogTitle: "Compartilhar ofensiva",
      });
    } catch {
      Alert.alert("Compartilhar", "Falha ao compartilhar imagem da ofensiva.");
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn}>
          <Ionicons name="close" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Streak</Text>
        <TouchableOpacity style={styles.headerBtn} onPress={handleShareStreak}>
          <Ionicons name="share-social" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
        <View style={styles.tabRow}>
          <TouchableOpacity onPress={() => setActiveTab("personal")}>
            <Text style={[styles.tab, activeTab === "personal" && styles.tabActive]}>PERSONAL</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setActiveTab("friends")}>
            <Text style={[styles.tab, activeTab === "friends" && styles.tabActive]}>FRIENDS</Text>
          </TouchableOpacity>
        </View>

        {activeTab === "personal" ? (
          <>
            <View style={styles.heroCard}>
              <Text style={styles.heroTag}>STREAK</Text>
              <View style={styles.heroRow}>
                <Text style={styles.heroNumber}>{streak}</Text>
                <Image
                  source={require("../../assets/images/ofensiva.png")}
                  style={{ width: 64, height: 64, tintColor: "#d1e6ff", opacity: 0.3 }}
                />
              </View>
              <Text style={styles.heroLabel}>dias de ofensiva!</Text>
            </View>

            <View style={styles.banner}>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>🎉</Text>
              </View>
              <View style={{ flex: 1, paddingLeft: 12 }}>
                <Text style={styles.bannerText}>
                  Voce manteve sua ofensiva por {streak >= 14 ? "2 semanas +" : `${streak} dias`} seguidos!
                </Text>
              </View>
            </View>

            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>
                {now.toLocaleString("default", { month: "long" })} {now.getFullYear()}
              </Text>
              <View style={styles.sectionBadge}>
                <Text style={styles.sectionBadgeText}>{practicedCount} dias</Text>
              </View>
            </View>

            <View style={styles.calendar}>
              <View style={styles.weekHeader}>
                {daysOfWeek.map((d) => (
                  <Text key={d} style={styles.weekHeaderText}>
                    {d}
                  </Text>
                ))}
              </View>
              <View style={styles.grid}>
                {grid.map((cell, idx) => {
                  if (cell.day === 0) {
                    return <View key={`empty-${idx}`} style={styles.dayCell} />;
                  }

                  const isStreakDay = streakDates.has(cell.date.toDateString());
                  const isToday =
                    cell.date.getDate() === now.getDate() &&
                    cell.date.getMonth() === now.getMonth() &&
                    cell.date.getFullYear() === now.getFullYear();

                  return (
                    <View
                      key={cell.date.toISOString()}
                      style={[
                        styles.dayCell,
                        isStreakDay && styles.dayStreak,
                        isToday && styles.dayToday,
                      ]}
                    >
                      <Text
                        style={[
                          styles.dayText,
                          isStreakDay ? styles.dayTextActive : null,
                          isToday ? { color: "#0B1B2A" } : null,
                        ]}
                      >
                        {cell.day}
                      </Text>
                    </View>
                  );
                })}
              </View>
            </View>
          </>
        ) : (
          <View style={styles.friendsContainer}>
            <Text style={styles.friendTitle}>Adicionar amigo por nome</Text>
            <View style={styles.addRow}>
              <TextInput
                style={styles.addInput}
                placeholder="Nome de usuario"
                placeholderTextColor="rgba(255,255,255,0.45)"
                value={friendNameInput}
                onChangeText={setFriendNameInput}
                autoCapitalize="none"
              />
              <TouchableOpacity
                style={[styles.addBtn, friendActionLoading ? { opacity: 0.6 } : null]}
                onPress={handleAddFriend}
                disabled={friendActionLoading}
              >
                <Text style={styles.addBtnText}>{friendActionLoading ? "..." : "ADD"}</Text>
              </TouchableOpacity>
            </View>

            {friends.length === 0 ? (
              <Text style={styles.emptyText}>Nenhum amigo adicionado ainda.</Text>
            ) : (
              friends.map((friend) => (
                <View key={friend.uid} style={styles.friendCard}>
                  <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
                    <Text style={styles.friendAvatar}>{friend.avatar || "🙂"}</Text>
                    <View>
                      <Text style={styles.friendName}>{friend.nome}</Text>
                      <Text style={styles.friendMeta}>{friend.streak} dias de ofensiva</Text>
                    </View>
                  </View>
                  <TouchableOpacity
                    style={[
                      styles.togetherBtn,
                      friend.streakTogether ? styles.togetherBtnActive : null,
                    ]}
                    onPress={() => handleToggleStreakTogether(friend.uid)}
                  >
                    <Text
                      style={[
                        styles.togetherText,
                        friend.streakTogether ? styles.togetherTextActive : null,
                      ]}
                    >
                      {friend.streakTogether ? "Juntos" : "Ofensiva juntos"}
                    </Text>
                  </TouchableOpacity>
                </View>
              ))
            )}
          </View>
        )}
      </ScrollView>

      <View style={styles.captureHost} pointerEvents="none">
        <View ref={shareCardRef} collapsable={false} style={styles.shareCard}>
          <Text style={styles.shareCardTitle}>STREAK FASTAID</Text>
          <Text style={styles.shareCardName}>{userName}</Text>
          <Text style={styles.shareCardNumber}>{streak}</Text>
          <Text style={styles.shareCardSub}>dias de ofensiva</Text>
          <Text style={styles.shareCardFooter}>
            {now.toLocaleDateString("pt-BR")} • {practicedCount} dias ativos no mes
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

const createStyles = (colors: any) =>
  StyleSheet.create({
    safe: { flex: 1, backgroundColor: "#0c1c2a" },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 16,
      paddingVertical: 10,
    },
    headerTitle: { color: "#fff", fontSize: 18, fontWeight: "800" },
    headerBtn: {
      width: 36,
      height: 36,
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "rgba(255,255,255,0.08)",
    },
    tabRow: { flexDirection: "row", gap: 20, marginTop: 6, marginBottom: 16 },
    tab: { color: "rgba(255,255,255,0.5)", fontWeight: "800", letterSpacing: 1 },
    tabActive: {
      color: "#5D9CFB",
      borderBottomWidth: 2,
      borderBottomColor: "#5D9CFB",
      paddingBottom: 4,
    },
    heroCard: {
      backgroundColor: "rgba(255,255,255,0.06)",
      borderRadius: 16,
      padding: 18,
      marginBottom: 14,
      borderWidth: 1,
      borderColor: "rgba(255,255,255,0.08)",
    },
    heroTag: {
      alignSelf: "flex-start",
      backgroundColor: "rgba(255,255,255,0.1)",
      color: "rgba(255,255,255,0.7)",
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 10,
      fontWeight: "800",
      fontSize: 12,
      marginBottom: 10,
    },
    heroRow: { flexDirection: "row", alignItems: "center", gap: 16 },
    heroNumber: { fontSize: 60, color: "#fff", fontWeight: "900" },
    heroLabel: { marginTop: 4, color: "rgba(255,255,255,0.8)", fontSize: 16, fontWeight: "800" },
    banner: {
      flexDirection: "row",
      backgroundColor: "rgba(255,255,255,0.06)",
      borderRadius: 16,
      padding: 14,
      marginBottom: 18,
      borderWidth: 1,
      borderColor: "rgba(255,255,255,0.08)",
      alignItems: "center",
    },
    badge: {
      width: 38,
      height: 38,
      borderRadius: 12,
      backgroundColor: "rgba(255,255,255,0.08)",
      alignItems: "center",
      justifyContent: "center",
    },
    badgeText: { fontSize: 20 },
    bannerText: { color: "#fff", fontWeight: "700", lineHeight: 20 },
    sectionHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 10,
    },
    sectionTitle: { color: "#fff", fontSize: 20, fontWeight: "900" },
    sectionBadge: {
      backgroundColor: "#f97316",
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 10,
    },
    sectionBadgeText: { color: "#0c1c2a", fontWeight: "800" },
    calendar: {
      backgroundColor: "rgba(255,255,255,0.06)",
      borderRadius: 16,
      padding: 14,
      borderWidth: 1,
      borderColor: "rgba(255,255,255,0.08)",
    },
    weekHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 10,
      paddingHorizontal: 6,
    },
    weekHeaderText: {
      color: "rgba(255,255,255,0.6)",
      fontWeight: "800",
      width: 32,
      textAlign: "center",
    },
    grid: {
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "space-between",
    },
    dayCell: {
      width: `${100 / 7 - 2}%`,
      aspectRatio: 1,
      borderRadius: 10,
      marginBottom: 10,
      backgroundColor: "rgba(255,255,255,0.05)",
      alignItems: "center",
      justifyContent: "center",
    },
    dayStreak: {
      backgroundColor: "#f59e0b",
      borderWidth: 2,
      borderColor: "rgba(250, 204, 21, 0.6)",
    },
    dayToday: {
      backgroundColor: "#5D9CFB",
    },
    dayText: { color: "rgba(255,255,255,0.8)", fontWeight: "800" },
    dayTextActive: { color: "#0c1c2a" },

    friendsContainer: {
      backgroundColor: "rgba(255,255,255,0.06)",
      borderRadius: 16,
      padding: 14,
      borderWidth: 1,
      borderColor: "rgba(255,255,255,0.08)",
      gap: 12,
    },
    friendTitle: { color: "#fff", fontWeight: "800", fontSize: 15 },
    addRow: { flexDirection: "row", gap: 10 },
    addInput: {
      flex: 1,
      borderWidth: 1,
      borderColor: "rgba(255,255,255,0.15)",
      borderRadius: 12,
      paddingHorizontal: 12,
      paddingVertical: 10,
      color: "#fff",
      backgroundColor: "rgba(255,255,255,0.03)",
    },
    addBtn: {
      minWidth: 64,
      borderRadius: 12,
      backgroundColor: "#5D9CFB",
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 12,
    },
    addBtnText: { color: "#0c1c2a", fontWeight: "900" },
    emptyText: { color: "rgba(255,255,255,0.65)", fontWeight: "700" },
    friendCard: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: "rgba(255,255,255,0.1)",
      backgroundColor: "rgba(255,255,255,0.04)",
      padding: 12,
    },
    friendAvatar: { fontSize: 26, marginRight: 10 },
    friendName: { color: "#fff", fontWeight: "800", fontSize: 15 },
    friendMeta: { color: "rgba(255,255,255,0.65)", fontWeight: "700" },
    togetherBtn: {
      borderRadius: 10,
      borderWidth: 1,
      borderColor: "#5D9CFB",
      paddingHorizontal: 10,
      paddingVertical: 8,
      backgroundColor: "transparent",
    },
    togetherBtnActive: {
      backgroundColor: "#5D9CFB",
    },
    togetherText: { color: "#8cc0ff", fontSize: 12, fontWeight: "900" },
    togetherTextActive: { color: "#0c1c2a" },

    captureHost: {
      position: "absolute",
      left: -1000,
      top: -1000,
      width: 360,
      height: 420,
    },
    shareCard: {
      width: 340,
      height: 400,
      borderRadius: 20,
      backgroundColor: "#0E2030",
      borderWidth: 2,
      borderColor: "#5D9CFB",
      alignItems: "center",
      justifyContent: "center",
      gap: 10,
      paddingHorizontal: 24,
    },
    shareCardTitle: { color: "#8CC0FF", fontSize: 22, fontWeight: "900" },
    shareCardName: { color: "#fff", fontSize: 20, fontWeight: "800" },
    shareCardNumber: { color: "#fff", fontSize: 92, fontWeight: "900", lineHeight: 98 },
    shareCardSub: { color: "#d2e7ff", fontSize: 20, fontWeight: "800" },
    shareCardFooter: { color: "rgba(255,255,255,0.75)", fontWeight: "700", textAlign: "center" },
  });

export default StreakScreen;

