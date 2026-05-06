import React, { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Theme } from "@/theme";
import {
  gameService,
  type ClaimDailyCoinsResponse,
  type CoinSummary,
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
  const [summary, setSummary] = useState<CoinSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);
  const [selectedCoin, setSelectedCoin] = useState<number | null>(null);

  const loadStatus = useCallback(async (isPullRefresh = false) => {
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
          error instanceof Error ? error.message : "Failed to load coin status",
        type: "error",
      });
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [showAlert]);

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
      const response: ClaimDailyCoinsResponse = await gameService.claimDailyCoins(
        coinNumber,
      );
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

  const progressWidth = useMemo(() => {
    if (!summary) {
      return "0%";
    }

    const percentage = Math.min(
      100,
      Math.round((summary.progress.current / summary.progress.target) * 100),
    );
    return `${percentage}%`;
  }, [summary]);

  if (isLoading && !summary) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingState}>
          <ActivityIndicator size="large" color={Theme.colors.accent_terracotta} />
          <Text style={styles.loadingText}>Loading your VACAY Coins...</Text>
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
        <Text style={styles.title}>VACAY Coins</Text>
        <Text style={styles.subtitle}>
          Pick 1 of 3 coins once per day to win a random 0 to 10 VACAY Coins.
        </Text>

        <View style={styles.summaryGrid}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Balance</Text>
            <Text style={styles.summaryValue}>{summary?.balance ?? 0}</Text>
            <Text style={styles.summaryHint}>Coins toward next ticket</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Tickets</Text>
            <Text style={styles.summaryValue}>{summary?.ticketsEarned ?? 0}</Text>
            <Text style={styles.summaryHint}>Earn 1 ticket at 1000 coins</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Lifetime</Text>
            <Text style={styles.summaryValue}>{summary?.lifetimeCoins ?? 0}</Text>
            <Text style={styles.summaryHint}>Total VACAY Coins won</Text>
          </View>
        </View>

        <View style={styles.progressCard}>
          <Text style={styles.sectionTitle}>Ticket Progress</Text>
          <Text style={styles.progressText}>
            {summary?.progress.current ?? 0} / {summary?.progress.target ?? 1000} coins
          </Text>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: progressWidth }]} />
          </View>
          <Text style={styles.progressHint}>
            {summary?.progress.remaining ?? 1000} more coins until your next ticket.
          </Text>
        </View>

        <View style={styles.claimCard}>
          <Text style={styles.sectionTitle}>Daily Coin Pick</Text>
          <Text style={styles.claimHint}>
            {summary?.dailyTap.canTap
              ? "Choose 1 coin below to reveal today’s VACAY reward."
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
                    (!summary?.dailyTap.canTap || isClaiming) && styles.coinButtonDisabled,
                  ]}
                  onPress={() => void onPickCoin(coinNumber)}
                  activeOpacity={0.9}
                  disabled={!summary?.dailyTap.canTap || isClaiming}
                >
                  <Ionicons
                    name="logo-bitcoin"
                    size={30}
                    color={Theme.colors.background_beige}
                  />
                  <Text style={styles.coinButtonLabel}>Coin {coinNumber}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {summary?.lastClaim ? (
            <View style={styles.resultBox}>
              <Text style={styles.resultTitle}>Today’s Result</Text>
              <Text style={styles.resultText}>
                Picked Coin {summary.lastClaim.selectedCoin ?? "-"} and won +{summary.lastClaim.coinsWon} VACAY Coins.
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
            onPress={() => router.push("/(tabs)/myRewards")}
          >
            <Text style={styles.primaryButtonText}>Open Rewards</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => router.push("/(Game)/vendorSelection")}
          >
            <Text style={styles.secondaryButtonText}>Manage Vendors</Text>
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
  progressCard: {
    backgroundColor: Theme.colors.background_beige,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    gap: 10,
  },
  sectionTitle: {
    color: Theme.colors.text_charcoal,
    fontSize: 17,
    fontWeight: "700",
  },
  progressText: {
    color: Theme.colors.text_brown_gray,
    fontSize: 14,
    fontWeight: "600",
  },
  progressTrack: {
    height: 12,
    borderRadius: 999,
    overflow: "hidden",
    backgroundColor: Theme.colors.background_sand,
  },
  progressFill: {
    height: "100%",
    backgroundColor: Theme.colors.accent_terracotta,
    borderRadius: 999,
  },
  progressHint: {
    color: Theme.colors.text_brown_gray,
    fontSize: 13,
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