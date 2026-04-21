import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Theme } from "@/theme";
import { useGameplayStore } from "@/store/gameplayStore";
import { vendorService, type VendorListItem } from "@/services/vendorService";

export default function VendorSelectionScreen() {
  const [selected, setSelected] = useState<string[]>([]);
  const [vendors, setVendors] = useState<VendorListItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const favoriteVendorIds = useGameplayStore(
    (state) => state.favoriteVendorIds,
  );
  const toggleFavoriteVendor = useGameplayStore(
    (state) => state.toggleFavoriteVendor,
  );
  const setSelectedVendors = useGameplayStore(
    (state) => state.setSelectedVendors,
  );

  useEffect(() => {
    let cancelled = false;

    const loadVendors = async () => {
      try {
        setIsLoading(true);
        setErrorMessage(null);
        const approved = await vendorService.getApprovedVendors();
        if (cancelled) return;
        setVendors(approved);
      } catch (err) {
        if (cancelled) return;
        const message = err instanceof Error ? err.message : "Failed to fetch vendors";
        setErrorMessage(message);
        setVendors([]);
      } finally {
        if (cancelled) return;
        setIsLoading(false);
      }
    };

    loadVendors();

    return () => {
      cancelled = true;
    };
  }, []);

  const selectedCount = selected.length;
  const canContinue = selectedCount >= 3;

  const instructionText = useMemo(() => {
    if (selectedCount >= 3) {
      return "Great! Tap Continue to Play.";
    }

    return `Select ${3 - selectedCount} more vendor${3 - selectedCount === 1 ? "" : "s"} to continue.`;
  }, [selectedCount]);

  const handleVendorTap = (vendorId: string) => {
    const exists = selected.includes(vendorId);

    if (exists) {
      setSelected((prev) => prev.filter((id) => id !== vendorId));
      return;
    }

    if (selected.length >= 3) {
      return;
    }

    setSelected((prev) => [...prev, vendorId]);
  };

  const handleContinue = () => {
    if (!canContinue) {
      return;
    }

    setSelectedVendors(selected);
    router.push("/(Game)/gameHome");
  };
  const filteredVendors = useMemo(() => {
    const trimmedQuery = searchQuery.trim().toLowerCase();
    if (!trimmedQuery) return vendors;

    return vendors.filter((vendor) => {
      const searchableText = `${vendor.name} ${vendor.category || ""}`.toLowerCase();
      return searchableText.includes(trimmedQuery);
    });
  }, [searchQuery, vendors]);
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>Select 3 Vendors to Play</Text>
        <Text style={styles.subtitle}>{instructionText}</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Search vendors by name or category"
          placeholderTextColor={Theme.colors.text_earth}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {isLoading && (
          <View style={styles.statusRow}>
            <ActivityIndicator color={Theme.colors.accent_terracotta} />
            <Text style={styles.statusText}>Loading vendors…</Text>
          </View>
        )}

        {!isLoading && errorMessage && (
          <Text style={styles.errorText}>{errorMessage}</Text>
        )}

        <FlatList
          data={filteredVendors}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.vendorList}
          ListEmptyComponent={
            !isLoading && !errorMessage ? (
              <Text style={styles.emptyText}>No vendors available.</Text>
            ) : null
          }
          renderItem={({ item }) => {
            const isSelected = selected.includes(item.id);
            const isFavorite = favoriteVendorIds.includes(item.id);

            return (
              <TouchableOpacity
                style={[styles.vendorCard, isSelected && styles.vendorCardSelected]}
                onPress={() => handleVendorTap(item.id)}
              >
                <TouchableOpacity
                  style={styles.heartButton}
                  onPress={() => toggleFavoriteVendor(item.id)}
                >
                  <Ionicons
                    name={isFavorite ? "heart" : "heart-outline"}
                    size={18}
                    color={Theme.colors.accent_terracotta}
                  />
                </TouchableOpacity>

                <View style={styles.vendorRowContent}>
                  {item.imageUrl ? (
                    <Image
                      source={{ uri: item.imageUrl }}
                      style={styles.logoImage}
                    />
                  ) : (
                    <View style={styles.logoPlaceholder} />
                  )}

                  <View style={styles.vendorMeta}>
                    <Text style={styles.vendorName}>{item.name}</Text>
                    <Text style={styles.vendorCategory}>{item.category || "General"}</Text>
                    {isSelected && <Text style={styles.selectedLabel}>Selected</Text>}
                  </View>
                </View>
              </TouchableOpacity>
            );
          }}
        />

        <TouchableOpacity
          style={[
            styles.primaryButton,
            !canContinue && styles.primaryButtonDisabled,
          ]}
          onPress={handleContinue}
          disabled={!canContinue}
        >
          <Text style={styles.primaryButtonText}>Continue to Play</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Theme.colors.background_cream,
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 10,
  },
  title: {
    color: Theme.colors.text_charcoal,
    fontSize: 20,
    fontWeight: "700",
  },
  subtitle: {
    color: Theme.colors.text_brown_gray,
    fontSize: 14,
    fontWeight: "500",
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 4,
  },
  statusText: {
    color: Theme.colors.text_brown_gray,
    fontSize: 13,
    fontWeight: "600",
  },
  errorText: {
    color: Theme.colors.accent_terracotta,
    fontSize: 13,
    fontWeight: "600",
  },
  vendorList: {
    gap: 10,
    paddingBottom: 10,
  },
  vendorCard: {
    width: "100%",
    backgroundColor: Theme.colors.background_beige,
    borderColor: Theme.colors.border,
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    minHeight: 90,
  },
  vendorCardSelected: {
    borderColor: Theme.colors.accent_terracotta,
    backgroundColor: Theme.colors.accent_olive,
  },
  heartButton: {
    alignSelf: "flex-end",
  },
  vendorRowContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  logoImage: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Theme.colors.background_sand,
  },
  logoPlaceholder: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Theme.colors.background_sand,
  },
  vendorMeta: {
    flex: 1,
    gap: 2,
  },
  vendorName: {
    color: Theme.colors.text_charcoal,
    fontSize: 15,
    fontWeight: "700",
  },
  vendorCategory: {
    color: Theme.colors.text_brown_gray,
    fontSize: 12,
    fontWeight: "500",
  },
  selectedLabel: {
    color: Theme.colors.accent_terracotta,
    fontSize: 12,
    fontWeight: "700",
  },
  emptyText: {
    color: Theme.colors.text_brown_gray,
    fontSize: 13,
    fontWeight: "600",
    textAlign: "center",
    paddingTop: 8,
  },
  primaryButton: {
    backgroundColor: Theme.colors.accent_terracotta,
    borderRadius: 10,
    alignItems: "center",
    paddingVertical: 14,
    marginTop: "auto",
  },
  primaryButtonDisabled: {
    backgroundColor: Theme.colors.text_earth,
  },
  primaryButtonText: {
    color: Theme.colors.background_beige,
    fontSize: 15,
    fontWeight: "700",
  },
    searchInput: {
    backgroundColor: Theme.colors.background_beige,
    borderColor: Theme.colors.border,
    borderWidth: 2,
    borderRadius: 10,
    color: Theme.colors.text_charcoal,
    fontSize: 14,
    fontWeight: "500",
    paddingHorizontal: 12,
    paddingVertical: 11,
  },
});
