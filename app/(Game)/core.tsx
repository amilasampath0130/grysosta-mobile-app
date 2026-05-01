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
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Theme } from "@/theme";
import { vendorService, type VendorListItem } from "@/services/vendorService";
import { gameService } from "@/services/gameService";

const formatCategory = (value?: string) => {
  if (!value) return "General";
  return value
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1).toLowerCase())
    .join(" ");
};

const displayValue = (value?: string) => {
  const trimmed = String(value || "").trim();
  return trimmed.length > 0 ? trimmed : "Not provided";
};

export default function CoreScreen() {
  const [vendors, setVendors] = useState<VendorListItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedVendor, setSelectedVendor] = useState<VendorListItem | null>(null);
  const [hasActiveSelection, setHasActiveSelection] = useState<boolean>(false);
  const [selectionExpiresAt, setSelectionExpiresAt] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const loadVendors = async () => {
      try {
        setIsLoading(true);
        setErrorMessage(null);
        const [approved, selectionStatus] = await Promise.all([
          vendorService.getApprovedVendors(),
          gameService.getVendorSelectionStatus(),
        ]);
        if (cancelled) return;
        setVendors(approved);
        setHasActiveSelection(selectionStatus.hasActiveSelection);
        setSelectionExpiresAt(selectionStatus.selection?.expiresAt || null);
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
        {!hasActiveSelection && (
          <TextInput
            style={styles.searchInput}
            placeholder="Search vendors by name or category"
            placeholderTextColor={Theme.colors.text_earth}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        )}
        <Text style={styles.instruction}>
          {hasActiveSelection
            ? `Vendor selection locked until ${
                selectionExpiresAt
                  ? new Date(selectionExpiresAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })
                  : "next cycle"
              }.`
            : "Select 3 Vendors to Play"}
        </Text>



        {isLoading && (
          <View style={styles.statusRow}>
            <ActivityIndicator color={Theme.colors.accent_terracotta} />
            <Text style={styles.statusText}>Loading vendors…</Text>
          </View>
        )}

        {!isLoading && errorMessage && (
          <Text style={styles.errorText}>{errorMessage}</Text>
        )}

        {!hasActiveSelection && (
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
        )}

        <Modal
          visible={Boolean(selectedVendor)}
          transparent
          animationType="fade"
          onRequestClose={() => setSelectedVendor(null)}
        >
          <Pressable style={styles.modalOverlay} onPress={() => setSelectedVendor(null)}>
            <Pressable style={styles.modalCard} onPress={(event) => event.stopPropagation()}>
              <View style={styles.modalHeroArea}>
                <View style={styles.modalHeroGradient} />

                <View style={styles.logoRingOuter}>
                  <View style={styles.logoRingInner}>
                    {selectedVendor?.imageUrl ? (
                      <Image
                        source={{ uri: selectedVendor.imageUrl }}
                        style={styles.modalLogoImage}
                      />
                    ) : (
                      <View style={styles.modalLogoPlaceholder}>
                        <Ionicons
                          name="storefront-outline"
                          size={34}
                          color={Theme.colors.accent_terracotta}
                        />
                      </View>
                    )}
                  </View>
                </View>
              </View>

              <View style={styles.modalBody}>
                <View style={styles.categoryBadge}>
                  <Ionicons
                    name="sparkles-outline"
                    size={12}
                    color={Theme.colors.accent_terracotta}
                  />
                  <Text style={styles.categoryBadgeText}>
                    {formatCategory(selectedVendor?.category)}
                  </Text>
                </View>

                <Text style={styles.modalVendorName}>{selectedVendor?.name}</Text>

                <View style={styles.vendorDetailCard}>
                  <Text style={styles.vendorDetailTitle}>Vendor Details</Text>
                  <View style={styles.vendorDetailRow}>
                    <Ionicons
                      name="pricetag-outline"
                      size={14}
                      color={Theme.colors.accent_terracotta}
                    />
                    <Text style={styles.modalVendorInfo}>
                      Category: {formatCategory(selectedVendor?.category)}
                    </Text>
                  </View>
                  <View style={styles.vendorDetailRow}>
                    <Ionicons
                      name="location-outline"
                      size={14}
                      color={Theme.colors.accent_terracotta}
                    />
                    <Text style={styles.modalVendorInfo}>
                      Location: {displayValue(selectedVendor?.location)}
                    </Text>
                  </View>
                  <View style={styles.vendorDetailRow}>
                    <Ionicons
                      name="briefcase-outline"
                      size={14}
                      color={Theme.colors.accent_terracotta}
                    />
                    <Text style={styles.modalVendorInfo}>
                      Business Type: {displayValue(selectedVendor?.businessType)}
                    </Text>
                  </View>
                  <View style={styles.vendorDetailRow}>
                    <Ionicons
                      name="layers-outline"
                      size={14}
                      color={Theme.colors.accent_terracotta}
                    />
                    <Text style={styles.modalVendorInfo}>
                      Offering: {displayValue(selectedVendor?.offering)}
                    </Text>
                  </View>
                  <View style={styles.vendorDetailRow}>
                    <Ionicons
                      name="map-outline"
                      size={14}
                      color={Theme.colors.accent_terracotta}
                    />
                    <Text style={styles.modalVendorInfo}>
                      Service Area: {displayValue(selectedVendor?.serviceArea)}
                    </Text>
                  </View>
                  <View style={styles.vendorDetailRow}>
                    <Ionicons
                      name="time-outline"
                      size={14}
                      color={Theme.colors.accent_terracotta}
                    />
                    <Text style={styles.modalVendorInfo}>
                      Hours: {displayValue(selectedVendor?.operatingHours)}
                    </Text>
                  </View>
                </View>

                <TouchableOpacity
                  style={styles.modalCloseCta}
                  onPress={() => setSelectedVendor(null)}
                >
                  <Text style={styles.modalCloseCtaText}>Close</Text>
                </TouchableOpacity>
              </View>
            </Pressable>
          </Pressable>
        </Modal>

        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() =>
            router.push(
              hasActiveSelection ? "/(Game)/gameHome" : "/(Game)/vendorSelection",
            )
          }
        >
          <Text style={styles.primaryButtonText}>
            {hasActiveSelection ? "Claim This Week Offer" : "Start Vendor Selection"}
          </Text>
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
    borderRadius: 18,
    borderColor: Theme.colors.border,
    borderWidth: 1,
    overflow: "hidden",
  },
  modalHeroArea: {
    height: 170,
    backgroundColor: Theme.colors.accent_terracotta,
    alignItems: "center",
    justifyContent: "flex-end",
    paddingBottom: 0,
    position: "relative",
  },
  modalHeroGradient: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(17,24,39,0.2)",
  },
  logoRingOuter: {
    width: 152,
    height: 152,
    borderRadius: 76,
    backgroundColor: "rgba(255,255,255,0.25)",
    padding: 8,
    marginBottom: -52,
  },
  logoRingInner: {
    flex: 1,
    borderRadius: 999,
    backgroundColor: Theme.colors.background_beige,
    padding: 5,
  },
  modalLogoImage: {
    width: "100%",
    height: "100%",
    borderRadius: 999,
    backgroundColor: Theme.colors.background_sand,
  },
  modalLogoPlaceholder: {
    width: "100%",
    height: "100%",
    borderRadius: 999,
    backgroundColor: Theme.colors.background_sand,
    alignItems: "center",
    justifyContent: "center",
  },
  modalBody: {
    paddingTop: 64,
    paddingHorizontal: 18,
    paddingBottom: 18,
    alignItems: "center",
  },
  categoryBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: Theme.colors.accent_olive,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    marginBottom: 8,
  },
  categoryBadgeText: {
    color: Theme.colors.accent_terracotta,
    fontSize: 12,
    fontWeight: "700",
  },
  modalVendorName: {
    color: Theme.colors.text_charcoal,
    fontSize: 20,
    fontWeight: "800",
    marginBottom: 10,
    textAlign: "center",
  },
  vendorDetailCard: {
    width: "100%",
    backgroundColor: Theme.colors.background_cream,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    borderRadius: 12,
    padding: 12,
    gap: 8,
    marginBottom: 14,
  },
  vendorDetailTitle: {
    color: Theme.colors.text_charcoal,
    fontSize: 14,
    fontWeight: "800",
    marginBottom: 2,
  },
  vendorDetailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  modalVendorInfo: {
    color: Theme.colors.text_brown_gray,
    fontSize: 13,
    fontWeight: "500",
    flex: 1,
    lineHeight: 18,
  },
  modalCloseCta: {
    width: "100%",
    backgroundColor: Theme.colors.background_sand,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
  },
  modalCloseCtaText: {
    color: Theme.colors.text_charcoal,
    fontSize: 14,
    fontWeight: "700",
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
