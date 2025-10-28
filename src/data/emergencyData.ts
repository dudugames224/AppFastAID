// Importa os ícones do seu arquivo principal de dados de curso
import { coursesData } from "./courseData";

export const emergenciaList = [
  {
    id: 'choking',
    title: 'Engasgamento',
    icon: coursesData.firstAid.icon, // Usando ícone de primeiros socorros
    steps: [
      {
        title: 'O que é?',
        description: 'O engasgamento ocorre quando um objeto ou alimento bloqueia as vias aéreas, dificultando ou impedindo a respiração.'
      },
      {
        title: '1. Avalie a Situação',
        description: 'Pergunte à pessoa: "Você está engasgado?" Se ela não consegue falar, tossir ou respirar adequadamente, aja imediatamente.'
      },
      {
        title: '2. Incentive a Tosse',
        description: 'Se a pessoa está tossindo com força, incentive-a a continuar tossindo para tentar expelir o objeto.'
      },
      {
        title: '3. Manobra de Heimlich (Posição)',
        description: 'Para adultos ou crianças maiores de 1 ano: Fique atrás da pessoa, envolva os braços ao redor da cintura dela.'
      },
      {
        title: '4. Manobra de Heimlich (Compressão)',
        description: 'Feche uma mão em punho e coloque o lado do polegar acima do umbigo, mas abaixo do esterno. Cubra o punho com a outra mão e faça compressões rápidas e fortes para dentro e para cima.'
      },
      {
        title: '5. Continue as Compressões',
        description: 'Continue as compressões até que o objeto seja expelido ou a pessoa perca a consciência.'
      },
      {
        title: '6. Se a Pessoa Desmaiar',
        description: 'Deite-a no chão com cuidado. Ligue imediatamente para a emergência (192 ou 193).'
      },
      {
        title: '7. Inicie RCP (Se Desmaiar)',
        description: 'Se a pessoa não estiver respirando: faça 30 compressões torácicas (no centro do peito, 5-6 cm de profundidade em adultos).'
      },
      {
        title: '8. Verifique as Vias Aéreas',
        description: 'Antes de ventilar, verifique a boca e tente remover o objeto APENAS se estiver visível. Não empurre mais fundo.'
      },
      {
        title: '9. Continue a RCP',
        description: 'Administre 2 ventilações de resgate (se treinado) e continue o ciclo de 30 compressões e 2 ventilações.'
      },
      {
        title: 'Cuidado: Bebês (< 1 ano)',
        description: 'Segure o bebê de bruços no seu antebraço (cabeça baixa). Dê 5 tapas firmes entre as omoplatas. Vire-o de costas e faça 5 compressões no peito com dois dedos.'
      },
      {
        title: 'Cuidado: Gestantes ou Obesos',
        description: 'Aplique as compressões no centro do peito (esterno), em vez do abdômen.'
      },
    ]
  },
  {
    id: 'seizures',
    title: 'Convulsões',
    icon: coursesData.seizures.icon,
    steps: [
      {
        title: 'O que são?',
        description: 'Convulsões podem ser causadas por epilepsia, febre alta (em crianças), lesões cerebrais ou outras condições médicas.'
      },
      {
        title: '1. Proteja a Pessoa',
        description: 'Mantenha a calma. Afaste objetos perigosos (móveis, objetos cortantes) para evitar ferimentos.'
      },
      {
        title: '2. Posição de Segurança',
        description: 'Se possível, deite a pessoa no chão, de lado, para evitar engasgamento com saliva ou vômito. Coloque algo macio (jaqueta) sob a cabeça.'
      },
      {
        title: 'NÃO FAÇA:',
        description: 'Não tente segurar ou restringir os movimentos. NÃO coloque nada na boca da pessoa (como colheres ou dedos), pois isso pode causar lesões.'
      },
      {
        title: '3. Monitore o Tempo',
        description: 'Observe quanto tempo a convulsão dura. Chame o serviço de emergência (192 ou 193) imediatamente se durar mais de 5 minutos ou se houver convulsões seguidas.'
      },
      {
        title: '4. Chame Ajuda (192 ou 193) Se:',
        description: 'For a primeira convulsão da pessoa; a pessoa estiver grávida ou ferida; não recuperar a consciência; ou não respirar após o episódio.'
      },
      {
        title: '5. Após a Convulsão',
        description: 'Verifique se a pessoa está respirando (inicie RCP se não estiver). Fique com ela até que esteja totalmente consciente. Ela pode estar confusa ou cansada.'
      },
    ]
  },
  {
    id: 'burns',
    title: 'Queimaduras',
    icon: coursesData.burns.icon,
    steps: [
      {
        title: 'O que são?',
        description: 'Causadas por calor, produtos químicos, eletricidade ou radiação. A gravidade depende da profundidade e extensão da lesão.'
      },
      {
        title: '1. Remova a Fonte',
        description: 'Afaste a pessoa do calor. Em queimaduras químicas, remova roupas (se seguro) e lave com água corrente por 20 minutos.'
      },
      {
        title: 'CUIDADO: Queimadura Elétrica',
        description: 'Certifique-se de que a fonte de eletricidade foi DESLIGADA antes de tocar a pessoa.'
      },
      {
        title: '2. Resfrie a Queimadura (Térmica)',
        description: 'Coloque a área afetada sob água corrente FRIA (não gelada) por 10 a 20 minutos. Isso reduz a dor. NÃO use gelo.'
      },
      {
        title: '3. Cubra a Queimadura',
        description: 'Cubra a área com um pano limpo, estéril ou gaze não aderente. Evite algodão ou materiais que possam grudar.'
      },
      {
        title: 'NÃO FAÇA:',
        description: 'Não aplique pomadas, manteiga, pasta de dente ou outros produtos caseiros. Não rompa bolhas, pois isso aumenta o risco de infecção.'
      },
      {
        title: '4. Avalie: Leves (1º Grau)',
        description: 'Afetam apenas a camada externa da pele (vermelhidão e dor). Trate com água fria e cobertura leve.'
      },
      {
        title: '5. Avalie: Graves (2º e 3º Grau)',
        description: 'Apresentam bolhas, pele esbranquiçada, carbonizada ou ausência de dor. Necessitam de atendimento médico imediato.'
      },
      {
        title: '6. Chame Emergência (192/193) Se:',
        description: 'A queimadura for maior que a palma da mão; afetar rosto, mãos, pés ou genitais; for elétrica/química; ou houver dificuldade para respirar/sinais de choque.'
      },
      {
        title: '7. Cuidados Adicionais',
        description: 'Para queimaduras solares leves, use loções calmantes (aloe vera) após resfriar a pele. Monitore sinais de infecção (inchaço, pus, febre).'
      },
    ]
  },
];
