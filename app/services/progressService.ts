import AsyncStorage from "@react-native-async-storage/async-storage";

const PROGRESS_KEY = "appfastaid-course-progress";

type ProgressMap = Record<string, string[]>;

const readProgress = async (): Promise<ProgressMap> => {
  try {
    const stored = await AsyncStorage.getItem(PROGRESS_KEY);
    if (!stored) return {};
    return JSON.parse(stored);
  } catch (error) {
    console.warn("Não foi possível ler o progresso:", error);
    return {};
  }
};

const writeProgress = async (progress: ProgressMap) => {
  try {
    await AsyncStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
  } catch (error) {
    console.warn("Não foi possível salvar o progresso:", error);
  }
};

export const getCompletedModules = async (
  courseId: string
): Promise<string[]> => {
  const progress = await readProgress();
  return progress[courseId] ?? [];
};

export const markModuleCompleted = async (
  courseId: string,
  moduleId: string
) => {
  const progress = await readProgress();
  const completedSet = new Set(progress[courseId] ?? []);
  completedSet.add(moduleId);
  progress[courseId] = Array.from(completedSet);
  await writeProgress(progress);
};

