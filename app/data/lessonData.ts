// Lição 1: Teoria - Queimaduras de 1º Grau (Apenas a explicação)
export const lesson1 = [
  {
    type: "info",
    title: "O que são Queimaduras de 1º Grau?",
    text: "São as mais leves. Afetam apenas a camada superficial da pele (epiderme). Os sinais são vermelhidão, dor e inchaço leve, mas SEM bolhas.",
  },
];

// Lição 2: Prática - Casos de 1º Grau (Intro + Todas as perguntas)
export const lesson2 = [
  {
    type: "info",
    title: "Hora de Praticar!",
    text: "Vamos testar os seus conhecimentos sobre queimaduras de 1º grau.",
  },
  {
    type: "mcq",
    question: "Qual sinal NÃO pertence a uma queimadura de 1º grau?",
    options: [
      "Pele vermelha",
      "Bolhas com líquido",
      "Sensação de ardor",
      "Pele seca ao toque",
    ],
    answer: 1,
    correctFeedback:
      "Correto! As bolhas são características de queimaduras de 2º grau.",
    incorrectFeedback: "Lembre-se: queimaduras de 1º grau não formam bolhas.",
  },
  {
    type: "mcq",
    question:
      "Caso 1: Após um dia na praia, a pele dos ombros de uma pessoa está muito vermelha e dolorida, mas sem bolhas. Qual é o primeiro cuidado?",
    options: [
      "Passar vinagre",
      "Tomar um banho frio e aplicar hidratante",
      "Furar a pele para sair o calor",
      "Aplicar manteiga",
    ],
    answer: 1,
    correctFeedback:
      "Perfeito! Resfriar a pele e hidratar é o cuidado inicial para queimaduras de sol.",
    incorrectFeedback:
      "A resposta correta é tomar um banho frio. Mitos como vinagre ou manteiga podem piorar a irritação.",
  },
  {
    type: "mcq",
    question:
      "Caso 2: Ao tirar uma forma do forno, uma pessoa encosta rapidamente o braço na grade quente. A área fica vermelha. O que fazer imediatamente?",
    options: [
      "Colocar gelo sobre a marca",
      "Ignorar",
      "Lavar a área em água fria corrente por 15 minutos",
      "Passar borra de café",
    ],
    answer: 2,
    correctFeedback:
      "Correto! A água fria corrente é a ação mais eficaz para parar o dano do calor.",
    incorrectFeedback:
      "A melhor ação é lavar com água fria. Gelo pode causar mais danos à pele.",
  },
  {
    type: "mcq",
    question:
      "Caso 3: Uma criança derrama um pouco de chá morno na mão. A pele fica rosada. Qual ação está ERRADA?",
    options: [
      "Aplicar um creme com cortisona",
      "Assoprar o local",
      "Lavar com água fria",
      "Observar se surgem bolhas",
    ],
    answer: 0,
    correctFeedback:
      "Exato! Nunca se deve aplicar medicamentos sem prescrição médica.",
    incorrectFeedback:
      "A ação errada é aplicar um creme com cortisona sem orientação profissional.",
  },
  {
    type: "mcq",
    question:
      "Caso 4: Durante o churrasco, uma pessoa queima-se com uma brasa. Um amigo sugere passar pasta de dentes. Você deve:",
    options: [
      "Concordar",
      "Discordar e sugerir lavar com água fria",
      "Sugerir passar um bife gelado",
      "Não fazer nada",
    ],
    answer: 1,
    correctFeedback:
      "Ótimo! Pasta de dentes é um mito perigoso. A água é sempre a melhor opção.",
    incorrectFeedback:
      "A atitude correta é discordar. Pasta de dentes pode contaminar a ferida.",
  },
];

// Lição 3: Teoria - Queimaduras de 2º Grau
export const lesson3 = [
  {
    type: "info",
    title: "O que são Queimaduras de 2º Grau?",
    text: "São mais profundas, atingindo a epiderme e a derme. A principal característica é a formação de bolhas com líquido claro. São muito dolorosas.",
  },
];

// Lição 4: Prática - Casos de 2º Grau
export const lesson4 = [
  {
    type: "info",
    title: "Hora de Praticar!",
    text: "As bolhas são o ponto principal aqui. Vamos ver como agir.",
  },
  {
    type: "mcq",
    question:
      "Cenário: Uma pessoa derrama café a ferver no pé. A pele fica vermelha, inchada e com bolhas. Qual é o grau da queimadura?",
    options: ["1º Grau", "2º Grau", "3º Grau"],
    answer: 1,
    correctFeedback:
      "Exato! A presença de bolhas é o sinal clássico de uma queimadura de 2º grau.",
    incorrectFeedback:
      "A resposta correta é 2º Grau. O aparecimento de bolhas é o principal indicador.",
  },
  {
    type: "mcq",
    question:
      "Caso 1: Um cozinheiro queima a mão com óleo quente e uma grande bolha se forma. Qual é a regra de ouro sobre a bolha?",
    options: [
      "Estourar imediatamente",
      "Drenar o líquido com uma agulha",
      "Nunca estourar a bolha",
      "Cobrir com fita adesiva",
    ],
    answer: 2,
    correctFeedback:
      "Perfeito! A bolha é uma proteção biológica contra infeções e nunca deve ser rompida.",
    incorrectFeedback:
      "A regra mais importante é nunca estourar a bolha, pois ela protege a ferida de infeções.",
  },
  {
    type: "mcq",
    question:
      "Caso 2: Uma pessoa queima-se com um ferro de passar e surgem várias bolhas nos dedos. Esta situação exige avaliação médica?",
    options: [
      "Não, queimaduras pequenas saram sozinhas",
      "Apenas se a dor for insuportável",
      "Sim, pois afeta uma área crítica (mãos)",
      "Apenas se a pessoa tiver febre",
    ],
    answer: 2,
    correctFeedback:
      "Correto! Mãos, pés, rosto, etc., são áreas nobres. Queimaduras nesses locais precisam sempre de avaliação médica.",
    incorrectFeedback:
      "Sim, precisa de avaliação. Mãos são consideradas áreas críticas.",
  },
  {
    type: "mcq",
    question:
      "Caso 3: Após uma queimadura de 2º grau no braço, qual é a cobertura ideal para a ferida depois de a resfriar?",
    options: [
      "Algodão",
      "Gaze limpa ou um pano limpo, sem apertar",
      "Deixar a ferida aberta",
      "Folhas de bananeira",
    ],
    answer: 1,
    correctFeedback:
      "Isso mesmo! Uma cobertura limpa protege contra infeções sem grudar na ferida.",
    incorrectFeedback:
      "A melhor cobertura é uma gaze ou pano limpo. Algodão pode grudar na ferida.",
  },
  {
    type: "mcq",
    question:
      "Caso 4: Uma bolha de queimadura de 2º grau rompe-se acidentalmente. O que fazer?",
    options: [
      "Cortar a pele solta e aplicar álcool",
      "Lavar suavemente com água e sabão, cobrir com gaze",
      "Deixar a ferida aberta para secar",
      "Aplicar sal para desinfetar",
    ],
    answer: 1,
    correctFeedback:
      "Correto! A prioridade é manter a área limpa e protegida para evitar infeções.",
    incorrectFeedback:
      "Se a bolha se romper, deve-se lavar suavemente o local e cobrir. Nunca aplique álcool ou sal.",
  },
];

// Lição 5: Teoria - Queimaduras de 3º Grau
export const lesson5 = [
  {
    type: "info",
    title: "O que são Queimaduras de 3º Grau?",
    text: "São as mais graves e destroem todas as camadas da pele. A área pode parecer esbranquiçada, escura ou carbonizada. Surpreendentemente, pode haver pouca ou nenhuma dor, pois os nervos foram destruídos.",
  },
];

// Lição 6: Prática - Casos de 3º Grau
export const lesson6 = [
  {
    type: "info",
    title: "Hora de Praticar!",
    text: "Queimaduras de 3º grau são emergências. A sua ação rápida é crucial.",
  },
  {
    type: "mcq",
    question:
      "Uma característica da queimadura de 3º grau é a pouca ou nenhuma dor no local. Por quê?",
    options: [
      "Porque a pele está anestesiada pelo choque",
      "Porque os nervos da dor foram destruídos",
      "Porque o corpo liberta analgésicos",
      "Porque a dor só aparece horas depois",
    ],
    answer: 1,
    correctFeedback:
      "Correto. A destruição dos nervos é o motivo da ausência de dor.",
    incorrectFeedback:
      "A ausência de dor acontece porque a queimadura é tão profunda que destrói os nervos.",
  },
  {
    type: "mcq",
    question:
      "Caso 1: Numa fogueira, a roupa de uma pessoa pega fogo. Após apagar, a pele está preta e a pessoa não sente dor. Qual a ação IMEDIATA?",
    options: [
      "Tentar aliviar a dor",
      "Ligar para a emergência (192/193)",
      "Dar água à vítima",
      "Lavar a ferida",
    ],
    answer: 1,
    correctFeedback:
      "Exato! A vida da vítima depende de socorro médico especializado.",
    incorrectFeedback:
      "A prioridade absoluta em queimaduras graves é ligar para a emergência.",
  },
  {
    type: "mcq",
    question:
      "Caso 2: Vítima de incêndio com uma queimadura grande no braço. A manga da camisa está grudada na ferida. O que fazer?",
    options: [
      "Puxar a roupa com força",
      "Deixar a roupa como está e cobrir com pano limpo",
      "Tentar cortar a roupa",
      "Jogar água fria sobre a roupa",
    ],
    answer: 1,
    correctFeedback: "Perfeito! Nunca se deve remover tecidos grudados.",
    incorrectFeedback:
      "Nunca se deve puxar roupas grudadas, pois isso pode arrancar a pele.",
  },
  {
    type: "mcq",
    question:
      "Caso 3: Uma pessoa sofre uma queimadura extensa nas costas. O que NÃO se deve fazer enquanto se espera pela ajuda?",
    options: [
      "Manter a pessoa calma e aquecida",
      "Cobrir a lesão com um pano limpo e seco",
      "Aplicar pomadas ou gelo na queimadura",
      "Verificar a respiração",
    ],
    answer: 2,
    correctFeedback:
      "Correto! Aplicar qualquer produto pode interferir no tratamento e o gelo pode causar hipotermia.",
    incorrectFeedback:
      "A resposta é não aplicar pomadas ou gelo. Gelo pode causar choque térmico.",
  },
  {
    type: "mcq",
    question:
      "Caso 4: Uma queimadura de 3º grau é considerada muito grave se estiver localizada em qual área?",
    options: ["Ombro", "Rosto ou pescoço", "Barriga", "Canela"],
    answer: 1,
    correctFeedback:
      "Isso mesmo! Queimaduras no rosto e pescoço podem afetar as vias respiratórias.",
    incorrectFeedback:
      "Rosto e pescoço são áreas críticas. O inchaço pode bloquear a respiração.",
  },
];

// Lição 7: Teoria - Queimaduras Químicas
export const lesson7 = [
  {
    type: "info",
    title: "O que são Queimaduras Químicas?",
    text: "São causadas por contacto com produtos corrosivos, como ácidos ou bases fortes (soda cáustica, produtos de limpeza industrial). Podem causar danos graves rapidamente.",
  },
];

// Lição 8: Prática - Casos de Queimaduras Químicas
export const lesson8 = [
  {
    type: "info",
    title: "Hora de Praticar!",
    text: "A rapidez e o método de limpeza são vitais nestes casos.",
  },
  {
    type: "mcq",
    question:
      "Cenário: Alguém derrama um produto de limpeza forte na mão. Que tipo de queimadura é esta?",
    options: ["Térmica", "Elétrica", "Química", "Por Fricção"],
    answer: 2,
    correctFeedback: "Correto! O agente causador foi uma substância química.",
    incorrectFeedback:
      "Como a causa foi um produto de limpeza, trata-se de uma queimadura química.",
  },
  {
    type: "mcq",
    question:
      "Caso 1: Um produto de limpeza líquido e corrosivo cai no braço de uma pessoa. Qual é o primeiro passo?",
    options: [
      "Aplicar um creme neutralizante",
      "Lavar com água corrente por pelo menos 20 minutos",
      "Secar o produto com uma toalha",
      "Esperar para ver se a pele reage",
    ],
    answer: 1,
    correctFeedback:
      "Exato! A lavagem prolongada com água é crucial para diluir e remover o produto.",
    incorrectFeedback: "A resposta correta é lavar abundantemente com água.",
  },
  {
    type: "mcq",
    question:
      "Caso 2: Um saco de cimento em pó rasga e cai sobre a perna de um trabalhador. Qual é a sequência correta?",
    options: [
      "Lavar com água e depois escovar",
      "Escovar o pó primeiro e depois lavar com muita água",
      "Aplicar um pano húmido",
      "Não fazer nada e ir para o hospital",
    ],
    answer: 1,
    correctFeedback:
      "Perfeito! Escovar o pó primeiro é um passo de segurança essencial.",
    incorrectFeedback:
      "Com produtos em pó, primeiro deve-se escovar para remover o excesso.",
  },
  {
    type: "mcq",
    question:
      "Caso 3: Respinga um produto químico nos olhos de alguém. Como se deve lavar os olhos?",
    options: [
      "Com a cabeça inclinada para trás",
      "Com a cabeça inclinada para o lado do olho afetado",
      "Esfregar com um pano molhado",
      "Pingar leite nos olhos",
    ],
    answer: 1,
    correctFeedback:
      "Correto! Inclinar a cabeça para o lado evita que a água contaminada escorra para o olho saudável.",
    incorrectFeedback:
      "A posição correta é inclinar a cabeça para o lado do olho afetado.",
  },
  {
    type: "mcq",
    question:
      'Caso 4: Alguém queima-se com um ácido. Um colega sugere aplicar uma base para "neutralizar". Por que esta é uma ideia perigosa?',
    options: [
      "Porque não funciona",
      "Porque a reação química gera calor e piora a queimadura",
      "Porque a base é mais cara",
      "Porque mancha a pele",
    ],
    answer: 1,
    correctFeedback:
      "Exato! A reação entre um ácido e uma base forte gera calor, podendo causar uma segunda queimadura.",
    incorrectFeedback:
      "Tentar neutralizar um químico com outro causa uma reação que liberta muito calor.",
  },
];

// Lição 9: Teoria - Queimaduras Elétricas
export const lesson9 = [
  {
    type: "info",
    title: "O que são Queimaduras Elétricas?",
    text: "Causadas por uma corrente elétrica que passa pelo corpo. O perigo é que os danos internos podem ser muito piores do que as pequenas marcas visíveis na pele.",
  },
];

// Lição 10: Prática - Casos de Queimaduras Elétricas
export const lesson10 = [
  {
    type: "info",
    title: "Hora de Praticar!",
    text: "A sua segurança é a prioridade número um ao lidar com eletricidade.",
  },
  {
    type: "mcq",
    question: "Qual é o maior perigo oculto de uma queimadura elétrica?",
    options: [
      "A dor intensa",
      "A cicatriz na pele",
      "Lesões internas e paragem cardíaca",
      "O risco de infeção",
    ],
    answer: 2,
    correctFeedback:
      "Exato. A corrente elétrica pode causar arritmias fatais e destruir tecidos por onde passa.",
    incorrectFeedback:
      "A eletricidade pode afetar o ritmo do coração e causar danos internos graves.",
  },
  {
    type: "mcq",
    question:
      "Caso 1: Você vê alguém a sofrer um choque elétrico num fio caído. Qual é a sua prioridade absoluta?",
    options: [
      "Verificar a respiração",
      "Gritar por ajuda",
      "Garantir a sua segurança, não se aproximando",
      "Puxar a vítima com um pau",
    ],
    answer: 2,
    correctFeedback:
      "Correto! A sua segurança vem em primeiro lugar. Ligar para a emergência e manter a distância é a única ação segura.",
    incorrectFeedback:
      "A regra número um é não se tornar outra vítima. Mantenha distância e chame a emergência.",
  },
  {
    type: "mcq",
    question:
      "Caso 2: Após desligar a energia, a vítima de choque está inconsciente e não respira. O que fazer IMEDIATAMENTE?",
    options: [
      "Limpar as queimaduras",
      "Ligar para a emergência e iniciar RCP",
      "Colocar a vítima de lado",
      "Dar água à vítima",
    ],
    answer: 1,
    correctFeedback:
      "Perfeito! Numa vítima que não respira, a prioridade máxima é ligar para a emergência e começar a RCP.",
    incorrectFeedback:
      "Vítima inconsciente e sem respirar é o cenário mais grave. Chamar ajuda e iniciar a RCP pode salvar a vida dela.",
  },
  {
    type: "mcq",
    question:
      "Caso 3: Uma criança coloca um garfo numa tomada. Após desligar o disjuntor, a criança está a chorar, mas consciente. Há uma pequena marca preta no dedo. O que fazer?",
    options: [
      "Dar um analgésico e observar",
      "Apenas lavar o dedo com água",
      "Levar ao hospital para avaliação médica",
      "Passar uma pomada",
    ],
    answer: 2,
    correctFeedback:
      "Isso mesmo! Toda a queimadura elétrica exige avaliação médica devido ao risco de danos internos.",
    incorrectFeedback:
      "Toda queimadura elétrica precisa ser avaliada por um médico.",
  },
  {
    type: "mcq",
    question:
      "Caso 4: Uma queimadura elétrica deixa marcas na mão e no pé. O que isto indica?",
    options: [
      "Que a queimadura foi superficial",
      "Que a corrente entrou pela mão e saiu pelo pé",
      "Que a vítima tocou em dois pontos",
      "Que a queimadura não é grave",
    ],
    answer: 1,
    correctFeedback:
      "Exato! As marcas de entrada e saída indicam que a eletricidade atravessou o corpo.",
    incorrectFeedback:
      "As duas marcas indicam o caminho que a corrente fez pelo corpo, aumentando o risco de lesões internas.",
  },
];
