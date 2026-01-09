import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  Image,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../context/ThemeContext";
import { getUserData } from "../firebaseConfig";

const daysOfWeek = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

const buildMonthGrid = (year: number, month: number) => {
  const firstDay = new Date(year, month, 1).getDay();
  const totalDays = new Date(year, month + 1, 0).getDate();
  const grid: Array<{ day: number; date: Date }> = [];
  for (let i = 0; i < firstDay; i++) {
    grid.push({ day: 0, date: new Date(year, month, i - firstDay + 1) });
  }
  for (let d = 1; d <= totalDays; d++) {
    grid.push({ day: d, date: new Date(year, month, d) });
  }
  return grid;
};

const StreakScreen = () => {
  const router = useRouter();
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [streak, setStreak] = useState(0);
  const [lastLessonDate, setLastLessonDate] = useState<Date | null>(null);

  useEffect(() => {
    const loadData = async () => {
      const data = await getUserData();
      const ofensiva =
        typeof (data as any)?.ofensiva === "number"
          ? (data as any).ofensiva
          : typeof (data as any)?.streak === "number"
          ? (data as any).streak
          : 0;
      setStreak(ofensiva);
      const last = (data as any)?.lastLessonDate
        ? new Date((data as any).lastLessonDate)
        : null;
      setLastLessonDate(last && !isNaN(last.getTime()) ? last : null);
    };
    loadData();
  }, []);

  const now = new Date();
  const grid = buildMonthGrid(now.getFullYear(), now.getMonth());

  const streakDates = useMemo(() => {
    const set = new Set<string>();
    if (!streak) return set;
    const base = lastLessonDate && !isNaN(lastLessonDate.getTime()) ? lastLessonDate : now;
    for (let i = 0; i < streak; i++) {
      const d = new Date(base);
      d.setDate(d.getDate() - i);
      set.add(d.toDateString());
    }
    return set;
  }, [streak, now, lastLessonDate]);

  const practicedCount = streakDates.size;

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn}>
          <Ionicons name="close" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Streak</Text>
        <View style={styles.headerBtn}>
          <Ionicons name="share-social" size={20} color="#fff" />
        </View>
      </View>
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
        <View style={styles.tabRow}>
          <Text style={[styles.tab, styles.tabActive]}>PERSONAL</Text>
          <Text style={styles.tab}>FRIENDS</Text>
        </View>

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
              Você manteve sua ofensiva por {streak >= 14 ? "2 semanas +" : `${streak} dias`} seguidos!
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
      </ScrollView>
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
    tabActive: { color: "#5D9CFB", borderBottomWidth: 2, borderBottomColor: "#5D9CFB", paddingBottom: 4 },
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
    weekHeaderText: { color: "rgba(255,255,255,0.6)", fontWeight: "800", width: 32, textAlign: "center" },
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
  });

export default StreakScreen;
