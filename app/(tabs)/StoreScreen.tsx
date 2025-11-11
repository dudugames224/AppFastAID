import React from "react";
import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../context/ThemeContext";

const StoreScreen = () => {
  const { styles } = useTheme();
  return (
    <SafeAreaView style={styles.safe}>
            <View style={{alignContent:"center", alignItems:"center", justifyContent:"center", flex:1}}>
                <View style={styles.topicHeader}>
            <Text style={styles.courseTitle}>EM BREVE...</Text>
        </View>
            </View>
            
        </SafeAreaView>
  );
};

export default StoreScreen;