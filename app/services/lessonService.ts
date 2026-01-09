import { collection, doc, getDoc, getDocs } from "firebase/firestore";
import { ImageSourcePropType } from "react-native";
import { offlineCourseModules } from "../data/offlineModules";
import { db } from "../firebaseConfig.js";
import { LessonCard, SequenceOption } from "../types/lesson";

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

const courseColorMap: Record<string, string> = {
  engasgo: "#16a34a",
  choking: "#16a34a",
  primeirosSocorros: "#dc2626",
  firstAid: "#dc2626",
  queimaduras: "#f97316",
  burns: "#f97316",
  convulsao: "#2563eb",
  seizures: "#2563eb",
};

const pickFirstString = (...values: unknown[]): string | undefined => {
  for (const value of values) {
    if (typeof value === "string") {
      const trimmed = value.trim();
      if (trimmed) return trimmed;
    }
  }
  return undefined;
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

const rcpImageMap: Record<number, ImageSourcePropType> = {
  1: require("../../assets/RCP/1.png"),
  2: require("../../assets/RCP/2.png"),
  3: require("../../assets/RCP/3.png"),
  4: require("../../assets/RCP/4.png"),
  5: require("../../assets/RCP/5.png"),
  6: require("../../assets/RCP/6.png"),
  7: require("../../assets/RCP/7.png"),
  8: require("../../assets/RCP/8.png"),
  9: require("../../assets/RCP/9.png"),
  10: require("../../assets/RCP/10.png"),
  11: require("../../assets/RCP/11.png"),
  12: require("../../assets/RCP/12.png"),
  13: require("../../assets/RCP/13.png"),
  14: require("../../assets/RCP/14.png"),
  15: require("../../assets/RCP/15.png"),
  16: require("../../assets/RCP/16.png"),
  17: require("../../assets/RCP/17.png"),
  18: require("../../assets/RCP/18.png"),
  19: require("../../assets/RCP/19.png"),
  20: require("../../assets/RCP/20.png"),
  21: require("../../assets/RCP/21.png"),
};

const resolveSequenceImage = (
  value: unknown
): ImageSourcePropType | undefined => {
  if (!value) return undefined;
  if (typeof value === "number") {
    return value;
  }
  if (typeof value === "object" && value !== null && "uri" in value) {
    return value as ImageSourcePropType;
  }
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return undefined;
    if (/^https?:\/\//i.test(trimmed)) {
      return { uri: trimmed };
    }
    const rcpMatch =
      trimmed.match(/(?:^|[\\/])RCP[\\/](\d+)(?:\.\w+)?$/i) ??
      trimmed.match(/(?:^|[\\/])(\d+)(?:\.\w+)?$/i);
    if (rcpMatch) {
      const index = Number(rcpMatch[1]);
      return rcpImageMap[index];
    }
  }
  return undefined;
};

const normalizeSequenceOptions = (raw: any[] = []): SequenceOption[] => {
  return raw.map((opt, index) => {
    if (typeof opt === "string") {
      return { id: opt, label: opt };
    }
    const id =
      typeof opt?.id === "string"
        ? opt.id
        : typeof opt?.label === "string"
        ? opt.label
        : `seq-${index}`;
    const label =
      typeof opt?.label === "string"
        ? opt.label
        : typeof opt?.text === "string"
        ? opt.text
        : `Passo ${index + 1}`;
    return { id, label, image: resolveSequenceImage(opt?.image) };
  });
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
    .map((card: any) => {
      if (card.type === "sequence") {
        const optionsRaw = Array.isArray(card.orderOptions)
          ? card.orderOptions
          : Array.isArray(card.correctOrder)
          ? card.correctOrder
          : [];
        const orderOptions = normalizeSequenceOptions(optionsRaw);
        const correctRaw = Array.isArray(card.correctOrder)
          ? card.correctOrder
          : orderOptions.map((opt) => opt.id);
        const correctOrder = correctRaw.map((item: any, index: number) => {
          if (typeof item === "string") return item;
          return orderOptions[index]?.id ?? `seq-${index}`;
        });
        return {
          ...card,
          orderOptions,
          correctOrder,
        };
      }

      const safeOptions = Array.isArray(card.options) ? card.options : undefined;
      return {
        ...card,
        options: safeOptions,
      };
    });
};

const getOfflineModules = (collectionName: string): RemoteModule[] => {
  const offline = offlineCourseModules[collectionName] || [];
  return offline.map((module) => ({
    ...module,
    lessons: normalizeLessonPayload(module.lessons),
  }));
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
  stageCount?: number;
  topic?: string;
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
  const collectionName = resolveCourseCollection(courseId);
  try {
    const modulesSnapshot = await getDocs(collection(db, collectionName));
    const modules = modulesSnapshot.docs.map((docSnap) => {
      const data = docSnap.data() || {};
      const baseColor = courseColorMap[collectionName] ?? "#5D9CFB";
      const defaultStageCount =
        typeof data.stageCount === "number"
          ? data.stageCount
          : collectionName === "primeirosSocorros"
          ? 3
          : 1;
      const topic = pickFirstString(
        data.topic,
        data.topico,
        data["tópico"],
        data.section,
        data.sectionTitle,
        data.group,
        data.groupTitle,
        data.unit,
        data.unitTitle
      );
      return {
        id: docSnap.id,
        title: data.title || docSnap.id,
        color: baseColor,
        icon: data.icon,
        order: data.order ?? docSnap.id,
        lessons: normalizeLessonPayload(data.lessons),
        stageCount: defaultStageCount,
        topic,
      };
    });

    const offline = getOfflineModules(collectionName);
    const merged: RemoteModule[] = [...modules];

    offline.forEach((offlineModule) => {
      const existingIndex = merged.findIndex((m) => m.id === offlineModule.id);
      if (existingIndex === -1) {
        merged.push({
          ...offlineModule,
          stageCount:
            typeof offlineModule.stageCount === "number"
              ? offlineModule.stageCount
              : collectionName === "primeirosSocorros"
              ? 3
              : 1,
        });
        return;
      }
      const existing = merged[existingIndex];
      merged[existingIndex] = {
        ...offlineModule,
        ...existing,
        lessons: existing.lessons?.length ? existing.lessons : offlineModule.lessons,
        stageCount:
          typeof existing.stageCount === "number"
            ? existing.stageCount
            : typeof offlineModule.stageCount === "number"
            ? offlineModule.stageCount
            : collectionName === "primeirosSocorros"
            ? 3
            : 1,
      };
    });

    return merged.sort((a, b) => {
      const orderA = a.order ?? a.id;
      const orderB = b.order ?? b.id;
      return orderA > orderB ? 1 : orderA < orderB ? -1 : 0;
    });
  } catch (error) {
    console.warn(
      `Não foi possível carregar os módulos do curso ${courseId}:`,
      error
    );
    const offline = getOfflineModules(collectionName);
    return offline.sort((a, b) => {
      const orderA = a.order ?? a.id;
      const orderB = b.order ?? b.id;
      return orderA > orderB ? 1 : orderA < orderB ? -1 : 0;
    });
  }
};

export const fetchModuleLessons = async (
  courseId: string,
  moduleId: string
): Promise<LessonCard[]> => {
  const collectionName = resolveCourseCollection(courseId);
  try {
    const moduleRef = doc(db, collectionName, moduleId);
    const snapshot = await getDoc(moduleRef);
    if (!snapshot.exists()) {
      const offline = getOfflineModules(collectionName);
      const offlineModule = offline?.find((m) => m.id === moduleId);
      return offlineModule?.lessons ?? [];
    }
    const data = snapshot.data();
    const normalized = normalizeLessonPayload(data.lessons);
    if (normalized.length) return normalized;

    const offline = getOfflineModules(collectionName);
    const offlineModule = offline?.find((m) => m.id === moduleId);
    return offlineModule?.lessons ?? [];
  } catch (error) {
    console.warn(
      `Não foi possível buscar as lições do módulo ${moduleId}:`,
      error
    );
    const offline = getOfflineModules(collectionName);
    const offlineModule = offline?.find((m) => m.id === moduleId);
    return offlineModule?.lessons ?? [];
  }
};
