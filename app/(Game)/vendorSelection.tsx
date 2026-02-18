import React, { useMemo, useState } from "react";
import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Theme } from "@/theme";
import { MVP_VENDORS } from "@/constants/gameMvp";
import { useGameplayStore } from "@/store/gameplayStore";

export default function VendorSelectionScreen() {
  const [selected, setSelected] = useState<string[]>([]);
  const favoriteVendorIds = useGameplayStore(
    (state) => state.favoriteVendorIds,
  );
  const toggleFavoriteVendor = useGameplayStore(
    (state) => state.toggleFavoriteVendor,
  );
  const setSelectedVendors = useGameplayStore(
    (state) => state.setSelectedVendors,
  );

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

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>Select 3 Vendors to Play</Text>
        <Text style={styles.subtitle}>{instructionText}</Text>

        <FlatList
          data={MVP_VENDORS}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={styles.vendorRow}
          contentContainerStyle={styles.vendorList}
          renderItem={({ item }) => {
            const isSelected = selected.includes(item.id);
            const isFavorite = favoriteVendorIds.includes(item.id);

            return (
              <TouchableOpacity
                style={[
                  styles.vendorCard,
                  isSelected && styles.vendorCardSelected,
                ]}
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

                <Image
                  source={{ uri: item.imageUrl }}
                  style={styles.logoImage}
                />

                <Text style={styles.vendorName}>{item.name}</Text>
                <Text style={styles.vendorCategory}>{item.category}</Text>
                {isSelected && (
                  <Text style={styles.selectedLabel}>Selected</Text>
                )}
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
  vendorList: {
    gap: 10,
    paddingBottom: 10,
  },
  vendorRow: {
    gap: 10,
  },
  vendorCard: {
    flex: 1,
    backgroundColor: Theme.colors.background_beige,
    borderColor: Theme.colors.border,
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    minHeight: 105,
    gap: 4,
  },
  vendorCardSelected: {
    borderColor: Theme.colors.accent_terracotta,
    backgroundColor: Theme.colors.accent_olive,
  },
  heartButton: {
    alignSelf: "flex-end",
  },
  logoImage: {
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
  selectedLabel: {
    color: Theme.colors.accent_terracotta,
    fontSize: 12,
    fontWeight: "700",
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
});
