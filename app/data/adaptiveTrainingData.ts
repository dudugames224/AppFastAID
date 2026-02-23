export type TrackId = "casa" | "transito" | "criancas" | "esporte" | "trabalho";

export type SkillId =
  | "airway"
  | "bleeding"
  | "seizure"
  | "abc"
  | "shock"
  | "decision";

export type AdaptiveEventType =
  | "daily-emergency"
  | "weekly-challenge"
  | "monthly-sim";

export type AdaptiveScenarioTemplate = {
  id: string;
  symptom: string;
  correctAction: string;
  wrongActions: string[];
  urgency: "alta" | "media";
  primarySkill: SkillId;
};

export type AdaptiveTrack = {
  id: TrackId;
  title: string;
  description: string;
  color: string;
  checkpoints: number[];
  focusSkills: SkillId[];
};

export const ADAPTIVE_EXCLUDED_COURSE_IDS = [
  "queimaduras",
  "burns",
  "lesoes",
  "contusoes",
  "contusions",
  "reanimacao",
  "rcp",
  "suportebasico",
  "suporte-basico",
  "suporteBasico",
];

export const ADAPTIVE_TRACKS: AdaptiveTrack[] = [
  {
    id: "casa",
    title: "Casa",
    description: "Emergencias domesticas e rotina familiar.",
    color: "#ef4444",
    checkpoints: [5, 12, 20],
    focusSkills: ["abc", "bleeding", "decision"],
  },
  {
    id: "transito",
    title: "Transito",
    description: "Cena externa, chamada rapida e priorizacao.",
    color: "#f59e0b",
    checkpoints: [5, 12, 20],
    focusSkills: ["abc", "shock", "decision"],
  },
  {
    id: "criancas",
    title: "Criancas",
    description: "Tomada de decisao para bebes e criancas.",
    color: "#22c55e",
    checkpoints: [5, 12, 20],
    focusSkills: ["airway", "seizure", "decision"],
  },
  {
    id: "esporte",
    title: "Esporte",
    description: "Lesoes em quadra, campo e academia.",
    color: "#14b8a6",
    checkpoints: [5, 12, 20],
    focusSkills: ["bleeding", "shock", "abc"],
  },
  {
    id: "trabalho",
    title: "Trabalho",
    description: "Acidentes de oficina, escritorio e atendimento publico.",
    color: "#3b82f6",
    checkpoints: [5, 12, 20],
    focusSkills: ["abc", "decision", "airway"],
  },
];

export const ADAPTIVE_SKILL_LABELS: Record<SkillId, string> = {
  airway: "Via aerea",
  bleeding: "Controle de sangramento",
  seizure: "Crise convulsiva",
  abc: "Triagem ABC",
  shock: "Choque",
  decision: "Decisao sob pressao",
};

export const ADAPTIVE_BADGE_THRESHOLDS = [60, 140, 260];

export const SCENARIO_AGES = [
  "crianca de 7 anos",
  "adolescente de 15 anos",
  "adulto de 28 anos",
  "idoso de 72 anos",
];

export const SCENARIO_LOCATIONS_BY_TRACK: Record<TrackId, string[]> = {
  casa: ["cozinha", "banheiro", "sala", "escada de casa"],
  transito: ["ponto de onibus", "cruzamento", "estacionamento", "rodovia"],
  criancas: ["escola", "creche", "parque", "festa infantil"],
  esporte: ["quadra", "academia", "campo", "pista de corrida"],
  trabalho: ["obra", "cozinha industrial", "escritorio", "estoque"],
};

export const SCENARIO_RESOURCES = [
  "luvas e gaze",
  "somente celular",
  "kit de primeiros socorros basico",
  "ajuda de um segundo socorrista",
];

export const SCENARIO_TIME_PRESSURE = [
  "voce tem 20 segundos para agir",
  "a ambulancia chega em 4 minutos",
  "a vitima piora em menos de 1 minuto",
  "muita gente em volta esta pressionando",
];

export const DEFAULT_SCENARIOS: AdaptiveScenarioTemplate[] = [
  {
    id: "abc-prioridade",
    symptom: "queda com respiracao irregular e pele fria",
    correctAction: "garantir seguranca da cena, checar ABC e acionar 192",
    wrongActions: [
      "levantar a vitima rapidamente para sentar",
      "oferecer agua para acalmar",
      "esperar melhorar antes de chamar ajuda",
    ],
    urgency: "alta",
    primarySkill: "abc",
  },
  {
    id: "sangramento-ativo",
    symptom: "corte com sangramento continuo no antebraco",
    correctAction: "compressao direta firme e elevacao do membro se possivel",
    wrongActions: [
      "lavar varias vezes antes de comprimir",
      "retirar coagulos com os dedos",
      "aplicar pomada antes de conter o sangue",
    ],
    urgency: "media",
    primarySkill: "bleeding",
  },
  {
    id: "engasgo-adulto",
    symptom: "nao consegue falar e leva as maos ao pescoco",
    correctAction: "alternar tapas interescapulares e compressao abdominal",
    wrongActions: [
      "dar agua para empurrar o alimento",
      "bater no peito enquanto a pessoa esta em pe",
      "colocar os dedos na garganta sem visualizar objeto",
    ],
    urgency: "alta",
    primarySkill: "airway",
  },
  {
    id: "convulsao-durando",
    symptom: "movimentos involuntarios ha mais de 5 minutos",
    correctAction: "proteger a cabeca, afastar objetos e acionar 192",
    wrongActions: [
      "segurar bracos e pernas com forca",
      "colocar objeto na boca",
      "dar bebida para a pessoa acordar",
    ],
    urgency: "alta",
    primarySkill: "seizure",
  },
  {
    id: "choque-hipovolemico",
    symptom: "palidez, sudorese fria e pulso fraco apos trauma",
    correctAction: "deitar, controlar sangramento e elevar pernas se sem trauma de coluna",
    wrongActions: [
      "manter em pe para evitar sonolencia",
      "dar cafe para elevar pressao",
      "fazer caminhar para testar consciencia",
    ],
    urgency: "alta",
    primarySkill: "shock",
  },
];

export const SCENARIOS_BY_COURSE: Record<string, AdaptiveScenarioTemplate[]> = {
  engasgo: [
    {
      id: "engasgo-bebe",
      symptom: "bebe sem choro apos ingerir pequeno objeto",
      correctAction: "5 tapas nas costas e 5 compressoes toracicas alternadas",
      wrongActions: [
        "compressao abdominal como em adulto",
        "sacudir o bebe para acordar",
        "forcar alimentacao para empurrar objeto",
      ],
      urgency: "alta",
      primarySkill: "airway",
    },
    {
      id: "engasgo-restaurante",
      symptom: "adulto em restaurante com obstrucao total",
      correctAction: "aplicar manobra de heimlich e pedir chamada imediata do 192",
      wrongActions: [
        "deitar no chao antes de tentar expelir objeto",
        "oferecer refrigerante",
        "esperar tosse espontanea por varios minutos",
      ],
      urgency: "alta",
      primarySkill: "airway",
    },
  ],
  convulsao: [
    {
      id: "convulsao-escola",
      symptom: "aluno em crise convulsiva durante aula",
      correctAction: "afastar objetos, proteger cabeca e contar tempo da crise",
      wrongActions: [
        "imobilizar com varias pessoas",
        "forcar abertura da boca",
        "transportar durante os espasmos",
      ],
      urgency: "media",
      primarySkill: "seizure",
    },
    {
      id: "convulsao-pos-crise",
      symptom: "apos crise, permanece sonolento e respirando devagar",
      correctAction: "colocar em posicao lateral de seguranca e monitorar respiracao",
      wrongActions: [
        "levantar imediatamente para caminhar",
        "oferecer alimento para recuperar energia",
        "deixar sozinho para descansar",
      ],
      urgency: "media",
      primarySkill: "seizure",
    },
  ],
  primeirossocorros: [
    {
      id: "hemorragia-trabalho",
      symptom: "sangramento importante em membro superior na oficina",
      correctAction: "compressao direta, avaliar choque e acionar suporte",
      wrongActions: [
        "aplicar alcool na ferida aberta",
        "remover gaze encharcada varias vezes",
        "esperar o sangramento reduzir sozinho",
      ],
      urgency: "alta",
      primarySkill: "bleeding",
    },
    {
      id: "triagem-acidente",
      symptom: "duas vitimas, uma inconsciente e outra com dor intensa",
      correctAction: "priorizar vitima inconsciente com avaliacao ABC imediata",
      wrongActions: [
        "atender primeiro quem grita mais",
        "movimentar todas as vitimas para area diferente sem avaliacao",
        "iniciar curativo complexo sem checar respiracao",
      ],
      urgency: "alta",
      primarySkill: "decision",
    },
  ],
};

export const PRESSURE_DISTRACTIONS = [
  "Som de fundo alto",
  "Pessoas pedindo ajuda ao mesmo tempo",
  "Informacao contraditoria de curiosos",
  "Ambiente com pouca iluminacao",
];

export const ADAPTIVE_EVENTS: {
  type: AdaptiveEventType;
  title: string;
  description: string;
  questionCount: number;
  pressureEnabled: boolean;
  rewardXp: number;
}[] = [
  {
    type: "daily-emergency",
    title: "Emergencia do dia",
    description: "1 cenario novo + revisao rapida para manter reflexo clinico.",
    questionCount: 5,
    pressureEnabled: true,
    rewardXp: 18,
  },
  {
    type: "weekly-challenge",
    title: "Desafio semanal",
    description: "Rodada de decisao com tempo para testar consistencia.",
    questionCount: 10,
    pressureEnabled: true,
    rewardXp: 40,
  },
  {
    type: "monthly-sim",
    title: "Simulado mensal",
    description: "Simulacao completa com cenarios variados e revisao adaptativa.",
    questionCount: 14,
    pressureEnabled: true,
    rewardXp: 70,
  },
];
