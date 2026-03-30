import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  
  Image,
  StyleSheet,
  Text,
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

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.bannerCard}>
          <Text style={styles.bannerTitle}>GRYSOSTA™ Rewards</Text>
          <Text style={styles.bannerSubtitle}>
            Win exclusive offers from your favorite brands.
          </Text>
        </View>

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
          data={vendors}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={styles.vendorRow}
          contentContainerStyle={styles.vendorList}
          renderItem={({ item }) => (
            <View style={styles.vendorCard}>
              {item.imageUrl ? (
                <Image source={{ uri: item.imageUrl }} style={styles.logoImage} />
              ) : (
                <View style={styles.logoPlaceholder} />
              )}
              <Text style={styles.vendorName}>{item.name}</Text>
              <Text style={styles.vendorCategory}>{item.category || ""}</Text>
            </View>
          )}
        />

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
    gap: 14,
  },
  bannerCard: {
    backgroundColor: Theme.colors.background_beige,
    borderColor: Theme.colors.border,
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
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
    paddingBottom: 10,
    gap: 10,
  },
  vendorRow: {
    gap: 10,
  },
  vendorCard: {
    flex: 1,
    minHeight: 85,
    backgroundColor: Theme.colors.background_beige,
    borderColor: Theme.colors.border,
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    justifyContent: "center",
    gap: 4,
  },
  logoImage: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: Theme.colors.background_sand,
    marginBottom: 6,
  },
  logoPlaceholder: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: Theme.colors.background_sand,
    marginBottom: 6,
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
