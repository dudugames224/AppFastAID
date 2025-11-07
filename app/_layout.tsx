import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: "#121212" },
      }}
    >

      <Stack.Screen name="index"/>
      <Stack.Screen name="login"/>
      <Stack.Screen name="cadastrar"/>
      <Stack.Screen name="CourseScreen"/>
      <Stack.Screen name="screens/RCP"/>
      <Stack.Screen name="screens/LessonScreen"/>
      <Stack.Screen name="screens/LessonResultScreen"/>
      <Stack.Screen name="screens/PracticeScreen"/>
      <Stack.Screen name="screens/TournamentScreen"/>
    </Stack>
  );
}
