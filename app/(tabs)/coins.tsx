import React, { useCallback, useMemo, useState } from "react";
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
import {
  gameService,
  type CoinPortfolioResponse,
  type CoinTapSummary,
} from "@/services/gameService";
import { useAlert } from "@/contexts/AlertContext";

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
  const [portfolio, setPortfolio] = useState<
    CoinPortfolioResponse["portfolio"] | null
  >(null);
  const [summary, setSummary] = useState<CoinTapSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadStatus = useCallback(
    async (isPullRefresh = false) => {
      try {
        if (isPullRefresh) {
          setIsRefreshing(true);
        } else {
          setIsLoading(true);
        }

        const [portfolioResponse, summaryResponse] = await Promise.all([
          gameService.getCoinPortfolio(),
          gameService.getCoinStatus(),
        ]);

        setPortfolio(portfolioResponse.portfolio);
        setSummary(summaryResponse.summary);
      } catch (error) {
        showAlert({
          title: "Coin Portfolio",
          message:
            error instanceof Error
              ? error.message
              : "Failed to load coin portfolio",
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

  const totalCoinsReceived = useMemo(
    () => portfolio?.totalLifetimeEarned ?? 0,
    [portfolio],
  );

  if (isLoading && !portfolio) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingState}>
          <ActivityIndicator
            size="large"
            color={Theme.colors.accent_terracotta}
          />
          <Text style={styles.loadingText}>Loading your coin portfolio...</Text>
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
        <Text style={styles.title}>Coin Portfolio</Text>
        <Text style={styles.subtitle}>
          Track your progress across the GRYSOSTA coin ecosystem.
        </Text>

        <View style={styles.aggregateCard}>
          <View>
            <Text style={styles.aggregateLabel}>TOTAL COINS RECEIVED</Text>
            <Text style={styles.aggregateValue}>{totalCoinsReceived}</Text>
            <Text style={styles.aggregateHint}>Across all GRYSOSTA coins</Text>
          </View>

          <TouchableOpacity
            style={styles.buyButton}
            onPress={() => {
              showAlert({
                title: "Coming Soon",
                message: "Moonshot purchase flow will be available soon.",
                type: "warning",
              });
            }}
          >
            <Text style={styles.buyButtonText}>Buy Coins</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.listSection}>
          {(portfolio?.coins || []).map((item) => (
            <View key={item.coinType.id} style={styles.coinCard}>
              <View style={styles.coinHeader}>
                <Image
                  source={{ uri: item.coinType.imageUrl }}
                  style={styles.coinImage}
                />

                <View style={styles.coinMeta}>
                  <Text style={styles.coinName}>{item.coinType.name}</Text>
                  <Text style={styles.coinDescription} numberOfLines={2}>
                    {item.coinType.description || "Earn and grow this coin."}
                  </Text>
                </View>

                <TouchableOpacity
                  style={styles.smallBuyButton}
                  onPress={() => {
                    showAlert({
                      title: "Coming Soon",
                      message: "Moonshot purchase flow will be available soon.",
                      type: "warning",
                    });
                  }}
                >
                  <Text style={styles.smallBuyButtonText}>Buy</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.metricRow}>
                <View style={styles.metricItem}>
                  <Text style={styles.metricLabel}>Balance</Text>
                  <Text style={styles.metricValue}>{item.balance}</Text>
                </View>
                <View style={styles.metricItem}>
                  <Text style={styles.metricLabel}>Earned (Lifetime)</Text>
                  <Text style={styles.metricValue}>{item.lifetimeEarned}</Text>
                </View>
                <View style={styles.metricItem}>
                  <Text style={styles.metricLabel}>Goal</Text>
                  <Text style={styles.metricValue}>{item.progress.target}</Text>
                </View>
              </View>

              <View style={styles.progressTrack}>
                <View
                  style={[
                    styles.progressFill,
                    { width: `${Math.max(2, item.progress.percentage)}%` },
                  ]}
                />
              </View>

              <View style={styles.progressFooter}>
                <Text style={styles.progressText}>
                  {item.progress.current} / {item.progress.target}
                </Text>
                <Text style={styles.progressText}>
                  {item.progress.remaining} remaining
                </Text>
              </View>
            </View>
          ))}

          {portfolio?.coins?.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>
                No coin data yet. Play Daily Touch to start building your
                portfolio.
              </Text>
            </View>
          ) : null}

          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>Daily Touch Status</Text>
            <Text style={styles.infoText}>
              {summary?.dailyTap.canTap
                ? "You can play now and win either an offer or coin reward."
                : `You already played today. Next try: ${formatDateTime(summary?.dailyTap.nextAvailableAt)}`}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => router.push("/(Game)/gameHome")}
        >
          <Text style={styles.primaryButtonText}>Go To Daily Touch</Text>
        </TouchableOpacity>
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
    gap: 16,
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
  aggregateCard: {
    backgroundColor: "#0D4CCB",
    borderRadius: 16,
    padding: 18,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  aggregateLabel: {
    color: "#CFE0FF",
    fontSize: 12,
    fontWeight: "700",
  },
  aggregateValue: {
    color: "#FFFFFF",
    fontSize: 42,
    fontWeight: "900",
    lineHeight: 46,
  },
  aggregateHint: {
    color: "#E6EEFF",
    fontSize: 12,
    fontWeight: "600",
  },
  buyButton: {
    backgroundColor: "#18C93E",
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 18,
  },
  buyButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  listSection: {
    gap: 12,
  },
  coinCard: {
    backgroundColor: Theme.colors.background_beige,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    gap: 14,
  },
  coinHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  coinImage: {
    width: 86,
    height: 86,
    borderRadius: 43,
    backgroundColor: Theme.colors.background_cream,
  },
  coinMeta: {
    flex: 1,
    gap: 4,
  },
  coinName: {
    color: Theme.colors.text_charcoal,
    fontSize: 18,
    fontWeight: "800",
  },
  coinDescription: {
    color: Theme.colors.text_brown_gray,
    fontSize: 14,
    lineHeight: 20,
  },
  smallBuyButton: {
    backgroundColor: "#18C93E",
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  smallBuyButtonText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
  },
  metricRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
  },
  metricItem: {
    flex: 1,
  },
  metricLabel: {
    color: Theme.colors.text_earth,
    fontSize: 12,
    fontWeight: "600",
  },
  metricValue: {
    color: Theme.colors.text_charcoal,
    fontSize: 34,
    fontWeight: "800",
    lineHeight: 38,
  },
  progressTrack: {
    height: 10,
    borderRadius: 999,
    backgroundColor: Theme.colors.background_cream,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 999,
    backgroundColor: "#0D4CCB",
  },
  progressFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  progressText: {
    color: Theme.colors.text_charcoal,
    fontSize: 14,
    fontWeight: "600",
  },
  emptyState: {
    backgroundColor: Theme.colors.background_beige,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  emptyText: {
    color: Theme.colors.text_brown_gray,
    fontSize: 14,
    lineHeight: 20,
  },
  infoCard: {
    backgroundColor: Theme.colors.background_sand,
    borderRadius: 12,
    padding: 12,
    gap: 4,
  },
  infoTitle: {
    color: Theme.colors.text_charcoal,
    fontSize: 14,
    fontWeight: "700",
  },
  infoText: {
    color: Theme.colors.text_brown_gray,
    fontSize: 13,
    lineHeight: 18,
  },
  primaryButton: {
    marginTop: 6,
    backgroundColor: "#0D4CCB",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
});
