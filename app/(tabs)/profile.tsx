import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  ScrollView,
  ActivityIndicator,
  TextInput,
} from "react-native";
import React, { useState, useEffect } from "react";
import { router } from "expo-router";
import { Theme } from "@/theme";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { TokenStorage } from "@/utils/tokenStorage";
import { useAlert } from "@/contexts/AlertContext";

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
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editedProfile, setEditedProfile] = useState({
    name: "",
    username: "",
    mobileNumber: "",
  });
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
        },
      );

      console.log("Profile response status:", response.status);

      if (response.status === 401) {
        showAlert({
          title: "Session Expired",
          message: "Your session has expired. Please login again.",
          type: "warning",
          onConfirm: () => {
            router.replace("/(auth)");
          },
        });
        return;
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      // console.log("Profile data:", data);

      if (data.success) {
        setUser(data.user);
        // Initialize edited profile with current values
        setEditedProfile({
          name: data.user.name || "",
          username: data.user.username || "",
          mobileNumber: data.user.mobileNumber || "",
        });
      } else {
        throw new Error(data.message || "Failed to fetch profile");
      }
    } catch (error) {
      // console.error("Error fetching profile:", error);
      showAlert({
        title: "Profile Error",
        message:
          error instanceof Error
            ? error.message
            : "Failed to load profile data",
        type: "error",
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
      },
    });
  };

  const handleEditToggle = () => {
    if (isEditing) {
      // Cancel editing - reset to original values
      if (user) {
        setEditedProfile({
          name: user.name || "",
          username: user.username || "",
          mobileNumber: user.mobileNumber || "",
        });
      }
      setIsEditing(false);
    } else {
      setIsEditing(true);
    }
  };

  const validateProfile = (): boolean => {
    if (!editedProfile.name.trim()) {
      showAlert({
        title: "Validation Error",
        message: "Name cannot be empty",
        type: "error",
      });
      return false;
    }

    if (!editedProfile.username.trim()) {
      showAlert({
        title: "Validation Error",
        message: "Username cannot be empty",
        type: "error",
      });
      return false;
    }

    // Username validation - alphanumeric and underscores only
    const usernameRegex = /^[a-zA-Z0-9_]+$/;
    if (!usernameRegex.test(editedProfile.username)) {
      showAlert({
        title: "Validation Error",
        message: "Username can only contain letters, numbers, and underscores",
        type: "error",
      });
      return false;
    }

    // Mobile number validation - basic check
    if (editedProfile.mobileNumber && editedProfile.mobileNumber.trim()) {
      const mobileRegex = /^[+]?[\d\s-()]+$/;
      if (!mobileRegex.test(editedProfile.mobileNumber)) {
        showAlert({
          title: "Validation Error",
          message: "Please enter a valid mobile number",
          type: "error",
        });
        return false;
      }
    }

    return true;
  };

  const handleSaveProfile = async () => {
    if (!validateProfile()) {
      return;
    }

    setIsSaving(true);
    try {
      const token = getToken();
      if (!token) {
        router.replace("/(auth)");
        return;
      }

      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/auth/update-profile`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: editedProfile.name.trim(),
            username: editedProfile.username.trim(),
            mobileNumber: editedProfile.mobileNumber.trim(),
          }),
        },
      );

      const data = await response.json();

      if (response.status === 401) {
        showAlert({
          title: "Session Expired",
          message: "Your session has expired. Please login again.",
          type: "warning",
          onConfirm: () => {
            router.replace("/(auth)");
          },
        });
        return;
      }

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to update profile");
      }

      // Update local state with saved data
      setUser(data.user);
      setEditedProfile({
        name: data.user.name || "",
        username: data.user.username || "",
        mobileNumber: data.user.mobileNumber || "",
      });
      setIsEditing(false);

      showAlert({
        title: "Success",
        message: "Profile updated successfully",
        type: "success",
      });
    } catch (error) {
      showAlert({
        title: "Update Failed",
        message:
          error instanceof Error
            ? error.message
            : "Failed to update profile. Please try again.",
        type: "error",
      });
    } finally {
      setIsSaving(false);
    }
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
          <ActivityIndicator
            size="large"
            color={Theme.colors.accent_terracotta}
          />
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
            color={Theme.colors.text_brown_gray}
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
          <View style={styles.headerActions}>
            {!isEditing && (
              <TouchableOpacity
                style={styles.refreshButton}
                onPress={handleRefresh}
                disabled={refreshing}
              >
                {refreshing ? (
                  <ActivityIndicator
                    size="small"
                    color={Theme.colors.accent_terracotta}
                  />
                ) : (
                  <Ionicons
                    name="refresh"
                    size={24}
                    color={Theme.colors.accent_terracotta}
                  />
                )}
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={[styles.editButton, isEditing && styles.editButtonActive]}
              onPress={handleEditToggle}
              disabled={isSaving}
            >
              <Ionicons
                name={isEditing ? "close" : "pencil"}
                size={20}
                color={
                  isEditing
                    ? Theme.colors.background_cream
                    : Theme.colors.accent_terracotta
                }
              />
              <Text
                style={[
                  styles.editButtonText,
                  isEditing && styles.editButtonTextActive,
                ]}
              >
                {isEditing ? "Cancel" : "Edit"}
              </Text>
            </TouchableOpacity>
          </View>
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

          {/* Editable Section Banner */}
          {isEditing && (
            <View style={styles.editModeBanner}>
              <Ionicons
                name="create-outline"
                size={18}
                color={Theme.colors.accent_terracotta}
              />
              <Text style={styles.editModeBannerText}>
                Editing Mode: Update your personal details below
              </Text>
            </View>
          )}

          {/* Editable Fields Section */}
          <View style={[styles.section, isEditing && styles.editableSection]}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Personal Information</Text>
              {isEditing && (
                <View style={styles.editableBadge}>
                  <Ionicons
                    name="pencil"
                    size={14}
                    color={Theme.colors.background_cream}
                  />
                  <Text style={styles.editableBadgeText}>Editable</Text>
                </View>
              )}
            </View>

            {/* Full Name - Editable */}
            <View style={styles.infoItem}>
              <Ionicons
                name="person-outline"
                size={20}
                color={Theme.colors.text_brown_gray}
              />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Full Name</Text>
                {isEditing ? (
                  <TextInput
                    style={styles.input}
                    value={editedProfile.name}
                    onChangeText={(text) =>
                      setEditedProfile({ ...editedProfile, name: text })
                    }
                    placeholder="Enter your full name"
                    placeholderTextColor={Theme.colors.text_earth}
                    editable={!isSaving}
                  />
                ) : (
                  <Text style={styles.infoValue}>{user.name}</Text>
                )}
              </View>
            </View>

            {/* Username - Editable */}
            <View style={styles.infoItem}>
              <Ionicons
                name="at-outline"
                size={20}
                color={Theme.colors.text_brown_gray}
              />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Username</Text>
                {isEditing ? (
                  <TextInput
                    style={styles.input}
                    value={editedProfile.username}
                    onChangeText={(text) =>
                      setEditedProfile({ ...editedProfile, username: text })
                    }
                    placeholder="Enter username"
                    placeholderTextColor={Theme.colors.text_earth}
                    autoCapitalize="none"
                    editable={!isSaving}
                  />
                ) : (
                  <Text style={styles.infoValue}>@{user.username}</Text>
                )}
              </View>
            </View>
          </View>

          {/* Read-only Section - Email & Security */}
          <View style={[styles.section, isEditing && styles.readOnlySection]}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Email & Security</Text>
              {isEditing && (
                <View style={styles.readOnlyBadge}>
                  <Ionicons
                    name="lock-closed"
                    size={14}
                    color={Theme.colors.text_brown_gray}
                  />
                  <Text style={styles.readOnlyBadgeText}>Read-only</Text>
                </View>
              )}
            </View>

            {/* Email - Read-only */}
            <View style={styles.infoItem}>
              <Ionicons
                name="mail-outline"
                size={20}
                color={Theme.colors.text_brown_gray}
              />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Email Address</Text>
                <Text
                  style={[styles.infoValue, isEditing && styles.readOnlyValue]}
                >
                  {user.email}
                </Text>
              </View>
            </View>
          </View>

          {/* Mobile Number - Editable */}
          <View style={[styles.section, isEditing && styles.editableSection]}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Contact</Text>
              {isEditing && (
                <View style={styles.editableBadge}>
                  <Ionicons
                    name="pencil"
                    size={14}
                    color={Theme.colors.background_cream}
                  />
                  <Text style={styles.editableBadgeText}>Editable</Text>
                </View>
              )}
            </View>

            {/* Mobile Number - Editable */}
            {(user.mobileNumber || isEditing) && (
              <View style={styles.infoItem}>
                <Ionicons
                  name="call-outline"
                  size={20}
                  color={Theme.colors.text_brown_gray}
                />
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Mobile Number</Text>
                  {isEditing ? (
                    <TextInput
                      style={styles.input}
                      value={editedProfile.mobileNumber}
                      onChangeText={(text) =>
                        setEditedProfile({
                          ...editedProfile,
                          mobileNumber: text,
                        })
                      }
                      placeholder="Enter mobile number (optional)"
                      placeholderTextColor={Theme.colors.text_earth}
                      keyboardType="phone-pad"
                      editable={!isSaving}
                    />
                  ) : (
                    <Text style={styles.infoValue}>
                      {user.mobileNumber || "Not provided"}
                    </Text>
                  )}
                </View>
              </View>
            )}
          </View>

          {/* Save Button - Only shown when editing */}
          {isEditing && (
            <TouchableOpacity
              style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
              onPress={handleSaveProfile}
              disabled={isSaving}
            >
              {isSaving ? (
                <ActivityIndicator
                  size="small"
                  color={Theme.colors.background_cream}
                />
              ) : (
                <>
                  <Ionicons
                    name="checkmark-circle"
                    size={24}
                    color={Theme.colors.background_cream}
                  />
                  <Text style={styles.saveButtonText}>Save Changes</Text>
                </>
              )}
            </TouchableOpacity>
          )}

          {/* Account Details - Always Read-only */}
          <View style={[styles.section, isEditing && styles.readOnlySection]}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Account Details</Text>
              {isEditing && (
                <View style={styles.readOnlyBadge}>
                  <Ionicons
                    name="lock-closed"
                    size={14}
                    color={Theme.colors.text_brown_gray}
                  />
                  <Text style={styles.readOnlyBadgeText}>Read-only</Text>
                </View>
              )}
            </View>

            <View style={styles.infoItem}>
              <Ionicons
                name="calendar-outline"
                size={20}
                color={Theme.colors.text_brown_gray}
              />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Member Since</Text>
                <Text
                  style={[styles.infoValue, isEditing && styles.readOnlyValue]}
                >
                  {formatDate(user.createdAt)}
                </Text>
              </View>
            </View>

            {user.lastLogin && (
              <View style={styles.infoItem}>
                <Ionicons
                  name="time-outline"
                  size={20}
                  color={Theme.colors.text_brown_gray}
                />
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Last Login</Text>
                  <Text
                    style={[
                      styles.infoValue,
                      isEditing && styles.readOnlyValue,
                    ]}
                  >
                    {formatDate(user.lastLogin)}
                  </Text>
                </View>
              </View>
            )}

            <View style={styles.infoItem}>
              <Ionicons
                name="key-outline"
                size={20}
                color={Theme.colors.text_brown_gray}
              />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>User ID</Text>
                <Text
                  style={[styles.infoValue, isEditing && styles.readOnlyValue]}
                >
                  {user.id}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Logout Button - Hidden when editing */}
        {!isEditing && (
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Ionicons
              name="log-out-outline"
              size={24}
              color={Theme.colors.error}
            />
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

// ... your styles remain exactly the same
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Theme.colors.background_cream,
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
    color: Theme.colors.text_brown_gray,
    marginTop: 16,
    fontSize: 16,
  },
  errorText: {
    color: Theme.colors.text_brown_gray,
    marginTop: 16,
    fontSize: 18,
    textAlign: "center",
  },
  retryButton: {
    marginTop: 20,
    backgroundColor: Theme.colors.accent_terracotta,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: Theme.colors.background_cream,
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
    color: Theme.colors.text_charcoal,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  refreshButton: {
    padding: 8,
  },
  editButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Theme.colors.accent_terracotta,
    backgroundColor: "transparent",
    gap: 6,
  },
  editButtonActive: {
    backgroundColor: Theme.colors.accent_terracotta,
  },
  editButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: Theme.colors.accent_terracotta,
  },
  editButtonTextActive: {
    color: Theme.colors.background_cream,
  },
  profileCard: {
    backgroundColor: Theme.colors.background_beige,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  profileHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Theme.colors.accent_terracotta,
    justifyContent: "center",
    alignItems: "center",
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
    fontWeight: "bold",
    color: Theme.colors.background_cream,
  },
  profileInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 24,
    fontWeight: "bold",
    color: Theme.colors.text_charcoal,
    marginBottom: 4,
  },
  userUsername: {
    fontSize: 16,
    color: Theme.colors.accent_clay,
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 14,
    color: Theme.colors.text_earth,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: Theme.colors.text_charcoal,
  },
  editableSection: {
    backgroundColor: "rgba(184, 92, 56, 0.05)",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Theme.colors.accent_terracotta,
    marginBottom: 16,
  },
  readOnlySection: {
    backgroundColor: "rgba(90, 82, 72, 0.05)",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Theme.colors.background_sand,
    marginBottom: 16,
  },
  editModeBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Theme.colors.accent_terracotta,
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
    gap: 8,
  },
  editModeBannerText: {
    flex: 1,
    fontSize: 14,
    color: Theme.colors.background_cream,
    fontWeight: "500",
  },
  editableBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Theme.colors.accent_terracotta,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  editableBadgeText: {
    fontSize: 12,
    color: Theme.colors.background_cream,
    fontWeight: "600",
  },
  readOnlyBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Theme.colors.background_sand,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  readOnlyBadgeText: {
    fontSize: 12,
    color: Theme.colors.text_brown_gray,
    fontWeight: "600",
  },
  editableLabel: {
    fontSize: 14,
    fontWeight: "400",
    color: Theme.colors.accent_terracotta,
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.background_sand,
  },
  infoContent: {
    flex: 1,
    marginLeft: 12,
  },
  infoLabel: {
    fontSize: 14,
    color: Theme.colors.text_brown_gray,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 16,
    color: Theme.colors.text_charcoal,
    fontWeight: "500",
  },
  readOnlyValue: {
    opacity: 0.6,
  },
  input: {
    fontSize: 16,
    color: Theme.colors.text_charcoal,
    fontWeight: "500",
    backgroundColor: Theme.colors.background_cream,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Theme.colors.accent_terracotta,
    marginTop: 4,
  },
  saveButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Theme.colors.accent_terracotta,
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 16,
    gap: 8,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    fontSize: 16,
    color: Theme.colors.background_cream,
    fontWeight: "600",
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255, 76, 76, 0.12)",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 76, 76, 0.35)",
  },
  logoutText: {
    fontSize: 16,
    color: Theme.colors.error,
    fontWeight: "600",
    marginLeft: 8,
  },
});
