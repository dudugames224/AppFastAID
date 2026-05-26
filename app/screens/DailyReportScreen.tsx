import { Ionicons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system/legacy';
import * as Print from 'expo-print';
import { useFocusEffect, useRouter } from 'expo-router';
import * as Sharing from 'expo-sharing';
import { doc, getDoc } from 'firebase/firestore';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, LayoutAnimation, Modal, Platform, ScrollView, StyleSheet, Switch, Text, TextInput, TouchableOpacity, UIManager, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { auth, db } from '../firebaseConfig';
import { AppSettings, RemoteCourseMeta, fetchAppSettings, fetchCoursesMeta, toggleCourseVisibility, updateAppSetting } from '../services/lessonService';
import { GlobalReport, LeaderboardEntry, fetchClassPerformanceReport, fetchLeaderboard, resetAllUsersXP, wipeAllAssessmentData } from '../services/reportingService';

// ANIMACAO: habilita animacoes de layout no Android.
if (Platform.OS === 'android') {
  if (UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
}

export default function DailyReportScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const [reportData, setReportData] = useState<GlobalReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasPermission, setHasPermission] = useState(false);
  const [wipeModalVisible, setWipeModalVisible] = useState(false);
  const [wipeConfirmationText, setWipeConfirmationText] = useState("");
  const [rankingModalVisible, setRankingModalVisible] = useState(false);
  const [rankingLoading, setRankingLoading] = useState(false);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [resetXPModalVisible, setResetXPModalVisible] = useState(false);
  const [resetXPConfirmation, setResetXPConfirmation] = useState("");
  const [courses, setCourses] = useState<RemoteCourseMeta[]>([]);
  const [selectedClass, setSelectedClass] = useState<string | null>(null);
  const [availableClasses, setAvailableClasses] = useState<string[]>([]);
  const [appSettings, setAppSettings] = useState<AppSettings>({
    isStoreEnabled: true,
    globalInfiniteLives: false,
    isPremiumModeEnabled: true,
  });

  // Estados para controle das seções colapsáveis
  const [expandVisibility, setExpandVisibility] = useState(false);
  const [expandGamification, setExpandGamification] = useState(false);
  const [expandReport, setExpandReport] = useState(false);
  const [expandSettings, setExpandSettings] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const user = auth.currentUser;
      
      if (user) {
        // 1. Verifica se o usuário é admin
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);
        
        if (!userSnap.exists() || userSnap.data().admin !== true) {
          setHasPermission(false);
          setLoading(false);
          return; // Interrompe se não for admin
        }
        setHasPermission(true);

        // Chama a NOVA função de relatório geral da turma
        console.log("Buscando dados gerais da turma...");
        // REMOVIDO: selectedClass daqui. O relatório principal agora é sempre global.
        const data = await fetchClassPerformanceReport();
        
        // Salva o resultado no estado para exibir na tela
        setReportData(data);

        // Popula a lista de turmas disponíveis baseada nos dados globais
        if (data.courses.length > 0) {
          const classesSet = new Set<string>();
          data.courses.forEach(c => {
            Object.keys(c.demographics.class).forEach(cls => classesSet.add(cls));
          });
          // Remove N/I se quiser, ou mantém
          setAvailableClasses(Array.from(classesSet).sort());
        }

        // Carrega lista de cursos para gerenciamento (incluindo ocultos)
        const coursesList = await fetchCoursesMeta(true);
        setCourses(coursesList);

        // Carrega configurações globais
        const settings = await fetchAppSettings();
        setAppSettings(settings);
      } else {
        console.log("Usuário não está logado.");
      }
    } catch (error) {
      console.error("Erro ao carregar relatório:", error);
    } finally {
      setLoading(false);
    }
  }, []); // Removida dependência de selectedClass

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  // Função para calcular o Panorama Geral (Todos os cursos somados)
  const getGlobalStats = () => {
    if (!reportData) return { avg1: "0.0", avg2: "0.0", total1: 0, total2: 0, totalStudents: 0, students1: 0, students2: 0 };
    
    let sum1 = 0, count1 = 0;
    let sum2 = 0, count2 = 0;
    let totalStudents = 0;
    const { courses, globalStats } = reportData;

    courses.forEach(r => {
      sum1 += r.attempt1.totalScore;
      count1 += r.attempt1.count;
      sum2 += r.attempt2.totalScore;
      count2 += r.attempt2.count;
      totalStudents += r.demographics.totalStudents; // Soma aproximada de participações
    });

    return {
      avg1: count1 ? (sum1 / count1).toFixed(1) : "0.0",
      avg2: count2 ? (sum2 / count2).toFixed(1) : "0.0",
      total1: count1,
      total2: count2, 
      students1: globalStats.uniqueStudents1,
      students2: globalStats.uniqueStudents2,
      totalStudents
    };
  };

  const toggleSection = (section: 'visibility' | 'gamification' | 'report' | 'settings') => {
    // ANIMACAO: suaviza abrir/fechar as secoes colapsaveis do relatorio.
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    if (section === 'visibility') setExpandVisibility(!expandVisibility);
    if (section === 'gamification') setExpandGamification(!expandGamification);
    if (section === 'report') setExpandReport(!expandReport);
    if (section === 'settings') setExpandSettings(!expandSettings);
  };

  const exportToCsv = async () => {
    if (!reportData) return;

    const global = getGlobalStats();
    const globalGrowth = (parseFloat(global.avg2) - parseFloat(global.avg1)).toFixed(1);
    const globalGrowthSign = parseFloat(globalGrowth) >= 0 ? '+' : '';

    try {
      // 1. Cabeçalho Global
      let csvContent = "--- PANORAMA GERAL (TODOS OS CURSOS) ---\n";
      csvContent += `Media Geral (1a Tentativa),Media Geral (2a Tentativa),Crescimento (p.p.),Total Alunos (1a),Total Alunos (2a)\n`;
      csvContent += `${global.avg1}%,${global.avg2}%,${globalGrowthSign}${globalGrowth}%,${global.students1},${global.students2}\n\n`;

      // 2. Cabeçalho dos Dados Detalhados
      csvContent += "--- DETALHAMENTO POR QUESTAO ---\n";
      csvContent += "Curso,Pergunta,Acertos (1a),Erros (1a),Total (1a),% Acerto (1a),Acertos (2a),Erros (2a),Total (2a),% Acerto (2a),Crescimento (p.p.)\n";

      // 3. Itera sobre os dados para criar as linhas
      reportData.courses.forEach((item) => {
        const courseTitle = courses.find(c => c.id === item.courseId)?.title || item.courseId.toUpperCase();
        const cleanCourse = courseTitle.replace(/,/g, "");
        const courseGrowth = (item.attempt2.average - item.attempt1.average).toFixed(1);
        const courseGrowthSign = parseFloat(courseGrowth) >= 0 ? '+' : '';

        // Adiciona Resumo do Curso no CSV antes das perguntas
        csvContent += `\n--- RESUMO DO CURSO: ${cleanCourse} ---\n`;
        csvContent += `Media (1a),Media (2a),Crescimento,Alunos (1a),Alunos (2a)\n`;
        csvContent += `${item.attempt1.average}%,${item.attempt2.average}%,${courseGrowthSign}${courseGrowth}%,${item.attempt1.studentCount},${item.attempt2.studentCount}\n`;
        csvContent += `--------------------------------\n`;
        
        // Dados das Perguntas
        item.questions.forEach(q => {
          // Limpa vírgulas e quebras de linha da pergunta para não quebrar o CSV
          const cleanQuestion = q.questionText.replace(/,/g, " ").replace(/[\r\n]+/g, " ");
          
          const a1Correct = q.attempt1.correct;
          const a1Total = q.attempt1.total;
          const a1Errors = a1Total - a1Correct;
          const a1Pct = q.attempt1.total > 0 ? Math.round((q.attempt1.correct / q.attempt1.total) * 100) : 0;
          
          const a2Correct = q.attempt2.correct;
          const a2Total = q.attempt2.total;
          const a2Errors = a2Total - a2Correct;
          const a2Pct = q.attempt2.total > 0 ? Math.round((q.attempt2.correct / q.attempt2.total) * 100) : 0;
          const qGrowth = a2Pct - a1Pct;
          const qGrowthSign = qGrowth >= 0 ? '+' : '';

          const row = [
            cleanCourse,
            cleanQuestion,
            a1Correct,
            a1Errors,
            a1Total,
            `${a1Pct}%`,
            a2Correct,
            a2Errors,
            a2Total,
            `${a2Pct}%`,
            `${qGrowthSign}${qGrowth}%`
          ].join(",");

          csvContent += row + "\n";
        });

        // Dados Demográficos (Resumo ao final do curso)
        csvContent += `\n--- DEMOGRAFIA: ${cleanCourse} ---\n`;
        
        csvContent += `SEXO,Quantidade,Porcentagem\n`;
        Object.entries(item.demographics.sex).forEach(([key, val]) => {
          csvContent += `${key},${val},${((val / item.demographics.totalStudents) * 100).toFixed(1)}%\n`;
        });

        csvContent += `\nIDADE,Quantidade,Porcentagem\n`;
        Object.entries(item.demographics.age).forEach(([key, val]) => {
          csvContent += `${key},${val},${((val / item.demographics.totalStudents) * 100).toFixed(1)}%\n`;
        });

        csvContent += `\nTURMA,Quantidade,Porcentagem\n`;
        Object.entries(item.demographics.class).forEach(([key, val]) => {
          csvContent += `${key},${val},${((val / item.demographics.totalStudents) * 100).toFixed(1)}%\n`;
        });
        csvContent += `\n`; // Linha em branco entre cursos
      });

      // 3. Salva o arquivo temporariamente
      const fileName = `Relatorio_FastAID_${new Date().getTime()}.csv`;
      const fileUri = (FileSystem.documentDirectory || FileSystem.cacheDirectory) + fileName;
      
      await FileSystem.writeAsStringAsync(fileUri, csvContent, {
        encoding: 'utf8'
      });

      // 4. Abre o menu de compartilhamento
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri, {
          mimeType: 'text/csv',
          dialogTitle: 'Exportar Relatório para Excel'
        });
      } else {
        Alert.alert("Erro", "Compartilhamento não disponível neste dispositivo.");
      }
    } catch (error) {
      console.error("Erro ao exportar:", error);
      Alert.alert("Erro", "Não foi possível gerar o arquivo.");
    }
  };

  const exportToPdf = async () => {
    if (!reportData) return;

    const global = getGlobalStats();
    const globalGrowth = (parseFloat(global.avg2) - parseFloat(global.avg1)).toFixed(1);
    const globalGrowthColor = parseFloat(globalGrowth) >= 0 ? '#27ae60' : '#c0392b';

    try {
      let htmlContent = `
        <html>
          <head>
            <style>
              body { font-family: Helvetica, Arial, sans-serif; padding: 20px; }
              h1 { color: #2c3e50; text-align: center; margin-bottom: 10px; }
              .meta { text-align: center; color: #7f8c8d; margin-bottom: 40px; font-size: 12px; }
              
              .summary-box { background-color: #f8f9fa; border: 1px solid #e1e4e8; padding: 20px; border-radius: 8px; margin-bottom: 40px; }
              .summary-title { font-size: 18px; font-weight: bold; color: #2c3e50; margin-bottom: 15px; border-bottom: 2px solid #3498db; padding-bottom: 5px; }
              
              h2 { color: #2980b9; margin-top: 40px; border-bottom: 1px solid #ccc; padding-bottom: 5px; font-size: 20px; }
              h3 { margin-top: 20px; color: #555; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; }
              
              table { width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 10px; }
              th, td { border: 1px solid #bdc3c7; padding: 8px; text-align: center; }
              th { background-color: #ecf0f1; font-weight: bold; color: #2c3e50; }
              .left { text-align: left; }
              
              .stat-box { display: inline-block; width: 30%; vertical-align: top; margin-right: 2%; background: #fff; border: 1px solid #eee; padding: 10px; }
            </style>
          </head>
          <body>
            <h1>Relatório Geral de Desempenho - FastAID</h1>
            <p class="meta">Gerado em: ${new Date().toLocaleString()}</p>

            <div class="summary-box">
              <div class="summary-title">PANORAMA GERAL (Todos os Cursos)</div>
              <table>
                <tr>
                  <th>Média Geral (1ª Tentativa)</th>
                  <th>Média Geral (Pós-Teste)</th>
                  <th>Crescimento</th>
                  <th>Total de Alunos (1ª)</th>
                  <th>Total de Alunos (2ª)</th>
                </tr>
                <tr>
                  <td style="font-size: 16px; font-weight: bold;">${global.avg1}%</td>
                  <td style="font-size: 16px; font-weight: bold; color: #27ae60;">${global.avg2}%</td>
                  <td style="font-size: 16px; font-weight: bold; color: ${globalGrowthColor};">${parseFloat(globalGrowth) >= 0 ? '+' : ''}${globalGrowth}%</td>
                  <td>${global.students1}</td>
                  <td>${global.students2}</td>
                </tr>
              </table>
              <p style="font-size: 12px; color: #666;">* Este panorama consolida os dados de todos os estudantes em todos os módulos disponíveis.</p>
            </div>
      `;

      reportData.courses.forEach(item => {
        const courseGrowth = (item.attempt2.average - item.attempt1.average).toFixed(1);
        const courseGrowthColor = parseFloat(courseGrowth) >= 0 ? '#27ae60' : '#c0392b';

        const courseTitle = courses.find(c => c.id === item.courseId)?.title || item.courseId.toUpperCase();
        htmlContent += `<h2>Curso: ${courseTitle}</h2>`;
        
        // Resumo do Curso (Novo)
        htmlContent += `
          <div class="summary-box" style="margin-bottom: 20px; padding: 10px; background-color: #fff;">
            <h3 style="margin-top: 0;">Resumo do Curso</h3>
            <table>
              <tr>
                <th>Média (1ª)</th>
                <th>Alunos (1ª)</th>
                <th>Média (2ª)</th>
                <th>Alunos (2ª)</th>
                <th>Crescimento</th>
              </tr>
              <tr>
                <td style="font-size: 14px; font-weight: bold;">${item.attempt1.average}%</td>
                <td>${item.attempt1.studentCount}</td>
                <td style="font-size: 14px; font-weight: bold; color: #27ae60;">${item.attempt2.average}%</td>
                <td>${item.attempt2.studentCount}</td>
                <td style="font-size: 14px; font-weight: bold; color: ${courseGrowthColor};">${parseFloat(courseGrowth) >= 0 ? '+' : ''}${courseGrowth}%</td>
              </tr>
            </table>
          </div>
        `;

        // Tabela de Perguntas
        htmlContent += `
          <table>
            <tr>
              <th class="left" style="width: 40%">Pergunta</th>
              <th>Acertos (1ª)</th>
              <th>Erros (1ª)</th>
              <th>% (1ª)</th>
              <th>Acertos (2ª)</th>
              <th>Erros (2ª)</th>
              <th>% (2ª)</th>
              <th>Crescimento</th>
            </tr>
        `;

        item.questions.forEach(q => {
          const a1Pct = q.attempt1.total > 0 ? Math.round((q.attempt1.correct / q.attempt1.total) * 100) : 0;
          const a2Pct = q.attempt2.total > 0 ? Math.round((q.attempt2.correct / q.attempt2.total) * 100) : 0;
          const qGrowth = a2Pct - a1Pct;
          const qGrowthColor = qGrowth >= 0 ? '#27ae60' : '#c0392b';
          
          htmlContent += `
            <tr>
              <td class="left">${q.questionText}</td>
              <td>${q.attempt1.correct}</td>
              <td>${q.attempt1.total - q.attempt1.correct}</td>
              <td><b>${a1Pct}%</b></td>
              <td>${q.attempt2.correct}</td>
              <td>${q.attempt2.total - q.attempt2.correct}</td>
              <td><b>${a2Pct}%</b></td>
              <td style="color: ${qGrowthColor}; font-weight: bold;">${qGrowth >= 0 ? '+' : ''}${qGrowth}%</td>
            </tr>
          `;
        });
        htmlContent += `</table>`;

        // Demografia
        const generateDemoTable = (title: string, data: Record<string, number>, total: number) => {
          let rows = '';
          Object.entries(data).forEach(([k, v]) => {
            rows += `<tr><td class="left">${k}</td><td>${v}</td><td>${((v/total)*100).toFixed(1)}%</td></tr>`;
          });
          return `
            <div class="stat-box">
              <h3>${title}</h3>
              <table><tr><th class="left">Tipo</th><th>Qtd</th><th>%</th></tr>${rows}</table>
            </div>
          `;
        };

        htmlContent += `<div style="margin-top: 20px;">`;
        htmlContent += generateDemoTable("Sexo", item.demographics.sex, item.demographics.totalStudents);
        htmlContent += generateDemoTable("Idade", item.demographics.age, item.demographics.totalStudents);
        htmlContent += generateDemoTable("Turma", item.demographics.class, item.demographics.totalStudents);
        htmlContent += `</div>`;
      });

      htmlContent += `</body></html>`;

      const { uri } = await Print.printToFileAsync({ html: htmlContent });
      
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, {
          mimeType: 'application/pdf',
          dialogTitle: 'Exportar Relatório PDF'
        });
      } else {
        Alert.alert("Sucesso", "PDF gerado, mas compartilhamento não disponível.");
      }

    } catch (error) {
      console.error("Erro ao gerar PDF:", error);
      Alert.alert("Erro", "Não foi possível gerar o PDF.");
    }
  };

  const handleWipeData = () => {
    setWipeConfirmationText("");
    setWipeModalVisible(true);
  };

  const performWipe = async () => {
    if (wipeConfirmationText !== "APAGAR") {
      Alert.alert("Confirmação Incorreta", "Por favor, digite APAGAR em letras maiúsculas para confirmar.");
      return;
    }
    setWipeModalVisible(false);
    setLoading(true);
    try {
      const count = await wipeAllAssessmentData();
      Alert.alert("Sucesso", `${count} registros apagados. O relatório está vazio.`);
      setReportData(null);
    } catch (error: any) {
      Alert.alert("Erro", `Falha ao apagar dados: ${error?.message || "Erro desconhecido"}`);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleCourse = async (courseId: string, newValue: boolean) => {
    // Atualização otimista da UI
    setCourses(prev => prev.map(c => c.id === courseId ? { ...c, isVisible: newValue } : c));
    
    const success = await toggleCourseVisibility(courseId, newValue);
    if (!success) {
      // Reverte se falhar
      setCourses(prev => prev.map(c => c.id === courseId ? { ...c, isVisible: !newValue } : c));
      Alert.alert("Erro", "Falha ao atualizar visibilidade do curso.");
    }
  };

  const handleToggleSetting = async (key: keyof AppSettings, value: boolean) => {
    // Otimista
    setAppSettings(prev => ({ ...prev, [key]: value }));
    
    const success = await updateAppSetting(key, value);
    if (!success) {
      setAppSettings(prev => ({ ...prev, [key]: !value }));
      Alert.alert("Erro", "Falha ao atualizar configuração.");
    }
  };

  const handleOpenRanking = async () => {
    setRankingModalVisible(true);
    setRankingLoading(true);
    try {
      // Usa a turma selecionada (ou null para todas)
      const data = await fetchLeaderboard(selectedClass);
      setLeaderboard(data);
    } catch  {
      Alert.alert("Erro", "Não foi possível carregar o ranking.");
    } finally {
      setRankingLoading(false);
    }
  };

  const handleFilterRanking = async (cls: string | null) => {
    setSelectedClass(cls);
    setRankingLoading(true);
    try {
      const data = await fetchLeaderboard(cls);
      setLeaderboard(data);
    } catch (error) {
      console.error(error);
    } finally {
      setRankingLoading(false);
    }
  };

  const handleResetXP = () => {
    setResetXPConfirmation("");
    setResetXPModalVisible(true);
  };

  const performResetXP = async () => {
    if (resetXPConfirmation !== "ZERAR") {
      Alert.alert("Confirmação Incorreta", "Digite ZERAR em maiúsculas para confirmar.");
      return;
    }
    setResetXPModalVisible(false);
    setLoading(true);
    try {
      const count = await resetAllUsersXP();
      Alert.alert("Sucesso", `XP resetado para ${count} usuários.`);
    } catch (error: any) {
      Alert.alert("Erro", `Falha ao resetar XP: ${error?.message || "Erro desconhecido"}`);
    } finally {
      setLoading(false);
    }
  };

  const styles = createStyles(colors);

  if (!loading && !hasPermission) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>
        <View style={styles.center}>
          <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#dc2626', marginBottom: 10 }}>Acesso Negado</Text>
          <Text style={{ color: colors.text }}>Você não tem permissão de administrador para ver esta tela.</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
        <ActivityIndicator size="large" color="#dc2626" />
        <Text style={{ marginTop: 10, color: colors.text }}>Gerando relatório...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => router.back()} style={styles.iconButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Desempenho Geral</Text>
        <TouchableOpacity onPress={loadData} style={styles.iconButton}>
          <Ionicons name="refresh" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
      
      {/* Seção Configurações Globais */}
      <TouchableOpacity style={styles.collapsibleHeader} onPress={() => toggleSection('settings')} activeOpacity={0.7}>
        <Text style={styles.sectionHeader}>Configurações Globais</Text>
        <Ionicons name={expandSettings ? "chevron-up" : "chevron-down"} size={20} color={colors.text} />
      </TouchableOpacity>

      {expandSettings && (
        <View style={styles.managementCard}>
          <View style={styles.toggleRow}>
            <Text style={[styles.toggleLabel, { color: colors.text }]}>Loja de Itens Ativa</Text>
            <Switch
              value={appSettings.isStoreEnabled !== false}
              onValueChange={(val) => handleToggleSetting('isStoreEnabled', val)}
              trackColor={{ false: "#767577", true: "#3b82f6" }}
            />
          </View>
          <View style={styles.toggleRow}>
            <Text style={[styles.toggleLabel, { color: colors.text }]}>Vidas Infinitas (Todos)</Text>
            <Switch
              value={appSettings.globalInfiniteLives === true}
              onValueChange={(val) => handleToggleSetting('globalInfiniteLives', val)}
              trackColor={{ false: "#767577", true: "#3b82f6" }}
            />
          </View>
          <View style={styles.toggleRow}>
            <Text style={[styles.toggleLabel, { color: colors.text }]}>Modo Premium na Loja</Text>
            <Switch
              value={appSettings.isPremiumModeEnabled !== false}
              onValueChange={(val) => handleToggleSetting('isPremiumModeEnabled', val)}
              trackColor={{ false: "#767577", true: "#3b82f6" }}
            />
          </View>
        </View>
      )}

      {/* Seção Visibilidade */}
      <TouchableOpacity style={styles.collapsibleHeader} onPress={() => toggleSection('visibility')} activeOpacity={0.7}>
        <Text style={styles.sectionHeader}>Gerenciar Visibilidade dos Cursos</Text>
        <Ionicons name={expandVisibility ? "chevron-up" : "chevron-down"} size={20} color={colors.text} />
      </TouchableOpacity>
      
      {expandVisibility && (
        <View style={styles.managementCard}>
          {courses.map((course) => (
            <View key={course.id} style={styles.toggleRow}>
              <Text style={[styles.toggleLabel, { color: colors.text }]}>{course.title}</Text>
              <Switch
                value={course.isVisible !== false}
                onValueChange={(val) => handleToggleCourse(course.id, val)}
                trackColor={{ false: "#767577", true: "#3b82f6" }}
                thumbColor={course.isVisible !== false ? "#fff" : "#f4f3f4"}
              />
            </View>
          ))}
        </View>
      )}

      {/* Seção Gamificação */}
      <TouchableOpacity style={styles.collapsibleHeader} onPress={() => toggleSection('gamification')} activeOpacity={0.7}>
        <Text style={styles.sectionHeader}>Gamificação</Text>
        <Ionicons name={expandGamification ? "chevron-up" : "chevron-down"} size={20} color={colors.text} />
      </TouchableOpacity>

      {expandGamification && (
        <View style={styles.buttonRow}>
          <TouchableOpacity style={[styles.exportButton, { backgroundColor: '#2563eb', flex: 1, marginRight: 10 }]} onPress={handleOpenRanking}>
            <Text style={styles.exportButtonText}>Ver Ranking XP</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.exportButton, { backgroundColor: '#b91c1c', flex: 1 }]} onPress={handleResetXP}>
            <Text style={styles.exportButtonText}>Zerar XP (Todos)</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Seção Relatório */}
      <TouchableOpacity style={styles.collapsibleHeader} onPress={() => toggleSection('report')} activeOpacity={0.7}>
        <Text style={styles.sectionHeader}>Comparativo: 1ª Tentativa vs Pós-Teste</Text>
        <Ionicons name={expandReport ? "chevron-up" : "chevron-down"} size={20} color={colors.text} />
      </TouchableOpacity>

      {expandReport && (
        (!reportData || reportData.courses.length === 0) ? (
          <View style={{ padding: 20, alignItems: 'center' }}>
            <Text style={{ color: colors.text }}>Nenhum dado de avaliação encontrado.</Text>
          </View>
        ) : (
        <>
          <TouchableOpacity style={[styles.exportButton, { backgroundColor: '#7f1d1d', marginBottom: 15 }]} onPress={handleWipeData}>
            <Text style={styles.exportButtonText}>⚠️ LIMPAR DADOS (RESET) ⚠️</Text>
          </TouchableOpacity>

          <View style={styles.buttonRow}>
            <TouchableOpacity style={[styles.exportButton, { backgroundColor: '#10b981', flex: 1, marginRight: 10 }]} onPress={exportToCsv}>
              <Text style={styles.exportButtonText}>Excel (CSV)</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.exportButton, { backgroundColor: '#ef4444', flex: 1 }]} onPress={exportToPdf}>
              <Text style={styles.exportButtonText}>PDF</Text>
            </TouchableOpacity>
          </View>

          {reportData.courses.map((item) => {
            const courseTitle = courses.find(c => c.id === item.courseId)?.title || item.courseId.toUpperCase();
            
            return (
            <View key={item.courseId} style={styles.courseCard}>
              <Text style={[styles.courseTitle, { color: colors.text }]}>{courseTitle}</Text>
          
          <View style={styles.comparisonRow}>
            {/* Coluna 1ª Tentativa */}
            <View style={styles.statColumn}>
              <Text style={[styles.statLabel, { color: colors.text }]}>1ª Tentativa</Text>
              <Text style={[styles.statValue, { color: '#2563eb' }]}>{item.attempt1.average}%</Text>
              <Text style={[styles.statSub, { color: colors.text }]}>{item.attempt1.studentCount} alunos</Text>
            </View>

            {/* Divisor */}
            <View style={[styles.divider, { backgroundColor: colors.border || '#eee' }]} />

            {/* Coluna 2ª Tentativa */}
            <View style={styles.statColumn}>
              <Text style={[styles.statLabel, { color: colors.text }]}>Pós-Teste (2ª)</Text>
              <Text style={[styles.statValue, { color: item.attempt2.average >= item.attempt1.average ? '#16a34a' : '#dc2626' }]}>
                {item.attempt2.average}%
              </Text>
              <Text style={[styles.statSub, { color: colors.text }]}>{item.attempt2.studentCount} alunos</Text>
            </View>
          </View>
        </View>
            );
          })}
        </>
        )
      )}
    </ScrollView>

    {/* Modal de Confirmação de Limpeza */}
    <Modal
      // ANIMACAO: fade nativo do Modal de confirmacao.
      animationType="fade"
      transparent={true}
      visible={wipeModalVisible}
      onRequestClose={() => setWipeModalVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>⚠️ ZONA DE PERIGO ⚠️</Text>
          <Text style={styles.modalText}>
            Isso apagará <Text style={{fontWeight: 'bold'}}>PERMANENTEMENTE</Text> todo o histórico de tentativas de todos os alunos.
          </Text>
          <Text style={styles.modalText}>
            Para confirmar, digite <Text style={{fontWeight: 'bold', color: '#dc2626'}}>APAGAR</Text> abaixo:
          </Text>
          
          <TextInput
            style={styles.modalInput}
            placeholder="Digite APAGAR"
            placeholderTextColor="#999"
            value={wipeConfirmationText}
            onChangeText={(text) => setWipeConfirmationText(text.toUpperCase())}
            autoCapitalize="characters"
          />

          <View style={styles.modalButtons}>
            <TouchableOpacity style={[styles.modalButton, { backgroundColor: '#ccc' }]} onPress={() => setWipeModalVisible(false)}>
              <Text style={styles.modalButtonText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.modalButton, { backgroundColor: '#dc2626' }]} onPress={performWipe}>
              <Text style={[styles.modalButtonText, { color: 'white' }]}>CONFIRMAR</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>

    {/* Modal de Ranking */}
    <Modal
      // ANIMACAO: slide nativo do Modal de ranking.
      animationType="slide"
      transparent={true}
      visible={rankingModalVisible}
      onRequestClose={() => setRankingModalVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { maxHeight: '80%' }]}>
          <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: '100%', marginBottom: 15}}>
            <Text style={[styles.modalTitle, {marginBottom: 0, color: colors.text}]}>Ranking Global de XP</Text>
            <TouchableOpacity onPress={() => setRankingModalVisible(false)}>
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>
          
          {/* Filtro de Turma DENTRO do Modal */}
          {availableClasses.length > 0 && (
            <View style={{ marginBottom: 15, height: 40 }}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
                <TouchableOpacity
                  style={[styles.filterChip, !selectedClass && styles.filterChipActive]}
                  onPress={() => handleFilterRanking(null)}
                >
                  <Text style={[styles.filterChipText, !selectedClass && styles.filterChipTextActive]}>Todas</Text>
                </TouchableOpacity>
                {availableClasses.map((cls) => (
                  <TouchableOpacity
                    key={cls}
                    style={[styles.filterChip, selectedClass === cls && styles.filterChipActive]}
                    onPress={() => handleFilterRanking(cls)}
                  >
                    <Text style={[styles.filterChipText, selectedClass === cls && styles.filterChipTextActive]}>{cls}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

          {rankingLoading ? (
            <View style={{ padding: 20 }}>
              <ActivityIndicator size="large" color={colors.primary} />
            </View>
          ) : (
            <ScrollView style={{ width: '100%' }}>
            {leaderboard.map((user, index) => (
              <View key={user.id} style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.border || '#eee' }}>
                <Text style={{ fontWeight: 'bold', width: 30, color: colors.text }}>{index + 1}</Text>
                <Text style={{ fontSize: 20, marginRight: 10 }}>{user.avatar}</Text>
                <Text style={{ flex: 1, color: colors.text, fontWeight: '600' }}>{user.name}</Text>
                <Text style={{ fontWeight: 'bold', color: '#2563eb' }}>{user.xp} XP</Text>
              </View>
            ))}
          </ScrollView>
          )}
        </View>
      </View>
    </Modal>

    {/* Modal de Reset XP */}
    <Modal
      // ANIMACAO: fade nativo do Modal de reset de XP.
      animationType="fade"
      transparent={true}
      visible={resetXPModalVisible}
      onRequestClose={() => setResetXPModalVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>⚠️ RESETAR XP ⚠️</Text>
          <Text style={styles.modalText}>
            Isso definirá o XP e a Ofensiva de <Text style={{fontWeight: 'bold'}}>TODOS</Text> os usuários para 0.
          </Text>
          <Text style={styles.modalText}>
            Essa ação não pode ser desfeita.
          </Text>
          <Text style={styles.modalText}>
            Para confirmar, digite <Text style={{fontWeight: 'bold', color: '#dc2626'}}>ZERAR</Text> abaixo:
          </Text>
          
          <TextInput
            style={styles.modalInput}
            placeholder="Digite ZERAR"
            placeholderTextColor="#999"
            value={resetXPConfirmation}
            onChangeText={(text) => setResetXPConfirmation(text.toUpperCase())}
            autoCapitalize="characters"
          />

          <View style={styles.modalButtons}>
            <TouchableOpacity style={[styles.modalButton, { backgroundColor: '#ccc' }]} onPress={() => setResetXPModalVisible(false)}>
              <Text style={styles.modalButtonText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.modalButton, { backgroundColor: '#dc2626' }]} onPress={performResetXP}>
              <Text style={[styles.modalButtonText, { color: 'white' }]}>CONFIRMAR</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
    </SafeAreaView>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: 20 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: colors.text },
  iconButton: { padding: 5 },
  date: { fontSize: 14, color: colors.text, opacity: 0.7, marginBottom: 20, textAlign: 'center' },
  courseCard: { 
    backgroundColor: colors.card || (colors.background === '#000' ? '#1c1c1e' : 'white'), 
    padding: 15, 
    borderRadius: 10, 
    marginBottom: 10, 
    borderLeftWidth: 5, 
    borderLeftColor: '#2563eb',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  courseTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 10 },
  buttonRow: { flexDirection: 'row', marginBottom: 20 },
  exportButton: { padding: 12, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  exportButtonText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
  
  comparisonRow: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', marginTop: 5 },
  statColumn: { alignItems: 'center', flex: 1 },
  statLabel: { fontSize: 12, marginBottom: 4, fontWeight: '600' },
  statValue: { fontSize: 24, fontWeight: 'bold' },
  statSub: { fontSize: 11, opacity: 0.7 },
  divider: { width: 1, height: 40 },

  // Estilos de Gerenciamento
  managementCard: {
    backgroundColor: colors.card || (colors.background === '#000' ? '#1c1c1e' : 'white'),
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    elevation: 2,
  },
  sectionHeader: { fontSize: 18, fontWeight: 'bold', color: colors.text },
  collapsibleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: colors.border || '#eee',
    marginBottom: 10,
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border || '#eee',
  },
  toggleLabel: { fontSize: 16, fontWeight: '600' },

  // Estilos de Filtro
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.card || '#eee',
    borderWidth: 1,
    borderColor: colors.border || '#ccc',
  },
  filterChipActive: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },
  filterChipText: {
    color: colors.text,
    fontWeight: '600',
  },
  filterChipTextActive: {
    color: 'white',
  },
  
  // Estilos do Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: colors.card || (colors.background === '#000' ? '#1c1c1e' : 'white'),
    borderRadius: 12,
    padding: 20,
    width: '100%',
    maxWidth: 350,
    alignItems: 'center',
    elevation: 5,
  },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#dc2626', marginBottom: 10 },
  modalText: { color: colors.text, textAlign: 'center', marginBottom: 10 },
  modalInput: {
    width: '100%',
    borderWidth: 1,
    borderColor: colors.border || '#ccc',
    borderRadius: 8,
    padding: 12,
    color: colors.text,
    marginBottom: 20,
    textAlign: 'center',
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  modalButtons: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', gap: 10 },
  modalButton: { flex: 1, padding: 12, borderRadius: 8, alignItems: 'center' },
  modalButtonText: { fontWeight: 'bold', color: '#333' },
});
