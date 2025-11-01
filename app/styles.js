import { Dimensions, StyleSheet } from "react-native";
const { width, height } = Dimensions.get('window');


const styles = StyleSheet.create({
    
  containerLogin:{
    flex:1,
    alignItems:"center",
    backgroundColor: "#121212",
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
   color: "#238bccff",
    fontSize:40,
    textAlign:"center",
    fontWeight:"700",
    

  },
  caixa:{
    backgroundColor:"#1f1e1eff",
    padding:15,
    gap:15,
    borderRadius:20,
    paddingBottom:30,
    width:330,
    //top:50
  },
  caixaBand:{
    backgroundColor:"#1f1e1eff",
    padding:5,
    gap:0,
    borderRadius:20,
    paddingBottom:5,
    width:330,
  },
  caixaInsercao:{
    backgroundColor: "#272626ff",
    borderRadius:10,
    padding:10,
    paddingLeft:12,
    width:300,
    height:45,
    color: "#fff"

  },
  botao:{
    backgroundColor:"#238bccff",
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
    color: "#238bccff",
    textAlign:"center",

  },
  safe: {
    flex: 1,
    backgroundColor: "#121212",
  },
  container: {
    flex: 1,
    backgroundColor: "#121212",
    padding: 20,
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
    backgroundColor: "#1E1E1E",
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "#2D2D2D",
  },
  topicIcon: {
    width: 50,
    height: 50,
    borderRadius: 12,
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
    color: "#FFFFFF",
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
    color: "#FFFFFF",
  },
  pathConnector: {
    width: 4,
    height: 50,
    backgroundColor: "#2D2D2D",
    marginBottom: 20,
  },
  streakLossContainer: {
    backgroundColor: "#392323",
    padding: 15,
    borderRadius: 12,
    marginBottom: 20,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#FF4B4B",
  },
  streakLossTitle: {
    color: "#FF4B4B",
    fontSize: 18,
    fontWeight: "bold",
  },
  streakLossText: {
    color: "#A9A9A9",
    textAlign: "center",
    marginTop: 5,
  },
  sosButton: {
    position: "absolute",
    top: 1,
    left: 2,
    zIndex: 10,
  },
  sosTouchable: {
    backgroundColor: "#000",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
  },
  sosText: {
    color: "#FF4B4B",
    fontWeight: "bold",
    fontSize: 18,
  },

    
  });
  export default styles;
