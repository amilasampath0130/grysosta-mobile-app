import { AlertProvider } from "@/contexts/AlertContext";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

// ✅ ADD THIS - DEFAULT EXPORT
export default function RootLayout() {
  return (
    <AlertProvider>
      <>
        <StatusBar style="light" />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="(Game)" />
        </Stack>
      </>
    </AlertProvider>
  );
}
