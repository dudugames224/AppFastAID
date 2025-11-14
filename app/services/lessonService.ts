import { collection, doc, getDoc, getDocs } from "firebase/firestore";
import { ImageSourcePropType } from "react-native";
import { db } from "../firebaseConfig.js";
import { LessonCard } from "../types/lesson";

const courseCollectionMap: Record<string, string> = {
  burns: "queimaduras",
  queimaduras: "queimaduras",
  firstAid: "primeirosSocorros",
  primeirosSocorros: "primeirosSocorros",
  seizures: "convulsao",
  convulsao: "convulsao",
  convulsoes: "convulsao",
  choking: "engasgo",
  engasgo: "engasgo",
};

const iconMap: Record<string, ImageSourcePropType> = {
  queimaduras: require("../../assets/images/queimadura.png"),
  burns: require("../../assets/images/queimadura.png"),
  convulsao: require("../../assets/images/convulsao.png"),
  seizures: require("../../assets/images/convulsao.png"),
  primeirosSocorros: require("../../assets/images/kit.png"),
  firstAid: require("../../assets/images/kit.png"),
  engasgo: require("../../assets/images/engasgo.png"),
  choking: require("../../assets/images/engasgo.png"),
};

const normalizeLessonPayload = (payload: unknown): LessonCard[] => {
  if (!Array.isArray(payload)) {
    return [];
  }

  return payload
    .flatMap((entry) => (Array.isArray(entry) ? entry : [entry]))
    .filter(
      (card): card is LessonCard =>
        !!card &&
        typeof card === "object" &&
        (card as LessonCard).type !== undefined
    )
    .map((card) => {
      const safeOptions = Array.isArray(card.options) ? card.options : undefined;
      return { ...card, options: safeOptions };
    });
};

const resolveCourseCollection = (courseId: string) =>
  courseCollectionMap[courseId] ?? courseId;

const resolveIconSource = (
  iconValue: unknown,
  courseId?: string
): ImageSourcePropType => {
  if (typeof iconValue === "number") {
    return iconValue;
  }
  if (typeof iconValue === "string") {
    const normalized = iconValue
      .split("/")
      .pop()
      ?.replace(/\.(png|jpg|jpeg|svg)$/i, "");
    if (normalized && iconMap[normalized]) {
      return iconMap[normalized];
    }
    if (iconMap[iconValue]) {
      return iconMap[iconValue];
    }
  }
  if (courseId && iconMap[courseId]) {
    return iconMap[courseId];
  }
  return require("../../assets/images/band.png");
};

export interface RemoteCourseMeta {
  id: string;
  title: string;
  color: string;
  iconSource: ImageSourcePropType;
}

export interface RemoteModule {
  id: string;
  title: string;
  color?: string;
  icon?: string;
  lessons?: LessonCard[];
  order?: number;
}

export const fetchCoursesMeta = async (): Promise<RemoteCourseMeta[]> => {
  try {
    const snapshot = await getDocs(collection(db, "DadosCurso"));
    return snapshot.docs.map((docSnap) => {
      const data = docSnap.data() || {};
      return {
        id: docSnap.id,
        title: data.title || docSnap.id,
        color: data.color || "#5D9CFB",
        iconSource: resolveIconSource(data.icon, docSnap.id),
      };
    });
  } catch (error) {
    console.warn("Não foi possível carregar os cursos:", error);
    return [];
  }
};

export const fetchCourseModules = async (
  courseId: string
): Promise<RemoteModule[]> => {
  try {
    const collectionName = resolveCourseCollection(courseId);
    const modulesSnapshot = await getDocs(collection(db, collectionName));
    const modules = modulesSnapshot.docs.map((docSnap) => {
      const data = docSnap.data() || {};
      return {
        id: docSnap.id,
        title: data.title || docSnap.id,
        color: data.color,
        icon: data.icon,
        order: data.order ?? docSnap.id,
        lessons: normalizeLessonPayload(data.lessons),
      };
    });
    return modules.sort((a, b) => {
      const orderA = a.order ?? a.id;
      const orderB = b.order ?? b.id;
      return orderA > orderB ? 1 : orderA < orderB ? -1 : 0;
    });
  } catch (error) {
    console.warn(
      `Não foi possível carregar os módulos do curso ${courseId}:`,
      error
    );
    return [];
  }
};

export const fetchModuleLessons = async (
  courseId: string,
  moduleId: string
): Promise<LessonCard[]> => {
  try {
    const collectionName = resolveCourseCollection(courseId);
    const moduleRef = doc(db, collectionName, moduleId);
    const snapshot = await getDoc(moduleRef);
    if (!snapshot.exists()) {
      return [];
    }
    const data = snapshot.data();
    return normalizeLessonPayload(data.lessons);
  } catch (error) {
    console.warn(
      `Não foi possível buscar as lições do módulo ${moduleId}:`,
      error
    );
    return [];
  }
};
