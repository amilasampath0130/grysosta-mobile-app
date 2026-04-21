import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Theme } from "@/theme";
import { vendorService, type VendorListItem } from "@/services/vendorService";

export default function CoreScreen() {
  const [vendors, setVendors] = useState<VendorListItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedVendor, setSelectedVendor] = useState<VendorListItem | null>(null);

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
        <View style={styles.bannerCard}>
          <Text style={styles.bannerTitle}>GRYSOSTA™ Rewards</Text>
          <Text style={styles.bannerSubtitle}>
            Win exclusive offers from your favorite brands.
          </Text>
        </View>
        <TextInput
          style={styles.searchInput}
          placeholder="Search vendors by name or category"
          placeholderTextColor={Theme.colors.text_earth}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <Text style={styles.instruction}>Select 3 Vendors to Play</Text>



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
            !isLoading ? (
              <Text style={styles.emptyText}>No vendors found.</Text>
            ) : null
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.vendorCard}
              activeOpacity={0.85}
              onPress={() => setSelectedVendor(item)}
            >
              {item.imageUrl ? (
                <Image source={{ uri: item.imageUrl }} style={styles.logoImage} />
              ) : (
                <View style={styles.logoPlaceholder} />
              )}

              <View style={styles.vendorMeta}>
                <Text style={styles.vendorName}>{item.name}</Text>
                <Text style={styles.vendorCategory}>{item.category || "General"}</Text>
                <Text style={styles.vendorHint}>Tap to view full details</Text>
              </View>
            </TouchableOpacity>
          )}
        />

        <Modal
          visible={Boolean(selectedVendor)}
          transparent
          animationType="fade"
          onRequestClose={() => setSelectedVendor(null)}
        >
          <Pressable style={styles.modalOverlay} onPress={() => setSelectedVendor(null)}>
            <Pressable style={styles.modalCard} onPress={(event) => event.stopPropagation()}>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setSelectedVendor(null)}
              >
                <Text style={styles.closeButtonText}>X</Text>
              </TouchableOpacity>

              {selectedVendor?.imageUrl ? (
                <Image
                  source={{ uri: selectedVendor.imageUrl }}
                  style={styles.modalLogoImage}
                />
              ) : (
                <View style={styles.modalLogoPlaceholder} />
              )}

              <Text style={styles.modalVendorName}>{selectedVendor?.name}</Text>
              <Text style={styles.modalVendorCategory}>
                Category: {selectedVendor?.category || "General"}
              </Text>
              <Text style={styles.modalVendorInfo}>Vendor ID: {selectedVendor?.id}</Text>
              <Text style={styles.modalVendorInfo}>
                More profile details can be added here when available from the API.
              </Text>
            </Pressable>
          </Pressable>
        </Modal>

        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => router.push("/(Game)/vendorSelection")}
        >
          <Text style={styles.primaryButtonText}>Start Vendor Selection</Text>
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
  bannerCard: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Theme.colors.background_beige,
    borderColor: Theme.colors.border,
    borderWidth: 1,
    borderRadius: 12,
    padding: 10,
  },
  bannerTitle: {
    color: Theme.colors.text_charcoal,
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 6,
  },
  bannerSubtitle: {
    color: Theme.colors.text_brown_gray,
    fontSize: 14,
    fontWeight: "500",
  },
  instruction: {
    color: Theme.colors.accent_terracotta,
    fontSize: 18,
    fontWeight: "700",
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
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
    paddingBottom: 14,
    gap: 10,
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
  vendorCard: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Theme.colors.background_beige,
    borderColor: Theme.colors.border,
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    gap: 12,
  },
  logoImage: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: Theme.colors.background_sand,
  },
  logoPlaceholder: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: Theme.colors.background_sand,
  },
  vendorMeta: {
    flex: 1,
    gap: 3,
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
  vendorHint: {
    color: Theme.colors.text_earth,
    fontSize: 12,
    fontWeight: "500",
  },
  emptyText: {
    color: Theme.colors.text_brown_gray,
    fontSize: 13,
    fontWeight: "600",
    textAlign: "center",
    paddingVertical: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(17, 24, 39, 0.45)",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  modalCard: {
    backgroundColor: Theme.colors.background_beige,
    borderRadius: 14,
    borderColor: Theme.colors.border,
    borderWidth: 1,
    padding: 18,
    alignItems: "center",
  },
  closeButton: {
    position: "absolute",
    top: 10,
    right: 10,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Theme.colors.background_sand,
    alignItems: "center",
    justifyContent: "center",
  },
  closeButtonText: {
    color: Theme.colors.text_charcoal,
    fontSize: 14,
    fontWeight: "700",
  },
  modalLogoImage: {
    width: 74,
    height: 74,
    borderRadius: 37,
    backgroundColor: Theme.colors.background_sand,
    marginTop: 8,
    marginBottom: 12,
  },
  modalLogoPlaceholder: {
    width: 74,
    height: 74,
    borderRadius: 37,
    backgroundColor: Theme.colors.background_sand,
    marginTop: 8,
    marginBottom: 12,
  },
  modalVendorName: {
    color: Theme.colors.text_charcoal,
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 8,
    textAlign: "center",
  },
  modalVendorCategory: {
    color: Theme.colors.text_brown_gray,
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
    textAlign: "center",
  },
  modalVendorInfo: {
    color: Theme.colors.text_brown_gray,
    fontSize: 13,
    fontWeight: "500",
    marginBottom: 6,
    textAlign: "center",
  },
  primaryButton: {
    backgroundColor: Theme.colors.accent_terracotta,
    borderRadius: 10,
    alignItems: "center",
    paddingVertical: 14,
    marginTop: "auto",
  },
  primaryButtonText: {
    color: Theme.colors.background_beige,
    fontSize: 15,
    fontWeight: "700",
  },
});
