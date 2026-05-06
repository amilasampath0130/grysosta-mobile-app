import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
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
import { Images } from "@/assets/images/images";
import { vendorService, type VendorListItem } from "@/services/vendorService";
import { gameService, type TapCoinResponse } from "@/services/gameService";
import { useAlert } from "@/contexts/AlertContext";

const COINS = [1, 2, 3];

type WonReward = NonNullable<TapCoinResponse["reward"]>;

export default function GameHome() {
  const { showAlert } = useAlert();
  const [selectedCoin, setSelectedCoin] = useState<number | null>(null);
  const [revealedReward, setRevealedReward] = useState<WonReward | null>(null);
  const [cooldownText, setCooldownText] = useState<string | null>(null);
  const [isTapping, setIsTapping] = useState(false);
  const [isRedeeming, setIsRedeeming] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [vendors, setVendors] = useState<VendorListItem[]>([]);

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

    void loadVendors();

    return () => {
      cancelled = true;
    };
  }, []);

  const hasPlayed = selectedCoin !== null;

  const instructionText = useMemo(() => {
    if (isTapping) {
      return "Revealing your offer...";
    }

    if (cooldownText) {
      return `Cooldown active: ${cooldownText}`;
    }

    if (hasPlayed) {
      return "Reward revealed. Choose an action below.";
    }

    return "Select 1 Coin to Reveal Your Reward";
  }, [cooldownText, hasPlayed, isTapping]);

  const onSelectCoin = (coinIndex: number) => {
    if (hasPlayed || isTapping || isRedeeming || isSaving) {
      return;
    }

    void tapCoin(coinIndex);
  };

  const tapCoin = async (coinIndex: number) => {
    try {
      setIsTapping(true);
      setCooldownText(null);
      const response = await gameService.tapCoin();
      if (!response.success || !response.reward) {
        throw new Error(response.message || "Unable to play now");
      }

      setSelectedCoin(coinIndex);
      setRevealedReward(response.reward);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to play now";
      if (/tap again in/i.test(message)) {
        const cooldown = message.replace(/.*tap again in\s*/i, "").trim();
        setCooldownText(cooldown);
      }
      showAlert({
        title: "Coin Tap",
        message,
        type: "warning",
      });
    } finally {
      setIsTapping(false);
    }
  };

  const handleSaveForLater = async () => {
    if (!revealedReward) {
      return;
    }

    try {
      setIsSaving(true);
      const response = await gameService.saveReward(revealedReward.id);
      if (!response.success) {
        throw new Error(response.message || "Failed to save reward");
      }

      setRevealedReward(null);
      router.replace("/(tabs)/myRewards");
    } catch (error) {
      showAlert({
        title: "Save Failed",
        message:
          error instanceof Error ? error.message : "Unable to save reward",
        type: "error",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleRedeemNow = async () => {
    if (!revealedReward) {
      return;
    }

    try {
      setIsRedeeming(true);
      const response = await gameService.redeemReward(revealedReward.id);
      if (!response.success || !response.coupon) {
        throw new Error(response.message || "Unable to redeem reward");
      }

      setRevealedReward(null);
      router.replace({
        pathname: "/(Game)/coupon",
        params: { couponId: response.coupon.id },
      });
    } catch (error) {
      showAlert({
        title: "Redeem Failed",
        message:
          error instanceof Error ? error.message : "Unable to redeem reward",
        type: "error",
      });
    } finally {
      setIsRedeeming(false);
    }
  };

  const logoUrl =
    revealedReward?.offer.vendorName
      ? vendors.find((item) => item.name === revealedReward.offer.vendorName)?.imageUrl ||
        null
      : null;

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
              disabled={isTapping || isRedeeming || isSaving}
            >
              <Image source={Images.logo} style={styles.coinLogo} resizeMode="contain" />
            </TouchableOpacity>
          ))}
        </View>

        {isTapping && <ActivityIndicator color={Theme.colors.accent_terracotta} />}
      </View>

      <Modal transparent visible={!!revealedReward} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>🎉 Congratulations!</Text>
            <Text style={styles.modalSubtitle}>You won:</Text>
            <View style={styles.rewardBadgeRow}>
              {logoUrl ? (
                <Image
                  source={{ uri: logoUrl }}
                  style={styles.logoImage}
                />
              ) : null}
              <Text style={styles.rewardVendor}>{revealedReward?.offer.vendorName}</Text>
            </View>
            <Text style={styles.rewardText}>{revealedReward?.offer.title}</Text>
            <Text style={styles.rewardMeta}>Discount: {revealedReward?.offer.discount}%</Text>
            <Text style={styles.rewardMeta}>
              Expires: {new Date(revealedReward?.expiresAt || "").toLocaleDateString()}
            </Text>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={handleSaveForLater}
                disabled={isSaving || isRedeeming}
              >
                <Text style={styles.secondaryButtonText}>
                  {isSaving ? "Saving..." : "Save for Later"}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={handleRedeemNow}
                disabled={isRedeeming || isSaving}
              >
                <Text style={styles.primaryButtonText}>
                  {isRedeeming ? "Redeeming..." : "Redeem Now"}
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
    justifyContent: "center",
    alignItems: "center",
    marginTop: 16,
    gap: 14,
  },
  coinButton: {
    width: 92,
    height: 112,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 22,
    backgroundColor: Theme.colors.background_beige,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  coinSelected: {
    transform: [{ scale: 1.06 }],
    opacity: 0.92,
    borderColor: Theme.colors.accent_terracotta,
  },
  coinLogo: {
    width: 70,
    height: 70,
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
  rewardMeta: {
    color: Theme.colors.text_brown_gray,
    fontSize: 13,
    fontWeight: "600",
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
