import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  ActivityIndicator,
  Animated,
  FlatList,
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  Modal,
  Pressable,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
// import GameCard from "../../components/HomeComponents/GameCard";
import { Images } from "@/assets/images/images";
import { Colors } from "../../theme/colors";
import { router } from "expo-router";
import {
  advertisementService,
  type PublicAdvertisementItem,
} from "@/services/advertisementService";

interface NewsItemProps {
  title: string;
  time: string;
  trend: "up" | "down";
}

interface QuickAction {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  route?: string;
}

const SCREEN_WIDTH = Dimensions.get("window").width;
const CAROUSEL_ITEM_WIDTH = SCREEN_WIDTH - 40;

const formatVendorCategory = (value?: string) => {
  if (!value) return "Featured Partner";
  return value
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");
};

const HomeScreen: React.FC = () => {
  const [ads, setAds] = useState<PublicAdvertisementItem[]>([]);
  const [isAdsLoading, setIsAdsLoading] = useState<boolean>(true);
  const [activeAdIndex, setActiveAdIndex] = useState<number>(0);
  const [adsError, setAdsError] = useState<string | null>(null);
  const [selectedAd, setSelectedAd] = useState<PublicAdvertisementItem | null>(
    null,
  );

  const adsListRef = useRef<FlatList<PublicAdvertisementItem>>(null);
  const scrollX = useRef(new Animated.Value(0)).current;

  const quickActions: QuickAction[] = [
    { label: "Offers", icon: "pricetag-sharp", route: "/(offers)/offersHome" },
    { label: "Rewards", icon: "trophy-outline" },
    { label: "Wallet", icon: "wallet-outline" },
  ];

  const loadAds = useCallback(async () => {
    try {
      setIsAdsLoading(true);
      setAdsError(null);
      const activeAdvertisements =
        await advertisementService.getPublicActiveAdvertisements();
      setAds(activeAdvertisements);
      setActiveAdIndex(0);
    } catch (error) {
      setAds([]);
      setAdsError(
        error instanceof Error
          ? error.message
          : "Failed to load advertisements",
      );
    } finally {
      setIsAdsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadAds();
  }, [loadAds]);

  useEffect(() => {
    if (ads.length < 2) return;

    const timer = setInterval(() => {
      setActiveAdIndex((prev) => {
        const next = (prev + 1) % ads.length;
        adsListRef.current?.scrollToOffset({
          offset: next * CAROUSEL_ITEM_WIDTH,
          animated: true,
        });
        return next;
      });
    }, 3500);

    return () => clearInterval(timer);
  }, [ads.length]);

  const adSectionTitle = useMemo(() => {
    if (isAdsLoading) return "Loading advertisements...";
    if (adsError) return "Vendor Advertisements";
    return "Vendor Advertisements";
  }, [adsError, isAdsLoading]);

  const NewsItem: React.FC<NewsItemProps> = ({ title, time, trend }) => (
    <View style={styles.newsItem}>
      <View style={styles.newsIcon}>
        <Ionicons name="flash" size={16} color={Colors.accent_terracotta} />
      </View>
      <View style={styles.newsContent}>
        <Text style={styles.newsTitle}>{title}</Text>
        <View style={styles.newsFooter}>
          <Text style={styles.newsTime}>{time}</Text>
          <View
            style={[
              styles.trendBadge,
              {
                backgroundColor:
                  trend === "up"
                    ? "rgba(110, 139, 107, 0.18)"
                    : "rgba(184, 92, 56, 0.18)",
              },
            ]}
          >
            <Ionicons
              name={trend === "up" ? "caret-up" : "caret-down"}
              size={12}
              color={
                trend === "up" ? Colors.accent_olive : Colors.accent_terracotta
              }
            />
            <Text
              style={[
                styles.trendText,
                {
                  color:
                    trend === "up"
                      ? Colors.accent_olive
                      : Colors.accent_terracotta,
                },
              ]}
            >
              {trend === "up" ? "Bullish" : "Bearish"}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
  const handlePress = () => {
    router.push("/(Game)/core");
  };

  const handleAdSnap = (offsetX: number) => {
    const nextIndex = Math.round(offsetX / CAROUSEL_ITEM_WIDTH);
    setActiveAdIndex(nextIndex);
  };

  const renderAdvertisement = ({ item }: { item: PublicAdvertisementItem }) => {
    return (
      <TouchableOpacity
        activeOpacity={0.9}
        style={styles.adCard}
        onPress={() => setSelectedAd(item)}
      >
        <Image
          source={{ uri: item.imageUrl }}
          style={styles.adImage}
          resizeMode="cover"
        />
        <View style={styles.adOverlay}>
          <Text style={styles.adVendor}>{item.vendorName}</Text>
          <Text style={styles.adTitle} numberOfLines={1}>
            {item.title}
          </Text>
          <Text style={styles.adDescription} numberOfLines={2}>
            {item.content}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <StatusBar style="dark" />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <View style={styles.headerContainer}>
            <View style={styles.logoContainer}>
              <Image
                style={styles.logoImage}
                source={Images.logo}
                resizeMode="contain"
              />
            </View>
            <View style={styles.textContainer}>
              <Text style={styles.headerTitle}>GRYSOSTA</Text>
              <Text style={styles.headerSubtitle}>Build your legacy today</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.iconButton}>
            <Ionicons
              name="notifications-outline"
              size={20}
              color={Colors.text_charcoal}
            />
          </TouchableOpacity>
        </View>
      </View>
      {/* Main Content */}
      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Banner section */}
        <View style={styles.bannerContainer}>
          <Image
            source={Images.mainBanner}
            style={styles.bannerImage}
            resizeMode="cover"
          />
        </View>

        <View style={styles.adSection}>
          <View style={styles.actionSectionHeader}>
            <View>
              <Text style={styles.actionSectionTitle}>{adSectionTitle}</Text>
              <Text style={styles.actionSectionSubtitle}>
                Uploaded by verified vendors
              </Text>
            </View>
          </View>

          {isAdsLoading && (
            <View style={styles.adStatusRow}>
              <ActivityIndicator color={Colors.accent_terracotta} />
              <Text style={styles.adStatusText}>Fetching latest ads...</Text>
            </View>
          )}

          {!isAdsLoading && ads.length > 0 && (
            <>
              <Animated.FlatList
                ref={adsListRef}
                data={ads}
                keyExtractor={(item) => item.id}
                renderItem={renderAdvertisement}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                snapToInterval={CAROUSEL_ITEM_WIDTH}
                decelerationRate="fast"
                onMomentumScrollEnd={(event) => {
                  handleAdSnap(event.nativeEvent.contentOffset.x);
                }}
                onScroll={Animated.event(
                  [{ nativeEvent: { contentOffset: { x: scrollX } } }],
                  { useNativeDriver: false },
                )}
                scrollEventThrottle={16}
              />

              <View style={styles.adPagination}>
                {ads.map((_, index) => (
                  <View
                    key={`ad-dot-${index}`}
                    style={[
                      styles.adDot,
                      index === activeAdIndex && styles.adDotActive,
                    ]}
                  />
                ))}
              </View>
            </>
          )}

          {!isAdsLoading && ads.length === 0 && (
            <View style={styles.adEmptyState}>
              <Text style={styles.adStatusText}>
                {adsError || "No active advertisements right now."}
              </Text>
              {adsError && (
                <TouchableOpacity
                  style={styles.retryButton}
                  onPress={() => void loadAds()}
                >
                  <Text style={styles.retryButtonText}>Retry</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>

        {/* Hero Section */}
        <View style={styles.heroCard}>
          <Text style={styles.heroLabel}>Today</Text>
          <Text style={styles.heroTitle}>Claim This Week Offer</Text>
          <TouchableOpacity style={styles.heroCta} onPress={handlePress}>
            <Text style={styles.heroCtaText}>Start Claiming</Text>
            <Ionicons
              name="arrow-forward"
              size={16}
              color={Colors.background_cream}
            />
          </TouchableOpacity>
        </View>

        {/* Quick Actions */}
        <View style={styles.actionSection}>
          <View style={styles.actionSectionHeader}>
            <View>
              <Text style={styles.actionSectionTitle}>Quick Actions</Text>
              <Text style={styles.actionSectionSubtitle}>
                Jump back in with one tap
              </Text>
            </View>
          </View>
          <View style={styles.actionsRow}>
            {quickActions.map((action) => (
              <TouchableOpacity
                key={action.label}
                style={styles.actionCard}
                onPress={() => {
                  if (action.route) {
                    router.push(action.route);
                  }
                }}
              >
                <View style={styles.actionIcon}>
                  <Ionicons
                    name={action.icon}
                    size={18}
                    color={Colors.accent_terracotta}
                  />
                </View>
                <Text style={styles.actionLabel}>{action.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        <View style={styles.actionSection}>
          <View style={styles.actionSectionHeader}>
            <View>
              <Text style={styles.actionSectionTitle}>Offers</Text>
              <Text style={styles.actionSectionSubtitle}>
                Exclusive deals just for you
              </Text>
            </View>
          </View>
          <View style={styles.actionsRow}>
            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => router.push("/(offers)/offersHome")}
            >
              <View style={styles.actionIcon}>
                <Ionicons
                  name="pricetag-sharp"
                  size={18}
                  color={Colors.accent_terracotta}
                />
              </View>
              <Text style={styles.actionLabel}>View Offers</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      <Modal
        visible={Boolean(selectedAd)}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedAd(null)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setSelectedAd(null)}
        >
          <Pressable
            style={styles.modalCard}
            onPress={(event) => event.stopPropagation()}
          >
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.modalScrollContent}
            >
              <View style={styles.modalHero}>
                {selectedAd?.imageUrl ? (
                  <Image
                    source={{ uri: selectedAd.imageUrl }}
                    style={styles.modalAdImage}
                  />
                ) : null}

                <View style={styles.modalHeroShade} />

                <TouchableOpacity
                  style={styles.modalCloseButton}
                  onPress={() => setSelectedAd(null)}
                  activeOpacity={0.85}
                >
                  <Ionicons
                    name="close"
                    size={20}
                    color={Colors.background_cream}
                  />
                </TouchableOpacity>

                <View style={styles.vendorLogoShell}>
                  {selectedAd?.vendorLogoUrl ? (
                    <Image
                      source={{ uri: selectedAd.vendorLogoUrl }}
                      style={styles.vendorLogoImage}
                      resizeMode="cover"
                    />
                  ) : (
                    <View style={styles.vendorLogoPlaceholder}>
                      <Ionicons
                        name="storefront-outline"
                        size={30}
                        color={Colors.accent_terracotta}
                      />
                    </View>
                  )}
                </View>
              </View>

              <View style={styles.modalContentSection}>
                <View style={styles.vendorMetaRow}>
                  <View style={styles.vendorPill}>
                    <Ionicons
                      name="sparkles-outline"
                      size={14}
                      color={Colors.accent_terracotta}
                    />
                    <Text style={styles.vendorPillText}>Verified Vendor</Text>
                  </View>
                  <View style={styles.vendorCategoryChip}>
                    <Text style={styles.vendorCategoryChipText}>
                      {formatVendorCategory(selectedAd?.vendorCategory)}
                    </Text>
                  </View>
                </View>

                <Text style={styles.modalAdVendor}>
                  {selectedAd?.vendorName}
                </Text>
                <Text style={styles.modalAdTitle}>{selectedAd?.title}</Text>
                <Text style={styles.modalAdDescription}>
                  {selectedAd?.content}
                </Text>

                <View style={styles.vendorSpotlightCard}>
                  <Text style={styles.vendorSpotlightEyebrow}>
                    Vendor Spotlight
                  </Text>
                  <Text style={styles.vendorSpotlightTitle}>
                    {formatVendorCategory(selectedAd?.vendorCategory)}{" "}
                    experiences curated by {selectedAd?.vendorName}
                  </Text>
                  <Text style={styles.vendorSpotlightText}>
                    Explore promotions, top-up rewards, and brand information
                    before you continue to checkout.
                  </Text>
                </View>

                <View style={styles.topUpInfoBox}>
                  <Text style={styles.topUpInfoTitle}>Top Up Information</Text>
                  <Text style={styles.topUpInfoText}>
                    1. Choose a top-up package that matches your goals.
                  </Text>
                  <Text style={styles.topUpInfoText}>
                    2. Review bonus points and offer validity before purchase.
                  </Text>
                  <Text style={styles.topUpInfoText}>
                    3. Confirm payment to unlock available rewards instantly.
                  </Text>
                </View>

                <View style={styles.modalActionRow}>
                  <TouchableOpacity
                    style={[
                      styles.modalActionButton,
                      styles.modalSecondaryButton,
                    ]}
                    onPress={() => setSelectedAd(null)}
                  >
                    <Ionicons
                      name="close-circle-outline"
                      size={16}
                      color={Colors.text_charcoal}
                    />
                    <Text style={styles.modalSecondaryButtonText}>Close</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.modalActionButton,
                      styles.modalPrimaryButton,
                    ]}
                    onPress={() => {
                      setSelectedAd(null);
                      router.push("/(offers)/offersHome");
                    }}
                  >
                    <Ionicons
                      name="wallet-outline"
                      size={16}
                      color={Colors.background_cream}
                    />
                    <Text style={styles.modalPrimaryButtonText}>
                      Open Top Up
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background_cream,
  },
  container: {
    flex: 1,
  },
  header: {
    backgroundColor: Colors.background_beige,
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: Colors.background_sand,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  headerContainer: {

    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    alignSelf: "flex-start",
    justifyContent: "center",
  },

  logoContainer: {
    flexShrink: 0,
      width: 60,
      height: 60,
      borderRadius: 20,
      backgroundColor: Colors.background_sand,
      justifyContent: "center",
      alignItems: "center",
  },
  textContainer: {
    flexDirection: "column",
  },
  headerTitle: {
    color: Colors.text_charcoal,
    fontSize: 32,
    fontWeight: "800",
    letterSpacing: 1,
  },
  headerSubtitle: {
    color: Colors.text_brown_gray,
    fontSize: 14,
    fontWeight: "500",
    marginTop: 1,
    letterSpacing: 0.5,
    marginLeft: 4,
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.background_cream,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.background_sand,
  },
  heroCard: {
    backgroundColor: Colors.background_cream,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.background_sand,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginTop: 20,
  },
  heroLabel: {
    color: Colors.text_earth,
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 6,
  },
  heroTitle: {
    color: Colors.text_charcoal,
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 12,
  },
  heroCta: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: Colors.accent_terracotta,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
  },
  heroCtaText: {
    color: Colors.background_cream,
    fontSize: 14,
    fontWeight: "600",
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  bannerContainer: {
    width: "100%",
    height: Math.round(Dimensions.get("window").width * 0.42),
    maxHeight: 220,
    borderRadius: 14,
    backgroundColor: Colors.background_beige,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 6,
    overflow: "hidden",
  },
  bannerImage: {
    width: "100%",
    height: "100%",
  },
  adSection: {
    marginTop: 20,
  },
  adCard: {
    width: CAROUSEL_ITEM_WIDTH,
    height: Math.round(CAROUSEL_ITEM_WIDTH * 0.45),
    borderRadius: 14,
    overflow: "hidden",
    backgroundColor: Colors.background_beige,
    borderWidth: 1,
    borderColor: Colors.background_sand,
  },
  adImage: {
    width: "100%",
    height: "100%",
    position: "absolute",
  },
  adOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    padding: 12,
    backgroundColor: "rgba(17, 24, 39, 0.33)",
  },
  adVendor: {
    color: Colors.background_cream,
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 4,
  },
  adTitle: {
    color: Colors.background_cream,
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 2,
  },
  adDescription: {
    color: Colors.background_cream,
    fontSize: 12,
    fontWeight: "500",
  },
  adStatusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 8,
  },
  adStatusText: {
    color: Colors.text_brown_gray,
    fontSize: 13,
    fontWeight: "500",
  },
  adEmptyState: {
    borderWidth: 1,
    borderColor: Colors.background_sand,
    borderRadius: 12,
    backgroundColor: Colors.background_beige,
    padding: 12,
    gap: 10,
  },
  retryButton: {
    alignSelf: "flex-start",
    backgroundColor: Colors.accent_terracotta,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  retryButtonText: {
    color: Colors.background_cream,
    fontSize: 12,
    fontWeight: "700",
  },
  adPagination: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
    marginTop: 10,
  },
  adDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.text_earth,
    opacity: 0.4,
  },
  adDotActive: {
    width: 18,
    borderRadius: 999,
    opacity: 1,
    backgroundColor: Colors.accent_terracotta,
  },
  actionSection: {
    // marginBottom: 30,
    marginTop: 20,
  },
  actionSectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  actionSectionTitle: {
    color: Colors.text_charcoal,
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 4,
  },
  actionSectionSubtitle: {
    color: Colors.text_brown_gray,
    fontSize: 14,
    fontWeight: "500",
  },
  sectionAction: {
    color: Colors.accent_terracotta,
    fontSize: 14,
    fontWeight: "600",
  },
  actionsRow: {
    flexDirection: "row",
    gap: 12,
  },
  actionCard: {
    flex: 1,
    backgroundColor: Colors.background_beige,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: Colors.background_sand,
    alignItems: "center",
  },
  actionIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    // backgroundColor: "rgba(184, 92, 56, 0.12)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  actionLabel: {
    color: Colors.text_charcoal,
    fontSize: 12,
    fontWeight: "600",
  },
  newsCard: {
    backgroundColor: Colors.background_beige,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.background_sand,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  newsItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 20,
  },
  newsIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(184, 92, 56, 0.12)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    marginTop: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  newsContent: {
    flex: 1,
  },
  newsTitle: {
    color: Colors.text_charcoal,
    fontSize: 14,
    fontWeight: "600",
    lineHeight: 20,
    marginBottom: 8,
  },
  newsFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  newsTime: {
    color: Colors.text_earth,
    fontSize: 12,
    fontWeight: "500",
  },
  trendBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  trendText: {
    fontSize: 10,
    fontWeight: "700",
    marginLeft: 4,
  },
  logoImage: {
    width: "100%",
    height: "100%",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(17, 24, 39, 0.5)",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  modalCard: {
    backgroundColor: Colors.background_cream,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.background_sand,
    overflow: "hidden",
    maxHeight: "88%",
  },
  modalScrollContent: {
    paddingBottom: 18,
  },
  modalHero: {
    height: 220,
    position: "relative",
    backgroundColor: Colors.background_sand,
    justifyContent: "flex-end",
  },
  modalAdImage: {
    width: "100%",
    height: "100%",
    position: "absolute",
  },
  modalHeroShade: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(17, 24, 39, 0.28)",
  },
  modalCloseButton: {
    position: "absolute",
    top: 14,
    right: 14,
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "rgba(17, 24, 39, 0.45)",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2,
  },
  vendorLogoShell: {
    width: 108,
    height: 108,
    borderRadius: 28,
    backgroundColor: Colors.background_cream,
    marginLeft: 18,
    marginBottom: -38,
    padding: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 8,
    zIndex: 2,
  },
  vendorLogoImage: {
    width: "100%",
    height: "100%",
    borderRadius: 22,
  },
  vendorLogoPlaceholder: {
    flex: 1,
    borderRadius: 22,
    backgroundColor: Colors.background_beige,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: Colors.background_sand,
  },
  modalContentSection: {
    paddingHorizontal: 16,
    paddingTop: 48,
  },
  vendorMetaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  vendorPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: Colors.accent_olive,
  },
  vendorPillText: {
    color: Colors.accent_terracotta,
    fontSize: 12,
    fontWeight: "700",
  },
  vendorCategoryChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: Colors.background_sand,
    backgroundColor: Colors.background_beige,
  },
  vendorCategoryChipText: {
    color: Colors.text_brown_gray,
    fontSize: 12,
    fontWeight: "700",
  },
  modalAdVendor: {
    color: Colors.text_charcoal,
    fontSize: 22,
    fontWeight: "800",
  },
  modalAdTitle: {
    color: Colors.accent_terracotta,
    fontSize: 14,
    fontWeight: "700",
    marginTop: 6,
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  modalAdDescription: {
    color: Colors.text_brown_gray,
    fontSize: 14,
    lineHeight: 20,
    marginTop: 10,
  },
  vendorSpotlightCard: {
    marginTop: 14,
    padding: 14,
    borderRadius: 14,
    backgroundColor: "#EFF6FF",
    borderWidth: 1,
    borderColor: "#BFDBFE",
    gap: 6,
  },
  vendorSpotlightEyebrow: {
    color: Colors.accent_terracotta,
    fontSize: 11,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  vendorSpotlightTitle: {
    color: Colors.text_charcoal,
    fontSize: 16,
    fontWeight: "800",
    lineHeight: 22,
  },
  vendorSpotlightText: {
    color: Colors.text_brown_gray,
    fontSize: 13,
    lineHeight: 19,
  },
  topUpInfoBox: {
    marginTop: 12,
    padding: 12,
    borderRadius: 12,
    backgroundColor: Colors.background_beige,
    borderWidth: 1,
    borderColor: Colors.background_sand,
    gap: 6,
  },
  topUpInfoTitle: {
    color: Colors.text_charcoal,
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 2,
  },
  topUpInfoText: {
    color: Colors.text_brown_gray,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "500",
  },
  modalActionRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 14,
  },
  modalActionButton: {
    flex: 1,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },
  modalSecondaryButton: {
    backgroundColor: Colors.background_beige,
    borderWidth: 1,
    borderColor: Colors.background_sand,
  },
  modalSecondaryButtonText: {
    color: Colors.text_charcoal,
    fontSize: 13,
    fontWeight: "700",
  },
  modalPrimaryButton: {
    backgroundColor: Colors.accent_terracotta,
  },
  modalPrimaryButtonText: {
    color: Colors.background_cream,
    fontSize: 13,
    fontWeight: "700",
  },
});

export default HomeScreen;
