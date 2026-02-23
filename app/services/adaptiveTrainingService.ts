import {
  ADAPTIVE_BADGE_THRESHOLDS,
  ADAPTIVE_EVENTS,
  ADAPTIVE_EXCLUDED_COURSE_IDS,
  ADAPTIVE_SKILL_LABELS,
  ADAPTIVE_TRACKS,
  AdaptiveEventType,
  AdaptiveScenarioTemplate,
  DEFAULT_SCENARIOS,
  PRESSURE_DISTRACTIONS,
  SCENARIO_AGES,
  SCENARIO_LOCATIONS_BY_TRACK,
  SCENARIO_RESOURCES,
  SCENARIO_TIME_PRESSURE,
  SCENARIOS_BY_COURSE,
  SkillId,
  TrackId,
} from "../data/adaptiveTrainingData";
import { LessonCard } from "../types/lesson";

export type AdaptiveLessonMode =
  | "micro-session"
  | "pressure"
  | "daily-emergency"
  | "weekly-challenge"
  | "monthly-sim";

export type AdaptiveDeckConfig = {
  questionCount: number;
  includeScenario: boolean;
  forcePressure: boolean;
  timerSeconds: number | null;
};

export type AdaptiveCardMeta = {
  source: "module" | "review" | "scenario";
  trackId?: TrackId;
  primarySkill: SkillId;
  urgency?: "alta" | "media";
  pressureHint?: string;
};

export type AdaptiveCard = LessonCard & {
  adaptiveMeta?: AdaptiveCardMeta;
};

const normalize = (value: string) =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "");

const excludedNormalized = new Set(ADAPTIVE_EXCLUDED_COURSE_IDS.map(normalize));

const createSeededRandom = (seed: number) => {
  let state = Math.max(1, Math.floor(seed) || 1);
  return () => {
    state = (state * 1664525 + 1013904223) % 4294967296;
    return state / 4294967296;
  };
};

const hashString = (value: string): number => {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
};

const getCardQuestion = (card: LessonCard): string => {
  if (card.type === "info") {
    return `${card.title || ""} ${card.text || ""}`.trim();
  }
  return (card as any).question || "";
};

export const getCardStableKey = (card: LessonCard, fallbackIndex: number = 0) => {
  const text = getCardQuestion(card);
  if (text.trim().length > 0) {
    return normalize(text);
  }
  return `fallback-${fallbackIndex}`;
};

const cloneCard = (card: LessonCard): LessonCard => {
  if (card.type === "mcq") {
    return {
      ...card,
      options: Array.isArray(card.options) ? [...card.options] : [],
    };
  }
  if (card.type === "sequence") {
    return {
      ...card,
      orderOptions: Array.isArray(card.orderOptions)
        ? card.orderOptions.map((item) => ({ ...item }))
        : [],
      correctOrder: Array.isArray(card.correctOrder) ? [...card.correctOrder] : [],
    };
  }
  return { ...card };
};

const pickRandom = <T,>(items: T[], random: () => number): T => {
  if (items.length === 0) {
    throw new Error("Cannot pick from empty list.");
  }
  const index = Math.floor(random() * items.length);
  return items[index];
};

const seededShuffle = <T,>(items: T[], random: () => number): T[] => {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
};

export const isAdaptiveCourseEnabled = (courseId: string) => {
  if (!courseId) return false;
  return !excludedNormalized.has(normalize(courseId));
};

export const getAdaptiveTracks = () => ADAPTIVE_TRACKS;

export const getAdaptiveSkills = () => ADAPTIVE_SKILL_LABELS;

export const getAdaptiveBadgeThresholds = () => ADAPTIVE_BADGE_THRESHOLDS;

export const inferSkillFromCard = (card: LessonCard, fallback: SkillId = "decision"): SkillId => {
  const question = getCardQuestion(card).toLowerCase();

  if (/engasg|via aerea|heimlich|obstruc|aspir|respira/.test(question)) return "airway";
  if (/sangr|hemorrag|torniquet|ferida|compressao/.test(question)) return "bleeding";
  if (/convuls|crise|epilep/.test(question)) return "seizure";
  if (/abc|triagem|avaliacao primaria|vias aereas|circulacao/.test(question)) return "abc";
  if (/choque|hipovolem|palidez|sudorese fria/.test(question)) return "shock";

  return fallback;
};

export const getDeckConfigForMode = (mode: AdaptiveLessonMode): AdaptiveDeckConfig => {
  switch (mode) {
    case "micro-session":
      return { questionCount: 6, includeScenario: true, forcePressure: false, timerSeconds: null };
    case "pressure":
      return { questionCount: 8, includeScenario: true, forcePressure: true, timerSeconds: 14 };
    case "daily-emergency":
      return { questionCount: 5, includeScenario: true, forcePressure: true, timerSeconds: 12 };
    case "weekly-challenge":
      return { questionCount: 10, includeScenario: true, forcePressure: true, timerSeconds: 12 };
    case "monthly-sim":
      return { questionCount: 14, includeScenario: true, forcePressure: true, timerSeconds: 14 };
    default:
      return { questionCount: 6, includeScenario: true, forcePressure: false, timerSeconds: null };
  }
};

const getCourseScenarioTemplates = (courseId: string): AdaptiveScenarioTemplate[] => {
  const normalizedCourse = normalize(courseId);
  const fromCourse = SCENARIOS_BY_COURSE[normalizedCourse] || [];
  return [...fromCourse, ...DEFAULT_SCENARIOS];
};

export const pickTrackForSeed = (seed: number): TrackId => {
  const random = createSeededRandom(seed);
  return pickRandom(ADAPTIVE_TRACKS, random).id;
};

type BuildScenarioParams = {
  courseId: string;
  trackId?: TrackId;
  seed?: number;
  pressureHint?: string;
};

export const buildScenarioCard = ({
  courseId,
  trackId,
  seed = Date.now(),
  pressureHint,
}: BuildScenarioParams): AdaptiveCard => {
  const random = createSeededRandom(seed);
  const selectedTrack = trackId
    ? ADAPTIVE_TRACKS.find((track) => track.id === trackId) || ADAPTIVE_TRACKS[0]
    : pickRandom(ADAPTIVE_TRACKS, random);

  const location = pickRandom(SCENARIO_LOCATIONS_BY_TRACK[selectedTrack.id], random);
  const age = pickRandom(SCENARIO_AGES, random);
  const resources = pickRandom(SCENARIO_RESOURCES, random);
  const timePressure = pressureHint || pickRandom(SCENARIO_TIME_PRESSURE, random);
  const template = pickRandom(getCourseScenarioTemplates(courseId), random);

  const options = seededShuffle(
    [template.correctAction, ...template.wrongActions.slice(0, 3)],
    random
  );

  const answer = Math.max(0, options.indexOf(template.correctAction));
  const question = `Cenario (${selectedTrack.title}): ${age} em ${location} com ${template.symptom}. Recursos: ${resources}. ${timePressure}. Qual acao priorizar primeiro?`;

  return {
    type: "mcq",
    question,
    options,
    answer,
    correctFeedback:
      template.urgency === "alta"
        ? "Boa decisao. Voce priorizou uma conduta que reduz risco imediato."
        : "Boa escolha. A conduta segue a prioridade correta do primeiro atendimento.",
    incorrectFeedback:
      "Nesta situacao, a prioridade e reduzir risco imediato e acionar suporte rapido.",
    adaptiveMeta: {
      source: "scenario",
      trackId: selectedTrack.id,
      primarySkill: template.primarySkill,
      urgency: template.urgency,
      pressureHint: timePressure,
    },
  };
};

const normalizeDeck = (
  cards: LessonCard[],
  source: "module" | "review",
  fallbackSkill: SkillId = "decision"
): AdaptiveCard[] => {
  return cards
    .filter((card) => card && card.type !== "info")
    .map((card) => {
      const clone = cloneCard(card) as AdaptiveCard;
      clone.adaptiveMeta = {
        source,
        primarySkill: inferSkillFromCard(card, fallbackSkill),
      };
      return clone;
    });
};

const removeDuplicates = (cards: AdaptiveCard[]): AdaptiveCard[] => {
  const unique = new Map<string, AdaptiveCard>();
  cards.forEach((card, index) => {
    const key = getCardStableKey(card, index);
    if (!unique.has(key)) {
      unique.set(key, card);
    }
  });
  return Array.from(unique.values());
};

type BuildAdaptiveDeckParams = {
  courseId: string;
  moduleCards: LessonCard[];
  reviewCards: LessonCard[];
  mode: AdaptiveLessonMode;
  seed?: number;
  fixedTrackId?: TrackId;
};

export const buildAdaptiveDeck = ({
  courseId,
  moduleCards,
  reviewCards,
  mode,
  seed,
  fixedTrackId,
}: BuildAdaptiveDeckParams): AdaptiveCard[] => {
  const resolvedSeed = seed ?? hashString(`${courseId}:${mode}:${new Date().toDateString()}`);
  const random = createSeededRandom(resolvedSeed);
  const config = getDeckConfigForMode(mode);

  const normalizedModule = normalizeDeck(moduleCards, "module");
  const normalizedReview = normalizeDeck(reviewCards, "review");
  const dueFirstReview = seededShuffle(normalizedReview, random);
  const randomizedModule = seededShuffle(normalizedModule, random);

  const reviewTarget =
    mode === "micro-session" || mode === "daily-emergency"
      ? Math.min(2, dueFirstReview.length)
      : Math.min(4, dueFirstReview.length);

  const scenarioTarget = config.includeScenario ? (mode === "monthly-sim" ? 2 : 1) : 0;
  const pool: AdaptiveCard[] = [];

  if (reviewTarget > 0) {
    pool.push(...dueFirstReview.slice(0, reviewTarget));
  }

  const scenarioCards = Array.from({ length: scenarioTarget }).map((_, index) =>
    buildScenarioCard({
      courseId,
      trackId: fixedTrackId,
      seed: resolvedSeed + index * 17 + 1,
      pressureHint: config.forcePressure ? pickRandom(PRESSURE_DISTRACTIONS, random) : undefined,
    })
  );
  pool.push(...scenarioCards);

  const remaining = Math.max(0, config.questionCount - pool.length);
  if (remaining > 0) {
    pool.push(...randomizedModule.slice(0, remaining));
  }

  const normalized = removeDuplicates(pool);
  if (normalized.length === 0) {
    return scenarioCards.length > 0 ? scenarioCards : [buildScenarioCard({ courseId, seed: resolvedSeed })];
  }

  const finalDeck: AdaptiveCard[] = [];
  while (finalDeck.length < config.questionCount) {
    finalDeck.push(cloneCard(normalized[finalDeck.length % normalized.length]) as AdaptiveCard);
  }
  return seededShuffle(finalDeck, random);
};

export const getPressureHint = (seed: number = Date.now()): string => {
  const random = createSeededRandom(seed);
  return pickRandom(PRESSURE_DISTRACTIONS, random);
};

export const getAdaptiveEventsForToday = (date: Date = new Date()) => {
  const daySeed = hashString(`${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`);
  const weekSeed = hashString(`week-${date.getFullYear()}-${Math.floor(date.getDate() / 7)}`);
  const monthSeed = hashString(`month-${date.getFullYear()}-${date.getMonth()}`);

  return ADAPTIVE_EVENTS.map((event) => {
    const seed =
      event.type === "daily-emergency"
        ? daySeed
        : event.type === "weekly-challenge"
        ? weekSeed
        : monthSeed;

    return {
      ...event,
      seed,
      trackId: pickTrackForSeed(seed),
    };
  });
};

export const getEventModeFromType = (type: AdaptiveEventType): AdaptiveLessonMode => {
  if (type === "daily-emergency") return "daily-emergency";
  if (type === "weekly-challenge") return "weekly-challenge";
  return "monthly-sim";
};
