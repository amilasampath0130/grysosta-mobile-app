import React from "react";
import { Stack } from "expo-router";
import { Platform, StatusBar } from "react-native";
import { Theme } from "../../theme";

export default function AuthLayout() {
  return (
    <>
      <StatusBar
        barStyle="light-content"
        backgroundColor={Theme.colors.background_deep}
        translucent={Platform.OS === "android"}
      />
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: Theme.colors.background_deep,
            ...Platform.select({
              ios: {
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.1,
                shadowRadius: 3,
              },
              android: {
                elevation: 2,
                borderBottomWidth: 0,
              },
            }),
          },
          headerShadowVisible: true,
          headerTintColor: Theme.colors.text_primary,
          headerTitleStyle: {
            fontFamily: Theme.fonts.bold,
            fontSize: Platform.OS === "ios" ? 17 : 18,
            fontWeight: Platform.OS === "ios" ? "600" : "bold",
          },
          headerBackTitle: "Back",
          headerBackTitleStyle: {
            fontFamily: Theme.fonts.medium,
            fontSize: 15,
          },
          contentStyle: {
            backgroundColor: Theme.colors.background_deep,
          },
          animation: Platform.OS === "ios" ? "default" : "slide_from_right",
          gestureEnabled: true,
          fullScreenGestureEnabled: Platform.OS === "ios",
        }}
      >
        <Stack.Screen
          name="index"
          options={{
            headerShown: false,
            gestureEnabled: false,
          }}
        />

        <Stack.Screen
          name="signup"
          options={{
            headerShown: true,
            title: "Create Account",
            headerTitleAlign: "center",
          }}
        />

        <Stack.Screen
          name="login"
          options={{
            headerShown: true,
            title: "Sign In",
            headerTitleAlign: "center",
          }}
        />

        <Stack.Screen
          name="resetPassword"
          options={{
            headerShown: true,
            title: "Reset Password",
            headerTitleAlign: "center",
          }}
        />

        {/* Remove this if you have a separate terms.tsx file */}
        {/* <Stack.Screen
          name="terms"
          options={{
            presentation: "modal",
            title: "Terms & Conditions",
            headerTitleAlign: "center",
          }}
        /> */}
      </Stack>
    </>
  );
}