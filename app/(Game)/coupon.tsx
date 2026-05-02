import React, { useMemo } from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams } from "expo-router";
import { Theme } from "@/theme";
import { gameService, type CouponListItem } from "@/services/gameService";
import { useAlert } from "@/contexts/AlertContext";

export default function CouponScreen() {
  const { showAlert } = useAlert();
  const params = useLocalSearchParams<{ couponId?: string }>();
  const [coupon, setCoupon] = React.useState<CouponListItem | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let mounted = true;

    const loadCoupon = async () => {
      try {
        setLoading(true);
        const response = await gameService.getMyCoupons();
        if (!mounted) return;

        const selected = response.coupons.find((item) => item.id === params.couponId);
        setCoupon(selected || null);
      } catch (error) {
        if (!mounted) return;
        showAlert({
          title: "Coupon",
          message: error instanceof Error ? error.message : "Failed to load coupon",
          type: "error",
        });
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    void loadCoupon();

    return () => {
      mounted = false;
    };
  }, [params.couponId, showAlert]);

  const statusLabel = useMemo(() => {
    if (!coupon) return "unknown";
    if (coupon.status === "used") return "used";
    if (coupon.status === "expired") return "expired";
    return "active";
  }, [coupon]);

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <Text style={styles.title}>Loading coupon...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!coupon) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <Text style={styles.title}>Coupon not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>Coupon</Text>
        <View style={styles.card}>
          <Text style={styles.offerTitle}>{coupon.offer.title || "Offer"}</Text>
          <Text style={styles.meta}>Code: {coupon.code}</Text>
          <Text style={styles.meta}>Status: {statusLabel}</Text>
          <Text style={styles.meta}>
            Expires: {new Date(coupon.expiresAt).toLocaleDateString()}
          </Text>
          <Image source={{ uri: coupon.qrCode }} style={styles.qrImage} />
          <Text style={styles.scanHint}>
            Vendor scans this QR to verify your coupon.
          </Text>
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
    gap: 12,
  },
  title: {
    color: Theme.colors.text_charcoal,
    fontSize: 22,
    fontWeight: "700",
  },
  card: {
    backgroundColor: Theme.colors.background_beige,
    borderColor: Theme.colors.border,
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    alignItems: "center",
    gap: 8,
  },
  offerTitle: {
    color: Theme.colors.text_charcoal,
    fontSize: 18,
    fontWeight: "700",
    textAlign: "center",
  },
  meta: {
    color: Theme.colors.text_brown_gray,
    fontSize: 13,
    fontWeight: "600",
  },
  qrImage: {
    width: 260,
    height: 260,
    borderRadius: 8,
    backgroundColor: "#fff",
    marginTop: 8,
  },
  scanHint: {
    color: Theme.colors.text_earth,
    fontSize: 12,
    fontWeight: "600",
    textAlign: "center",
  },
});
