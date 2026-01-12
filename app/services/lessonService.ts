import { collection, doc, getDoc, getDocs } from "firebase/firestore";
import { ImageSourcePropType } from "react-native";
import { db } from "../firebaseConfig.js";
import { LessonCard, SequenceOption } from "../types/lesson";

// --- HELPERS ----------------

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

// --- TYPES -------------------

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
  lessons?: any; // Raw lessons from DB
  order?: number | string;
  stageCount?: number;
  topic?: string;
}

// --- NORMALIZATION ----------------

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
    return { id, label };
  });
};

// Takes a flat array of question-like objects and returns LessonCard[]
const normalizeLessonPayload = (
  questions: unknown,
  lessonType?: string,
): LessonCard[] => {
  if (!Array.isArray(questions)) {
    return [];
  }

  const mappedQuestions: any[] = questions.map((q: any) => {
    // Each question object from the DB needs a `type`.
    // If it doesn't have one, we use the parent lesson's type.
    // We also convert the DB's "quiz" type to our internal "mcq" type.
    let cardType = q.type;
    if (!cardType) {
      cardType = lessonType === "quiz" ? "mcq" : lessonType;
    }
    
    if (cardType === "quiz") {
      cardType = "mcq";
    }

    // Fallback: Tenta inferir o tipo se ainda estiver indefinido
    if (!cardType) {
      if (Array.isArray(q.options) && (q.question || q.pergunta)) {
        cardType = "mcq";
      } else if (q.title && q.text) {
        cardType = "info";
      }
    }

    return {
      ...q,
      type: cardType,
      correctFeedback: q.FeedbackCorreto || q.correctFeedback || q.feedbackCorreto,
      incorrectFeedback: q.FeedbackIncorreto || q.incorrectFeedback || q.feedbackIncorreto,
      question: q.question || q.pergunta,
    };
  });

  return mappedQuestions
    .filter(
      (card): card is LessonCard =>
        !!card &&
        typeof card === "object" &&
        (card as LessonCard).type !== undefined,
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
        return { ...card, orderOptions, correctOrder };
      }
      return {
        ...card,
        options: Array.isArray(card.options) ? card.options : undefined,
      };
    });
};

// --- DATA FETCHING -----------------

const resolveCourseCollection = (courseId: string) =>
  courseCollectionMap[courseId] ?? courseId;

const resolveIconSource = (
  iconValue: unknown,
  courseId?: string,
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
    console.error("Failed to load courses:", error);
    return [];
  }
};

export const fetchCourseModules = async (
  courseId: string,
): Promise<RemoteModule[]> => {
  const collectionName = resolveCourseCollection(courseId);
  try {
    const modulesSnapshot = await getDocs(collection(db, collectionName));
    const modules = modulesSnapshot.docs.map((docSnap) => {
      const data = docSnap.data() || {};
      const baseColor = courseColorMap[collectionName] ?? "#5D9CFB";

      let lessons = data.lessons || data.questions;
      // Garante que lessons seja um array (caso venha como objeto do Firestore)
      if (lessons && !Array.isArray(lessons) && typeof lessons === "object") {
        lessons = Object.values(lessons);
      }

      let stageCount = typeof data.stageCount === "number" ? data.stageCount : 1;
      
      // Se for estrutura de volumes (array onde o primeiro item tem 'questions')
      if (Array.isArray(lessons) && lessons.length > 0 && lessons[0]?.questions) {
        stageCount = lessons.length;
      }

      const topic = pickFirstString(
        data.topic,
        data.topico,
        data["tópico"],
        data.section,
        data.sectionTitle,
        data.group,
        data.groupTitle,
        data.unit,
        data.unitTitle,
      );

      return {
        id: docSnap.id,
        title: data.title || docSnap.id,
        color: baseColor,
        icon: data.icon,
        order: data.order ?? docSnap.id,
        stageCount,
        topic,
      };
    });

    const sortedModules = modules.sort((a, b) => {
      const orderA = a.order ?? a.id;
      const orderB = b.order ?? b.id;
      if (typeof orderA === "string" && typeof orderB === "string") {
        return orderA.localeCompare(orderB, undefined, { numeric: true });
      }
      if (typeof orderA === "number" && typeof orderB === "number") {
        return orderA - orderB;
      }
      return String(orderA).localeCompare(String(orderB), undefined, {
        numeric: true,
      });
    });

    // Adiciona a opção de reiniciar curso ao final da lista
    sortedModules.push({
      id: "reset-course-action",
      title: "Reiniciar Curso",
      color: "#64748b", // Cinza para diferenciar dos módulos normais
      icon: "refresh",
      order: 99999,
      stageCount: 0,
      topic: "Gerenciar",
    });

    return sortedModules;
  } catch (error) {
    console.error(`Error fetching modules for course ${courseId}:`, error);
    return []; // Return empty array on error
  }
};

export const fetchModuleLessons = async (
  courseId: string,
  moduleId: string,
  stageIndex: number | string = 0,
): Promise<LessonCard[]> => {
  let collectionName = resolveCourseCollection(courseId);
  try {
    let moduleRef = doc(db, collectionName, moduleId);
    let snapshot = await getDoc(moduleRef);

    // Fallback: Se não encontrar na coleção mapeada, tenta na coleção com o ID do curso original
    if (!snapshot.exists() && collectionName !== courseId) {
      collectionName = courseId;
      moduleRef = doc(db, collectionName, moduleId);
      snapshot = await getDoc(moduleRef);
    }

    if (snapshot.exists()) {
      const data = snapshot.data();
      console.log(`[FastAid] Módulo carregado: ${moduleId}`, data); // Log para debug

      // Garante leitura de 'lessons' ou 'questions' (caso a estrutura esteja plana na raiz)
      let lessons = data.lessons || data.questions;

      // Converte objeto para array se necessário (correção para importações do Firestore)
      if (lessons && !Array.isArray(lessons) && typeof lessons === "object") {
        lessons = Object.values(lessons);
      }

      if (!Array.isArray(lessons)) {
        console.warn(`[FastAid] 'lessons' não é um array no módulo ${moduleId}`);
        return [];
      }

      // Verifica se é estrutura de volumes (baseado no primeiro item)
      const isVolumeStructure = lessons.length > 0 && Array.isArray(lessons[0]?.questions);

      if (isVolumeStructure) {
        // Ordena volumes para garantir sequência (volume1, volume2...) caso venha desordenado
        lessons.sort((a: any, b: any) => {
          const valA = a.order ?? a.id ?? "";
          const valB = b.order ?? b.id ?? "";
          if (typeof valA === "number" && typeof valB === "number") return valA - valB;
          return String(valA).localeCompare(String(valB), undefined, { numeric: true });
        });
      }

      let idx = 0;
      if (typeof stageIndex === "number") {
        idx = stageIndex;
      } else if (typeof stageIndex === "string") {
        if (!isNaN(Number(stageIndex))) {
          idx = Number(stageIndex);
        } else {
          // Tenta encontrar pelo ID (ex: "volume2")
          const found = lessons.findIndex((l: any) => l.id === stageIndex);
          if (found !== -1) idx = found;
        }
      }

      console.log(`[FastAid] Carregando estágio índice: ${idx} (Original: ${stageIndex})`);

      if (isVolumeStructure) {
        // Proteção: Se o índice for maior que a quantidade de volumes, volta para o primeiro (0)
        // Garante que ao "refazer" (índice >= total), o usuário comece do primeiro volume.
        if (idx < 0 || idx >= lessons.length) {
          console.log(`[FastAid] Índice ${idx} excede total de volumes. Reiniciando do Volume 1 (Refazer).`);
          idx = 0;
        }

        if (idx >= 0 && idx < lessons.length) {
          const targetStage = lessons[idx];
          if (targetStage && Array.isArray(targetStage.questions)) {
            const cards = normalizeLessonPayload(targetStage.questions, targetStage.type);
            // Adiciona tela de introdução com o título do volume
            if (targetStage.title) {
              const introCard: any = {
                id: `intro-${targetStage.id || idx}`,
                type: "info",
                title: targetStage.title,
                text: "Prepare-se para começar este volume.",
              };
              return [introCard, ...cards];
            }
            return cards;
          }
        }
      }

      // 3. Fallback: Estrutura Plana (array direto de perguntas)
      console.log(`[FastAid] Assumindo estrutura plana de perguntas.`);
      return normalizeLessonPayload(lessons, data.type);
    }

    console.warn(
      `Module '${moduleId}' not found in course '${collectionName}' (or '${courseId}').`,
    );
    return []; // Nothing found
  } catch (error) {
    console.error(`Error fetching lessons for module ${moduleId}:`, error);
    return []; // Return empty array on error
  }
};
