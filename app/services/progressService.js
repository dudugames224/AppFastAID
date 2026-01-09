import { doc, getDoc, setDoc } from "firebase/firestore"; 
import { auth, db } from "../firebaseConfig"; 
import { fetchCoursesMeta } from "./lessonService";

/**
 * @param {string} courseId 
 * @returns {Promise<string[]>}
 */
export const getCompletedModules = async (courseId) => {
  const user = auth.currentUser;
  if (!user || !courseId) return [];

  const progressDocRef = doc(db, "progress", `${user.uid}_${courseId}`);
  const docSnap = await getDoc(progressDocRef);

  return docSnap.exists() ? docSnap.data().completedModules || [] : [];
};

export const getModuleStages = async (courseId) => {
  const user = auth.currentUser;
  if (!user || !courseId) return {};
  const progressDocRef = doc(db, "progress", `${user.uid}_${courseId}`);
  const docSnap = await getDoc(progressDocRef);
  return docSnap.exists() ? docSnap.data().moduleStages || {} : {};
};

/**
 * @param {string} userId 
 * @param {string} courseId 
 * @returns {Promise<string[]>} 
 */
export const getCompletedModulesForUser = async (userId, courseId) => {
  if (!userId || !courseId) return [];

  const progressDocRef = doc(db, "progress", `${userId}_${courseId}`);
  const docSnap = await getDoc(progressDocRef);

  return docSnap.exists() ? docSnap.data().completedModules || [] : [];
};

export const markModuleCompleted = async (courseId, moduleId) => {
  const user = auth.currentUser;
  if (!user || !courseId || !moduleId) return;

  const progressDocRef = doc(db, "progress", `${user.uid}_${courseId}`);
  const currentProgress = await getCompletedModules(courseId);
  const newProgress = [...new Set([...currentProgress, moduleId])];
  await setDoc(progressDocRef, { completedModules: newProgress }, { merge: true });
};

export const markModuleStage = async (courseId, moduleId, stageCount = 1) => {
  const user = auth.currentUser;
  if (!user || !courseId || !moduleId) return;

  const progressDocRef = doc(db, "progress", `${user.uid}_${courseId}`);
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
