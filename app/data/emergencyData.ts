const emergencyIcons = {
  choking: require("../../assets/images/engasgo.png"),
  seizures: require("../../assets/images/convulsao.png"),
  burns: require("../../assets/images/queimadura.png"),
};

export const emergencyList = [
  {
    id: "choking",
    title: "Engasgamento",
    icon: emergencyIcons.choking,
    steps: [
      {
        title: "O que é?",
        description:
          "O engasgamento ocorre quando um objeto ou alimento bloqueia as vias aéreas, dificultando ou impedindo a respiração.",
      },
      {
        title: "1. Avalie a Situação",
        description:
          'Pergunte à pessoa: "Você está engasgado?" Se ela não consegue falar, tossir ou respirar adequadamente, aja imediatamente.',
      },
      {
        title: "2. Incentive a Tosse",
        description:
          "Se a pessoa está tossindo com força, incentive-a a continuar tossindo para tentar expelir o objeto.",
      },
      {
        title: "3. Manobra de Heimlich (Posição)",
        description:
          "Para adultos ou crianças maiores de 1 ano: fique atrás da pessoa, envolva os braços ao redor da cintura dela.",
      },
      {
        title: "4. Manobra de Heimlich (Compressão)",
        description:
          "Feche uma mão em punho e coloque o lado do polegar acima do umbigo, mas abaixo do esterno. Cubra o punho com a outra mão e faça compressões rápidas e fortes para dentro e para cima.",
      },
      {
        title: "5. Continue as compressões",
        description:
          "Continue as compressões até que o objeto seja expelido ou a pessoa perca a consciência.",
      },
      {
        title: "6. Se a pessoa desmaiar",
        description:
          "Deite-a no chão com cuidado. Ligue imediatamente para a emergência (192 ou 193).",
      },
      {
        title: "7. Inicie RCP (se desmaiar)",
        description:
          "Se a pessoa não estiver respirando: faça 30 compressões torácicas (no centro do peito, 5-6 cm de profundidade em adultos).",
      },
      {
        title: "8. Verifique as vias aéreas",
        description:
          "Antes de ventilar, verifique a boca e tente remover o objeto APENAS se estiver visível. Não empurre mais fundo.",
      },
      {
        title: "9. Continue a RCP",
        description:
          "Administre 2 ventilações de resgate (se treinado) e continue o ciclo de 30 compressões e 2 ventilações.",
      },
      {
        title: "Cuidado: bebês (< 1 ano)",
        description:
          "Segure o bebê de bruços no seu antebraço (cabeça baixa). Dê 5 tapas firmes entre as omoplatas. Vire-o de costas e faça 5 compressões no peito com dois dedos.",
      },
      {
        title: "Cuidado: gestantes ou obesos",
        description:
          "Aplique as compressões no centro do peito (esterno), em vez do abdômen.",
      },
    ],
  },
  {
    id: "seizures",
    title: "Convulsões",
    icon: emergencyIcons.seizures,
    steps: [
      {
        title: "O que são?",
        description:
          "Convulsões podem ser causadas por epilepsia, febre alta (em crianças), lesões cerebrais ou outras condições médicas.",
      },
      {
        title: "1. Proteja a pessoa",
        description:
          "Mantenha a calma. Afaste objetos perigosos (móveis, objetos cortantes) para evitar ferimentos.",
      },
      {
        title: "2. Posição de segurança",
        description:
          "Se possível, deite a pessoa no chão, de lado, para evitar engasgamento com saliva ou vômito. Coloque algo macio (jaqueta) sob a cabeça.",
      },
      {
        title: "NÃO FAÇA:",
        description:
          "Não tente segurar ou restringir os movimentos. NÃO coloque nada na boca da pessoa (como colheres ou dedos).",
      },
      {
        title: "3. Monitore o tempo",
        description:
          "Observe quanto tempo a convulsão dura. Chame a emergência se durar mais de 5 minutos ou se houver convulsões seguidas.",
      },
      {
        title: "4. Chame ajuda (192 ou 193) se:",
        description:
          "For a primeira convulsão; a pessoa estiver grávida ou ferida; não recuperar a consciência; ou não respirar após o episódio.",
      },
      {
        title: "5. Após a convulsão",
        description:
          "Verifique se a pessoa está respirando (inicie RCP se não estiver). Fique com ela até que esteja totalmente consciente.",
      },
    ],
  },
  {
    id: "burns",
    title: "Queimaduras",
    icon: emergencyIcons.burns,
    steps: [
      {
        title: "O que são?",
        description:
          "Causadas por calor, produtos químicos, eletricidade ou radiação. A gravidade depende da profundidade e extensão da lesão.",
      },
      {
        title: "1. Remova a fonte",
        description:
          "Afaste a pessoa do calor. Em queimaduras químicas, remova roupas (se seguro) e lave com água corrente por 20 minutos.",
      },
      {
        title: "CUIDADO: queimadura elétrica",
        description:
          "Certifique-se de que a fonte de eletricidade foi DESLIGADA antes de tocar a pessoa.",
      },
      {
        title: "2. Resfrie a queimadura (térmica)",
        description:
          "Coloque a área afetada sob água corrente fria (não gelada) por 10 a 20 minutos. Não use gelo.",
      },
      {
        title: "3. Cubra a queimadura",
        description:
          "Cubra a área com um pano limpo, estéril ou gaze não aderente. Evite algodão ou materiais que possam grudar.",
      },
      {
        title: "NÃO FAÇA:",
        description:
          "Não aplique pomadas, manteiga, pasta de dente ou outros produtos caseiros. Não rompa bolhas.",
      },
      {
        title: "4. Avalie: leves (1º grau)",
        description:
          "Afetam apenas a camada externa da pele (vermelhidão e dor). Trate com água fria e cobertura leve.",
      },
      {
        title: "5. Avalie: graves (2º e 3º grau)",
        description:
          "Apresentam bolhas, pele esbranquiçada, carbonizada ou ausência de dor. Necessitam de atendimento médico imediato.",
      },
      {
        title: "6. Chame emergência (192/193) se:",
        description:
          "A queimadura for maior que a palma da mão; afetar rosto, mãos, pés ou genitais; for elétrica/química; ou houver dificuldade para respirar.",
      },
      {
        title: "7. Cuidados adicionais",
        description:
          "Para queimaduras solares leves, use loções calmantes (aloe vera) após resfriar a pele. Monitore sinais de infecção.",
      },
    ],
  },
];

