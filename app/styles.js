import { StyleSheet } from "react-native";


const styles = StyleSheet.create({
  container:{
    flex:1,
    alignItems:"center",
    justifyContent:"center",
    backgroundColor: "#121212",
    gap:20
    
  },
  imagem:{
    height:250,
    width:320,
    resizeMode:"contain",
    position:"absolute",
    top: 100,
    
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
    top:50
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

  }

    
  });
  export default styles;