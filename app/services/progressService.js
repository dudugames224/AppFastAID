import { doc, getDoc, setDoc } from "firebase/firestore"; // Mantém a importação direta
import { auth, db } from "../firebaseConfig"; // Pega apenas o essencial da sua config
import { fetchCoursesMeta } from "./lessonService";

/**
 * Retorna uma lista de IDs de módulos concluídos para um curso específico do usuário logado.
 * @param {string} courseId - O ID do curso.
 * @returns {Promise<string[]>} - Array com os IDs dos módulos concluídos.
 */
export const getCompletedModules = async (courseId) => {
  const user = auth.currentUser;
  if (!user || !courseId) return [];

  const progressDocRef = doc(db, "progress", `${user.uid}_${courseId}`);
  const docSnap = await getDoc(progressDocRef);

  return docSnap.exists() ? docSnap.data().completedModules || [] : [];
};

/**
 * Retorna uma lista de IDs de módulos concluídos para um curso e usuário específicos.
 * @param {string} userId - O ID do usuário.
 * @param {string} courseId - O ID do curso.
 * @returns {Promise<string[]>} - Array com os IDs dos módulos concluídos.
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