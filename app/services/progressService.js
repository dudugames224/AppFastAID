import { doc, getDoc, setDoc } from "firebase/firestore"; 
import { auth, db } from "../firebaseConfig"; 
import { fetchCoursesMeta } from "./lessonService";

const SPECIAL_MODULE_IDS = new Set([
  "course-intro",
  "review-cards",
  "reset-course-action",
]);

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

export const saveWrongReviewCard = async (courseId, card, moduleId) => {
  const user = auth.currentUser;
  if (!user || !courseId) return false;

  const sanitized = sanitizeReviewCard(card, moduleId);
  if (!sanitized) return false;

  try {
    const progressDocRef = getProgressRef(user.uid, courseId);
    const docSnap = await getDoc(progressDocRef);
    const data = docSnap.exists() ? docSnap.data() || {} : {};
    const existing = Array.isArray(data.reviewMistakes) ? data.reviewMistakes : [];
    const merged = dedupeReviewCards([...existing, sanitized]).slice(-200);

    await setDoc(progressDocRef, { reviewMistakes: merged }, { merge: true });
    return true;
  } catch (error) {
    console.error("Erro ao salvar questao para revisao:", error);
    return false;
  }
};

export const getReviewCards = async (courseId) => {
  const user = auth.currentUser;
  if (!user || !courseId) return [];

  try {
    const progressDocRef = getProgressRef(user.uid, courseId);
    const docSnap = await getDoc(progressDocRef);
    if (!docSnap.exists()) return [];

    const data = docSnap.data() || {};
    const cards = Array.isArray(data.reviewMistakes) ? data.reviewMistakes : [];

    return dedupeReviewCards(cards).filter((card) => {
      if (!card || typeof card !== "object") return false;
      if (typeof card.question !== "string" || !card.question.trim()) return false;
      if (card.type === "sequence") {
        return Array.isArray(card.orderOptions) && card.orderOptions.length > 1;
      }
      return Array.isArray(card.options) && typeof card.answer === "number";
    });
  } catch (error) {
    console.error("Erro ao buscar questoes de revisao:", error);
    return [];
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
