import { RemoteModule } from "../services/lessonService";

type OfflineModulesMap = Record<string, RemoteModule[]>;

const buildSequence = (order: string[]): { orderOptions: string[]; correctOrder: string[] } => ({
  orderOptions: order.slice(0, 4),
  correctOrder: order.slice(0, 4),
});

export const offlineCourseModules: OfflineModulesMap = {
  engasgo: [
    {
      id: "engasgo-basico",
      title: "Engasgo: Básico",
      color: "#16a34a",
      icon: "FlaskIcon",
      order: 1,
      lessons: [
        {
          type: "info",
          title: "O que é engasgo",
          text: "Entrada de ar bloqueada por alimento ou objeto. Pode ser parcial (tosse eficaz) ou total (sem som, sem ar).",
        },
        {
          type: "info",
          title: "Sinais",
          text: "Tosse fraca ou ausente, mão no pescoço, lábios arroxeando, não consegue falar.",
        },
        {
          type: "mcq",
          question: "Qual sinal indica engasgo grave?",
          options: [
            "Tosse forte e fala normal",
            "Consegue falar frases curtas",
            "Não consegue emitir som e fica roxo",
            "Dor leve ao engolir",
          ],
          answer: 2,
          correctFeedback: "Sem som + cianose = obstrucao total.",
          incorrectFeedback: "Se não há som e há cianose, é emergencial.",
        },
        {
          type: "mcq",
          question: "O que NÃO fazer?",
          options: [
            "Enfiar os dedos às cegas na garganta",
            "Pedir para tossir se for leve",
            "Chamar ajuda se piorar",
            "Aplicar tapas se não sair",
          ],
          answer: 0,
          correctFeedback: "Não faça varredura cega: pode empurrar o objeto.",
          incorrectFeedback: "Varredura cega piora a obstrução.",
        },
      ],
    },
    {
      id: "engasgo-procedimento",
      title: "Engasgo: Procedimento",
      color: "#16a34a",
      icon: "ZapIcon",
      order: 2,
      lessons: [
        {
          type: "info",
          title: "Adulto consciente",
          text: "Peça para tossir. Se não sai, faça 5 tapas interescapulares e 5 compressões abdominais, alternando.",
        },
        {
          type: "sequence",
          question: "Adulto consciente: ordene os passos",
          correctFeedback: "Tapas + compressões alternadas até expulsar ou desmaiar.",
          incorrectFeedback: "Siga a ordem: avaliar, tapas, compressões, repetir.",
          ...buildSequence([
            "Avalie se consegue tossir/falar",
            "Incline o tronco e faça 5 tapas nas escápulas",
            "Faça 5 compressões abdominais (Heimlich)",
            "Alterne tapas e compressões até sair ou desmaiar",
          ]),
        },
        {
          type: "mcq",
          question: "Criança maior de 1 ano: o que muda?",
          options: [
            "Use apenas compressões abdominais",
            "Tapas + compressões, mas com menor força e joelhos flexionados",
            "Somente tapas ate sair",
            "Deite a criança antes de agir",
          ],
          answer: 1,
          correctFeedback: "Mesma lógica, só ajuste a força e a postura.",
          incorrectFeedback: "Mantenha tapas + compressões com menos força.",
        },
        {
          type: "mcq",
          question: "Bebê (<1 ano): qual sequência correta?",
          options: [
            "Tapas nas costas e compressões toracicas (2 dedos) alternadas",
            "Compressões abdominais com forca",
            "Chacoalhar ate tossir",
            "Dar água para empurrar",
          ],
          answer: 0,
          correctFeedback: "Bebê: 5 tapas + 5 compressões torácicas com 2 dedos.",
          incorrectFeedback: "Evite compressão abdominal em bebês.",
        },
      ],
    },
    {
      id: "engasgo-contexto",
      title: "Engasgo: Contexto",
      color: "#16a34a",
      icon: "ThermometerIcon",
      order: 3,
      lessons: [
        {
          type: "info",
          title: "Escola",
          text: "Manter criança sentada ou inclinada para frente, pedir silêncio para ouvir respiração e acionar responsável.",
        },
        {
          type: "info",
          title: "Restaurante",
          text: "Afaste cadeira, fique em pé atrás da vítima, peça alguém para ligar 192 enquanto você atua.",
        },
        {
          type: "mcq",
          question: "Em casa sozinho com a vítima: o que priorizar?",
          options: [
            "Ir buscar água",
            "Aplicar tapas/compressões e acionar o 192 no viva-voz",
            "Esperar melhorar sozinho",
            "Colocar de cabeça para baixo",
          ],
          answer: 1,
          correctFeedback: "Atue e peça ajuda simultânea pelo viva-voz.",
          incorrectFeedback: "Ajuda imediata + manobras salvam tempo.",
        },
      ],
    },
    {
      id: "engasgo-decisao",
      title: "Engasgo: Decisão",
      color: "#16a34a",
      icon: "ZapIcon",
      order: 4,
      lessons: [
        {
          type: "mcq",
          question: "Quando ligar para o SAMU (192)?",
          options: [
            "Somente se a pessoa desmaiar",
            "Se não consegue tossir/falar ou sinais de cianose",
            "Depois que expulsar o objeto",
            "Nunca durante as manobras",
          ],
          answer: 1,
          correctFeedback: "Acione cedo quando ha obstrucao grave.",
          incorrectFeedback: "Sem ar = ligar 192 enquanto atua.",
        },
        {
          type: "mcq",
          question: "A vítima desmaiou: o que fazer primeiro?",
          options: [
            "Continuar tapas",
            "Chamar por ajuda, deitar no chão, abrir vias aéreas e checar respiração",
            "Dar água com acucar",
            "Levantar a cabeça",
          ],
          answer: 1,
          correctFeedback: "Verifique respiração para decidir RCP.",
          incorrectFeedback: "Precisa checar respiração imediatamente.",
        },
        {
          type: "sequence",
          question: "Se não respira: inicie RCP (ordene)",
          correctFeedback: "Inicie RCP e acione o 192.",
          incorrectFeedback: "Abra vias aéreas, compressões e ventilações na ordem.",
          ...buildSequence([
            "Abra vias aéreas",
            "Cheque respiração por até 10s",
            "30 compressões a 100-120/min",
            "2 ventilações se souber, repetir 30:2",
          ]),
        },
      ],
    },
  ],
  primeirosSocorros: [
    {
      id: "fundamentos-socorro",
      title: "Fundamentos do Socorro",
      color: "#dc2626",
      icon: "FlaskIcon",
      order: 0.1,
      lessons: [
        {
          type: "mcq",
          question: "Qual é o objetivo principal dos primeiros socorros?",
          options: [
            "Substituir o atendimento médico",
            "Estabilizar e ganhar tempo até ajuda especializada",
            "Realizar cirurgias simples",
            "Transportar a vítima imediatamente",
          ],
          answer: 1,
          correctFeedback: "Primeiros socorros estabilizam e protegem até o suporte avançado chegar.",
          incorrectFeedback: "O foco é estabilizar e ganhar tempo até ajuda especializada.",
        },
        {
          type: "mcq",
          question: "Quando NÃO intervir?",
          options: [
            "Cena insegura ou risco elétrico/fogo",
            "Quando a vítima pede ajuda",
            "Quando há sangramento leve",
            "Quando há fratura fechada",
          ],
          answer: 0,
          correctFeedback: "Sua segurança vem primeiro; não entre em cena insegura.",
          incorrectFeedback: "Se a cena é insegura, chame ajuda e não entre.",
        },
      ],
    },
    {
      id: "avaliacao-abc",
      title: "Avaliação ABC",
      color: "#dc2626",
      icon: "ThermometerIcon",
      order: 0.2,
      lessons: [
        {
          type: "sequence",
          question: "Organize o ABC",
          correctFeedback: "Siga A-B-C: vias aéreas, respiração, circulação.",
          incorrectFeedback: "Priorize vias aéreas, respiração e circulação nessa ordem.",
          orderOptions: ["Checar vias aéreas", "Verificar respiração", "Avaliar circulação/pulso"],
          correctOrder: ["Checar vias aéreas", "Verificar respiração", "Avaliar circulação/pulso"],
        },
        {
          type: "mcq",
          question: "O que é avaliação primária?",
          options: [
            "Checar sinais vitais completos",
            "Identificar riscos imediatos à vida (A-B-C)",
            "Medir pressão arterial",
            "Examinar todo o corpo",
          ],
          answer: 1,
          correctFeedback: "Avaliação primária foca em A-B-C e riscos imediatos.",
          incorrectFeedback: "Avaliação primária foca em A-B-C e riscos imediatos.",
        },
      ],
    },
    {
      id: "pcr-basics",
      title: "Parada Cardiorrespiratória",
      color: "#dc2626",
      icon: "ZapIcon",
      order: 0.3,
      lessons: [
        {
          type: "mcq",
          question: "Qual sinal indica PCR?",
          options: [
            "Pulso fraco e dor torácica",
            "Ausência de respiração normal e ausência de pulso",
            "Respiração rápida e sudorese",
            "Pressão alta",
          ],
          answer: 1,
          correctFeedback: "PCR = sem respiração normal e sem pulso.",
          incorrectFeedback: "PCR é ausência de respiração normal e pulso.",
        },
        {
          type: "mcq",
          question: "Revezamento de socorristas nas compressões:",
          options: [
            "Nunca trocar",
            "Trocar a cada 2 minutos ou quando cansar",
            "Trocar a cada 10 compressões",
            "Trocar só após 10 minutos",
          ],
          answer: 1,
          correctFeedback: "Troque a cada 2 minutos para manter qualidade.",
          incorrectFeedback: "Revezar a cada 2 minutos mantém compressões eficazes.",
        },
      ],
    },
    {
      id: "dea-basics",
      title: "Uso do DEA",
      color: "#dc2626",
      icon: "FlaskIcon",
      order: 0.4,
      lessons: [
        {
          type: "mcq",
          question: "Quando usar o DEA?",
          options: [
            "Em PCR, após iniciar compressões",
            "Somente se houver médico",
            "Apenas em crianças",
            "Nunca em locais públicos",
          ],
          answer: 0,
          correctFeedback: "Use o DEA em PCR assim que disponível, após iniciar compressões.",
          incorrectFeedback: "DEA deve ser usado em PCR o quanto antes.",
        },
        {
          type: "mcq",
          question: "O que fazer durante a análise do DEA?",
          options: [
            "Continuar compressões",
            "Ninguém toca na vítima",
            "Retirar as pás",
            "Dar ventilação",
          ],
          answer: 1,
          correctFeedback: "Durante análise/choque, ninguém toca a vítima.",
          incorrectFeedback: "Durante análise/choque, afaste todos do contato.",
        },
      ],
    },
    {
      id: "hemorragias-ferimentos",
      title: "Hemorragias e Ferimentos",
      color: "#dc2626",
      icon: "ThermometerIcon",
      order: 0.5,
      lessons: [
        {
          type: "mcq",
          question: "Conduta inicial em sangramento intenso?",
          options: [
            "Lavar com muita água",
            "Compressão direta e firme",
            "Aplicar gelo direto",
            "Esperar parar sozinho",
          ],
          answer: 1,
          correctFeedback: "Compressão direta controla a maioria das hemorragias.",
          incorrectFeedback: "Use compressão direta firme para controlar o sangramento.",
        },
        {
          type: "mcq",
          question: "Torniquete: quando considerar?",
          options: [
            "Sangramento leve",
            "Hemorragia grave que não cessa com compressão",
            "Sempre em cortes pequenos",
            "Nunca",
          ],
          answer: 1,
          correctFeedback: "Torniquete é último recurso em hemorragia grave sem resposta à compressão.",
          incorrectFeedback: "Use torniquete só se compressão direta não controlar sangramento grave.",
        },
      ],
    },
    {
      id: "choque",
      title: "Choque",
      color: "#dc2626",
      icon: "ZapIcon",
      order: 0.6,
      lessons: [
        {
          type: "mcq",
          question: "Sinal comum de choque hipovolêmico?",
          options: [
            "Pele fria e pálida",
            "Pele quente e seca",
            "Pressão normal",
            "Pulso forte",
          ],
          answer: 0,
          correctFeedback: "Hipovolêmico: pele fria/pálida e pulso fraco.",
          incorrectFeedback: "Choque hipovolêmico costuma ter pele fria e pálida.",
        },
        {
          type: "mcq",
          question: "Posição antichoque recomendada:",
          options: [
            "De pé",
            "Deitado com pernas elevadas (se não houver trauma)",
            "Sentado",
            "De bruços",
          ],
          answer: 1,
          correctFeedback: "Elevar pernas ajuda retorno venoso, se não houver suspeita de trauma.",
          incorrectFeedback: "Eleve as pernas se não houver contraindicação por trauma.",
        },
      ],
    },
    {
      id: "desmaio-malsubito",
      title: "Desmaio e Mal Súbito",
      color: "#dc2626",
      icon: "FlaskIcon",
      order: 0.7,
      lessons: [
        {
          type: "mcq",
          question: "Após desmaio recuperado, o que fazer?",
          options: [
            "Levantar rápido",
            "Deixar deitado, observar, oferecer água se consciente",
            "Forçar caminhada",
            "Dar café",
          ],
          answer: 1,
          correctFeedback: "Deixe deitado, observe e ofereça água se estiver bem.",
          incorrectFeedback: "Observe deitado e hidrate se estiver consciente e bem.",
        },
        {
          type: "mcq",
          question: "Quando é grave?",
          options: [
            "Desmaio isolado breve",
            "Queda com trauma, dor no peito, ou não desperta",
            "Dormir logo após",
            "Suar frio antes",
          ],
          answer: 1,
          correctFeedback: "Sinais graves: trauma, dor no peito, não despertar.",
          incorrectFeedback: "Desmaio com trauma/dor no peito exige avaliação urgente.",
        },
      ],
    },
    {
      id: "emerg-respiratorias",
      title: "Emergências Respiratórias",
      color: "#dc2626",
      icon: "ZapIcon",
      order: 0.8,
      lessons: [
        {
          type: "mcq",
          question: "Crise asmática: conduta inicial?",
          options: [
            "Deitar a pessoa",
            "Usar broncodilatador prescrito e acalmar",
            "Tapar a boca",
            "Dar água gelada",
          ],
          answer: 1,
          correctFeedback: "Ajude a usar a medicação prescrita e mantenha calma.",
          incorrectFeedback: "Broncodilatador prescrito e calma ajudam na crise.",
        },
        {
          type: "mcq",
          question: "Parada respiratória: o que fazer?",
          options: [
            "Esperar voltar",
            "Abrir vias aéreas e iniciar RCP",
            "Só ventilar",
            "Virar de lado e aguardar",
          ],
          answer: 1,
          correctFeedback: "Sem respiração = abrir vias aéreas e iniciar RCP.",
          incorrectFeedback: "Sem respiração, abra vias aéreas e inicie RCP.",
        },
      ],
    },
    {
      id: "traumas-osseo",
      title: "Traumas e Lesões Ósseas",
      color: "#dc2626",
      icon: "FlaskIcon",
      order: 0.9,
      lessons: [
        {
          type: "mcq",
          question: "Fratura suspeita: primeira ação?",
          options: [
            "Realinhar rapidamente",
            "Imobilizar na posição encontrada",
            "Fazer a pessoa caminhar",
            "Massagear",
          ],
          answer: 1,
          correctFeedback: "Imobilize como está e procure avaliação.",
          incorrectFeedback: "Imobilize na posição encontrada e evite movimentar.",
        },
        {
          type: "mcq",
          question: "Suspeita de lesão na coluna:",
          options: [
            "Mover rápido para conforto",
            "Imobilizar cabeça/pescoço e não mover",
            "Sentar a vítima",
            "Levantar para checar costas",
          ],
          answer: 1,
          correctFeedback: "Proteja coluna e não movimente até socorro.",
          incorrectFeedback: "Imobilize e evite qualquer movimento do pescoço/coluna.",
        },
      ],
    },
    {
      id: "quedas-acidentes",
      title: "Quedas e Acidentes",
      color: "#dc2626",
      icon: "ThermometerIcon",
      order: 1.0,
      lessons: [
        {
          type: "mcq",
          question: "Queda de altura: o que observar?",
          options: [
            "Somente dor local",
            "Mecanismo de trauma, consciência e dor na coluna",
            "Apenas hematomas",
            "Apenas cortes",
          ],
          answer: 1,
          correctFeedback: "Altura sugere trauma importante; avalie coluna e consciência.",
          incorrectFeedback: "Queda de altura pede avaliação de coluna e consciência.",
        },
        {
          type: "mcq",
          question: "Acidente doméstico comum:",
          options: [
            "Queimaduras com água quente",
            "Queda de raio",
            "Ataque animal selvagem",
            "Colisão de carro",
          ],
          answer: 0,
          correctFeedback: "Queimaduras em cozinha são frequentes.",
          incorrectFeedback: "Queimaduras domésticas são comuns; atenção ao cuidado.",
        },
      ],
    },
    {
      id: "afogamento",
      title: "Afogamento",
      color: "#dc2626",
      icon: "ZapIcon",
      order: 1.1,
      lessons: [
        {
          type: "mcq",
          question: "Após retirar a vítima da água, primeiro:",
          options: [
            "Virar de bruços",
            "Checar respiração e responsividade",
            "Dar água",
            "Corrê-la",
          ],
          answer: 1,
          correctFeedback: "Checar respiração/consciência define RCP ou recuperação.",
          incorrectFeedback: "Após retirada, avalie consciência e respiração imediatamente.",
        },
        {
          type: "mcq",
          question: "Erro comum no afogamento:",
          options: [
            "Remover da água com cuidado",
            "Fazer RCP se necessário",
            "Deixar sozinho para observar",
            "Acionar emergência",
          ],
          answer: 2,
          correctFeedback: "Nunca deixe sozinho; risco de complicação tardia.",
          incorrectFeedback: "Não deixe sozinho; observe e acione emergência.",
        },
      ],
    },
    {
      id: "intoxicacoes",
      title: "Intoxicações",
      color: "#dc2626",
      icon: "FlaskIcon",
      order: 1.2,
      lessons: [
        {
          type: "mcq",
          question: "Ingestão de produto tóxico: o que NÃO fazer?",
          options: [
            "Induzir vômito sem orientação",
            "Acionar centro toxicológico",
            "Guardar o rótulo",
            "Observar sinais",
          ],
          answer: 0,
          correctFeedback: "Não induza vômito sem orientação especializada.",
          incorrectFeedback: "Evite induzir vômito sem orientação médica/toxicológica.",
        },
        {
          type: "mcq",
          question: "Contato com produto químico na pele:",
          options: [
            "Lavar com água corrente abundante",
            "Cobrir e esperar",
            "Aplicar pomada gordurosa",
            "Usar gelo",
          ],
          answer: 0,
          correctFeedback: "Lave com água corrente em abundância para remover o agente.",
          incorrectFeedback: "Lavar bastante com água é a primeira medida.",
        },
      ],
    },
    {
      id: "emerg-clinicas",
      title: "Emergências Clínicas",
      color: "#dc2626",
      icon: "ThermometerIcon",
      order: 1.3,
      lessons: [
        {
          type: "mcq",
          question: "Sinal de infarto típico:",
          options: [
            "Dor torácica em aperto irradiando",
            "Coceira localizada",
            "Nariz entupido",
            "Dor de ouvido",
          ],
          answer: 0,
          correctFeedback: "Dor em aperto irradiada é sugestiva de infarto.",
          incorrectFeedback: "Dor torácica em aperto/irradiação sugere infarto.",
        },
        {
          type: "mcq",
          question: "Hipoglicemia: conduta se consciente?",
          options: [
            "Aplicar insulina",
            "Oferecer carboidrato rápido (açúcar/suco)",
            "Deitar e esperar",
            "Dar água apenas",
          ],
          answer: 1,
          correctFeedback: "Carboidrato rápido reverte hipoglicemia em consciente.",
          incorrectFeedback: "Ofereça açúcar/suco se a pessoa estiver consciente.",
        },
      ],
    },
    {
      id: "acidentes-eletricos",
      title: "Acidentes Elétricos",
      color: "#dc2626",
      icon: "ZapIcon",
      order: 1.4,
      lessons: [
        {
          type: "mcq",
          question: "Primeiro passo ao ver vítima energizada:",
          options: [
            "Tocá-la rapidamente",
            "Desligar a fonte ou afastar com material não condutor",
            "Puxar pelo braço",
            "Jogar água",
          ],
          answer: 1,
          correctFeedback: "Interrompa a energia com segurança antes de tocar a vítima.",
          incorrectFeedback: "Corte a energia ou afaste com material isolante antes de tocar.",
        },
        {
          type: "mcq",
          question: "Por que chamar emergência após choque?",
          options: [
            "Para ganhar atestado",
            "Risco de arritmia e lesão interna",
            "Porque sempre precisa cirurgia",
            "Para registrar ocorrência",
          ],
          answer: 1,
          correctFeedback: "Choque pode causar arritmia/lesão interna; avaliação é importante.",
          incorrectFeedback: "Há risco de arritmia e lesão interna após choque elétrico.",
        },
      ],
    },
    {
      id: "temperatura",
      title: "Temperatura Corporal",
      color: "#dc2626",
      icon: "FlaskIcon",
      order: 1.5,
      lessons: [
        {
          type: "mcq",
          question: "Sinal de hipotermia leve:",
          options: [
            "Tremores e pele fria",
            "Pele quente e seca",
            "Frequência cardíaca alta e pele seca",
            "Dor abdominal",
          ],
          answer: 0,
          correctFeedback: "Hipotermia leve apresenta tremores e pele fria.",
          incorrectFeedback: "Tremores e pele fria indicam hipotermia leve.",
        },
        {
          type: "mcq",
          question: "Conduta em insolação:",
          options: [
            "Resfriar, sombra e hidratar se consciente",
            "Cobrir com plástico",
            "Imobilizar e não resfriar",
            "Dar café quente",
          ],
          answer: 0,
          correctFeedback: "Resfriar, sombra e hidratar (se consciente) são essenciais.",
          incorrectFeedback: "Resfriamento e hidratação são prioridade na insolação.",
        },
      ],
    },
    {
      id: "emerg-pediatricas",
      title: "Emergências Pediátricas",
      color: "#dc2626",
      icon: "ThermometerIcon",
      order: 1.6,
      lessons: [
        {
          type: "mcq",
          question: "Queda em criança: o que observar?",
          options: [
            "Tamanho do brinquedo",
            "Alteração de consciência, vômitos, choro inconsolável",
            "Se sujou a roupa",
            "Se está com fome",
          ],
          answer: 1,
          correctFeedback: "Sinais neurológicos após queda exigem atenção médica.",
          incorrectFeedback: "Consciência, vômitos ou choro inconsolável são sinais de alerta.",
        },
        {
          type: "mcq",
          question: "Afogamento infantil:",
          options: [
            "Sempre leve ao médico, mesmo se recuperou bem",
            "Se parece bem, ignore",
            "Só observe em casa",
            "Dar leite",
          ],
          answer: 0,
          correctFeedback: "Afogamento infantil exige avaliação médica mesmo após melhora.",
          incorrectFeedback: "Mesmo recuperada, a criança precisa avaliação após afogamento.",
        },
      ],
    },
    {
      id: "emerg-idosos",
      title: "Emergências em Idosos",
      color: "#dc2626",
      icon: "ZapIcon",
      order: 1.7,
      lessons: [
        {
          type: "mcq",
          question: "Queda em idoso: risco maior por:",
          options: [
            "Massa muscular alta",
            "Medicamentos e osteoporose",
            "Recuperação rápida",
            "Pele resistente",
          ],
          answer: 1,
          correctFeedback: "Medicamentos e osteoporose aumentam risco de complicações.",
          incorrectFeedback: "Idosos têm mais risco por osteoporose e uso de medicamentos.",
        },
        {
          type: "mcq",
          question: "Sinal de alerta em idosos:",
          options: [
            "Confusão súbita ou alteração de consciência",
            "Apetite aumentado",
            "Sono normal",
            "Pressão estável",
          ],
          answer: 0,
          correctFeedback: "Confusão súbita exige avaliação urgente.",
          incorrectFeedback: "Confusão ou alteração de consciência é sinal de alerta.",
        },
      ],
    },
    {
      id: "psicologico",
      title: "Aspectos Psicológicos",
      color: "#dc2626",
      icon: "FlaskIcon",
      order: 1.8,
      lessons: [
        {
          type: "mcq",
          question: "Controle emocional do socorrista:",
          options: [
            "Transmitir calma e falar simples",
            "Gritar comandos",
            "Fingir que não se importa",
            "Ignorar vítima",
          ],
          answer: 0,
          correctFeedback: "Comunicação calma e simples ajuda a vítima.",
          incorrectFeedback: "Transmita calma e use linguagem simples.",
        },
        {
          type: "mcq",
          question: "Pânico coletivo: como agir?",
          options: [
            "Gerar mais urgência",
            "Organizar, dar instruções curtas e seguras",
            "Deixar todos correrem",
            "Sair sem avisar",
          ],
          answer: 1,
          correctFeedback: "Organize e dê instruções curtas para reduzir pânico.",
          incorrectFeedback: "Instruções curtas e organização reduzem o pânico coletivo.",
        },
      ],
    },
    {
      id: "legal-etico",
      title: "Aspectos Legais e Éticos",
      color: "#dc2626",
      icon: "ZapIcon",
      order: 1.9,
      lessons: [
        {
          type: "mcq",
          question: "Dever de socorro significa:",
          options: [
            "Obrigação de resolver tudo",
            "Oferecer ajuda compatível e acionar emergência",
            "Ignorar se não conhece a vítima",
            "Assumir responsabilidade médica",
          ],
          answer: 1,
          correctFeedback: "Prestar ajuda compatível e chamar emergência quando necessário.",
          incorrectFeedback: "Ajude dentro do que sabe e acione emergência.",
        },
        {
          type: "mcq",
          question: "Consentimento:",
          options: [
            "Nunca é necessário",
            "Importa quando vítima está consciente",
            "Só para médicos",
            "Só em hospital",
          ],
          answer: 1,
          correctFeedback: "Se consciente, peça permissão antes de ajudar.",
          incorrectFeedback: "Peça permissão se a vítima estiver consciente.",
        },
      ],
    },
    {
      id: "prevencao",
      title: "Organização e Prevenção",
      color: "#dc2626",
      icon: "ThermometerIcon",
      order: 2.0,
      lessons: [
        {
          type: "mcq",
          question: "Kit de primeiros socorros básico inclui:",
          options: [
            "Gaze, luvas, tesoura, antisséptico",
            "Serra elétrica",
            "Alimentos perecíveis",
            "Remédios controlados",
          ],
          answer: 0,
          correctFeedback: "Gaze, luvas, tesoura e antisséptico são itens essenciais.",
          incorrectFeedback: "Um kit básico tem gaze, luvas, tesoura e antisséptico.",
        },
        {
          type: "mcq",
          question: "Prevenção em casa:",
          options: [
            "Deixar produtos tóxicos ao alcance",
            "Guardar químicos fora do alcance e sinalizar riscos",
            "Manter fios soltos",
            "Tapar saídas",
          ],
          answer: 1,
          correctFeedback: "Guarde químicos e sinalize riscos para prevenir acidentes.",
          incorrectFeedback: "Guarde químicos e sinalize riscos para evitar acidentes.",
        },
      ],
    },
    {
      id: "avaliação-inicial",
      title: "Primeiros Socorros: Avaliação",
      color: "#dc2626",
      icon: "FlaskIcon",
      order: 1,
      lessons: [
        {
          type: "info",
          title: "Segurança da cena",
          text: "Olhe riscos (fogo, trânsito, fios). Só se aproxime se estiver seguro.",
        },
        {
          type: "mcq",
          question: "Chegando na vítima consciente, o que fazer primeiro?",
          options: [
            "Dar água",
            "Apresentar-se, explicar ajuda e perguntar nome",
            "Mover a vítima imediatamente",
            "Pedir para levantar",
          ],
          answer: 1,
          correctFeedback: "Apresente-se e ganhe confiança enquanto avalia.",
          incorrectFeedback: "Primeiro contato orienta a avaliação.",
        },
        {
          type: "sequence",
          question: "Sequência rápida de avaliação",
          correctFeedback: "Avalie, acione ajuda cedo, priorize ABC.",
          incorrectFeedback: "Use a ordem: segurança, consciência, respiração.",
          ...buildSequence([
            "Verifique segurança",
            "Avalie responsividade (chame, toque)",
            "Ligue 192 se não responde",
            "Cheque respiração e aja",
          ]),
        },
      ],
    },
    {
      id: "rcp-essencial",
      title: "Primeiros Socorros: RCP",
      color: "#dc2626",
      icon: "ZapIcon",
      order: 2,
      lessons: [
        {
          type: "info",
          title: "Quando iniciar RCP",
          text: "Inconsciente + não respira ou respiração agônica. Inicie imediatamente.",
        },
        {
          type: "sequence",
          question: "Monte a sequência do RCP adulto",
          correctFeedback: "Compressão central, ritmo forte e rápido.",
          incorrectFeedback: "Posicione mãos no centro e faça 30:2.",
          orderOptions: [
            {
              id: "rcp-posiciona-maos",
              label: "Posicione as mãos no centro",
              image: require("../../assets/rcp/cards/5.png"),
            },
            {
              id: "rcp-30-compressao",
              label: "30 compressões 100-120/min",
              image: require("../../assets/rcp/cards/7.png"),
            },
            {
              id: "rcp-abrir-via-aerea",
              label: "Abra vias aéreas",
              image: require("../../assets/rcp/cards/9.png"),
            },
            {
              id: "rcp-2-ventilacao",
              label: "2 ventilações eficazes",
              image: require("../../assets/rcp/cards/10.png"),
            },
          ],
          correctOrder: [
            "rcp-posiciona-maos",
            "rcp-30-compressao",
            "rcp-abrir-via-aerea",
            "rcp-2-ventilacao",
          ],
        },
        {
          type: "mcq",
          question: "Quando trocar socorrista nas compressões?",
          options: ["A cada 2 minutos", "A cada 10 segundos", "Nunca", "A cada 30 minutos"],
          answer: 0,
          correctFeedback: "Troque a cada 2 minutos para manter qualidade.",
          incorrectFeedback: "Fadiga reduz a profundidade das compressões.",
        },
      ],
    },
    {
      id: "queda-escolar",
      title: "Primeiros Socorros: Queda na escola",
      color: "#dc2626",
      icon: "ThermometerIcon",
      order: 3,
      lessons: [
        {
          type: "info",
          title: "Caiu da cadeira e bateu a cabeça",
          text: "Mantenha deitado, estabilize a cabeça com as mãos, observe sangramento ou vômitos.",
        },
        {
          type: "sequence",
          question: "Ordene o socorro seguro",
          correctFeedback: "Proteção cervical improvisada enquanto aciona ajuda.",
          incorrectFeedback: "Controle a cabeça e acione apoio cedo.",
          ...buildSequence([
            "Peça para não se mexer",
            "Estabilize cabeça com as mãos",
            "Cheque consciência e respiração",
            "Ligue 192 se vômito, sonolência ou sangramento",
          ]),
        },
        {
          type: "mcq",
          question: "Quando NÃO mover?",
          options: [
            "Quando há risco imediato de incêndio",
            "Em suspeita de trauma de coluna sem risco externo",
            "Se quer sentar para descansar",
            "Para colocá-lo em cadeira mais confortável",
          ],
          answer: 1,
          correctFeedback: "Evite mover sem necessidade em suspeita de coluna.",
          incorrectFeedback: "Trauma de coluna pede imobilização e ajuda.",
        },
      ],
    },
    {
      id: "decisao-critica",
      title: "Primeiros Socorros: Decisão",
      color: "#dc2626",
      icon: "ZapIcon",
      order: 4,
      lessons: [
        {
          type: "mcq",
          question: "Em qual momento ligar para o 192?",
          options: [
            "Só se alguém pedir",
            "Sempre que há inconsciência, falta de ar ou sangramento intenso",
            "Depois de terminar todos os cuidados",
            "Somente se estiver sozinho",
          ],
          answer: 1,
          correctFeedback: "Emergências graves: ligue cedo e siga orientações.",
          incorrectFeedback: "Inconsciência, falta de ar ou sangramento = 192 agora.",
        },
        {
          type: "mcq",
          question: "Qual ação vem primeiro em parada respiratória?",
          options: [
            "Buscar água",
            "Abrir vias aéreas, checar respiração, iniciar RCP",
            "Deixar de lado e esperar",
            "Colocar gelo",
          ],
          answer: 1,
          correctFeedback: "Abra vias áreas, checar, iniciar compressões.",
          incorrectFeedback: "Sem respiração = RCP imediata.",
        },
      ],
    },
  ],
  queimaduras: [
    {
      id: "queimadura-basico",
      title: "Queimaduras: Básico",
      color: "#f97316",
      icon: "FlaskIcon",
      order: 1,
      lessons: [
        {
          type: "info",
          title: "O que é",
          text: "Lesão térmica, química, elétrica ou por radiação. Classifique por profundidade e extensão.",
        },
        {
          type: "mcq",
          question: "O que NÃO fazer?",
          options: [
            "Aplicar gelo direto",
            "Resfriar com água corrente fria 20 min",
            "Retirar acessorios apertados",
            "Cobrir com pano limpo",
          ],
          answer: 0,
          correctFeedback: "Gelo direto agrava a lesão.",
          incorrectFeedback: "Evite gelo direto em queimaduras.",
        },
        {
          type: "mcq",
          question: "Quando acionar o 192?",
          options: [
            "Queimadura elétrica, face, mãos, períneo ou extensa",
            "Apenas se doer",
            "Nunca",
            "Somente se houver bolhas pequenas",
          ],
          answer: 0,
          correctFeedback: "Areas criticas ou eletrica exigem avaliação medica urgente.",
          incorrectFeedback: "Face, mãos, períneo ou elétrica pedem 192.",
        },
      ],
    },
    {
      id: "queimadura-procedimento",
      title: "Queimaduras: Procedimento",
      color: "#f97316",
      icon: "ThermometerIcon",
      order: 2,
      lessons: [
        {
          type: "sequence",
          question: "Sequencia de primeiros passos",
          correctFeedback: "Segurança, resfriar, retirar acessórios, cobrir.",
          incorrectFeedback: "Use água corrente, sem gelo ou pomadas.",
          ...buildSequence([
            "Retire fonte de calor em segurança",
            "Resfrie com água corrente fria por 20 min",
            "Retire aneis/relogios sem forcar a pele",
            "Cubra com pano limpo ou gaze",
          ]),
        },
        {
          type: "mcq",
          question: "Queimadura quimica: primeira ação?",
          options: [
            "Neutralizar com outro produto",
            "Lavar com água corrente abundante",
            "Cobrir sem lavar",
            "Aplicar pomada",
          ],
          answer: 1,
          correctFeedback: "Lave com água abundante para remover o agente.",
          incorrectFeedback: "Lave bastante antes de cobrir.",
        },
        {
          type: "mcq",
          question: "Queimadura eletrica: por que chamar 192?",
          options: [
            "Porque e mais rapido",
            "Risco de arritmia e queimadura interna",
            "Não é necessário",
            "Para ganhar atestado",
          ],
          answer: 1,
          correctFeedback: "Eletricidade pode causar arritmia e lesão profunda.",
          incorrectFeedback: "Avaliação médica urgente é crucial.",
        },
      ],
    },
    {
      id: "queimadura-contexto",
      title: "Queimaduras: Contexto",
      color: "#f97316",
      icon: "FlaskIcon",
      order: 3,
      lessons: [
        {
          type: "info",
          title: "Cozinha",
          text: "Desligue fogo, afaste óleo, resfrie a área, retire anéis.",
        },
        {
          type: "mcq",
          question: "Queimadura facial por vapor: o que fazer?",
          options: [
            "Resfriar e acionar 192",
            "Colocar manteiga",
            "Furar bolhas",
            "Aplicar álcool",
          ],
          answer: 0,
          correctFeedback: "Face e area critica: resfrie e procure avaliação.",
          incorrectFeedback: "Face exige avaliação médica urgente.",
        },
      ],
    },
    {
      id: "queimadura-decisao",
      title: "Queimaduras: Decisão",
      color: "#f97316",
      icon: "ZapIcon",
      order: 4,
      lessons: [
        {
          type: "mcq",
          question: "Quando transferir para hospital?",
          options: [
            "Toda queimadura de 2º/3º grau em face, mãos, períneo, articulações",
            "Somente se doer muito",
            "Nunca",
            "Apenas se o paciente pedir",
          ],
          answer: 0,
          correctFeedback: "Areas especiais exigem avaliação especializada.",
          incorrectFeedback: "Areas especiais ou profundas = hospital.",
        },
        {
          type: "mcq",
          question: "O que NÃO aplicar na queimadura?",
          options: ["Manteiga, pasta de dente ou óleo", "Água corrente fria", "Pano limpo", "Gaze estéril"],
          answer: 0,
          correctFeedback: "Evite produtos caseiros que infeccionam.",
          incorrectFeedback: "Nada de manteiga ou pasta.",
        },
      ],
    },
  ],
  convulsao: [
    {
      id: "convulsao-basico",
      title: "Convulsão: Básico",
      color: "#2563eb",
      icon: "FlaskIcon",
      order: 1,
      lessons: [
        {
          type: "info",
          title: "O que é convulsão",
          text: "Descarga elétrica desorganizada. Pode causar perda de consciência e movimentos involuntários.",
        },
        {
          type: "mcq",
          question: "O que NÃO fazer?",
          options: [
            "Introduzir objetos na boca",
            "Afastar objetos ao redor",
            "Proteger a cabeça com algo macio",
            "Acompanhar o tempo da crise",
          ],
          answer: 0,
          correctFeedback: "Nunca coloque objetos na boca.",
          incorrectFeedback: "Evite colocar objetos na boca.",
        },
        {
          type: "mcq",
          question: "Quando acionar o 192?",
          options: [
            "Crise >5 min ou repetidas",
            "Crise curta <1 min",
            "Se a pessoa esta consciente",
            "Sempre, mesmo sem risco",
          ],
          answer: 0,
          correctFeedback: "Crises prolongadas ou em série exigem SAMU.",
          incorrectFeedback: "Crises longas/sucedidas = 192.",
        },
      ],
    },
    {
      id: "convulsao-procedimento",
      title: "Convulsão: Procedimento",
      color: "#2563eb",
      icon: "ThermometerIcon",
      order: 2,
      lessons: [
        {
          type: "sequence",
          question: "Durante a crise: ordene",
          correctFeedback: "Proteja, conte o tempo, acione ajuda se prolongar.",
          incorrectFeedback: "Proteja e conte o tempo antes de qualquer coisa.",
          ...buildSequence([
            "Afaste objetos e proteja a cabeça",
            "Afrouxe roupas apertadas",
            "Conte o tempo da crise",
            "Ligue 192 se durar >5 min ou repetir",
          ]),
        },
        {
          type: "mcq",
          question: "Após a crise, qual posição?",
          options: [
            "De brucos",
            "Decubito lateral de segurança",
            "Em pe",
            "Sentado em cadeira",
          ],
          answer: 1,
          correctFeedback: "Recuperação lateral protege vias áreas.",
          incorrectFeedback: "Coloque em posição lateral segura.",
        },
        {
          type: "mcq",
          question: "O que observar após a crise?",
          options: [
            "Respiração, cor da pele, trauma na queda",
            "Apenas horario",
            "Somente a roupa",
            "Nada",
          ],
          answer: 0,
          correctFeedback: "Respiração e possíveis traumas guiam a decisão.",
          incorrectFeedback: "Observe respiração e traumas.",
        },
      ],
    },
    {
      id: "convulsao-contexto",
      title: "Convulsão: Contexto",
      color: "#2563eb",
      icon: "FlaskIcon",
      order: 3,
      lessons: [
        {
          type: "info",
          title: "Escola ou trabalho",
          text: "Mantenha curiosos afastados, respeite a privacidade e anote o tempo.",
        },
        {
          type: "mcq",
          question: "Queda com ferimento na cabeça: qual cuidado?",
          options: [
            "Não mover o pescoço, controle de sangramento leve e acionar 192",
            "Sentar imediatamente",
            "Ignorar se parou de sangrar",
            "Colocar gelo na boca",
          ],
          answer: 0,
          correctFeedback: "Suspeita de trauma: proteja e chame ajuda.",
          incorrectFeedback: "Protecao cervical e 192 se trauma.",
        },
      ],
    },
    {
      id: "convulsao-decisao",
      title: "Convulsão: Decisão",
      color: "#2563eb",
      icon: "ZapIcon",
      order: 4,
      lessons: [
        {
          type: "mcq",
          question: "Quando encaminhar ao hospital mesmo após crise curta?",
          options: [
            "Primeira crise da vida",
            "Se ja tem diagnostico e foi curta",
            "Nunca",
            "Apenas se quiser",
          ],
          answer: 0,
          correctFeedback: "Primeira crise precisa avaliação medica.",
          incorrectFeedback: "Primeira crise = avaliação medica.",
        },
        {
          type: "mcq",
          question: "Durante a crise, o que voce faz primeiro?",
          options: [
            "Afastar objetos e proteger a cabeça",
            "Tentar segurar bracos e pernas",
            "Colocar algo na boca",
            "Dar água",
          ],
          answer: 0,
          correctFeedback: "Proteja a cabeça e o espaço ao redor.",
          incorrectFeedback: "Protecao e espaco sao prioridades.",
        },
      ],
    },
  ],
  suporteBasico: [
    {
      id: "basicSupport-1",
      title: "PROTOCOLO DE EMERGÊNCIA",
      color: "#FF4B4B",
      icon: "HeartIcon",
      order: 1,
      lessons: [
        {
          id: "volume1",
          type: "quiz",
          title: "Protocolo de Emergência",
          questions: [
            {
              id: "lesson1_q1",
              question: "Antes de atender a vítima, o que você deve verificar obrigatoriamente?",
              image: "seguranca_cena.png",
              options: [
                "Se ela tem cartão de cidadão/identidade.",
                "Se o local é seguro para você agir.",
                "Se há curiosos atrapalhando.",
                "A temperatura da pele dela."
              ],
              answer: 1,
              correctFeedback: "Correto! A regra é: certifique-se de que o local é seguro para você agir e não fornece novos perigos.",
              incorrectFeedback: "Errado. Sua segurança vem primeiro. Se você se ferir, não haverá ninguém para salvar a vítima e haverá duas pessoas precisando de ajuda."
            },
            {
              id: "lesson1_q2",
              question: "Como verificar se a vítima está responsiva (consciente)?",
              image: "checar_consciencia.png",
              options: [
                "Jogando água nela.",
                "Tocando no ombro e perguntando \"Está tudo bem?\".",
                "Dando estalos no rosto.",
                "Verificando o pulso."
              ],
              answer: 1,
              correctFeedback: "Correto! O teste padrão é tocar seu ombro e perguntar se está tudo bem. Caso ela não responda, devemos chamar ajuda.",
              incorrectFeedback: "Errado. Estímulos dolorosos, agressivos (tapas) ou jogar água não são indicados e podem machucar a vítima."
            },
            {
              id: "lesson1_q3",
              question: "Se está SOZINHO e a vítima não responde, o que fazer imediatamente?",
              image: "ligar_192.png",
              options: [
                "Começar a massagem cardíaca.",
                "Ligar para a emergência imediatamente.",
                "Ir buscar um médico na rua.",
                "Tentar acordá-la de novo."
              ],
              answer: 1,
              correctFeedback: "✅ Correto! Se estiver sozinha, chame imediatamente o serviço de emergências antes de tocar na vítima novamente, a fim de que uma ambulância possa chegar o mais rápido possível.",
              incorrectFeedback: "❌ Errado. Fazer RCP sem chamar ajuda antes (estando sozinho) impede a chegada do suporte avançado e do DEA, diminuindo a chance de sobrevivência."
            },
            {
              id: "lesson1_q4",
              question: "Qual o número da ambulância que atende esse tipo de emergência?",
              image: "ligar.png",
              options: [
                "SAMU - 911.",
                "SIATE - 193.",
                "SAMU - 192.",
                "SIATE - 190."
              ],
              answer: 2,
              correctFeedback: "Correto! Ao encontrar uma pessoa desacordada que não responde ao chamado, devemos acionar o SAMU, ambulância responsável por emergências clínicas, por meio do número 192.",
              incorrectFeedback: "Errado. O número do SAMU, ambulância responsável por emergências clínicas como é o caso de uma pessoa desacordada, é o 192. O número 193 é do SIATE, ambulância responsável por atender casos de acidentes ou queimaduras, por exemplo."
            },
            {
              id: "lesson1_q5",
              question: "O que fazer com observadores curiosos que se aproximam?",
              image: "afastar_curiosos.png",
              options: [
                "Pedir para filmarem.",
                "Ignorá-los.",
                "Afastá-los para ter espaço.",
                "Pedir dinheiro."
              ],
              answer: 2,
              correctFeedback: "Correto! Observadores costumam ser curiosos e isso não te dará espaço para agir.",
              incorrectFeedback: "Errado. A aglomeração atrapalha fisicamente a execução das manobras de socorro e pode colocar os curiosos em risco."
            },
            {
              id: "lesson1_q6",
              question: "Após chamar a ambulância, você quer ter certeza de que a vítima está em parada cardíaca antes de começar a fazer massagem cardíaca. O que é um sinal sugestivo de uma parada cardíaca?",
              image: "inicio_rcp.png",
              options: [
                "Quando a vítima não está respirando, o que é identificado por seu tórax não estar subindo e descendo.",
                "Quando a vítima está se mexendo e resmungando de dor.",
                "Quando você não consegue sentir o coração da vítima batendo ao colocar os dedos no punho ou pescoço dela.",
                "Quando você chamou a vítima de novo, ela abriu os olhos, mas logo fechou."
              ],
              answer: 0,
              correctFeedback: "✅ Correto! Quando uma pessoa está desacordada e não responde ao chamado, é necessário verificar se ela está respirando antes de agir. Se essa pessoa não move seu tórax para cima e para baixo, isso significa que ela não está respirando e precisa ser tratada com reanimação cardiorrespiratória.",
              incorrectFeedback: "❌ Errado. Se a pessoa estiver se mexendo e resmungando ou conseguir abrir e fechar os olhos, ela não está em parada cardíaca, então não podemos fazer massagem cardíaca nela. Palpar o pulso para sentir o coração de uma pessoa é uma tarefa difícil para algumas pessoas que não são da área da saúde, por isso não é recomendado."
            }
          ]
        }
      ]
    },
    {
      id: "basicSupport-2",
      title: "TÉCNICA DE RCP E DEA",
      color: "#FF4B4B",
      icon: "HeartIcon",
      order: 2,
      lessons: [
        {
          id: "volume1",
          type: "quiz",
          title: "Técnica de RCP e DEA",
          questions: [
            {
              id: "lesson2_q1",
              question: "Onde colocar as mãos para realizar a massagem cardíaca?",
              image: "posicao_maos_centro.png",
              options: [
                "No lado esquerdo (onde fica o coração).",
                "Na região do estômago.",
                "No centro do tórax, entre os mamilos.",
                "Na barriga."
              ],
              answer: 2,
              correctFeedback: "✅ Correto! O local exato é o \"centro do tórax da vítima, entre os mamilos dela\".",
              incorrectFeedback: "❌ Errado. Comprimir fora do centro do tórax não vai bombeiar o sangue corretamente e aumenta o risco de quebrar alguma costela."
            },
            {
              id: "lesson2_q2",
              question: "Qual a superfície correta para fazer a reanimação cardiopulmonar (massagens cardíacas)?",
              image: "superficie_plana.png",
              options: [
                "Colchão macio.",
                "Superfície firme e plana (chão).",
                "Sofá.",
                "Cadeira reclinável."
              ],
              answer: 1,
              correctFeedback: "✅ Correto! \"Certifique-se de que a vítima está deitada em uma superfície firme e plana\".",
              incorrectFeedback: "❌ Errado. Superfícies macias absorvem a força da compressão, impedindo que o coração seja pressionado contra a coluna."
            },
            {
              id: "lesson2_q3",
              question: "Como devem ficar os seus braços para as massagens?",
              image: "bracos_esticados.png",
              options: [
                "Levemente dobrados.",
                "Totalmente esticados e firmes, formando um ângulo reto com o tronco da vítima.",
                "Eles devem flexionar um pouco a cada empurrão.",
                "Na diagonal do tronco da vítima, em direção ao coração."
              ],
              answer: 1,
              correctFeedback: "✅ Correto! Mantenha seus braços firmes e esticados, formando um ângulo reto com o tronco da vítima, pois assim você vai demorar mais pra cansar.",
              incorrectFeedback: "❌ Errado. Dobrar cotovelos transfere o esforço para o tríceps, cansando o socorrista em segundos. Para serem mais eficientes, as compressões devem ir em direção ao chão, formando um ângulo reto com o tronco da vítima."
            },
            {
              id: "lesson2_q4",
              question: "O que é crucial fazer logo após empurrar o peito?",
              image: "retorno_torax.png",
              options: [
                "Manter pressionado por alguns segundos.",
                "Permitir o retorno completo do tórax.",
                "Tirar as mãos.",
                "Pausar para descansar."
              ],
              answer: 1,
              correctFeedback: "✅ Correto! Permita o retorno completo do tórax, a fim de que o coração possa se encher de sangue.",
              incorrectFeedback: "❌ Errado. Se o tórax não voltar à posição original, o coração permanece comprimido e não enche para a próxima bombeada. Não pare para descansar, cada minuto é fundamental para alguém em parada cardíaca!"
            },
            {
              id: "lesson2_q5",
              question: "Qual o ritmo e profundidade mais adequados para realizar a ressuscitação cardiopulmonar?",
              image: "stayin_alive.png",
              options: [
                "Empurrar o mais fundo possível, de forma bem devagar e pausada.",
                "Com uma profundidade de menos da metade do tórax da vítima, no ritmo da música “Baby Shark”.",
                "O mais rápido possível, com profundidade de menos de metade do tórax da vítima.",
                "No ritmo da música “Baby Shark”, sem colocar força para não abaixar o tórax da vítima."
              ],
              answer: 1,
              correctFeedback: "✅ Correto! O ideal é fazer 100-120 compressões por minuto, como a música “Baby Shark”. É necessário aplicar uma força para afundar 5-6cm do tórax da vítima, que equivale a menos da metade dele.",
              incorrectFeedback: "❌ Errado. É necessário seguir uma técnica com ritmo e profundidade adequados. O ritmo ideal é de 100-120 compressões por minuto, como na música “Baby Shark”. As compressões devem afundar de 5-6cm do tórax da vítima, portanto não devem ser nem muito fortes nem muito fracas."
            },
            {
              id: "lesson2_q6",
              question: "Você já ouviu falar sobre o DEA (desfibrilador externo automático)? Marque a alternativa mais correta para você:",
              image: "DEA.png",
              options: [
                "O DEA é um equipamento que dá um choque no coração da pessoa em parada cardiorrespiratória para que ele voltar a bater.",
                "O DEA só pode ser usado por profissionais da área da saúde, pois é difícil de ser operado.",
                "O DEA não apresenta nenhum risco, por isso qualquer pessoa pode usá-lo durante os primeiros socorros sem se preocupar com as pessoas a sua volta.",
                "Nunca ouvi falar sobre esse dispositivo."
              ],
              answer: 0,
              correctFeedback: "✅ Correto! O DEA é um equipamento que dá um choque no coração da pessoa em parada cardiorrespiratória e ajuda ele a voltar a bater, portanto é importante em primeiros socorros.",
              incorrectFeedback: "❌ Errado. Esse equipamento foi criado para ser simples e poder ser operado por pessoas que não sejam da área da saúde, mas são necessários alguns cuidados antes de usá-lo (ninguém pode estar tocando na vítima no momento em que será administrado o choque, por exemplo)."
            }
          ]
        }
      ]
    }
  ],
};
