import { collection, collectionGroup, getDocs, orderBy, query, where, writeBatch } from "firebase/firestore";
import { db } from "../firebaseConfig";

// --- TIPAGEM DOS DADOS ---

export interface AssessmentAttempt {
  id: string;
  score: number;
  totalQuestions: number;
  correctCount: number;
  mistakes: number;
  completedAt: string;
  details?: Array<{ question: string; isCorrect: boolean }>;
  moduleId?: string;
}

export interface DailyReport {
  date: string;
  summary: {
    totalAttempts: number;
    averageScore: number;
    totalCorrect: number;
  };
  byCourse: Record<string, AssessmentAttempt[]>;
}

export interface QuestionStat {
  questionText: string;
  attempt1: { correct: number; total: number };
  attempt2: { correct: number; total: number };
}

export interface Demographics {
  sex: Record<string, number>;
  age: Record<string, number>;
  class: Record<string, number>;
  totalStudents: number;
}

export interface CoursePerformance {
  courseId: string;
  attempt1: { totalScore: number; count: number; studentCount: number; average: number };
  attempt2: { totalScore: number; count: number; studentCount: number; average: number };
  questions: QuestionStat[];
  demographics: Demographics;
}

export interface GlobalReport {
  courses: CoursePerformance[];
  globalStats: {
    uniqueStudents1: number;
    uniqueStudents2: number;
  };
}

export interface LeaderboardEntry {
  id: string;
  name: string;
  xp: number;
  avatar: string;
}

// --- LÓGICA DE EXTRAÇÃO ---

/**
 * Gera um relatório consolidado de todas as avaliações realizadas no dia atual.
 * @param userId O ID do usuário autenticado.
 */
export const fetchDailyAssessmentReport = async (userId: string): Promise<DailyReport> => {
  // 1. Definir o início do dia (00:00:00) para filtrar apenas dados de hoje
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayIso = today.toISOString();

  // Lista de IDs dos cursos onde os dados podem estar salvos
  const courseIds = ["queimaduras", "engasgo", "convulsao", "primeirosSocorros", "suporteBasico"];
  
  // Estrutura inicial do relatório zerada
  const report: DailyReport = {
    date: todayIso,
    summary: { totalAttempts: 0, averageScore: 0, totalCorrect: 0 },
    byCourse: {},
  };

  let sumScores = 0;

  // 2. Buscar dados em paralelo para cada curso
  await Promise.all(
    courseIds.map(async (courseId) => {
      try {
        // Caminho: users/{uid}/assessments/{courseId}/attempts
        const attemptsRef = collection(db, "users", userId, "assessments", courseId, "attempts");
        
        // Query: Data >= Hoje, Ordenado por Data Decrescente (mais recente primeiro)
        const q = query(attemptsRef, where("completedAt", ">=", todayIso), orderBy("completedAt", "desc"));
        const snapshot = await getDocs(q);

        if (!snapshot.empty) {
          // Mapeia os documentos do Firestore para o nosso formato AssessmentAttempt
          const attempts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AssessmentAttempt));
          
          // Salva no relatório agrupado por curso
          report.byCourse[courseId] = attempts;
          
          // 3. Atualiza o sumário geral
          report.summary.totalAttempts += attempts.length;
          report.summary.totalCorrect += attempts.reduce((acc, curr) => acc + (curr.correctCount || 0), 0);
          sumScores += attempts.reduce((acc, curr) => acc + (curr.score || 0), 0);
        }
      } catch (error) {
        console.log(`[ReportingService] Sem dados ou erro de permissão em ${courseId}:`, error);
      }
    })
  );

  // 4. Calcular média final
  if (report.summary.totalAttempts > 0) {
    report.summary.averageScore = Math.round(sumScores / report.summary.totalAttempts);
  }

  return report;
};

/**
 * Gera um relatório geral de desempenho da turma, comparando a 1ª tentativa com a 2ª tentativa (pós-teste).
 * Varre todas as tentativas de todos os usuários.
 */
export const fetchClassPerformanceReport = async (classFilter?: string | null): Promise<GlobalReport> => {
  // Busca TODAS as tentativas de TODOS os usuários em TODOS os cursos
  // Nota: collectionGroup não requer ID do usuário ou curso, ele pega tudo que está numa coleção chamada 'attempts'
  const attemptsQuery = query(collectionGroup(db, 'attempts'));
  const snapshot = await getDocs(attemptsQuery);

  // Busca dados de todos os usuários para demografia
  const usersSnapshot = await getDocs(collection(db, "users"));
  const userProfileMap = new Map<string, any>();
  usersSnapshot.forEach(doc => userProfileMap.set(doc.id, doc.data()));

  // Estrutura para agrupar: CourseId -> UserId -> Lista de Tentativas
  const dataMap = new Map<string, Map<string, AssessmentAttempt[]>>();

  snapshot.forEach(docSnap => {
    const data = docSnap.data() as AssessmentAttempt;
    
    // O caminho do documento é: users/{uid}/assessments/{courseId}/attempts/{docId}
    // Podemos extrair o ID do curso e do usuário pelo caminho (path)
    const pathSegments = docSnap.ref.path.split('/');
    
    if (pathSegments.length === 6) {
      const userId = pathSegments[1];
      const courseId = pathSegments[3];
      
      if (!dataMap.has(courseId)) {
        dataMap.set(courseId, new Map());
      }
      const userMap = dataMap.get(courseId)!;
      
      if (!userMap.has(userId)) {
        userMap.set(userId, []);
      }
      // Adiciona a tentativa na lista do usuário
      userMap.get(userId)!.push({ id: docSnap.id, ...data });
    }
  });

  const results: CoursePerformance[] = [];
  const globalUniqueUsers1 = new Set<string>();
  const globalUniqueUsers2 = new Set<string>();

  // Processa os dados agrupados
  dataMap.forEach((userMap, courseId) => {
    
    // Mapa para agregar estatísticas por pergunta
    const questionStats = new Map<string, { 
      text: string; 
      a1Correct: number; 
      a1Total: number; 
      a2Correct: number; 
      a2Total: number; 
    }>();

    // Estatísticas Demográficas
    const demoStats: Demographics = { sex: {}, age: {}, class: {}, totalStudents: 0 };
    const uniqueUsers = new Set<string>();

    userMap.forEach((_, userId) => {
      uniqueUsers.add(userId);
      const profile = userProfileMap.get(userId);
      
      // Filtro de Turma (Demografia)
      const userClass = profile?.turma ? String(profile.turma).toUpperCase() : "N/I";
      if (classFilter && userClass !== classFilter) return;

      if (profile) {
        const s = profile.sexo ? String(profile.sexo).toUpperCase() : "N/I";
        const a = profile.idade ? String(profile.idade) : "N/I";
        const t = profile.turma ? String(profile.turma).toUpperCase() : "N/I";

        demoStats.sex[s] = (demoStats.sex[s] || 0) + 1;
        demoStats.age[a] = (demoStats.age[a] || 0) + 1;
        demoStats.class[t] = (demoStats.class[t] || 0) + 1;
      }
    });
    demoStats.totalStudents = uniqueUsers.size;

    // Variáveis para média global do curso
    let globalSum1 = 0;
    let globalCount1 = 0;
    let globalSum2 = 0;
    let globalCount2 = 0;
    let studentCount1 = 0;
    let studentCount2 = 0;

    userMap.forEach((attempts, userId) => {
      // Filtro de Turma (Dados de Performance)
      const profile = userProfileMap.get(userId);
      const userClass = profile?.turma ? String(profile.turma).toUpperCase() : "N/I";
      if (classFilter && userClass !== classFilter) return;

      // Ordena as tentativas por data para garantir que sabemos qual foi a 1ª e a 2ª
      attempts.sort((a, b) => new Date(a.completedAt).getTime() - new Date(b.completedAt).getTime());
      
      // Histórico de perguntas deste usuário específico
      const userQuestionHistory = new Map<string, boolean[]>();
      let hasAttempt1 = false;
      let hasAttempt2 = false;

      attempts.forEach(att => {
        if (att.details && Array.isArray(att.details)) {
          att.details.forEach(d => {
            const qText = d.question.trim();
            if (!userQuestionHistory.has(qText)) {
              userQuestionHistory.set(qText, []);
            }
            userQuestionHistory.get(qText)!.push(d.isCorrect);
          });
        }
      });

      // Agora agrega ao estatístico global do curso
      userQuestionHistory.forEach((history, qText) => {
        if (!questionStats.has(qText)) {
          questionStats.set(qText, { text: qText, a1Correct: 0, a1Total: 0, a2Correct: 0, a2Total: 0 });
        }
        const stat = questionStats.get(qText)!;

        // 1ª Tentativa (Sempre a primeira vez que viu a pergunta)
        const firstResult = history[0];
        stat.a1Total++;
        if (firstResult) stat.a1Correct++;
        globalSum1 += firstResult ? 100 : 0; // Simplificação para média: 100% se acertou, 0 se errou
        globalCount1++;
        hasAttempt1 = true;

        // 2ª Tentativa (A última vez que viu, SE viu mais de uma vez)
        if (history.length > 1) {
          const lastResult = history[history.length - 1];
          stat.a2Total++;
          if (lastResult) stat.a2Correct++;
          globalSum2 += lastResult ? 100 : 0;
          globalCount2++;
          hasAttempt2 = true;
        }
      });

      if (hasAttempt1) {
        studentCount1++;
        globalUniqueUsers1.add(userId);
      }
      if (hasAttempt2) {
        studentCount2++;
        globalUniqueUsers2.add(userId);
      }
    });

    results.push({
      courseId,
      attempt1: { totalScore: globalSum1, count: globalCount1, studentCount: studentCount1, average: globalCount1 > 0 ? Math.round(globalSum1 / globalCount1) : 0 },
      attempt2: { totalScore: globalSum2, count: globalCount2, studentCount: studentCount2, average: globalCount2 > 0 ? Math.round(globalSum2 / globalCount2) : 0 },
      questions: Array.from(questionStats.values()).map(stat => ({
        questionText: stat.text,
        attempt1: { correct: stat.a1Correct, total: stat.a1Total },
        attempt2: { correct: stat.a2Correct, total: stat.a2Total }
      })),
      demographics: demoStats
    });
  });

  return {
    courses: results,
    globalStats: {
      uniqueStudents1: globalUniqueUsers1.size,
      uniqueStudents2: globalUniqueUsers2.size
    }
  };
};

/**
 * SCRIPT DE LIMPEZA (ADMIN)
 * Apaga TODAS as tentativas de avaliação do banco de dados.
 */
export const wipeAllAssessmentData = async () => {
  console.log("Iniciando limpeza completa de avaliações...");
  try {
    const attemptsQuery = query(collectionGroup(db, 'attempts'));
    const snapshot = await getDocs(attemptsQuery);
    
    const BATCH_SIZE = 450;
    const chunks = [];
    for (let i = 0; i < snapshot.docs.length; i += BATCH_SIZE) {
      chunks.push(snapshot.docs.slice(i, i + BATCH_SIZE));
    }

    for (const chunk of chunks) {
      const batch = writeBatch(db);
      chunk.forEach((docSnap) => {
        batch.delete(docSnap.ref);
      });
      await batch.commit();
    }
    
    console.log(`Limpeza concluída. ${snapshot.size} registros apagados.`);
    return snapshot.size;
  } catch (error) {
    console.error("Erro ao limpar avaliações:", error);
    throw error;
  }
};

/**
 * Busca todos os usuários e retorna ordenado por XP (Ranking Global).
 */
export const fetchLeaderboard = async (classFilter?: string | null): Promise<LeaderboardEntry[]> => {
  const usersRef = collection(db, "users");
  const snapshot = await getDocs(usersRef);
  
  let users = snapshot.docs.map(doc => ({
    id: doc.id,
    name: doc.data().nome || "Sem Nome",
    xp: doc.data().xp || 0,
    avatar: doc.data().avatar || "👤",
    turma: doc.data().turma ? String(doc.data().turma).toUpperCase() : "N/I"
  }));

  if (classFilter) {
    users = users.filter(u => u.turma === classFilter);
  }

  return users.sort((a, b) => b.xp - a.xp);
};

/**
 * Reseta o XP de TODOS os usuários para 0.
 */
export const resetAllUsersXP = async () => {
  console.log("Iniciando reset de XP de todos os usuários...");
  try {
    const usersRef = collection(db, "users");
    const snapshot = await getDocs(usersRef);
    
    const BATCH_SIZE = 450; // Limite do Firestore é 500, usamos margem de segurança
    const chunks = [];
    for (let i = 0; i < snapshot.docs.length; i += BATCH_SIZE) {
      chunks.push(snapshot.docs.slice(i, i + BATCH_SIZE));
    }

    for (const chunk of chunks) {
      const batch = writeBatch(db);
      chunk.forEach((docSnap) => {
        // Usamos set com merge: true para ser mais robusto que update
        batch.set(docSnap.ref, { xp: 0, ofensiva: 0 }, { merge: true });
      });
      await batch.commit();
    }

    console.log(`XP resetado para ${snapshot.size} usuários.`);
    return snapshot.size;
  } catch (error) {
    console.error("Erro ao resetar XP:", error);
    throw error;
  }
};