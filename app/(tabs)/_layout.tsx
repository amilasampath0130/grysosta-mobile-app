import React from "react";
import { Tabs } from "expo-router";
import { FontAwesome6, Ionicons } from "@expo/vector-icons";
import { Theme } from "@/theme";
// ✅ ADD DEFAULT EXPORT
export default function TabsLayout() {
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
        name="coins"
        options={{
          title: "Coins",
          tabBarIcon: ({ color, size }) => (
            <FontAwesome6 name="coins" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="coinPortfolio"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="myRewards"
        options={{
          title: "Rewards",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="gift-outline" size={size} color={color} />
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
          href: null,
        }}
      />
    </Tabs>
  );
}
