import { Dimensions, StyleSheet } from "react-native";
const { width, height } = Dimensions.get('window');

const lightColors = {
  background: "#F0F2F5", // Um cinza claro para o fundo
  text: "#1C1E21", // Texto escuro
  textClaro: "#F0F2F5",
  primary: "#238bccff",
  card: "#FFFFFF", // Cards brancos
  inputBackground: "#E8E8E8",
  inputTextColor: "#000000",
  sosButton: "#D93F3F",
  sosCard: "#FF4B4B",
  sosOption: "#FFD5D5",
  ofensivaPerdida:"#f80202ff",
  circle:"#dbdbdbff",
  border:"#cecdcdff",
};

const darkColors = {
  background: "#121212",
  textClaro: "#F0F2F5",
  text: "#FFFFFF",
  primary: "#238bccff",
  card: "#1f1e1eff",
  inputBackground: "#272626ff",
  inputTextColor: "#FFFFFF",
  sosButton: "#FF4B4B",
  sosCard: "#FF4B4B",
  sosOption: "#FFD5D5",
  ofensivaPerdida:"#392323",
  circle:"#4A4A4A",
  border:"#2D2D2D",
};
const getThemedStyles = (theme = 'light') => {
  const colors = theme === 'dark' ? darkColors : lightColors;

  const styles = StyleSheet.create({
  containerLogin:{
    flex:1,
    alignItems:"center",
    backgroundColor: colors.background,
  },
  imagem:{
    height:250,
    width:320,
    resizeMode:"contain",
    marginTop: height * 0.02,
    //position:"absolute",
    //top: 100,
  },
  titulo:{
   //color: "#0eb6f8ff",
   color: colors.primary,
    fontSize:40,
    textAlign:"center",
    fontWeight:"700",
  },
  caixa:{
    backgroundColor: colors.card,
    padding:15,
    gap:15,
    borderRadius:20,
    paddingBottom:30,
    width:330,
    
  },
  caixaBand:{
    backgroundColor: colors.card,
    padding:5,
    gap:0,
    borderRadius:20,
    paddingBottom:5,
    width:330,
  },
  caixaInsercao:{
    backgroundColor: colors.inputBackground,
    borderRadius:10,
    padding:10,
    paddingLeft:12,
    width:300,
    height:45,
    color: colors.inputTextColor,

  },
  botao:{
    backgroundColor: colors.primary,
    padding:10,
    borderRadius:7,


  },
  textoBotao:{
    color: "#fff",
    fontWeight:"700",
    textAlign:"center"

  },
  link:{

  },
  textoLink:{
    color: colors.primary,
    textAlign:"center",

  },
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 20,
    paddingEnd:50,
  },
  character: {
    width: 120,
    height: 120,
    resizeMode: "contain",
    marginBottom: 16,
  },
  topicHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 30,
    alignSelf: "center",
    padding: 10,
    backgroundColor: colors.card,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: colors.border,
  },
  topicIcon: {
    width: 50,
    height: 50,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  topicIconImage: {
    width: 50,
    height: 50,
    borderRadius: 12,
    resizeMode: "cover",
    marginRight: 12,
  },
  courseTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: colors.text,
    marginRight: 8,
  },
  chevron: {
    color: "#A9A9A9",
    fontSize: 16,
  },
  lessonPath: {
    alignItems: "center",
    paddingBottom: 40,
    width: "100%",
  },
  unitButton: {
    alignItems: "center",
    marginBottom: 20,
  },
  unitIconContainer: {
    width: 90,
    height: 90,
    borderRadius: 45,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
    position: "relative",
  },
  unitSymbol: {
    fontSize: 28,
    color: "#FFFFFF",
  },
  unitLabel: {
    fontWeight: "600",
    fontSize: 16,
    color: colors.text,
  },
  pathConnector: {
    width: 4,
    height: 50,
    backgroundColor: "#2D2D2D",
    marginBottom: 20,
  },
  streakLossContainer: {
    backgroundColor: colors.ofensivaPerdida,
    padding: 15,
    borderRadius: 12,
    marginBottom: 20,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#FF4B4B",
  },
  streakLossTitle: {
    color: colors.textClaro,
    fontSize: 18,
    fontWeight: "bold",
  },
  streakLossText: {
    color: colors.textClaro,
    fontSize: 16,
    textAlign: "center",
    marginTop: 5,
  },
  sosButton: {
    position: "absolute",
    right: 20,
    bottom: 20,
    zIndex: 10,
  },
  sosTouchable: { // Mantido vermelho para destaque
    backgroundColor: "#FF4B4B",
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
    elevation: 6,
  },
  sosText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 18,
  },
  BarraNavegacao: {
    width: 240, // Largura fixa
    backgroundColor: "#1E3A8A",
    paddingVertical: 20,
    paddingHorizontal: 10,
    borderRightWidth: 0,
  },
  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 40,
    width: "100%",
    paddingLeft: 6,
  },
  logoText: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginLeft: 10,
  },
  BarraNavegacaoButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    marginBottom: 8,
    borderRadius: 12,
    width: "100%",
    borderWidth: 2,
    borderColor: "transparent",
  },
  BarraNavegacaoButtonActive: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderColor: "#FFFFFF",
  },
  BarraNavegacaoText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#DBEAFE",
    marginLeft: 16,
  },
  BarraNavegacaoTextActive: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
    marginLeft: 16,
  },
  tabBarContainer: {
    flexDirection: "row",
    height: 80,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    justifyContent: "space-around",
  },
  tabItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  container: { flex: 1, backgroundColor: colors.background, padding: 20 },
  title: { fontSize: 28, fontWeight: "bold", color: colors.text, marginBottom: 10, textAlign: "center" },
  subtitle: { fontSize: 16, color: colors.text, marginBottom: 30, textAlign: "center" },
  leaderboard: { gap: 10 },
  leaderboardRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 15,
    padding: 15,
    borderRadius: 8,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  leaderboardRowUser: {
    flexDirection: "row",
    alignItems: "center",
    gap: 15,
    padding: 15,
    borderRadius: 8,
    backgroundColor: colors.background,
    borderWidth: 2,
    borderColor: "#3B82F6",
  },
  playerName: { flex: 1, fontSize: 16, color: colors.text },
  playerXp: { fontWeight: "bold", fontSize: 16, color: colors.text },
  courseCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 15,
    width: "100%",
    padding: 20,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 15,
    backgroundColor: colors.background,
    marginBottom: 15,
  },
  topicIcon: { width: 50, height: 50, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  topicIconImage: { width: 50, height: 50, resizeMode: "contain" },
  arrow: { color: "#A9A9A9", fontSize: 24 },


  });

  
  const panicStyles = StyleSheet.create({
  centerBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  card: {
    width: "100%",
    backgroundColor: colors.sosCard,
    borderRadius: 22,
    padding: 16,
    gap: 16,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  cardTitle: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 18,
  },
  cardClose: {
    position: "absolute",
    right: 6,
    top: -10,
    backgroundColor: "rgba(255,255,255,0.25)",
    borderRadius: 16,
    padding: 6,
  },
  option: {
    backgroundColor: colors.sosOption,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  optionIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  optionLabel: {
    fontSize: 16,
    fontWeight: "700",
    color: "#000",
  },
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: "#FF4B4B",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
    gap: 12,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  
  close: {
    backgroundColor: "rgba(255,255,255,0.25)",
    borderRadius: 16,
    padding: 6,
  },
  option: {
    backgroundColor: "#FFD5D5",
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  optionIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  optionLabel: {
    fontSize: 16,
    fontWeight: "700",
    color: "#000",
  },
  
});

  return { styles, panicStyles, colors };
};

export default getThemedStyles;
