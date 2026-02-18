import React, { useMemo, useState } from "react";
import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Theme } from "@/theme";
import { MVP_REWARDS } from "@/constants/gameMvp";
import { RewardItem, useGameplayStore } from "@/store/gameplayStore";

const COINS = [1, 2, 3, 4, 5];

const createReward = (): RewardItem => {
  const randomTemplate =
    MVP_REWARDS[Math.floor(Math.random() * MVP_REWARDS.length)];
  const wonAt = new Date().toISOString();
  const expiresAt = new Date(
    Date.now() + randomTemplate.expiryDays * 24 * 60 * 60 * 1000,
  ).toISOString();

  return {
    id: `${randomTemplate.id}-${Date.now()}`,
    title: randomTemplate.title,
    vendor: randomTemplate.vendor,
    wonAt,
    expiresAt,
    isRedeemed: false,
  };
};

export default function CoinSelectionScreen() {
  const [selectedCoin, setSelectedCoin] = useState<number | null>(null);
  const [revealedReward, setRevealedReward] = useState<RewardItem | null>(null);
  const [showPostWin, setShowPostWin] = useState(false);

  const addRewardToHistory = useGameplayStore(
    (state) => state.addRewardToHistory,
  );
  const saveReward = useGameplayStore((state) => state.saveReward);

  const hasPlayed = selectedCoin !== null;

  const instructionText = useMemo(() => {
    if (hasPlayed) {
      return "Reward revealed. Choose an option below.";
    }

    return "Select 1 Coin to Reveal Your Reward";
  }, [hasPlayed]);

  const onSelectCoin = (coinIndex: number) => {
    if (hasPlayed) {
      return;
    }

    const reward = createReward();
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

  const handleViewDetails = () => {
    router.replace("/(tabs)/profile");
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
              <Text style={styles.coinText}>GRYSOSTA™</Text>
              <Text style={styles.coinNumber}>Coin {coin}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <Modal transparent visible={!!revealedReward} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>🎉 Congratulations!</Text>
            <Text style={styles.modalSubtitle}>You won:</Text>
            <Text style={styles.rewardText}>
              {revealedReward?.title} - {revealedReward?.vendor}
            </Text>

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
                onPress={handleViewDetails}
              >
                <Text style={styles.primaryButtonText}>View Details</Text>
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
                onPress={closePostWinToHome}
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
    flexWrap: "wrap",
    gap: 10,
  },
  coinButton: {
    width: "48%",
    minHeight: 110,
    backgroundColor: Theme.colors.background_beige,
    borderColor: Theme.colors.border,
    borderWidth: 1,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
  },
  coinSelected: {
    borderColor: Theme.colors.accent_terracotta,
    backgroundColor: Theme.colors.accent_olive,
  },
  coinText: {
    color: Theme.colors.accent_terracotta,
    fontSize: 13,
    fontWeight: "700",
  },
  coinNumber: {
    color: Theme.colors.text_charcoal,
    fontSize: 16,
    fontWeight: "700",
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
