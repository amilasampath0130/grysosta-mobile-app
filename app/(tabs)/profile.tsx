import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import React, { useState, useEffect } from "react";
import { router } from "expo-router";
import { Theme } from "@/theme";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { TokenStorage } from "@/utils/tokenStorage";
import { useAlert } from '@/contexts/AlertContext';

interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  mobileNumber: string;
  profileImage: string;
  lastLogin: string;
  createdAt: string;
}

export default function Profile() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { showAlert } = useAlert();

  // ✅ UPDATED: Get token from TokenStorage
  const getToken = (): string | null => {
    return TokenStorage.getToken();
  };

  const fetchUserProfile = async () => {
    try {
      // ✅ UPDATED: Get token from storage
      const token = getToken();

      if (!token) {
        // If no token, redirect immediately to auth
        router.replace("/(auth)");
        return;
      }

      console.log("Fetching user profile...");

      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/auth/profile`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Profile response status:", response.status);

      if (response.status === 401) {
        showAlert({
          title: "Session Expired",
          message: "Your session has expired. Please login again.",
          type: "warning",
          onConfirm: () => {
            router.replace("/(auth)");
          }
        });
        return;
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Profile data:", data);

      if (data.success) {
        setUser(data.user);
      } else {
        throw new Error(data.message || "Failed to fetch profile");
      }
    } catch (error) {
      // console.error("Error fetching profile:", error);
      showAlert({
        title: "Profile Error",
        message: error instanceof Error ? error.message : "Failed to load profile data",
        type: "error"
      });
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchUserProfile();
  };

  const handleLogout = () => {
    showAlert({
      title: "Logout",
      message: "Are you sure you want to logout?",
      type: "warning",
      showCancel: true,
      confirmText: "Logout",
      cancelText: "Cancel",
      onConfirm: () => {
        // ✅ UPDATED: Clear token and redirect immediately
        TokenStorage.clearToken();
        setUser(null);
        
        // Redirect immediately without showing success alert
        router.replace("/(auth)");
        
        // Show toast notification instead of blocking alert
        // You can use your toast/notification system here
        console.log("User logged out successfully");
      }
    });
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (error) {
      return "Unknown date";
    }
  };

  // ✅ ADDED: Check if user is authenticated on component mount
  useEffect(() => {
    const checkAuthentication = async () => {
      const token = getToken();
      if (!token) {
        router.replace("/(auth)");
      }
    };
    
    checkAuthentication();
  }, []);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={Theme.colors.gold} />
          <Text style={styles.loadingText}>Loading your profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!user) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centered}>
          <Ionicons
            name="person-circle-outline"
            size={64}
            color={Theme.colors.text_Secondary}
          />
          <Text style={styles.errorText}>Failed to load profile</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={fetchUserProfile}
          >
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>My Profile</Text>
          <TouchableOpacity
            style={styles.refreshButton}
            onPress={handleRefresh}
            disabled={refreshing}
          >
            {refreshing ? (
              <ActivityIndicator size="small" color={Theme.colors.gold} />
            ) : (
              <Ionicons name="refresh" size={24} color={Theme.colors.gold} />
            )}
          </TouchableOpacity>
        </View>

        {/* Profile Card */}
        <View style={styles.profileCard}>
          {/* Profile Image and Basic Info */}
          <View style={styles.profileHeader}>
            {/* Avatar with first letter */}
            <View style={styles.avatarContainer}>
              <Text style={styles.avatarText}>
                {user.name ? user.name.charAt(0).toUpperCase() : "U"}
              </Text>
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.userName}>{user.name}</Text>
              <Text style={styles.userUsername}>@{user.username}</Text>
              <Text style={styles.userEmail}>{user.email}</Text>
            </View>
          </View>

          {/* Account Information */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Account Information</Text>

            <View style={styles.infoItem}>
              <Ionicons
                name="person-outline"
                size={20}
                color={Theme.colors.text_Secondary}
              />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Full Name</Text>
                <Text style={styles.infoValue}>{user.name}</Text>
              </View>
            </View>

            <View style={styles.infoItem}>
              <Ionicons
                name="at-outline"
                size={20}
                color={Theme.colors.text_Secondary}
              />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Username</Text>
                <Text style={styles.infoValue}>@{user.username}</Text>
              </View>
            </View>

            <View style={styles.infoItem}>
              <Ionicons
                name="mail-outline"
                size={20}
                color={Theme.colors.text_Secondary}
              />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Email</Text>
                <Text style={styles.infoValue}>{user.email}</Text>
              </View>
            </View>

            {user.mobileNumber && (
              <View style={styles.infoItem}>
                <Ionicons
                  name="call-outline"
                  size={20}
                  color={Theme.colors.text_Secondary}
                />
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Mobile Number</Text>
                  <Text style={styles.infoValue}>{user.mobileNumber}</Text>
                </View>
              </View>
            )}
          </View>

          {/* Account Details */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Account Details</Text>

            <View style={styles.infoItem}>
              <Ionicons
                name="calendar-outline"
                size={20}
                color={Theme.colors.text_Secondary}
              />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Member Since</Text>
                <Text style={styles.infoValue}>
                  {formatDate(user.createdAt)}
                </Text>
              </View>
            </View>

            {user.lastLogin && (
              <View style={styles.infoItem}>
                <Ionicons
                  name="time-outline"
                  size={20}
                  color={Theme.colors.text_Secondary}
                />
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Last Login</Text>
                  <Text style={styles.infoValue}>
                    {formatDate(user.lastLogin)}
                  </Text>
                </View>
              </View>
            )}

            <View style={styles.infoItem}>
              <Ionicons
                name="key-outline"
                size={20}
                color={Theme.colors.text_Secondary}
              />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>User ID</Text>
                <Text style={styles.infoValue}>{user.id}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={24} color="#ff4757" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

// ... your styles remain exactly the same
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Theme.colors.background_deep,
  },
  container: {
    flex: 1,
    padding: 16,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  loadingText: {
    color: Theme.colors.text_Secondary,
    marginTop: 16,
    fontSize: 16,
  },
  errorText: {
    color: Theme.colors.text_Secondary,
    marginTop: 16,
    fontSize: 18,
    textAlign: "center",
  },
  retryButton: {
    marginTop: 20,
    backgroundColor: Theme.colors.gold,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: Theme.colors.background_deep,
    fontWeight: "600",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: Theme.colors.text_primary,
  },
  refreshButton: {
    padding: 8,
  },
  profileCard: {
    backgroundColor: Theme.colors.background_alien,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Theme.colors.gold,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Theme.colors.background_deep,
  },
  profileInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Theme.colors.text_primary,
    marginBottom: 4,
  },
  userUsername: {
    fontSize: 16,
    color: Theme.colors.gold,
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 14,
    color: Theme.colors.text_Secondary,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: Theme.colors.text_primary,
    marginBottom: 16,
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.background_deep,
  },
  infoContent: {
    flex: 1,
    marginLeft: 12,
  },
  infoLabel: {
    fontSize: 14,
    color: Theme.colors.text_Secondary,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 16,
    color: Theme.colors.text_primary,
    fontWeight: "500",
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ff475720",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#ff475740",
  },
  logoutText: {
    fontSize: 16,
    color: "#ff4757",
    fontWeight: "600",
    marginLeft: 8,
  },
});