import React from "react";
import { Tabs, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { TouchableOpacity, Alert } from "react-native";
import { Theme } from "@/theme";

// ✅ ADD DEFAULT EXPORT
export default function TabsLayout() {
  const router = useRouter();

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Logout",
        style: "destructive",
        onPress: () => {
          // For now, just navigate to auth
          router.replace("/(auth)");
        },
      },
    ]);
  };

  return (
    <Tabs
      screenOptions={{
        headerStyle: {
          backgroundColor: Theme.colors.background_beige,
        },
        headerShadowVisible: false,
        headerTintColor: Theme.colors.text_charcoal,
        tabBarStyle: {
          backgroundColor: Theme.colors.background_cream,
          borderTopColor: Theme.colors.background_sand,
        },
        tabBarActiveTintColor: Theme.colors.accent_terracotta,
        tabBarInactiveTintColor: Theme.colors.text_earth,
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-outline" size={size} color={color} />
          ),
          headerRight: () => null, // Remove logout button from profile
        }}
      />
      <Tabs.Screen
        name="setting"
        options={{
          title: "Settings",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="settings-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="about"
        options={{
          title: "About",
          tabBarIcon: ({ color, size }) => (
            <Ionicons
              name="information-circle-outline"
              size={size}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}
