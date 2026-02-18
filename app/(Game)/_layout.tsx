import React from "react";
import { Stack } from "expo-router";
import { Theme } from "@/theme";

export default function GameLayout() {
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
      <Stack.Screen
        name="core"
        options={{
          headerShown: true,
          title: "Rewards Game",
          headerTitleAlign: "center",
        }}
      />
      <Stack.Screen
        name="vendorSelection"
        options={{
          headerShown: true,
          title: "Vendor Selection",
          headerTitleAlign: "center",
        }}
      />
      <Stack.Screen
        name="coinSelection"
        options={{
          headerShown: true,
          title: "Coin Selection",
          headerTitleAlign: "center",
        }}
      />
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
