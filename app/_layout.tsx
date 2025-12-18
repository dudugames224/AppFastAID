import { Stack } from "expo-router";
import { useEffect } from "react";
import { AppState } from "react-native";
import { refreshInactivityReminder } from "./services/notificationService";
import { ThemeProvider } from "./context/ThemeContext";

export default function RootLayout() {
  useEffect(() => {
    refreshInactivityReminder().catch(() => {});

    const subscription = AppState.addEventListener("change", (status) => {
      if (status === "active") {
        refreshInactivityReminder().catch(() => {});
      }
    });

    return () => subscription.remove();
  }, []);

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
        <Stack.Screen name="screens/RCPIntroScreen"/>
        <Stack.Screen name="screens/LessonScreen"/>
        <Stack.Screen name="screens/ChestRewardScreen"/>
        <Stack.Screen name="screens/LessonResultScreen"/>
        <Stack.Screen name="screens/UserProfileScreen"/>
        <Stack.Screen name="(tabs)" />
      </Stack>
      
    </ThemeProvider>
  );
}
