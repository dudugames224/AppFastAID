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
    </Stack>
  );
}
