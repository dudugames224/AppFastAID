import { Stack } from "expo-router";
import { ThemeProvider } from "./context/ThemeContext";

export default function RootLayout() {
  return (
    // Envolvemos todo o aplicativo com o nosso provedor de tema
    <ThemeProvider>
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      >
        {/* As telas de login/cadastro ficam fora do layout com abas */}
        <Stack.Screen name="index"/>
        <Stack.Screen name="screens/login"/>
        <Stack.Screen name="screens/cadastrar"/>
        <Stack.Screen name="screens/RCP"/>
        <Stack.Screen name="screens/LessonScreen"/>
        <Stack.Screen name="screens/LessonResultScreen"/>
        <Stack.Screen name="screens/UserProfileScreen"/>

        {/* Esta linha renderiza todo o nosso grupo de abas */}
        <Stack.Screen name="(tabs)" />
      </Stack>
      
    </ThemeProvider>
  );
}
