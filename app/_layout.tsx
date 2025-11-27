import { Stack } from "expo-router";
import { ThemeProvider } from "./context/ThemeContext";

export default function RootLayout() {
  return (

    <ThemeProvider>
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      >

        <Stack.Screen name="index"/>
        <Stack.Screen name="screens/login"/>
        <Stack.Screen name="screens/cadastrar"/>
        <Stack.Screen name="screens/RCP"/>
        <Stack.Screen name="screens/LessonScreen"/>
        <Stack.Screen name="screens/LessonResultScreen"/>
        <Stack.Screen name="screens/UserProfileScreen"/>
        <Stack.Screen name="(tabs)" />
      </Stack>
      
    </ThemeProvider>
  );
}
