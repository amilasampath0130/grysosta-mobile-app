import {
  FlatList,
  Image,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useMemo, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "@/theme/colors";
import { useGameplayStore } from "@/store/gameplayStore";

type OfferItem = {
  id: string;
  title: string;
  description: string;
  points: number;
  expiresIn: string;
  imageUrl: string;
};

const offersData: OfferItem[] = [
  {
    id: "1",
    title: "BOGO BIG MAC OFFER",
    description: "BUY ONE, GET ONE.",
    points: 150,
    expiresIn: "3 days left",
    imageUrl: "https://picsum.photos/seed/offer-1/1080/1080",
  },
  {
    id: "2",
    title: "FREE MEDIUM FRIES W/PURCHASE",
    description: "Get a free medium fries with any purchase.",
    points: 50,
    expiresIn: "Today",
    imageUrl: "https://picsum.photos/seed/offer-2/1080/1080",
  },
];

const OffersHome = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOffer, setSelectedOffer] = useState<OfferItem | null>(null);
  const savedRewards = useGameplayStore((state) => state.savedRewards);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const filteredOffers = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    if (!normalizedQuery) {
      return offersData;
    }

    return offersData.filter((offer) => {
      return (
        offer.title.toLowerCase().includes(normalizedQuery) ||
        offer.description.toLowerCase().includes(normalizedQuery)
      );
    });
  }, [searchQuery]);

  const renderOffer = ({ item }: { item: OfferItem }) => {
    return (
      <TouchableOpacity
        style={styles.offerCard}
        activeOpacity={0.85}
        onPress={() => setSelectedOffer(item)}
      >
        <View style={styles.offerRow}>
          <Image source={{ uri: item.imageUrl }} style={styles.offerImage} />

          <View style={styles.offerInfo}>
            <View style={styles.offerHeader}>
              <Text style={styles.offerTitle}>{item.title}</Text>
            </View>
            <Text style={styles.offerDescription}>{item.description}</Text>
            <Text style={styles.expiryText}>{item.expiresIn}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.pageTitle}>Offers & Rewards</Text>

        <View style={styles.rewardSection}>
          <Text style={styles.rewardSectionTitle}>Saved Rewards</Text>
          {savedRewards.length === 0 ? (
            <Text style={styles.rewardEmpty}>No saved rewards yet.</Text>
          ) : (
            savedRewards.slice(0, 3).map((reward) => (
              <View key={reward.id} style={styles.rewardCard}>
                <Text style={styles.rewardTitle}>
                  {reward.title} - {reward.vendor}
                </Text>
                <Text style={styles.rewardMeta}>
                  Expires: {formatDate(reward.expiresAt)}
                </Text>
              </View>
            ))
          )}
        </View>

        <TextInput
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search offers"
          placeholderTextColor={Colors.text_earth}
          style={styles.searchInput}
          autoCapitalize="none"
          autoCorrect={false}
        />

        <FlatList
          data={filteredOffers}
          keyExtractor={(item) => item.id}
          renderItem={renderOffer}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyTitle}>No offers found</Text>
              <Text style={styles.emptySubtitle}>
                Try another keyword or add offers from backend later.
              </Text>
              <TouchableOpacity
                style={styles.clearButton}
                onPress={() => setSearchQuery("")}
              >
                <Text style={styles.clearButtonText}>Clear search</Text>
              </TouchableOpacity>
            </View>
          }
        />

        <Modal
          visible={!!selectedOffer}
          animationType="fade"
          transparent
          onRequestClose={() => setSelectedOffer(null)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              {selectedOffer && (
                <>
                  <Image
                    source={{ uri: selectedOffer.imageUrl }}
                    style={styles.modalImage}
                  />
                  <Text style={styles.modalTitle}>{selectedOffer.title}</Text>
                  <Text style={styles.modalDescription}>
                    {selectedOffer.description}
                  </Text>
                  <Text style={styles.modalMeta}>
                    Points: {selectedOffer.points}
                  </Text>
                  <Text style={styles.modalMeta}>
                    Expiry: {selectedOffer.expiresIn}
                  </Text>

                  <TouchableOpacity
                    style={styles.modalCloseButton}
                    onPress={() => setSelectedOffer(null)}
                  >
                    <Text style={styles.modalCloseButtonText}>Close</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
};

export default OffersHome;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background_cream,
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: Colors.text_charcoal,
    marginBottom: 10,
  },
  rewardSection: {
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    backgroundColor: Colors.background_beige,
    padding: 12,
    gap: 8,
  },
  rewardSectionTitle: {
    color: Colors.text_charcoal,
    fontSize: 16,
    fontWeight: "700",
  },
  rewardEmpty: {
    color: Colors.text_brown_gray,
    fontSize: 13,
    fontWeight: "500",
  },
  rewardCard: {
    backgroundColor: Colors.background_sand,
    borderRadius: 10,
    padding: 10,
  },
  rewardTitle: {
    color: Colors.text_charcoal,
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 4,
  },
  rewardMeta: {
    color: Colors.text_brown_gray,
    fontSize: 12,
    fontWeight: "500",
  },
  searchInput: {
    height: 46,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.background_beige,
    paddingHorizontal: 14,
    color: Colors.text_charcoal,
    marginBottom: 12,
  },
  listContent: {
    paddingBottom: 20,
    gap: 10,
  },
  offerCard: {
    backgroundColor: Colors.background_beige,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 12,
  },
  offerRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  offerImage: {
    width: 88,
    height: 88,
    borderRadius: 10,
    backgroundColor: Colors.background_sand,
  },
  offerInfo: {
    flex: 1,
    marginLeft: 12,
  },
  offerHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  offerTitle: {
    flex: 1,
    fontSize: 17,
    fontWeight: "700",
    color: Colors.text_charcoal,
    marginRight: 10,
  },
  pointsBadge: {
    backgroundColor: Colors.accent_olive,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  pointsText: {
    color: Colors.accent_terracotta,
    fontSize: 12,
    fontWeight: "700",
  },
  offerDescription: {
    color: Colors.text_brown_gray,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },
  expiryText: {
    color: Colors.text_earth,
    fontSize: 12,
    fontWeight: "600",
  },
  emptyContainer: {
    marginTop: 32,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 18,
    alignItems: "center",
    backgroundColor: Colors.background_beige,
  },
  emptyTitle: {
    color: Colors.text_charcoal,
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 6,
  },
  emptySubtitle: {
    textAlign: "center",
    color: Colors.text_brown_gray,
    fontSize: 13,
    marginBottom: 12,
  },
  clearButton: {
    backgroundColor: Colors.accent_terracotta,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  clearButtonText: {
    color: Colors.background_cream,
    fontWeight: "700",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(17, 24, 39, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  modalCard: {
    width: "100%",
    maxWidth: 420,
    backgroundColor: Colors.background_beige,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 16,
  },
  modalImage: {
    width: "100%",
    aspectRatio: 1,
    borderRadius: 12,
    backgroundColor: Colors.background_sand,
    marginBottom: 12,
  },
  modalTitle: {
    color: Colors.text_charcoal,
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 8,
  },
  modalDescription: {
    color: Colors.text_brown_gray,
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 10,
  },
  modalMeta: {
    color: Colors.text_earth,
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 4,
  },
  modalCloseButton: {
    marginTop: 14,
    backgroundColor: Colors.accent_terracotta,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: "center",
  },
  modalCloseButtonText: {
    color: Colors.background_cream,
    fontSize: 15,
    fontWeight: "700",
  },
});
