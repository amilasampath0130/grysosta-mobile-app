import React, { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  RefreshControl,
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
  type CouponListItem,
  type RewardListItem,
} from "@/services/gameService";
import { useAlert } from "@/contexts/AlertContext";

type RewardTab = "active" | "saved" | "expired";

export default function MyRewardsScreen() {
  const { showAlert } = useAlert();
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedTab, setSelectedTab] = useState<RewardTab>("active");
  const [activeRewards, setActiveRewards] = useState<RewardListItem[]>([]);
  const [savedRewards, setSavedRewards] = useState<RewardListItem[]>([]);
  const [expiredRewards, setExpiredRewards] = useState<RewardListItem[]>([]);
  const [coupons, setCoupons] = useState<CouponListItem[]>([]);
  const [redeemingRewardId, setRedeemingRewardId] = useState<string | null>(null);

  const loadData = useCallback(async (isPullRefresh = false) => {
    try {
      if (isPullRefresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }

      const [rewardsResponse, couponsResponse] = await Promise.all([
        gameService.getMyRewards(),
        gameService.getMyCoupons(),
      ]);

      setActiveRewards(rewardsResponse.rewards.active || []);
      setSavedRewards(rewardsResponse.rewards.saved || []);
      setExpiredRewards(rewardsResponse.rewards.expired || []);
      setCoupons(couponsResponse.coupons || []);
    } catch (error) {
      showAlert({
        title: "Rewards",
        message: error instanceof Error ? error.message : "Failed to load rewards",
        type: "error",
      });
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void loadData();
    }, [loadData]),
  );

  const visibleRewards = useMemo(() => {
    if (selectedTab === "saved") return savedRewards;
    if (selectedTab === "expired") return expiredRewards;
    return activeRewards;
  }, [activeRewards, expiredRewards, savedRewards, selectedTab]);

  const onRedeem = async (rewardId: string) => {
    try {
      setRedeemingRewardId(rewardId);
      const response = await gameService.redeemReward(rewardId);
      if (!response.success || !response.coupon) {
        throw new Error(response.message || "Unable to redeem reward");
      }

      await loadData();

      router.push({
        pathname: "/(Game)/coupon",
        params: { couponId: response.coupon.id },
      });
    } catch (error) {
      showAlert({
        title: "Redeem",
        message: error instanceof Error ? error.message : "Unable to redeem reward",
        type: "error",
      });
    } finally {
      setRedeemingRewardId(null);
    }
  };

  const renderReward = ({ item }: { item: RewardListItem }) => {
    const isRedeemable = item.status === "won" || item.status === "saved";

    return (
      <View style={styles.rewardCard}>
        {item.offer.bannerUrl ? (
          <Image source={{ uri: item.offer.bannerUrl }} style={styles.banner} />
        ) : null}
        <Text style={styles.rewardTitle}>{item.offer.title || "Offer"}</Text>
        <Text style={styles.rewardMeta}>Status: {item.status}</Text>
        <Text style={styles.rewardMeta}>
          Discount: {item.offer.discount ?? 0}%
        </Text>
        <Text style={styles.rewardMeta}>
          Expires: {new Date(item.expiresAt).toLocaleDateString()}
        </Text>

        {isRedeemable ? (
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => void onRedeem(item.id)}
            disabled={redeemingRewardId === item.id}
          >
            <Text style={styles.primaryButtonText}>
              {redeemingRewardId === item.id ? "Redeeming..." : "Redeem Now"}
            </Text>
          </TouchableOpacity>
        ) : null}
      </View>
    );
  };

  const renderCoupon = ({ item }: { item: CouponListItem }) => (
    <TouchableOpacity
      style={styles.couponCard}
      onPress={() =>
        router.push({
          pathname: "/(Game)/coupon",
          params: { couponId: item.id },
        })
      }
    >
      <Text style={styles.couponTitle}>{item.offer.title || "Coupon"}</Text>
      <Text style={styles.couponMeta}>Code: {item.code}</Text>
      <Text style={styles.couponMeta}>Status: {item.status}</Text>
      <Text style={styles.couponMeta}>
        Expires: {new Date(item.expiresAt).toLocaleDateString()}
      </Text>
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingState}>
          <ActivityIndicator color={Theme.colors.accent_terracotta} size="large" />
          <Text style={styles.loadingText}>Loading rewards...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>My Rewards</Text>

        <View style={styles.tabRow}>
          {(["active", "saved", "expired"] as RewardTab[]).map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.tabButton, selectedTab === tab && styles.tabButtonActive]}
              onPress={() => setSelectedTab(tab)}
            >
              <Text
                style={[
                  styles.tabLabel,
                  selectedTab === tab && styles.tabLabelActive,
                ]}
              >
                {tab[0].toUpperCase() + tab.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <FlatList
          data={visibleRewards}
          keyExtractor={(item) => item.id}
          renderItem={renderReward}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={() => void loadData(true)}
              tintColor={Theme.colors.accent_terracotta}
            />
          }
          ListEmptyComponent={
            <Text style={styles.emptyText}>No {selectedTab} rewards.</Text>
          }
          contentContainerStyle={styles.rewardList}
          showsVerticalScrollIndicator={false}
        />

        <View style={styles.couponSection}>
          <Text style={styles.sectionTitle}>Coupons</Text>
          <FlatList
            data={coupons}
            keyExtractor={(item) => item.id}
            renderItem={renderCoupon}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.couponList}
            ListEmptyComponent={
              <Text style={styles.emptyText}>No coupons generated yet.</Text>
            }
          />
        </View>
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
    paddingVertical: 12,
    gap: 10,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: Theme.colors.text_charcoal,
  },
  loadingState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
  },
  loadingText: {
    color: Theme.colors.text_brown_gray,
    fontSize: 14,
    fontWeight: "600",
  },
  tabRow: {
    flexDirection: "row",
    gap: 8,
  },
  tabButton: {
    flex: 1,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    backgroundColor: Theme.colors.background_beige,
    paddingVertical: 10,
    alignItems: "center",
  },
  tabButtonActive: {
    backgroundColor: Theme.colors.accent_terracotta,
    borderColor: Theme.colors.accent_terracotta,
  },
  tabLabel: {
    color: Theme.colors.text_charcoal,
    fontSize: 13,
    fontWeight: "700",
  },
  tabLabelActive: {
    color: Theme.colors.background_beige,
  },
  rewardList: {
    gap: 10,
    paddingBottom: 12,
  },
  rewardCard: {
    backgroundColor: Theme.colors.background_beige,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    borderRadius: 12,
    padding: 12,
    gap: 6,
  },
  banner: {
    width: "100%",
    height: 120,
    borderRadius: 8,
    backgroundColor: Theme.colors.background_sand,
  },
  rewardTitle: {
    color: Theme.colors.text_charcoal,
    fontSize: 16,
    fontWeight: "700",
  },
  rewardMeta: {
    color: Theme.colors.text_brown_gray,
    fontSize: 13,
    fontWeight: "600",
  },
  primaryButton: {
    marginTop: 8,
    backgroundColor: Theme.colors.accent_terracotta,
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: "center",
  },
  primaryButtonText: {
    color: Theme.colors.background_beige,
    fontWeight: "700",
    fontSize: 14,
  },
  couponSection: {
    gap: 8,
  },
  sectionTitle: {
    color: Theme.colors.text_charcoal,
    fontSize: 16,
    fontWeight: "700",
  },
  couponList: {
    gap: 10,
    paddingRight: 20,
  },
  couponCard: {
    width: 210,
    backgroundColor: Theme.colors.background_beige,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    borderRadius: 12,
    padding: 12,
    gap: 4,
  },
  couponTitle: {
    color: Theme.colors.text_charcoal,
    fontSize: 14,
    fontWeight: "700",
  },
  couponMeta: {
    color: Theme.colors.text_brown_gray,
    fontSize: 12,
    fontWeight: "600",
  },
  emptyText: {
    color: Theme.colors.text_brown_gray,
    fontSize: 13,
    fontWeight: "600",
    textAlign: "center",
    paddingVertical: 8,
  },
});
