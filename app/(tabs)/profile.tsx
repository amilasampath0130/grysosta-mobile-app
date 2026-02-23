import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Theme } from "@/theme";
import { SecureStorage } from "@/utils/secureStorage";
import { useAlert } from "@/contexts/AlertContext";
import { MVP_VENDORS } from "@/constants/gameMvp";
import { useGameplayStore } from "@/store/gameplayStore";
import { useAuthStore } from "@/store/authStore";
import { getApiBaseUrl } from "@/lib/apiBaseUrl";

interface UserProfile {
  _id?: string;
  id?: string;
  name: string;
  username: string;
  email: string;
  mobileNumber?: string;
  profileImage?: string;
  lastLogin?: string;
  createdAt?: string;
}

const formatDate = (dateString?: string) => {
  if (!dateString) {
    return "-";
  }

  try {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "-";
  }
};

export default function ProfileScreen() {
  const { showAlert } = useAlert();
  const logout = useAuthStore((state) => state.logout);

  const selectedVendorIds = useGameplayStore(
    (state) => state.selectedVendorIds,
  );
  const favoriteVendorIds = useGameplayStore(
    (state) => state.favoriteVendorIds,
  );
  const savedRewards = useGameplayStore((state) => state.savedRewards);
  const rewardHistory = useGameplayStore((state) => state.rewardHistory);
  const redeemReward = useGameplayStore((state) => state.redeemReward);

  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState({
    name: "",
    username: "",
    mobileNumber: "",
  });

  const selectedVendors = useMemo(
    () => MVP_VENDORS.filter((vendor) => selectedVendorIds.includes(vendor.id)),
    [selectedVendorIds],
  );

  const favoriteVendors = useMemo(
    () => MVP_VENDORS.filter((vendor) => favoriteVendorIds.includes(vendor.id)),
    [favoriteVendorIds],
  );

  const getToken = async () => {
    const storeToken = useAuthStore.getState().token;
    if (storeToken) {
      return storeToken;
    }

    return SecureStorage.getToken();
  };

  const fetchProfile = async () => {
    setIsLoading(true);

    try {
      const token = await getToken();
      if (!token) {
        router.replace("/(auth)");
        return;
      }

      const response = await fetch(
        `${getApiBaseUrl()}/auth/profile`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to fetch profile");
      }

      setUser(data.user);
      setEditedProfile({
        name: data.user?.name || "",
        username: data.user?.username || "",
        mobileNumber: data.user?.mobileNumber || "",
      });
    } catch (error) {
      showAlert({
        title: "Profile Error",
        message:
          error instanceof Error
            ? error.message
            : "Failed to load profile information",
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const validateProfile = () => {
    if (!editedProfile.name.trim()) {
      showAlert({
        title: "Validation",
        message: "Name cannot be empty",
        type: "error",
      });
      return false;
    }

    if (!editedProfile.username.trim()) {
      showAlert({
        title: "Validation",
        message: "Username cannot be empty",
        type: "error",
      });
      return false;
    }

    return true;
  };

  const handleSaveProfile = async () => {
    if (!validateProfile()) {
      return;
    }

    setIsSaving(true);

    try {
      const token = await getToken();
      if (!token) {
        router.replace("/(auth)");
        return;
      }

      const response = await fetch(
        `${getApiBaseUrl()}/auth/update-profile`,
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

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to update profile");
      }

      setUser(data.user);
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
          error instanceof Error ? error.message : "Could not update profile",
        type: "error",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.replace("/(auth)");
  };

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

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.pageTitle}>Profile & Dashboard</Text>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Account Details</Text>

          <Text style={styles.label}>Email</Text>
          <Text style={styles.staticValue}>{user?.email || "-"}</Text>

          <Text style={styles.label}>Name</Text>
          <TextInput
            style={[styles.input, !isEditing && styles.disabledInput]}
            editable={isEditing}
            value={editedProfile.name}
            onChangeText={(text) =>
              setEditedProfile((prev) => ({ ...prev, name: text }))
            }
          />

          <Text style={styles.label}>Username</Text>
          <TextInput
            style={[styles.input, !isEditing && styles.disabledInput]}
            editable={isEditing}
            value={editedProfile.username}
            onChangeText={(text) =>
              setEditedProfile((prev) => ({ ...prev, username: text }))
            }
          />

          <Text style={styles.label}>Mobile Number</Text>
          <TextInput
            style={[styles.input, !isEditing && styles.disabledInput]}
            editable={isEditing}
            value={editedProfile.mobileNumber}
            onChangeText={(text) =>
              setEditedProfile((prev) => ({ ...prev, mobileNumber: text }))
            }
            keyboardType="phone-pad"
          />

          <Text style={styles.meta}>
            Created: {formatDate(user?.createdAt)}
          </Text>
          <Text style={styles.meta}>
            Last Login: {formatDate(user?.lastLogin)}
          </Text>

          {isEditing ? (
            <View style={styles.rowButtons}>
              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={() => {
                  setEditedProfile({
                    name: user?.name || "",
                    username: user?.username || "",
                    mobileNumber: user?.mobileNumber || "",
                  });
                  setIsEditing(false);
                }}
              >
                <Text style={styles.secondaryButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={handleSaveProfile}
                disabled={isSaving}
              >
                <Text style={styles.primaryButtonText}>
                  {isSaving ? "Saving..." : "Save Changes"}
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => setIsEditing(true)}
            >
              <Text style={styles.primaryButtonText}>Edit Profile</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Saved Rewards</Text>
          {savedRewards.length === 0 ? (
            <Text style={styles.emptyText}>No saved rewards yet.</Text>
          ) : (
            savedRewards.map((reward) => (
              <View key={reward.id} style={styles.itemCard}>
                <Text style={styles.itemTitle}>
                  {reward.title} - {reward.vendor}
                </Text>
                <Text style={styles.itemMeta}>
                  Expires: {formatDate(reward.expiresAt)}
                </Text>
                <Text style={styles.itemMeta}>
                  Status: {reward.isRedeemed ? "Redeemed" : "Active"}
                </Text>
                <TouchableOpacity
                  style={styles.inlineButton}
                  disabled={reward.isRedeemed}
                  onPress={() => redeemReward(reward.id)}
                >
                  <Text style={styles.inlineButtonText}>
                    {reward.isRedeemed ? "Redeemed" : "Redeem Later"}
                  </Text>
                </TouchableOpacity>
              </View>
            ))
          )}
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Selected Vendors</Text>
          {selectedVendors.length === 0 ? (
            <Text style={styles.emptyText}>No vendors selected yet.</Text>
          ) : (
            selectedVendors.map((vendor) => (
              <Text key={vendor.id} style={styles.listText}>
                • {vendor.name}
              </Text>
            ))
          )}
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Favorite Vendors</Text>
          {favoriteVendors.length === 0 ? (
            <Text style={styles.emptyText}>No favorites yet.</Text>
          ) : (
            favoriteVendors.map((vendor) => (
              <Text key={vendor.id} style={styles.listText}>
                • {vendor.name}
              </Text>
            ))
          )}
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Reward History</Text>
          {rewardHistory.length === 0 ? (
            <Text style={styles.emptyText}>No reward history yet.</Text>
          ) : (
            rewardHistory.map((reward) => (
              <Text key={reward.id} style={styles.listText}>
                • {reward.title} - {reward.vendor} ({formatDate(reward.wonAt)})
              </Text>
            ))
          )}
        </View>

        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => router.push("/(offers)/offersHome")}
        >
          <Text style={styles.primaryButtonText}>Browse Offers</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => router.push("/(Game)/core")}
        >
          <Text style={styles.secondaryButtonText}>Browse Vendors</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>Log out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Theme.colors.background_cream,
  },
  container: {
    padding: 16,
    gap: 12,
    paddingBottom: 30,
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  loadingText: {
    color: Theme.colors.text_brown_gray,
    fontSize: 15,
    fontWeight: "500",
  },
  pageTitle: {
    color: Theme.colors.text_charcoal,
    fontSize: 22,
    fontWeight: "700",
  },
  sectionCard: {
    backgroundColor: Theme.colors.background_beige,
    borderColor: Theme.colors.border,
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    gap: 8,
  },
  sectionTitle: {
    color: Theme.colors.text_charcoal,
    fontSize: 17,
    fontWeight: "700",
  },
  label: {
    color: Theme.colors.text_brown_gray,
    fontSize: 12,
    fontWeight: "600",
    marginTop: 4,
  },
  staticValue: {
    color: Theme.colors.text_charcoal,
    fontSize: 14,
    fontWeight: "500",
  },
  input: {
    borderWidth: 1,
    borderColor: Theme.colors.border,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 10,
    backgroundColor: Theme.colors.background_cream,
    color: Theme.colors.text_charcoal,
    fontSize: 14,
  },
  disabledInput: {
    backgroundColor: Theme.colors.background_sand,
    color: Theme.colors.text_brown_gray,
  },
  meta: {
    color: Theme.colors.text_earth,
    fontSize: 12,
    fontWeight: "500",
  },
  emptyText: {
    color: Theme.colors.text_brown_gray,
    fontSize: 14,
    fontWeight: "500",
  },
  itemCard: {
    backgroundColor: Theme.colors.background_sand,
    borderRadius: 10,
    padding: 10,
    gap: 4,
  },
  itemTitle: {
    color: Theme.colors.text_charcoal,
    fontSize: 15,
    fontWeight: "700",
  },
  itemMeta: {
    color: Theme.colors.text_brown_gray,
    fontSize: 13,
    fontWeight: "500",
  },
  listText: {
    color: Theme.colors.text_brown_gray,
    fontSize: 14,
    fontWeight: "500",
  },
  rowButtons: {
    flexDirection: "row",
    gap: 8,
  },
  inlineButton: {
    alignSelf: "flex-start",
    backgroundColor: Theme.colors.accent_terracotta,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginTop: 4,
  },
  inlineButtonText: {
    color: Theme.colors.background_beige,
    fontSize: 13,
    fontWeight: "700",
  },
  primaryButton: {
    backgroundColor: Theme.colors.accent_terracotta,
    borderRadius: 10,
    paddingVertical: 13,
    alignItems: "center",
    flex: 1,
  },
  primaryButtonText: {
    color: Theme.colors.background_beige,
    fontSize: 15,
    fontWeight: "700",
  },
  secondaryButton: {
    backgroundColor: Theme.colors.background_sand,
    borderRadius: 10,
    paddingVertical: 13,
    alignItems: "center",
    flex: 1,
  },
  secondaryButtonText: {
    color: Theme.colors.text_charcoal,
    fontSize: 15,
    fontWeight: "700",
  },
  logoutButton: {
    backgroundColor: Theme.colors.background_beige,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    borderRadius: 10,
    paddingVertical: 13,
    alignItems: "center",
  },
  logoutButtonText: {
    color: Theme.colors.text_charcoal,
    fontSize: 15,
    fontWeight: "700",
  },
});
