import {
  collection,
  doc,
  getDocs,
  limit,
  orderBy,
  query,
  runTransaction,
  setDoc,
} from "firebase/firestore";
import { db } from "../firebaseConfig";

export type WeeklySeason = {
  id: string;
  label: string;
  startsAtIso: string;
  endsAtIso: string;
};

export type WeeklyLeaderboardEntry = {
  uid: string;
  name: string;
  avatar: string;
  xp: number;
};

const MS_IN_DAY = 24 * 60 * 60 * 1000;

const isPermissionError = (error: unknown) =>
  typeof (error as { code?: unknown })?.code === "string" &&
  String((error as { code?: unknown }).code).toLowerCase().includes("permission-denied");

const getIsoWeekData = (date: Date) => {
  const utc = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const day = utc.getUTCDay() || 7;
  utc.setUTCDate(utc.getUTCDate() + 4 - day);
  const isoYear = utc.getUTCFullYear();
  const yearStart = new Date(Date.UTC(isoYear, 0, 1));
  const week = Math.ceil((((utc.getTime() - yearStart.getTime()) / MS_IN_DAY) + 1) / 7);
  return { isoYear, week };
};

const getIsoWeekRangeUtc = (date: Date) => {
  const utc = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const day = utc.getUTCDay() || 7;
  const monday = new Date(utc);
  monday.setUTCDate(utc.getUTCDate() - day + 1);
  monday.setUTCHours(0, 0, 0, 0);
  const sunday = new Date(monday);
  sunday.setUTCDate(monday.getUTCDate() + 6);
  sunday.setUTCHours(23, 59, 59, 999);
  return { monday, sunday };
};

export const getCurrentWeeklySeason = (date: Date = new Date()): WeeklySeason => {
  const { isoYear, week } = getIsoWeekData(date);
  const { monday, sunday } = getIsoWeekRangeUtc(date);
  const paddedWeek = String(week).padStart(2, "0");
  return {
    id: `${isoYear}-W${paddedWeek}`,
    label: `Semana ${paddedWeek}/${isoYear}`,
    startsAtIso: monday.toISOString(),
    endsAtIso: sunday.toISOString(),
  };
};

export const addWeeklyXp = async (
  userId: string,
  xpDelta: number,
  profile?: { nome?: string; avatar?: string }
): Promise<number> => {
  if (!userId || !Number.isFinite(xpDelta) || xpDelta <= 0) return 0;

  const season = getCurrentWeeklySeason();
  const userRef = doc(db, "users", userId);
  const leaderboardEntryRef = doc(db, "leaderboards", season.id, "entries", userId);
  const nowIso = new Date().toISOString();

  try {
    const result = await runTransaction(db, async (transaction) => {
      const userSnap = await transaction.get(userRef);
      const userData = userSnap.exists() ? userSnap.data() : {};
      const previousSeason = typeof userData.weeklySeasonId === "string" ? userData.weeklySeasonId : null;
      const previousWeeklyXp =
        previousSeason === season.id && typeof userData.weeklyXp === "number" ? userData.weeklyXp : 0;
      const nextWeeklyXp = previousWeeklyXp + xpDelta;

      const displayName =
        (typeof profile?.nome === "string" && profile.nome.trim()) ||
        (typeof userData.nome === "string" && userData.nome.trim()) ||
        "Usuario";
      const avatar =
        (typeof profile?.avatar === "string" && profile.avatar.trim()) ||
        (typeof userData.avatar === "string" && userData.avatar.trim()) ||
        ":-)";

      transaction.set(
        userRef,
        {
          weeklySeasonId: season.id,
          weeklyXp: nextWeeklyXp,
          weeklyUpdatedAt: nowIso,
        },
        { merge: true }
      );

      transaction.set(
        leaderboardEntryRef,
        {
          uid: userId,
          name: displayName,
          avatar,
          xp: nextWeeklyXp,
          updatedAt: nowIso,
        },
        { merge: true }
      );

      return nextWeeklyXp;
    });

    return result;
  } catch (error) {
    if (isPermissionError(error)) {
      return 0;
    }
    throw error;
  }
};

export const fetchWeeklyLeaderboard = async (size: number = 100): Promise<WeeklyLeaderboardEntry[]> => {
  try {
    const season = getCurrentWeeklySeason();
    const leaderboardRef = collection(db, "leaderboards", season.id, "entries");
    const q = query(leaderboardRef, orderBy("xp", "desc"), limit(Math.max(1, size)));
    const snapshot = await getDocs(q);

    return snapshot.docs.map((item) => {
      const data = item.data() as Record<string, unknown>;
      return {
        uid: typeof data.uid === "string" ? data.uid : item.id,
        name: typeof data.name === "string" ? data.name : "Usuario",
        avatar: typeof data.avatar === "string" ? data.avatar : ":-)",
        xp: typeof data.xp === "number" ? data.xp : 0,
      };
    });
  } catch (error) {
    if (isPermissionError(error)) {
      return [];
    }
    throw error;
  }
};

export const ensureWeeklyEntry = async (userId: string): Promise<void> => {
  if (!userId) return;
  const season = getCurrentWeeklySeason();
  const entryRef = doc(db, "leaderboards", season.id, "entries", userId);
  await setDoc(
    entryRef,
    {
      uid: userId,
      xp: 0,
      name: "Usuario",
      avatar: ":-)",
      updatedAt: new Date().toISOString(),
    },
    { merge: true }
  );
};
