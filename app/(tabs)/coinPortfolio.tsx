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
import {
  gameService,
  type CoinPortfolioResponse,
} from "@/services/gameService";
import { useAlert } from "@/contexts/AlertContext";

export default function CoinPortfolioScreen() {
  const { showAlert } = useAlert();
  const [data, setData] = useState<CoinPortfolioResponse["portfolio"] | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadPortfolio = useCallback(
    async (isPullRefresh = false) => {
      try {
        if (isPullRefresh) {
          setIsRefreshing(true);
        } else {
          setIsLoading(true);
        }

        const response = await gameService.getCoinPortfolio();
        setData(response.portfolio);
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
      void loadPortfolio();
    }, [loadPortfolio]),
  );

  if (isLoading && !data) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingState}>
          <ActivityIndicator
            size="large"
            color={Theme.colors.accent_terracotta}
          />
          <Text style={styles.loadingText}>Loading your coin progress...</Text>
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
            onRefresh={() => void loadPortfolio(true)}
            tintColor={Theme.colors.accent_terracotta}
          />
        }
      >
        <Text style={styles.title}>Coin Portfolio</Text>
        <Text style={styles.subtitle}>
          Track each coin separately and watch its progress toward the next
          target.
        </Text>

        <View style={styles.summaryGrid}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Total Balance</Text>
            <Text style={styles.summaryValue}>{data?.totalBalance ?? 0}</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Lifetime Earned</Text>
            <Text style={styles.summaryValue}>
              {data?.totalLifetimeEarned ?? 0}
            </Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Tickets</Text>
            <Text style={styles.summaryValue}>{data?.ticketsEarned ?? 0}</Text>
          </View>
        </View>

        <View style={styles.listSection}>
          {(data?.coins || []).map((item) => (
            <View key={item.coinType.id} style={styles.coinCard}>
              <View style={styles.coinHeader}>
                <Image
                  source={{ uri: item.coinType.imageUrl }}
                  style={styles.coinImage}
                />
                <View style={styles.coinMeta}>
                  <Text style={styles.coinName}>{item.coinType.name}</Text>
                  <Text style={styles.coinCode}>{item.coinType.code}</Text>
                  <Text style={styles.coinDescription}>
                    {item.coinType.description || "Vendor reward coin"}
                  </Text>
                </View>
              </View>

              <View style={styles.metricRow}>
                <Text style={styles.metricText}>Balance: {item.balance}</Text>
                <Text style={styles.metricText}>
                  Lifetime: {item.lifetimeEarned}
                </Text>
              </View>

              <View style={styles.progressTrack}>
                <View
                  style={[
                    styles.progressFill,
                    { width: `${item.progress.percentage}%` },
                  ]}
                />
              </View>
              <Text style={styles.progressText}>
                {item.progress.current} / {item.progress.target} •{" "}
                {item.progress.remaining} remaining
              </Text>
            </View>
          ))}

          {data?.coins?.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>
                No coin balances yet. Start with today&apos;s coin touch.
              </Text>
            </View>
          ) : null}
        </View>

        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => router.push("/(tabs)/coins")}
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
  listSection: {
    gap: 12,
  },
  coinCard: {
    backgroundColor: Theme.colors.background_beige,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    gap: 12,
  },
  coinHeader: {
    flexDirection: "row",
    gap: 12,
  },
  coinImage: {
    width: 60,
    height: 60,
    borderRadius: 16,
    backgroundColor: Theme.colors.background_cream,
  },
  coinMeta: {
    flex: 1,
    gap: 2,
  },
  coinName: {
    color: Theme.colors.text_charcoal,
    fontSize: 18,
    fontWeight: "800",
  },
  coinCode: {
    color: Theme.colors.accent_terracotta,
    fontSize: 13,
    fontWeight: "700",
  },
  coinDescription: {
    color: Theme.colors.text_brown_gray,
    fontSize: 13,
    lineHeight: 18,
  },
  metricRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  metricText: {
    color: Theme.colors.text_charcoal,
    fontSize: 13,
    fontWeight: "600",
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
    backgroundColor: Theme.colors.accent_terracotta,
  },
  progressText: {
    color: Theme.colors.text_brown_gray,
    fontSize: 12,
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
  primaryButton: {
    marginTop: 8,
    backgroundColor: Theme.colors.accent_terracotta,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
  },
  primaryButtonText: {
    color: Theme.colors.background_beige,
    fontSize: 15,
    fontWeight: "700",
  },
});
