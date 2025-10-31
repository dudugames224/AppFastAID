
import {
  FlaskIcon,
  ThermometerIcon,
  ZapIcon,
} from "../components/Icons";
import * as ChokingLessons from "./chokingLessonData";
import * as FirstAidLessons from "./firstAidLessonData";
import * as BurnsLessons from "./lessonData";
import * as SeizureLessons from "./seizureLessonData";

// Agora, a propriedade 'icon' é um caminho de imagem
export const coursesData = {
  burns: {
    id: "burns",
    title: "Queimaduras",
    icon: require("../../assets/images/queimadura.png"),
    color: "#FF9500",
    modules: [
      {
        id: "burns-1",
        title: "1º Grau",
        lessons: [BurnsLessons.lesson1, BurnsLessons.lesson2],
        icon: ThermometerIcon,
        color: "#58CC02",
      },
      {
        id: "burns-2",
        title: "2º Grau",
        lessons: [BurnsLessons.lesson3, BurnsLessons.lesson4],
        icon: ThermometerIcon,
        color: "#1CB0F6",
      },
      {
        id: "burns-3",
        title: "3º Grau",
        lessons: [BurnsLessons.lesson5, BurnsLessons.lesson6],
        icon: ThermometerIcon,
        color: "#FF4B4B",
      },
      {
        id: "burns-4",
        title: "Químicas",
        lessons: [BurnsLessons.lesson7, BurnsLessons.lesson8],
        icon: ThermometerIcon,
        color: "#AF47FF",
      },
      {
        id: "burns-5",
        title: "Elétricas",
        lessons: [BurnsLessons.lesson9, BurnsLessons.lesson10],
        icon: ZapIcon,
        color: "#FFC700",
      },
    ],
  },

  seizures: {
    id: "seizures",
    title: "Convulsões",
    icon: require("../../assets/images/convulsao.png"),
    color: "#1CB0F6",
    modules: [
      {
        id: "seizures-1",
        title: "O que são?",
        lessons: [SeizureLessons.seizureLesson1, SeizureLessons.seizureLesson2],
        icon: FlaskIcon,
        color: "#58CC02",
      },
      {
        id: "seizures-2",
        title: "Causas",
        lessons: [SeizureLessons.seizureLesson3, SeizureLessons.seizureLesson4],
        icon: ZapIcon,
        color: "#FFC700",
      },
      {
        id: "seizures-3",
        title: "Tipos",
        lessons: [SeizureLessons.seizureLesson5, SeizureLessons.seizureLesson6],
        icon: ZapIcon,
        color: "#FF9500",
      },
      {
        id: "seizures-4",
        title: "Socorros",
        lessons: [SeizureLessons.seizureLesson7, SeizureLessons.seizureLesson8],
        icon: ZapIcon,
        color: "#FF4B4B",
      },
    ],
  },

  firstAid: {
    id: "firstAid",
    title: "Primeiros Socorros",
    icon: require("../../assets/images/kit.png"),
    color: "#5D9CFB",
    modules: [
      {
        id: "firstAid-1",
        title: "Introdução",
        lessons: [
          FirstAidLessons.firstAidLesson1,
          FirstAidLessons.firstAidLesson2,
        ],
        icon: FlaskIcon,
        color: "#58CC02",
      },
      {
        id: "firstAid-2",
        title: "Emergências",
        lessons: [
          FirstAidLessons.firstAidLesson3,
          FirstAidLessons.firstAidLesson4,
        ],
        icon: ZapIcon,
        color: "#FF9500",
      },
      {
        id: "firstAid-3",
        title: "RCP",
        lessons: [
          FirstAidLessons.firstAidLesson5,
          FirstAidLessons.firstAidLesson6,
        ],
        icon: ZapIcon,
        color: "#FF4B4B",
      },
      {
        id: "firstAid-4",
        title: "Prevenção",
        lessons: [
          FirstAidLessons.firstAidLesson7,
          FirstAidLessons.firstAidLesson8,
        ],
        icon: ZapIcon,
        color: "#1CB0F6",
      },
    ],
  },

  // ✅ NOVO CURSO — Engasgo
  choking: {
    id: "choking",
    title: "Engasgo",
    icon: require("../../assets/images/engasgo.png"),
    color: "#007AFF", 
    modules: [
      {
        id: "choking-1",
        title: "Entendendo",
        // Use as lições divididas que acabamos de criar
        lessons: [
          ChokingLessons.chokingLesson1_Theory,
          ChokingLessons.chokingLesson1_Practice,
        ],
        icon: FlaskIcon, // Ícone do módulo
        color: "#58CC02", // Cor do módulo
      },
      {
        id: "choking-2",
        title: "Identificando",
        lessons: [
          ChokingLessons.chokingLesson2_Theory,
          ChokingLessons.chokingLesson2_Practice,
        ],
        icon: ZapIcon, // Ícone do módulo
        color: "#1CB0F6", // Cor do módulo
      },
      {
        id: "choking-3",
        title: "Técnicas",
        lessons: [
          ChokingLessons.chokingLesson3_Theory,
          ChokingLessons.chokingLesson3_Practice,
        ],
        icon: ZapIcon, // Ícone do módulo
        color: "#FF9500", // Cor do módulo
      },
      {
        id: "choking-4",
        title: "Prevenção",
        lessons: [
          ChokingLessons.chokingLesson4_Theory,
          ChokingLessons.chokingLesson4_Practice,
        ],
        icon: FlaskIcon, // Ícone do módulo
        color: "#FF4B4B", // Cor do módulo
      },
    ],
  },
};


export const hardBurnsQuizBank = [
  {
    type: "mcq",
    question:
      "Qual é o principal critério clínico que diferencia uma queimadura de 2º grau superficial de uma profunda?",
    options: [
      "Presença de bolhas e dor intensa",
      "Ausência de bolhas e cor esbranquiçada",
      "Presença de dor leve e pele seca",
      "Ausência de dor e presença de crosta espessa",
      "Perda completa de sensibilidade",
    ],
    answer: 0,
    correctFeedback:
      "Correto! A presença de bolhas com dor intensa indica que a derme foi parcialmente atingida, mas as terminações nervosas estão preservadas.",
    incorrectFeedback:
      'A resposta correta é "Presença de bolhas e dor intensa". A dor indica que os nervos ainda estão intactos, caracterizando a lesão como superficial ou intermediária.',
  },
  {
    type: "mcq",
    question: "Queimaduras de 3º grau são caracterizadas por:",
    options: [
      "Lesão apenas epidérmica",
      "Dor intensa e bolhas superficiais",
      "Necrose total da pele com perda de sensibilidade",
      "Eritema e descamação leve",
      "Lesão reversível em poucas horas",
    ],
    answer: 2,
    correctFeedback:
      "Correto! A necrose total com perda de sensibilidade ocorre devido à destruição completa das camadas da pele e terminações nervosas.",
    incorrectFeedback:
      "A principal característica é a necrose (morte do tecido) e a perda de sensibilidade, pois os nervos são destruídos.",
  },
  {
    type: "mcq",
    question:
      "O cálculo da área corporal queimada em adultos é feito comumente pela:",
    options: [
      "Escala de Glasgow",
      "Regra dos 9 de Wallace",
      "Escala de Braden",
      "Regra dos 12 de Broca",
      "Índice de Apgar",
    ],
    answer: 1,
    correctFeedback:
      "Correto! A Regra dos 9 de Wallace é um método rápido para estimar a área queimada em múltiplos de 9%.",
    incorrectFeedback:
      "O método mais comum para adultos é a Regra dos 9 de Wallace, que divide o corpo em áreas de 9%.",
  },
  {
    type: "mcq",
    question:
      "Em uma vítima com queimadura elétrica, qual deve ser a primeira preocupação do socorrista?",
    options: [
      "Aplicar pomada antibiótica",
      "Avaliar a respiração",
      "Afastar a fonte elétrica com segurança",
      "Lavar com água corrente",
      "Remover roupas grudadas",
    ],
    answer: 2,
    correctFeedback:
      "Correto! Segurança em primeiro lugar. Antes de tocar na vítima, é crucial garantir que a fonte de eletricidade foi desligada.",
    incorrectFeedback:
      "A prioridade absoluta é a segurança do socorrista. É preciso desligar a fonte elétrica antes de qualquer outra ação.",
  },
  {
    type: "mcq",
    question:
      "Em queimaduras químicas, o procedimento inicial mais indicado é:",
    options: [
      "Aplicar pomadas oleosas",
      "Lavar abundantemente com água corrente",
      "Usar gelo para aliviar a dor",
      "Neutralizar com outra substância química",
      "Retirar o tecido necrosado",
    ],
    answer: 1,
    correctFeedback:
      "Correto! Lavar com água corrente abundante remove o agente químico e limita os danos aos tecidos.",
    incorrectFeedback:
      "A lavagem com água corrente por pelo menos 20 minutos é essencial para remover o agente químico e parar a lesão.",
  },
  {
    type: "mcq",
    question: "Que tipo de queimadura compromete músculos и ossos?",
    options: [
      "1º grau",
      "2º grau superficial",
      "2º grau profundo",
      "3º grau",
      "4º grau",
    ],
    answer: 4,
    correctFeedback:
      "Correto! Queimaduras de 4º grau são as mais profundas, atingindo estruturas como músculos e ossos.",
    incorrectFeedback:
      "As queimaduras que atingem músculos e ossos são classificadas como de 4º grau.",
  },
  {
    type: "mcq",
    question: "A regra da palma da mão é usada para:",
    options: [
      "Calcular a profundidade da queimadura",
      "Estimar 1% da superfície corporal queimada",
      "Determinar o grau da lesão",
      "Avaliar o tempo de recuperação",
      "Medir o risco de infecção",
    ],
    answer: 1,
    correctFeedback:
      "Correto! A palma da mão do paciente (incluindo os dedos) representa aproximadamente 1% da sua área corporal total.",
    incorrectFeedback:
      "A regra da palma da mão é um método rápido para estimar a extensão da queimadura, onde a palma da mão da vítima equivale a 1% de sua área corporal.",
  },
  {
    type: "mcq",
    question:
      "Qual é a conduta incorreta em primeiros socorros de queimaduras térmicas?",
    options: [
      "Lavar com água corrente fria por 10 a 20 minutos",
      "Retirar acessórios e anéis antes do inchaço",
      "Romper bolhas para aliviar a pressão",
      "Cobrir com pano limpo e seco",
      "Evitar aplicar cremes ou manteiga",
    ],
    answer: 2,
    correctFeedback:
      "Correto! Romper bolhas aumenta significativamente o risco de infecção e deve ser evitado.",
    incorrectFeedback:
      "A conduta incorreta é romper as bolhas, pois elas servem como uma barreira de proteção natural contra infecções.",
  },
  {
    type: "mcq",
    question:
      "Uma queimadura de 2º grau que cobre 20% da área corporal de um adulto é considerada:",
    options: ["Leve", "Moderada", "Grave", "Muito grave", "Superficial"],
    answer: 2,
    correctFeedback:
      "Correto! Queimaduras de 2º grau que cobrem mais de 15-20% da área corporal em adultos são classificadas como graves.",
    incorrectFeedback:
      "Qualquer queimadura de 2º grau que cubra mais de 15% da área corporal já é considerada grave.",
  },
  {
    type: "mcq",
    question:
      "Em queimaduras extensas, o principal risco sistêmico imediato é:",
    options: [
      "Infecção bacteriana",
      "Hipotermia",
      "Desidratação por perda de plasma",
      "Coagulação intravascular",
      "Hiperglicemia",
    ],
    answer: 2,
    correctFeedback:
      "Correto! A perda de plasma através da pele queimada pode levar à hipovolemia (baixo volume de sangue) e choque.",
    incorrectFeedback:
      "O maior risco imediato é a desidratação severa (choque hipovolêmico), pois a pele danificada não consegue reter os fluidos corporais.",
  },
  {
    type: "mcq",
    question:
      "A reposição volêmica em grandes queimados é feita com base na fórmula de Parkland, que utiliza como variável principal:",
    options: [
      "Peso corporal e área queimada",
      "Pressão arterial e frequência cardíaca",
      "Idade e profundidade",
      "Nível de dor e temperatura corporal",
      "Tipo de agente causador",
    ],
    answer: 0,
    correctFeedback:
      "Correto! A fórmula de Parkland (4 mL × peso (kg) × %SCQ) usa o peso e a área queimada para calcular o volume de fluido necessário.",
    incorrectFeedback:
      "A fórmula de Parkland depende do peso da vítima e da percentagem da área corporal queimada para calcular a reposição de fluidos.",
  },
  {
    type: "mcq",
    question:
      "Queimaduras em regiões como face, pescoço ou vias aéreas superiores exigem prioridade porque:",
    options: [
      "A dor é mais intensa nessas áreas",
      "Podem causar obstrução respiratória por edema",
      "São mais propensas à infecção",
      "Cicatrizam lentamente",
      "São difíceis de imobilizar",
    ],
    answer: 1,
    correctFeedback:
      "Correto! O edema (inchaço) nessas áreas pode comprometer as vias aéreas rapidamente, sendo uma prioridade absoluta.",
    incorrectFeedback:
      "O inchaço no rosto ou pescoço pode fechar as vias aéreas e impedir a respiração, sendo uma emergência de alta prioridade.",
  },
  {
    type: "mcq",
    question: "Em queimaduras por produto químico em pó, o primeiro passo é:",
    options: [
      "Lavar imediatamente com água",
      "Neutralizar com vinagre",
      "Escovar o pó seco antes de lavar",
      "Aplicar pomada hidratante",
      "Cobrir com gaze úmida",
    ],
    answer: 2,
    correctFeedback:
      "Correto! Remover o pó seco antes da lavagem evita uma reação química com a água que poderia piorar a queimadura.",
    incorrectFeedback:
      "Para pós químicos, deve-se primeiro escovar o produto para remover o excesso, e só depois lavar com água.",
  },
  {
    type: "mcq",
    question: "A queimadura de 1º grau atinge qual camada da pele?",
    options: [
      "Epiderme apenas",
      "Epiderme e parte da derme",
      "Derme profunda",
      "Hipoderme",
      "Músculo",
    ],
    answer: 0,
    correctFeedback:
      "Correto! É uma queimadura superficial que afeta apenas a epiderme.",
    incorrectFeedback:
      "As queimaduras de 1º grau são as mais superficiais, atingindo apenas a camada externa da pele, a epiderme.",
  },
  {
    type: "mcq",
    question:
      "Por que não se deve aplicar gelo diretamente sobre uma queimadura?",
    options: [
      "Porque o gelo contém bactérias",
      "Porque aumenta a circulação sanguínea",
      "Porque pode agravar o dano tecidual por vasoconstrição",
      "Porque altera o pH da pele",
      "Porque reduz a eficácia de curativos",
    ],
    answer: 2,
    correctFeedback:
      "Correto! O gelo causa vasoconstrição extrema (contração dos vasos sanguíneos) e pode provocar necrose (morte do tecido) adicional.",
    incorrectFeedback:
      "O frio extremo do gelo pode contrair os vasos sanguíneos de tal forma que agrava a lesão na pele, podendo até causar mais morte celular.",
  },
];

export const hardSeizuresQuizBank = [
  {
    type: "mcq",
    question:
      "Em termos neurofisiológicos, o que ocorre no cérebro durante uma convulsão epiléptica?",
    options: [
      "Hiperpolarização generalizada dos neurônios",
      "Bloqueio completo dos canais de cálcio",
      "Descarga sincrônica e excessiva de neurônios corticais",
      "Aumento do tônus vagal e bradicardia",
      "Diminuição do fluxo sanguíneo cerebral",
    ],
    answer: 2,
    correctFeedback: "Correto! Esta é a base fisiológica da convulsão.",
    incorrectFeedback:
      "A convulsão é uma descarga sincrônica e excessiva de neurônios corticais.",
  },
  {
    type: "mcq",
    question:
      "A convulsão causada por febre alta em crianças ocorre principalmente devido a:",
    options: [
      "Um aumento direto da excitabilidade neuronal causado pela temperatura",
      "À desidratação intensa provocada pela febre",
      "À infecção viral associada ao sistema nervoso central",
      "Ao uso inadequado de antipiréticos",
      "À deficiência de cálcio",
    ],
    answer: 0,
    correctFeedback:
      "Correto! A febre alta aumenta diretamente a excitabilidade neuronal em cérebreros imaturos.",
    incorrectFeedback:
      "A causa principal é o aumento da excitabilidade neuronal devido à temperatura elevada.",
  },
  {
    type: "mcq",
    question:
      "Um paciente apresenta convulsões focais com automatismos orais (movimentos de mastigação). Qual região cerebral provavelmente está envolvida?",
    options: [
      "Lobo occipital",
      "Lobo parietal",
      "Lobo temporal",
      "Tronco encefálico",
      "Cerebelo",
    ],
    answer: 2,
    correctFeedback:
      "Correto! O lobo temporal é o foco clássico das convulsões com automatismos orais.",
    incorrectFeedback:
      "Movimentos de mastigação automáticos são característicos de convulsões com foco no lobo temporal.",
  },
  {
    type: "mcq",
    question:
      "Qual dessas condições metabólicas pode precipitar uma convulsão mesmo em indivíduos sem epilepsia prévia?",
    options: [
      "Hiperglicemia",
      "Hiponatremia",
      "Hipercolesterolemia",
      "Hipertensão",
      "Hipertermia leve",
    ],
    answer: 1,
    correctFeedback:
      "Correto! A hiponatremia (baixo sódio) altera gradientes iônicos, favorecendo despolarização excessiva.",
    incorrectFeedback:
      "A hiponatremia (níveis baixos de sódio no sangue) é uma causa metabólica conhecida de convulsões.",
  },
  {
    type: "mcq",
    question: "O termo status epilepticus refere-se a:",
    options: [
      "Qualquer convulsão com perda de consciência",
      "Convulsões recorrentes sem retorno à consciência entre elas",
      "Convulsão febril em crianças menores de 2 anos",
      "Convulsão única com duração inferior a 2 minutos",
      "Episódio psicogênico não epiléptico",
    ],
    answer: 1,
    correctFeedback:
      "Correto! Status epilepticus é uma emergência com convulsões contínuas ou repetidas sem recuperação.",
    incorrectFeedback:
      "É uma emergência médica definida por convulsões contínuas ou recorrentes sem recuperação da consciência.",
  },
  {
    type: "mcq",
    question:
      "Em uma crise de ausência típica, qual achado eletroencefalográfico é mais característico?",
    options: [
      "Padrão de ondas lentas e irregulares",
      "Complexo ponta-onda de 3 Hz generalizado",
      "Supressão total de atividade elétrica",
      "Ondas delta difusas",
      "Potenciais espiculares unilaterais",
    ],
    answer: 1,
    correctFeedback:
      "Correto! O complexo ponta-onda de 3 Hz é o padrão clássico das crises de ausência.",
    incorrectFeedback:
      "O padrão de EEG típico para uma crise de ausência é o complexo ponta-onda de 3 Hz.",
  },
  {
    type: "mcq",
    question:
      "Uma convulsão tônico-clônica generalizada segue geralmente qual sequência fisiológica?",
    options: [
      "Relaxamento → rigidez → confusão → sono",
      "Rigidez → tremores rítmicos → relaxamento → confusão pós-ictal",
      "Tremores → rigidez → perda de consciência → recuperação imediata",
      "Perda de consciência → relaxamento → rigidez → recuperação",
      "Contração → relaxamento rápido → estado lúcido",
    ],
    answer: 1,
    correctFeedback:
      "Correto! Esta é a sequência fisiológica clássica da crise tônico-clônica.",
    incorrectFeedback:
      "A sequência é: fase tônica (rigidez), seguida da fase clônica (tremores rítmicos) e, por fim, a fase pós-ictal (confusão).",
  },
  {
    type: "mcq",
    question:
      "Qual é o mecanismo de ação principal da carbamazepina, um medicamento antiepiléptico clássico?",
    options: [
      "Bloqueio dos receptores GABA-A",
      "Bloqueio dos canais de sódio voltagem-dependentes",
      "Estimulação da recaptação de serotonina",
      "Inibição da liberação de dopamina",
      "Aumento do fluxo de cálcio intracelular",
    ],
    answer: 1,
    correctFeedback:
      "Correto! A carbamazepina bloqueia canais de sódio, reduzindo disparos neuronais anormais.",
    incorrectFeedback:
      "Este medicamento funciona principalmente bloqueando os canais de sódio, o que estabiliza a membrana neuronal.",
  },
  {
    type: "mcq",
    question:
      "Durante o atendimento de uma convulsão, por que é contraindicado colocar objetos na boca da vítima?",
    options: [
      "Pode provocar sufocamento e obstrução das vias aéreas",
      "Reduz o fluxo sanguíneo cerebral",
      "Aumenta a duração da convulsão",
      "Induz vômitos e alucinações",
      "Bloqueia o reflexo de deglutição",
    ],
    answer: 0,
    correctFeedback:
      "Correto! Pode causar engasgo, fraturas dentárias e obstruir a respiração.",
    incorrectFeedback:
      "Colocar objetos na boca pode causar fraturas nos dentes, lesões na boca e até mesmo obstruir as vias aéreas.",
  },
  {
    type: "mcq",
    question:
      "Qual dos seguintes fatores é mais associado ao aumento do risco de crises epilépticas noturnas?",
    options: [
      "Exposição à luz solar intensa",
      "Privação de sono e fadiga",
      "Exercício físico regular",
      "Ingestão de líquidos antes de dormir",
      "Temperaturas amenas",
    ],
    answer: 1,
    correctFeedback:
      "Correto! A privação de sono é um dos gatilhos mais frequentes para convulsões.",
    incorrectFeedback:
      "A falta de sono e o cansaço extremo são conhecidos por diminuir o limiar convulsivo, sendo um gatilho comum.",
  },
];

export const hardFirstAidQuizBank = [
  {
    type: "mcq",
    question:
      "Em uma situação de emergência com múltiplas vítimas, como um socorrista leigo deve priorizar a assistência?",
    options: [
      "Atender primeiro a vítima que está gritando por ajuda",
      "Avaliar todas as vítimas rapidamente e priorizar aquelas com risco imediato à vida, como ausência de respiração",
      "Atender primeiro a vítima mais próxima, independentemente da gravidade",
      "Esperar a chegada de profissionais para decidir",
    ],
    answer: 1,
    correctFeedback:
      "Correto! Em cenários com múltiplas vítimas, a triagem prioriza salvar vidas em risco iminente.",
    incorrectFeedback:
      "A resposta correta é avaliar todas as vítimas e priorizar aquelas com risco imediato à vida.",
  },
  {
    type: "mcq",
    question:
      "Qual é o risco de não avaliar a segurança do local antes de prestar primeiros socorros?",
    options: [
      "Atrasar o atendimento médico profissional",
      "Tornar-se uma vítima adicional devido a perigos não identificados",
      "Reduzir a eficácia da RCP",
      "Aumentar a chance de infecção na vítima",
    ],
    answer: 1,
    correctFeedback:
      "Correto! Não avaliar a segurança pode expor o socorrista a riscos como fogo ou eletricidade.",
    incorrectFeedback:
      "A resposta correta é o risco de se tornar uma vítima adicional.",
  },
  {
    type: "mcq",
    question:
      "Em que situação um socorrista leigo deve evitar prestar primeiros socorros, mesmo com treinamento básico?",
    options: [
      "Quando a vítima está consciente e recusando ajuda",
      "Quando a vítima apresenta um ferimento leve",
      "Quando há sangramento arterial abundante",
      "Quando a vítima está inconsciente, mas respirando",
    ],
    answer: 0,
    correctFeedback:
      "Correto! Respeitar a recusa de uma vítima consciente é essencial.",
    incorrectFeedback:
      "A resposta correta é quando a vítima recusa ajuda, pois devemos respeitar sua autonomia.",
  },
  {
    type: "mcq",
    question:
      "Como um socorrista leigo deve proceder se a vítima estiver em um local com risco de explosão?",
    options: [
      "Iniciar a RCP imediatamente para estabilizar a vítima",
      "Mover a vítima rapidamente, mesmo sem avaliar lesões na coluna",
      "Avaliar a segurança e, se possível, remover a vítima com cuidado para um local seguro antes de agir",
      "Ignorar o risco e focar apenas na estabilização da vítima",
    ],
    answer: 2,
    correctFeedback:
      "Correto! Avaliar e remover a vítima para um local seguro é crucial.",
    incorrectFeedback:
      "A prioridade é a segurança. Remova a vítima para um local seguro antes de agir.",
  },
  {
    type: "mcq",
    question:
      "Em caso de uma queimadura química nos olhos, qual é a ação imediata mais apropriada?",
    options: [
      "Aplicar compressas quentes para aliviar a dor",
      "Lavar os olhos com água corrente por pelo menos 15 minutos e chamar emergência",
      "Cobrir os olhos com gaze estéril sem lavar",
      "Usar colírio comum para neutralizar o produto químico",
    ],
    answer: 1,
    correctFeedback:
      "Correto! A lavagem imediata remove o produto químico e a emergência é essencial.",
    incorrectFeedback:
      "A ação correta é lavar os olhos com água corrente por um tempo prolongado.",
  },
  {
    type: "mcq",
    question:
      "Qual é o risco de induzir vômito em uma vítima que ingeriu um produto químico corrosivo, como soda cáustica?",
    options: [
      "Pode causar desidratação severa",
      "Pode piorar lesões no esôfago ou causar aspiração pulmonar",
      "Pode neutralizar o produto químico no estômago",
      "Pode acelerar a absorção do produto químico",
    ],
    answer: 1,
    correctFeedback:
      "Correto! Induzir vômito com substâncias corrosivas pode causar mais danos.",
    incorrectFeedback:
      "O vômito pode causar uma segunda queimadura no esôfago e vias aéreas.",
  },
  {
    type: "mcq",
    question:
      "Em uma fratura exposta com sangramento grave, qual é a sequência correta de ações após garantir a segurança do local?",
    options: [
      "Tentar realinhar o osso, aplicar pressão no sangramento, imobilizar",
      "Aplicar pressão no sangramento, cobrir a ferida, imobilizar, chamar ajuda",
      "Imobilizar o membro, chamar ajuda, ignorar o sangramento",
      "Cobrir a ferida, aplicar gelo, realinhar o osso",
    ],
    answer: 1,
    correctFeedback:
      "Correto! Controlar o sangramento é prioritário, seguido de proteção da ferida e imobilização.",
    incorrectFeedback:
      "A sequência correta é: controlar o sangramento, proteger a ferida, imobilizar e chamar ajuda.",
  },
  {
    type: "mcq",
    question:
      "Qual é a principal complicação de realizar a manobra de Heimlich incorretamente em uma vítima de engasgo?",
    options: [
      "Fratura de costelas ou lesão abdominal",
      "Aumento do fluxo sanguíneo para o cérebro",
      "Deslocamento do ombro da vítima",
      "Redução da frequência cardíaca",
    ],
    answer: 0,
    correctFeedback:
      "Correto! A manobra de Heimlich mal executada pode causar lesões internas graves.",
    incorrectFeedback:
      "A aplicação de força no local errado pode causar fraturas e lesões em órgãos internos.",
  },
  {
    type: "mcq",
    question:
      "Em uma RCP em adulto, qual é a consequência de compressões torácicas com profundidade insuficiente?",
    options: [
      "Aumento da pressão arterial da vítima",
      "Circulação sanguínea inadequada, reduzindo a chance de recuperação",
      "Menor risco de fraturas costais",
      "Melhora na oxigenação pulmonar",
    ],
    answer: 1,
    correctFeedback:
      "Correto! Compressões rasas não geram pressão suficiente para circulação eficaz.",
    incorrectFeedback:
      "Compressões com profundidade insuficiente não bombeiam o sangue de forma eficaz para o cérebro e órgãos vitais.",
  },
  {
    type: "mcq",
    question:
      "Em uma criança de 5 anos com parada cardiorrespiratória, como ajustar a RCP em comparação com um adulto?",
    options: [
      "Usar a mesma força e profundidade de compressões que em adultos",
      "Usar uma mão ou dois dedos, com profundidade de cerca de 4-5 cm",
      "Evitar compressões e focar apenas em ventilações",
      "Aplicar compressões mais rápidas, acima de 140 por minuto",
    ],
    answer: 1,
    correctFeedback:
      "Correto! Em crianças, a RCP exige menos força e profundidade ajustada ao tamanho do corpo.",
    incorrectFeedback:
      "Para crianças, a técnica deve ser ajustada, usando menos força para evitar lesões.",
  },
  {
    type: "mcq",
    question:
      "Qual é o procedimento correto se o DEA indicar “não aplicar choque” durante uma RCP?",
    options: [
      "Interromper a RCP e esperar 5 minutos",
      "Continuar a RCP até nova análise do DEA ou chegada de ajuda",
      "Aplicar um choque manualmente",
      "Finalizar a RCP e monitorar a vítima",
    ],
    answer: 1,
    correctFeedback:
      "Correto! Um resultado “não aplicar choque” indica que a RCP deve continuar para manter a circulação.",
    incorrectFeedback:
      "Se o DEA não recomenda o choque, a RCP deve ser retomada imediatamente.",
  },
  {
    type: "mcq",
    question:
      "Em uma vítima grávida com parada cardíaca, qual ajuste deve ser feito na RCP?",
    options: [
      "Evitar compressões torácicas para proteger o feto",
      "Inclinar a vítima para a esquerda durante as compressões para melhorar o fluxo sanguíneo",
      "Realizar compressões no abdômen inferior",
      "Usar apenas ventilações boca-a-boca",
    ],
    answer: 1,
    correctFeedback:
      "Correto! Isso reduz a compressão da veia cava pelo útero gravídico.",
    incorrectFeedback:
      "Inclinar a vítima para a esquerda ajuda a descomprimir a veia cava, melhorando o retorno de sangue ao coração.",
  },
  {
    type: "mcq",
    question:
      "Qual é o risco de não incluir luvas descartáveis em um kit de primeiros socorros?",
    options: [
      "Dificuldade em aplicar bandagens adequadamente",
      "Exposição a infecções durante o atendimento de ferimentos com sangue",
      "Impossibilidade de realizar RCP com segurança",
      "Redução da eficácia de antissépticos",
    ],
    answer: 1,
    correctFeedback:
      "Correto! Luvas protegem contra patógenos transmitidos pelo sangue.",
    incorrectFeedback:
      "As luvas são uma barreira de proteção essencial contra doenças transmitidas pelo sangue e outros fluidos.",
  },
  {
    type: "mcq",
    question:
      "Em uma área remota sem acesso imediato a serviços de emergência, qual é a melhor estratégia para lidar com uma vítima de choque anafilático?",
    options: [
      "Administrar qualquer medicamento disponível no kit",
      "Usar um autoinjetor de epinefrina, se disponível, e improvisar transporte para ajuda médica",
      "Esperar a reação passar espontaneamente",
      "Aplicar compressas frias na área da reação",
    ],
    answer: 1,
    correctFeedback:
      "Correto! A epinefrina é o tratamento inicial, mas ajuda médica é essencial.",
    incorrectFeedback:
      "Em casos de anafilaxia, a epinefrina é vital, mas o transporte para um hospital continua sendo uma prioridade.",
  },
  {
    type: "mcq",
    question:
      "Qual é a principal razão para revisar regularmente um kit de primeiros socorros?",
    options: [
      "Garantir que os itens estejam dentro da validade e em condições de uso",
      "Substituir itens por equipamentos mais avançados",
      "Reduzir o peso do kit para facilitar transporte",
      "Adicionar medicamentos controlados para emergências graves",
    ],
    answer: 0,
    correctFeedback:
      "Correto! Itens vencidos ou danificados podem ser ineficazes ou perigosos.",
    incorrectFeedback:
      "A revisão periódica garante que o kit esteja sempre pronto para uso, com todos os itens válidos e funcionais.",
  },
];

export const hardChokingQuizBank = [
  // Módulo 1: Entendendo o Engasgo
  {
    type: "mcq",
    question: "Qual é a principal complicação fisiológica de um engasgo completo não tratado?",
    options: [
      "Aumento da pressão arterial devido ao estresse",
      "Hipóxia cerebral seguida de parada cardiorrespiratória",
      "Lesão muscular no diafragma",
      "Acúmulo de dióxido de carbono sem impacto imediato",
    ],
    answer: 1,
    correctFeedback: "Correto! A falta de oxigênio no engasgo completo leva rapidamente à hipóxia e pode causar parada cardíaca.",
    incorrectFeedback: "A resposta correta é 'b'. A falta de oxigênio no engasgo completo leva rapidamente à hipóxia e pode causar parada cardíaca.",
  },
  {
    type: "mcq",
    question: "Em que situação um engasgo parcial pode evoluir para completo sem intervenção direta?",
    options: [
      "Quando a vítima continua tossindo vigorosamente",
      "Quando o objeto se move, bloqueando totalmente a traqueia",
      "Quando a vítima ingere liquids para aliviar o engasgo",
      "Quando a vítima permanece calma e respira lentamente",
    ],
    answer: 1,
    correctFeedback: "Correto! Um objeto em obstrução parcial pode se deslocar, agravando a situação.",
    incorrectFeedback: "A resposta correta é 'b'. Um objeto em obstrução parcial pode se deslocar, agravando a situação.",
  },
  {
    type: "mcq",
    question: "Qual fator anatômico aumenta o risco de engasgo em crianças pequenas em comparação com adultos?",
    options: [
      "Traqueia mais larga e flexível",
      "Vias aéreas mais estreitas e menor força de tosse",
      "Maior capacidade pulmonar",
      "Epiglote menos sensível",
    ],
    answer: 1,
    correctFeedback: "Correto! Crianças têm traqueia menor e menos capacidade de expelir objetos.",
    incorrectFeedback: "A resposta correta é 'b'. Crianças têm traqueia menor e menos capacidade de expelir objetos.",
  },
  {
    type: "mcq",
    question: "Como diferenciar um engasgo de uma crise de pânico com hiperventilação em um adulto?",
    options: [
      "Crise de pânico causa cianose imediata; engasgo, não",
      "Engasgo impede fala e tosse; crise de pânico permite verbalização",
      "Crise de pânico causa mãos no pescoço; engasgo, não",
      "Não há diferença significativa nos sinais iniciais",
    ],
    answer: 1,
    correctFeedback: "Correto! A crise de pânico permite fala, mesmo que dificultada, enquanto o engasgo bloqueia a vocalização.",
    incorrectFeedback: "A resposta correta é 'b'. A crise de pânico permite fala, mesmo que dificultada, enquanto o engasgo bloqueia a vocalização.",
  },
  // Módulo 2: Identificando e Avaliando o Engasgo
  {
    type: "mcq",
    question: "Qual é o risco de tentar desobstruir um engasgo parcial com compressões abdominais desnecessárias?",
    options: [
      "Pode deslocar o objeto, causando obstrução completa",
      "Pode melhorar a capacidade respiratória da vítima",
      "Não há riscos, pois a manobra é sempre segura",
      "Pode causar apenas desconforto leve",
    ],
    answer: 0,
    correctFeedback: "Correto! Intervenções desnecessárias podem agravar a obstrução parcial.",
    incorrectFeedback: "A resposta correta é 'a'. Intervenções desnecessárias podem agravar a obstrução parcial.",
  },
  {
    type: "mcq",
    question: "Em um bebê de 6 meses, qual sinal sutil pode indicar engasgo antes da cianose?",
    options: [
      "Aumento do choro normal",
      "Movimentos fracos de sucção ou dificuldade para engolir",
      "Febre súbita sem outros sintomas",
      "Respiração ruidosa sem esforço visível",
    ],
    answer: 1,
    correctFeedback: "Correto! Esses sinais sutis em bebês indicam obstrução antes de sintomas graves.",
    incorrectFeedback: "A resposta correta é 'b'. Esses sinais sutis em bebês indicam obstrução antes de sintomas graves.",
  },
  {
    type: "mcq",
    question: "Qual é a melhor abordagem se uma vítima de engasgo começa a apresentar sinais de hipóxia, mas ainda está consciente?",
    options: [
      "Iniciar RCP imediatamente",
      "Aplicar a manobra de Heimlich com urgência e chamar emergência",
      "Oferecer líquidos para aliviar a obstrução",
      "Esperar a vítima desmaiar antes de agir",
    ],
    answer: 1,
    correctFeedback: "Correto! Hipóxia requer ação imediata para desobstruir e ajuda profissional.",
    incorrectFeedback: "A resposta correta é 'b'. Hipóxia requer ação imediata para desobstruir e ajuda profissional.",
  },
  {
    type: "mcq",
    question: "Como identificar um engasgo em uma pessoa com paralisia facial que não pode sinalizar com as mãos?",
    options: [
      "Verificar apenas a frequência cardíaca",
      "Observar incapacidade de falar, respiração sibilante ou cianose",
      "Confiar na expressão facial da vítima",
      "Ignorar sinais respiratórios e focar em movimentos corporais",
    ],
    answer: 1,
    correctFeedback: "Correto! Sinais respiratórios são cruciais, já que a vítima não pode sinalizar manualmente.",
    incorrectFeedback: "A resposta correta é 'b'. Sinais respiratórios são cruciais, já que a vítima não pode sinalizar manualmente.",
  },
  // Módulo 3: Técnicas de Desobstrução
  {
    type: "mcq",
    question: "Qual é a principal complicação de realizar batidas nas costas com força excessiva em uma criança pequena?",
    options: [
      "Melhora na desobstrução das vias aéreas",
      "Lesão na coluna vertebral ou fratura de costelas",
      "Redução do risco de hipóxia",
      "Aumento da frequência respiratória",
    ],
    answer: 1,
    correctFeedback: "Correto! Força excessiva em crianças pode causar danos graves devido à fragilidade óssea.",
    incorrectFeedback: "A resposta correta é 'b'. Força excessiva em crianças pode causar danos graves devido à fragilidade óssea.",
  },
  {
    type: "mcq",
    question: "Em uma vítima obesa com engasgo completo, qual é o ajuste mais apropriado na manobra de Heimlich?",
    options: [
      "Aplicar impulsos abdominais com maior pressão",
      "Realizar compressões torácicas no centro do peito, evitando o abdômen",
      "Evitar qualquer compressão e focar em batidas nas costas",
      "Usar a mesma técnica que em outros adultos",
    ],
    answer: 1,
    correctFeedback: "Correto! Em obesos, compressões torácicas são mais eficazes devido à dificuldade de acesso abdominal.",
    incorrectFeedback: "A resposta correta é 'b'. Em obesos, compressões torácicas são mais eficazes devido à dificuldade de acesso abdominal.",
  },
  {
    type: "mcq",
    question: "Qual é o procedimento correto se um bebê não responde às batidas nas costas e compressões torácicas?",
    options: [
      "Continuar as batidas indefinidamente",
      "Verificar a cavidade oral, repetir a sequência e chamar emergência",
      "Iniciar ventilações boca-a-boca sem verificar a boca",
      "Parar a intervenção e esperar ajuda médica",
    ],
    answer: 1,
    correctFeedback: "Correto! Persistir com a técnica e buscar ajuda é essencial se a desobstrução falhar.",
    incorrectFeedback: "A resposta correta é 'b'. Persistir com a técnica e buscar ajuda é essencial se a desobstrução falhar.",
  },
  {
    type: "mcq",
    question: "Em uma vítima inconsciente após engasgo, qual é o primeiro passo antes de iniciar a RCP?",
    options: [
      "Aplicar um choque com desfibrilador",
      "Verificar a cavidade oral para remover obstruções visíveis",
      "Realizar compressões abdominais",
      "Elevar as pernas da vítima",
    ],
    answer: 1,
    correctFeedback: "Correto! Antes da RCP, remover obstruções visíveis pode restaurar a respiração.",
    incorrectFeedback: "A resposta correta é 'b'. Antes da RCP, remover obstruções visíveis pode restaurar a respiração.",
  },
  // Módulo 4: Prevenção e Preparação para Engasgos
  {
    type: "mcq",
    question: "Qual é o risco de oferecer alimentos como pipoca a crianças menores de 4 anos?",
    options: [
      "Pode causar apenas cáries dentárias",
      "Pode aumentar o risco de engasgo devido à textura e tamanho",
      "Pode melhorar a coordenação de deglutição",
      "Não apresenta riscos se supervisionado",
    ],
    answer: 1,
    correctFeedback: "Correto! Pipoca é leve e pode ser aspirada facilmente por crianças pequenas.",
    incorrectFeedback: "A resposta correta é 'b'. Pipoca é leve e pode ser aspirada facilmente por crianças pequenas.",
  },
  {
    type: "mcq",
    question: "Em uma casa com idosos com disfagia, qual é a estratégia mais eficaz para prevenir engasgos durante refeições?",
    options: [
      "Oferecer alimentos sólidos em grandes porções para prática",
      "Adaptar a dieta com alimentos macios e espessar liquids, se necessário",
      "Ignorar a textura dos alimentos e focar na quantidade",
      "Evitar refeições supervisionadas",
    ],
    answer: 1,
    correctFeedback: "Correto! Isso reduz o risco de aspiração em idosos com disfagia.",
    incorrectFeedback: "A resposta correta é 'b'. Isso reduz o risco de aspiração em idosos com disfagia.",
  },
  {
    type: "mcq",
    question: "Qual é a principal razão para treinar a manobra de Heimlich em diferentes grupos etários (bebês, crianças, adultos)?",
    options: [
      "Cada grupo requer a mesma técnica, mas com intensidades diferentes",
      "As diferenças anatômicas exigem adaptações específicas na técnica",
      "O treinamento é idêntico, mas a confiança varia por idade",
      "Apenas adultos precisam da manobra de Heimlich",
    ],
    answer: 1,
    correctFeedback: "Correto! Cada grupo etário requer ajustes na força, local e técnica para segurança e eficácia.",
    incorrectFeedback: "A resposta correta é 'b'. As diferenças anatômicas exigem adaptações específicas na técnica.",
  },
];

export const leaderboardData = [
  { rank: 1, name: "Helena", xp: 4580, avatar: "👩‍⚕️" },
  { rank: 2, name: "Miguel", xp: 4210, avatar: "👨‍⚕️" },
  { rank: 3, name: "Alice", xp: 3950, avatar: "👩‍🔬" },
];
