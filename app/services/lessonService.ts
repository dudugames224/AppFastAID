import AsyncStorage from "@react-native-async-storage/async-storage";
import { addDoc, collection, deleteDoc, doc, getDoc, getDocs, increment, setDoc } from "firebase/firestore";
import { ImageSourcePropType } from "react-native";
import { db } from "../firebaseConfig.js";
import { LessonCard, SequenceOption } from "../types/lesson";

// --- HELPERS ----------------

const courseCollectionMap: Record<string, string> = {
  burns: "queimaduras",
  queimaduras: "queimaduras",
  firstAid: "primeirosSocorros",
  primeirosSocorros: "primeirosSocorros",
  primeirossocorros: "primeirosSocorros",
  seizures: "convulsao",
  convulsao: "convulsao",
  convulsoes: "convulsao",
  choking: "engasgo",
  engasgo: "engasgo",
  reanimacao:"suporteBasico",
  rcp: "suporteBasico",
  suporteBasico:"suporteBasico",
  suportebasico:"suporteBasico",
  contusoes: "contusoes",
  contusions: "contusoes",
  lesoes: "lesoes",
}

const courseColorMap: Record<string, string> = {
  engasgo: "#16a34a",
  choking: "#16a34a",
  primeirosSocorros: "#dc2626",
  suporteBasico: "#dc2626",
  reanimacao: "#dc2626",
  SuporteBasico: "#dc2626",
  rcp: "#dc2626",
  firstAid: "#dc2626",
  queimaduras: "#f97316",
  burns: "#f97316",
  convulsao: "#2563eb",
  seizures: "#2563eb",
  lesoes: "#a10707",
  contusions: "#a10707",

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
  primeirosSocorros: require("../../assets/images/band.png"),
  firstAid: require("../../assets/images/kit.png"),
  engasgo: require("../../assets/images/engasgo.png"),
  choking: require("../../assets/images/engasgo.png"),
  reanimacao: require("../../assets/images/kit.png"),
  rcp: require("../../assets/images/kit.png"),
  suporteBasico:require("../../assets/images/kit.png"),
  contusoes: require("../../assets/images/lesoes.png"),
  lesoes: require("../../assets/images/lesoes.png"),
};

const burnsImages: Record<string, ImageSourcePropType> = {
  "pele_vermelha_sol.png": require("../../assets/queimaduras/icons/pele_vermelha_sol.png"),
  "agua_torneira.png": require("../../assets/queimaduras/icons/agua_torneira.png"),
  "resfriar_braco.png": require("../../assets/queimaduras/icons/resfriar_braco.png"),
  "bolha_braco.png": require("../../assets/queimaduras/icons/bolha_braco.png"),
  "proibido_estourar.png": require("../../assets/queimaduras/icons/proibido_estourar.png"),
  "curativo_gaze.png": require("../../assets/queimaduras/icons/curativo_gaze.png"),
  "nervos_destruidos.png": require("../../assets/queimaduras/icons/nervos_destruidos.png"),
  "tesoura_cortando_roupa.png": require("../../assets/queimaduras/icons/tesoura_cortando_roupa.png"),
  "pele_carbonizada.png": require("../../assets/queimaduras/icons/pele_carbonizada.png"),
  "liquidos_quentes.png": require("../../assets/queimaduras/icons/liquidos_quentes.png"),
  "lavagem_olho_direcao.png": require("../../assets/queimaduras/icons/lavagem_olho_direcao.png"),
  "lavar_olhos.png": require("../../assets/queimaduras/icons/lavar_olhos.png"),
  "acido_pele.png": require("../../assets/queimaduras/icons/acido_pele.png"),
  "relogio_20min.png": require("../../assets/queimaduras/icons/relogio_20min.png"),
  "lavagem_quimica.png": require("../../assets/queimaduras/icons/lavagem_quimica.png"),
  "iceberg_lesao.png": require("../../assets/queimaduras/icons/iceberg_lesao.png"),
  "disjuntor_off.png": require("../../assets/queimaduras/icons/disjuntor_off.png"),
  "seguranca_eletrica.png": require("../../assets/queimaduras/icons/seguranca_eletrica.png"),
  "revisao_eletrica.png": require("../../assets/queimaduras/icons/revisao_eletrica.png"),
  "hipotermia_risco.png": require("../../assets/queimaduras/icons/hipotermia_risco.png"),
  "triagem_vitimas.png": require("../../assets/queimaduras/icons/triagem_vitimas.png"),
  "itens_proibidos.png": require("../../assets/queimaduras/icons/itens_proibidos.png"),
  "queimadura_face.png": require("../../assets/queimaduras/icons/queimadura_face.png"),
};

const rcpImages: Record<string, ImageSourcePropType> = {
  "seguranca_cena.png": require("../../assets/rcp/icons/seguranca_cena.png"),
  "checar_consciencia.png": require("../../assets/rcp/icons/checar_consciencia.png"),
  "ligar_192.png": require("../../assets/rcp/icons/ligar.png"),
  "ligar.png": require("../../assets/rcp/icons/ligar.png"),
  "afastar_curiosos.png": require("../../assets/rcp/icons/afastar_curiosos.png"),
  "inicio_rcp.png": require("../../assets/rcp/icons/inicio_rcp.png"),
  "posicao_maos_centro.png": require("../../assets/rcp/icons/posicao_maos_centro.png"),
  "superficie_plana.png": require("../../assets/rcp/icons/superficie_plana.png"),
  "bracos_esticados.png": require("../../assets/rcp/icons/bracos_esticados.png"),
  "retorno_torax.png": require("../../assets/rcp/icons/retorno_torax.png"),
  "stayin_alive.png": require("../../assets/rcp/icons/stayin_alive.png"),
  "DEA.png": require("../../assets/rcp/icons/dea.png"),
};

const lesoesImages: Record<string, ImageSourcePropType> = {
  "contusao_pele_intacta.png": require("../../assets/lesoes/icon/contusao_pele_intacta.png"),
  "alunos_correndo_quadra.png": require("../../assets/lesoes/icon/alunos_correndo_quadra.png"),
  "perna_com_roxo.png": require("../../assets/lesoes/icon/perna_com_roxo.png"),
  "aplicando_gelo_local.png": require("../../assets/lesoes/icon/aplicando_gelo_local.png"),
  "relogio_24_48h.png": require("../../assets/lesoes/icon/relogio_24_48h.png"),
  "caso_felipe_queda_escada.png": require("../../assets/lesoes/icon/caso_felipe_queda_escada.png"),
  "compressao_pano_limpo.png": require("../../assets/lesoes/icon/compressao_pano_limpo.png"),
  "algodao_fiapos_proibido.png": require("../../assets/lesoes/icon/algodao_fiapos_proibido.png"),
  "lavando_agua_sabao.png": require("../../assets/lesoes/icon/lavando_agua_sabao.png"),
  "curativo_protecao_ferida.png": require("../../assets/lesoes/icon/curativo_protecao_ferida.png"),
  "caso_ana_corte_tesoura.png": require("../../assets/lesoes/icon/caso_ana_corte_tesoura.png"),
  "corte_profundo_aberto.png": require("../../assets/lesoes/icon/corte_profundo_aberto.png"),
  "corpo_humano_areas_criticas.png": require("../../assets/lesoes/icon/corpo_humano_areas_criticas.png"),
  "relogio_rapido_horas.png": require("../../assets/lesoes/icon/relogio_rapido_horas.png"),
  "caso_joao_joelho_corte.png": require("../../assets/lesoes/icon/caso_joao_joelho_corte.png"),
  "causas_sangramento_nasal.png": require("../../assets/lesoes/icon/causas_sangramento_nasal.png"),
  "posicao_sentado_inclinado_frente.png": require("../../assets/lesoes/icon/posicao_sentado_inclinado_frente.png"),
  "pinca_nariz_parte_mole.png": require("../../assets/lesoes/icon/pinca_nariz_parte_mole.png"),
  "proibido_papel_nariz.png": require("../../assets/lesoes/icon/proibido_papel_nariz.png"),
  "caso_maria_sangramento_nasal.png": require("../../assets/lesoes/icon/caso_maria_sangramento_nasal.png"),
  "aluno_ajudando_calmo.png": require("../../assets/lesoes/icon/aluno_ajudando_calmo.png"),
  "proibido_soprar_ferida.png": require("../../assets/lesoes/icon/proibido_soprar_ferida.png"),
  "compressao_universal.png": require("../../assets/lesoes/icon/compressao_universal.png"),
};

const allLessonImages = { ...burnsImages, ...rcpImages, ...lesoesImages };

// --- TYPES -------------------

export interface RemoteCourseMeta {
  id: string;
  title: string;
  color: string;
  iconSource: ImageSourcePropType;
  isVisible?: boolean;
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

const resolveLessonImage = (imageName: unknown): ImageSourcePropType | undefined => {
  if (typeof imageName === "number") return imageName; // Already resolved require()
  if (typeof imageName === "string") {
    const key = imageName.trim();
    if (allLessonImages[key]) return allLessonImages[key];
  }
  // It might be an object from a require call in some environments
  if (typeof imageName === "object" && imageName !== null) {
    return imageName as ImageSourcePropType;
  }
  return undefined;
};

const isMissingPermissionError = (error: unknown): boolean => {
  const err = error as { code?: unknown; message?: unknown } | null;
  const code = typeof err?.code === "string" ? err.code.toLowerCase() : "";
  const message = typeof err?.message === "string" ? err.message.toLowerCase() : "";
  return code === "permission-denied" || message.includes("missing or insufficient permissions");
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
    const image = resolveLessonImage(opt.image);
    return { id, label, image };
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
      image: resolveLessonImage(q.image),
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

export const fetchCoursesMeta = async (includeHidden: boolean = false): Promise<RemoteCourseMeta[]> => {
  try {
    const snapshot = await getDocs(collection(db, "DadosCurso"));
    const courses = snapshot.docs.map((docSnap) => {
      const data = docSnap.data() || {};
      return {
        id: docSnap.id,
        title: (data.title || docSnap.id).toUpperCase(),
        color: data.color || courseColorMap[docSnap.id] || "#5D9CFB",
        iconSource: resolveIconSource(data.icon, docSnap.id),
        isVisible: data.isVisible !== false,
      };
    });

    // Fallback: Garante que suporteBasico exista na lista com a aparência correta
    // Isso resolve o problema visual mesmo se o documento faltar no banco ou der erro de permissão
    if (!courses.find(c => c.id === 'suporteBasico')) {
      courses.push({
        id: 'suporteBasico',
        title: 'SUPORTE BÁSICO',
        color: courseColorMap['suporteBasico'],
        iconSource: iconMap['suporteBasico'],
        isVisible: true,
      });
    }

    if (includeHidden) {
      return courses;
    }

    return courses.filter(c => c.isVisible !== false);
  } catch (error) {
    console.error("Failed to load courses:", error);
    // Retorna cursos padrão em caso de erro fatal (ex: permissão negada globalmente)
    return [
      { id: 'suporteBasico', title: 'SUPORTE BÁSICO', color: '#dc2626', iconSource: require("../../assets/images/kit.png"), isVisible: true },
      { id: 'primeirosSocorros', title: 'PRIMEIROS SOCORROS', color: '#dc2626', iconSource: require("../../assets/images/kit.png"), isVisible: true }
    ];
  }
};

export interface AppSettings {
  isStoreEnabled: boolean;
  globalInfiniteLives: boolean;
  isPremiumModeEnabled: boolean;
}

export const fetchAppSettings = async (): Promise<AppSettings> => {
  const defaults: AppSettings = {
    isStoreEnabled: true,
    globalInfiniteLives: false,
    isPremiumModeEnabled: true,
  };
  try {
    const docRef = doc(db, "AppSettings", "global");
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return {
        ...defaults,
        ...(docSnap.data() as Partial<AppSettings>),
      };
    }
    return defaults;
  } catch (error) {
    console.error("Error fetching app settings:", error);
    return defaults;
  }
};

export const updateAppSetting = async (key: keyof AppSettings, value: boolean) => {
  try {
    const docRef = doc(db, "AppSettings", "global");
    await setDoc(docRef, { [key]: value }, { merge: true });
    return true;
  } catch (error) {
    console.error("Error updating app setting:", error);
    return false;
  }
};

export const toggleCourseVisibility = async (courseId: string, isVisible: boolean) => {
  try {
    const courseRef = doc(db, "DadosCurso", courseId);
    await setDoc(courseRef, { isVisible }, { merge: true });
    return true;
  } catch (error) {
    console.error("Error toggling course visibility:", error);
    return false;
  }
};

export const fetchCourseModules = async (
  courseId: string,
): Promise<RemoteModule[]> => {
  const normalizedCourseId = courseId.toLowerCase();
  const collectionName = resolveCourseCollection(normalizedCourseId);
  try {
    const modulesSnapshot = await getDocs(collection(db, collectionName));
    const modules = modulesSnapshot.docs.map((docSnap) => {
      const data = docSnap.data() || {};
      const baseColor = courseColorMap[normalizedCourseId] ?? "#5D9CFB";

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
        title: (data.title || docSnap.id).toUpperCase(),
        color: baseColor,
        icon: data.icon,
        order: data.order ?? docSnap.id,
        stageCount,
        topic: topic ? topic.toUpperCase() : undefined,
      };
    }).filter(m => {
      // Filtro Global: Remove "review-cards" se vier do banco para não duplicar com o hardcoded
      if (m.id === 'review-cards') return false;

      // Filtro Global: Remove "review" se vier do banco, para usar o botão padrão "REVISÃO"
      if (m.id === 'review') return false;

      // Para o curso de queimaduras, remove o módulo "burns-7" que vem do banco
      // para evitar que ele apareça duplicado junto com o módulo de "Revisão" padrão.
      // O módulo padrão "review-cards" será usado para acessar o conteúdo de "!revisão integrativa".
      if ((courseId === 'queimaduras' || courseId === 'burns') && m.id === 'burns-7') {
        return false;
      }

      // Filtro Genérico: Remove qualquer módulo que termine em "-review" (ex: rcp-review, contusoes-review)
      // Isso evita duplicidade com o botão "REVISÃO" que é adicionado manualmente.
      if (m.id.endsWith('-review')) return false;
      
      return true;
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

    // Adiciona o módulo de Introdução no início
    sortedModules.unshift({
      id: "course-intro",
      title: "INTRODUÇÃO",
      color: "#FFC107", // Amarelo/Gold para destaque
      icon: "star",
      order: -1,
      stageCount: 1,
      topic: "BOAS-VINDAS",
    });

    // Adiciona o módulo de Revisão (Cards) antes do reset
    sortedModules.push({
      id: "review-cards",
      title: "REVISÃO",
      color: "#8b5cf6", // Roxo para destaque
      icon: "book",
      order: 99998,
      stageCount: 1,
      topic: "EXTRA",
    });

    // Adiciona a opção de reiniciar curso ao final da lista
    sortedModules.push({
      id: "reset-course-action",
      title: "REINICIAR CURSO",
      color: "#64748b", // Cinza para diferenciar dos módulos normais
      icon: "refresh",
      order: 99999,
      stageCount: 0,
      topic: "GERENCIAR",
    });

    return sortedModules;
  } catch (error) {
    console.error(`Error fetching modules for course ${courseId}:`, error);
    
    return [];
  }
};

/**
 * Salva o resultado detalhado de um Pós-Teste (Avaliação).
 * Cria um registro na subcoleção 'assessments' do usuário.
 */
export const savePostTestResult = async (
  userId: string,
  courseId: string,
  resultData: {
    score: number;
    totalQuestions: number;
    correctCount: number;
    mistakes: number;
    details: { question: string; isCorrect: boolean }[];
    moduleId?: string;
  }
) => {
  try {
    // Salva em subcoleção específica do curso: users/{uid}/assessments/{courseId}/attempts/{id}
    // Isso cria uma "pasta" para cada curso automaticamente
    const attemptsRef = collection(db, "users", userId, "assessments", courseId, "attempts");
    await addDoc(attemptsRef, {
      ...resultData,
      completedAt: new Date().toISOString(),
    });
    console.log(`[FastAID] Pós-teste salvo para ${courseId}`);
  } catch (error) {
    console.error("Erro ao salvar pós-teste:", error);
  }
};

export const resetCourseProgress = async (userId: string, courseId: string) => {
  try {
    const userRef = doc(db, "users", userId);

    // 1. Bônus: 200 XP + 200 Safiras
    // Usamos setDoc com merge para garantir a atualização mesmo se campos faltarem
    await setDoc(userRef, {
      xp: increment(200),
      safiras: increment(200),
    }, { merge: true });

    // 2. Resetar progresso local da introdução (Cards)
    await AsyncStorage.removeItem(`fastaid:rcpIntroPart1:${userId}`);

    // 3. Resetar progresso dos módulos no Firestore (Tentativa em múltiplos locais)
    
    // Local A: Coleção raiz 'progress' (Compatível com a regra: match /progress/{progressId})
    try {
      const progressRootRef = doc(db, "progress", `${userId}_${courseId}`);
      await deleteDoc(progressRootRef);
    } catch (e) {
      console.log("Info: Não foi possível deletar de 'progress' (pode não existir):", e);
    }

    // Local B: Subcoleção 'course_progress' dentro de users
    try {
      const progressSubRef = doc(db, "users", userId, "course_progress", courseId);
      await deleteDoc(progressSubRef);
    } catch (e) {
      console.log("Info: Não foi possível deletar de 'users/.../course_progress' (provável falta de permissão delete):", e);
    }

    return true;
  } catch (error) {
    console.error("Error resetting course:", error);
    return false;
  }
};

export const fetchModuleLessons = async (
  courseId: string,
  moduleId: string,
  stageIndex: number | string = 0,
): Promise<LessonCard[]> => {
  if (!moduleId || typeof moduleId !== "string") {
    console.warn(`[FastAID] Módulo inválido para carregar lições: ${String(moduleId)}`);
    return [];
  }

  if (moduleId === "course-intro") {
    return [
      {
        type: "info",
        title: "Bem-vindo ao FastAID",
        text: "Prepare-se para dominar técnicas essenciais de primeiros socorros e salvar vidas.",
     
      },
      {
        type: "info",
        title: "Como funciona",
        text: "Complete lições rápidas, responda quizzes e mantenha sua ofensiva diária para ganhar XP.",
      },
      {
        type: "mcq",
        question: "Qual é o principal objetivo do App?",
        options: ["Apenas passar o tempo", "Aprender a salvar vidas", "Colecionar ícones"],
        answer: 1,
        correctFeedback: "Exato! O conhecimento prático salva vidas.",
        incorrectFeedback: "Nosso foco é estar preparado para emergências.",
      },
    ];
  }

  const normalizedCourseId = courseId.toLowerCase();

  // Remapeia o ID do módulo de revisão para o ID real do documento no Firestore.
  // Isso é necessário porque `fetchCourseModules` substitui 'burns-7' (do curso de queimaduras)
  // pelo ID genérico 'review-cards' para consistência na UI.
  let effectiveModuleId = moduleId;
  if (moduleId === 'review-cards' && (normalizedCourseId === 'queimaduras' || normalizedCourseId === 'burns')) {
    effectiveModuleId = 'burns-7';
  }

  let collectionName = resolveCourseCollection(normalizedCourseId);
  try {
    let moduleRef = doc(db, collectionName, effectiveModuleId);
    let snapshot = await getDoc(moduleRef);

    // Fallback Genérico: Se solicitou 'review-cards' mas não existe, tenta encontrar 'review' ou 'rcp-review'
    if (!snapshot.exists() && moduleId === 'review-cards') {
      // 1. Tenta 'review' (Padrão simples)
      let altRef = doc(db, collectionName, 'review');
      let altSnap = await getDoc(altRef);
      
      // 2. Tenta '[collectionName]-review' (ex: contusoes-review)
      if (!altSnap.exists()) {
        altRef = doc(db, collectionName, `${collectionName}-review`);
        altSnap = await getDoc(altRef);
      }

      // 3. Tenta '[courseId]-review' (ex: rcp-review, caso o ID do curso difira da coleção)
      if (!altSnap.exists() && normalizedCourseId !== collectionName) {
        altRef = doc(db, collectionName, `${normalizedCourseId}-review`);
        altSnap = await getDoc(altRef);
      }

      if (altSnap.exists()) {
        snapshot = altSnap;
        effectiveModuleId = altSnap.id;
      }
    }

    // Fallback: Se não encontrar na coleção mapeada, tenta na coleção com o ID do curso original
    if (!snapshot.exists() && collectionName !== normalizedCourseId) {
      collectionName = normalizedCourseId;
      moduleRef = doc(db, collectionName, effectiveModuleId);
      snapshot = await getDoc(moduleRef);
    }

    if (snapshot.exists()) {
      const data = snapshot.data();
      console.log(`[FastAID] Módulo carregado: ${effectiveModuleId} (solicitado: ${moduleId})`, data); // Log para debug

      // Garante leitura de 'lessons' ou 'questions' (caso a estrutura esteja plana na raiz)
      let lessons = data.lessons || data.questions;

      // Converte objeto para array se necessário (correção para importações do Firestore)
      if (lessons && !Array.isArray(lessons) && typeof lessons === "object") {
        lessons = Object.values(lessons);
      }

      if (!Array.isArray(lessons)) {
        console.warn(`[FastAID] 'lessons' não é um array no módulo ${effectiveModuleId}`);
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

      console.log(`[FastAID] Carregando estágio índice: ${idx} (Original: ${stageIndex})`);

        // Proteção: Se o índice for maior que a quantidade de volumes, volta para o primeiro (0)
        // Garante que ao "refazer" (índice >= total), o usuário comece do primeiro volume.
        if (idx < 0 || idx >= lessons.length) {
        console.log(`[FastAID] Índice ${idx} excede total de volumes. Reiniciando do Volume 1 (Refazer).`);
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
      console.log(`[FastAID] Assumindo estrutura plana de perguntas.`);
      return normalizeLessonPayload(lessons, data.type);
    }

    console.warn(
      `Module '${effectiveModuleId}' not found in course '${collectionName}' (or '${courseId}').`,
    );
    return []; // Nothing found
  } catch (error) {
    if (isMissingPermissionError(error)) {
      console.log(
        `[FastAID] Sem permissao para modulo ${moduleId} (effective: ${effectiveModuleId}).`
      );
    } else {
      console.warn(
        `Error fetching lessons for module ${moduleId} (effective: ${effectiveModuleId}):`,
        error
      );
    }
    
    return [];
  }
};
