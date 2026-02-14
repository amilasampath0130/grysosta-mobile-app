import React from "react";
import { Stack } from "expo-router";
import { Theme } from "@/theme";

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: Theme.colors.background_beige,
        },
        headerShadowVisible: false,
        headerTintColor: Theme.colors.text_charcoal,
      }}
    >
      {/* Show header for signup */}
      <Stack.Screen
        name="gameHome"
        options={{
          headerShown: true,
          title: "Touch & Win",
          headerTitleAlign: "center",
        }}
      />
    </Stack>
  );
}
