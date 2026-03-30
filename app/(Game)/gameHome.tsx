import React, { useEffect, useMemo, useState } from "react";
import {
  Image,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Theme } from "@/theme";
import { MVP_REWARDS } from "@/constants/gameMvp";
import { RewardItem, useGameplayStore } from "@/store/gameplayStore";
import { Images } from "@/assets/images/images";
import { vendorService, type VendorListItem } from "@/services/vendorService";

const COINS = [1, 2, 3, 4, 5];

const createReward = (vendorName: string): RewardItem => {
  const randomTemplate = MVP_REWARDS[Math.floor(Math.random() * MVP_REWARDS.length)];
  const wonAt = new Date().toISOString();
  const expiresAt = new Date(
    Date.now() + randomTemplate.expiryDays * 24 * 60 * 60 * 1000,
  ).toISOString();

  return {
    id: `${randomTemplate.id}-${Date.now()}`,
    title: randomTemplate.title,
    vendor: vendorName,
    wonAt,
    expiresAt,
    isRedeemed: false,
  };
};

export default function GameHome() {
  const [selectedCoin, setSelectedCoin] = useState<number | null>(null);
  const [revealedReward, setRevealedReward] = useState<RewardItem | null>(null);
  const [showPostWin, setShowPostWin] = useState(false);
  const [vendors, setVendors] = useState<VendorListItem[]>([]);

  const addRewardToHistory = useGameplayStore(
    (state) => state.addRewardToHistory,
  );
  const saveReward = useGameplayStore((state) => state.saveReward);
  const selectedVendorIds = useGameplayStore((state) => state.selectedVendorIds);

  useEffect(() => {
    let cancelled = false;

    const loadVendors = async () => {
      try {
        const approved = await vendorService.getApprovedVendors();
        if (cancelled) return;
        setVendors(approved);
      } catch {
        if (cancelled) return;
        setVendors([]);
      }
    };

    loadVendors();

    return () => {
      cancelled = true;
    };
  }, []);

  const vendorById = useMemo(() => {
    const map = new Map<string, VendorListItem>();
    for (const vendor of vendors) {
      map.set(vendor.id, vendor);
    }
    return map;
  }, [vendors]);

  const getVendorLogo = (vendorName?: string) => {
    if (!vendorName) return null;
    const vendor = vendors.find((item) => item.name === vendorName);
    return vendor?.imageUrl || null;
  };

  const hasPlayed = selectedCoin !== null;

  const instructionText = useMemo(() => {
    if (hasPlayed) {
      return "Reward revealed. Choose an action below.";
    }

    return "Select 1 Coin to Reveal Your Reward";
  }, [hasPlayed]);

  const onSelectCoin = (coinIndex: number) => {
    if (hasPlayed) {
      return;
    }

    const selectedVendorId =
      selectedVendorIds[Math.floor(Math.random() * Math.max(1, selectedVendorIds.length))];

    const vendorName =
      (selectedVendorId && vendorById.get(selectedVendorId)?.name) ||
      vendors[Math.floor(Math.random() * Math.max(1, vendors.length))]?.name ||
      "Vendor";

    const reward = createReward(vendorName);
    setSelectedCoin(coinIndex);
    setRevealedReward(reward);
    addRewardToHistory(reward);
  };

  const handleSaveToDashboard = () => {
    if (!revealedReward) {
      return;
    }

    saveReward(revealedReward);
    setRevealedReward(null);
    setShowPostWin(true);
  };

  const handleViewOffers = () => {
    setRevealedReward(null);
    router.replace("/(offers)/offersHome");
  };

  const closePostWinToHome = () => {
    setShowPostWin(false);
    router.replace("/(tabs)/home");
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>Select 1 Coin to Reveal Your Reward</Text>
        <Text style={styles.subtitle}>{instructionText}</Text>

        <View style={styles.coinRow}>
          {COINS.map((coin) => (
            <TouchableOpacity
              key={coin}
              style={[
                styles.coinButton,
                selectedCoin === coin && styles.coinSelected,
              ]}
              onPress={() => onSelectCoin(coin)}
            >
              <Image source={Images.logo} style={styles.coinLogo} />
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <Modal transparent visible={!!revealedReward} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>🎉 Congratulations!</Text>
            <Text style={styles.modalSubtitle}>You won:</Text>
            <View style={styles.rewardBadgeRow}>
              {getVendorLogo(revealedReward?.vendor) ? (
                <Image
                  source={{ uri: getVendorLogo(revealedReward?.vendor) || "" }}
                  style={styles.logoImage}
                />
              ) : null}
              <Text style={styles.rewardVendor}>{revealedReward?.vendor}</Text>
            </View>
            <Text style={styles.rewardText}>{revealedReward?.title}</Text>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={handleSaveToDashboard}
              >
                <Text style={styles.secondaryButtonText}>
                  Save to Dashboard
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={handleViewOffers}
              >
                <Text style={styles.primaryButtonText}>View Offers</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal transparent visible={showPostWin} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>
              Come back tomorrow for another chance to win!
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={closePostWinToHome}
              >
                <Text style={styles.secondaryButtonText}>Skip</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={handleViewOffers}
              >
                <Text style={styles.primaryButtonText}>
                  Buy GRYSOSTA™ Coins
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    gap: 16,
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
  coinRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
  },
  coinButton: {
    width: 62,
    height: 62,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 999,
  },
  coinSelected: {
    transform: [{ scale: 1.06 }],
    opacity: 0.92,
  },
  coinLogo: {
    width: 60,
    height: 60,
    resizeMode: "contain",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: Theme.colors.text_earth,
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  modalCard: {
    backgroundColor: Theme.colors.background_beige,
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  modalTitle: {
    color: Theme.colors.text_charcoal,
    fontSize: 20,
    fontWeight: "700",
  },
  modalSubtitle: {
    color: Theme.colors.text_brown_gray,
    fontSize: 14,
    fontWeight: "500",
  },
  rewardText: {
    color: Theme.colors.accent_terracotta,
    fontSize: 16,
    fontWeight: "700",
  },
  rewardBadgeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  logoImage: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Theme.colors.background_sand,
  },
  rewardVendor: {
    color: Theme.colors.text_charcoal,
    fontSize: 14,
    fontWeight: "600",
  },
  modalButtons: {
    gap: 10,
    marginTop: 8,
  },
  primaryButton: {
    backgroundColor: Theme.colors.accent_terracotta,
    borderRadius: 10,
    alignItems: "center",
    paddingVertical: 12,
  },
  primaryButtonText: {
    color: Theme.colors.background_beige,
    fontSize: 15,
    fontWeight: "700",
  },
  secondaryButton: {
    backgroundColor: Theme.colors.background_sand,
    borderRadius: 10,
    alignItems: "center",
    paddingVertical: 12,
  },
  secondaryButtonText: {
    color: Theme.colors.text_charcoal,
    fontSize: 15,
    fontWeight: "700",
  },
});
