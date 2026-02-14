import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
// import GameCard from "../../components/HomeComponents/GameCard";
import { Images } from "@/assets/images/images";
import { Colors } from "../../theme/colors";
import { router } from "expo-router";

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

const HomeScreen: React.FC = () => {
  const quickActions: QuickAction[] = [
    { label: "Offers", icon: "pricetag-sharp", route: "/(offers)/offersHome" },
    { label: "Rewards", icon: "trophy-outline" },
    { label: "Wallet", icon: "wallet-outline" },
  ];

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
    router.push("/(Game)/gameHome");
  };
  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <StatusBar style="dark" />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <View style={styles.logoContainer}>
            <View style={styles.logo}>
              <Image style={styles.logoImage} source={Images.logo} />
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
        {/* Hero Section */}
        <View style={styles.heroCard}>
          <Text style={styles.heroLabel}>Today</Text>
          <Text style={styles.heroTitle}>Earn points and unlock rewards</Text>
          <TouchableOpacity style={styles.heroCta} onPress={handlePress}>
            <Text style={styles.heroCtaText}>Claim Rewards</Text>
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
  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  logo: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.accent_terracotta,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: Colors.accent_terracotta,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 8,
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
});

export default HomeScreen;
