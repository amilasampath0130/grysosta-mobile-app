import React from "react";
import { Stack } from "expo-router";

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: "#101923",
        },
        headerShadowVisible: false,
        headerTintColor: "#fff",
      }}
    >
      {/* Show header for signup */}
      <Stack.Screen
        name="gameHome"
        options={{ headerShown: true, title: "Touch & Win" ,headerTitleAlign: "center" }}
      />
    </Stack>
  );
}
