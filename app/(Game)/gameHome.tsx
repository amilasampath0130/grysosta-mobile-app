import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Easing,
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

const COINS = [
  { id: 1, color: "#FF8C00" },
  { id: 2, color: "#FF3B30" },
  { id: 3, color: "#A020F0" },
  { id: 4, color: "#32CD32" },
  { id: 5, color: "#FFD700", center: true },
  { id: 6, color: "#1E90FF" },
  { id: 7, color: "#00E5FF" },
];

type WonReward = NonNullable<TapCoinResponse["reward"]>;

type AnimatedLogoProps = {
  style: object;
  delay?: number;
};

function AnimatedCoinLogo({ style, delay = 0 }: AnimatedLogoProps) {
  const animation = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(animation, {
          toValue: 1,
          duration: 1200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
          delay,
        }),
        Animated.timing(animation, {
          toValue: 0,
          duration: 1200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );

    loop.start();

    return () => {
      loop.stop();
    };
  }, [animation, delay]);

  const animatedStyle = {
    transform: [
      {
        scale: animation.interpolate({
          inputRange: [0, 1],
          outputRange: [1, 1.06],
        }),
      },
      {
        translateY: animation.interpolate({
          inputRange: [0, 1],
          outputRange: [0, -3],
        }),
      },
    ],
  };

  return (
    <Animated.Image
      source={Images.logo}
      style={[style, animatedStyle]}
      resizeMode="contain"
    />
  );
}

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
      const message =
        error instanceof Error ? error.message : "Unable to play now";

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
    if (!revealedReward) return;

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
    if (!revealedReward) return;

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

  const logoUrl = revealedReward?.offer.vendorName
    ? vendors.find((item) => item.name === revealedReward.offer.vendorName)
        ?.imageUrl || null
    : null;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>Select 1 Coin to Reveal Your Reward</Text>

        <Text style={styles.subtitle}>{instructionText}</Text>

        {/* TOP ROW */}
        <View style={styles.row}>
          {COINS.slice(0, 3).map((coin) => (
            <TouchableOpacity
              key={coin.id}
              onPress={() => onSelectCoin(coin.id)}
              disabled={isTapping || isRedeeming || isSaving}
              style={[
                styles.coinButton,
                {
                  borderColor: coin.color,
                },
                selectedCoin === coin.id && styles.selectedCoin,
              ]}
            >
              <AnimatedCoinLogo style={styles.coinLogo} delay={coin.id * 90} />
            </TouchableOpacity>
          ))}
        </View>

        {/* MIDDLE ROW */}
        <View style={styles.row}>
          {COINS.slice(3, 6).map((coin) => (
            <TouchableOpacity
              key={coin.id}
              onPress={() => onSelectCoin(coin.id)}
              disabled={isTapping || isRedeeming || isSaving}
              style={[
                coin.center ? styles.centerCoin : styles.coinButton,
                {
                  borderColor: coin.color,
                },
                selectedCoin === coin.id && styles.selectedCoin,
              ]}
            >
              <AnimatedCoinLogo
                style={coin.center ? styles.centerCoinLogo : styles.coinLogo}
                delay={coin.id * 90}
              />
            </TouchableOpacity>
          ))}
        </View>

        {/* BOTTOM ROW */}
        <View style={styles.bottomRow}>
          <TouchableOpacity
            onPress={() => onSelectCoin(7)}
            disabled={isTapping || isRedeeming || isSaving}
            style={[
              styles.coinButton,
              {
                borderColor: "#00E5FF",
              },
              selectedCoin === 7 && styles.selectedCoin,
            ]}
          >
            <AnimatedCoinLogo style={styles.coinLogo} delay={7 * 90} />
          </TouchableOpacity>
        </View>

        {isTapping && (
          <ActivityIndicator
            size="large"
            color={Theme.colors.accent_terracotta}
          />
        )}
      </View>

      {/* MODAL */}
      <Modal transparent visible={!!revealedReward} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>🎉 Congratulations!</Text>

            <Text style={styles.modalSubtitle}>You won:</Text>

            <View style={styles.rewardBadgeRow}>
              {logoUrl ? (
                <Image source={{ uri: logoUrl }} style={styles.logoImage} />
              ) : null}

              <Text style={styles.rewardVendor}>
                {revealedReward?.offer.vendorName}
              </Text>
            </View>

            <Text style={styles.rewardText}>{revealedReward?.offer.title}</Text>

            <Text style={styles.rewardMeta}>
              Discount: {revealedReward?.offer.discount}%
            </Text>

            <Text style={styles.rewardMeta}>
              Expires:{" "}
              {new Date(revealedReward?.expiresAt || "").toLocaleDateString()}
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
    backgroundColor: "#F5F5F5",
  },

  container: {
    flex: 1,
    alignItems: "center",
    paddingTop: 30,
    gap: 25,
  },

  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#111",
    textAlign: "center",
    paddingHorizontal: 20,
  },

  subtitle: {
    fontSize: 15,
    color: "#666",
    fontWeight: "500",
  },

  row: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 20,
  },

  bottomRow: {
    justifyContent: "center",
    alignItems: "center",
  },

  coinButton: {
    width: 110,
    height: 110,
    borderRadius: 60,
    backgroundColor: "transparent",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 4,
  },

  centerCoin: {
    width: 135,
    height: 135,
    borderRadius: 70,
    backgroundColor: "transparent",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 5,
  },

  selectedCoin: {
    transform: [{ scale: 1.05 }],
    opacity: 0.9,
  },

  coinLogo: {
    width: 106,
    height: 106,
  },

  centerCoinLogo: {
    width: 130,
    height: 130,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    paddingHorizontal: 20,
  },

  modalCard: {
    backgroundColor: "#FFF",
    borderRadius: 18,
    padding: 20,
    gap: 12,
  },

  modalTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#111",
    textAlign: "center",
  },

  modalSubtitle: {
    fontSize: 15,
    color: "#777",
    textAlign: "center",
  },

  rewardBadgeRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    marginTop: 8,
  },

  logoImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },

  rewardVendor: {
    fontSize: 16,
    fontWeight: "600",
    color: "#222",
  },

  rewardText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#E85D04",
    textAlign: "center",
  },

  rewardMeta: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
  },

  modalButtons: {
    gap: 12,
    marginTop: 12,
  },

  primaryButton: {
    backgroundColor: "#E85D04",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },

  primaryButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "700",
  },

  secondaryButton: {
    backgroundColor: "#EFEFEF",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },

  secondaryButtonText: {
    color: "#222",
    fontSize: 16,
    fontWeight: "700",
  },
});
