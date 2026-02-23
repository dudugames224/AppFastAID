import { doc, getDoc, setDoc } from "firebase/firestore"; 
import { auth, db } from "../firebaseConfig"; 
import {
  ADAPTIVE_BADGE_THRESHOLDS,
  ADAPTIVE_TRACKS,
} from "../data/adaptiveTrainingData";
import { fetchCoursesMeta } from "./lessonService";

const SPECIAL_MODULE_IDS = new Set([
  "course-intro",
  "review-cards",
  "reset-course-action",
]);

const DAY_MS = 24 * 60 * 60 * 1000;
const DEFAULT_EASE_FACTOR = 2.3;
const DEFAULT_REVIEW_INTERVAL_DAYS = 0;
const REVIEW_CARDS_LIMIT = 300;

const ADAPTIVE_TRACK_CHECKPOINTS = ADAPTIVE_TRACKS.reduce((acc, track) => {
  acc[track.id] = Array.isArray(track.checkpoints) ? track.checkpoints : [5, 12, 20];
  return acc;
}, {});

const clampNumber = (value, min, max) => Math.min(max, Math.max(min, value));

const getTodayKey = () => new Date().toISOString().slice(0, 10);

const safeDateDiff = (fromKey, toKey) => {
  const from = new Date(`${fromKey}T00:00:00.000Z`).getTime();
  const to = new Date(`${toKey}T00:00:00.000Z`).getTime();
  if (!Number.isFinite(from) || !Number.isFinite(to)) return null;
  return Math.round((to - from) / DAY_MS);
};

const addDaysIso = (days) => new Date(Date.now() + days * DAY_MS).toISOString();

const normalizeReviewSchedule = (entry = {}) => {
  const easeFactor =
    typeof entry.easeFactor === "number" && Number.isFinite(entry.easeFactor)
      ? clampNumber(entry.easeFactor, 1.3, 3.2)
      : DEFAULT_EASE_FACTOR;
  const intervalDays =
    typeof entry.intervalDays === "number" && Number.isFinite(entry.intervalDays)
      ? Math.max(0, Math.round(entry.intervalDays))
      : DEFAULT_REVIEW_INTERVAL_DAYS;
  const repetitions =
    typeof entry.repetitions === "number" && Number.isFinite(entry.repetitions)
      ? Math.max(0, Math.floor(entry.repetitions))
      : 0;
  const dueAt =
    typeof entry.dueAt === "string" && entry.dueAt.trim().length > 0
      ? entry.dueAt
      : new Date().toISOString();
  const lastResult = entry.lastResult === "correct" ? "correct" : "wrong";

  return { easeFactor, intervalDays, repetitions, dueAt, lastResult };
};

const computeNextReviewSchedule = (existing, wasCorrect) => {
  const current = normalizeReviewSchedule(existing);
  if (!wasCorrect) {
    return {
      easeFactor: clampNumber(current.easeFactor - 0.2, 1.3, 3.2),
      intervalDays: 0,
      repetitions: 0,
      dueAt: new Date().toISOString(),
      lastResult: "wrong",
    };
  }

  const repetitions = current.repetitions + 1;
  const easeFactor = clampNumber(current.easeFactor + 0.08, 1.3, 3.2);

  let intervalDays = 1;
  if (repetitions === 1) {
    intervalDays = 1;
  } else if (repetitions === 2) {
    intervalDays = 3;
  } else {
    const currentInterval = current.intervalDays > 0 ? current.intervalDays : 3;
    intervalDays = Math.max(4, Math.round(currentInterval * easeFactor));
  }

  return {
    easeFactor,
    intervalDays,
    repetitions,
    dueAt: addDaysIso(intervalDays),
    lastResult: "correct",
  };
};

const normalizeQuestionKey = (value) => {
  if (typeof value !== "string") return "";
  return value.trim().toLowerCase();
};

const sanitizeReviewCard = (card, moduleId) => {
  if (!card || typeof card !== "object") return null;

  const question = typeof card.question === "string" ? card.question.trim() : "";
  if (!question) return null;

  const type = card.type === "sequence" ? "sequence" : "mcq";
  const payload = {
    type,
    question,
    moduleId: typeof moduleId === "string" ? moduleId : null,
    correctFeedback:
      typeof card.correctFeedback === "string" ? card.correctFeedback : "",
    incorrectFeedback:
      typeof card.incorrectFeedback === "string" ? card.incorrectFeedback : "",
    updatedAt: new Date().toISOString(),
    ...normalizeReviewSchedule(card),
  };

  if (type === "sequence") {
    const orderOptions = Array.isArray(card.orderOptions)
      ? card.orderOptions
          .map((item, index) => {
            if (typeof item === "string") {
              return { id: item, label: item };
            }
            if (!item || typeof item !== "object") return null;
            const id =
              typeof item.id === "string"
                ? item.id
                : typeof item.label === "string"
                ? item.label
                : `seq-${index}`;
            const label =
              typeof item.label === "string"
                ? item.label
                : typeof item.text === "string"
                ? item.text
                : `Passo ${index + 1}`;
            return { id, label };
          })
          .filter(Boolean)
      : [];

    const correctOrder = Array.isArray(card.correctOrder)
      ? card.correctOrder
          .map((item, index) => {
            if (typeof item === "string") return item;
            if (item && typeof item === "object" && typeof item.id === "string") {
              return item.id;
            }
            return orderOptions[index]?.id || null;
          })
          .filter(Boolean)
      : orderOptions.map((item) => item.id);

    if (orderOptions.length < 2 || correctOrder.length < 2) return null;
    return { ...payload, orderOptions, correctOrder };
  }

  const options = Array.isArray(card.options)
    ? card.options.map((item) => String(item)).filter((item) => item.trim().length > 0)
    : [];
  const answer = typeof card.answer === "number" ? card.answer : -1;
  if (options.length < 2 || answer < 0 || answer >= options.length) return null;

  return { ...payload, options, answer };
};

const dedupeReviewCards = (cards = []) => {
  const mapped = new Map();
  cards.forEach((item) => {
    const key = normalizeQuestionKey(item?.question);
    if (!key) return;
    mapped.set(key, item);
  });
  return Array.from(mapped.values());
};

const getProgressRef = (userId, courseId) => doc(db, "progress", `${userId}_${courseId}`);

/**
 * @param {string} courseId 
 * @returns {Promise<string[]>}
 */
export const getCompletedModules = async (courseId) => {
  const user = auth.currentUser;
  if (!user || !courseId) return [];

  const progressDocRef = getProgressRef(user.uid, courseId);
  const docSnap = await getDoc(progressDocRef);

  return docSnap.exists() ? docSnap.data().completedModules || [] : [];
};

export const getModuleStages = async (courseId) => {
  const user = auth.currentUser;
  if (!user || !courseId) return {};
  const progressDocRef = getProgressRef(user.uid, courseId);
  const docSnap = await getDoc(progressDocRef);
  return docSnap.exists() ? docSnap.data().moduleStages || {} : {};
};

export const getDoctorCompletedModules = async (courseId) => {
  const user = auth.currentUser;
  if (!user || !courseId) return [];
  const progressDocRef = getProgressRef(user.uid, courseId);
  const docSnap = await getDoc(progressDocRef);
  return docSnap.exists() ? docSnap.data().doctorCompletedModules || [] : [];
};

/**
 * @param {string} userId 
 * @param {string} courseId 
 * @returns {Promise<string[]>} 
 */
export const getCompletedModulesForUser = async (userId, courseId) => {
  if (!userId || !courseId) return [];

  const progressDocRef = getProgressRef(userId, courseId);
  const docSnap = await getDoc(progressDocRef);

  return docSnap.exists() ? docSnap.data().completedModules || [] : [];
};

export const markModuleCompleted = async (courseId, moduleId) => {
  const user = auth.currentUser;
  if (!user || !courseId || !moduleId) return;

  const progressDocRef = getProgressRef(user.uid, courseId);
  const currentProgress = await getCompletedModules(courseId);
  const newProgress = [...new Set([...currentProgress, moduleId])];
  await setDoc(progressDocRef, { completedModules: newProgress }, { merge: true });
};

export const markModuleStage = async (courseId, moduleId, stageCount = 1) => {
  const user = auth.currentUser;
  if (!user || !courseId || !moduleId) return;

  const progressDocRef = getProgressRef(user.uid, courseId);
  const docSnap = await getDoc(progressDocRef);
  const data = docSnap.exists() ? docSnap.data() || {} : {};
  const completedModules = data.completedModules || [];
  const moduleStages = data.moduleStages || {};

  const currentStage = typeof moduleStages[moduleId] === "number" ? moduleStages[moduleId] : 0;
  const nextStage = Math.min(stageCount, currentStage + 1);
  moduleStages[moduleId] = nextStage;

  if (nextStage >= stageCount && !completedModules.includes(moduleId)) {
    completedModules.push(moduleId);
  }

  await setDoc(
    progressDocRef,
    { completedModules: [...new Set(completedModules)], moduleStages },
    { merge: true }
  );
};

export const markDoctorModuleCompleted = async (courseId, moduleId) => {
  const user = auth.currentUser;
  if (!user || !courseId || !moduleId) return;

  const progressDocRef = getProgressRef(user.uid, courseId);
  const docSnap = await getDoc(progressDocRef);
  const data = docSnap.exists() ? docSnap.data() || {} : {};
  const current = Array.isArray(data.doctorCompletedModules)
    ? data.doctorCompletedModules
    : [];
  const next = [...new Set([...current, moduleId])];
  await setDoc(progressDocRef, { doctorCompletedModules: next }, { merge: true });
};

export const hasUnlockedReviewForCourse = async (courseId) => {
  const completed = await getCompletedModules(courseId);
  return completed.some((moduleId) => !SPECIAL_MODULE_IDS.has(moduleId));
};

const isValidReviewCard = (card) => {
  if (!card || typeof card !== "object") return false;
  if (typeof card.question !== "string" || !card.question.trim()) return false;
  if (card.type === "sequence") {
    return Array.isArray(card.orderOptions) && card.orderOptions.length > 1;
  }
  return Array.isArray(card.options) && typeof card.answer === "number";
};

const asDueTimestamp = (value) => {
  if (typeof value !== "string") return 0;
  const ts = Date.parse(value);
  return Number.isFinite(ts) ? ts : 0;
};

const buildReviewCardsMap = (cards = []) => {
  const mapped = new Map();
  cards.forEach((item, index) => {
    const key = normalizeQuestionKey(item?.question || `fallback-${index}`);
    if (!key) return;
    mapped.set(key, {
      ...item,
      ...normalizeReviewSchedule(item),
      updatedAt:
        typeof item?.updatedAt === "string" && item.updatedAt.trim()
          ? item.updatedAt
          : new Date().toISOString(),
    });
  });
  return mapped;
};

const listReviewCards = (cards = [], { dueOnly = false, limit = null } = {}) => {
  const now = Date.now();
  const deduped = dedupeReviewCards(cards)
    .map((card) => ({ ...card, ...normalizeReviewSchedule(card) }))
    .filter(isValidReviewCard)
    .sort((a, b) => asDueTimestamp(a.dueAt) - asDueTimestamp(b.dueAt));

  const filtered = dueOnly
    ? deduped.filter((card) => {
        const due = asDueTimestamp(card.dueAt);
        return !due || due <= now;
      })
    : deduped;

  if (typeof limit === "number" && Number.isFinite(limit) && limit > 0) {
    return filtered.slice(0, Math.floor(limit));
  }
  return filtered;
};

const upsertReviewCardOutcome = async (courseId, card, moduleId, wasCorrect) => {
  const user = auth.currentUser;
  if (!user || !courseId) return false;

  const sanitized = sanitizeReviewCard(card, moduleId);
  if (!sanitized) return false;

  try {
    const progressDocRef = getProgressRef(user.uid, courseId);
    const docSnap = await getDoc(progressDocRef);
    const data = docSnap.exists() ? docSnap.data() || {} : {};
    const existingCards = Array.isArray(data.reviewMistakes) ? data.reviewMistakes : [];
    const cardMap = buildReviewCardsMap(existingCards);
    const key = normalizeQuestionKey(sanitized.question);
    const previous = cardMap.get(key);

    // Repeticao espacada foca no que ja apresentou erro.
    if (!previous && wasCorrect) {
      return true;
    }

    const schedule = computeNextReviewSchedule(previous || sanitized, Boolean(wasCorrect));

    cardMap.set(key, {
      ...(previous || {}),
      ...sanitized,
      ...schedule,
      moduleId:
        typeof moduleId === "string" && moduleId.trim().length > 0
          ? moduleId
          : previous?.moduleId || sanitized.moduleId || null,
      updatedAt: new Date().toISOString(),
    });

    const merged = Array.from(cardMap.values())
      .sort((a, b) => asDueTimestamp(a.dueAt) - asDueTimestamp(b.dueAt))
      .slice(-REVIEW_CARDS_LIMIT);

    await setDoc(progressDocRef, { reviewMistakes: merged }, { merge: true });
    return true;
  } catch (error) {
    console.error("Erro ao salvar questao para revisao:", error);
    return false;
  }
};

export const saveWrongReviewCard = async (courseId, card, moduleId) =>
  upsertReviewCardOutcome(courseId, card, moduleId, false);

export const recordReviewCardOutcome = async (
  courseId,
  card,
  wasCorrect,
  moduleId
) => upsertReviewCardOutcome(courseId, card, moduleId, Boolean(wasCorrect));

export const getReviewCards = async (courseId, options = {}) => {
  const user = auth.currentUser;
  if (!user || !courseId) return [];

  try {
    const progressDocRef = getProgressRef(user.uid, courseId);
    const docSnap = await getDoc(progressDocRef);
    if (!docSnap.exists()) return [];

    const data = docSnap.data() || {};
    const cards = Array.isArray(data.reviewMistakes) ? data.reviewMistakes : [];
    return listReviewCards(cards, options);
  } catch (error) {
    console.error("Erro ao buscar questoes de revisao:", error);
    return [];
  }
};

export const getDueReviewCards = async (courseId, limit = 25) =>
  getReviewCards(courseId, { dueOnly: true, limit });

const getTrackLevel = (trackId, attempts) => {
  const checkpoints = ADAPTIVE_TRACK_CHECKPOINTS[trackId] || [5, 12, 20];
  let level = 0;
  checkpoints.forEach((target, idx) => {
    if (attempts >= target) level = idx + 1;
  });
  return level;
};

const getBadgeLevel = (xp) => {
  let badgeLevel = 0;
  ADAPTIVE_BADGE_THRESHOLDS.forEach((threshold, index) => {
    if (xp >= threshold) badgeLevel = index + 1;
  });
  return badgeLevel;
};

const normalizeAdaptiveTrackState = (input = {}, trackId) => {
  const attempts =
    typeof input.attempts === "number" && Number.isFinite(input.attempts)
      ? Math.max(0, Math.floor(input.attempts))
      : 0;
  const success =
    typeof input.success === "number" && Number.isFinite(input.success)
      ? Math.max(0, Math.floor(input.success))
      : 0;
  const level =
    typeof input.level === "number" && Number.isFinite(input.level)
      ? Math.max(getTrackLevel(trackId, attempts), Math.floor(input.level))
      : getTrackLevel(trackId, attempts);
  const checkpoints =
    (ADAPTIVE_TRACK_CHECKPOINTS[trackId] || [5, 12, 20]).map((target) => attempts >= target);
  return {
    attempts,
    success,
    level,
    checkpoints,
    updatedAt:
      typeof input.updatedAt === "string" && input.updatedAt.trim()
        ? input.updatedAt
        : new Date().toISOString(),
  };
};

const normalizeAdaptiveSkillState = (input = {}) => {
  const xp =
    typeof input.xp === "number" && Number.isFinite(input.xp)
      ? Math.max(0, Math.floor(input.xp))
      : 0;
  const badgeLevel =
    typeof input.badgeLevel === "number" && Number.isFinite(input.badgeLevel)
      ? Math.max(getBadgeLevel(xp), Math.floor(input.badgeLevel))
      : getBadgeLevel(xp);
  return {
    xp,
    badgeLevel,
    updatedAt:
      typeof input.updatedAt === "string" && input.updatedAt.trim()
        ? input.updatedAt
        : new Date().toISOString(),
  };
};

const buildDefaultAdaptiveSnapshot = () => {
  const tracks = {};
  ADAPTIVE_TRACKS.forEach((track) => {
    tracks[track.id] = normalizeAdaptiveTrackState({}, track.id);
  });
  return {
    tracks,
    skills: {},
    events: {},
    daily: {
      microStreak: 0,
      totalMicroSessions: 0,
      lastSessionDate: null,
      updatedAt: new Date().toISOString(),
    },
    lastSession: null,
  };
};

const normalizeAdaptiveSnapshot = (adaptive = {}) => {
  const base = buildDefaultAdaptiveSnapshot();
  const tracks = { ...base.tracks };
  const sourceTracks = adaptive.tracks && typeof adaptive.tracks === "object" ? adaptive.tracks : {};
  Object.keys(tracks).forEach((trackId) => {
    tracks[trackId] = normalizeAdaptiveTrackState(sourceTracks[trackId] || {}, trackId);
  });

  const skills = {};
  const sourceSkills = adaptive.skills && typeof adaptive.skills === "object" ? adaptive.skills : {};
  Object.keys(sourceSkills).forEach((skillId) => {
    skills[skillId] = normalizeAdaptiveSkillState(sourceSkills[skillId] || {});
  });

  const events = adaptive.events && typeof adaptive.events === "object" ? adaptive.events : {};
  const dailySource = adaptive.daily && typeof adaptive.daily === "object" ? adaptive.daily : {};
  const daily = {
    microStreak:
      typeof dailySource.microStreak === "number" && Number.isFinite(dailySource.microStreak)
        ? Math.max(0, Math.floor(dailySource.microStreak))
        : 0,
    totalMicroSessions:
      typeof dailySource.totalMicroSessions === "number" &&
      Number.isFinite(dailySource.totalMicroSessions)
        ? Math.max(0, Math.floor(dailySource.totalMicroSessions))
        : 0,
    lastSessionDate:
      typeof dailySource.lastSessionDate === "string" && dailySource.lastSessionDate.trim()
        ? dailySource.lastSessionDate
        : null,
    updatedAt:
      typeof dailySource.updatedAt === "string" && dailySource.updatedAt.trim()
        ? dailySource.updatedAt
        : new Date().toISOString(),
  };

  return {
    tracks,
    skills,
    events,
    daily,
    lastSession: adaptive.lastSession || null,
  };
};

export const getAdaptiveDashboard = async (courseId) => {
  const user = auth.currentUser;
  if (!user || !courseId) return buildDefaultAdaptiveSnapshot();
  try {
    const progressRef = getProgressRef(user.uid, courseId);
    const snap = await getDoc(progressRef);
    if (!snap.exists()) {
      return buildDefaultAdaptiveSnapshot();
    }
    const data = snap.data() || {};
    return normalizeAdaptiveSnapshot(data.adaptive || {});
  } catch (error) {
    console.error("Erro ao carregar painel adaptativo:", error);
    return buildDefaultAdaptiveSnapshot();
  }
};

export const saveAdaptiveSessionOutcome = async (courseId, payload = {}) => {
  const user = auth.currentUser;
  if (!user || !courseId) return false;

  try {
    const progressRef = getProgressRef(user.uid, courseId);
    const snap = await getDoc(progressRef);
    const data = snap.exists() ? snap.data() || {} : {};
    const adaptive = normalizeAdaptiveSnapshot(data.adaptive || {});
    const nowIso = new Date().toISOString();

    const trackAttempts =
      payload.trackAttempts && typeof payload.trackAttempts === "object"
        ? payload.trackAttempts
        : {};
    Object.entries(trackAttempts).forEach(([trackId, values]) => {
      if (!adaptive.tracks[trackId]) return;
      const prev = adaptive.tracks[trackId];
      const attemptsDelta =
        typeof values?.attempts === "number" && Number.isFinite(values.attempts)
          ? Math.max(0, Math.floor(values.attempts))
          : 0;
      const successDelta =
        typeof values?.success === "number" && Number.isFinite(values.success)
          ? Math.max(0, Math.floor(values.success))
          : 0;
      adaptive.tracks[trackId] = normalizeAdaptiveTrackState(
        {
          ...prev,
          attempts: prev.attempts + attemptsDelta,
          success: prev.success + successDelta,
          updatedAt: nowIso,
        },
        trackId
      );
    });

    const skillXpById =
      payload.skillXpById && typeof payload.skillXpById === "object"
        ? payload.skillXpById
        : {};
    Object.entries(skillXpById).forEach(([skillId, delta]) => {
      const xpDelta =
        typeof delta === "number" && Number.isFinite(delta)
          ? Math.max(0, Math.floor(delta))
          : 0;
      if (xpDelta <= 0) return;
      const prev = normalizeAdaptiveSkillState(adaptive.skills[skillId] || {});
      adaptive.skills[skillId] = normalizeAdaptiveSkillState({
        ...prev,
        xp: prev.xp + xpDelta,
        updatedAt: nowIso,
      });
    });

    const mode = typeof payload.mode === "string" ? payload.mode : null;
    if (mode === "micro-session" || mode === "daily-emergency") {
      const todayKey = getTodayKey();
      const previousKey =
        typeof adaptive.daily.lastSessionDate === "string" ? adaptive.daily.lastSessionDate : null;
      const diff = previousKey ? safeDateDiff(previousKey, todayKey) : null;

      let microStreak = adaptive.daily.microStreak;
      if (!previousKey) {
        microStreak = 1;
      } else if (previousKey === todayKey) {
        microStreak = adaptive.daily.microStreak;
      } else if (diff === 1) {
        microStreak = adaptive.daily.microStreak + 1;
      } else {
        microStreak = 1;
      }

      adaptive.daily = {
        microStreak,
        totalMicroSessions:
          adaptive.daily.totalMicroSessions + (previousKey === todayKey ? 0 : 1),
        lastSessionDate: todayKey,
        updatedAt: nowIso,
      };
    }

    if (typeof payload.eventType === "string" && payload.eventType.trim()) {
      const eventKey = payload.eventType.trim();
      const previous = adaptive.events[eventKey] || {
        completions: 0,
        bestAccuracy: 0,
      };
      const accuracy =
        typeof payload.accuracy === "number" && Number.isFinite(payload.accuracy)
          ? clampNumber(payload.accuracy, 0, 100)
          : 0;
      adaptive.events[eventKey] = {
        completions:
          (typeof previous.completions === "number" && Number.isFinite(previous.completions)
            ? previous.completions
            : 0) + 1,
        bestAccuracy: Math.max(
          typeof previous.bestAccuracy === "number" && Number.isFinite(previous.bestAccuracy)
            ? previous.bestAccuracy
            : 0,
          accuracy
        ),
        lastCompletedAt: nowIso,
      };
    }

    adaptive.lastSession = {
      mode,
      accuracy:
        typeof payload.accuracy === "number" && Number.isFinite(payload.accuracy)
          ? clampNumber(payload.accuracy, 0, 100)
          : 0,
      answered:
        typeof payload.answered === "number" && Number.isFinite(payload.answered)
          ? Math.max(0, Math.floor(payload.answered))
          : 0,
      durationSeconds:
        typeof payload.durationSeconds === "number" && Number.isFinite(payload.durationSeconds)
          ? Math.max(0, Math.floor(payload.durationSeconds))
          : 0,
      completedAt: nowIso,
    };

    await setDoc(progressRef, { adaptive }, { merge: true });
    return true;
  } catch (error) {
    console.error("Erro ao salvar sessao adaptativa:", error);
    return false;
  }
};

export const getUserAchievements = async (userId) => {
  if (!userId) return { achievements: {}, courses: [] };

  try {
    const courses = await fetchCoursesMeta();
    const status = {};

    for (const course of courses) {
      const completedModules = await getCompletedModulesForUser(userId, course.id);
      status[course.id] = completedModules.length > 0;
    }
    return { achievements: status, courses };
  } catch (error) {
    console.error("Erro ao buscar conquistas do usuário:", error);
    return { achievements: {}, courses: [] };
  }
};
