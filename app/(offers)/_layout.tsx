import React from "react";
import { Stack } from "expo-router";
import { Theme } from "@/theme";

export default function OffersLayout() {
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
        name="offersHome"
        options={{
          headerShown: true,
          title: "Offers",
          headerTitleAlign: "center",
        }}
      />
    </Stack>
  );
}
