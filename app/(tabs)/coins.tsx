import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import { router } from "expo-router";
import { Theme } from "@/theme";
import { Images } from "@/assets/images/images";
import {
  gameService,
  type ClaimDailyCoinsResponse,
  type CoinTapSummary,
} from "@/services/gameService";
import { useAlert } from "@/contexts/AlertContext";

const COIN_OPTIONS = [1, 2, 3] as const;

const formatDateTime = (dateString?: string | null) => {
  if (!dateString) {
    return "Now";
  }

  try {
    return new Date(dateString).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "Soon";
  }
};

export default function CoinsScreen() {
  const { showAlert } = useAlert();
  const [summary, setSummary] = useState<CoinTapSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);
  const [selectedCoin, setSelectedCoin] = useState<number | null>(null);

  const loadStatus = useCallback(
    async (isPullRefresh = false) => {
      try {
        if (isPullRefresh) {
          setIsRefreshing(true);
        } else {
          setIsLoading(true);
        }

        const response = await gameService.getCoinStatus();
        setSummary(response.summary);
        setSelectedCoin(response.summary.lastClaim?.selectedCoin ?? null);
      } catch (error) {
        showAlert({
          title: "VACAY Coins",
          message:
            error instanceof Error
              ? error.message
              : "Failed to load coin status",
          type: "error",
        });
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [showAlert],
  );

  useFocusEffect(
    useCallback(() => {
      void loadStatus();
    }, [loadStatus]),
  );

  const onPickCoin = async (coinNumber: number) => {
    if (!summary?.dailyTap.canTap || isClaiming) {
      return;
    }

    try {
      setIsClaiming(true);
      const response: ClaimDailyCoinsResponse =
        await gameService.claimDailyCoins(coinNumber);
      setSummary(response.summary);
      setSelectedCoin(response.selectedCoin ?? coinNumber);

      showAlert({
        title: "Coins Added",
        message: response.message,
        type: "success",
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to claim daily coins";

      showAlert({
        title: "Daily Claim",
        message,
        type: "warning",
      });

      await loadStatus();
    } finally {
      setIsClaiming(false);
    }
  };

  if (isLoading && !summary) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingState}>
          <ActivityIndicator
            size="large"
            color={Theme.colors.accent_terracotta}
          />
          <Text style={styles.loadingText}>Loading your daily touch...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.container}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={() => void loadStatus(true)}
            tintColor={Theme.colors.accent_terracotta}
          />
        }
      >
        <Text style={styles.title}>Daily Coin Touch</Text>
        <Text style={styles.subtitle}>
          Touch one token per day. The system will award a random active coin
          stocked by vendors.
        </Text>

        <View style={styles.availableCard}>
          <Text style={styles.sectionTitle}>Available Coins</Text>
          <View style={styles.availableRow}>
            {(summary?.featuredCoins || []).map((coin) => (
              <View key={coin.id} style={styles.availableChip}>
                <Image
                  source={{ uri: coin.imageUrl }}
                  style={styles.availableCoinImage}
                />
                <Text style={styles.availableCoinText}>{coin.name}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.claimCard}>
          <Text style={styles.sectionTitle}>Tap A Coin</Text>
          <Text style={styles.claimHint}>
            {summary?.dailyTap.canTap
              ? "Choose one token below to reveal today’s random coin reward."
              : `You already claimed today. Come back after ${formatDateTime(summary?.dailyTap.nextAvailableAt)}.`}
          </Text>

          <View style={styles.coinRow}>
            {COIN_OPTIONS.map((coinNumber) => {
              const isPicked = selectedCoin === coinNumber;

              return (
                <TouchableOpacity
                  key={coinNumber}
                  style={[
                    styles.coinButton,
                    isPicked && styles.coinButtonSelected,
                    (!summary?.dailyTap.canTap || isClaiming) &&
                      styles.coinButtonDisabled,
                  ]}
                  onPress={() => void onPickCoin(coinNumber)}
                  activeOpacity={0.9}
                  disabled={!summary?.dailyTap.canTap || isClaiming}
                >
                  <Image
                    source={Images.logo}
                    style={styles.touchCoinImage}
                    resizeMode="contain"
                  />
                  <Text style={styles.coinButtonLabel}>Touch {coinNumber}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {summary?.lastClaim ? (
            <View style={styles.resultBox}>
              <Text style={styles.resultTitle}>Today’s Result</Text>
              {summary.lastClaim.coinType?.imageUrl ? (
                <Image
                  source={{ uri: summary.lastClaim.coinType.imageUrl }}
                  style={styles.resultCoinImage}
                />
              ) : null}
              <Text style={styles.resultText}>
                Touch {summary.lastClaim.selectedCoin ?? "-"} awarded +
                {summary.lastClaim.coinsWon}{" "}
                {summary.lastClaim.coinType?.name || "coins"}.
              </Text>
              <Text style={styles.resultText}>
                Claimed at {formatDateTime(summary.lastClaim.claimedAt)}
              </Text>
              {summary.lastClaim.ticketsAwarded > 0 ? (
                <Text style={styles.ticketAwardText}>
                  Ticket unlocked: +{summary.lastClaim.ticketsAwarded}
                </Text>
              ) : null}
            </View>
          ) : null}
        </View>

        <View style={styles.actionRow}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => router.push("/(tabs)/coinPortfolio")}
          >
            <Text style={styles.primaryButtonText}>Open Coin Progress</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => router.push("/(tabs)/myRewards")}
          >
            <Text style={styles.secondaryButtonText}>My Rewards</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Theme.colors.background_cream,
  },
  container: {
    padding: 16,
    gap: 14,
    paddingBottom: 32,
  },
  loadingState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  loadingText: {
    color: Theme.colors.text_brown_gray,
    fontSize: 15,
    fontWeight: "600",
  },
  title: {
    color: Theme.colors.text_charcoal,
    fontSize: 24,
    fontWeight: "800",
  },
  subtitle: {
    color: Theme.colors.text_brown_gray,
    fontSize: 14,
    lineHeight: 20,
  },
  summaryGrid: {
    gap: 10,
  },
  summaryCard: {
    backgroundColor: Theme.colors.background_beige,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  summaryLabel: {
    color: Theme.colors.text_earth,
    fontSize: 13,
    fontWeight: "600",
  },
  summaryValue: {
    color: Theme.colors.text_charcoal,
    fontSize: 28,
    fontWeight: "800",
    marginTop: 4,
  },
  summaryHint: {
    color: Theme.colors.text_brown_gray,
    fontSize: 13,
    marginTop: 4,
  },
  availableCard: {
    backgroundColor: Theme.colors.background_beige,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    gap: 10,
  },
  availableRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  availableChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: Theme.colors.background_cream,
  },
  availableCoinImage: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Theme.colors.background_beige,
  },
  availableCoinText: {
    color: Theme.colors.text_charcoal,
    fontSize: 12,
    fontWeight: "700",
  },
  sectionTitle: {
    color: Theme.colors.text_charcoal,
    fontSize: 17,
    fontWeight: "700",
  },
  claimCard: {
    backgroundColor: Theme.colors.background_beige,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    gap: 14,
  },
  claimHint: {
    color: Theme.colors.text_brown_gray,
    fontSize: 14,
    lineHeight: 20,
  },
  coinRow: {
    flexDirection: "row",
    gap: 10,
  },
  coinButton: {
    flex: 1,
    backgroundColor: Theme.colors.accent_terracotta,
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: "center",
    gap: 8,
  },
  coinButtonSelected: {
    backgroundColor: Theme.colors.accent_clay,
  },
  coinButtonDisabled: {
    opacity: 0.65,
  },
  touchCoinImage: {
    width: 52,
    height: 52,
    marginBottom: 4,
  },
  coinButtonLabel: {
    color: Theme.colors.background_beige,
    fontSize: 14,
    fontWeight: "700",
  },
  resultBox: {
    backgroundColor: Theme.colors.background_sand,
    borderRadius: 12,
    padding: 12,
    gap: 6,
  },
  resultCoinImage: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignSelf: "center",
    backgroundColor: Theme.colors.background_beige,
  },
  resultTitle: {
    color: Theme.colors.text_charcoal,
    fontSize: 15,
    fontWeight: "700",
  },
  resultText: {
    color: Theme.colors.text_brown_gray,
    fontSize: 13,
    lineHeight: 18,
  },
  ticketAwardText: {
    color: Theme.colors.success,
    fontSize: 13,
    fontWeight: "700",
  },
  actionRow: {
    gap: 10,
  },
  primaryButton: {
    backgroundColor: Theme.colors.accent_terracotta,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  primaryButtonText: {
    color: Theme.colors.background_beige,
    fontSize: 15,
    fontWeight: "700",
  },
  secondaryButton: {
    backgroundColor: Theme.colors.background_beige,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  secondaryButtonText: {
    color: Theme.colors.text_charcoal,
    fontSize: 15,
    fontWeight: "700",
  },
});
